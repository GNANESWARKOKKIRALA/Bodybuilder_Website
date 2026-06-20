import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { FaCrown, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const goals = [
  { id: 'weight_loss', label: 'Weight Loss', emoji: '🔥' },
  { id: 'muscle_gain', label: 'Muscle Gain', emoji: '💪' },
  { id: 'competition', label: 'Competition Prep', emoji: '🏆' },
  { id: 'general', label: 'General Fitness', emoji: '🏃' },
  { id: 'strength', label: 'Strength Training', emoji: '🏋️' },
  { id: 'endurance', label: 'Endurance', emoji: '❤️' },
];

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', goal: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all fields');
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!formData.goal) {
      toast.error('Please select a fitness goal');
      return;
    }
    setLoading(true);
    try {
      const nameParts = (formData.name || '').trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '-';

      const result = await register({
        first_name,
        last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        goal: formData.goal,
      });
      if (result.success) {
        toast.success('Welcome to Gnaneswar Fitness! 🎉');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account — Gnaneswar Fitness Platform</title>
        <meta name="description" content="Join Gnaneswar Fitness Platform and start your transformation journey today." />
      </Helmet>

      <div className="min-h-screen bg-dark-950 flex flex-col lg:flex-row relative overflow-hidden">
        {/* Left Side: Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12 z-10 lg:max-w-2xl bg-dark-950/40 border-r border-white/5 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Logo in mobile view */}
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3 mb-4">
                <img src="/logo.jpg" alt="Gnaneswar Fitness Logo" className="w-20 h-20 rounded-full border border-gold-500/20 object-cover shadow-lg" />
              </Link>
              <h2 className="text-3xl font-bold font-serif text-white mb-2">Start Your Journey</h2>
              <p className="text-dark-400">Create your account in 3 simple steps</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-4xl font-bold font-serif text-white mb-2">Start Your Journey</h2>
              <p className="text-dark-400">Create your account in 3 simple steps</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? 'gradient-gold text-dark-950'
                      : 'bg-dark-800 text-dark-500 border border-white/10'
                  }`}>
                    {step > s ? <FaCheck /> : s}
                  </div>
                  {s < 3 && (
                    <div className={`w-12 h-0.5 transition-all ${step > s ? 'bg-gold-500' : 'bg-dark-800'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="glass rounded-2xl p-6 sm:p-8">
              {/* Step 1: Personal Info */}
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleStep1}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Personal Information</h3>
                  <p className="text-sm text-dark-400 mb-4">Tell us about yourself</p>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" className="input-field !pl-12" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" className="input-field !pl-12" required />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="input-field !pl-12" required />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary w-full !py-3.5 font-semibold">Continue →</button>
                </motion.form>
              )}

              {/* Step 2: Password */}
              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleStep2}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Secure Your Account</h3>
                  <p className="text-sm text-dark-400 mb-4">Choose a strong password</p>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" className="input-field !pl-12 !pr-12" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="input-field !pl-12" required />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 !py-3">← Back</button>
                    <button type="submit" className="btn-primary flex-1 !py-3 font-semibold">Continue →</button>
                  </div>
                </motion.form>
              )}

              {/* Step 3: Fitness Goal */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-semibold text-white mb-1">Your Fitness Goal</h3>
                  <p className="text-sm text-dark-400 mb-4">What's your primary fitness objective?</p>

                  <div className="grid grid-cols-2 gap-3">
                    {goals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => setFormData({ ...formData, goal: goal.id })}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          formData.goal === goal.id
                            ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                            : 'border-white/10 bg-dark-900/50 text-dark-300 hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{goal.emoji}</span>
                        <span className="text-sm font-medium">{goal.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 !py-3">← Back</button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || !formData.goal}
                      className="btn-primary flex-1 !py-3 disabled:opacity-50 font-semibold"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                          <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full inline-block" />
                          Creating...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-dark-400">
                Already have an account?{' '}
                <Link to="/login" className="text-gold-400 hover:text-gold-300 font-semibold">Sign In</Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Welcome Banner (Desktop only) */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative bg-dark-900 overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_80%)]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg"
          >
            <img 
              src="/logo.jpg" 
              alt="Gnaneswar Fitness Logo" 
              className="w-72 h-72 rounded-full border-2 border-gold-500/20 object-cover shadow-2xl shadow-gold-500/10 mb-8"
            />
            <h1 className="text-3xl font-serif font-bold text-white mb-4 tracking-wide">
              GNANESWAR <span className="text-gradient-gold">FITNESS</span>
            </h1>
            <p className="text-dark-400 text-sm leading-relaxed">
              Unlock your true potential. Access custom workout splits, hyper-personalized nutrition plans, and elite coaching tools.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
