import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { logVisitor } from '../api';
import { Trophy, Calendar, Plus, Trash2, Milestone, Loader, Sparkles, TrendingUp, Compass } from 'lucide-react';
import Skeleton from '../components/Skeleton';

export default function Experience() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('STAT');
  const [newYear, setNewYear] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Log visitor hit
    logVisitor('Experience');

    setIsAdmin(localStorage.getItem('is_admin') === 'true');

    fetchExperience();
  }, []);

  const fetchExperience = () => {
    setLoading(true);
    api.get('/experience/')
      .then((res) => {
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching experience:', err);
        setLoading(false);
      });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setActionLoading(true);

    const payload = {
      type: newType,
      title: newTitle,
      value: newValue,
      description: newDesc,
    };

    if (newType === 'TIMELINE' && newYear) {
      payload.year = parseInt(newYear, 10);
    }

    try {
      await api.post('/experience/', payload);
      setNewTitle('');
      setNewValue('');
      setNewDesc('');
      setNewYear('');
      setShowAddForm(false);
      fetchExperience();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to add item. Check credentials.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this achievement/milestone?")) return;

    try {
      await api.delete(`/experience/${id}/`);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Group items by type
  const stats = items.filter(item => item.type === 'STAT');
  const timeline = items.filter(item => item.type === 'TIMELINE').sort((a, b) => (a.year || 0) - (b.year || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      
      {/* Page Title */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-zinc-50 font-sans"
        >
          Track Record & Milestones
        </motion.h1>
        <div className="h-1.5 w-24 bg-survey-gold mx-auto rounded-full" />
        <p className="text-slate-500 dark:text-zinc-400">
          Deccan Digital Surveys has mapped, marked, and verified layouts for developers, governments, and private owners.
        </p>
      </section>

      {/* Admin Action Row */}
      {isAdmin && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition"
          >
            <Plus size={18} />
            <span>{showAddForm ? 'Close Milestone Editor' : 'Add New Stat/Milestone'}</span>
          </button>
        </div>
      )}

      {/* Admin Form block */}
      <AnimatePresence>
        {isAdmin && showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-lg mx-auto glass border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-lg overflow-hidden text-left"
          >
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50 mb-4 flex items-center space-x-2">
              <Trophy size={18} className="text-survey-gold" />
              <span>Record New Milestone</span>
            </h3>
            {errorMessage && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2.5 rounded-lg mb-3">
                {errorMessage}
              </p>
            )}
            <form onSubmit={handleAddItem} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="STAT">Statistic Badge</option>
                    <option value="TIMELINE">Timeline Milestone</option>
                  </select>
                </div>

                <div>
                  {newType === 'STAT' ? (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Badge Value</label>
                      <input
                        type="text"
                        required
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="e.g. '1200+' or '98%'"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Year</label>
                      <input
                        type="number"
                        required
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        placeholder="e.g. 2023"
                        className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Milestone Name / Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Completed Projects or Gated Community Layout Setup"
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Narrative Description</label>
                <textarea
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detailed metrics or timeline summary..."
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow flex items-center justify-center space-x-1.5"
              >
                {actionLoading ? <Loader className="animate-spin" size={16} /> : <span>Publish Record</span>}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main grids */}
      {loading ? (
        <div className="w-full max-w-xl mx-auto py-8">
          <Skeleton type="text" count={6} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
          
          {/* Left Column: Stats */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center space-x-2">
              <TrendingUp size={22} className="text-survey-gold" />
              <span>Key Statistics</span>
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {stats.map((stat) => (
                <div 
                  key={stat.id} 
                  className="p-6 glass border border-slate-200/50 dark:border-zinc-800/50 rounded-2xl shadow relative group overflow-hidden"
                >
                  {/* Neon top line decorator */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-survey-gold" />
                  
                  <div className="space-y-2">
                    <p className="text-4xl sm:text-5xl font-black text-primary dark:text-survey-gold font-mono leading-none">
                      {stat.value}
                    </p>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50">{stat.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{stat.description}</p>
                  </div>

                  {/* Delete button for Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteItem(stat.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition duration-200"
                      title="Delete Badge"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50 border-b border-slate-200 dark:border-zinc-800 pb-2 flex items-center space-x-2">
              <Milestone size={22} className="text-survey-gold" />
              <span>Deccan Surveys Timeline</span>
            </h2>
            
            <div className="relative pl-6 border-l-2 border-slate-200 dark:border-zinc-800 space-y-8 ml-2">
              {timeline.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Bullet */}
                  <div className="absolute -left-[31px] top-1.5 bg-primary dark:bg-survey-gold h-4.5 w-4.5 rounded-full border-4 border-slate-50 dark:border-survey-darkBg transition-transform group-hover:scale-125" />
                  
                  <div className="glass border border-slate-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow relative">
                    <span className="text-xs font-bold text-primary dark:text-survey-gold tracking-widest uppercase bg-primary/10 dark:bg-survey-gold/10 px-2.5 py-1 rounded-md">
                      {event.value || event.year}
                    </span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-zinc-50 mt-3">{event.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 leading-relaxed">{event.description}</p>
                    
                    {/* Delete button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteItem(event.id)}
                        className="absolute top-4 right-4 p-1.5 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-full transition duration-200"
                        title="Delete Milestone"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Success Stories section */}
      <section className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-zinc-800/50 text-left space-y-6 shadow-md relative overflow-hidden">
        {/* Vector map art background */}
        <div className="absolute -right-10 -bottom-10 opacity-5 dark:opacity-[0.03] text-survey-gold pointer-events-none select-none">
          <Compass size={300} className="animate-spin-slow" />
        </div>
        
        <div className="flex items-center space-x-2 text-primary dark:text-survey-gold">
          <Sparkles size={20} />
          <span className="font-bold text-sm uppercase tracking-wider">Success Story Spotlight</span>
        </div>
        <div className="max-w-3xl space-y-4">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-50 font-sans">
            Siddipet Ring Road Layout (180 Acres)
          </h3>
          <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm sm:text-base">
            "Deccan Digital Surveys demarcated the entire 180-acre premium residential venture under strict deadline limits. Using twin RTK DGPS receivers synchronized with state base coordinates, the team verified boundary stones within 5mm clearances. The layout designs obtained immediate approvals from municipal councils (YTDA guidelines) without a single setback revision request."
          </p>
          <div className="pt-2">
            <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Lead Promoter, Sai Ventures Group</p>
            <p className="text-xs text-slate-400">Gated Community Development Partner</p>
          </div>
        </div>
      </section>

    </div>
  );
}
