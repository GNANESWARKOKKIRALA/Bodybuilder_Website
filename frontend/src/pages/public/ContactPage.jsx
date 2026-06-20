import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaTwitter,
  FaPaperPlane,
  FaArrowRight,
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

const contactInfo = [
  { icon: FaEnvelope, label: 'Email', value: 'gapbodybuilder@gmail.com', link: 'mailto:gapbodybuilder@gmail.com' },
  { icon: FaPhone, label: 'Phone', value: '+91 63097 64875', link: 'tel:+916309764875' },
  { icon: FaMapMarkerAlt, label: 'Location', value: 'Hyderabad, Telangana, India', link: null },
  { icon: FaClock, label: 'Business Hours', value: 'Mon–Sat: 6 AM – 9 PM IST', link: null },
];

const socials = [
  { icon: FaInstagram, label: 'Instagram', handle: '@gnaneswar_bb', color: 'hover:text-pink-400', link: 'https://instagram.com/gnaneswar_bb' },
  { icon: FaYoutube, label: 'YouTube', handle: 'Gnaneswar Fitness', color: 'hover:text-red-500', link: '#' },
  { icon: FaFacebookF, label: 'Facebook', handle: '/gnaneswarfitness', color: 'hover:text-blue-500', link: '#' },
  { icon: FaTwitter, label: 'Twitter', handle: '@gnaneswar_fit', color: 'hover:text-sky-400', link: '#' },
];

const subjects = [
  'General Inquiry',
  'Personal Training',
  'Online Coaching',
  'Competition Prep',
  'Nutrition Consultation',
  'Corporate Wellness',
  'Partnership / Collaboration',
  'Other',
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', subject: '', message: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Get in Touch with Gnaneswar | GFP</title>
        <meta name="description" content="Reach out to Gnaneswar Fitness Platform. Book a free consultation, ask questions, or inquire about our coaching services. We'd love to hear from you." />
        <link rel="canonical" href="https://gnaneswarfitness.com/contact" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">We're Here to Help</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Get in <span className="text-gradient-gold">Touch</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto">
              Have a question, want to book a consultation, or just want to say hello? We'd love to hear from you. Every message gets a personal reply.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ CONTACT FORM + INFO ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* form - left */}
            <motion.div
              className="lg:col-span-3"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-serif text-3xl font-bold mb-2">
                Send Us a <span className="text-gradient-gold">Message</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-dark-400 text-sm mb-8">
                Fill out the form below and we'll get back to you within 24 hours.
              </motion.p>

              <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-200">Full Name *</label>
                    <input
                      type="text" name="name" required
                      value={form.name} onChange={handleChange}
                      placeholder="John Doe"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-200">Email Address *</label>
                    <input
                      type="email" name="email" required
                      value={form.email} onChange={handleChange}
                      placeholder="john@example.com"
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-200">Phone Number</label>
                    <input
                      type="tel" name="phone"
                      value={form.phone} onChange={handleChange}
                      placeholder="+91 63097 64875"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-dark-200">Subject *</label>
                    <select
                      name="subject" required
                      value={form.subject} onChange={handleChange}
                      className="input-field"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-dark-200">Message *</label>
                  <textarea
                    name="message" required rows={6}
                    value={form.message} onChange={handleChange}
                    placeholder="Tell us about your goals, questions, or how we can help..."
                    className="input-field resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary text-lg px-8 py-4">
                  <FaPaperPlane className="mr-2" /> Send Message
                </button>
              </motion.form>
            </motion.div>

            {/* info - right */}
            <motion.div
              className="lg:col-span-2"
              initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="font-serif text-3xl font-bold mb-2">
                Contact <span className="text-gradient-gold">Info</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-dark-400 text-sm mb-8">
                Prefer to reach us directly? Here's how.
              </motion.p>

              <div className="space-y-4 mb-10">
                {contactInfo.map((info, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className="card p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-lg gradient-gold flex items-center justify-center flex-shrink-0">
                      <info.icon className="text-dark-950" />
                    </div>
                    <div>
                      <div className="text-dark-400 text-xs uppercase tracking-wider mb-0.5">{info.label}</div>
                      {info.link ? (
                        <a href={info.link} className="text-sm font-medium hover:text-gold-400 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <span className="text-sm font-medium">{info.value}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* social media */}
              <motion.div variants={fadeUp}>
                <h3 className="font-serif text-xl font-semibold mb-4">Follow Us</h3>
                <div className="grid grid-cols-2 gap-3">
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.link}
                      target={s.link !== '#' ? '_blank' : undefined}
                      rel={s.link !== '#' ? 'noopener noreferrer' : undefined}
                      className={`card p-4 flex items-center gap-3 ${s.color} transition-colors`}
                    >
                      <s.icon className="text-lg" />
                      <div>
                        <div className="text-xs font-medium">{s.label}</div>
                        <div className="text-[10px] text-dark-500">{s.handle}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ MAP PLACEHOLDER ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden pt-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-12"
          >
            <div className="rounded-2xl overflow-hidden border border-gold-500/10">
              <div className="aspect-[21/9] bg-gradient-to-br from-dark-800 via-dark-900 to-dark-950 flex items-center justify-center relative">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-5xl text-gold-500/30 mx-auto mb-3" />
                  <p className="text-dark-400 text-sm">Hyderabad, Telangana, India</p>
                  <p className="text-dark-500 text-xs mt-1">Interactive map coming soon</p>
                </div>
                {/* decorative grid lines */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                  }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
