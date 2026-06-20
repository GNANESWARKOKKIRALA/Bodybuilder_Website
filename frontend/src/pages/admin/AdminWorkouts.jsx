import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit, FiTrash2, FiSearch, FiUsers,
  FiClock, FiX, FiChevronDown, FiChevronUp, FiClipboard
} from 'react-icons/fi';
import { workoutService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const levelColors = {
  beginner: 'bg-green-500/15 text-green-400',
  intermediate: 'bg-blue-500/15 text-blue-400',
  advanced: 'bg-red-500/15 text-red-400',
};

export default function AdminWorkouts() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [goal, setGoal] = useState('muscle_gain');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [description, setDescription] = useState('');
  const [days, setDays] = useState([
    { day_number: 1, name: 'Day 1: Push Day', focus_area: 'Chest, Shoulders & Triceps', notes: '', exercises: [] }
  ]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await workoutService.getPrograms();
      if (res.data.success) {
        // Fetch detailed program details (with days/exercises) for each
        const list = res.data.data.items || [];
        const detailedList = await Promise.all(list.map(async (p) => {
          try {
            const detailRes = await workoutService.getProgramById(p.id);
            return detailRes.data.success ? detailRes.data.data.program : p;
          } catch {
            return p;
          }
        }));
        setPrograms(detailedList);
      }
    } catch (err) {
      console.error("Error loading programs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAddDay = () => {
    setDays(prev => [
      ...prev,
      { day_number: prev.length + 1, name: `Day ${prev.length + 1}`, focus_area: '', notes: '', exercises: [] }
    ]);
  };

  const handleAddExerciseToDay = (dayIdx) => {
    const updated = [...days];
    updated[dayIdx].exercises.push({
      exercise_id: 1, // flat bench press by default
      sets: 3,
      reps: '10',
      rest_seconds: 60,
      notes: ''
    });
    setDays(updated);
  };

  const handleRemoveExercise = (dayIdx, exIdx) => {
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  const handleExerciseChange = (dayIdx, exIdx, field, value) => {
    const updated = [...days];
    updated[dayIdx].exercises[exIdx][field] = value;
    setDays(updated);
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    if (!name.strip()) return;
    
    try {
      setActionLoading(true);
      const payload = {
        name,
        difficulty,
        goal,
        duration_weeks: parseInt(durationWeeks),
        description,
        days
      };
      
      const res = await workoutService.createProgram(payload);
      if (res.data.success) {
        setShowCreateForm(false);
        // Reset form
        setName('');
        setDescription('');
        setDays([{ day_number: 1, name: 'Day 1: Push Day', focus_area: 'Chest, Shoulders & Triceps', notes: '', exercises: [] }]);
        fetchPrograms();
      }
    } catch (err) {
      console.error("Error creating workout program:", err);
      alert("Failed to save program to database. Check if exercise IDs are correct.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    if (!window.confirm("Are you sure you want to delete this workout program?")) return;
    try {
      const res = await workoutService.deleteProgram(id);
      if (res.data.success) {
        fetchPrograms();
      }
    } catch (err) {
      console.error("Error deleting program:", err);
    }
  };

  return (
    <>
      <Helmet><title>Workout Programs | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Workout Program Catalog</h1>
            <p className="text-dark-400 mt-1">{programs.length} active templates in database</p>
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary self-start">
            <FiPlus size={16} /> Create Program Template
          </button>
        </motion.div>

        {/* Create/Edit Program Form */}
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
                <h2 className="text-xl font-serif font-bold text-white">Create New Program Template</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-dark-400 hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateProgram} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Program Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g., PPL Hypertrophy" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Difficulty Level</label>
                    <select 
                      className="input-field"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Program Goal</label>
                    <select 
                      className="input-field"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                      <option value="general_fitness">General Fitness</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-dark-300 font-semibold mb-1.5">Duration (weeks)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="12" 
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-dark-300 font-semibold mb-1.5">Description</label>
                  <textarea 
                    className="input-field resize-none" 
                    rows={3} 
                    placeholder="Describe program objectives..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Days Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <label className="text-xs text-dark-300 font-bold uppercase tracking-wider">Workout Split Days Builder</label>
                    <button 
                      type="button"
                      onClick={handleAddDay} 
                      className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1 bg-gold-500/10 px-3 py-1.5 rounded-lg border border-gold-500/10"
                    >
                      <FiPlus size={12} /> Add Workout Day
                    </button>
                  </div>
                  
                  {days.map((day, dayIdx) => (
                    <div key={dayIdx} className="p-4 rounded-xl bg-dark-900/40 border border-dark-800 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          className="input-field py-1.5 text-sm sm:col-span-2" 
                          placeholder="Day Title (e.g., Day 1: Bench focus)" 
                          value={day.name}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dayIdx].name = e.target.value;
                            setDays(updated);
                          }}
                          required
                        />
                        <input 
                          type="text" 
                          className="input-field py-1.5 text-sm" 
                          placeholder="Focus Area (e.g., Chest)" 
                          value={day.focus_area}
                          onChange={(e) => {
                            const updated = [...days];
                            updated[dayIdx].focus_area = e.target.value;
                            setDays(updated);
                          }}
                        />
                      </div>

                      {/* Exercises inside Day */}
                      <div className="space-y-2">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-dark-950/50 text-sm border border-white/5">
                            <select
                              value={ex.exercise_id}
                              onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'exercise_id', parseInt(e.target.value))}
                              className="input-field py-1 px-2 text-xs flex-1 min-w-[120px]"
                            >
                              <option value="1">Flat Bench Press (ID: 1)</option>
                              <option value="2">Incline Dumbbell Press (ID: 2)</option>
                              <option value="3">Barbell Squats (ID: 3)</option>
                              <option value="4">Pull-ups (ID: 4)</option>
                              <option value="5">Dumbbell Bicep Curl (ID: 5)</option>
                            </select>
                            <input 
                              type="number" 
                              className="w-16 input-field py-1 px-2 text-xs text-center" 
                              placeholder="Sets" 
                              value={ex.sets}
                              onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'sets', parseInt(e.target.value))}
                              required
                            />
                            <input 
                              type="text" 
                              className="w-20 input-field py-1 px-2 text-xs text-center" 
                              placeholder="Reps (e.g. 10)" 
                              value={ex.reps}
                              onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'reps', e.target.value)}
                              required
                            />
                            <input 
                              type="number" 
                              className="w-20 input-field py-1 px-2 text-xs text-center" 
                              placeholder="Rest (sec)" 
                              value={ex.rest_seconds}
                              onChange={(e) => handleExerciseChange(dayIdx, exIdx, 'rest_seconds', parseInt(e.target.value))}
                              required
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveExercise(dayIdx, exIdx)} 
                              className="text-dark-500 hover:text-red-400 p-1"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleAddExerciseToDay(dayIdx)}
                        className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
                      >
                        <FiPlus size={12} /> Add Exercise row
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary">
                    {actionLoading ? 'Saving...' : 'Save Program Template'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Programs List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div variants={stagger} className="space-y-4">
            {programs.map(program => (
              <motion.div key={program.id} variants={fadeIn} className="card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedProgram(expandedProgram === program.id ? null : program.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
                      <FiClipboard size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{program.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${levelColors[program.difficulty] || 'bg-dark-800 text-dark-400'}`}>
                          {program.difficulty}
                        </span>
                        <span className="text-xs text-dark-400 font-semibold uppercase">{program.goal?.replace('_', ' ')}</span>
                        <span className="text-xs text-dark-400 flex items-center gap-1">
                          <FiClock size={12} /> {program.duration_weeks} weeks
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors" 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProgram(program.id); }}
                    >
                      <FiTrash2 size={16} />
                    </button>
                    {expandedProgram === program.id ? <FiChevronUp className="text-dark-400" /> : <FiChevronDown className="text-dark-400" />}
                  </div>
                </div>

                {expandedProgram === program.id && (
                  <div className="mt-4 pt-4 border-t border-dark-800 space-y-4">
                    <p className="text-sm text-dark-300 italic">{program.description || 'No description provided'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {program.days && program.days.map((day, i) => (
                        <div key={day.id || i} className="p-4 rounded-xl bg-dark-900/50 border border-dark-800">
                          <h4 className="font-bold text-white text-sm mb-2">{day.name} (Focus: {day.focus_area || 'General'})</h4>
                          <ul className="space-y-1 text-xs text-dark-400">
                            {day.exercises && day.exercises.map((we, k) => (
                              <li key={we.id || k} className="flex justify-between py-1 border-b border-dark-800/30">
                                <span className="text-dark-200">{we.exercise?.name || 'Exercise'}</span>
                                <span className="text-gold-400">{we.sets} × {we.reps} reps (rest: {we.rest_seconds}s)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && programs.length === 0 && (
          <div className="text-center py-12">
            <FiClipboard className="mx-auto text-dark-600 mb-3" size={36} />
            <p className="text-dark-400">No workout programs found in the database. Create a template to get started.</p>
          </div>
        )}
      </motion.div>
    </>
  );
}
