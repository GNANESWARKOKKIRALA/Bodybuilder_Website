import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiX, FiRefreshCw,
  FiAlertCircle, FiSend, FiCheckCircle, FiExternalLink
} from 'react-icons/fi';
import { FaGooglePay } from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
import { MdOutlineQrCode2 } from 'react-icons/md';
import toast from 'react-hot-toast';
import { bookingService } from '../../services/api';

const fadeIn  = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const SESSION_PRICES = {
  consultation: 299,
  training:     499,
  assessment:   399,
  follow_up:    199,
};

const SESSION_LABELS = {
  consultation: 'Consultation',
  training:     'Personal Training',
  assessment:   'Body Assessment',
  follow_up:    'Follow-Up',
};

const STATUS_STYLES = {
  confirmed: 'bg-green-500/15 text-green-400 border border-green-500/20',
  pending:   'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
  completed: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  no_show:   'bg-dark-700 text-dark-400 border border-dark-600',
};

const COACH_UPI_ID   = 'gapbodybuilder@upi';
const COACH_UPI_NAME = 'Gnaneswar Fitness';
const COACH_PHONE    = '6309764875'; // PhonePe registered number

const genRef = () => 'GFP' + Date.now().toString(36).toUpperCase();

// Build UPI deep-link URL
const buildUpiLink = (amount, ref, app = '') => {
  const base = `upi://pay?pa=${COACH_UPI_ID}&pn=${encodeURIComponent(COACH_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Session ' + ref)}`;
  // app-specific intent schemes (Android)
  if (app === 'gpay')   return `intent://pay?pa=${COACH_UPI_ID}&pn=${encodeURIComponent(COACH_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Session ' + ref)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  if (app === 'phonepe')return `intent://pay?pa=${COACH_UPI_ID}&pn=${encodeURIComponent(COACH_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Session ' + ref)}#Intent;scheme=upi;package=com.phonepe.app;end`;
  return base;
};

// QR code via free public API
const qrUrl = (data) =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=200x200&bgcolor=ffffff&color=000000&margin=10`;

export default function ClientAppointments() {
  const today = new Date().toISOString().split('T')[0];

  const [bookingDate,  setBookingDate]  = useState(today);
  const [sessionType,  setSessionType]  = useState('consultation');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes,        setNotes]        = useState('');

  const [appointments, setAppointments] = useState([]);
  const [availSlots,   setAvailSlots]   = useState([]);
  const [loadingApts,  setLoadingApts]  = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // step: 'form' | 'payment' | 'success'
  const [step,       setStep]       = useState('form');
  const [pendingApt, setPendingApt] = useState(null);
  const [payMethod,  setPayMethod]  = useState('gpay');
  const [txRef,      setTxRef]      = useState('');
  const [appOpened,  setAppOpened]  = useState(false); // user tapped the open-app button
  const [paying,     setPaying]     = useState(false);
  const [booking,    setBooking]    = useState(false);

  // ── Fetch appointments ────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingApts(true);
      const res = await bookingService.getMyBookings({ per_page: 50 });
      if (res.data.success) setAppointments(res.data.data.items || []);
    } catch (e) {
      console.error('Error loading appointments:', e);
    } finally {
      setLoadingApts(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Fetch available slots on date change ──────────────────────────────────────
  useEffect(() => {
    if (!bookingDate) return;
    (async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);
        const res = await bookingService.getAvailableSlots(bookingDate);
        if (res.data.success) setAvailSlots(res.data.data.slots || []);
      } catch {
        setAvailSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [bookingDate]);

  // ── Step 1: Create appointment ─────────────────────────────────────────────────
  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error('Please select a time slot'); return; }
    try {
      setBooking(true);
      const res = await bookingService.createBooking({
        appointment_date: bookingDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        appointment_type: sessionType,
        notes: notes || null,
        time_slot_id: selectedSlot.id || null,
      });
      if (res.data.success) {
        const ref = genRef();
        setPendingApt(res.data.data.appointment);
        setTxRef(ref);
        setAppOpened(false);
        setStep('payment');
      } else {
        toast.error(res.data.message || 'Booking failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create booking');
    } finally {
      setBooking(false);
    }
  };

  // ── Open UPI app directly (deep link) ─────────────────────────────────────────
  const handleOpenApp = () => {
    const amount = SESSION_PRICES[sessionType] || 299;
    const link = buildUpiLink(amount, txRef, payMethod);
    window.location.href = link;   // opens app on mobile; fallback on desktop
    setAppOpened(true);
  };

  // ── Step 2: Confirm payment after user returns from app ────────────────────────
  const handleConfirmPaid = async () => {
    const price = SESSION_PRICES[sessionType] || 299;
    try {
      setPaying(true);
      const res = await bookingService.payForBooking(pendingApt.id, {
        payment_method: payMethod,
        transaction_ref: txRef,
        amount: price,
      });
      if (res.data.success) {
        setStep('success');
        fetchAppointments();
      } else {
        toast.error(res.data.message || 'Payment confirmation failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not confirm payment');
    } finally {
      setPaying(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setPendingApt(null);
    setSelectedSlot(null);
    setNotes('');
    setAppOpened(false);
    setPayMethod('gpay');
  };

  const price = SESSION_PRICES[sessionType] || 299;
  const upiDeepLink = buildUpiLink(price, txRef); // generic UPI deep-link for QR
  const qrCodeUrl   = qrUrl(upiDeepLink);

  const now = new Date();
  const upcoming = appointments.filter(a => {
    const d = new Date(`${a.appointment_date}T${a.start_time || '00:00'}`);
    return d >= now && a.status !== 'cancelled';
  });
  const past = appointments.filter(a => {
    const d = new Date(`${a.appointment_date}T${a.start_time || '00:00'}`);
    return d < now || a.status === 'cancelled' || a.status === 'completed';
  });

  return (
    <>
      <Helmet><title>Appointments | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden" animate="visible" variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Appointments</h1>
            <p className="text-dark-400 mt-1">Book sessions with Coach Gnaneswar — pay instantly via UPI</p>
          </div>
          <button onClick={fetchAppointments} className="btn-secondary flex items-center gap-2 text-sm self-start">
            <FiRefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── LEFT PANEL: Booking / Payment / Success ── */}
          <motion.div variants={fadeIn} className="xl:col-span-1">
            <AnimatePresence mode="wait">

              {/* ─── FORM ────────────────────────────────────────────────────── */}
              {step === 'form' && (
                <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="card space-y-5">
                  <h2 className="text-lg font-serif font-bold text-white">Book a Session</h2>
                  <form onSubmit={handleBook} className="space-y-4">

                    {/* Date */}
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Select Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={15} />
                        <input type="date" min={today} value={bookingDate}
                          onChange={e => setBookingDate(e.target.value)} required className="input-field pl-10" />
                      </div>
                    </div>

                    {/* Session Type */}
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Session Type</label>
                      <select value={sessionType} onChange={e => setSessionType(e.target.value)} className="input-field">
                        {Object.entries(SESSION_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v} — ₹{SESSION_PRICES[k]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Available Slots */}
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-2">
                        Available Time Slots
                        {loadingSlots && <span className="text-gold-400 animate-pulse ml-2">Loading…</span>}
                      </label>
                      {!loadingSlots && availSlots.length === 0 && (
                        <div className="flex items-center gap-2 text-dark-500 text-sm py-3">
                          <FiAlertCircle size={15} /> No slots available for this date
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {availSlots.map(slot => (
                          <button key={slot.id || slot.start_time} type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-center ${
                              selectedSlot?.start_time === slot.start_time
                                ? 'bg-gold-500 text-dark-950 shadow-lg shadow-gold-500/20'
                                : 'bg-dark-900 text-dark-300 border border-dark-700 hover:border-gold-500/40'
                            }`}>
                            {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Notes (Optional)</label>
                      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                        placeholder="Any specific topics or goals…" className="input-field resize-none" />
                    </div>

                    {/* Price pill */}
                    {selectedSlot && (
                      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
                        <span className="text-dark-300 text-sm">{SESSION_LABELS[sessionType]}</span>
                        <span className="text-gold-400 font-bold text-lg">₹{price}</span>
                      </div>
                    )}

                    <button type="submit" disabled={booking || !selectedSlot}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                      {booking
                        ? <><div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />Creating…</>
                        : <><FiSend size={15} />Proceed to Payment — ₹{price}</>}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ─── PAYMENT ─────────────────────────────────────────────────── */}
              {step === 'payment' && pendingApt && (
                <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="card space-y-5">

                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-serif font-bold text-white">Pay Now</h2>
                    <button onClick={handleReset} className="text-dark-500 hover:text-white text-xs flex items-center gap-1 transition-colors">
                      <FiX size={13} /> Cancel
                    </button>
                  </div>

                  {/* Booking Summary */}
                  <div className="p-3 rounded-xl bg-dark-900 border border-white/5 text-sm space-y-1.5">
                    <div className="flex justify-between text-dark-300">
                      <span>Session</span>
                      <span className="text-white font-medium">{SESSION_LABELS[sessionType]}</span>
                    </div>
                    <div className="flex justify-between text-dark-300">
                      <span>Date & Time</span>
                      <span className="text-white font-medium">
                        {pendingApt.appointment_date} · {pendingApt.start_time?.slice(0,5)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-1">
                      <span className="text-dark-300 font-semibold">Total</span>
                      <span className="text-gold-400 font-bold text-xl">₹{price}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs text-dark-400 uppercase tracking-wider mb-2">Choose Payment App</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gpay',    label: 'Google Pay', icon: <FaGooglePay size={26} className="text-white" />, bg: 'bg-[#1a73e8]' },
                        { id: 'phonepe', label: 'PhonePe',    icon: <SiPhonepe size={22} className="text-white" />,   bg: 'bg-[#5f259f]' },
                        { id: 'qr',      label: 'Any UPI App', icon: <MdOutlineQrCode2 size={24} className="text-dark-950" />, bg: 'bg-gold-400' },
                      ].map(m => (
                        <button key={m.id} type="button" onClick={() => { setPayMethod(m.id); setAppOpened(false); }}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-[10px] font-bold ${
                            payMethod === m.id
                              ? 'border-gold-400 scale-105 shadow-lg shadow-gold-500/20'
                              : 'border-dark-700 hover:border-dark-500'
                          }`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bg}`}>
                            {m.icon}
                          </div>
                          <span className="text-dark-300">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Google Pay ── */}
                  {payMethod === 'gpay' && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-[#1a73e8]/10 border border-[#1a73e8]/30 p-4 text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-[#1a73e8] flex items-center justify-center mx-auto shadow-lg">
                          <FaGooglePay size={38} className="text-white" />
                        </div>
                        <p className="text-white font-semibold">Pay ₹{price} via Google Pay</p>
                        <p className="text-dark-400 text-xs">Tap below — Google Pay opens automatically</p>
                      </div>
                      <a
                        href={buildUpiLink(price, txRef, 'gpay')}
                        onClick={() => setAppOpened(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-sm transition-all shadow-lg shadow-[#1a73e8]/20 active:scale-95"
                      >
                        <FaGooglePay size={22} /> Open Google Pay <FiExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* ── PhonePe ── */}
                  {payMethod === 'phonepe' && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-[#5f259f]/10 border border-[#5f259f]/30 p-4 text-center space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-[#5f259f] flex items-center justify-center mx-auto shadow-lg">
                          <SiPhonepe size={32} className="text-white" />
                        </div>
                        <p className="text-white font-semibold">Pay ₹{price} via PhonePe</p>
                        <p className="text-dark-400 text-xs">Tap below — PhonePe opens automatically</p>
                      </div>
                      <a
                        href={buildUpiLink(price, txRef, 'phonepe')}
                        onClick={() => setAppOpened(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#5f259f] hover:bg-[#4a1d7a] text-white font-bold text-sm transition-all shadow-lg shadow-[#5f259f]/20 active:scale-95"
                      >
                        <SiPhonepe size={18} /> Open PhonePe <FiExternalLink size={14} />
                      </a>
                    </div>
                  )}

                  {/* ── QR / Any UPI App ── */}
                  {payMethod === 'qr' && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-dark-900 border border-white/5 p-4 text-center space-y-3">
                        <p className="text-white font-semibold text-sm">Scan with any UPI app</p>
                        {/* Live QR code generated from UPI deep link */}
                        <div className="w-44 h-44 mx-auto rounded-xl overflow-hidden border-4 border-white shadow-xl">
                          <img
                            src={qrCodeUrl}
                            alt="UPI QR Code"
                            className="w-full h-full object-cover"
                            onLoad={() => setAppOpened(true)}
                          />
                        </div>
                        <div className="text-xs space-y-1">
                          <p className="text-dark-400">Scan → Pay ₹{price} → Come back here</p>
                          <p className="text-gold-400 font-mono text-[11px]">{COACH_UPI_ID}</p>
                        </div>
                        {/* Also show UPI deep link for mobile */}
                        <a
                          href={upiDeepLink}
                          onClick={() => setAppOpened(true)}
                          className="inline-flex items-center gap-1.5 text-xs text-dark-400 hover:text-gold-400 transition-colors border border-dark-700 rounded-lg px-3 py-1.5"
                        >
                          <MdOutlineQrCode2 size={14} /> Open in UPI App <FiExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Ref number */}
                  <div className="flex items-center justify-between text-xs text-dark-600 px-1">
                    <span>Transaction Ref</span>
                    <span className="font-mono text-dark-400">{txRef}</span>
                  </div>

                  {/* Confirm button — shows after app is opened */}
                  <AnimatePresence>
                    {(appOpened || payMethod === 'qr') && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <button
                          onClick={handleConfirmPaid}
                          disabled={paying}
                          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {paying
                            ? <><div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />Confirming…</>
                            : <><FiCheckCircle size={16} />I've Completed Payment</>}
                        </button>
                        <p className="text-center text-[10px] text-dark-600 mt-2">
                          Tap only after payment is done in the app
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hint if app not opened yet */}
                  {!appOpened && payMethod !== 'qr' && (
                    <p className="text-center text-xs text-dark-500">
                      👆 Tap the button above to open your payment app
                    </p>
                  )}
                </motion.div>
              )}

              {/* ─── SUCCESS ─────────────────────────────────────────────────── */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="card text-center space-y-5 py-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto"
                  >
                    <FiCheckCircle size={38} className="text-green-400" />
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">Booking Confirmed! 🎉</h2>
                    <p className="text-dark-400 text-sm mt-2">Payment received. Your session is confirmed with Coach Gnaneswar.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-dark-900 border border-white/5 text-sm text-left space-y-2">
                    <div className="flex justify-between text-dark-300">
                      <span>Session</span><span className="text-white">{SESSION_LABELS[sessionType]}</span>
                    </div>
                    <div className="flex justify-between text-dark-300">
                      <span>Date</span><span className="text-white">{pendingApt?.appointment_date}</span>
                    </div>
                    <div className="flex justify-between text-dark-300">
                      <span>Amount Paid</span><span className="text-green-400 font-bold">₹{price}</span>
                    </div>
                    <div className="flex justify-between text-dark-300 border-t border-white/5 pt-2">
                      <span>Ref #</span><span className="font-mono text-gold-400 text-xs">{txRef}</span>
                    </div>
                  </div>
                  <button onClick={handleReset} className="btn-primary w-full">Book Another Session</button>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>

          {/* ── RIGHT: Appointments List ── */}
          <motion.div variants={fadeIn} className="xl:col-span-2 space-y-6">

            {/* Upcoming */}
            <div className="card">
              <h2 className="text-lg font-serif font-bold text-white mb-4">
                Upcoming Sessions <span className="text-dark-500 text-sm font-sans">({upcoming.length})</span>
              </h2>
              {loadingApts ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-10 text-dark-500">
                  <FiCalendar size={28} className="mx-auto mb-2 text-dark-700" />
                  <p className="text-sm">No upcoming sessions — book one now!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(apt => (
                    <div key={apt.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-800 hover:border-gold-500/20 transition-all">
                      <div className="w-14 h-14 rounded-xl bg-gold-500/10 flex flex-col items-center justify-center flex-shrink-0 border border-gold-500/15">
                        <span className="text-lg font-bold text-gold-400 leading-none">
                          {new Date(apt.appointment_date).getDate()}
                        </span>
                        <span className="text-[10px] text-dark-400">
                          {new Date(apt.appointment_date).toLocaleString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm capitalize">
                          {SESSION_LABELS[apt.appointment_type] || apt.appointment_type}
                        </h3>
                        <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                          <FiClock size={11} />
                          {apt.start_time?.slice(0,5)} – {apt.end_time?.slice(0,5)} · Coach Gnaneswar
                        </p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_STYLES[apt.status] || STATUS_STYLES.pending}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-serif font-bold text-white mb-4">
                  Past Sessions <span className="text-dark-500 text-sm font-sans">({past.length})</span>
                </h2>
                <div className="space-y-2.5">
                  {past.slice(0, 5).map(apt => (
                    <div key={apt.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-dark-900/30 opacity-70 hover:opacity-100 transition-opacity border border-dark-800/40">
                      <div className="w-11 h-11 rounded-xl bg-dark-800 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-dark-300 leading-none">
                          {new Date(apt.appointment_date).getDate()}
                        </span>
                        <span className="text-[9px] text-dark-500">
                          {new Date(apt.appointment_date).toLocaleString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-dark-300 text-sm capitalize">
                          {SESSION_LABELS[apt.appointment_type] || apt.appointment_type}
                        </h3>
                        <p className="text-xs text-dark-500 flex items-center gap-1">
                          <FiClock size={11} /> {apt.start_time?.slice(0,5)}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${STATUS_STYLES[apt.status] || STATUS_STYLES.completed}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
