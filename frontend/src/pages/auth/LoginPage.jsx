import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import { FaCrown, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success('Welcome back! 💪');
        navigate(result.user.role === 'admin' ? '/admin' : from);
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — Gnaneswar Fitness Platform</title>
        <meta name="description" content="Sign in to your Gnaneswar Fitness Platform account to access your workouts, nutrition plans, and progress tracking." />
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
              <h2 className="text-3xl font-bold font-serif text-white mb-2">Welcome Back</h2>
              <p className="text-dark-400 text-sm">Sign in to continue your fitness journey</p>
            </div>

            {/* Desktop header */}
            <div className="hidden lg:block mb-8">
              <h2 className="text-4xl font-bold font-serif text-white mb-2">Welcome Back</h2>
              <p className="text-dark-400">Sign in to continue your fitness journey</p>
            </div>

            {/* Form */}
            <div className="glass rounded-2xl p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="input-field !pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-dark-300">Password</label>
                    <Link to="/forgot-password" className="text-xs text-gold-400 hover:text-gold-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="input-field !pl-12 !pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !py-3.5 !text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 justify-center">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 border-2 border-dark-950 border-t-transparent rounded-full inline-block" />
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-dark-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-gold-400 hover:text-gold-300 font-semibold">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            {/* Demo Credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 rounded-xl glass-light text-center"
            >
              <p className="text-xs text-dark-500 mb-2 font-semibold">Demo Credentials</p>
              <div className="flex gap-4 justify-center text-xs">
                <div>
                  <p className="text-dark-400">Admin: admin@fitness.com</p>
                  <p className="text-dark-500">Client: client@fitness.com</p>
                  <p className="text-dark-400">Pass: admin123</p>
                </div>
              </div>
            </motion.div>
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

export default LoginPage;
