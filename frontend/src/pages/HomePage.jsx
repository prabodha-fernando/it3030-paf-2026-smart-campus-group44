import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const IMAGE_PATHS = {
  heroBg: '/src/assets/bg.png',
  dashboardMock: '/src/assets/dashboard-mock.png',
  featureIllustration: '/src/assets/features-illustration.png',
  stepGoogle: '/src/assets/step-1-icon.png',
  stepBooking: '/src/assets/step-2-icon.png',
  stepNotification: '/src/assets/step-3-icon.png',
  ctaBg: '/src/assets/cta-bg.png',
}

const STATS = [
  { label: 'Campus resources available', value: 120, suffix: '+', color: '#059669' },
  { label: 'Monthly bookings processed', value: 850, suffix: '+', color: '#D97706' },
  { label: 'University roles supported', value: 9, suffix: '', color: '#0284C7' },
  { label: 'Real-time notifications delivered', value: 2400, suffix: '+', color: '#059669' },
]

const FEATURES = [
  {
    title: 'Facilities & Assets Catalogue',
    description:
      'Browse lecture halls, labs, and campus facilities with clear filters for location, capacity, and availability.',
    accent: '#059669',
    badge: 'Module A',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 21V7l8-4 8 4v14" />
        <path d="M9 21v-5h6v5" />
      </svg>
    ),
  },
  {
    title: 'Booking Management',
    description:
      'Instantly view availability, submit bookings, and avoid scheduling conflicts before they happen.',
    accent: '#D97706',
    badge: 'Module B',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </svg>
    ),
  },
  {
    title: 'Maintenance Ticketing',
    description:
      'Report maintenance issues, attach supporting details, and follow progress from submission to resolution.',
    accent: '#0284C7',
    badge: 'Module C',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.3 3.5L3.5 10.3a2 2 0 0 0 0 2.8l7.4 7.4a2 2 0 0 0 2.8 0l6.8-6.8" />
        <path d="M14 4l6 6" />
        <circle cx="8.5" cy="8.5" r="1" />
      </svg>
    ),
  },
  {
    title: 'Notifications & Secure Access',
    description:
      'Secure Google sign-in, role-based access, and instant notifications keep users informed and connected.',
    accent: '#059669',
    badge: 'Module D + E',
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
        <path d="M9 17a3 3 0 0 0 6 0" />
      </svg>
    ),
  },
]

const ROLES = [
  { name: 'SUPER_ADMIN', bg: '#0F172A', color: '#A7F3D0' },
  { name: 'ADMIN', bg: '#1E293B', color: '#E2E8F0' },
  { name: 'HOD', bg: '#064E3B', color: '#6EE7B7' },
  { name: 'FACILITY_MANAGER', bg: '#ECFDF5', color: '#065F46' },
  { name: 'SECURITY_OFFICER', bg: '#FEF2F2', color: '#991B1B' },
  { name: 'LECTURER', bg: '#FFFBEB', color: '#92400E' },
  { name: 'TECHNICIAN', bg: '#FEF3C7', color: '#78350F' },
  { name: 'STUDENT', bg: '#EFF6FF', color: '#1D4ED8' },
  { name: 'USER', bg: '#F5F5F4', color: '#57534E' },
]

const HOW_IT_WORKS = [
  {
    title: 'Sign in with your university account',
    text: 'Sign in using your university Google account for secure and seamless access.',
    image: IMAGE_PATHS.stepGoogle,
    fallback: 'Google Sign-in',
    accent: '#059669',
  },
  {
    title: 'Book spaces and manage requests',
    text: 'Find available spaces, make bookings, or submit requests through a simple guided flow.',
    image: IMAGE_PATHS.stepBooking,
    fallback: 'Booking',
    accent: '#059669',
  },
  {
    title: 'Receive updates instantly',
    text: 'Get real-time updates on bookings, maintenance tickets, comments, and important changes.',
    image: IMAGE_PATHS.stepNotification,
    fallback: 'Notifications',
    accent: '#D97706',
  },
]

function useCounter(target, active, duration = 1300) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) return
    let frameId = 0
    let startTimestamp = null

    const tick = timestamp => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [active, duration, target])

  return count
}

function ImageWithFallback({ src, alt, className = '', fallback, style = {} }) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border text-center text-sm font-medium ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(217,119,6,0.10))',
          borderColor: 'rgba(5,150,105,0.18)',
          color: '#065F46',
          ...style,
        }}
      >
        {fallback}
      </div>
    )
  }

  return <img src={src} alt={alt} className={className} style={style} loading="lazy" onError={() => setFailed(true)} />
}

function StatCard({ item, value, index }) {
  return (
    <div
      className="rounded-2xl border bg-white p-6 shadow-sm"
      style={{
        borderColor: '#E7E5E4',
        animation: `fadeUp 0.55s ease ${index * 90}ms both`,
      }}
    >
      <p className="text-sm font-medium" style={{ color: '#78716C' }}>{item.label}</p>
      <p className="mt-3 text-3xl font-bold" style={{ color: item.color }}>
        {value}
        {item.suffix}
      </p>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const sectionRefs = useRef({})
  const [visibleSections, setVisibleSections] = useState(new Set(['hero']))

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  const registerSection = useCallback((id, node) => {
    if (!node || sectionRefs.current[id]) return
    sectionRefs.current[id] = node
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, id]))
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(node)
  }, [])

  const navItems = useMemo(
    () => [
      { label: 'Features', href: '#features' },
      { label: 'Roles', href: '#roles' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Contact', href: '#footer' },
    ],
    []
  )

  const counters = STATS.map(item => useCounter(item.value, statsVisible))
  const isVisible = id => visibleSections.has(id)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF9', color: '#1C1917', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes floatSlow {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatSlowDelayed {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .animate-float-delayed { animation: floatSlowDelayed 6s ease-in-out infinite 0.35s; }
      `}</style>

      <nav
        className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(15,23,42,0.96)' : 'transparent',
          boxShadow: scrolled ? '0 12px 32px rgba(15,23,42,0.18)' : 'none',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#059669' }}>
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6M4.5 10.5V21h15V10.5M9 21v-6h6v6" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>Smart Campus</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.72)' }}>Operations Hub</p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map(item => (
              <a key={item.label} href={item.href} className="text-sm font-medium no-underline transition-colors duration-150" style={{ color: '#CBD5E1' }}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl border px-4 py-2 text-sm font-medium no-underline" style={{ color: '#F8FAFC', borderColor: 'rgba(255,255,255,0.16)' }}>
              Sign In
            </Link>
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-white no-underline" style={{ backgroundColor: '#059669' }}>
              Get Started
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl md:hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t md:hidden" style={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="space-y-2 px-4 py-4">
              {navItems.map(item => (
                <a key={item.label} href={item.href} className="block text-sm font-medium no-underline" style={{ color: '#CBD5E1' }}>
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="mt-3 inline-flex rounded-xl px-4 py-2 text-sm font-semibold text-white no-underline" style={{ backgroundColor: '#059669' }}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section ref={node => registerSection('hero', node)} className="relative overflow-hidden pt-28 sm:pt-32" style={{ backgroundColor: '#0F172A' }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(15,23,42,0.74), rgba(15,23,42,0.84)), url(${IMAGE_PATHS.heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 12% 18%, rgba(5,150,105,0.30), transparent 28%), radial-gradient(circle at 80% 20%, rgba(217,119,6,0.16), transparent 24%), radial-gradient(circle at 52% 72%, rgba(255,255,255,0.06), transparent 24%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28">
          <div className={`transition-all duration-700 ${isVisible('hero') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <span
              className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: '#A7F3D0', borderColor: 'rgba(110,231,183,0.28)', backgroundColor: 'rgba(5,150,105,0.12)' }}
            >
              Built for universities · Designed for clarity · Powered by real-time systems
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Manage your entire campus experience from bookings to maintenance in one unified platform.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: '#CBD5E1' }}>
              Smart Campus Operations Hub simplifies how universities handle facility bookings, maintenance requests, secure access, and real-time communication — designed for students, staff, and administrators.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white no-underline shadow-lg transition-all duration-150"
                style={{ backgroundColor: '#059669', boxShadow: '0 16px 30px rgba(5,150,105,0.28)' }}
              >
                Get Started
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-medium no-underline" style={{ color: '#E2E8F0', borderColor: 'rgba(255,255,255,0.16)' }}>
                Explore Features
              </a>
            </div>

            <p className="mt-4 text-sm" style={{ color: '#94A3B8' }}>
              No more manual approvals, scattered systems, or delayed updates.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {['Secure authentication', 'Real-time updates', 'Role-based access', 'Responsive interface'].map(tag => (
                <span
                  key={tag}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium"
                  style={{ color: '#CBD5E1', borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.06)' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: '#94A3B8' }}>
              University accounts only · @gmail.com domain enforced
            </p>
          </div>

          <div className={`relative hidden lg:block transition-all duration-700 ${isVisible('hero') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute -left-10 top-8 z-10 w-52 rounded-2xl border p-4 shadow-2xl animate-float-slow" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: 'rgba(231,229,228,0.8)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#78716C' }}>Notification</p>
                  <p className="mt-1 text-sm font-semibold" style={{ color: '#1C1917' }}>Booking approved</p>
                </div>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#D97706' }} />
              </div>
              <p className="mt-2 text-xs leading-5" style={{ color: '#57534E' }}>Lecture Hall A booking confirmed for Monday 10:00 AM.</p>
            </div>

            <div className="absolute -right-6 bottom-12 z-10 w-56 rounded-2xl border p-4 shadow-2xl animate-float-delayed" style={{ backgroundColor: 'rgba(255,255,255,0.95)', borderColor: 'rgba(231,229,228,0.8)' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: '#78716C' }}>Maintenance</p>
              <p className="mt-1 text-sm font-semibold" style={{ color: '#1C1917' }}>Ticket in progress</p>
              <p className="mt-2 text-xs leading-5" style={{ color: '#57534E' }}>Lab projector issue has been assigned to a technician.</p>
            </div>

            <div className="overflow-hidden rounded-[28px] border shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.08)', transform: 'rotateY(-5deg) rotateX(2deg)', transformStyle: 'preserve-3d', boxShadow: '0 30px 70px rgba(2,8,23,0.45)' }}>
              <div className="border-b px-5 py-4" style={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: '#059669' }}>
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6M4.5 10.5V21h15V10.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Dashboard Preview</p>
                      <p className="text-xs" style={{ color: '#94A3B8' }}>A glimpse of the experience inside the platform</p>
                    </div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: 'rgba(5,150,105,0.14)', color: '#A7F3D0' }}>
                    Live
                  </span>
                </div>
              </div>

              <div className="bg-white p-4">
                <ImageWithFallback
                  src={IMAGE_PATHS.dashboardMock}
                  alt="Smart Campus dashboard preview"
                  className="h-[390px] w-full rounded-2xl object-cover object-top"
                  fallback="Add your dashboard screenshot here"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-16 w-full overflow-hidden">
          <svg viewBox="0 0 1440 120" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0,80L80,85.3C160,91,320,101,480,101.3C640,101,800,91,960,80C1120,69,1280,59,1360,53.3L1440,48L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="#FAFAF9" />
          </svg>
        </div>
      </section>

      <section ref={statsRef} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {STATS.map((item, index) => (
            <StatCard key={item.label} item={item} value={counters[index]} index={index} />
          ))}
        </div>
      </section>

      <section id="features" ref={node => registerSection('features', node)} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className={`transition-all duration-700 ${isVisible('features') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: '#059669' }}>
              Platform features
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Everything you need to manage campus operations.</h2>
            <p className="mt-4 text-base leading-8" style={{ color: '#78716C' }}>
              From booking spaces to resolving issues, the platform brings together the essential tools needed to run day-to-day campus activities smoothly.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-[28px] border bg-white p-4 shadow-sm sm:p-6" style={{ borderColor: '#E7E5E4' }}>
            <ImageWithFallback
              src={IMAGE_PATHS.featureIllustration}
              alt="Campus operations feature illustration"
              className="h-[240px] w-full rounded-2xl object-contain sm:h-[320px]"
              style={{ backgroundColor: '#F8FAFC' }}
              fallback="Add your feature illustration here"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="rounded-3xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                style={{ borderColor: '#E7E5E4', animation: isVisible('features') ? `fadeUp 0.55s ease ${index * 90}ms both` : 'none' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${feature.accent}14`, color: feature.accent }}>
                  {feature.icon}
                </div>
                <span className="mt-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${feature.accent}14`, color: feature.accent }}>
                  {feature.badge}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: '#78716C' }}>{feature.description}</p>
                <div className="mt-5 h-1.5 w-full rounded-full" style={{ backgroundColor: '#F5F5F4' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${72 + index * 7}%`, backgroundColor: feature.accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" ref={node => registerSection('roles', node)} className="mt-10" style={{ backgroundColor: '#0F172A' }}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className={`grid gap-10 lg:grid-cols-[1fr_0.9fr] transition-all duration-700 ${isVisible('roles') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: '#6EE7B7' }}>
                Role-aware experience
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">Designed for real university roles.</h2>
              <p className="mt-5 max-w-2xl text-base leading-8" style={{ color: '#CBD5E1' }}>
                Each user interacts with the system based on their role — whether it is a student making bookings, a technician handling issues, or an administrator managing operations.
              </p>
              <p className="mt-3 text-sm" style={{ color: '#94A3B8' }}>
                Each role sees only what they need — reducing complexity and improving efficiency.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {ROLES.map(role => (
                  <span key={role.name} className="rounded-full px-4 py-2 text-xs font-semibold tracking-wide" style={{ backgroundColor: role.bg, color: role.color, border: '1px solid rgba(255,255,255,0.06)' }}>
                    {role.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { title: 'Secure sign-in', text: 'Google login, protected routes, and controlled access for every role.', color: '#059669' },
                { title: 'Live updates', text: 'Users receive instant alerts for approvals, comments, and ticket progress.', color: '#D97706' },
                { title: 'Reliable workflows', text: 'Structured backend logic keeps bookings, tickets, and updates organized.', color: '#0284C7' },
              ].map((card, index) => (
                <div key={card.title} className="rounded-3xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', animation: isVisible('roles') ? `fadeUp 0.55s ease ${index * 100}ms both` : 'none' }}>
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: card.color }} />
                  <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7" style={{ color: '#CBD5E1' }}>{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" ref={node => registerSection('how', node)} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className={`transition-all duration-700 ${isVisible('how') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: '#059669' }}>
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Get started in three simple steps.</h2>
            <p className="mt-4 text-base leading-8" style={{ color: '#78716C' }}>
              The platform is designed to be intuitive, so users can quickly access what they need without unnecessary complexity.
            </p>
          </div>

          <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
            <div className="absolute left-1/2 top-10 hidden h-1 w-[62%] -translate-x-1/2 rounded-full lg:block" style={{ background: 'linear-gradient(90deg, rgba(5,150,105,0.20), rgba(217,119,6,0.20))' }} />
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.title} className="relative rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: '#E7E5E4', animation: isVisible('how') ? `fadeUp 0.55s ease ${index * 110}ms both` : 'none' }}>
                <div className="absolute left-6 top-6 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: step.accent }}>
                  {index + 1}
                </div>
                <div className="pt-10">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    className="mx-auto h-40 w-40 object-contain"
                    fallback={step.fallback}
                  />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: '#78716C' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border bg-white p-8 shadow-sm" style={{ borderColor: '#E7E5E4' }}>
            <span className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: '#059669' }}>
              Why Smart Campus works
            </span>
            <h3 className="mt-4 text-2xl font-bold">Balanced between premium and practical.</h3>
            <ul className="mt-6 space-y-4 text-sm leading-7" style={{ color: '#78716C' }}>
              <li>• Designed for real university workflows, not generic systems.</li>
              <li>• Combines booking, maintenance, and notifications in one place.</li>
              <li>• Reduces manual coordination, delays, and communication gaps.</li>
              <li>• Easy for users to navigate, while still powerful for administrators.</li>
            </ul>
          </div>

        <div className="rounded-[32px] border p-6 shadow-sm" style={{ borderColor: '#E7E5E4', background: 'linear-gradient(135deg, #FFFFFF, #F8FAFC)' }}>
            <div className="mb-5"><span className="text-sm font-semibold uppercase tracking-[0.22em]"style={{ color: '#059669' }}>
                Campus in action</span>
                <h3 className="mt-3 text-2xl font-bold">See how the platform works in real time.</h3>
                <p className="mt-2 text-sm leading-7" style={{ color: '#78716C' }}>
                    A short preview can show how bookings, maintenance requests, and notifications come together in one smooth experience.
                    </p>
                    </div>
                    <div className="overflow-hidden rounded-[24px] border bg-black" style={{ borderColor: '#E7E5E4' }}>
                        <video 
                        className="h-[320px] w-full object-cover"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={IMAGE_PATHS.dashboardMock}>
                            <source src="/src/assets/home-preview.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="relative overflow-hidden rounded-[34px] border" style={{ borderColor: 'rgba(5,150,105,0.16)', backgroundColor: '#065F46' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(6,95,70,0.72), rgba(6,95,70,0.80)), url(${IMAGE_PATHS.ctaBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 10% 25%, rgba(255,255,255,0.10), transparent 28%), radial-gradient(circle at 88% 22%, rgba(217,119,6,0.18), transparent 24%)',
            }}
          />
          <div className="relative px-6 py-14 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#D1FAE5', borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.08)' }}>
                Ready to explore
              </span>
              <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">Get started today and simplify how your campus operates.</h2>
              <p className="mt-4 max-w-xl text-base leading-8" style={{ color: '#D1FAE5' }}>
                Sign in with your university account and access bookings, maintenance, and notifications — all from one platform.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 lg:mt-0">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold no-underline" style={{ color: '#065F46' }}>
                Sign in now
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#features" className="inline-flex items-center rounded-xl border px-6 py-3 text-sm font-medium no-underline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.18)' }}>
                View modules
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" style={{ backgroundColor: '#0F172A' }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#059669' }}>
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6M4.5 10.5V21h15V10.5M9 21v-6h6v6" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-white">Smart Campus</p>
                  <p className="text-xs" style={{ color: '#94A3B8' }}>Operations Hub</p>
                </div>
              </div>
              <p className="mt-5 max-w-xl text-sm leading-7" style={{ color: '#CBD5E1' }}>
                Built to support modern university operations with reliability, speed, and simplicity.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:justify-self-end">
              <div>
                <p className="text-sm font-semibold text-white">Platform highlights</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Secure authentication', 'Real-time updates', 'Role-based access', 'Responsive interface', 'Scalable backend', 'Cloud-ready system'].map(tag => (
                    <span key={tag} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Quick links</p>
                <div className="mt-4 space-y-2 text-sm">
                  {navItems.map(item => (
                    <a key={item.label} href={item.href} className="block no-underline" style={{ color: '#CBD5E1' }}>
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t pt-6 text-sm" style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#94A3B8' }}>
            © 2026 Smart Campus Operations Hub · Designed for a clear, modern, and user-friendly university experience.
          </div>
        </div>
      </footer>
    </div>
  )
}
