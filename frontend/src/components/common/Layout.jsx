
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children, fullWidth = false, noPadding = false }) => (
  <div className="min-h-screen bg-stone-50">
    <Navbar fullWidth={fullWidth} />
    <main className={`${fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} ${noPadding ? '' : 'py-8'}`}>
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;