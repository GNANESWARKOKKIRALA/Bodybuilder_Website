import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiUsers, FiDollarSign, FiCalendar, FiTrendingUp,
  FiUserPlus, FiClock, FiArrowUpRight, FiArrowDownRight,
  FiClipboard, FiMail, FiSettings, FiCheck, FiX
} from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { analyticsService, bookingService } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(26,26,26,0.95)',
      titleColor: '#d4af37',
      bodyColor: '#fafafa',
      borderColor: 'rgba(212,175,55,0.3)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', font: { size: 12 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', font: { size: 12 } } }
  }
});

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getDashboard();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await bookingService.approveBooking(id);
      if (res.data.success) {
        fetchOverview();
      }
    } catch (err) {
      console.error("Error approving booking:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await bookingService.rejectBooking(id);
      if (res.data.success) {
        fetchOverview();
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { summary, recent_registrations, recent_bookings, revenue_trends, user_growth } = data;

  const stats = [
    { label: 'Total Users', value: summary.total_users, change: 'All accounts', positive: true, icon: FiUsers, color: 'from-gold-500 to-gold-700' },
    { label: 'Active Clients', value: summary.clients_count, change: 'Training split', positive: true, icon: FiUserPlus, color: 'from-green-500 to-green-700' },
    { label: 'Revenue Earned', value: `₹${summary.total_revenue}`, change: 'Total transactions', positive: true, icon: FiDollarSign, color: 'from-blue-500 to-blue-700' },
    { label: 'Pending Bookings', value: summary.pending_bookings, change: 'Needs action', positive: summary.pending_bookings === 0, icon: FiCalendar, color: 'from-purple-500 to-purple-700' },
  ];

  // Parse chart data from backend
  const revenueChartData = {
    labels: revenue_trends ? revenue_trends.map(t => t.month.split(' ')[0]) : [],
    datasets: [{
      label: 'Revenue (₹)',
      data: revenue_trends ? revenue_trends.map(t => t.revenue) : [],
      backgroundColor: 'rgba(212, 175, 55, 0.7)',
      hoverBackgroundColor: 'rgba(212, 175, 55, 0.9)',
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const userGrowthChartData = {
    labels: user_growth ? user_growth.map(g => g.month.split(' ')[0]) : [],
    datasets: [{
      label: 'Signups',
      data: user_growth ? user_growth.map(g => g.signups) : [],
      borderColor: '#d4af37',
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#d4af37',
      pointHoverRadius: 6,
      borderWidth: 2,
    }]
  };

  // Only show bookings that are actually pending for dashboard action
  const pendingBookings = recent_bookings.filter(b => b.status === 'pending');

  return (
    <>
      <Helmet><title>Admin Dashboard | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Admin Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back, Coach Gnaneswar</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeIn} className="card group hover:border-gold-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-dark-400 text-xs uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-dark-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={fadeIn} className="card">
            <h2 className="text-lg font-serif font-bold text-white mb-4">Revenue Trends</h2>
            <div className="h-64">
              <Bar data={revenueChartData} options={chartOpts('Revenue')} />
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="card">
            <h2 className="text-lg font-serif font-bold text-white mb-4">New Signups</h2>
            <div className="h-64">
              <Line data={userGrowthChartData} options={chartOpts('Signups')} />
            </div>
          </motion.div>
        </div>

        {/* Tables & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Registrations */}
          <motion.div variants={fadeIn} className="lg:col-span-2 card">
            <h2 className="text-lg font-serif font-bold text-white mb-4">Recent Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_registrations.map((r, i) => (
                    <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 text-xs font-bold">
                            {r.first_name?.[0]}{r.last_name?.[0]}
                          </div>
                          <span className="text-white font-medium">{r.full_name || `${r.first_name} ${r.last_name}`}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-dark-400">{r.email}</td>
                      <td className="py-3 pr-4 text-gold-400 font-semibold capitalize">{r.role}</td>
                      <td className="py-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full ${r.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {r.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recent_registrations.length === 0 && (
              <p className="text-xs text-dark-500 py-6 text-center">No registrations yet.</p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-serif font-bold text-white mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-3">
                <a href="/admin/clients" className="p-4 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 text-dark-950 font-semibold text-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-center">
                  <FiUsers size={22} />
                  Clients
                </a>
                <a href="/admin/workouts" className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white font-semibold text-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-center">
                  <FiClipboard size={22} />
                  Workouts
                </a>
                <a href="/admin/chat" className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-semibold text-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-center">
                  <FiMail size={22} />
                  Chat
                </a>
                <a href="/admin/bookings" className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold text-sm flex flex-col items-center gap-2 hover:scale-105 transition-transform active:scale-95 text-center">
                  <FiCalendar size={22} />
                  Bookings
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Bookings */}
        <motion.div variants={fadeIn} className="card">
          <h2 className="text-lg font-serif font-bold text-white mb-4">Pending Appointments Action List</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                  <th className="pb-3 pr-4">Client</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map((b, i) => (
                  <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                    <td className="py-3 pr-4 text-white font-medium">
                      {b.user?.full_name || `${b.user?.first_name} ${b.user?.last_name}`}
                    </td>
                    <td className="py-3 pr-4 text-dark-400 capitalize">{b.appointment_type?.replace('_', ' ')}</td>
                    <td className="py-3 pr-4 text-dark-400">{b.appointment_date}</td>
                    <td className="py-3 pr-4 text-dark-400">{b.start_time?.substring(0, 5)}</td>
                    <td className="py-3 flex gap-2">
                      <button 
                        onClick={() => handleApprove(b.id)}
                        className="px-3 py-1 rounded-lg bg-green-500/15 text-green-400 text-xs font-semibold hover:bg-green-500/25 transition-colors"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(b.id)}
                        className="px-3 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-colors"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pendingBookings.length === 0 && (
            <p className="text-xs text-dark-500 py-6 text-center">No pending bookings require attention.</p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
