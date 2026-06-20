import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaCrown, FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { authService } from '../../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch (error) {
      // Show success even if email doesn't exist (security best practice)
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — Gnaneswar Fitness Platform</title>
      </Helmet>

      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_70%)]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
                <FaCrown className="text-dark-950 text-xl" />
              </div>
            </Link>
            <h2 className="text-3xl font-bold font-serif text-white mb-2">
              {sent ? 'Check Your Email' : 'Reset Password'}
            </h2>
            <p className="text-dark-400">
              {sent
                ? 'We\'ve sent a password reset link to your email'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          <div className="glass rounded-2xl p-8">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-6">
                  <FaCheck className="text-dark-950 text-2xl" />
                </div>
                <p className="text-dark-300 text-sm mb-6">
                  If an account exists for <strong className="text-white">{email}</strong>, you'll receive an email with instructions to reset your password.
                </p>
                <Link to="/login" className="btn-primary w-full !py-3.5">
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-field !pl-12"
                      required
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-dark-400 hover:text-gold-400 transition-colors inline-flex items-center gap-2">
              <FaArrowLeft className="text-xs" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
