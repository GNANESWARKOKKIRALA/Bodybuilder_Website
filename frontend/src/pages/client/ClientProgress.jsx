import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrendingDown, FiDownload, FiCamera, FiX,
  FiCalendar, FiUpload
} from 'react-icons/fi';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const last3Months = (() => {
  const labels = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (i % 7 === 0) labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    else labels.push('');
  }
  return labels;
})();

const generateData = (start, end, len) => {
  const step = (end - start) / len;
  return Array.from({ length: len }, (_, i) => +(start + step * i + (Math.random() - 0.5) * 0.8).toFixed(1));
};

const chartOpts = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: title === 'Measurements', labels: { color: '#888', usePointStyle: true, pointStyle: 'circle' } },
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
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', maxTicksLimit: 12, font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888', font: { size: 11 } } }
  }
});

const weightChartData = {
  labels: last3Months,
  datasets: [{
    label: 'Weight (kg)',
    data: generateData(88.5, 83.5, 90),
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212,175,55,0.08)',
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 5,
    borderWidth: 2,
  }]
};

const bfChartData = {
  labels: last3Months,
  datasets: [{
    label: 'Body Fat %',
    data: generateData(18.5, 14.2, 90),
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34,197,94,0.08)',
    fill: true,
    tension: 0.4,
    pointRadius: 0,
    pointHoverRadius: 5,
    borderWidth: 2,
  }]
};

const measurementsData = {
  labels: last3Months,
  datasets: [
    { label: 'Chest', data: generateData(100, 104, 90), borderColor: '#d4af37', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Waist', data: generateData(84, 78, 90), borderColor: '#ef4444', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Arms', data: generateData(36, 39, 90), borderColor: '#3b82f6', tension: 0.4, pointRadius: 0, borderWidth: 2 },
    { label: 'Thighs', data: generateData(58, 62, 90), borderColor: '#a855f7', tension: 0.4, pointRadius: 0, borderWidth: 2 },
  ]
};

const progressPhotos = [
  { date: 'Jun 1, 2026', label: 'Week 12' },
  { date: 'May 15, 2026', label: 'Week 10' },
  { date: 'May 1, 2026', label: 'Week 8' },
  { date: 'Apr 15, 2026', label: 'Week 6' },
  { date: 'Apr 1, 2026', label: 'Week 4' },
  { date: 'Mar 15, 2026', label: 'Week 2' },
];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function ClientProgress() {
  const [showModal, setShowModal] = useState(false);
  const [entry, setEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '', bodyFat: '', chest: '', waist: '', arms: '', thighs: ''
  });

  return (
    <>
      <Helmet><title>Progress | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Progress Tracking</h1>
            <p className="text-dark-400 mt-1">Monitor your transformation journey</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <FiPlus size={18} /> Add Entry
            </button>
            <button className="btn-secondary">
              <FiDownload size={18} /> Report
            </button>
          </div>
        </motion.div>

        {/* Weight Chart */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Weight Tracking</h2>
              <p className="text-dark-400 text-sm">88.5 kg → 83.5 kg <span className="text-green-400">(-5.0 kg)</span></p>
            </div>
            <FiTrendingDown className="text-green-400" size={24} />
          </div>
          <div className="h-64 md:h-72">
            <Line data={weightChartData} options={chartOpts('Weight')} />
          </div>
        </motion.div>

        {/* Body Fat Chart */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-white">Body Fat Tracking</h2>
              <p className="text-dark-400 text-sm">18.5% → 14.2% <span className="text-green-400">(-4.3%)</span></p>
            </div>
            <FiTrendingDown className="text-green-400" size={24} />
          </div>
          <div className="h-64 md:h-72">
            <Line data={bfChartData} options={chartOpts('Body Fat')} />
          </div>
        </motion.div>

        {/* Measurements Chart */}
        <motion.div variants={fadeIn} className="card">
          <div className="mb-4">
            <h2 className="text-lg font-serif font-bold text-white">Measurements Tracking</h2>
            <p className="text-dark-400 text-sm">All measurements in cm</p>
          </div>
          <div className="h-64 md:h-72">
            <Line data={measurementsData} options={chartOpts('Measurements')} />
          </div>
        </motion.div>

        {/* Progress Photos */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-bold text-white">Progress Photos</h2>
            <FiCamera className="text-gold-400" size={20} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {progressPhotos.map((photo, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="aspect-[3/4] rounded-xl bg-dark-900 border border-dark-800 flex flex-col items-center justify-center gap-2 hover:border-gold-500/30 transition-colors cursor-pointer group"
              >
                <FiCamera className="text-dark-600 group-hover:text-gold-500 transition-colors" size={28} />
                <div className="text-center">
                  <p className="text-xs font-semibold text-dark-400">{photo.label}</p>
                  <p className="text-[10px] text-dark-600">{photo.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Add Entry Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="w-full max-w-lg card bg-dark-900 border-gold-500/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-white">Add Progress Entry</h2>
                  <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white transition-colors">
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Date</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => setEntry({ ...entry, date: e.target.value })}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                      <input type="number" step="0.1" value={entry.weight} onChange={(e) => setEntry({ ...entry, weight: e.target.value })} className="input-field" placeholder="83.5" />
                    </div>
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Body Fat %</label>
                      <input type="number" step="0.1" value={entry.bodyFat} onChange={(e) => setEntry({ ...entry, bodyFat: e.target.value })} className="input-field" placeholder="14.2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {['chest', 'waist', 'arms', 'thighs'].map((m) => (
                      <div key={m}>
                        <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">{m.charAt(0).toUpperCase() + m.slice(1)} (cm)</label>
                        <input type="number" step="0.1" value={entry[m]} onChange={(e) => setEntry({ ...entry, [m]: e.target.value })} className="input-field" />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Progress Photo</label>
                    <div className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-gold-500/30 transition-colors cursor-pointer">
                      <FiUpload className="mx-auto text-dark-500 mb-2" size={28} />
                      <p className="text-sm text-dark-400">Click or drag to upload</p>
                      <p className="text-xs text-dark-600 mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={() => setShowModal(false)} className="btn-primary flex-1">Save Entry</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
