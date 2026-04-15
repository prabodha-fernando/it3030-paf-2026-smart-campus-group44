import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { updateMyProfile } from '../api/authApi'
import { updatePreferences } from '../api/notificationApi'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities', 'Science', 'Other']

const STEPS = [
  { id: 1, label: 'Your profile' },
  { id: 2, label: 'How it works' },
  { id: 3, label: 'Notifications' },
]

const OnboardingPage = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [profile, setProfile] = useState({
    displayName: user?.displayName || '',
    department:  '',
    phone:       '',
  })

  const [prefs, setPrefs] = useState({
    bookingUpdates:    true,
    ticketUpdates:     true,
    commentAlerts:     true,
    roleRequestUpdates: true,
    dndEnabled:        false,
  })

  const handleFinish = async () => {
    setLoading(true)
    try {
      await updateMyProfile({ ...profile, firstLogin: false })
      await updatePreferences(prefs)
      await refreshUser()
      toast.success('Welcome to Smart Campus!')
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-lg shadow-sm">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-stone-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
              </svg>
            </div>
            <span className="font-semibold text-stone-900">Smart Campus</span>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step > s.id ? 'bg-primary-600 text-white' :
                  step === s.id ? 'bg-primary-600 text-white' :
                  'bg-stone-100 text-stone-400'
                }`}>
                  {step > s.id ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.id}
                </div>
                <span className={`text-xs ${step === s.id ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-stone-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-6">

          {/* Step 1 — Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 mb-1">Complete your profile</h2>
                <p className="text-sm text-stone-500">This helps us personalise your experience.</p>
              </div>

              {user?.photoUrl && (
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                  <img src={user.photoUrl} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-stone-900">{user.email}</p>
                    <p className="text-xs text-stone-400">Google account</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Display name</label>
                <input type="text" value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="input-field" placeholder="Your full name" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Department</label>
                <select value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="input-field">
                  <option value="">Select your department...</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Phone <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input type="tel" value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="input-field" placeholder="+94 7X XXX XXXX" />
              </div>
            </div>
          )}

          {/* Step 2 — How it works */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 mb-1">How Smart Campus works</h2>
                <p className="text-sm text-stone-500">Here's what you can do on the platform.</p>
              </div>

              {[
                { icon: '🏛️', title: 'Book resources', desc: 'Reserve lecture halls, labs, meeting rooms, and equipment for your sessions.' },
                { icon: '🔧', title: 'Report issues', desc: 'Submit incident tickets for facility problems. Track resolution in real time.' },
                { icon: '🔔', title: 'Stay updated', desc: 'Get instant notifications when your bookings are approved or tickets are updated.' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 — Notifications */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 mb-1">Notification preferences</h2>
                <p className="text-sm text-stone-500">Choose what you want to be notified about.</p>
              </div>

              {[
                { key: 'bookingUpdates',    label: 'Booking updates',    desc: 'Approvals and rejections for your bookings' },
                { key: 'ticketUpdates',     label: 'Ticket status',      desc: 'When your tickets move to In Progress or Resolved' },
                { key: 'commentAlerts',     label: 'New comments',       desc: 'When someone comments on your tickets' },
                { key: 'roleRequestUpdates', label: 'Role requests',     desc: 'When your role upgrade request is reviewed' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.label}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setPrefs({ ...prefs, [item.key]: !prefs[item.key] })}
                    className={`relative w-10 h-5.5 rounded-full transition-colors flex items-center ${
                      prefs[item.key] ? 'bg-primary-600' : 'bg-stone-200'
                    }`}
                    style={{ minWidth: '40px', height: '22px' }}
                  >
                    <span className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      prefs[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="px-8 pb-8 flex justify-between gap-3">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="btn-secondary disabled:opacity-30"
          >
            Back
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} className="btn-primary px-8">
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} disabled={loading} className="btn-primary px-8">
              {loading ? 'Setting up...' : 'Get started'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage