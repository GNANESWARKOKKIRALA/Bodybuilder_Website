import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiCheckCircle, FiCircle, FiClock, FiChevronRight,
  FiAward, FiZap, FiActivity
} from 'react-icons/fi';
import { workoutService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function ClientWorkouts() {
  const [activeProgram, setActiveProgram] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [markedDone, setMarkedDone] = useState({}); // format: { 'dayIdx-exIdx': true }

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const programRes = await workoutService.getMyProgram();
        if (programRes.data.success && programRes.data.data.program) {
          setActiveProgram(programRes.data.data.program);
        }
        
        const historyRes = await workoutService.getWorkoutHistory();
        if (historyRes.data.success) {
          setHistory(historyRes.data.data.items || []);
        }
      } catch (err) {
        console.error("Error loading workout data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkouts();
  }, []);

  const toggleExercise = (dayIdx, exIdx, exerciseId, sets, reps) => {
    const key = `${dayIdx}-${exIdx}`;
    const newStatus = !markedDone[key];
    setMarkedDone(prev => ({ ...prev, [key]: newStatus }));
    
    // If marking as done, log it to the backend database!
    if (newStatus) {
      workoutService.logWorkout({
        exercise_id: exerciseId,
        sets_completed: sets,
        reps_completed: String(reps),
        workout_date: new Date().toISOString().split('T')[0],
        notes: "Marked done from daily schedule"
      }).catch(err => console.error("Error logging workout:", err));
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
          <FiZap className="text-dark-950 text-xl" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Workouts | Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {activeProgram ? (
          <>
            {/* Program Header */}
            <motion.div variants={fadeIn} className="card gradient-gold relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full bg-dark-950/30 text-white text-xs font-bold uppercase">
                    {activeProgram.difficulty}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark-950">{activeProgram.name}</h1>
                <p className="text-dark-800 mt-1">
                  {activeProgram.duration_weeks} Weeks Program • Goal: {activeProgram.goal?.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-dark-900/80 text-xs max-w-xl mt-2">{activeProgram.description}</p>
              </div>
            </motion.div>

            {/* Daily Workout Cards */}
            <motion.div variants={stagger} className="space-y-4">
              {activeProgram.days && activeProgram.days.map((day, dayIdx) => (
                <motion.div
                  key={day.id || dayIdx}
                  variants={fadeIn}
                  className="card overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gold-500/10 text-gold-400">
                        <FiZap size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Day {day.day_number} — {day.name}</h3>
                        <p className="text-xs text-dark-400">Focus: {day.focus_area || 'Workout'} • {day.exercises?.length || 0} exercises</p>
                      </div>
                    </div>
                  </div>
                  {day.notes && (
                    <p className="text-xs text-dark-500 bg-dark-900/50 p-2.5 rounded-lg mb-3 border border-white/5">
                      <strong>Coach Notes:</strong> {day.notes}
                    </p>
                  )}

                  <div className="space-y-2">
                    {day.exercises && day.exercises.map((we, exIdx) => {
                      const doneKey = `${dayIdx}-${exIdx}`;
                      const isDone = !!markedDone[doneKey];
                      return (
                        <div
                          key={we.id || exIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-dark-800/50 ${
                            isDone ? 'bg-dark-900/30' : 'bg-dark-900/50'
                          }`}
                          onClick={() => toggleExercise(dayIdx, exIdx, we.exercise_id, we.sets, we.reps)}
                        >
                          <button className="flex-shrink-0 text-gold-400">
                            {isDone ? <FiCheckCircle size={20} className="text-green-400" /> : <FiCircle size={20} />}
                          </button>
                          <span className={`flex-1 text-sm font-medium ${isDone ? 'text-dark-500 line-through' : 'text-white'}`}>
                            {we.exercise?.name || 'Exercise'}
                          </span>
                          <div className="flex items-center gap-4 text-xs text-dark-400">
                            <span>{we.sets} × {we.reps} reps</span>
                            <span className="flex items-center gap-1"><FiClock size={12} /> {we.rest_seconds}s rest</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            variants={fadeIn}
            className="card text-center py-16 max-w-xl mx-auto flex flex-col items-center justify-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <FiZap size={28} />
            </div>
            <h2 className="text-xl font-serif font-bold text-white">No Program Assigned</h2>
            <p className="text-dark-400 text-sm max-w-md">
              Coach Gnaneswar has not assigned a personalized workout program to your profile yet.
              Please complete your physical profile metrics (weight, height, goals) so the coach can design your optimal routine.
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

        {/* Workout History */}
        <motion.div variants={fadeIn} className="card">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-gold-400" size={20} />
            <h2 className="text-lg font-serif font-bold text-white">Workout Logging History</h2>
          </div>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Exercise</th>
                    <th className="pb-3 pr-4">Sets</th>
                    <th className="pb-3 pr-4">Reps completed</th>
                    <th className="pb-3">Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id || i} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                      <td className="py-3 pr-4 text-dark-300">{h.workout_date}</td>
                      <td className="py-3 pr-4 text-white font-medium">{h.exercise_name || 'Exercise'}</td>
                      <td className="py-3 pr-4 text-dark-300">{h.sets_completed}</td>
                      <td className="py-3 pr-4 text-dark-300">{h.reps_completed}</td>
                      <td className="py-3 text-gold-400 text-xs">
                        {h.created_at ? new Date(h.created_at).toLocaleTimeString() : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-dark-500 py-6 text-center">No logged workouts yet. Tick off exercises to record your progress.</p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
