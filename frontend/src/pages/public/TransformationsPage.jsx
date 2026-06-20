import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaSearch,
  FaStar,
  FaQuoteLeft,
} from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { BiTimer } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const coachTransformations = [
  {
    id: 'front',
    title: 'Front Double Bicep Pose',
    category: 'Body Recomposition & Muscle Gain',
    duration: '4 Years (2022 – 2026)',
    weightBefore: '62 kg',
    weightAfter: '70 kg',
    weightChange: '+8 kg',
    desc: 'Demonstrates significant muscle mass gain and structural rebuilding. Over 4 years of dedicated tracking, this collage displays lat V-taper development, cap arm thickness, and classic proportions.',
    image: '/coach_transform_front.jpg',
    isCollage: true
  },
  {
    id: 'back',
    title: 'Back Double Bicep Pose',
    category: 'Posterior Chain Hypertrophy',
    duration: '4 Years (2022 – 2026)',
    weightBefore: 'Undefined',
    weightAfter: 'Highly Defined',
    weightChange: 'Muscle Mass Gain',
    desc: 'Demonstrates deep muscle definition in lats, rhomboids, traps, and rear delts. Built utilizing high-volume progressive overload pulling protocols.',
    image: '/coach_transform_back.jpg',
    isCollage: false
  },
  {
    id: 'side',
    title: 'Side Athletic Profile',
    category: 'Structural Proportions',
    duration: '4 Years (2022 – 2026)',
    weightBefore: 'Flat Shape',
    weightAfter: 'Full Muscle Curvature',
    weightChange: 'Tricep & Bicep Density',
    desc: 'Highlights side chest depth, deltoid roundness, and triceps thickness. Focused on creating complete classic dimensional conditioning.',
    image: '/coach_transform_side.jpg',
    isCollage: false
  },
  {
    id: 'full',
    title: 'Full Body Peak Conditioning',
    category: 'Full Body Classic Aesthetics',
    duration: '4 Years (2022 – 2026)',
    weightBefore: 'Soft Body',
    weightAfter: 'Classic Proportions',
    weightChange: 'Quad & Abs Separation',
    desc: 'A full-body posing shot highlighting overall leg sweep, quad separation, core tight vacuum, and classic classical proportions in standard gym lighting.',
    image: '/coach_transform_full.jpg',
    isCollage: false
  }
];

export default function TransformationsPage() {
  return (
    <>
      <Helmet>
        <title>Self Transformations — Coach Gnaneswar | GFP</title>
        <meta name="description" content="View the personal transformation proofs of Coach Gnaneswar. Real photos, real metrics, showing the power of science-backed coaching." />
        <link rel="canonical" href="https://gnaneswarfitness.com/transformations" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Walk the Talk</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              My Personal <span className="text-gradient-gold">Proofs</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto leading-relaxed">
              I believe a coach must first demonstrate results personally. Below is the documentation of my physical transformation journey, displaying my progress across different bodybuilding poses.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ GALLERY SECTION ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          {/* Main Transformation Highlights */}
          <div className="space-y-16 max-w-6xl mx-auto">
            {coachTransformations.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`grid lg:grid-cols-12 gap-8 items-center ${
                  i % 2 !== 0 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Photo Frame Container */}
                <div className={`lg:col-span-7 card p-2 bg-dark-900/40 border border-gold-500/15 overflow-hidden group hover:border-gold-500/35 transition-all duration-500 rounded-2xl ${
                  i % 2 !== 0 ? 'lg:order-2' : ''
                }`}>
                  <div className="relative overflow-hidden rounded-xl bg-dark-950 flex items-center justify-center">
                    <img
                      src={t.image}
                      alt={t.title}
                      className="w-full h-auto max-h-[600px] object-contain transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950/40 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Before/After Overlay Badges */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-dark-950/90 border border-white/10 text-dark-300 text-xs font-bold uppercase tracking-wider">
                      {t.isCollage ? 'Before: 2022' : 'Pose Focus'}
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-gold-500 border border-gold-400 text-dark-950 text-xs font-bold uppercase tracking-wider">
                      {t.isCollage ? 'After: 2026' : 'Aesthetics Proof'}
                    </div>
                  </div>
                </div>

                {/* Details Content Container */}
                <div className={`lg:col-span-5 space-y-5 ${
                  i % 2 !== 0 ? 'lg:order-1' : ''
                }`}>
                  <div className="space-y-2">
                    <span className="text-gold-400 text-xs uppercase tracking-widest font-bold">
                      {t.category}
                    </span>
                    <h2 className="font-serif text-3xl font-bold text-white">{t.title}</h2>
                  </div>

                  <p className="text-dark-300 text-sm leading-relaxed">
                    {t.desc}
                  </p>

                  {/* Transformation Specs Grid */}
                  <div className="grid grid-cols-3 gap-3 border-t border-b border-white/5 py-4">
                    <div className="text-center">
                      <span className="text-[10px] text-dark-500 uppercase tracking-wider block">Before</span>
                      <span className="text-sm font-semibold text-white mt-1 block">{t.weightBefore}</span>
                    </div>
                    <div className="text-center border-l border-r border-white/5">
                      <span className="text-[10px] text-dark-500 uppercase tracking-wider block">After</span>
                      <span className="text-sm font-semibold text-gold-400 mt-1 block">{t.weightAfter}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-dark-500 uppercase tracking-wider block">Difference</span>
                      <span className="text-sm font-semibold text-gold-400 mt-1 block">{t.weightChange}</span>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 text-xs text-dark-400">
                    <BiTimer className="text-gold-500 text-sm" />
                    <span>Duration: {t.duration} of systematic tracking</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Your Transformation <span className="text-gradient-gold">Starts Here</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8 text-lg">
              You've seen the proof. You've seen the commitment. Now it's time to build your own legacy.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary text-lg px-8 py-4">
                Start Your Transformation <FaArrowRight className="ml-1" />
              </Link>
              <Link to="/contact" className="btn-secondary text-lg px-8 py-4">
                Book Free Consultation
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
