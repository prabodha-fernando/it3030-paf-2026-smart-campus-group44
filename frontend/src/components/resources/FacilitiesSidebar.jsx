import { Link, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const SidebarLink = ({ href, icon, label, isActive }) => (
  <Link
    to={href}
    className={`relative flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    {/* Active left accent - Flush to the absolute left edge */}
    {isActive && (
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-md" />
    )}

    {isActive && (
      <span className="absolute right-4 top-1 bottom-1 w-full bg-primary-50 -z-10 rounded-r-full" />
    )}

    <span className={`shrink-0 z-10 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>
      {icon}
    </span>

    <span className="flex-1 truncate z-10 font-semibold">{label}</span>
  </Link>
)

const FacilitiesSidebar = () => {
  const { pathname } = useLocation()
  const { isAdmin } = useAuth()

  // 🚨 TEMPORARY UI TESTING OVERRIDE
  const forceAdmin = true

  const userLinks = [
    {
      label: 'Asset Catalogue',
      href: '/resources',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      label: 'Campus Map',
      href: '/resources/map',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      label: 'Lecture Halls',
      href: '/resources/halls',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      )
    },
    {
      label: 'Laboratories',
      href: '/resources/labs',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: 'Equipment',
      href: '/resources/equipment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
  ]

  const adminLinks = [
    {
      label: 'Manage Resources',
      href: '/resources/manage',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ]

  return (
    // Changed top padding to push items up closer to the edge, matching Skill Nest
    <div className="pt-6 h-full flex flex-col">
      
      {/* Module Header - Kept identical but adjusted padding/margin */}
      <div className="flex items-center gap-3 px-6 mb-8">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Module</p>
          <p className="text-sm font-extrabold text-slate-800 leading-none">Facilities</p>
        </div>
      </div>

      <div className="px-6 mb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campus Resources</p>
      </div>

      {/* User Navigation - Removed side padding to make links flush with left edge */}
      <div className="space-y-1 mb-8 pr-4">
        {userLinks.map(link => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            isActive={pathname === link.href}
          />
        ))}
      </div>

      {/* Admin + Support Section */}
      {(isAdmin || forceAdmin) && (
        <div className="pr-4">
          <div className="px-6 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Administration</p>
          </div>
          <div className="space-y-1">
            {adminLinks.map(link => (
              <SidebarLink
                key={link.href}
                href={link.href}
                icon={link.icon}
                label={link.label}
                isActive={pathname === link.href}
              />
            ))}
            {/* Contact Facilities — directly under Manage Resources */}
            <SidebarLink
              href="/resources/contact"
              isActive={pathname === '/resources/contact'}
              label="Contact Facilities"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243-4.242a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5" />
                </svg>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default FacilitiesSidebar