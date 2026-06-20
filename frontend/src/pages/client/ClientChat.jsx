import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiSend, FiMessageSquare, FiLock, FiZap,
  FiCheckCircle, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { chatService, paymentService } from '../../services/api';

/* ─── Paywall Screen ─────────────────────────────── */
function PremiumPaywall() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full p-8 text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Lock icon with glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-gold-500/20 blur-2xl scale-150" />
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-gold-400/30 to-gold-700/20 border border-gold-500/30 flex items-center justify-center">
          <FiLock size={38} className="text-gold-400" />
        </div>
      </div>

      <h2 className="text-2xl font-serif font-bold text-white mb-3">
        Premium Members Only
      </h2>
      <p className="text-dark-400 max-w-md leading-relaxed mb-8">
        Direct messaging with <span className="text-gold-400 font-semibold">Coach Gnaneswar</span> is
        exclusively available to paid plan members. Upgrade your plan to unlock personalised coaching,
        direct chat access, and priority support.
      </p>

      {/* Feature list */}
      <ul className="space-y-3 mb-10 text-left w-full max-w-xs">
        {[
          'Direct 1-on-1 chat with Coach Gnaneswar',
          'Personalised workout & diet feedback',
          'Priority response within 24 hours',
          'Access to exclusive coaching content',
        ].map((feat) => (
          <li key={feat} className="flex items-center gap-3 text-sm text-dark-300">
            <FiCheckCircle className="text-gold-400 flex-shrink-0" size={16} />
            {feat}
          </li>
        ))}
      </ul>

      <Link
        to="/dashboard/subscription"
        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-dark-950 font-bold text-sm shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 transition-all duration-200"
      >
        <FiZap size={16} />
        Upgrade to Premium
      </Link>

      <p className="text-dark-600 text-xs mt-5">
        Already paid? Your subscription may still be processing — please wait a moment and refresh.
      </p>
    </motion.div>
  );
}

/* ─── Main Chat Component ─────────────────────────── */
export default function ClientChat() {
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [error, setError] = useState(null);

  const adminId = 1; // Coach Gnaneswar

  /* ── Check subscription on mount ── */
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const res = await paymentService.getMySubscription();
        const sub = res.data?.data?.subscription;
        const isActive = sub && sub.status === 'active';
        setIsPaid(isActive);
        if (isActive) {
          await fetchChatHistory();
        }
      } catch (err) {
        // If 404 / no subscription → free user
        setIsPaid(false);
      } finally {
        setCheckingAccess(false);
        setLoading(false);
      }
    };
    checkSubscription();
  }, []);

  /* ── Fetch chat history ── */
  const fetchChatHistory = async () => {
    try {
      const res = await chatService.getChatHistory(adminId);
      if (res.data.success) {
        setMessages(res.data.data || []);
        await chatService.markAsRead(adminId);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
    }
  };

  /* ── Silent background refresh every 7s ── */
  useEffect(() => {
    if (!isPaid) return;
    const interval = setInterval(async () => {
      try {
        const res = await chatService.getChatHistory(adminId);
        if (res.data.success) setMessages(res.data.data || []);
      } catch (_) {}
    }, 7000);
    return () => clearInterval(interval);
  }, [isPaid]);

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send message ── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setError(null);

    try {
      setSending(true);
      const res = await chatService.sendMessage({
        receiver_id: adminId,
        message: inputText.trim(),
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setInputText('');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        // Subscription expired mid-session
        setIsPaid(false);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
    }
  };

  /* ── Loading / access check screen ── */
  if (checkingAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[82vh] gap-4 text-dark-400">
        <FiLoader className="animate-spin" size={28} />
        <p className="text-sm">Checking your access...</p>
      </div>
    );
  }

  /* ── Paywall for free users ── */
  if (!isPaid) {
    return (
      <>
        <Helmet><title>Chat with Coach | Gnaneswar Fitness Platform</title></Helmet>
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto h-[82vh] flex flex-col">
          <div className="flex-1 card bg-dark-900/80 border border-gold-500/10 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
            <PremiumPaywall />
          </div>
        </div>
      </>
    );
  }

  /* ── Full chat UI for paid members ── */
  return (
    <>
      <Helmet><title>Chat with Coach | Gnaneswar Fitness Platform</title></Helmet>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto h-[82vh] flex flex-col">

        {/* Chat Header */}
        <div className="card bg-dark-900 border border-white/5 p-4 rounded-b-none flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 font-bold text-sm shadow-lg shadow-gold-500/20">
                G
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-dark-900" />
            </div>
            <div>
              <h2 className="text-md font-serif font-bold text-white">Coach Gnaneswar</h2>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20">
            <FiZap size={12} className="text-gold-400" />
            <span className="text-[11px] text-gold-400 font-semibold">Premium Member</span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 card bg-dark-900/50 border-x border-white/5 rounded-none overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center text-dark-500 py-10 flex items-center justify-center gap-3">
              <FiLoader className="animate-spin" size={20} />
              <span>Connecting to coach's portal...</span>
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-dark-600 py-16 flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mb-2">
                <FiMessageSquare size={28} className="text-gold-500/50" />
              </div>
              <p className="text-sm font-semibold text-white">Start your fitness conversation!</p>
              <p className="text-xs text-dark-500 max-w-xs leading-relaxed">
                Send a message to Coach Gnaneswar about your goals, diet queries, or routine adjustments. He typically responds within 24 hours.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isSelf = msg.sender_id !== adminId;
                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isSelf && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 font-bold text-xs mr-2 flex-shrink-0 mt-1">
                        G
                      </div>
                    )}
                    <div className={`max-w-[72%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isSelf
                        ? 'bg-gold-500 text-dark-950 font-semibold rounded-tr-none shadow-md shadow-gold-500/10'
                        : 'bg-dark-800 text-white rounded-tl-none border border-white/5'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[9px] mt-1.5 block text-right ${isSelf ? 'text-dark-800' : 'text-dark-500'}`}>
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error bar */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border-x border-red-500/20 text-red-400 text-sm"
            >
              <FiAlertCircle size={16} />
              {error}
              <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Input */}
        <div className="card bg-dark-900 border border-white/5 p-4 rounded-t-none flex-shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Coach Gnaneswar a question or send updates..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input-field flex-1"
              required
            />
            <button
              type="submit"
              disabled={sending || !inputText.trim()}
              className="p-3.5 rounded-xl bg-gold-500 text-dark-950 hover:bg-gold-400 font-bold transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {sending ? <FiLoader className="animate-spin" size={18} /> : <FiSend size={18} />}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
