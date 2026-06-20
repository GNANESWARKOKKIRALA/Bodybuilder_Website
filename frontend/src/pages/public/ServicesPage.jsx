import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaDumbbell,
  FaLaptop,
  FaTrophy,
  FaAppleAlt,
  FaExchangeAlt,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaPhoneAlt,
  FaClipboardList,
  FaCogs,
  FaChartLine,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { GiMuscleUp } from 'react-icons/gi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const services = [
  {
    icon: FaDumbbell, title: '1:1 Personal Training',
    desc: 'Work directly with Gnaneswar in personalised sessions designed to maximise every minute. Real-time form corrections, motivational coaching, and periodised programming tailored exclusively to you.',
    features: ['Custom exercise selection', 'Real-time form correction', 'Progressive overload tracking', 'Flexible scheduling'],
    price: '₹4,999',
    gradient: 'from-gold-500/10 to-gold-800/5',
  },
  {
    icon: FaLaptop, title: 'Online Coaching',
    desc: 'Get the same elite-level coaching from anywhere in the world. Your custom programme, weekly video check-ins, and instant messaging support — all through our dedicated app.',
    features: ['Custom training programme', 'Weekly video check-ins', 'Form review via video', 'In-app messaging support'],
    price: '₹2,999',
    gradient: 'from-blue-500/10 to-blue-800/5',
  },
  {
    icon: FaTrophy, title: 'Competition Prep',
    desc: 'Stage-ready in 12–16 weeks. From off-season bulking to peak week manipulation, posing practice to mental preparation — this is the gold standard in contest prep.',
    features: ['12–16 week periodised plan', 'Peak week protocols', 'Posing coaching', 'Stage-day management'],
    price: '₹7,999',
    gradient: 'from-yellow-500/10 to-yellow-800/5',
  },
  {
    icon: FaAppleAlt, title: 'Custom Nutrition Plans',
    desc: 'Forget generic diets. We engineer your nutrition around your metabolism, food preferences, and daily schedule. Flexible dieting that gets results without misery.',
    features: ['Metabolic rate assessment', 'Macro-optimised meal plans', 'Supplement guidance', 'Weekly plan adjustments'],
    price: '₹1,999',
    gradient: 'from-green-500/10 to-green-800/5',
  },
  {
    icon: FaExchangeAlt, title: 'Body Transformation Programmes',
    desc: 'Our flagship 12-week transformation programme combines training, nutrition, and mindset coaching into one comprehensive system. This is where legends are made.',
    features: ['12-week structured programme', 'Training + nutrition combined', 'Weekly progress photos', 'Community support group'],
    price: '₹5,999',
    gradient: 'from-purple-500/10 to-purple-800/5',
  },
  {
    icon: FaBuilding, title: 'Corporate Wellness',
    desc: 'Boost your team\'s productivity, reduce sick days, and build a healthier company culture. Custom wellness programmes for businesses of all sizes.',
    features: ['On-site or virtual sessions', 'Nutrition workshops', 'Stress management', 'Team challenges & incentives'],
    price: 'Custom',
    gradient: 'from-red-500/10 to-red-800/5',
  },
];

const steps = [
  { icon: FaPhoneAlt, step: '01', title: 'Free Consultation', desc: 'We start with a no-obligation call to understand your goals, history, and lifestyle. No pressure — just clarity.' },
  { icon: FaClipboardList, step: '02', title: 'Comprehensive Assessment', desc: 'Body composition analysis, movement screening, nutrition audit, and goal benchmarking. We leave nothing to guesswork.' },
  { icon: FaCogs, step: '03', title: 'Custom Plan Creation', desc: 'Your personalised training and nutrition programme — built from scratch, calibrated to your exact needs and preferences.' },
  { icon: FaChartLine, step: '04', title: 'Track & Transform', desc: 'Execute the plan with ongoing support, weekly check-ins, and real-time adjustments. Watch your body transform week by week.' },
];

const faqs = [
  { q: 'How quickly will I see results?', a: 'Most clients notice visible changes within 4–6 weeks. Significant transformations typically occur between 12–16 weeks. Consistency is the key variable.' },
  { q: 'Do I need gym access for online coaching?', a: 'While gym access is ideal, we can design effective programmes for home workouts with minimal equipment. We adapt to your environment.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or change your plan at any time. We\'ll prorate the difference and seamlessly transition your programming.' },
  { q: 'What if I have injuries or medical conditions?', a: 'We work around all limitations. Gnaneswar holds certifications in corrective exercise and will design programmes that rehabilitate and strengthen simultaneously.' },
];

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Helmet>
        <title>Services — Personal Training, Online Coaching & More | GFP</title>
        <meta name="description" content="Explore Gnaneswar Fitness Platform's premium services: 1:1 personal training, online coaching, competition prep, custom nutrition plans, body transformation programmes, and corporate wellness." />
        <link rel="canonical" href="https://gnaneswarfitness.com/services" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Our Services</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Elite Coaching, <span className="text-gradient-gold">Tailored to You</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto">
              Every body is different. Every goal is unique. That's why every programme we create is built from the ground up — never templated, always personalised.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SERVICES GRID ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {services.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card p-8 group relative overflow-hidden flex flex-col">
                <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-14 h-14 rounded-xl gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <s.icon className="text-dark-950 text-2xl" />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1">
                    {s.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-dark-200">
                        <FaCheckCircle className="text-gold-500 text-xs flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-dark-800">
                    <span className="text-gold-400 text-lg font-bold">
                      {s.price}<span className="text-dark-400 text-sm font-normal">{s.price !== 'Custom' ? '/mo' : ''}</span>
                    </span>
                    <Link to="/contact" className="btn-primary text-sm px-4 py-2">
                      Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">The Process</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              How It <span className="text-gradient-gold">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto text-lg">
              From first call to first result — here's exactly what to expect when you join GFP.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {steps.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                )}
                <div className="w-20 h-20 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 relative">
                  <s.icon className="text-dark-950 text-2xl" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-dark-950 border-2 border-gold-500 text-gold-400 text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Questions?</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Frequently <span className="text-gradient-gold">Asked</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-sm pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-gold-400 flex-shrink-0"
                  >
                    <FaChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-dark-300 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_60%)]" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6">
              <GiMuscleUp className="text-dark-950 text-3xl" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient-gold">Get Started?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8 text-lg">
              Book a free consultation call and let's map out your transformation journey — zero obligation, 100% clarity.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Book Free Consultation <FaArrowRight className="ml-1" />
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
