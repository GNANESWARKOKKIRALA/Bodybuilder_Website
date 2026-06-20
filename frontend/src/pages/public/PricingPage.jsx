import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaShieldAlt,
  FaChevronDown,
  FaCrown,
  FaStar,
  FaBolt,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaLock,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const plans = [
  {
    name: 'Starter',
    icon: FaBolt,
    monthly: 999,
    tagline: 'Perfect for self-motivated beginners',
    features: [
      'Basic workout plan',
      'Email support',
      'Progress tracking dashboard',
      'Community access',
      'Exercise video library',
      'Monthly newsletter',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Premium',
    icon: FaStar,
    monthly: 2999,
    tagline: 'Our most popular plan for serious results',
    features: [
      'Everything in Starter',
      'Custom workout & nutrition plan',
      'Weekly check-ins',
      'Video consultations (2×/mo)',
      'Priority email & chat support',
      'Form-check video reviews',
      'Supplement guidance',
    ],
    cta: 'Go Premium',
    popular: true,
  },
  {
    name: 'Elite',
    icon: FaCrown,
    monthly: 4999,
    tagline: 'Unmatched access for the truly committed',
    features: [
      'Everything in Premium',
      'Daily coaching & accountability',
      'Competition prep included',
      '24/7 WhatsApp support',
      'Monthly body composition analysis',
      'Unlimited video consultations',
      'VIP community access',
      'Personalised supplement stack',
    ],
    cta: 'Join Elite',
    popular: false,
  },
];

const comparisonFeatures = [
  { feature: 'Custom Workout Plan', starter: 'Basic', premium: true, elite: true },
  { feature: 'Nutrition Plan', starter: false, premium: true, elite: true },
  { feature: 'Progress Tracking', starter: true, premium: true, elite: true },
  { feature: 'Community Access', starter: true, premium: true, elite: 'VIP' },
  { feature: 'Email Support', starter: true, premium: 'Priority', elite: 'Priority' },
  { feature: 'Video Consultations', starter: false, premium: '2×/mo', elite: 'Unlimited' },
  { feature: 'Weekly Check-ins', starter: false, premium: true, elite: 'Daily' },
  { feature: 'WhatsApp Support', starter: false, premium: false, elite: '24/7' },
  { feature: 'Form Check Reviews', starter: false, premium: true, elite: true },
  { feature: 'Competition Prep', starter: false, premium: false, elite: true },
  { feature: 'Body Composition Analysis', starter: false, premium: false, elite: 'Monthly' },
  { feature: 'Supplement Guidance', starter: false, premium: true, elite: 'Personalised' },
];

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes! Upgrade or downgrade anytime. When upgrading, you only pay the prorated difference. Downgrades take effect at your next billing cycle.' },
  { q: 'Is there a contract or lock-in period?', a: 'No contracts, ever. All plans are month-to-month (or annual if you choose the discount). Cancel anytime with one click.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.' },
  { q: 'What\'s included in the 7-day money-back guarantee?', a: 'If you\'re not completely satisfied within 7 days of purchase, we\'ll refund 100% of your payment. No questions asked, no hoops to jump through.' },
  { q: 'Do annual plans auto-renew?', a: 'Annual plans auto-renew for your convenience, but you\'ll receive a reminder email 7 days before renewal. You can cancel or modify your plan before then.' },
  { q: 'Can I pause my subscription?', a: 'Yes, Premium and Elite members can pause their subscription for up to 30 days per year — ideal for vacations or unexpected circumstances.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const getPrice = (monthly) => {
    if (annual) return Math.round(monthly * 12 * 0.8);
    return monthly;
  };

  const formatPrice = (price) => price.toLocaleString('en-IN');

  return (
    <>
      <Helmet>
        <title>Pricing — Affordable Premium Fitness Coaching | GFP</title>
        <meta name="description" content="Transparent pricing for Gnaneswar Fitness Platform. Choose Starter, Premium, or Elite plans. Save 20% with annual billing. 7-day money-back guarantee." />
        <link rel="canonical" href="https://gnaneswarfitness.com/pricing" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Simple, Transparent Pricing</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Invest in <span className="text-gradient-gold">Your Best Self</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto">
              No hidden fees. No surprise charges. Just world-class coaching at prices that respect your hustle.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ TOGGLE + CARDS ═══════ */}
      <section className="section-padding relative -mt-16">
        <div className="container-custom">
          {/* billing toggle */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-dark-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-gold-500' : 'bg-dark-700'}`}
            >
              <motion.div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                animate={{ left: annual ? '1.75rem' : '0.125rem' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-dark-400'}`}>
              Annual <span className="text-gold-400 text-xs ml-1 font-bold">Save 20%</span>
            </span>
          </motion.div>

          {/* pricing cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i}
                className={`card p-8 relative flex flex-col ${plan.popular ? 'border-gold-500/40 gold-glow md:-mt-4 md:mb-0 md:pb-12' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 gradient-gold rounded-full text-dark-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <FaStar className="text-[10px]" /> Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="text-dark-950 text-xl" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold">{plan.name}</h3>
                  <p className="text-dark-400 text-xs mt-1">{plan.tagline}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-gold-400 text-5xl font-bold">₹{formatPrice(getPrice(plan.monthly))}</span>
                    <span className="text-dark-400 text-sm">/{annual ? 'year' : 'month'}</span>
                  </div>
                  {annual && (
                    <p className="text-dark-500 text-xs mt-1 line-through">
                      ₹{formatPrice(plan.monthly * 12)}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-dark-200">
                      <FaCheckCircle className="text-gold-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className={`${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full justify-center text-center`}
                >
                  {plan.cta} <FaArrowRight className="text-sm" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ COMPARISON TABLE ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold">
              Feature <span className="text-gradient-gold">Comparison</span>
            </motion.h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gold-500/20">
                  <th className="text-left py-4 px-4 text-dark-300 text-sm font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gold-400">Premium</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold">Elite</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className="border-b border-dark-800/50 hover:bg-dark-900/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-dark-200">{row.feature}</td>
                    {['starter', 'premium', 'elite'].map((tier) => (
                      <td key={tier} className="py-3 px-4 text-center">
                        {row[tier] === true ? (
                          <FaCheckCircle className="text-gold-500 mx-auto" />
                        ) : row[tier] === false ? (
                          <FaTimesCircle className="text-dark-700 mx-auto" />
                        ) : (
                          <span className="text-xs text-gold-300 font-medium">{row[tier]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ═══════ MONEY-BACK GUARANTEE ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            className="max-w-3xl mx-auto text-center card p-10 md:p-14 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05),transparent_70%)]" />
            <div className="relative z-10">
              <FaShieldAlt className="text-gold-400 text-5xl mx-auto mb-6" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                7-Day <span className="text-gradient-gold">Money-Back</span> Guarantee
              </h2>
              <p className="text-dark-300 text-lg leading-relaxed mb-6">
                We're so confident in the quality of our coaching that we offer a full, no-questions-asked refund
                within 7 days of purchase. If you're not absolutely thrilled with your experience, you get every
                rupee back. Zero risk, maximum potential.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-dark-400">
                <span className="flex items-center gap-2"><FaCheckCircle className="text-gold-500" /> No questions asked</span>
                <span className="flex items-center gap-2"><FaCheckCircle className="text-gold-500" /> Full refund</span>
                <span className="flex items-center gap-2"><FaCheckCircle className="text-gold-500" /> Process within 48 hours</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ SUPPORTED PAYMENT METHODS ═══════ */}
      <section className="py-12 relative border-t border-white/5">
        <div className="container-custom max-w-4xl">
          <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold-500/5 to-transparent" />
            <div className="relative z-10">
              <h3 className="font-serif text-xl font-bold text-white mb-6 uppercase tracking-wider">
                Supported Payment Methods
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
                {/* UPI */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-dark-900/40 border border-white/5 backdrop-blur-sm">
                  <FaMobileAlt className="text-gold-400 text-3xl mb-2" />
                  <span className="text-sm font-semibold text-white">UPI / Instant Pay</span>
                  <span className="text-xs text-dark-400 mt-1">GPay, PhonePe, Paytm</span>
                </div>

                {/* Cards */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-dark-900/40 border border-white/5 backdrop-blur-sm">
                  <FaCreditCard className="text-gold-400 text-3xl mb-2" />
                  <span className="text-sm font-semibold text-white">Credit & Debit Cards</span>
                  <span className="text-xs text-dark-400 mt-1">Visa, Mastercard, RuPay</span>
                </div>

                {/* Net Banking */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-dark-900/40 border border-white/5 backdrop-blur-sm">
                  <FaUniversity className="text-gold-400 text-3xl mb-2" />
                  <span className="text-sm font-semibold text-white">Net Banking</span>
                  <span className="text-xs text-dark-400 mt-1">SBI, HDFC, ICICI & more</span>
                </div>

                {/* SSL Secure */}
                <div className="flex flex-col items-center p-4 rounded-xl bg-dark-900/40 border border-gold-500/20 backdrop-blur-sm bg-gold-500/5">
                  <FaLock className="text-gold-400 text-3xl mb-2" />
                  <span className="text-sm font-semibold text-gold-400">100% Secure Checkout</span>
                  <span className="text-xs text-dark-400 mt-1">SSL Encrypted Gateway</span>
                </div>
              </div>
              
              <p className="text-xs text-dark-500 mt-6 max-w-lg mx-auto">
                All transactions are encrypted and processed securely by Razorpay. We do not store your card or bank credentials.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold">
              Pricing <span className="text-gradient-gold">FAQ</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
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
    </>
  );
}
