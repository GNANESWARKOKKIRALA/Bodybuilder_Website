import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiUsers, FiX,
  FiTarget, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { nutritionService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const goalColors = {
  muscle_gain: 'bg-blue-500/15 text-blue-400',
  weight_loss: 'bg-red-500/15 text-red-400',
  maintenance: 'bg-purple-500/15 text-purple-400',
  endurance: 'bg-green-500/15 text-green-400'
};

export default function AdminNutrition() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('muscle_gain');
  const [calories, setCalories] = useState(2500);
  const [protein, setProtein] = useState(180);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(70);
  const [dietType, setDietType] = useState('non_vegetarian');
  const [description, setDescription] = useState('');
  const [meals, setMeals] = useState([
    { meal_type: 'breakfast', name: 'Breakfast Oats & Eggs', description: '4 egg whites, 2 whole eggs, 80g oats', time_suggestion: '08:00 AM', calories: 600, protein_grams: 40, carbs_grams: 65, fat_grams: 18 }
  ]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await nutritionService.getPlans();
      if (res.data.success) {
        const list = res.data.data.items || [];
        const detailedList = await Promise.all(list.map(async (p) => {
          try {
            const detailRes = await nutritionService.getPlanById(p.id);
            return detailRes.data.success ? detailRes.data.data.plan : p;
          } catch {
            return p;
          }
        }));
        setPlans(detailedList);
      }
    } catch (err) {
      console.error("Error loading nutrition plans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddMeal = () => {
    setMeals(prev => [
      ...prev,
      { meal_type: 'lunch', name: 'Meal', description: '', time_suggestion: '01:00 PM', calories: 500, protein_grams: 35, carbs_grams: 50, fat_grams: 15 }
    ]);
  };

  const handleRemoveMeal = (idx) => {
    const updated = [...meals];
    updated.splice(idx, 1);
    setMeals(updated);
  };

  const handleMealChange = (idx, field, value) => {
    const updated = [...meals];
    updated[idx][field] = value;
    setMeals(updated);
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setActionLoading(true);
      const payload = {
        name,
        goal,
        daily_calories: parseInt(calories),
        protein_grams: parseFloat(protein),
        carbs_grams: parseFloat(carbs),
        fat_grams: parseFloat(fat),
        diet_type: dietType,
        description,
        meals
      };

      const res = await nutritionService.createPlan(payload);
      if (res.data.success) {
        setShowCreateForm(false);
        // Reset form
        setName('');
        setDescription('');
        setCalories(2500);
        setProtein(180);
        setCarbs(250);
        setFat(70);
        setMeals([{ meal_type: 'breakfast', name: 'Breakfast Oats & Eggs', description: '4 egg whites, 2 whole eggs, 80g oats', time_suggestion: '08:00 AM', calories: 600, protein_grams: 40, carbs_grams: 65, fat_grams: 18 }]);
        fetchPlans();
      }
    } catch (err) {
      console.error("Error creating plan:", err);
      alert("Failed to save nutrition plan to database");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this nutrition plan?")) return;
    try {
      const res = await nutritionService.deletePlan(id);
      if (res.data.success) {
        fetchPlans();
      }
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  return (
    <>
      <Helmet><title>Nutrition Plans | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Nutrition & Diet Plans</h1>
            <p className="text-dark-400 mt-1">{plans.length} active plans in database</p>
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary self-start">
            <FiPlus size={16} /> Create Diet Plan Template
          </button>
        </motion.div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="card border-gold-500/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-white">Create New Plan Template</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-dark-400 hover:text-white">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Plan Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., Lean Muscle Plan" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Goal Category</label>
                    <select 
                      className="input-field"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Daily Calories</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="2800" 
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Protein (g)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="210" 
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Carbs (g)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="320" 
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Fat (g)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="75" 
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Diet Type</label>
                    <select 
                      className="input-field"
                      value={dietType}
                      onChange={(e) => setDietType(e.target.value)}
                    >
                      <option value="non_vegetarian">Non-Vegetarian</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="eggetarian">Eggetarian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-dark-300 font-semibold mb-1.5">Description</label>
                  <textarea 
                    className="input-field resize-none" 
                    rows={3} 
                    placeholder="Dietary details and profile mapping..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Meals Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <label className="text-xs text-dark-300 font-bold uppercase tracking-wider">Plan Meals Builder</label>
                    <button 
                      type="button"
                      onClick={handleAddMeal} 
                      className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1 bg-gold-500/10 px-3 py-1.5 rounded-lg border border-gold-500/10"
                    >
                      <FiPlus size={12} /> Add Meal Block
                    </button>
                  </div>

                  {meals.map((meal, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-dark-900/40 border border-dark-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <select
                          value={meal.meal_type}
                          onChange={(e) => handleMealChange(idx, 'meal_type', e.target.value)}
                          className="input-field py-1.5 text-sm"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="morning_snack">Morning Snack</option>
                          <option value="lunch">Lunch</option>
                          <option value="afternoon_snack">Afternoon Snack</option>
                          <option value="dinner">Dinner</option>
                          <option value="evening_snack">Evening Snack</option>
                        </select>
                        <input 
                          type="text" 
                          className="input-field py-1.5 text-sm sm:col-span-2" 
                          placeholder="Meal Title (e.g. Oats & Shake)" 
                          value={meal.name}
                          onChange={(e) => handleMealChange(idx, 'name', e.target.value)}
                          required
                        />
                        <input 
                          type="text" 
                          className="input-field py-1.5 text-sm" 
                          placeholder="Time (e.g. 08:30 AM)" 
                          value={meal.time_suggestion}
                          onChange={(e) => handleMealChange(idx, 'time_suggestion', e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        <input 
                          type="text" 
                          className="input-field py-1.5 text-sm sm:col-span-2" 
                          placeholder="Detailed Foods list description" 
                          value={meal.description}
                          onChange={(e) => handleMealChange(idx, 'description', e.target.value)}
                          required
                        />
                        <input 
                          type="number" 
                          className="input-field py-1.5 text-sm" 
                          placeholder="Kcal" 
                          value={meal.calories}
                          onChange={(e) => handleMealChange(idx, 'calories', parseInt(e.target.value))}
                          required
                        />
                        <input 
                          type="number" 
                          className="input-field py-1.5 text-sm" 
                          placeholder="Prot (g)" 
                          value={meal.protein_grams}
                          onChange={(e) => handleMealChange(idx, 'protein_grams', parseFloat(e.target.value))}
                          required
                        />
                        <div className="flex gap-2 items-center">
                          <input 
                            type="number" 
                            className="input-field py-1.5 text-sm flex-1" 
                            placeholder="Carbs" 
                            value={meal.carbs_grams}
                            onChange={(e) => handleMealChange(idx, 'carbs_grams', parseFloat(e.target.value))}
                            required
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveMeal(idx)}
                            className="text-dark-500 hover:text-red-400 p-1.5"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    {actionLoading ? 'Saving...' : 'Save Plan Template'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div variants={stagger} className="space-y-4">
            {plans.map(plan => (
              <motion.div key={plan.id} variants={fadeIn} className="card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
                      <FiTarget size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${goalColors[plan.goal] || 'bg-dark-800 text-dark-400'}`}>
                          {plan.goal?.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gold-400 font-semibold">{plan.daily_calories} kcal</span>
                        <span className="text-xs text-dark-400">P: {plan.protein_grams}g · C: {plan.carbs_grams}g · F: {plan.fat_grams}g</span>
                        <span className="text-xs text-dark-400 capitalize">Diet: {plan.diet_type?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors" 
                      onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan.id); }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                    {expandedPlan === plan.id ? <FiChevronUp className="text-dark-400" /> : <FiChevronDown className="text-dark-400" />}
                  </div>
                </div>

                {expandedPlan === plan.id && (
                  <div className="mt-4 pt-4 border-t border-dark-800 space-y-4">
                    <p className="text-sm text-dark-300 italic">{plan.description || 'No description provided'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {plan.meals && plan.meals.map((meal, i) => (
                        <div key={meal.id || i} className="p-4 rounded-xl bg-dark-900/50 border border-dark-800 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-white text-sm capitalize">{meal.meal_type} — {meal.name}</h4>
                              <span className="text-xs text-dark-500">{meal.time_suggestion}</span>
                            </div>
                            <p className="text-xs text-dark-300 mb-2 font-serif">{meal.description}</p>
                            {meal.foods && (
                              <p className="text-[11px] text-dark-500"><strong>Foods:</strong> {meal.foods}</p>
                            )}
                          </div>
                          <div className="text-[10px] text-gold-400 font-semibold border-t border-white/5 pt-2 mt-2 flex justify-between">
                            <span>Calories: {meal.calories} kcal</span>
                            <span>Macros: {meal.protein_grams}g P · {meal.carbs_grams}g C · {meal.fat_grams}g F</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && plans.length === 0 && (
          <div className="text-center py-12">
            <FiTarget className="mx-auto text-dark-600 mb-3" size={36} />
            <p className="text-dark-400">No nutrition templates found in the database. Create a plan to get started.</p>
          </div>
        )}
      </motion.div>
    </>
  );
}
