import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

function AnnouncementsPage() {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const [userRes, announcementRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/announcements')
      ]);
      setUser(userRes.data);
      setAnnouncements(announcementRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isAdmin = user?.role === 'admin';

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/announcements', { title, content });
      setAnnouncements((prev) => [res.data, ...prev]);
      setTitle('');
      setContent('');
      setSuccess('Announcement published successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      setSuccess('Announcement deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  const formatDate = (val) => {
    return new Date(val).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 w-full rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-60 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse" />
          <div className="h-60 rounded-[2rem] border border-white/5 bg-white/[0.02] animate-pulse md:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-blue">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10 opacity-70 pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400">Company Board</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Announcements</h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
            {isAdmin
              ? 'Publish firm-wide notices, organize news streams, and dispatch workplace policies.'
              : 'Stay up-to-date with the latest corporate notices, events, and operational updates.'}
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Admin Publish Panel */}
        {isAdmin && (
          <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl self-start">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Dispatch</span>
            <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Create Announcement</h3>
            
            <form onSubmit={handlePublish} className="space-y-5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Title
                <input
                  type="text"
                  required
                  placeholder="Appraisal Cycles Open"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Content
                <textarea
                  required
                  rows={6}
                  placeholder="Enter the notice details here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? 'Publishing...' : 'Publish Announcement'}
              </button>
            </form>

            <AnimatePresence>
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mt-4 rounded-2xl border p-4 text-xs font-medium ${
                    success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}
                >
                  {success || error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Announcements List */}
        <div className={`space-y-4 ${isAdmin ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-2">
            <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Live feed</span>
            <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-white/[0.04]">
              {announcements.length} {announcements.length === 1 ? 'Notice' : 'Notices'}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {announcements.map((ann) => (
              <motion.div
                layout
                key={ann._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-3xl border border-white/5 bg-[#0F172A]/15 p-6 backdrop-blur-md shadow-lg overflow-hidden group hover:border-white/10 transition-all duration-300"
              >
                <div className="absolute -inset-px bg-gradient-to-tr from-blue-500/[0.02] via-transparent to-violet-500/[0.02] pointer-events-none" />
                
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between relative z-10">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-md font-bold text-white tracking-tight">{ann.title}</h4>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        {ann.createdBy?.name || 'Administrator'}
                      </span>
                    </div>
                    <span className="block text-[10px] text-slate-500 font-mono">{formatDate(ann.createdAt)}</span>
                    <p className="text-xs text-slate-300 leading-relaxed pt-2.5 whitespace-pre-wrap">{ann.content}</p>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(ann._id)}
                      className="self-start rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {announcements.length === 0 && (
              <div className="rounded-3xl border border-white/5 bg-slate-950/20 p-8 text-center text-xs text-slate-500">
                No active announcements found on the company board.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default AnnouncementsPage;
