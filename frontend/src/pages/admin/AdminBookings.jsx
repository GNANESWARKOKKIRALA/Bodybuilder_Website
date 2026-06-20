import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiChevronLeft, FiChevronRight, FiCheck,
  FiX, FiClock, FiRefreshCw, FiPlus, FiTrash2
} from 'react-icons/fi';
import { bookingService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const statusColors = {
  pending: 'bg-yellow-500/15 text-yellow-400',
  confirmed: 'bg-green-500/15 text-green-400',
  cancelled: 'bg-red-500/15 text-red-400',
  completed: 'bg-blue-500/15 text-blue-400',
  no_show: 'bg-dark-700 text-dark-400'
};

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter === 'All' ? undefined : statusFilter.toLowerCase()
      };
      const res = await bookingService.getAllBookings(params);
      if (res.data.success) {
        setBookings(res.data.data.items || []);
      }
    } catch (err) {
      console.error("Error loading admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      const res = await bookingService.approveBooking(id);
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Error approving booking:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await bookingService.rejectBooking(id);
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
    }
  };

  // Compile booking counts per calendar day for June 2026
  const getBookingCountForDay = (dayNum) => {
    return bookings.filter(b => {
      if (!b.appointment_date) return false;
      const d = new Date(b.appointment_date);
      return d.getDate() === dayNum && d.getMonth() === 5 && d.getFullYear() === 2026; // June 2026
    }).length;
  };

  // Calendar for June 2026
  const firstDay = new Date(2026, 5, 1).getDay();
  const daysInMonth = 30;
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);

  return (
    <>
      <Helmet><title>Bookings | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Booking Management</h1>
          <p className="text-dark-400 mt-1">{bookings.length} active scheduled bookings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div variants={fadeIn} className="card">
            <div className="flex items-center justify-between mb-4">
              <button className="text-dark-400 hover:text-white transition-colors"><FiChevronLeft /></button>
              <h2 className="font-serif font-bold text-white">June 2026</h2>
              <button className="text-dark-400 hover:text-white transition-colors"><FiChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] text-dark-500 font-semibold py-1">{d}</div>
              ))}
              {calDays.map((day, i) => {
                const count = day ? getBookingCountForDay(day) : 0;
                return (
                  <div
                    key={i}
                    className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-all ${
                      day === null
                        ? ''
                        : count > 0
                        ? 'bg-gold-500 text-dark-950 font-bold'
                        : 'text-dark-400 hover:bg-dark-800'
                    }`}
                  >
                    {day}
                    {day && count > 0 && (
                      <span className="absolute bottom-0.5 text-[8px] text-dark-950 font-bold">{count}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Bookings Table */}
          <motion.div variants={fadeIn} className="lg:col-span-2 card overflow-hidden flex flex-col">
            {/* Status Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    statusFilter === s ? 'bg-gold-500 text-dark-950' : 'bg-dark-900 text-dark-400 hover:bg-dark-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                      <th className="pb-3 pr-3">Client</th>
                      <th className="pb-3 pr-3">Date</th>
                      <th className="pb-3 pr-3">Time</th>
                      <th className="pb-3 pr-3">Type</th>
                      <th className="pb-3 pr-3">Status</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 text-[10px] font-bold">
                              {b.user?.first_name?.[0]}{b.user?.last_name?.[0]}
                            </div>
                            <span className="text-white font-medium text-sm">{b.user?.full_name || `${b.user?.first_name} ${b.user?.last_name}`}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-dark-400 text-sm">{b.appointment_date}</td>
                        <td className="py-3 pr-3 text-dark-400 text-sm">{b.start_time?.substring(0, 5)}</td>
                        <td className="py-3 pr-3 text-dark-400 text-sm">{b.appointment_type?.replace('_', ' ').toUpperCase()}</td>
                        <td className="py-3 pr-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusColors[b.status]}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3">
                          {b.status === 'pending' ? (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleApprove(b.id)}
                                className="p-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors" 
                                title="Approve Appointment"
                              >
                                <FiCheck size={14} />
                              </button>
                              <button 
                                onClick={() => handleReject(b.id)}
                                className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors" 
                                title="Reject Appointment"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-dark-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && bookings.length === 0 && (
              <div className="text-center py-12">
                <FiCalendar className="mx-auto text-dark-600 mb-3" size={32} />
                <p className="text-dark-400 text-sm">No appointments found in the database</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
