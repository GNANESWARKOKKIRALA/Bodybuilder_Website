import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiFilter, FiGrid, FiList, FiSend,
  FiClipboard, FiTrendingUp, FiCalendar, FiUser, FiX, FiBell
} from 'react-icons/fi';
import { userService, workoutService, nutritionService, notificationService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

export default function AdminClients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Data States
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  
  // Form States
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch clients list
      const clientsRes = await userService.getAllUsers({ role: 'client' });
      if (clientsRes.data.success) {
        setClients(clientsRes.data.data.items || []);
      }
      
      // Fetch available workout programs
      const programsRes = await workoutService.getPrograms();
      if (programsRes.data.success) {
        setPrograms(programsRes.data.data.items || []);
      }
      
      // Fetch available nutrition plans
      const plansRes = await nutritionService.getPlans();
      if (plansRes.data.success) {
        setPlans(plansRes.data.data.items || []);
      }
    } catch (err) {
      console.error("Error loading admin clients info:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const openAssignModal = (client) => {
    setSelectedClient(client);
    setSelectedProgramId(client.profile?.workout_program_id || '');
    setSelectedPlanId(client.profile?.nutrition_plan_id || '');
    setShowAssignModal(true);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      setActionLoading(true);
      // Assign Workout Program
      await workoutService.assignProgram(selectedClient.id, selectedProgramId ? parseInt(selectedProgramId) : null);
      
      // Assign Nutrition Plan
      await nutritionService.assignPlan(selectedClient.id, selectedPlanId ? parseInt(selectedPlanId) : null);
      
      setShowAssignModal(false);
      fetchInitialData(); // reload
    } catch (err) {
      console.error("Error during program assignment:", err);
      alert("Failed to update program assignments");
    } finally {
      setActionLoading(false);
    }
  };

  const openNotifyModal = (client) => {
    setSelectedClient(client);
    setNotifyTitle('Daily Suggestion & Routine Update');
    setNotifyMessage('');
    setShowNotifyModal(true);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!selectedClient || !notifyTitle || !notifyMessage) return;
    
    try {
      setActionLoading(true);
      await notificationService.getNotifications(); // trigger placeholder check
      // Create targeted notification
      const res = await apiPostNotification({
        user_id: selectedClient.id,
        title: notifyTitle,
        message: notifyMessage,
        notification_type: 'info'
      });
      
      setShowNotifyModal(false);
      alert("Notification sent successfully!");
    } catch (err) {
      console.error("Error sending custom notification:", err);
      alert("Failed to send notification");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper local function to send notification since it is admin-only
  const apiPostNotification = async (payload) => {
    // Import axios configuration or call backend route directly
    const api = (await import('../../services/api')).default;
    return api.post('/notifications', payload);
  };

  const filtered = clients.filter(c => {
    const fullName = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-dark-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center"
        >
          <FiUser className="text-dark-950 text-xl" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Clients | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Client Management</h1>
            <p className="text-dark-400 mt-1">{clients.length} active registered clients</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gold-500 text-dark-950' : 'bg-dark-900 text-dark-400'}`}
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gold-500 text-dark-950' : 'bg-dark-900 text-dark-400'}`}
            >
              <FiList size={18} />
            </button>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </motion.div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map(client => {
              const activeProg = programs.find(p => p.id === client.profile?.workout_program_id);
              const activePlan = plans.find(p => p.id === client.profile?.nutrition_plan_id);
              
              return (
                <motion.div key={client.id} variants={fadeIn} className="card hover:border-gold-500/30 group flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 font-bold text-sm">
                        {client.first_name?.[0]}{client.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{client.first_name} {client.last_name}</h3>
                        <p className="text-xs text-dark-400 truncate max-w-[150px]">{client.email}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] text-dark-400 uppercase tracking-wider">Assigned Workout</p>
                        <p className="text-sm font-medium text-gold-400 truncate">
                          {activeProg ? activeProg.name : 'No Program Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-dark-400 uppercase tracking-wider">Assigned Nutrition</p>
                        <p className="text-sm font-medium text-blue-400 truncate">
                          {activePlan ? activePlan.name : 'No Meal Plan Assigned'}
                        </p>
                      </div>

                      <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                        <span className="text-dark-400">H: {client.profile?.height_cm ? `${client.profile.height_cm} cm` : 'N/A'}</span>
                        <span className="text-dark-400">W: {client.profile?.weight_kg ? `${client.profile.weight_kg} kg` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 pt-4 border-t border-dark-800">
                    <button 
                      onClick={() => openAssignModal(client)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FiClipboard size={12} /> Assign
                    </button>
                    <button 
                      onClick={() => openNotifyModal(client)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FiBell size={12} /> Alert
                    </button>
                    <button 
                      onClick={() => navigate('/admin/chat', { state: { selectUser: client } })}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <FiSend size={12} /> Chat
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Table View */
          <motion.div variants={fadeIn} className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                    <th className="pb-3 pr-4">Client</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Assigned Workout</th>
                    <th className="pb-3 pr-4">Assigned Nutrition</th>
                    <th className="pb-3 pr-4">Weight</th>
                    <th className="pb-3 pr-4">Height</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(client => {
                    const activeProg = programs.find(p => p.id === client.profile?.workout_program_id);
                    const activePlan = plans.find(p => p.id === client.profile?.nutrition_plan_id);
                    
                    return (
                      <tr key={client.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 text-xs font-bold">
                              {client.first_name?.[0]}{client.last_name?.[0]}
                            </div>
                            <span className="text-white font-medium">{client.first_name} {client.last_name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-dark-400">{client.email}</td>
                        <td className="py-3 pr-4 text-gold-400 font-medium truncate max-w-[150px]">{activeProg ? activeProg.name : 'None'}</td>
                        <td className="py-3 pr-4 text-blue-400 font-medium truncate max-w-[150px]">{activePlan ? activePlan.name : 'None'}</td>
                        <td className="py-3 pr-4 text-dark-400">{client.profile?.weight_kg ? `${client.profile.weight_kg} kg` : 'N/A'}</td>
                        <td className="py-3 pr-4 text-dark-400">{client.profile?.height_cm ? `${client.profile.height_cm} cm` : 'N/A'}</td>
                        <td className="py-3">
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => openAssignModal(client)}
                              className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-gold-400 transition-colors"
                              title="Assign Routines"
                            >
                              <FiClipboard size={14} />
                            </button>
                            <button 
                              onClick={() => openNotifyModal(client)}
                              className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-blue-400 transition-colors"
                              title="Send Specific Alert"
                            >
                              <FiBell size={14} />
                            </button>
                            <button 
                              onClick={() => navigate('/admin/chat', { state: { selectUser: client } })}
                              className="p-1.5 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-green-400 transition-colors"
                              title="Chat Thread"
                            >
                              <FiSend size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-dark-600 mb-3" size={36} />
            <p className="text-dark-400">No active clients found matching search</p>
          </div>
        )}
      </motion.div>

      {/* --- MODAL 1: ASSIGN PROGRAMS --- */}
      <AnimatePresence>
        {showAssignModal && selectedClient && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md p-6 relative"
            >
              <button 
                onClick={() => setShowAssignModal(false)} 
                className="absolute right-4 top-4 text-dark-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
              
              <h2 className="text-xl font-serif font-bold text-white mb-2">Assign Client Routines</h2>
              <p className="text-xs text-dark-400 mb-4">
                Assign customized plans for <strong>{selectedClient.first_name} {selectedClient.last_name}</strong>.
              </p>
              
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="text-xs text-dark-300 font-semibold mb-1 block">Workout Program</label>
                  <select 
                    value={selectedProgramId} 
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">No Active Program / Unassign</option>
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.difficulty})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-dark-300 font-semibold mb-1 block">Diet / Nutrition Plan</label>
                  <select 
                    value={selectedPlanId} 
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="input-field"
                  >
                    <option value="">No Active Diet / Unassign</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.daily_calories} kcal)</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Saving...' : 'Save Assignments'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: SEND TARGETED NOTIFICATION --- */}
      <AnimatePresence>
        {showNotifyModal && selectedClient && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md p-6 relative"
            >
              <button 
                onClick={() => setShowNotifyModal(false)} 
                className="absolute right-4 top-4 text-dark-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
              
              <h2 className="text-xl font-serif font-bold text-white mb-2">Send Client Alert</h2>
              <p className="text-xs text-dark-400 mb-4">
                This triggers a push notification pop-up for <strong>{selectedClient.first_name} {selectedClient.last_name}</strong>.
              </p>
              
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="text-xs text-dark-300 font-semibold mb-1 block">Alert Title</label>
                  <input 
                    type="text" 
                    value={notifyTitle} 
                    onChange={(e) => setNotifyTitle(e.target.value)} 
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs text-dark-300 font-semibold mb-1 block">Alert Message / Suggestion</label>
                  <textarea 
                    value={notifyMessage} 
                    onChange={(e) => setNotifyMessage(e.target.value)} 
                    rows={4}
                    placeholder="Enter daily workout suggestions or important updates..."
                    className="input-field font-sans"
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="btn-primary w-full py-2.5 mt-2"
                >
                  {actionLoading ? 'Sending...' : 'Send Direct Alert'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
