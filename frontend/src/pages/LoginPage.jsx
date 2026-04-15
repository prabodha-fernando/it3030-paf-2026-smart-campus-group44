import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { API_BASE } from '../utils/constants'

const GOOGLE_LOGIN_URL = `${API_BASE}/oauth2/authorization/google`

const LoginPage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  const errorMsg = new URLSearchParams(window.location.search).get('error')

  return (
    <div className="min-h-screen flex">

      {/* Left panel — dark Slate */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute border border-white rounded-full"
              style={{ width: `${(i + 1) * 120}px`, height: `${(i + 1) * 120}px`,
                top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-sm">
          {/* Logo */}
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-white mb-3">Smart Campus</h1>
          <p className="text-slate-400 text-base leading-relaxed mb-10">
            Your university operations hub for facility bookings and maintenance management.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Resources', value: '120+' },
              { label: 'Bookings today', value: '24' },
              { label: 'Open tickets', value: '7' },
              { label: 'Active users', value: '340' },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-800 rounded-xl p-4">
                <p className="text-2xl font-semibold text-primary-400">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — white */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18" />
              </svg>
            </div>
            <span className="font-semibold text-stone-900">Smart Campus</span>
          </div>

          <h2 className="text-2xl font-semibold text-stone-900 mb-1">Welcome back</h2>
          <p className="text-stone-500 text-sm mb-8">Sign in with your university Google account to continue.</p>

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">
                {errorMsg === 'domain_not_allowed'
                  ? 'Only @my.sliit.lk email accounts are allowed.'
                  : 'Sign-in failed. Please try again.'}
              </p>
            </div>
          )}

          {/* Google button */}
          <a href={GOOGLE_LOGIN_URL}
            className="flex items-center justify-center gap-3 w-full px-5 py-3 bg-white border border-stone-200 rounded-xl text-stone-700 font-medium text-sm hover:bg-stone-50 hover:border-stone-300 active:scale-[0.98] transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-xs text-stone-400 text-center mt-5">
            University accounts only — @my.sliit.lk
          </p>

          {/* Features list */}
          <div className="mt-10 space-y-2.5">
            {[
              'Book lecture halls, labs and equipment',
              'Report and track maintenance issues',
              'Real-time notifications and updates',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-sm text-stone-500">
                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage