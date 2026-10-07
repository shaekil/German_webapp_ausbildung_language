"use client"

import { useState } from "react"
import { Search, ChevronRight, Calculator, MapPin, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

const categories = [
  { id: 1, title: "Nursing (Pflegefachmann/-frau)", reqs: "B2 German", salary: "€1100 - €1300", icon: "🏥" },
  { id: 2, title: "IT Specialist (Fachinformatiker)", reqs: "B1/B2 German", salary: "€1000 - €1150", icon: "💻" },
  { id: 3, title: "Hotel Management (Hotelfachmann)", reqs: "B1 German", salary: "€950 - €1100", icon: "🏨" },
  { id: 4, title: "Mechatronics Engineer", reqs: "B2 German", salary: "€1050 - €1200", icon: "⚙️" },
]

export default function AusbildungPage() {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = categories.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 pt-10 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-4xl font-bold text-brand-slate mb-4">{t('ausbildung.title', 'Ausbildung Directory')}</h1>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl">{t('ausbildung.description', 'Explore vocational training pathways in Germany.')}</p>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('ausbildung.searchPlaceholder', 'Search pathways (e.g. IT, Nursing...)')}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-amber"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl mt-12 grid lg:grid-cols-3 gap-8">

        {/* Main List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-brand-slate mb-6">Popular Pathways</h2>
          {filtered.map(cat => (
            <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition">
              <div className="text-4xl h-16 w-16 flex items-center justify-center bg-slate-100 rounded-xl shrink-0">
                {cat.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{cat.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" />
                    {cat.reqs} Req.
                  </div>
                  <div className="flex items-center">
                    <Calculator className="w-4 h-4 mr-1 text-brand-amber" />
                    {cat.salary}/mo
                  </div>
                </div>
                <button className="text-brand-amber font-medium text-sm flex items-center hover:underline">
                  View full requirements <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-500">No pathways found matching your search.</p>
          )}
        </div>

        {/* Interactive Checklist Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-brand-slate text-white rounded-2xl p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-brand-amber" />
              Your Roadmap
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-brand-amber flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-brand-slate">1</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">German Language Prep</p>
                  <p className="text-xs text-slate-300 mt-1">Reach B1/B2 level and get certified.</p>
                </div>
              </li>
              <li className="flex items-start opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">2</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">Document Translation</p>
                  <p className="text-xs text-slate-400 mt-1">Translate diplomas to German.</p>
                </div>
              </li>
              <li className="flex items-start opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">3</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">Apply & Interview</p>
                  <p className="text-xs text-slate-400 mt-1">Send CVs, pass online interviews.</p>
                </div>
              </li>
              <li className="flex items-start opacity-60">
                <div className="w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs">4</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-sm">Visa Appointment</p>
                  <p className="text-xs text-slate-400 mt-1">Apply for Ausbildung/Job-seeker visa.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <Link href="/profile" className="block w-full py-2.5 text-center text-sm font-medium bg-white text-brand-slate rounded-lg hover:bg-slate-100 transition">
                Save & Track Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
