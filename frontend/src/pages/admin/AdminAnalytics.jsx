import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  FiTrendingUp, FiUsers, FiCalendar, FiDollarSign,
  FiArrowUpRight, FiArrowDownRight
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { analyticsService } from '../../services/api';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#9ca3af',
        font: { family: 'Inter' }
      }
    }
  },
  scales: {
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#9ca3af' }
    },
    x: {
      grid: { display: false },
      ticks: { color: '#9ca3af' }
    }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#9ca3af',
        font: { family: 'Inter' }
      }
    }
  }
};

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await analyticsService.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center">
        <FaSpinner className="animate-spin text-gold-500 text-4xl" />
      </div>
    );
  }

  const { summary, revenue_trends, user_growth, goals_distribution } = data;

  // 1. Calculate Revenue growth rate percentage comparing current month vs previous
  const currentMonthRevenue = revenue_trends[revenue_trends.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenue_trends[revenue_trends.length - 2]?.revenue || 0;
  const revenueGrowthPercent = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : (currentMonthRevenue > 0 ? '100' : '0');

  // 2. Calculate User Growth rate percentage comparing current month vs previous
  const currentMonthSignups = user_growth[user_growth.length - 1]?.signups || 0;
  const previousMonthSignups = user_growth[user_growth.length - 2]?.signups || 0;
  const signupGrowthPercent = previousMonthSignups > 0 
    ? ((currentMonthSignups - previousMonthSignups) / previousMonthSignups * 100).toFixed(1)
    : (currentMonthSignups > 0 ? '100' : '0');

  // 3. Prepare Chart Data from Live Trends
  const revenueData = {
    labels: revenue_trends.map(t => t.month.split(' ')[0]), // Show short month names
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: revenue_trends.map(t => t.revenue),
        borderColor: '#d4af37',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const userGrowthData = {
    labels: user_growth.map(g => g.month.split(' ')[0]),
    datasets: [
      {
        label: 'New Signups Joined',
        data: user_growth.map(g => g.signups),
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        hoverBackgroundColor: '#d4af37',
        borderRadius: 6,
      },
    ],
  };

  // Extract goals or construct default keys if empty
  const goalsLabels = Object.keys(goals_distribution || {}).length > 0
    ? Object.keys(goals_distribution)
    : ['Muscle Gain', 'Fat Loss', 'General Fitness', 'Endurance'];
  
  const goalsValues = Object.keys(goals_distribution || {}).length > 0
    ? Object.values(goals_distribution)
    : [0, 0, 0, 0];

  const programPopularityData = {
    labels: goalsLabels,
    datasets: [
      {
        data: goalsValues,
        backgroundColor: [
          'rgba(212, 175, 55, 0.9)',
          'rgba(255, 255, 255, 0.8)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(212, 175, 55, 0.4)',
          'rgba(255, 255, 255, 0.5)',
          'rgba(212, 175, 55, 0.7)'
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <>
      <Helmet><title>Analytics | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Business Intelligence</h1>
          <p className="text-dark-400 mt-1">Real-time revenue metrics, growth calculations and performance indicators</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                <FiDollarSign size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">₹{summary.total_revenue}</h3>
              <p className={`text-xs flex items-center gap-1 mt-1 font-semibold ${parseFloat(revenueGrowthPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(revenueGrowthPercent) >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />} 
                {parseFloat(revenueGrowthPercent) >= 0 ? '+' : ''}{revenueGrowthPercent}% 
                <span className="text-dark-500 font-normal">vs last month</span>
              </p>
            </div>
          </div>

          {/* Active Clients */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Active Clients</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                <FiUsers size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{summary.clients_count}</h3>
              <p className={`text-xs flex items-center gap-1 mt-1 font-semibold ${parseFloat(signupGrowthPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(signupGrowthPercent) >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />} 
                {parseFloat(signupGrowthPercent) >= 0 ? '+' : ''}{signupGrowthPercent}% 
                <span className="text-dark-500 font-normal">vs last month</span>
              </p>
            </div>
          </div>

          {/* Consultations */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Total Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-400">
                <FiCalendar size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{summary.total_bookings}</h3>
              <p className="text-xs text-dark-500 mt-1 font-normal">
                Active &amp; pending scheduled calls
              </p>
            </div>
          </div>

          {/* Growth Rate / active subscriptions */}
          <div className="card p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Active VIPs</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
                <FiTrendingUp size={16} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{summary.active_subscriptions}</h3>
              <p className="text-xs text-gold-500 mt-1 font-semibold">
                Premium active coaching tier users
              </p>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Line Chart */}
          <div className="card p-5 col-span-1 lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-white font-serif font-bold text-lg">Revenue History</h3>
              <p className="text-xs text-dark-400">Track earnings and subscription cycles</p>
            </div>
            <div className="h-64 relative">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>

          {/* Program Distribution (Doughnut) */}
          <div className="card p-5 space-y-4">
            <div>
              <h3 className="text-white font-serif font-bold text-lg">Program Popularity</h3>
              <p className="text-xs text-dark-400">Top coaching tracks by customer goal enrollment</p>
            </div>
            <div className="h-64 relative">
              <Doughnut data={programPopularityData} options={doughnutOptions} />
            </div>
          </div>

          {/* User Signups (Bar) */}
          <div className="card p-5 col-span-1 lg:col-span-3 space-y-4">
            <div>
              <h3 className="text-white font-serif font-bold text-lg">Acquisition Trends</h3>
              <p className="text-xs text-dark-400">New registration velocity over 6 months</p>
            </div>
            <div className="h-64 relative">
              <Bar data={userGrowthData} options={chartOptions} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
