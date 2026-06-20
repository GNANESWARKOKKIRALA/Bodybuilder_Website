import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AIChatbot from './components/common/AIChatbot';

// Public Pages (lazy loaded)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const TransformationsPage = lazy(() => import('./pages/public/TransformationsPage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const FAQPage = lazy(() => import('./pages/public/FAQPage'));
const SuccessStoriesPage = lazy(() => import('./pages/public/SuccessStoriesPage'));
const ResourcesPage = lazy(() => import('./pages/public/ResourcesPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// Client Dashboard Pages
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const ClientProfile = lazy(() => import('./pages/client/ClientProfile'));
const ClientProgress = lazy(() => import('./pages/client/ClientProgress'));
const ClientWorkouts = lazy(() => import('./pages/client/ClientWorkouts'));
const ClientNutrition = lazy(() => import('./pages/client/ClientNutrition'));
const ClientAppointments = lazy(() => import('./pages/client/ClientAppointments'));
const ClientNotifications = lazy(() => import('./pages/client/ClientNotifications'));
const ClientSubscription = lazy(() => import('./pages/client/ClientSubscription'));
const ClientChat = lazy(() => import('./pages/client/ClientChat'));

// Admin Dashboard Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));
const AdminWorkouts = lazy(() => import('./pages/admin/AdminWorkouts'));
const AdminNutrition = lazy(() => import('./pages/admin/AdminNutrition'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminChat = lazy(() => import('./pages/admin/AdminChat'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="w-16 h-16 rounded-xl gradient-gold flex items-center justify-center"
    >
      <FaCrown className="text-dark-950 text-2xl" />
    </motion.div>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/transformations" element={<TransformationsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/success-stories" element={<SuccessStoriesPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Client Dashboard Routes */}
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/dashboard/profile" element={<ClientProfile />} />
            <Route path="/dashboard/progress" element={<ClientProgress />} />
            <Route path="/dashboard/workouts" element={<ClientWorkouts />} />
            <Route path="/dashboard/nutrition" element={<ClientNutrition />} />
            <Route path="/dashboard/appointments" element={<ClientAppointments />} />
            <Route path="/dashboard/notifications" element={<ClientNotifications />} />
            <Route path="/dashboard/subscription" element={<ClientSubscription />} />
            <Route path="/dashboard/chat" element={<ClientChat />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout isAdmin={true} />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/workouts" element={<AdminWorkouts />} />
            <Route path="/admin/nutrition" element={<AdminNutrition />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/leads" element={<AdminLeads />} />
            <Route path="/admin/chat" element={<AdminChat />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center p-8">
              <motion.h1
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-8xl font-bold text-gradient-gold font-serif mb-4"
              >
                404
              </motion.h1>
              <p className="text-xl text-dark-400 mb-8">This page has skipped leg day</p>
              <a href="/" className="btn-primary">Back to Home</a>
            </div>
          } />
        </Routes>
      </Suspense>

      {/* Global AI Chatbot */}
      <AIChatbot />
    </>
  );
}

export default App;
