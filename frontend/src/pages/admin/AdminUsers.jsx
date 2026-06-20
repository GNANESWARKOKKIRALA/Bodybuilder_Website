import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiFilter, FiEye, FiEdit, FiUserCheck,
  FiUserX, FiChevronLeft, FiChevronRight, FiMoreVertical, FiX
} from 'react-icons/fi';
import { userService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const statusColors = {
  active: 'bg-green-500/15 text-green-400',
  inactive: 'bg-red-500/15 text-red-400',
};

const roleColors = {
  admin: 'bg-purple-500/15 text-purple-400',
  client: 'bg-gold-500/15 text-gold-400',
  lead: 'bg-blue-500/15 text-blue-400',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Role Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('lead');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        role: roleFilter === 'All' ? undefined : roleFilter.toLowerCase(),
        is_active: statusFilter === 'All' ? undefined : (statusFilter === 'Active' ? 'true' : 'false')
      };
      
      const res = await userService.getAllUsers(params);
      if (res.data.success) {
        setUsers(res.data.data.items || []);
      }
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleActive = async (userId) => {
    try {
      // Call toggleUserStatus endpoint
      const res = await userService.toggleUserStatus(userId);
      if (res.data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Error toggling user active state:", err);
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const res = await userService.updateUserRole(selectedUser.id, newRole);
      if (res.data.success) {
        setShowRoleModal(false);
        fetchUsers();
      }
    } catch (err) {
      console.error("Error updating user role:", err);
      alert("Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Users | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">User Management</h1>
            <p className="text-dark-400 mt-1">{users.length} total registered accounts</p>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search by name or email... (Press Enter)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </form>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Client">Client</option>
            <option value="Lead">Lead</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </motion.div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div variants={fadeIn} className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center text-dark-950 text-xs font-bold flex-shrink-0">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </div>
                          <span className="text-white font-medium">{user.full_name || `${user.first_name} ${user.last_name}`}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-dark-400">{user.email}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${user.is_active ? statusColors.active : statusColors.inactive}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-dark-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => openRoleModal(user)}
                            className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-gold-400 transition-colors" 
                            title="Modify User Role"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user.id)}
                            className={`p-2 rounded-lg hover:bg-dark-700 transition-colors ${
                              user.is_active
                                ? 'text-dark-400 hover:text-red-400'
                                : 'text-dark-400 hover:text-green-400'
                            }`}
                            title={user.is_active ? 'Deactivate Account' : 'Activate Account'}
                          >
                            {user.is_active ? <FiUserX size={14} /> : <FiUserCheck size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <FiSearch className="mx-auto text-dark-600 mb-3" size={32} />
                <p className="text-dark-400">No users found matching your filters</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* --- MODIFY ROLE MODAL --- */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card w-full max-w-md p-6 relative"
            >
              <button 
                onClick={() => setShowRoleModal(false)} 
                className="absolute right-4 top-4 text-dark-400 hover:text-white transition-colors"
              >
                <FiX size={20} />
              </button>
              
              <h2 className="text-xl font-serif font-bold text-white mb-2">Change User Role</h2>
              <p className="text-xs text-dark-400 mb-4">
                Update account authority for <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>.
              </p>
              
              <form onSubmit={handleUpdateRole} className="space-y-4">
                <div>
                  <label className="text-xs text-dark-300 font-semibold mb-1 block">Account Role</label>
                  <select 
                    value={newRole} 
                    onChange={(e) => setNewRole(e.target.value)}
                    className="input-field"
                  >
                    <option value="lead">Lead (Public Registered User)</option>
                    <option value="client">Client (Assigned Workouts / Meals)</option>
                    <option value="admin">Admin (System Owner)</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="btn-primary w-full py-2.5 mt-2"
                >
                  {actionLoading ? 'Saving...' : 'Update Account Role'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
