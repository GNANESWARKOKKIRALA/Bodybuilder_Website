import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaCrown, FaUser, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Transformations', path: '/transformations' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
              <FaCrown className="text-dark-950 text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide font-sans">
                <span className="text-gradient-gold">GNANESWAR</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[3px] text-dark-400 -mt-1">Fitness Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-gold-400 bg-gold-500/10'
                    : 'text-dark-300 hover:text-gold-400 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg glass-light hover:border-gold-500/30 transition-all"
                >
                  <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center">
                    <span className="text-dark-950 text-sm font-bold">
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-dark-200">{user?.first_name || 'User'}</span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-14 w-56 glass rounded-xl p-2 shadow-xl shadow-black/30"
                    >
                      <Link
                        to={isAdmin ? '/admin' : '/dashboard'}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-sm"
                      >
                        <FaTachometerAlt className="text-gold-400" />
                        <span>{isAdmin ? 'Admin Dashboard' : 'Dashboard'}</span>
                      </Link>
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-all text-sm"
                      >
                        <FaUser className="text-gold-400" />
                        <span>My Profile</span>
                      </Link>
                      <hr className="border-white/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 transition-all text-sm text-red-400 w-full"
                      >
                        <FaSignOutAlt />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !py-2 !px-5 text-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary !py-2 !px-5 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            {isOpen ? (
              <HiX className="text-2xl text-gold-400" />
            ) : (
              <HiMenu className="text-2xl text-dark-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-white/5"
          >
            <div className="container-custom py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'text-gold-400 bg-gold-500/10'
                        : 'text-dark-300 hover:text-gold-400 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              <hr className="border-white/10 my-3" />

              {isAuthenticated ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="block px-4 py-3 rounded-lg text-sm font-medium text-gold-400 hover:bg-white/5 transition-all"
                  >
                    {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-3 px-4 pt-2">
                  <Link to="/login" className="btn-secondary !py-2.5 flex-1 text-sm text-center">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary !py-2.5 flex-1 text-sm text-center">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
