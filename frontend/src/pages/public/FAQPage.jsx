import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaSearch,
  FaQuestionCircle,
  FaDumbbell,
  FaAppleAlt,
  FaCreditCard,
  FaLaptop,
  FaArrowRight,
  FaEnvelope,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { BiInfoCircle } from 'react-icons/bi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const faqCategories = [
  {
    name: 'General',
    icon: BiInfoCircle,
    faqs: [
      { q: 'What is Gnaneswar Fitness Platform?', a: 'GFP is a premium fitness coaching platform founded by Gnaneswar, an ISSA-certified personal trainer and national-level competitor. We offer personalised training programmes, nutrition plans, and holistic coaching to help you achieve your fitness goals — whether you\'re a beginner or a competitive athlete.' },
      { q: 'Who is GFP designed for?', a: 'Everyone. Whether you\'re a complete beginner looking to lose your first 10 kg, a busy professional wanting to build lean muscle, or a competitive bodybuilder preparing for stage — we have programmes tailored to every level and goal.' },
      { q: 'How is GFP different from other fitness platforms?', a: 'Three things set us apart: (1) Every programme is built from scratch — no templates, no cookie-cutter plans. (2) You work directly with Gnaneswar, not a junior trainer. (3) We focus on sustainable, science-based results, not quick fixes that don\'t last.' },
      { q: 'Do I need to be in Hyderabad to train with you?', a: 'Not at all. While we offer in-person training in Hyderabad, the majority of our clients train with us remotely through our online coaching programmes. We\'ve successfully coached clients from over 15 countries.' },
      { q: 'How do I get started?', a: 'Simple — book a free consultation call through our Contact page. We\'ll discuss your goals, assess your current situation, and recommend the best programme for you. No pressure, no obligations.' },
    ],
  },
  {
    name: 'Training',
    icon: FaDumbbell,
    faqs: [
      { q: 'How are workout programmes structured?', a: 'Every programme follows evidence-based periodisation models. We typically cycle through accumulation, intensification, and deload phases. Your programme will include exercise selection, rep and set schemes, rest intervals, tempo prescriptions, and progressive overload protocols.' },
      { q: 'How often should I work out?', a: 'This depends on your experience level, recovery capacity, and goals. Most clients train 4–5 days per week, but we design programmes for anywhere from 3 to 6 sessions per week. Quality always beats quantity.' },
      { q: 'Do I need gym access?', a: 'Gym access is ideal for maximum results, but we can design effective home workout programmes with minimal equipment (resistance bands, dumbbells, pull-up bar). We adapt to your environment.' },
      { q: 'Can you work around my injuries?', a: 'Absolutely. Gnaneswar is certified in corrective exercise and has extensive experience working with clients who have chronic injuries, post-surgical limitations, and mobility issues. Your safety is always the top priority.' },
      { q: 'How long until I see results?', a: 'Most clients notice improved energy and strength within 2 weeks. Visible body composition changes typically appear within 4–6 weeks. Dramatic transformations happen between 12–16 weeks. Consistency is the biggest factor.' },
      { q: 'Will I get a new programme every week?', a: 'No, and that\'s by design. Effective training requires consistent stimulus over time. Your programme will typically run for 4–6 weeks before we make strategic adjustments based on your progress data.' },
    ],
  },
  {
    name: 'Nutrition',
    icon: FaAppleAlt,
    faqs: [
      { q: 'Do I have to follow a strict diet?', a: 'No. We use a flexible dieting approach based on macronutrient targets. You choose the foods you enjoy — we just make sure the numbers add up. Sustainability and adherence are more important than perfection.' },
      { q: 'Will I receive a meal plan?', a: 'Yes. Premium and Elite members receive fully customised meal plans with recipes, portion sizes, and grocery lists. We also teach you how to build your own meals around your macros so you become self-sufficient.' },
      { q: 'Do you account for dietary restrictions?', a: 'Of course. Whether you\'re vegetarian, vegan, lactose intolerant, gluten-free, or have specific allergies — your nutrition plan will be built around your requirements. No restrictions are too complex.' },
      { q: 'Do I need supplements?', a: 'Supplements are never mandatory. We believe in a food-first approach. However, we may recommend evidence-based supplements (protein powder, creatine, vitamin D, etc.) if they fit your budget and goals.' },
      { q: 'How do you handle cheat meals?', a: 'We don\'t call them "cheat meals" — we call them "flexibility." Your plan has built-in room for social dining and occasional indulgences. The key is strategic planning, not deprivation.' },
    ],
  },
  {
    name: 'Pricing',
    icon: FaCreditCard,
    faqs: [
      { q: 'Are there any hidden fees?', a: 'Zero hidden fees. The price you see is the price you pay. No setup costs, no equipment requirements, no mandatory supplement purchases.' },
      { q: 'Can I change my plan?', a: 'Yes, you can upgrade or downgrade at any time. When upgrading, you pay only the prorated difference. Downgrades take effect at your next billing cycle.' },
      { q: 'Do you offer EMI options?', a: 'Yes, for annual plans we offer EMI through select payment providers. Contact us for details on available EMI options.' },
      { q: 'What\'s your refund policy?', a: 'We offer a 7-day money-back guarantee on all plans. If you\'re not satisfied within the first 7 days, we\'ll refund 100% of your payment — no questions asked.' },
      { q: 'Are there group or family discounts?', a: 'Yes! We offer 15% off when two or more family members or friends sign up together. Contact us for group pricing details.' },
    ],
  },
  {
    name: 'Technical',
    icon: FaLaptop,
    faqs: [
      { q: 'How do I access my programmes?', a: 'All programmes are delivered through our web platform. You\'ll receive login credentials upon sign-up and can access your dashboard, workouts, nutrition plans, and progress tracking from any device.' },
      { q: 'Is there a mobile app?', a: 'We\'re currently developing a dedicated iOS and Android app. In the meantime, our web platform is fully mobile-responsive and works great on smartphones and tablets.' },
      { q: 'How do video consultations work?', a: 'Video consultations are conducted via Zoom or Google Meet. You\'ll receive a calendar link to schedule sessions at times that work for you. Premium members get 2 sessions per month; Elite members get unlimited.' },
      { q: 'Can I download my workout plans?', a: 'Yes. All workout plans can be exported as PDFs for offline use. You can also view them directly in the platform\'s workout tracker.' },
      { q: 'How do I track my progress?', a: 'Our platform includes built-in progress tracking for weight, measurements, photos, strength metrics, and more. Your coach reviews all data weekly to make informed programming decisions.' },
      { q: 'Is my data secure?', a: 'Absolutely. We use bank-grade encryption for all personal and payment data. Your information is never shared with third parties. We take privacy seriously.' },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('General');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (catName, idx) => {
    const key = `${catName}-${idx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const matchesSearch = (faq) =>
    !searchTerm ||
    faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchTerm.toLowerCase());

  // when searching, show all categories
  const categoriesToShow = searchTerm
    ? faqCategories
    : faqCategories.filter((c) => c.name === activeCategory);

  return (
    <>
      <Helmet>
        <title>FAQ — Frequently Asked Questions | GFP</title>
        <meta name="description" content="Find answers to common questions about Gnaneswar Fitness Platform's training, nutrition, pricing, and technical features." />
        <link rel="canonical" href="https://gnaneswarfitness.com/faq" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Got Questions?</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto mb-8">
              Everything you need to know about GFP. Can't find what you're looking for? Reach out — we're always happy to help.
            </motion.p>

            {/* search bar */}
            <motion.div variants={fadeUp} className="max-w-lg mx-auto relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-11 py-4 text-base"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ FAQ CONTENT ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* category nav - sidebar */}
            {!searchTerm && (
              <motion.nav
                className="lg:w-64 flex-shrink-0"
                initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              >
                <div className="lg:sticky lg:top-24 space-y-2">
                  {faqCategories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategory(cat.name)}
                      className={`w-full px-5 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 text-left ${
                        activeCategory === cat.name
                          ? 'gradient-gold text-dark-950'
                          : 'glass text-dark-300 hover:text-white'
                      }`}
                    >
                      <cat.icon className="text-lg" /> {cat.name}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}

            {/* faq accordion */}
            <div className="flex-1">
              {categoriesToShow.map((cat) => {
                const visibleFaqs = cat.faqs.filter(matchesSearch);
                if (visibleFaqs.length === 0) return null;
                return (
                  <motion.div
                    key={cat.name}
                    initial="hidden" animate="visible" variants={stagger}
                    className="mb-10"
                  >
                    {searchTerm && (
                      <motion.div variants={fadeUp} className="flex items-center gap-2 mb-4">
                        <cat.icon className="text-gold-400" />
                        <h3 className="font-serif text-xl font-semibold">{cat.name}</h3>
                      </motion.div>
                    )}
                    <div className="space-y-3">
                      {visibleFaqs.map((faq, j) => {
                        const key = `${cat.name}-${j}`;
                        const isOpen = openItems[key];
                        return (
                          <motion.div key={j} variants={fadeUp} className="card overflow-hidden">
                            <button
                              onClick={() => toggleItem(cat.name, j)}
                              className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                            >
                              <span className="font-semibold text-sm">{faq.q}</span>
                              <motion.span
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-gold-400 flex-shrink-0"
                              >
                                <FaChevronDown />
                              </motion.span>
                            </button>
                            <AnimatePresence>
                              {isOpen && (
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
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}

              {searchTerm && categoriesToShow.every((c) => c.faqs.filter(matchesSearch).length === 0) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                  <FaQuestionCircle className="text-5xl text-dark-700 mx-auto mb-4" />
                  <p className="text-dark-400 text-lg">No results found for "{searchTerm}"</p>
                  <p className="text-dark-500 text-sm mt-2">Try different keywords or browse categories.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STILL HAVE QUESTIONS? ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent_60%)]" />
        <div className="container-custom relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={stagger}
          >
            <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-dark-950 text-2xl" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Still Have <span className="text-gradient-gold">Questions?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8 text-lg">
              Can't find the answer you're looking for? Our team is always ready to help.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary text-lg px-8 py-4">
                Contact Us <FaArrowRight className="ml-1" />
              </Link>
              <a href="mailto:gapbodybuilder@gmail.com" className="btn-secondary text-lg px-8 py-4">
                Email Us Directly
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
