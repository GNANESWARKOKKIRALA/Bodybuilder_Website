import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiDownload, FiCheckCircle, FiCircle, FiDroplet,
  FiTarget, FiZap
} from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import { nutritionService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const MacroBar = ({ label, current, target, color }) => {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between items-end mb-2">
        <div>
          <p className="text-xs text-dark-400 uppercase tracking-wider">{label}</p>
          <p className="text-xl font-bold text-white">
            {current}
            <span className="text-sm text-dark-500">/{target || 0}g</span>
          </p>
        </div>
        <span className="text-sm font-semibold" style={{ color }}>{Math.round(pct)}%</span>
      </div>
      <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default function ClientNutrition() {
  const [activePlan, setActivePlan] = useState(null);
  const [summary, setSummary] = useState({
    total_calories: 0,
    total_protein_grams: 0,
    total_carbs_grams: 0,
    total_fat_grams: 0,
    total_water_ml: 0,
    meals: []
  });
  const [loading, setLoading] = useState(true);
  const [waterGlasses, setWaterGlasses] = useState(0);

  const fetchNutrition = async () => {
    try {
      const planRes = await nutritionService.getMyPlan();
      if (planRes.data.success && planRes.data.data.plan) {
        setActivePlan(planRes.data.data.plan);
      }
      
      const todayStr = new Date().toISOString().split('T')[0];
      const summaryRes = await nutritionService.getDailyNutritionSummary({ date: todayStr });
      if (summaryRes.data.success && summaryRes.data.data) {
        setSummary(summaryRes.data.data);
        const glasses = Math.round((summaryRes.data.data.total_water_ml || 0) / 250);
        setWaterGlasses(Math.min(glasses, 8));
      }
    } catch (err) {
      console.error("Error loading nutrition:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, []);

  const handleWaterClick = async (idx) => {
    const newGlasses = idx + 1;
    setWaterGlasses(newGlasses);
    
    // Log water (each glass is 250ml)
    try {
      await nutritionService.logMeal({
        log_date: new Date().toISOString().split('T')[0],
        meal_type: 'morning_snack',
        food_items: 'Water Intake',
        calories: 0,
        protein_grams: 0,
        carbs_grams: 0,
        fat_grams: 0,
        water_ml: 250
      });
      fetchNutrition();
    } catch (err) {
      console.error("Error logging water:", err);
    }
  };

  const handleLogMeal = async (meal) => {
    try {
      await nutritionService.logMeal({
        log_date: new Date().toISOString().split('T')[0],
        meal_type: meal.meal_type,
        food_items: `${meal.name}: ${meal.foods || meal.description}`,
        calories: meal.calories || 0,
        protein_grams: meal.protein_grams || 0,
        carbs_grams: meal.carbs_grams || 0,
        fat_grams: meal.fat_grams || 0
      });
      fetchNutrition();
    } catch (err) {
      console.error("Error logging meal:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center"
        >
          <FiUtensils className="text-dark-950 text-xl" />
        </motion.div>
      </div>
    );
  }

  const calRemaining = activePlan ? Math.max(activePlan.daily_calories - summary.total_calories, 0) : 0;
  const planCalories = activePlan ? activePlan.daily_calories : 0;

  return (
    <>
      <Helmet><title>Nutrition | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {activePlan ? (
          <>
            {/* Plan Header */}
            <motion.div variants={fadeIn} className="card gradient-gold relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark-950">{activePlan.name}</h1>
                  <p className="text-dark-800 mt-1">Goal: {activePlan.goal?.replace('_', ' ').toUpperCase()} • Type: {activePlan.diet_type?.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-dark-900/90 text-xs mt-2 max-w-xl">{activePlan.description}</p>
                </div>
              </div>
            </motion.div>

            {/* Calorie + Macro Summary */}
            <motion.div variants={fadeIn} className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-serif font-bold text-white">Daily Macro Progress</h2>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gold-400">{summary.total_calories}</p>
                  <p className="text-xs text-dark-400">/ {planCalories} kcal</p>
                </div>
              </div>
              {/* Calorie bar */}
              <div className="mb-6">
                <div className="h-4 bg-dark-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${planCalories > 0 ? (summary.total_calories / planCalories) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-dark-400 mt-1">{calRemaining} kcal remaining today</p>
              </div>
              {/* Macro bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MacroBar label="Protein" current={summary.total_protein_grams} target={activePlan.protein_grams} color="#d4af37" />
                <MacroBar label="Carbs" current={summary.total_carbs_grams} target={activePlan.carbs_grams} color="#3b82f6" />
                <MacroBar label="Fat" current={summary.total_fat_grams} target={activePlan.fat_grams} color="#ef4444" />
              </div>
            </motion.div>

            {/* Daily Meals */}
            <motion.div variants={stagger} className="space-y-4">
              {activePlan.meals && activePlan.meals.map((meal, idx) => {
                // Check if this meal type is already logged today in summary
                const isLogged = summary.meals?.some(m => m.meal_type === meal.meal_type && m.food_items !== 'Water Intake');
                
                return (
                  <motion.div
                    key={meal.id || idx}
                    variants={fadeIn}
                    className={`card ${isLogged ? 'border-green-500/15' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isLogged ? 'bg-green-500/20 text-green-400' : 'bg-gold-500/10 text-gold-400'
                        }`}>
                          {isLogged ? <FiCheckCircle size={20} /> : <FiTarget size={20} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">
                            {meal.meal_type?.toUpperCase()} — {meal.name}
                          </h3>
                          <p className="text-xs text-dark-400">Suggested Time: {meal.time_suggestion || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold-400">{meal.calories} kcal</p>
                        <p className="text-[10px] text-dark-400">
                          P: {meal.protein_grams}g · C: {meal.carbs_grams}g · F: {meal.fat_grams}g
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 ml-13">
                      <div className="p-3 rounded-lg bg-dark-900/50 text-sm border border-white/5">
                        <p className="text-dark-300 font-serif leading-relaxed">{meal.description}</p>
                        {meal.foods && (
                          <div className="mt-2 text-xs text-dark-500">
                            <strong>Recommended Foods:</strong> {meal.foods}
                          </div>
                        )}
                      </div>
                    </div>

                    {!isLogged && (
                      <button
                        onClick={() => handleLogMeal(meal)}
                        className="mt-3 w-full py-2 rounded-xl border border-gold-500/30 text-gold-400 text-sm font-semibold hover:bg-gold-500/10 transition-colors"
                      >
                        Log This Meal ✓
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            variants={fadeIn}
            className="card text-center py-16 max-w-xl mx-auto flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <FaUtensils size={28} />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">No Nutrition Plan Assigned</h2>
            <p className="text-dark-400 text-sm max-w-md">
              Coach Gnaneswar has not assigned a customized dietary meal plan to your profile yet.
              Keep your profile metrics up to date so the coach can tailor a nutrition program to your metabolic requirements.
            </p>
            <div className="flex gap-3">
              <Link to="/dashboard/profile" className="btn-primary text-xs px-5 py-2.5">
                Complete My Profile
              </Link>
              <Link to="/dashboard/chat" className="btn-secondary text-xs px-5 py-2.5">
                Chat with Coach
              </Link>
            </div>
          </motion.div>
        )}

        {/* Water Intake */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiDroplet className="text-blue-400" size={20} />
              <h2 className="text-lg font-serif font-bold text-white">Water Intake Tracking</h2>
            </div>
            <span className="text-sm text-dark-400">{waterGlasses}/8 glasses ({waterGlasses * 250} ml)</span>
          </div>
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleWaterClick(i)}
                className={`w-12 h-14 rounded-xl flex items-center justify-center transition-all text-lg ${
                  i < waterGlasses
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5'
                    : 'bg-dark-900 text-dark-600 border border-dark-800 hover:border-blue-500/20'
                }`}
              >
                <FiDroplet size={20} />
              </button>
            ))}
          </div>
          <div className="mt-4 h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500"
              animate={{ width: `${(waterGlasses / 8) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
