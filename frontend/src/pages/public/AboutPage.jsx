import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaDumbbell,
  FaTrophy,
  FaArrowRight,
  FaQuoteLeft,
} from 'react-icons/fa';
import { GiMuscleUp, GiBrain, GiMeal } from 'react-icons/gi';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.15 } } };

const timeline = [
  { year: '2022', title: 'Started Fitness & Bodybuilding', desc: 'What began as a personal quest to build strength and confidence became a lifelong dedication to human performance.', icon: FaDumbbell },
  { year: '2023', title: 'Gym Coaching & Competing', desc: 'Began working with clients on the gym floor and stepped on stage to compete, learning what it takes to guide others.', icon: FaTrophy },
  { year: '2024', title: 'GFP Platform Launch & 20+ Clients', desc: 'Launched the Gnaneswar Fitness Platform to provide remote coaching, successfully helping over 20 clients achieve major transformations.', icon: HiLightningBolt },
  { year: '2025', title: 'Advanced Coaching Systems', desc: 'Scaled coaching services to support clients nationwide, developing deep training protocols and advanced bio-tracking.', icon: GiMuscleUp },
  { year: '2026', title: 'Present: Full Digital Ecosystem', desc: 'Expanded GFP into a modern, integrated web platform providing workouts, diet, and booking ecosystems to maximize client results.', icon: HiSparkles },
];

const pillars = [
  { icon: GiMuscleUp, title: 'Science-Based Training', desc: 'Every programme is rooted in exercise physiology, biomechanics, and progressive overload principles — not bro-science. We track, measure, and optimise every variable so your body has no choice but to adapt.' },
  { icon: GiMeal, title: 'Personalised Nutrition', desc: 'Cookie-cutter meal plans are dead. We engineer your nutrition around your metabolism, preferences, allergies, and lifestyle. You\'ll eat foods you love while hitting your macros with precision.' },
  { icon: GiBrain, title: 'Mental Fortitude', desc: 'The biggest muscle you\'ll build is between your ears. We instil discipline, resilience, and the champion mindset that turns good athletes into great ones — and transforms ordinary people into extraordinary versions of themselves.' },
];

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Gnaneswar — Coach, Competitor, Transformer | GFP</title>
        <meta name="description" content="Meet Gnaneswar — fitness coach, competitor, and the driving force behind 20+ life-changing body transformations. Discover his story." />
        <link rel="canonical" href="https://gnaneswarfitness.com/about" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_60%)]" />

        <div className="container-custom relative z-10 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* text */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <HiSparkles className="text-gold-400" />
                <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">The Man Behind the Method</span>
              </motion.span>
              <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl font-bold mb-6">
                Meet <span className="text-gradient-gold">Gnaneswar</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-dark-300 text-lg leading-relaxed mb-4">
                In 2022, I started my fitness and bodybuilding journey as a personal quest to build strength and confidence.
                Today, I'm a dedicated competitor and coach who has transformed
                20+ lives across India and beyond.
              </motion.p>
              <motion.p variants={fadeUp} className="text-dark-400 leading-relaxed mb-8">
                My mission is simple: make world-class fitness coaching accessible to everyone.
                No gatekeeping. No shortcuts. Just proven systems, relentless accountability,
                and an unwavering belief that every single person has a champion inside them.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link to="/services" className="btn-primary">
                  Train With Me <FaArrowRight className="ml-1" />
                </Link>
              </motion.div>
            </motion.div>

            {/* coach photo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative p-2 rounded-full border-2 border-gold-500/20 bg-dark-900/50 backdrop-blur-sm gold-glow w-72 h-72 sm:w-96 sm:h-96">
                <img 
                  src="/coach_portrait.jpg" 
                  alt="Coach Gnaneswar" 
                  className="w-full h-full rounded-full border border-gold-500/30 object-cover shadow-2xl"
                />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)] pointer-events-none" />
              </div>
              {/* floating badge */}
              <div className="absolute -bottom-2 left-0 sm:left-8 glass rounded-xl px-5 py-3 flex items-center gap-3 shadow-xl z-20">
                <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center shadow-lg">
                  <FaTrophy className="text-dark-950" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">20+</div>
                  <div className="text-dark-400 text-xs font-semibold">Lives Changed</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ TIMELINE ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">My Story</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              The <span className="text-gradient-gold">Journey</span>
            </motion.h2>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gold-500/20 -translate-x-1/2" />

            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp} custom={i}
                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:text-${i % 2 === 0 ? 'right' : 'left'}`}
              >
                {/* dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full gradient-gold flex items-center justify-center z-10 shadow-lg shadow-gold-500/20">
                  <item.icon className="text-dark-950 text-lg" />
                </div>

                {/* card */}
                <div className={`ml-20 md:ml-0 md:w-[calc(50%-3rem)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} card p-6`}>
                  <span className="text-gold-400 font-bold text-sm tracking-wider">{item.year}</span>
                  <h3 className="font-serif text-xl font-semibold mt-1 mb-2">{item.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PHILOSOPHY ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-16"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">My Approach</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl md:text-5xl font-bold mt-3 mb-4">
              Three <span className="text-gradient-gold">Pillars</span> of Transformation
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto text-lg">
              Great physiques aren't built on one dimension. My methodology integrates three non-negotiable pillars.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {pillars.map((p, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card p-8 text-center group">
                <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <p.icon className="text-dark-950 text-3xl" />
                </div>
                <h3 className="font-serif text-2xl font-semibold mb-4">{p.title}</h3>
                <p className="text-dark-300 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ═══════ CTA ═══════ */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_60%)]" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <FaQuoteLeft className="text-gold-500/30 text-4xl mx-auto mb-6" />
            </motion.div>
            <motion.blockquote variants={fadeUp} className="font-serif text-2xl md:text-3xl font-medium leading-relaxed mb-8 text-dark-100">
              "The only bad workout is the one that didn't happen. But a <span className="text-gradient-gold">great</span> workout? That's one designed by someone who knows exactly what your body needs."
            </motion.blockquote>
            <motion.p variants={fadeUp} className="text-gold-400 font-semibold mb-10">— Gnaneswar</motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary text-lg px-8 py-4">
                Start Training Today <FaArrowRight className="ml-1" />
              </Link>
              <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
                Book a Free Consultation
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
