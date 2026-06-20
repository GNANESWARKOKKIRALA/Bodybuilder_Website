import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaPlay,
  FaQuoteLeft,
  FaStar,
  FaTrophy,
  FaUsers,
  FaHeartbeat,
  FaWeight,
  FaCheckCircle,
} from 'react-icons/fa';
import { GiMuscleUp, GiWeightLiftingUp } from 'react-icons/gi';
import { BiTimer } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const stories = [
  {
    name: 'Rahul Mehta',
    age: 28,
    occupation: 'Software Engineer',
    duration: '16 Weeks',
    weightLost: '22 kg',
    muscleGained: '4 kg lean mass',
    stats: { before: '98 kg', after: '76 kg', bodyFat: '32% → 15%' },
    goals: ['Lose 20+ kg of body fat', 'Build functional strength', 'Reverse pre-diabetic markers', 'Run a 5K without stopping'],
    summary: 'Rahul was a desk-bound software engineer who spent 12+ hours a day coding and surviving on fast food. At 98 kg with pre-diabetic blood markers, his doctor gave him a wake-up call. That\'s when he found GFP.',
    quote: 'I walked into this programme thinking I just needed to lose weight. I walked out a completely different human being. My energy, confidence, relationships — everything improved. Gnaneswar didn\'t just transform my body; he transformed my entire life. My doctor couldn\'t believe my blood work results at the 3-month mark.',
  },
  {
    name: 'Priya Sharma',
    age: 25,
    occupation: 'Marketing Manager',
    duration: '12 Weeks',
    weightLost: '0 kg (recomp)',
    muscleGained: '8 kg lean mass',
    stats: { before: '52 kg', after: '60 kg', bodyFat: '28% → 18%' },
    goals: ['Build lean muscle as a woman', 'Learn proper lifting form', 'Improve confidence', 'Compete in first powerlifting meet'],
    summary: 'Priya was tired of being told that women shouldn\'t lift heavy. She wanted to build a strong, athletic physique but was overwhelmed by conflicting advice online. GFP gave her the structure and confidence she needed.',
    quote: 'Before GFP, I was doing hours of cardio and eating 1,200 calories. No wonder I was exhausted and making zero progress. Gnaneswar taught me that lifting heavy won\'t make me "bulky" — it made me powerful. I deadlifted 100 kg at my first powerlifting meet and I\'ve never felt more feminine or confident.',
  },
  {
    name: 'Arjun Krishnan',
    age: 34,
    occupation: 'Business Owner',
    duration: '20 Weeks',
    weightLost: '30 kg',
    muscleGained: '5 kg lean mass',
    stats: { before: '112 kg', after: '82 kg', bodyFat: '38% → 16%' },
    goals: ['Lose 30+ kg', 'Reverse sleep apnea', 'Fit into old clothes', 'Set an example for his kids'],
    summary: 'At 112 kg with severe sleep apnea and joint pain, Arjun was heading toward a health crisis. His kids didn\'t want to play with him anymore because he couldn\'t keep up. That was his breaking point.',
    quote: 'My kids call me "Super Dad" now. I can play cricket with them for hours. My sleep apnea is gone. My blood pressure is normal. I fit into clothes from 2015. But you know what the best part is? My son told his friends his dad is the strongest person he knows. That\'s worth more than any number on the scale.',
  },
  {
    name: 'Deepak Verma',
    age: 26,
    occupation: 'Fitness Enthusiast → Competitor',
    duration: '14 Weeks',
    weightLost: '10 kg (contest prep)',
    muscleGained: 'Maintained all muscle',
    stats: { before: '85 kg (off-season)', after: '75 kg (stage)', bodyFat: '14% → 5%' },
    goals: ['Win state-level championship', 'Perfect peak week execution', 'Build a career in fitness', 'Inspire others to compete'],
    summary: 'Deepak had been training for years but couldn\'t crack the code of contest prep. Two failed preps with other coaches left him frustrated and depleted. His final attempt with GFP changed everything.',
    quote: 'Two previous preps went horribly wrong — I came in flat, depleted, and demoralized. With Gnaneswar, every detail was dialed in. The peak week protocol was surgical. I stepped on stage looking the best I\'ve ever looked and won first place in my weight class at the state championships. I cried on stage. This man knows what he\'s doing.',
  },
];

const videoTestimonials = [
  { name: 'Vikram R.', title: 'Lost 18 kg in 4 months', duration: '4:32' },
  { name: 'Sneha P.', title: 'From cardio bunny to powerlifter', duration: '5:17' },
  { name: 'Karthik N.', title: 'First place at state championships', duration: '6:45' },
];

const highlights = [
  { icon: FaWeight, value: '2,500+', label: 'Total kg Lost by Clients' },
  { icon: FaUsers, value: '500+', label: 'Lives Transformed' },
  { icon: FaTrophy, value: '15+', label: 'Competition Wins' },
  { icon: FaHeartbeat, value: '100%', label: 'Client Satisfaction' },
];

export default function SuccessStoriesPage() {
  return (
    <>
      <Helmet>
        <title>Success Stories — Detailed Client Journeys | GFP</title>
        <meta name="description" content="Read detailed success stories from Gnaneswar Fitness Platform clients. Real transformations, real people, real results. Get inspired and start your journey." />
        <link rel="canonical" href="https://gnaneswarfitness.com/success-stories" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Real People, Real Results</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Success <span className="text-gradient-gold">Stories</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto">
              Every story here is a testament to what's possible when expert coaching meets unwavering determination. These are real journeys, told in their own words.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ STORIES ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <div className="space-y-20">
            {stories.map((story, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={stagger}
                className={`grid lg:grid-cols-2 gap-10 items-start ${i % 2 !== 0 ? 'lg:direction-rtl' : ''}`}
              >
                {/* image area */}
                <motion.div variants={fadeUp} className={`${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
                  <div className="card overflow-hidden p-0">
                    {/* before/after */}
                    <div className="grid grid-cols-2">
                      <div className="aspect-square bg-gradient-to-br from-dark-800 to-dark-900 flex flex-col items-center justify-center border-r border-gold-500/10">
                        <GiWeightLiftingUp className="text-5xl text-gold-500/25 mb-2" />
                        <span className="text-xs text-dark-500 uppercase tracking-wider">Before</span>
                        <span className="text-dark-400 text-sm font-bold mt-1">{story.stats.before}</span>
                      </div>
                      <div className="aspect-square bg-gradient-to-br from-gold-900/20 to-dark-900 flex flex-col items-center justify-center">
                        <GiMuscleUp className="text-5xl text-gold-400/40 mb-2" />
                        <span className="text-xs text-gold-400/60 uppercase tracking-wider">After</span>
                        <span className="text-gold-400/80 text-sm font-bold mt-1">{story.stats.after}</span>
                      </div>
                    </div>
                    {/* stats bar */}
                    <div className="grid grid-cols-3 divide-x divide-dark-800 bg-dark-900/50 p-4">
                      <div className="text-center">
                        <div className="text-gold-400 font-bold text-lg">{story.weightLost}</div>
                        <div className="text-dark-500 text-[10px] uppercase tracking-wider">Lost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gold-400 font-bold text-lg">{story.muscleGained}</div>
                        <div className="text-dark-500 text-[10px] uppercase tracking-wider">Gained</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gold-400 font-bold text-lg">{story.duration}</div>
                        <div className="text-dark-500 text-[10px] uppercase tracking-wider">Duration</div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* content */}
                <motion.div variants={fadeUp} className={`${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
                  <div className="mb-4">
                    <h2 className="font-serif text-3xl font-bold mb-1">{story.name}, <span className="text-gold-400">{story.age}</span></h2>
                    <p className="text-dark-400 text-sm">{story.occupation}</p>
                  </div>

                  <p className="text-dark-300 leading-relaxed mb-6">{story.summary}</p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">Goals Achieved</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {story.goals.map((g, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-dark-200">
                          <FaCheckCircle className="text-gold-500 flex-shrink-0 text-xs" /> {g}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card p-6 relative">
                    <FaQuoteLeft className="text-gold-500/20 text-3xl absolute top-4 right-4" />
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => <FaStar key={j} className="text-gold-400 text-xs" />)}
                    </div>
                    <p className="text-dark-200 text-sm italic leading-relaxed relative z-10">"{story.quote}"</p>
                    <p className="text-gold-400 text-xs font-semibold mt-3">— {story.name}</p>
                  </div>

                  <div className="mt-4 text-xs text-dark-500">
                    Body fat: {story.stats.bodyFat}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ VIDEO TESTIMONIALS ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Hear It From Them</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">
              Video <span className="text-gradient-gold">Testimonials</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {videoTestimonials.map((v, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card overflow-hidden group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-950 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-gold-500/30">
                    <FaPlay className="text-dark-950 text-lg ml-1" />
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-dark-950/80 text-xs text-dark-300">{v.duration}</span>
                </div>
                <div className="p-5">
                  <h3 className="font-serif font-semibold text-lg mb-1">{v.name}</h3>
                  <p className="text-dark-400 text-sm">{v.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ ACHIEVEMENT HIGHLIGHTS ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
          >
            {highlights.map((h, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card p-6 text-center">
                <h.icon className="text-gold-400 text-2xl mx-auto mb-3" />
                <div className="font-serif text-3xl md:text-4xl font-bold text-gradient-gold mb-1">{h.value}</div>
                <p className="text-dark-400 text-xs tracking-widest uppercase">{h.label}</p>
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
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Write Your Own <span className="text-gradient-gold">Success Story</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8 text-lg">
              You've read their stories. You've seen their results. Now imagine yourself here — 12 weeks from today, transformed and unstoppable.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary text-lg px-8 py-4">
                Start Your Story <FaArrowRight className="ml-1" />
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
