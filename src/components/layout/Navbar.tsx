"use client"

import Link from "next/link"
import { useState } from "react"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/supabase/auth-provider"
import { useLanguage } from "@/lib/language-context"
import { Menu, X, BookOpen, GraduationCap, Users, Globe, LayoutGrid } from "lucide-react"

export function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const navLinks = [
    { key: "dashboard", href: "/dashboard", icon: <LayoutGrid className="w-5 h-5" /> },
    { key: "ausbildung", href: "/ausbildung", icon: <GraduationCap className="w-5 h-5" /> },
    { key: "languageHub", href: "/language-hub", icon: <BookOpen className="w-5 h-5" /> },
    { key: "community", href: "/community", icon: <Users className="w-5 h-5" /> },
  ]

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'bn', name: 'বাংলা' }
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-brand-slate">
              Germany<span className="text-brand-amber">Gateway</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="flex items-baseline ml-10 space-x-8">
              {navLinks.map((link) => (
                <Link key={link.key} href={link.href} className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-brand-amber transition-colors">
                  {link.icon}
                  <span>{t(`navigation.${link.key}`)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)} className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-amber">
                <Globe className="w-4 h-4" /><span>{language.toUpperCase()}</span>
              </button>
              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setIsLanguageMenuOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm ${language === lang.code ? 'bg-brand-amber text-white font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <><Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-brand-amber">{t('navigation.profile')}</Link>
              <button onClick={signOut} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">{t('navigation.logout')}</button></>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">{t('navigation.login')}</button>
            )}
            {!user && <button onClick={() => setIsAuthOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-brand-amber rounded-lg">{t('navigation.getStarted')}</button>}

            <div className="flex md:hidden space-x-2">
              <button onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)} className="p-2 text-slate-500"><Globe className="w-5 h-5" /></button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500">{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
            </div>
          </div>
        </div>
      </div>

      {isLanguageMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => { setLanguage(lang.code as any); setIsLanguageMenuOpen(false) }}
                className={`w-full text-left px-3 py-2 text-base font-medium rounded-md ${language === lang.code ? 'bg-brand-amber text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (<Link key={link.key} href={link.href} className="block px-3 py-2 text-base font-medium text-slate-700">{t(`navigation.${link.key}`)}</Link>))}
            {user ? (
              <><Link href="/profile" className="block px-3 py-2 text-base font-medium text-slate-700">{t('navigation.profile')}</Link>
              <button onClick={signOut} className="block w-full text-left px-3 py-2 text-base font-medium text-red-600">{t('navigation.logout')}</button></>
            ) : (
              <div className="px-3 pt-4 pb-2"><button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false) }} className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg">{t('navigation.login')}</button></div>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  )
}