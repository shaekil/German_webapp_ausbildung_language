#!/usr/bin/env python3
"""
RAG Ingestion Pipeline — Germany Gateway (Local Mode)
=====================================================
Extracts website content into a simple vector store for the Gemini RAG chatbot.
Uses only standard Python (requests, hashlib, json) + a local ChromaDB.

Run it with:
    python3 scripts/ingest_content.py

Environment variables (all optional):
    GOOGLE_API_KEY     — Gemini API key (used only for embeddings)
    CHROMA_HOST        — ChromaDB server (default: http://localhost:8000)

Local fallback when ChromaDB unavailable:
    Writes a JSON file (content_chunks.json) that the chatbot can load locally
    for simple semantic search (basic keyword matching).
"""

import json
import os
import re
import sys
import hashlib
from pathlib import Path
from typing import List, Dict, Any
from urllib.parse import urlparse, urljoin

# Optional imports — try to use them, but don't fail if they're not available
try:
    import chromadb
    CHROMADB_AVAILABLE = True
except Exception:
    CHROMADB_AVAILABLE = False
    chromadb = None  # type: ignore

try:
    from google import generativeai as genai
    GENAI_AVAILABLE = True
except Exception:
    GENAI_AVAILABLE = False
    genai = None  # type: ignore

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MESSAGES_DIR = PROJECT_ROOT / "src" / "messages"
COLLECTION_NAME = "germany_gateway_content"
CHROMA_HOST = os.getenv("CHROMA_HOST", "http://localhost:8000")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
LOCAL_FALLBACK_FILE = PROJECT_ROOT / "content_chunks.json"

# ─── Simple text chunking ─────────────────────────────────────────────────────

def chunk_text(text: str, max_chars: int = 800, overlap: int = 120) -> List[str]:
    """Split text into overlapping chunks of ~max_chars at sentence boundaries."""
    text = re.sub(r"\s+", " ", text).strip()
    if not text or len(text) <= max_chars:
        return [text] if text else []

    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0

    for sentence in sentences:
        if current_len + len(sentence) > max_chars and current:
            chunks.append(" ".join(current))
            # Overlap for context continuity
            keep = []
            keep_len = 0
            for s in reversed(current):
                if keep_len + len(s) > overlap:
                    break
                keep.insert(0, s)
                keep_len += len(s)
            current = keep
            current_len = keep_len
        current.append(sentence)
        current_len += len(sentence)

    if current:
        chunks.append(" ".join(current))
    return chunks


# ─── Content extraction ────────────────────────────────────────────────────────

def extract_from_messages() -> List[Dict[str, Any]]:
    """Extract translatable content from all language JSON files."""
    docs = []
    if not MESSAGES_DIR.exists():
        return docs

    for file_path in MESSAGES_DIR.glob("*.json"):
        lang = file_path.stem
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            print(f"⚠️  Could not parse {file_path.name}: {e}")
            continue

        def walk(obj, prefix=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    walk(value, f"{prefix}.{key}" if prefix else key)
            elif isinstance(obj, str):
                clean = re.sub(r"</?brand>", "", obj)
                if len(clean.strip()) > 10:
                    docs.append({
                        "text": clean,
                        "metadata": {
                            "source": f"messages/{file_path.name}",
                            "key": prefix,
                            "language": lang,
                        },
                    })

        walk(data)
    return docs


def extract_from_markdown(root: Path) -> List[Dict[str, Any]]:
    """Extract content from markdown files if any exist."""
    docs = []
    for md_file in root.rglob("*.md"):
        if "node_modules" in str(md_file) or "build" in str(md_file):
            continue
        try:
            text = md_file.read_text(encoding="utf-8")
        except OSError:
            continue
        if len(text.strip()) > 20:
            docs.append({
                "text": text,
                "metadata": {
                    "source": str(md_file.relative_to(root)),
                    "key": "markdown",
                    "language": "en",
                },
            })
    return docs


# ─── Embedding generation ──────────────────────────────────────────────────────

def embed_text(text: str) -> List[float]:
    """Generate a simple embedding for text using Gemini or fallback."""
    if GENAI_AVAILABLE and GOOGLE_API_KEY:
        try:
            model = genai.GenerativeModel("models/embedding-001")
            embedding = model.embed_content(text, task_type="retrieval_document")
            return embedding["embedding"]
        except Exception as e:
            print(f"⚠️  Gemini embedding failed: {e}")

    # Fallback: deterministic pseudo‑embedding based on hash
    hash_bytes = hashlib.sha256(text.encode("utf-8")).digest()
    return [float(b) / 255.0 for b in hash_bytes[:32]]


# ─── Simple semantic search (fallback) ─────────────────────────────────────────

def semantic_search(query: str, chunks: List[Dict], top_n: int = 5) -> List[Dict]:
    """Very simple keyword‑based search for the fallback mode."""
    query_terms = set(re.findall(r"\b\w{3,}\b", query.lower()))
    scored = []

    for chunk in chunks:
        text = chunk.get("text", "")
        score = 0
        for term in query_terms:
            score += text.lower().count(term)
        if score:
            chunk_with_score = {**chunk, "score": score}
            scored.append(chunk_with_score)

    return sorted(scored, key=lambda x: x["score"], reverse=True)[:top_n]


# ─── ChromaDB or local JSON ingestion ────────────────────────────────────────────

def write_to_chromadb(chunks: List[Dict]) -> bool:
    """Try to write chunks to ChromaDB; if that fails, return False."""
    if not CHROMADB_AVAILABLE:
        return False

    try:
        # Determine host and port from CHROMA_HOST
        parsed = urlparse(CHROMA_HOST)
        host = parsed.hostname or "localhost"
        port = parsed.port or 8000

        client = chromadb.HttpClient(host=host, port=port)
        client.heartbeat()
    except Exception as e:
        print(f"⚠️  Cannot connect to ChromaDB ({e}); writing local JSON fallback")
        return False

    # Create custom embedding function
    class GeminiEmbedding(chromadb.EmbeddingFunction):
        def __call__(self, inputs: List[str]) -> List[List[float]]:
            return [embed_text(text) for text in inputs]

    # Reset collection if it exists
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    try:
        collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            embedding_function=GeminiEmbedding(),
            metadata={"description": "Germany Gateway website content for RAG"},
        )

        ids = [f"doc_{i}" for i in range(len(chunks))]
        documents = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        collection.add(ids=ids, documents=documents, metadatas=metadatas)
        print(f"✅ Wrote {len(chunks)} chunks to ChromaDB")
        return True
    except Exception as e:
        print(f"⚠️  Failed to write to ChromaDB: {e}; using local JSON fallback")
        return False


def write_to_json(chunks: List[Dict]):
    """Write chunks to a local JSON file for fallback searching."""
    simplified = [
        {
            "text": chunk["text"],
            "source": chunk["metadata"]["source"],
            "key": chunk["metadata"].get("key"),
            "language": chunk["metadata"].get("language"),
            "embedding": embed_text(chunk["text"]),  # recompute here
        }
        for chunk in chunks
    ]
    try:
        LOCAL_FALLBACK_FILE.write_text(json.dumps(simplified, ensure_ascii=False, indent=2))
        print(f"✅ Wrote {len(simplified)} chunks to {LOCAL_FALLBACK_FILE}")
    except Exception as e:
        print(f"❌ Failed to write fallback JSON: {e}")


def main() -> int:
    print("🚀 Starting Germany Gateway RAG ingestion pipeline...")

    # Gather content
    docs = extract_from_messages()
    docs.extend(extract_from_markdown(PROJECT_ROOT))

    if not docs:
        print("❌ No content found to index.")
        return 1

    print(f"📄 Found {len(docs)} content blocks. Chunking ...")

    # Chunk everything
    all_chunks: List[Dict] = []
    for doc in docs:
        for chunk in chunk_text(doc["text"]):
            all_chunks.append({
                "text": chunk,
                "metadata": doc["metadata"],
            })

    print(f"🔢 Created {len(all_chunks)} chunks")

    # Try ChromaDB first
    if CHROMADB_AVAILABLE:
        if write_to_chromadb(all_chunks):
            return 0

    # Fallback: write to local JSON file
    write_to_json(all_chunks)
    print("\n✅ Done! Indexed chunks for fallback RAG.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
