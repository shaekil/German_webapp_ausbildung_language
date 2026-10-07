'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import en from '@/messages/en.json'
import de from '@/messages/de.json'
import bn from '@/messages/bn.json'

type Language = 'en' | 'de' | 'bn'
type Translations = typeof en

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, defaultValue?: string) => string
}

const translations: Record<Language, Translations> = { en, de, bn }

const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string, defaultValue: string = key) => defaultValue,
}

const LanguageContext = createContext<LanguageContextType>(defaultContext)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null
    if (saved && translations[saved]) {
      setLanguageState(saved)
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string, defaultValue: string = key): string => {
    if (!mounted) return defaultValue
    try {
      const keys = key.split('.')
      let value: any = translations[language]
      for (const k of keys) {
        value = value[k]
        if (!value) return defaultValue
      }
      return String(value)
    } catch {
      return defaultValue
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}