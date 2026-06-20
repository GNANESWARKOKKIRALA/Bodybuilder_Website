import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaCrown } from 'react-icons/fa';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
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
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (requiredRole === 'admin') {
      if (user?.role !== 'admin' || user?.email !== 'gapbodybuilder@gmail.com') {
        return <Navigate to="/dashboard" replace />;
      }
    } else if (user?.role !== requiredRole) {
      return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
