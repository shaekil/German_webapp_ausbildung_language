import { Metadata } from 'next'
import { AuthProvider } from '@/lib/supabase/auth-provider'
import { LanguageProvider } from '@/lib/language-context'
import { Navbar } from '@/components/layout/Navbar'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Germany Gateway - Ausbildung & Relocation Platform',
  description: 'The platform helping global applicants relocate to Germany for Ausbildung, language learning, and job opportunities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="py-6 bg-brand-slate text-slate-300">
              <div className="container mx-auto px-4 text-center">
                <p className="text-sm">&copy; {new Date().getFullYear()} Germany Gateway. Building global bridges.</p>
              </div>
            </footer>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
