"use client"

import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { ArrowRight, BookOpen, GraduationCap, Map, Users } from "lucide-react"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center">
      <section className="w-full bg-slate-50 py-20 lg:py-28 text-center border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-brand-slate tracking-tight leading-tight">
            {t('home.title', 'Your Gateway to a Career in Germany')}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t('home.description', 'Discover Ausbildung opportunities, master the German language, and connect with a community that supports your relocation journey.')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/ausbildung" className="flex items-center px-6 py-3 text-lg font-medium text-white bg-brand-amber rounded-xl hover:bg-amber-600 transition shadow-lg">
              {t('home.exploreAusbildung', 'Explore Ausbildung')}<ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link href="/language-hub" className="flex items-center px-6 py-3 text-lg font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition">
              {t('home.learnGerman', 'Learn German')}
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-brand-slate mb-12">{t('home.features.title', 'How We Support Your Journey')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition">
              <div className="p-4 bg-amber-100 text-brand-amber rounded-full mb-4"><GraduationCap className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-brand-slate mb-2">{t('home.features.feature1.title', 'Ausbildung Directory')}</h3>
              <p className="text-slate-600">{t('home.features.feature1.description', 'Find vocational training opportunities in IT, Nursing, Engineering, and more.')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition">
              <div className="p-4 bg-sky-100 text-sky-600 rounded-full mb-4"><BookOpen className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-brand-slate mb-2">{t('home.features.feature2.title', 'Language Hub')}</h3>
              <p className="text-slate-600">{t('home.features.feature2.description', 'Access free resources for A1-B2 German levels. Prep for Goethe and TELC exams.')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition">
              <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4"><Users className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-brand-slate mb-2">{t('home.features.feature3.title', 'Community & Connect')}</h3>
              <p className="text-slate-600">{t('home.features.feature3.description', 'Join forums to discuss bureaucracy, housing, and life in Germany.')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-20 bg-brand-slate text-white">
        <div className="container mx-auto px-4 max-w-5xl text-center space-y-8">
          <Map className="w-16 h-16 text-brand-amber mx-auto" />
          <h2 className="text-3xl md:text-4xl font-bold">{t('home.roadmap.title', 'The Step-by-Step Relocation Roadmap')}</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">{t('home.roadmap.description', 'From learning your first German words to arriving at the Embassy for your visa.')}</p>
          <Link href="/ausbildung" className="inline-block px-8 py-4 text-brand-slate bg-brand-amber rounded-full font-bold hover:bg-white transition-colors">
            {t('home.roadmap.startRoadmap', 'Start Your Roadmap')}
          </Link>
        </div>
      </section>
    </div>
  )
}
