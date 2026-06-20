import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBell, FiCheckCircle, FiCalendar, FiTarget, FiSettings,
  FiZap, FiActivity, FiAlertCircle, FiLoader
} from 'react-icons/fi';
import { notificationService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'system', label: 'System' },
];

const iconMap = {
  workouts: FiZap,
  nutrition: FiTarget,
  appointments: FiCalendar,
  system: FiSettings,
};

const colorMap = {
  workouts: 'bg-blue-500/15 text-blue-400',
  nutrition: 'bg-green-500/15 text-green-400',
  appointments: 'bg-purple-500/15 text-purple-400',
  system: 'bg-dark-700 text-dark-300',
};



export default function ClientNotifications() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data.notifications || res.data.data.items || []);
      }
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => n.category === activeTab);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try { await notificationService.markAsRead(id); } catch (_) {}
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await notificationService.markAllRead(); } catch (_) {}
  };

  return (
    <>
      <Helmet><title>Notifications | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Notifications</h1>
            <p className="text-dark-400 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
              <FiCheckCircle size={14} /> Mark All Read
            </button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div variants={fadeIn} className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-gold-500 text-dark-950'
                  : 'bg-dark-900 text-dark-400 hover:bg-dark-800'
              }`}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-60">
                  ({notifications.filter(n => n.category === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Notification List */}
        <motion.div variants={stagger} className="space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-dark-400">
              <FiLoader className="animate-spin" size={22} />
              <span>Loading notifications...</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <FiAlertCircle size={18} />
              <span className="text-sm">{error}</span>
              <button onClick={fetchNotifications} className="ml-auto text-sm underline">Retry</button>
            </div>
          )}
          <AnimatePresence>
            {!loading && filtered.map(n => {
              const Icon = iconMap[n.category] || FiBell;
              return (
                <motion.div
                  key={n.id}
                  variants={fadeIn}
                  layout
                  onClick={() => markAsRead(n.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all hover:bg-dark-800/50 ${
                    n.read
                      ? 'opacity-60 bg-dark-900/20'
                      : 'bg-dark-900/50 border border-gold-500/10 shadow-lg shadow-black/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[n.category] || 'bg-dark-700 text-dark-300'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm font-semibold ${n.read ? 'text-dark-400' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-gold-400 flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${n.read ? 'text-dark-500' : 'text-dark-300'}`}>
                      {n.message}
                    </p>
                    <p className="text-[11px] text-dark-600 mt-2">{n.time || n.created_at}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {!loading && filtered.length === 0 && !error && (
            <motion.div variants={fadeIn} className="text-center py-16">
              <FiBell className="mx-auto text-dark-600 mb-3" size={40} />
              <p className="text-dark-400 font-medium">No notifications here yet</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
