import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaDumbbell,
  FaHeartbeat,
  FaTrophy,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaCheckCircle,
  FaPlay,
  FaBolt,
  FaCrown,
  FaChevronRight,
} from 'react-icons/fa';
import {
  GiMuscleUp,
  GiWeightLiftingUp,
  GiMeal,
  GiPodiumWinner,
} from 'react-icons/gi';
import { HiSparkles, HiMail } from 'react-icons/hi';
import { BiTimer } from 'react-icons/bi';
import { galleryService } from '../../services/api';

/* ──────────── animation variants ──────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

/* ──────────── animated counter ──────────── */
function useCounter(end, duration = 2000, startCounting) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, startCounting]);
  return count;
}

function StatCounter({ icon: Icon, end, suffix = '', label }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.4 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCounter(end, 2000, inView);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="text-center p-6"
    >
      <Icon className="text-gold-400 text-3xl mx-auto mb-3" />
      <div className="font-serif text-4xl md:text-5xl font-bold text-gradient-gold mb-1">
        {count}{suffix}
      </div>
      <p className="text-dark-300 text-sm tracking-widest uppercase">{label}</p>
    </motion.div>
  );
}

/* ──────────── main component ──────────── */
export default function HomePage() {
  const [email, setEmail] = useState('');
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await galleryService.getTestimonials({ featured: true });
        if (res.data.success) {
          setTestimonials(res.data.data.testimonials || []);
        }
      } catch (err) {
        console.error("Error loading testimonials:", err);
      }
    };
    loadTestimonials();
  }, []);

  const services = [
    { icon: GiMuscleUp, title: 'Personal Training', desc: 'One-on-one sessions crafted around your unique body type, goals, and lifestyle. Every rep counts when it\'s designed just for you.' },
    { icon: GiWeightLiftingUp, title: 'Online Coaching', desc: 'World-class programming delivered to your phone. Weekly check-ins, video analysis, and real-time plan adjustments wherever you are.' },
    { icon: GiMeal, title: 'Nutrition Plans', desc: 'Science-backed meal plans that fuel performance without sacrificing taste. Macro-optimized for your exact metabolic needs.' },
    { icon: GiPodiumWinner, title: 'Competition Prep', desc: 'Stage-ready physique in 12–16 weeks. Peak week protocols, posing coaching, and mental prep from a seasoned competitor.' },
  ];

  const pricingTiers = [
    { name: 'Starter', price: '999', features: ['Basic workout plan', 'Email support', 'Progress tracking', 'Community access'], popular: false },
    { name: 'Premium', price: '2,999', features: ['Custom workout & nutrition', 'Weekly check-ins', 'Video consultations', 'Priority support', 'Everything in Starter'], popular: true },
    { name: 'Elite', price: '4,999', features: ['Daily coaching', 'Competition prep', '24/7 WhatsApp support', 'Monthly body-comp analysis', 'Everything in Premium'], popular: false },
  ];

  return (
    <>
      <Helmet>
        <title>Gnaneswar Fitness Platform — Transform Your Body. Transform Your Life.</title>
        <meta name="description" content="Premium fitness coaching by Gnaneswar. Personalised training, nutrition plans, and competition prep that delivers real, measurable results. 20+ clients transformed." />
        <meta name="keywords" content="personal training, fitness coaching, nutrition plans, body transformation, competition prep, online coaching India" />
        <link rel="canonical" href="https://gnaneswarfitness.com/" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* ── Base gradient ── */}
        <div className="absolute inset-0 gradient-hero" />

        {/* ── Animated grid ── */}
        <div className="absolute inset-0 hero-grid opacity-60" />

        {/* ── Scanline sweep ── */}
        <div className="scanline" />

        {/* ── Radial spotlight ── */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(212,175,55,0.06),transparent_70%)]" />

        {/* ── Bottom fade ── */}
        <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-dark-950 to-transparent" />

        {/* ── Large glowing orb top-right ── */}
        <motion.div
          className="absolute top-[-5%] right-[-8%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Small glowing orb bottom-left ── */}
        <motion.div
          className="absolute bottom-[10%] left-[-5%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* ── Orbiting rings ── */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] orbit-ring" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] orbit-ring-reverse" />

        {/* ── Diagonal accent lines ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-gold-500/10 to-transparent" />
          <div className="absolute top-0 right-[35%] w-px h-full bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />
          <div className="absolute top-0 left-[25%] w-px h-full bg-gradient-to-b from-transparent via-gold-500/5 to-transparent" />
        </div>

        {/* ── Floating corner badge ── */}
        <motion.div
          className="absolute top-28 right-6 md:right-16 hidden md:flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl neon-border flex flex-col items-center justify-center bg-dark-950/80 backdrop-blur-md"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-2xl font-bold text-gradient-gold font-serif">20+</span>
            <span className="text-[9px] text-dark-400 uppercase tracking-wider text-center leading-tight">Clients<br/>Transformed</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-28 left-6 md:left-16 hidden md:flex flex-col items-center gap-1.5"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl neon-border flex flex-col items-center justify-center bg-dark-950/80 backdrop-blur-md"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            <span className="text-2xl font-bold text-gradient-gold font-serif">4+</span>
            <span className="text-[9px] text-dark-400 uppercase tracking-wider text-center leading-tight">Years<br/>Experience</span>
          </motion.div>
        </motion.div>

        <div className="container-custom relative z-10 text-center px-4 pt-28 pb-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            {/* Pill badge */}
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8 border border-gold-500/20">
              <motion.span
                className="w-2 h-2 rounded-full bg-gold-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-widest uppercase font-medium">Premium Fitness Coaching</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
            >
              Transform Your Body.{' '}
              <span className="text-shine">Transform Your Life.</span>
            </motion.h1>

            {/* Sub text */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              Join 20+ clients who've achieved extraordinary physiques with India's most
              results-driven coaching platform. Science-based training. Personalised nutrition.
              Unmatched accountability.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/pricing"
                className="group btn-primary text-lg px-9 py-4 rounded-xl relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Journey <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-9 py-4 rounded-xl hover:scale-105 transition-transform">
                View Plans
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={fadeUp} custom={4} className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-dark-400">
              <span className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <FaCheckCircle className="text-gold-500" /> No lock-in contracts
              </span>
              <span className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <FaCheckCircle className="text-gold-500" /> 7-day money-back guarantee
              </span>
              <span className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <FaCheckCircle className="text-gold-500" /> Cancel anytime
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-[10px] text-dark-600 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-gold-500/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-gold-400 rounded-full"
              animate={{ opacity: [1, 0, 1], y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)]" />
        {/* top/bottom gold lines */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <motion.div
          className="container-custom relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gold-500/10">
            <StatCounter icon={FaUsers} end={20} suffix="+" label="Clients Transformed" />
            <StatCounter icon={BiTimer} end={4} suffix="+" label="Years Experience" />
            <StatCounter icon={FaTrophy} end={20} suffix="+" label="Transformations" />
            <StatCounter icon={FaHeartbeat} end={100} suffix="%" label="Dedication" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ SERVICES ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">What We Offer</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              Premium <span className="text-gradient-gold">Services</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto text-lg">
              Every service is meticulously designed to push your limits, optimise recovery, and deliver jaw-dropping results.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {services.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="gradient-border-card p-8 group relative overflow-hidden hover:-translate-y-2 transition-transform duration-300">
                {/* Card number */}
                <div className="absolute top-4 right-4 text-5xl font-serif font-bold text-white/[0.03] select-none">
                  0{i + 1}
                </div>
                {/* Radial hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.07),transparent_60%)]" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-6 shadow-lg shadow-gold-500/20 group-hover:shadow-gold-500/40 transition-shadow">
                    <s.icon className="text-dark-950 text-2xl" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed mb-5">{s.desc}</p>
                  <Link to="/services" className="text-gold-400 text-sm font-semibold inline-flex items-center gap-1 hover:gap-3 transition-all duration-200">
                    Learn More <FaChevronRight className="text-xs" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ COACH'S PERSONAL TRANSFORMATION (WALK THE TALK) ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Walk the Talk</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              My Personal <span className="text-gradient-gold">Transformation</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto text-lg">
              I don't just coach fitness; I live it. Here is the physical proof of the science-backed training and nutrition systems I build for my clients.
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            {/* Left Column: Front Transformation Collage */}
            <motion.div 
              className="lg:col-span-6 card overflow-hidden p-0 border border-gold-500/20 group hover:border-gold-500/40 transition-all duration-500"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src="/coach_transform_front.jpg" 
                  alt="Coach Gnaneswar Front Transformation" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                
                {/* Labels overlay */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-dark-950/80 border border-white/10 text-dark-300 text-xs font-bold uppercase tracking-wider">
                  Before: 2022
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded bg-gold-500 border border-gold-400 text-dark-950 text-xs font-bold uppercase tracking-wider">
                  After: 2026
                </div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="px-3.5 py-1.5 rounded-full bg-dark-950/90 border border-gold-500/30 text-gold-400 text-sm font-bold uppercase tracking-wider">
                    Total Change: +8 kg &amp; Muscle Gain
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Text Stats and Back Pose */}
            <motion.div 
              className="lg:col-span-6 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="card p-6 md:p-8 space-y-6 border border-white/5">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Walk the Talk Journey</h3>
                  <p className="text-dark-300 text-sm leading-relaxed">
                    My transformation started in 2022 as a personal quest to master physical aesthetics. Over 4 years of relentless, systematic nutrition and training, I refined the exact techniques and mindset protocols I now deliver to my clients.
                  </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-3 gap-4 border-t border-b border-white/5 py-4">
                  <div className="text-center">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block">Started (2022)</span>
                    <span className="text-xl font-serif font-bold text-white mt-1 block">62 kg</span>
                  </div>
                  <div className="text-center border-l border-r border-white/5">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block">Present (2026)</span>
                    <span className="text-xl font-serif font-bold text-gold-400 mt-1 block">70 kg</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-dark-500 uppercase tracking-wider block">Dedication</span>
                    <span className="text-xl font-serif font-bold text-gold-400 mt-1 block">4 Years</span>
                  </div>
                </div>

                {/* Sub Poses Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/5 group">
                    <img 
                      src="/coach_transform_back.jpg" 
                      alt="Coach Gnaneswar Back Pose" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] text-gold-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-dark-950/80">
                      Back Definition
                    </span>
                  </div>
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-white/5 group">
                    <img 
                      src="/coach_transform_side.jpg" 
                      alt="Coach Gnaneswar Side Pose" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] text-gold-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-dark-950/80">
                      Side Profile
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center lg:text-left">
                <Link to="/transformations" className="btn-primary inline-flex items-center gap-2">
                  View Full Transformation Proofs <FaArrowRight className="text-sm" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Testimonials</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              What Our <span className="text-gradient-gold">Clients Say</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {testimonials.map((t, i) => (
              <motion.div key={t.id || i} variants={fadeUp} custom={i} className="card p-8 relative">
                <div className="absolute top-6 right-6 text-gold-500/20 text-5xl font-serif">"</div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating || 5)].map((_, j) => (
                    <FaStar key={j} className="text-gold-400 text-sm" />
                  ))}
                </div>
                <p className="text-dark-200 leading-relaxed mb-6 relative z-10">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-dark-950 font-bold text-sm">
                    {t.client_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.client_name}</div>
                    <div className="text-dark-400 text-xs">{t.program_name || 'VIP Client'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ PRICING PREVIEW ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Pricing</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              Invest in <span className="text-gradient-gold">Yourself</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto text-lg">
              Transparent pricing. No hidden fees. Every plan backed by our 7-day money-back guarantee.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className={`card p-8 relative ${tier.popular ? 'border-gold-500/40 gold-glow' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-gold rounded-full text-dark-950 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <h3 className="font-serif text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-gold-400 text-4xl font-bold">₹{tier.price}</span>
                  <span className="text-dark-400 text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-dark-200">
                      <FaCheckCircle className="text-gold-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/pricing"
                  className={tier.popular ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/pricing" className="text-gold-400 text-sm font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
              Compare all features <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════ NEWSLETTER ═══════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.06),transparent_60%)]" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6">
              <HiMail className="text-dark-950 text-2xl" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Get <span className="text-gradient-gold">Free</span> Training Tips
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8">
              Join 10,000+ fitness enthusiasts receiving weekly training insights, nutrition hacks, and exclusive content straight to your inbox.
            </motion.p>
            <motion.form
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary whitespace-nowrap px-6">
                Subscribe <FaArrowRight className="text-sm" />
              </button>
            </motion.form>
            <motion.p variants={fadeUp} className="text-dark-500 text-xs mt-4">
              No spam, ever. Unsubscribe anytime.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
