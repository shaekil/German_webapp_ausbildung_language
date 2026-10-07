"use client"

import { Video, FileText, ExternalLink } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function LanguageHubPage() {
  const { t } = useLanguage()
  const levels = ["A1", "A2", "B1", "B2", "C1"]

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="bg-amber-50 border-b border-amber-100 pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl font-bold text-brand-slate mb-4">{t('languageHub.title', 'German Language Hub')}</h1>
          <p className="text-slate-600 text-lg max-w-2xl">{t('languageHub.description', 'Everything you need to master German for your Ausbildung.')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-12">
        <div className="flex overflow-x-auto space-x-4 pb-4 mb-8 custom-scrollbar">
          {levels.map((level, i) => (
            <button key={level} className={`px-6 py-2 rounded-full font-medium whitespace-nowrap ${i === 2 ? 'bg-brand-slate text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              Level {level}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center"><Video className="w-6 h-6 mr-2 text-brand-amber" />{t('languageHub.videoCourses', 'Video Courses')}</h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Nicos Weg (DW Learn German)</h3>
              <p className="text-slate-600 text-sm mb-4">A complete, free video-based course.</p>
              <a href="#" className="text-brand-amber font-medium text-sm flex items-center">{t('languageHub.startWatching', 'Start watching')} <ExternalLink className="w-4 h-4 ml-1" /></a>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Easy German YouTube</h3>
              <p className="text-slate-600 text-sm mb-4">Learn German from the streets of Berlin.</p>
              <a href="#" className="text-brand-amber font-medium text-sm flex items-center">{t('languageHub.goToChannel', 'Go to channel')} <ExternalLink className="w-4 h-4 ml-1" /></a>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center"><FileText className="w-6 h-6 mr-2 text-sky-500" />{t('languageHub.examPrep', 'Goethe/TELC Prep')}</h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-lg mb-2">B1 Exam Mock Tests</h3>
              <p className="text-slate-600 text-sm mb-4">Practice for Goethe-Zertifikat B1.</p>
              <a href="#" className="text-brand-amber font-medium text-sm flex items-center">{t('languageHub.downloadPDFs', 'Download PDFs')} <ExternalLink className="w-4 h-4 ml-1" /></a>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="font-bold text-lg mb-2">Anki Vocabulary Decks</h3>
              <p className="text-slate-600 text-sm mb-4">2,000 common words for B1.</p>
              <a href="#" className="text-brand-amber font-medium text-sm flex items-center">{t('languageHub.getFlashcards', 'Get Flashcards')} <ExternalLink className="w-4 h-4 ml-1" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}