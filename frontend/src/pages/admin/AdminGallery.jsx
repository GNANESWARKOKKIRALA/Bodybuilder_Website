import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiTrash2, FiCheck,
  FiAward, FiMessageSquare, FiTrendingDown, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { galleryService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

export default function AdminGallery() {
  const [tab, setTab] = useState('transformations');
  const [transformations, setTransformations] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [clientName, setClientName] = useState('');
  const [beforeImg, setBeforeImg] = useState('');
  const [afterImg, setAfterImg] = useState('');
  const [duration, setDuration] = useState('');
  const [resultVal, setResultVal] = useState('');
  const [program, setProgram] = useState('');
  const [quoteText, setQuoteText] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tRes, testRes] = await Promise.all([
        galleryService.getTransformations(),
        galleryService.getTestimonials(),
      ]);
      if (tRes.data.success) {
        setTransformations(tRes.data.data.transformations || tRes.data.data.items || []);
      }
      if (testRes.data.success) {
        setTestimonials(testRes.data.data.testimonials || testRes.data.data.items || []);
      }
    } catch (err) {
      setError('Failed to load gallery data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleOpenModal = () => {
    setClientName('');
    setBeforeImg('');
    setAfterImg('');
    setDuration('');
    setResultVal('');
    setProgram('');
    setQuoteText('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (tab === 'transformations') {
        const formData = new FormData();
        formData.append('name', clientName);
        formData.append('before_url', beforeImg);
        formData.append('after_url', afterImg);
        formData.append('duration', duration);
        formData.append('result', resultVal);
        formData.append('program', program);
        await galleryService.createTransformation(formData);
      } else {
        await galleryService.createTestimonial({
          name: clientName,
          quote: quoteText,
          rating: 5,
          status: 'Approved',
        });
      }
      setIsModalOpen(false);
      await fetchAll();
    } catch (err) {
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransform = async (id) => {
    if (window.confirm('Delete this transformation entry?')) {
      try {
        await galleryService.deleteTransformation(id);
        await fetchAll();
      } catch (err) {
        alert('Failed to delete transformation.');
      }
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm('Delete this testimonial entry?')) {
      try {
        await galleryService.deleteTransformation(id);
        await fetchAll();
      } catch (err) {
        alert('Failed to delete testimonial.');
      }
    }
  };

  const handleApproveTestimonial = async (id) => {
    try {
      await galleryService.toggleFeatured(id);
      await fetchAll();
    } catch (err) {
      alert('Failed to update testimonial.');
    }
  };

  return (
    <>
      <Helmet><title>Gallery | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Gallery & Social Proof</h1>
            <p className="text-dark-400 mt-1">Manage transformations, client results and testimonials</p>
          </div>
          <button onClick={handleOpenModal} className="btn-primary self-start flex items-center gap-2">
            <FiPlus size={16} /> Add {tab === 'transformations' ? 'Transformation' : 'Testimonial'}
          </button>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={fadeIn} className="flex border-b border-dark-800">
          <button
            onClick={() => setTab('transformations')}
            className={`px-6 py-3 font-semibold text-sm transition-all relative ${
              tab === 'transformations' ? 'text-gold-400' : 'text-dark-400 hover:text-white'
            }`}
          >
            Client Transformations
            {tab === 'transformations' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
            )}
          </button>
          <button
            onClick={() => setTab('testimonials')}
            className={`px-6 py-3 font-semibold text-sm transition-all relative ${
              tab === 'testimonials' ? 'text-gold-400' : 'text-dark-400 hover:text-white'
            }`}
          >
            Client Testimonials
            {tab === 'testimonials' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400" />
            )}
          </button>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {tab === 'transformations' ? (
            <motion.div
              key="transformations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {transformations.map((item) => (
                <div key={item.id} className="card relative flex flex-col p-4">
                  {/* Photo split container */}
                  <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden h-48 bg-dark-950">
                    <div className="relative">
                      <img src={item.before} alt="Before" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/75 rounded text-[10px] uppercase font-bold text-white tracking-wider">Before</div>
                    </div>
                    <div className="relative">
                      <img src={item.after} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-gold-500 text-[10px] uppercase font-bold text-dark-950 tracking-wider">After</div>
                    </div>
                  </div>

                  <div className="mt-4 flex-1">
                    <h3 className="text-white font-serif font-bold text-lg">{item.name}</h3>
                    <p className="text-xs text-dark-400 mt-1">Program: {item.program}</p>
                    
                    <div className="flex gap-4 mt-3">
                      <span className="flex items-center gap-1.5 text-xs text-gold-400 font-semibold">
                        <FiTrendingDown size={14} />
                        {item.weightDiff}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-dark-300">
                        <FiAward size={14} />
                        {item.duration}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    <button
                      onClick={() => handleDeleteTransform(item.id)}
                      className="p-2 bg-black/60 rounded-lg text-dark-400 hover:text-red-400 transition-colors backdrop-blur-sm"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {transformations.length === 0 && (
                <div className="col-span-full text-center py-12 card">
                  <FiAward className="mx-auto text-dark-600 mb-3" size={32} />
                  <p className="text-dark-400">No transformations added yet</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="testimonials"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              {testimonials.map((item) => (
                <div key={item.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-white font-bold text-base">{item.name}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.status === 'Approved'
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-dark-300 text-sm italic">"{item.quote}"</p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {item.status === 'Pending' && (
                      <button
                        onClick={() => handleApproveTestimonial(item.id)}
                        className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                        title="Approve"
                      >
                        <FiCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTestimonial(item.id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {testimonials.length === 0 && (
                <div className="text-center py-12 card">
                  <FiMessageSquare className="mx-auto text-dark-600 mb-3" size={32} />
                  <p className="text-dark-400">No testimonials found</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-serif font-bold text-white">
                    Add {tab === 'transformations' ? 'Transformation Result' : 'Client Testimonial'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-white transition-colors">
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-dark-400 uppercase tracking-wider">Client Name</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="input-field"
                    />
                  </div>

                  {tab === 'transformations' ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-dark-400 uppercase tracking-wider">Duration</label>
                          <input
                            type="text"
                            required
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g. 12 Weeks"
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-dark-400 uppercase tracking-wider">Result Metric</label>
                          <input
                            type="text"
                            required
                            value={resultVal}
                            onChange={(e) => setResultVal(e.target.value)}
                            placeholder="e.g. 12kg Lost or 5kg Muscle Gained"
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-dark-400 uppercase tracking-wider">Program Followed</label>
                        <input
                          type="text"
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          placeholder="e.g. Clean Bulk Plan 3000"
                          className="input-field"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-dark-400 uppercase tracking-wider">Before Photo URL</label>
                          <input
                            type="text"
                            value={beforeImg}
                            onChange={(e) => setBeforeImg(e.target.value)}
                            placeholder="Optional url..."
                            className="input-field"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-dark-400 uppercase tracking-wider">After Photo URL</label>
                          <input
                            type="text"
                            value={afterImg}
                            onChange={(e) => setAfterImg(e.target.value)}
                            placeholder="Optional url..."
                            className="input-field"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-xs text-dark-400 uppercase tracking-wider">Testimonial Quote</label>
                      <textarea
                        required
                        rows={4}
                        value={quoteText}
                        onChange={(e) => setQuoteText(e.target.value)}
                        placeholder="What did the client say about their fitness experience?..."
                        className="input-field resize-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-dark-800 text-white hover:bg-dark-700 transition-colors text-sm font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Add Entry
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
