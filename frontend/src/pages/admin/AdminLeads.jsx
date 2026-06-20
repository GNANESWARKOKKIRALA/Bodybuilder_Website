import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiMail, FiPhone, FiCalendar,
  FiTrash2, FiX, FiRefreshCw
} from 'react-icons/fi';
import { contactService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const statusColors = {
  new:      'bg-red-500/15 text-red-400 border border-red-500/20',
  read:     'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  replied:  'bg-green-500/15 text-green-400 border border-green-500/20',
  archived: 'bg-dark-700 text-dark-400 border border-dark-600',
};

export default function AdminLeads() {
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadStatus, setLeadStatus] = useState('new');
  const [saving, setSaving]         = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await contactService.getAll();
      if (res.data.success) {
        setLeads(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading contact submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleOpenDetail = async (lead) => {
    setSelectedLead(lead);
    setLeadStatus(lead.status || 'new');
    // Auto-mark as read
    if ((lead.status || 'new') === 'new') {
      try {
        await contactService.updateStatus(lead.id, 'read');
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'read' } : l));
        setLeadStatus('read');
      } catch (_) {}
    }
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      setSaving(true);
      await contactService.updateStatus(selectedLead.id, leadStatus);
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: leadStatus } : l));
      setSelectedLead(null);
    } catch (err) {
      console.error('Error saving lead status:', err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = (l.name || '').toLowerCase().includes(q) ||
                        (l.email || '').toLowerCase().includes(q) ||
                        (l.subject || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || (l.status || 'new').toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <>
      <Helmet><title>Leads | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Lead Inquiries</h1>
            <p className="text-dark-400 mt-1">
              {loading ? 'Loading…' : `${leads.length} real contact submission${leads.length !== 1 ? 's' : ''} from the website`}
            </p>
          </div>
          <button
            onClick={fetchLeads}
            className="btn-secondary self-start flex items-center gap-2 text-sm"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search by name, email or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[150px]"
          >
            <option value="All">All Statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </motion.div>

        {/* Leads Table */}
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
                    <th className="pb-3 pr-4">Prospect</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date Received</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => handleOpenDetail(lead)}
                      className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 pr-4">
                        <div>
                          <span className="text-white font-medium block">{lead.name}</span>
                          <span className="text-xs text-dark-400 block mt-0.5">{lead.email}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-dark-300 font-medium">
                        <span className="line-clamp-1">{lead.subject}</span>
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusColors[lead.status || 'new']}`}>
                          {lead.status || 'new'}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-dark-400">
                        {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <FiMail className="mx-auto text-dark-600 mb-3" size={36} />
                <p className="text-white font-semibold">No leads yet</p>
                <p className="text-dark-400 text-sm mt-1">
                  When someone submits the contact form on your website, their inquiry will appear here.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h3 className="text-lg font-serif font-bold text-white">Inquiry Details</h3>
                <button onClick={() => setSelectedLead(null)} className="text-dark-400 hover:text-white transition-colors">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveStatus} className="p-6 space-y-4">
                {/* Lead Info */}
                <div className="space-y-2 p-4 rounded-xl bg-dark-950 border border-white/5 text-sm">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="font-bold text-white text-base">{selectedLead.name}</span>
                    <span className="text-xs text-dark-400 flex items-center gap-1">
                      <FiCalendar />
                      {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <div className="space-y-1 text-dark-300">
                    <p className="flex items-center gap-2">
                      <FiMail className="text-gold-500/80" />
                      <a href={`mailto:${selectedLead.email}`} className="hover:text-gold-400 transition-colors">{selectedLead.email}</a>
                    </p>
                    {selectedLead.phone && (
                      <p className="flex items-center gap-2">
                        <FiPhone className="text-gold-500/80" />
                        <a href={`tel:${selectedLead.phone}`} className="hover:text-gold-400 transition-colors">{selectedLead.phone}</a>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-dark-400 uppercase tracking-wider">Subject</label>
                  <p className="text-white font-medium text-sm">{selectedLead.subject}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-dark-400 uppercase tracking-wider">Message</label>
                  <p className="text-dark-200 text-sm leading-relaxed p-3 rounded-lg bg-white/5 border border-white/5">
                    {selectedLead.message}
                  </p>
                </div>

                <hr className="border-white/5" />

                {/* Update Status */}
                <div className="space-y-1">
                  <label className="text-xs text-dark-400 uppercase tracking-wider">Follow-Up Status</label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className="px-5 py-2.5 rounded-xl bg-dark-800 text-white hover:bg-dark-700 transition-colors text-sm font-semibold"
                  >
                    Close
                  </button>
                  <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? 'Saving…' : 'Save Status'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
