
import React from 'react';


const FEATURES = [
  'Secure authentication',
  'Real-time updates',
  'Role-based access',
  'Responsive interface',
  'Scalable backend',
  'Cloud-ready system',
];


const LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/profile' },
  { label: 'Notifications', href: 'notification-drawer' }, // special action
  { label: 'Support', href: '#' }, // enabled, but not working
  { label: 'Bookings', href: '/bookings' },
  { label: 'Resources', href: '/resources' },
  { label: 'Tickets', href: '/tickets' },
];

const CONTACT = {
  email: 'support@smartcampus.com',
  phone: '+94 111100002',
  address: '123 University RD, Malabe',
  hours: 'Mon-Sun 8:00-18:00',
};

const ABOUT = `Smart Campus Operations Hub is a next-generation platform designed to streamline university operations, enhance communication, and empower students, staff, and administrators. Our mission is to deliver a seamless, secure, and innovative campus experience.`;


export default function Footer() {
  return (
    <footer id="footer" className="bg-gradient-to-br from-slate-900 to-slate-800 shadow-inner border-t border-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6M4.5 10.5V21h15V10.5M9 21v-6h6v6" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-white tracking-wide">Smart Campus</p>
                <p className="text-xs font-medium text-emerald-200">Operations Hub</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">{ABOUT}</p>
          </div>

          {/* Contact Section */}
          <div>
            <p className="text-base font-semibold text-white mb-4">Contact</p>
            <ul className="text-slate-300 text-sm space-y-2">
              <li><span className="font-medium text-emerald-300">Email:</span> <a href={`mailto:${CONTACT.email}`} className="hover:text-emerald-400 transition-colors">{CONTACT.email}</a></li>
              <li><span className="font-medium text-emerald-300">Phone:</span> <a href={`tel:${CONTACT.phone}`} className="hover:text-emerald-400 transition-colors">{CONTACT.phone}</a></li>
              <li><span className="font-medium text-emerald-300">Address:</span> {CONTACT.address}</li>
              <li><span className="font-medium text-emerald-300">Hours:</span> {CONTACT.hours}</li>
            </ul>
          </div>

          {/* Useful Links Section */}
          <div>
            <p className="text-base font-semibold text-white mb-4">Useful Links</p>
            <ul className="flex flex-col gap-2">
              {LINKS.map(item => (
                <li key={item.label}>
                  {item.label === 'Notifications' ? (
                    <button
                      type="button"
                      className="text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium bg-transparent border-0 p-0 cursor-pointer"
                      onClick={() => {
                        if (window && window.dispatchEvent) {
                          window.dispatchEvent(new CustomEvent('openNotificationDrawer'));
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  ) : item.label === 'Support' ? (
                    <a
                      href="#"
                      className="text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                      title="Support is not available yet"
                      onClick={e => e.preventDefault()}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      className="text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Features Section */}
          <div>
            <p className="text-base font-semibold text-white mb-4">Platform Features</p>
            <ul className="flex flex-col gap-2">
              {FEATURES.map(tag => (
                <li key={tag} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 text-slate-200 text-xs font-medium border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-6 text-xs text-slate-400 flex flex-col sm:flex-row sm:justify-between items-center gap-2">
          <span>© 2026 Smart Campus Operations Hub</span>
          <span>Designed for a clear, modern, and user-friendly university experience.</span>
        </div>
      </div>
    </footer>
  );
}
