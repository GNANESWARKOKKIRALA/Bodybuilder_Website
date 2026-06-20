import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiEdit, FiTrash2, FiPlus,
  FiFolder, FiFileText, FiX, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { blogService } from '../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.05 } } };

const categories = ['Workout Tips', 'Nutrition & Diet', 'Motivation & Mindset'];

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [status, setStatus] = useState('Draft');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await blogService.getPosts();
      if (res.data.success) {
        setPosts(res.data.data.posts || res.data.data.items || []);
      }
    } catch (err) {
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title);
      setCategory(post.category || categories[0]);
      setStatus(post.status || 'Draft');
      setContent(post.content || '');
      setCoverImage(post.cover_image || '');
    } else {
      setEditingPost(null);
      setTitle('');
      setCategory(categories[0]);
      setStatus('Draft');
      setContent('');
      setCoverImage('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { title, category, status, content, cover_image: coverImage };
      if (editingPost) {
        await blogService.updatePost(editingPost.id, payload);
      } else {
        await blogService.createPost(payload);
      }
      setIsModalOpen(false);
      await fetchPosts();
    } catch (err) {
      alert('Failed to save post. Please check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogService.deletePost(id);
        await fetchPosts();
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  const filtered = posts.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <>
      <Helmet><title>Blog | Admin — Gnaneswar Fitness Platform</title></Helmet>
      <motion.div
        className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <FiAlertCircle size={18} />
            <span className="text-sm">{error}</span>
            <button onClick={fetchPosts} className="ml-auto text-sm underline">Retry</button>
          </div>
        )}
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Blog Management</h1>
            <p className="text-dark-400 mt-1">Manage fitness articles and mindset insights</p>
          </div>
          <button onClick={() => handleOpenModal()} className="btn-primary self-start flex items-center gap-2">
            <FiPlus size={16} /> Create Post
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
            <input
              type="text"
              placeholder="Search posts by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="input-field w-auto min-w-[160px]"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto min-w-[140px]"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>
        </motion.div>

        {/* Blog Posts Table */}
        <motion.div variants={fadeIn} className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-dark-400 uppercase tracking-wider border-b border-dark-800">
                  <th className="pb-3 pr-4">Post Title</th>
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Views</th>
                  <th className="pb-3 pr-4">Published Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <tr key={post.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gold-500/10 flex items-center justify-center text-gold-400 flex-shrink-0">
                          <FiFileText size={16} />
                        </div>
                        <span className="text-white font-medium line-clamp-1">{post.title}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-dark-300">
                      <span className="flex items-center gap-1.5">
                        <FiFolder size={14} className="text-gold-500/60" />
                        {post.category}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        post.status === 'Published' 
                          ? 'bg-green-500/15 text-green-400 border border-green-500/20' 
                          : 'bg-dark-700 text-dark-400 border border-dark-600'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-dark-400 font-mono">{post.views}</td>
                    <td className="py-4 pr-4 text-dark-400">{post.date}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(post)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-gold-400 transition-colors" title="Edit">
                          <FiEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="p-2 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-red-400 transition-colors" title="Delete">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-dark-400">
              <FiLoader className="animate-spin" size={22} />
              <span>Loading posts...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12">
              <FiFileText className="mx-auto text-dark-600 mb-3" size={32} />
              <p className="text-dark-400">{search || catFilter !== 'All' || statusFilter !== 'All' ? 'No posts match your filters.' : 'No blog posts yet. Create your first post!'}</p>
            </div>
          )}
        </motion.div>

        {/* Modal form */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Window */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <h3 className="text-lg font-serif font-bold text-white">
                    {editingPost ? 'Edit Blog Post' : 'Create New Post'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-dark-400 hover:text-white transition-colors">
                    <FiX size={20} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-xs text-dark-400 uppercase tracking-wider">Post Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a descriptive title..."
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-dark-400 uppercase tracking-wider">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="input-field"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-dark-400 uppercase tracking-wider">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="input-field"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-dark-400 uppercase tracking-wider">Cover Image URL</label>
                    <input
                      type="text"
                      placeholder="Optional image url..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-dark-400 uppercase tracking-wider">Content</label>
                    <textarea
                      required
                      rows={6}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article body here (supports rich formatting in database)..."
                      className="input-field resize-none"
                    />
                  </div>

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
                      disabled={saving}
                      className="btn-primary flex items-center gap-2 disabled:opacity-60"
                    >
                      {saving && <FiLoader className="animate-spin" size={14} />}
                      {editingPost ? 'Save Changes' : 'Publish Post'}
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
