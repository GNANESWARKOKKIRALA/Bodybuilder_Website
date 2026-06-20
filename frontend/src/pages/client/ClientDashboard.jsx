import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiTrendingUp, FiZap, FiBell,
  FiClipboard, FiTarget, FiAward, FiClock, FiChevronRight
} from 'react-icons/fi';
import { bookingService, progressService, notificationService, workoutService } from '../../services/api';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const quotes = [
  "The body achieves what the mind believes.",
  "Discipline is the bridge between goals and accomplishment.",
  "Train insane or remain the same."
];

const weightData = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }),
  datasets: [{
    label: 'Weight (kg)',
    data: [88.5, 88.2, 88.0, 87.8, 87.9, 87.5, 87.3, 87.1, 87.0, 86.8,
           86.9, 86.5, 86.3, 86.1, 86.0, 85.8, 85.9, 85.6, 85.4, 85.2,
           85.0, 84.8, 84.9, 84.6, 84.4, 84.2, 84.0, 83.8, 83.6, 83.5],
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    fill: true,
    tension: 0.4,
    pointRadius: 2,
    pointHoverRadius: 6,
    pointBackgroundColor: '#d4af37',
    pointHoverBackgroundColor: '#fff',
    pointBorderColor: '#d4af37',
    borderWidth: 2,
  }]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      titleColor: '#d4af37',
      bodyColor: '#fafafa',
      borderColor: 'rgba(212, 175, 55, 0.3)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#888', maxTicksLimit: 8, font: { size: 11 } },
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.05)' },
      ticks: { color: '#888', font: { size: 11 } },
    }
  }
};



const quickActions = [
  { label: 'Log Workout', icon: FiClipboard, color: 'from-gold-500 to-gold-700', href: '/dashboard/workouts' },
  { label: 'Track Progress', icon: FiTrendingUp, color: 'from-green-500 to-green-700', href: '/dashboard/progress' },
  { label: 'View Meals', icon: FiTarget, color: 'from-blue-500 to-blue-700', href: '/dashboard/nutrition' },
  { label: 'Book Session', icon: FiCalendar, color: 'from-purple-500 to-purple-700', href: '/dashboard/appointments' },
];

export default function ClientDashboard() {
  const { user } = useAuth();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [myProgram, setMyProgram] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch bookings
        const bookingsRes = await bookingService.getMyBookings();
        if (bookingsRes.data.success) {
          setAppointments(bookingsRes.data.data.items || []);
        }

        // Fetch notifications
        const notifRes = await notificationService.getNotifications();
        if (notifRes.data.success) {
          setNotifications(notifRes.data.data.notifications || []);
        }

        // Fetch progress entries for chart
        const progressRes = await progressService.getEntries();
        if (progressRes.data.success) {
          const entries = progressRes.data.data.items || [];
          setWeightLogs([...entries].reverse());
        }

        // Fetch workout summary for the last 7 days
        const summaryRes = await workoutService.getSummary(7);
        if (summaryRes.data.success) {
          setWorkoutsCount(summaryRes.data.data.unique_workout_days || 0);
        }

        // Fetch current program
        const programRes = await workoutService.getMyProgram();
        if (programRes.data.success) {
          setMyProgram(programRes.data.data.program || null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const currentWeight = user?.profile?.weight_kg || null;
  const targetWeight = user?.profile?.target_weight_kg || null;
  const goalStr = user?.profile?.fitness_goal 
    ? user.profile.fitness_goal.toUpperCase().replace('_', ' ') 
    : 'NOT SET';

  const stats = [
    { 
      label: 'Current Weight', 
      value: user?.profile?.weight_kg ? `${user.profile.weight_kg} kg` : 'Not Set', 
      icon: FiTarget, 
      change: user?.profile?.target_weight_kg ? `Goal: ${user.profile.target_weight_kg} kg` : 'Goal: Not Set', 
      positive: true 
    },
    { 
      label: 'Fitness Goal', 
      value: goalStr, 
      icon: FiActivity, 
      change: user?.profile?.experience_level ? `Level: ${user.profile.experience_level.toUpperCase()}` : 'Level: Not Set', 
      positive: true 
    },
    { 
      label: 'Workouts This Week', 
      value: `${workoutsCount}/6`, 
      icon: FiZap, 
      change: workoutsCount > 0 ? 'Active' : 'Get Started', 
      positive: true 
    },
    { 
      label: 'Activity Level', 
      value: user?.profile?.activity_level 
        ? user.profile.activity_level.toUpperCase().replace('_', ' ') 
        : 'NOT SET', 
      icon: FiAward, 
      change: 'Platform Profile', 
      positive: true 
    },
  ];

  const focusArea = myProgram ? `${myProgram.name}` : "No Active Program Assigned";

  const hasChartData = weightLogs.length > 0;
  const userWeightData = {
    labels: hasChartData 
      ? weightLogs.map(log => {
          const d = new Date(log.entry_date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        })
      : [],
    datasets: [{
      label: 'Weight (kg)',
      data: hasChartData ? weightLogs.map(log => log.weight_kg) : [],
      borderColor: '#d4af37',
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 6,
      pointBackgroundColor: '#d4af37',
      pointHoverBackgroundColor: '#fff',
      pointBorderColor: '#d4af37',
      borderWidth: 2,
    }]
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center"
        >
          <FiAward className="text-dark-950 text-xl" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Dashboard | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Welcome Banner */}
        <motion.div
          variants={fadeIn}
          className="relative overflow-hidden rounded-2xl gradient-gold p-6 md:p-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark-950">
              Welcome back, {user?.first_name || 'Client'}! 💪
            </h1>
            <p className="text-dark-800 mt-2 text-lg italic font-serif">"{randomQuote}"</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-dark-950/20 rounded-lg px-4 py-2">
              <FiCalendar className="text-dark-950" />
              <span className="text-dark-950 font-semibold text-sm">
                Today's Focus: {focusArea}
              </span>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              className="card group hover:border-gold-500/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-xs uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-xs mt-1 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 group-hover:bg-gold-500/20 transition-colors">
                  <stat.icon size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts & Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Chart */}
          <motion.div variants={fadeIn} className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-white">Weight Progress</h2>
              <span className="text-xs text-dark-400">History Timeline</span>
            </div>
            {hasChartData ? (
              <div className="h-64">
                <Line data={userWeightData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-dark-900/20 border border-dashed border-dark-800 rounded-xl">
                <FiTrendingUp className="text-4xl text-gold-500/20 mb-3" />
                <h3 className="text-sm font-semibold text-white">No weight logs found</h3>
                <p className="text-xs text-dark-500 max-w-xs mt-1">
                  Once you start logging your weight, your progress curve will be displayed here.
                </p>
                <Link to="/dashboard/progress" className="btn-secondary text-xs px-4 py-2 mt-4">
                  Log Your First Weight
                </Link>
              </div>
            )}
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div variants={fadeIn} className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-white">Upcoming</h2>
              <FiCalendar className="text-gold-400" />
            </div>
            {appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3 rounded-xl bg-dark-900/50 border border-dark-800 hover:border-gold-500/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        {apt.appointment_type ? apt.appointment_type.toUpperCase().replace('_', ' ') : 'Session'}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        apt.status === 'confirmed'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                      <FiClock size={12} /> {apt.appointment_date} at {apt.start_time ? apt.start_time.substring(0, 5) : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12">
                <FiCalendar className="text-4xl text-gold-500/20 mb-3" />
                <p className="text-xs text-dark-400">No upcoming sessions booked</p>
                <Link to="/dashboard/appointments" className="text-gold-400 text-xs font-semibold hover:underline mt-2 inline-block">
                  Book a Consultation
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Notifications & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <motion.div variants={fadeIn} className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-bold text-white">Notifications</h2>
              <FiBell className="text-gold-400" />
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl flex items-start gap-3 transition-all cursor-pointer hover:bg-dark-800/50 ${
                      n.is_read ? 'opacity-60' : 'bg-dark-900/50 border border-gold-500/10'
                    }`}
                  >
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      n.is_read ? 'bg-dark-600' : 'bg-gold-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white">{n.title}</h3>
                      <p className="text-xs text-dark-400 mt-0.5 truncate">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-dark-500 whitespace-nowrap">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 bg-dark-900/10 border border-dark-800/40 rounded-xl">
                <FiBell className="text-3xl text-gold-500/20 mb-2" />
                <p className="text-xs text-dark-400">All caught up! No notifications.</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeIn} className="card">
            <h2 className="text-lg font-serif font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white font-semibold text-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95`}
                >
                  <action.icon size={22} />
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
