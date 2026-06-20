import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FaCrown, FaTachometerAlt, FaUser, FaChartLine, FaDumbbell, FaUtensils,
  FaCalendarAlt, FaBell, FaUsers, FaBlog, FaImages, FaChartBar,
  FaUserTie, FaClipboardList, FaCog, FaSignOutAlt, FaChevronLeft,
  FaChevronRight, FaMoneyBillWave, FaComments, FaRobot, FaHome, FaBars
} from 'react-icons/fa';

const clientMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
  { name: 'My Profile', path: '/dashboard/profile', icon: FaUser },
  { name: 'Progress', path: '/dashboard/progress', icon: FaChartLine },
  { name: 'Workouts', path: '/dashboard/workouts', icon: FaDumbbell },
  { name: 'Nutrition', path: '/dashboard/nutrition', icon: FaUtensils },
  { name: 'Appointments', path: '/dashboard/appointments', icon: FaCalendarAlt },
  { name: 'Notifications', path: '/dashboard/notifications', icon: FaBell },
  { name: 'Subscription', path: '/dashboard/subscription', icon: FaMoneyBillWave },
  { name: 'Chat with Coach', path: '/dashboard/chat', icon: FaComments },
];

const adminMenuItems = [
  { name: 'Overview', path: '/admin', icon: FaTachometerAlt },
  { name: 'Users', path: '/admin/users', icon: FaUsers },
  { name: 'Clients', path: '/admin/clients', icon: FaUserTie },
  { name: 'Workouts', path: '/admin/workouts', icon: FaDumbbell },
  { name: 'Nutrition', path: '/admin/nutrition', icon: FaUtensils },
  { name: 'Bookings', path: '/admin/bookings', icon: FaCalendarAlt },
  { name: 'Blog', path: '/admin/blog', icon: FaBlog },
  { name: 'Gallery', path: '/admin/gallery', icon: FaImages },
  { name: 'Analytics', path: '/admin/analytics', icon: FaChartBar },
  { name: 'Leads', path: '/admin/leads', icon: FaClipboardList },
  { name: 'Chat Threads', path: '/admin/chat', icon: FaComments },
];

const Sidebar = ({ isAdmin = false }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const menuItems = isAdmin ? adminMenuItems : clientMenuItems;

  const getMobileBottomItems = () => {
    if (isAdmin) {
      return [
        { name: 'Overview', path: '/admin', icon: FaTachometerAlt },
        { name: 'Clients', path: '/admin/clients', icon: FaUserTie },
        { name: 'Workouts', path: '/admin/workouts', icon: FaDumbbell },
        { name: 'Chat', path: '/admin/chat', icon: FaComments },
      ];
    } else {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
        { name: 'Workouts', path: '/dashboard/workouts', icon: FaDumbbell },
        { name: 'Nutrition', path: '/dashboard/nutrition', icon: FaUtensils },
        { name: 'Chat', path: '/dashboard/chat', icon: FaComments },
      ];
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-dark-900/95 border-r border-white/5 z-40 backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-20 border-b border-white/5">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
            <FaCrown className="text-dark-950 text-lg" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h2 className="text-sm font-bold tracking-wide">
                  <span className="text-gradient-gold">GNANESWAR</span>
                </h2>
                <p className="text-[9px] uppercase tracking-[2px] text-dark-500 -mt-0.5">
                  {isAdmin ? 'Admin Panel' : 'Client Portal'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Card */}
        {!collapsed && (
          <div className="mx-4 mt-4 p-3 rounded-xl glass-light">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                <span className="text-dark-950 font-bold text-sm">
                  {user?.first_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                <p className="text-xs text-dark-400 truncate">{user?.email || 'user@email.com'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-3 mt-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                    : 'text-dark-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={`text-lg flex-shrink-0 ${isActive ? 'text-gold-400' : 'group-hover:text-gold-400'}`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 space-y-1 border-t border-white/5 pt-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 transition-all"
            title={collapsed ? 'Back to Website' : undefined}
          >
            <FaHome className="text-lg flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Back to Website</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
            title={collapsed ? 'Sign Out' : undefined}
          >
            <FaSignOutAlt className="text-lg flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-500 hover:text-dark-300 hover:bg-white/5 transition-all w-full mt-2"
          >
            {collapsed ? (
              <FaChevronRight className="text-lg flex-shrink-0" />
            ) : (
              <>
                <FaChevronLeft className="text-lg flex-shrink-0" />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {getMobileBottomItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  isActive ? 'text-gold-400' : 'text-dark-500'
                }`}
              >
                <item.icon className="text-lg" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* More Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-dark-500`}
          >
            <FaBars className="text-lg" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[280px] h-full bg-dark-900/95 border-l border-white/5 p-6 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
                      <FaCrown className="text-dark-950 text-sm" />
                    </div>
                    <span className="font-bold text-gradient-gold text-sm">GNANESWAR</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-dark-400 hover:text-white p-1 rounded-lg"
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>

                {/* User Card */}
                <div className="p-3 rounded-xl glass-light mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center flex-shrink-0">
                      <span className="text-dark-950 font-bold text-sm">
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-white truncate">{user?.full_name || 'User'}</p>
                      <p className="text-xs text-dark-400 truncate">{user?.email || 'user@email.com'}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Links */}
                <nav className="space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                            : 'text-dark-400 hover:text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="text-lg flex-shrink-0" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions */}
              <div className="border-t border-white/5 pt-4 space-y-2 mt-6">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaHome className="text-lg flex-shrink-0" />
                  <span className="text-sm font-medium">Back to Website</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-dark-400 hover:text-red-400 hover:bg-red-500/10 w-full"
                >
                  <FaSignOutAlt className="text-lg flex-shrink-0" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
