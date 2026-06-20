import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  FaDownload,
  FaCalculator,
  FaPlay,
  FaArrowRight,
  FaFilePdf,
  FaCheckCircle,
  FaStar,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import {
  GiMuscleUp,
  GiMeal,
  GiWeightLiftingUp,
  GiRunningShoe,
} from 'react-icons/gi';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { BiDumbbell } from 'react-icons/bi';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const guides = [
  {
    title: 'The Ultimate Beginner\'s Guide to Lifting',
    desc: 'A comprehensive 40-page PDF covering proper form for all major compound lifts, workout structure for beginners, and your first 12-week programme.',
    pages: '40 pages',
    icon: GiWeightLiftingUp,
    gradient: 'from-gold-500/15 to-dark-900',
  },
  {
    title: 'Nutrition 101: Macro Mastery',
    desc: 'Learn how to calculate your macros, plan meals, and build a sustainable nutrition strategy that fuels performance and supports your body composition goals.',
    pages: '28 pages',
    icon: GiMeal,
    gradient: 'from-green-500/15 to-dark-900',
  },
  {
    title: 'Competition Prep Playbook',
    desc: 'The step-by-step playbook for your first bodybuilding competition. From off-season to peak week, posing practice to stage-day psychology.',
    pages: '52 pages',
    icon: GiMuscleUp,
    gradient: 'from-purple-500/15 to-dark-900',
  },
];

const videos = [
  { title: 'Perfect Squat Form in 5 Minutes', duration: '5:24', category: 'Form Guide', icon: GiWeightLiftingUp },
  { title: 'How to Track Macros Like a Pro', duration: '8:15', category: 'Nutrition', icon: GiMeal },
  { title: 'Full Upper Body Workout (45 min)', duration: '45:00', category: 'Workout', icon: GiMuscleUp },
  { title: 'Posing 101 for First-Time Competitors', duration: '12:30', category: 'Competition', icon: GiRunningShoe },
];

const supplements = [
  { name: 'Whey Protein Isolate', use: 'Muscle recovery & growth', essential: true, note: 'Post-workout or between meals when whole-food protein isn\'t practical.' },
  { name: 'Creatine Monohydrate', use: 'Strength & power output', essential: true, note: '5g daily. The most researched and proven supplement in sports nutrition.' },
  { name: 'Vitamin D3', use: 'Immune function & bone health', essential: true, note: '2000–5000 IU daily, especially if you have limited sun exposure.' },
  { name: 'Omega-3 Fish Oil', use: 'Joint health & inflammation', essential: false, note: '2–3g EPA/DHA daily. Supports recovery and cardiovascular health.' },
  { name: 'Caffeine', use: 'Pre-workout energy & focus', essential: false, note: '200–400mg 30 minutes before training. Use strategically, not daily.' },
  { name: 'Magnesium', use: 'Sleep quality & recovery', essential: false, note: '200–400mg before bed. Most people are deficient — this helps more than you think.' },
];

/* ────── calculators ────── */
function BMICalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w > 0 && h > 0) {
      const bmi = (w / (h * h)).toFixed(1);
      let category = '';
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal weight';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
      setResult({ bmi, category });
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
          <FaCalculator className="text-dark-950" />
        </div>
        <h3 className="font-serif text-xl font-semibold">BMI Calculator</h3>
      </div>
      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75" className="input-field" step="0.1" />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" className="input-field" step="0.1" />
        </div>
        <button type="submit" className="btn-primary w-full justify-center">Calculate BMI</button>
      </form>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-gold-500/10 border border-gold-500/20 text-center">
          <div className="text-3xl font-bold text-gradient-gold">{result.bmi}</div>
          <div className="text-sm text-dark-300 mt-1">{result.category}</div>
        </motion.div>
      )}
    </div>
  );
}

function TDEECalculator() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: 'male', activity: '1.55' });
  const [result, setResult] = useState(null);

  const calculate = (e) => {
    e.preventDefault();
    const { weight, height, age, gender, activity } = form;
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age), act = parseFloat(activity);
    if (w > 0 && h > 0 && a > 0) {
      let bmr;
      if (gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
      else bmr = 10 * w + 6.25 * h - 5 * a - 161;
      const tdee = Math.round(bmr * act);
      setResult({ bmr: Math.round(bmr), tdee, cut: tdee - 500, bulk: tdee + 300 });
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
          <HiLightningBolt className="text-dark-950" />
        </div>
        <h3 className="font-serif text-xl font-semibold">TDEE Calculator</h3>
      </div>
      <form onSubmit={calculate} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="75" className="input-field" step="0.1" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Height (cm)</label>
            <input type="number" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="175" className="input-field" step="0.1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-dark-300 mb-1">Age</label>
            <input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="25" className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-1">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="input-field">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Activity Level</label>
          <select value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="input-field">
            <option value="1.2">Sedentary (desk job)</option>
            <option value="1.375">Light (1–3 days/week)</option>
            <option value="1.55">Moderate (3–5 days/week)</option>
            <option value="1.725">Active (6–7 days/week)</option>
            <option value="1.9">Very Active (athlete)</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full justify-center">Calculate TDEE</button>
      </form>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          <div className="p-3 rounded-lg bg-gold-500/10 border border-gold-500/20 text-center">
            <div className="text-2xl font-bold text-gradient-gold">{result.tdee} cal/day</div>
            <div className="text-xs text-dark-400">Maintenance (TDEE)</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
              <div className="text-lg font-bold text-green-400">{result.cut}</div>
              <div className="text-[10px] text-dark-400">Fat Loss (-500)</div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-lg font-bold text-blue-400">{result.bulk}</div>
              <div className="text-[10px] text-dark-400">Lean Bulk (+300)</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MacroCalculator() {
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState('balanced');
  const [result, setResult] = useState(null);

  const ratios = {
    balanced: { p: 0.30, c: 0.40, f: 0.30 },
    'high-protein': { p: 0.40, c: 0.35, f: 0.25 },
    'low-carb': { p: 0.35, c: 0.20, f: 0.45 },
    keto: { p: 0.25, c: 0.05, f: 0.70 },
  };

  const calculate = (e) => {
    e.preventDefault();
    const cal = parseFloat(calories);
    if (cal > 0) {
      const r = ratios[goal];
      setResult({
        protein: Math.round((cal * r.p) / 4),
        carbs: Math.round((cal * r.c) / 4),
        fat: Math.round((cal * r.f) / 9),
      });
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
          <GiMeal className="text-dark-950 text-lg" />
        </div>
        <h3 className="font-serif text-xl font-semibold">Macro Calculator</h3>
      </div>
      <form onSubmit={calculate} className="space-y-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Daily Calories</label>
          <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="2500" className="input-field" />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Macro Split</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="input-field">
            <option value="balanced">Balanced (30/40/30)</option>
            <option value="high-protein">High Protein (40/35/25)</option>
            <option value="low-carb">Low Carb (35/20/45)</option>
            <option value="keto">Keto (25/5/70)</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full justify-center">Calculate Macros</button>
      </form>
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-lg font-bold text-red-400">{result.protein}g</div>
            <div className="text-[10px] text-dark-400">Protein</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
            <div className="text-lg font-bold text-yellow-400">{result.carbs}g</div>
            <div className="text-[10px] text-dark-400">Carbs</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-lg font-bold text-blue-400">{result.fat}g</div>
            <div className="text-[10px] text-dark-400">Fat</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ────── main page ────── */
export default function ResourcesPage() {
  return (
    <>
      <Helmet>
        <title>Free Resources — Guides, Calculators & Tutorials | GFP</title>
        <meta name="description" content="Access free fitness resources from Gnaneswar Fitness Platform: downloadable guides, BMI/TDEE/Macro calculators, video tutorials, and supplement recommendations." />
        <link rel="canonical" href="https://gnaneswarfitness.com/resources" />
      </Helmet>

      {/* ═══════ HERO ═══════ */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.08),transparent_60%)]" />
        <div className="container-custom relative z-10 py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <HiSparkles className="text-gold-400" />
              <span className="text-sm text-gold-300 tracking-wider uppercase font-medium">Free Tools & Knowledge</span>
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Free <span className="text-gradient-gold">Resources</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-dark-300 text-lg max-w-2xl mx-auto">
              Powerful tools, guides, and content to accelerate your fitness journey — completely free. Because knowledge should never be gatekept.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ═══════ DOWNLOADABLE GUIDES ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Knowledge Drops</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Downloadable <span className="text-gradient-gold">Guides</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {guides.map((g, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card overflow-hidden group">
                <div className={`aspect-[16/10] bg-gradient-to-br ${g.gradient} flex items-center justify-center relative`}>
                  <g.icon className="text-7xl text-gold-400/15" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full glass text-[10px] text-gold-300">
                    <FaFilePdf /> {g.pages}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-lg font-semibold mb-3 group-hover:text-gold-400 transition-colors">{g.title}</h3>
                  <p className="text-dark-300 text-sm leading-relaxed mb-5">{g.desc}</p>
                  <button className="btn-primary w-full justify-center text-sm">
                    <FaDownload className="mr-2" /> Download Free PDF
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ FITNESS CALCULATORS ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Crunch the Numbers</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Fitness <span className="text-gradient-gold">Calculators</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto mt-3">
              Know your numbers. These calculators give you a science-based starting point for your nutrition and training.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            <motion.div variants={fadeUp}><BMICalculator /></motion.div>
            <motion.div variants={fadeUp}><TDEECalculator /></motion.div>
            <motion.div variants={fadeUp}><MacroCalculator /></motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ VIDEO TUTORIALS ═══════ */}
      <section className="section-padding relative">
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Watch & Learn</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Video <span className="text-gradient-gold">Tutorials</span>
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          >
            {videos.map((v, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card overflow-hidden group cursor-pointer">
                <div className="aspect-video bg-gradient-to-br from-dark-800 to-dark-950 flex items-center justify-center relative">
                  <v.icon className="text-4xl text-gold-500/20 absolute" />
                  <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center group-hover:scale-110 transition-transform z-10 shadow-lg shadow-gold-500/20">
                    <FaPlay className="text-dark-950 text-sm ml-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-dark-950/80 text-[10px] text-dark-300">{v.duration}</span>
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full glass text-[10px] text-gold-300">{v.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm group-hover:text-gold-400 transition-colors">{v.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════ SUPPLEMENTS ═══════ */}
      <section className="section-padding gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />
        <div className="container-custom">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="text-gold-400 text-sm tracking-widest uppercase font-semibold">Evidence-Based</motion.span>
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mt-3">
              Recommended <span className="text-gradient-gold">Supplements</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto mt-3">
              We believe in food first, supplements second. But these evidence-based supplements can give you an edge when used correctly.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}
          >
            {supplements.map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-serif text-lg font-semibold">{s.name}</h3>
                  {s.essential && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full gradient-gold text-dark-950 font-bold uppercase">Essential</span>
                  )}
                </div>
                <p className="text-gold-400 text-xs font-medium uppercase tracking-wider mb-2">{s.use}</p>
                <p className="text-dark-300 text-sm leading-relaxed">{s.note}</p>
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
            <motion.h2 variants={fadeUp} className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Ready for <span className="text-gradient-gold">Personalised</span> Guidance?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 mb-8 text-lg">
              Free resources are great for getting started — but personalised coaching is what delivers life-changing results. Let's build a plan that's uniquely yours.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary text-lg px-8 py-4">
                View Coaching Plans <FaArrowRight className="ml-1" />
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
