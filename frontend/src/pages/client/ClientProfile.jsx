import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiCalendar, FiSave,
  FiTarget, FiHeart, FiEdit2, FiCamera
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/api';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

const fitnessGoals = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'muscle_gain', label: 'Muscle Gain' },
  { value: 'competition', label: 'Competition Prep' },
  { value: 'general_fitness', label: 'General Fitness' },
];

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    fitnessGoal: 'general_fitness',
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
    medicalNotes: '',
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.profile?.date_of_birth || '',
        gender: user.profile?.gender 
          ? user.profile.gender.charAt(0).toUpperCase() + user.profile.gender.slice(1) 
          : 'Male',
        fitnessGoal: user.profile?.fitness_goal || 'general_fitness',
        height: user.profile?.height_cm ? String(user.profile.height_cm) : '',
        weight: user.profile?.weight_kg ? String(user.profile.weight_kg) : '',
        chest: '102',
        waist: '78',
        hips: '96',
        arms: '38',
        thighs: '60',
        medicalNotes: user.profile?.medical_conditions || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updateData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        phone: profile.phone,
        date_of_birth: profile.dob || null,
        gender: profile.gender.toLowerCase(),
        fitness_goal: profile.fitnessGoal,
        height_cm: profile.height ? parseFloat(profile.height) : null,
        weight_kg: profile.weight ? parseFloat(profile.weight) : null,
        medical_conditions: profile.medicalNotes,
      };
      const response = await userService.updateProfile(updateData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, name, type = 'text', icon: Icon, ...rest }) => (
    <div>
      <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
        )}
        <input
          type={type}
          name={name}
          value={profile[name]}
          onChange={handleChange}
          className={`input-field ${Icon ? 'pl-10' : ''}`}
          {...rest}
        />
      </div>
    </div>
  );

  return (
    <>
      <Helmet><title>My Profile | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Profile Header */}
        <motion.div variants={fadeIn} className="card flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 text-4xl font-serif font-bold shadow-lg shadow-gold-500/20">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-gold-500 text-dark-950 hover:bg-gold-400 transition-colors shadow-lg opacity-0 group-hover:opacity-100">
              <FiCamera size={14} />
            </button>
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-dark-400 mt-1">Member since January 2025</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              <span className="px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-semibold uppercase">
                Premium
              </span>
              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold uppercase">
                Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center gap-2 mb-6">
            <FiUser className="text-gold-400" size={20} />
            <h2 className="text-xl font-serif font-bold text-white">Personal Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="First Name" name="firstName" icon={FiUser} />
            <InputField label="Last Name" name="lastName" icon={FiUser} />
            <InputField label="Email" name="email" type="email" icon={FiMail} />
            <InputField label="Phone" name="phone" icon={FiPhone} />
            <InputField label="Date of Birth" name="dob" type="date" icon={FiCalendar} />
            <div>
              <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Fitness Goals */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center gap-2 mb-6">
            <FiTarget className="text-gold-400" size={20} />
            <h2 className="text-xl font-serif font-bold text-white">Fitness Goals</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {fitnessGoals.map((goal) => (
              <button
                key={goal.value}
                onClick={() => setProfile({ ...profile, fitnessGoal: goal.value })}
                className={`p-4 rounded-xl border-2 text-center font-semibold text-sm transition-all ${
                  profile.fitnessGoal === goal.value
                    ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                    : 'border-dark-800 bg-dark-900/50 text-dark-400 hover:border-dark-600'
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Body Measurements */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center gap-2 mb-6">
            <FiEdit2 className="text-gold-400" size={20} />
            <h2 className="text-xl font-serif font-bold text-white">Body Measurements</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Height (cm)', name: 'height' },
              { label: 'Weight (kg)', name: 'weight' },
              { label: 'Chest (cm)', name: 'chest' },
              { label: 'Waist (cm)', name: 'waist' },
              { label: 'Hips (cm)', name: 'hips' },
              { label: 'Arms (cm)', name: 'arms' },
              { label: 'Thighs (cm)', name: 'thighs' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs text-dark-400 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                <input
                  type="number"
                  name={field.name}
                  value={profile[field.name]}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Medical Notes */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center gap-2 mb-6">
            <FiHeart className="text-gold-400" size={20} />
            <h2 className="text-xl font-serif font-bold text-white">Medical Notes</h2>
          </div>
          <textarea
            name="medicalNotes"
            value={profile.medicalNotes}
            onChange={handleChange}
            rows={4}
            className="input-field resize-none"
            placeholder="Enter any medical conditions, allergies, or injuries..."
          />
        </motion.div>

        {error && (
          <p className="text-red-400 text-sm text-right mb-2">{error}</p>
        )}
        <motion.div variants={fadeIn} className="flex justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3 text-base disabled:opacity-50">
            <FiSave size={18} />
            {saving ? 'Saving...' : saved ? 'Saved Successfully!' : 'Save Changes'}
          </button>
        </motion.div>
      </motion.div>
    </>
  );
}
