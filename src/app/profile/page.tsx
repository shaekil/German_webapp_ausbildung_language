"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/supabase/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Upload, User as UserIcon, LogOut, Loader2, Save } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Profile Data
  const [profile, setProfile] = useState({
    full_name: "",
    role: "Applicant",
    target_language_level: "A1",
    target_ausbildung: "",
    current_country: "",
    bio: "",
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          role: data.role || "Applicant",
          target_language_level: data.target_language_level || "A1",
          target_ausbildung: data.target_ausbildung || "",
          current_country: data.current_country || "",
          bio: data.bio || "",
        })
      }
      setLoading(false)
    }

    loadProfile()
  }, [user, supabase])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString()
    })
    setSaving(false)
    if (!error) alert("Profile updated!")
    else alert("Error updating profile")
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-amber" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-800">You must be logged in to view your profile.</h2>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          <div className="bg-brand-slate px-8 py-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-slate-700 p-4 rounded-full">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name || "Your Profile"}</h1>
                <p className="text-slate-300 text-sm">{user.email}</p>
              </div>
            </div>
            <button onClick={signOut} className="text-slate-300 hover:text-white transition">
              <LogOut className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e => setProfile({...profile, full_name: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={profile.role}
                  onChange={e => setProfile({...profile, role: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none"
                >
                  <option value="Applicant">Applicant</option>
                  <option value="Student">Student in Germany / Mentor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Country</label>
                <input
                  type="text"
                  value={profile.current_country}
                  onChange={e => setProfile({...profile, current_country: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Ausbildung Field</label>
                <input
                  type="text"
                  placeholder="e.g. Nursing, IT"
                  value={profile.target_ausbildung}
                  onChange={e => setProfile({...profile, target_ausbildung: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current/Target German Level</label>
                <select
                  value={profile.target_language_level}
                  onChange={e => setProfile({...profile, target_language_level: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none"
                >
                  {["A1", "A2", "B1", "B2", "C1", "Native"].map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Short Bio</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={e => setProfile({...profile, bio: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-amber outline-none resize-none"
                placeholder="Tell the community a bit about your goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Resume / CV (PDF)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-brand-slate">Click to upload your CV</p>
                <p className="text-xs text-slate-500 mt-1">PDF up to 5MB</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2 bg-brand-amber text-white font-medium rounded-lg hover:bg-amber-600 transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
