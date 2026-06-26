import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/http.js';

const categories = [
  { value: 'workplace', label: 'Workplace Environment' },
  { value: 'benefits', label: 'Benefits & Perks' },
  { value: 'management', label: 'Management & Operations' },
  { value: 'technical', label: 'Technical Infrastructure' },
  { value: 'other', label: 'Other Suggestions' }
];

const categoryColors = {
  workplace: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  benefits: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
  management: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  technical: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  other: 'bg-slate-700/20 border-white/5 text-slate-400'
};

function SuggestionsPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('workplace');
  const [anonymous, setAnonymous] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('hrms_user') || '{}');
  const isAdmin = user.role === 'admin';

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/suggestions');
      setSuggestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch suggestions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/suggestions', {
        title,
        description,
        category,
        anonymous
      });
      setSuccess('Thank you! Your suggestion has been submitted successfully.');
      setTitle('');
      setDescription('');
      setCategory('workplace');
      setAnonymous(false);
      fetchSuggestions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list of suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.user?.name && s.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [suggestions, searchTerm, categoryFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Page Header */}
      <div className="relative rounded-[2rem] border border-white/5 bg-[#0F172A]/40 p-6 md:p-8 backdrop-blur-xl shadow-2xl overflow-hidden glow-violet">
        <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-400">Suggestion Box</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">Feedback & Ideas</h2>
            <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
              {isAdmin
                ? 'Review suggestions, comments, and improvement ideas submitted by employees across the company.'
                : 'Help improve our workplace! Share your suggestions, ideas, or feedback. You can submit anonymously.'}
            </p>
          </div>
          
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="self-start md:self-auto rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 px-5 py-3 text-xs font-bold text-white tracking-wider uppercase transition-all duration-300"
          >
            Dashboard
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1.7fr]">
        {/* Left Side: Submit Suggestion Form (Only visible to employees/admins who want to suggest) */}
        {!isAdmin ? (
          <section className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl self-start">
            <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
            
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">New Idea</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">Submit Suggestion</h3>
            </div>

            <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value} className="bg-slate-950 text-slate-100 text-xs">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Summarize your suggestion..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-2.5">
                  Description
                </label>
                <textarea
                  rows="5"
                  required
                  placeholder="Explain your idea, proposed changes, or feedback in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-slate-950/60 px-4 py-3.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-white/10 bg-slate-950 text-violet-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="anonymous" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  Submit Anonymously (Admins won't see your name/profile)
                </label>
              </div>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-medium text-emerald-400"
                  >
                    {success}
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-medium text-rose-400"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase py-4 px-6 transition duration-300 shadow-lg shadow-indigo-600/10 disabled:opacity-50"
              >
                {submitting ? 'Submitting Idea...' : 'Submit Suggestion'}
              </button>
            </form>
          </section>
        ) : (
          <aside className="space-y-6 self-start">
            <div className="rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">Summary</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1 mb-6">Metrics</h3>
              
              <div className="grid gap-4">
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Total Suggestions</p>
                    <p className="mt-1 text-2xl font-black text-white">{suggestions.length}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-xs font-bold text-slate-400">
                    #
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-950/60 border border-white/[0.04] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-500">Anonymous Ideas</p>
                    <p className="mt-1 text-2xl font-black text-violet-400">
                      {suggestions.filter(s => s.anonymous).length}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                    ?
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Right Side: List of Suggestions */}
        <section className={`rounded-[2.5rem] border border-white/5 bg-[#0F172A]/20 p-6 md:p-8 backdrop-blur-md relative overflow-hidden shadow-xl ${isAdmin ? 'xl:col-span-1' : ''}`}>
          <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10 border-b border-slate-900 pb-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.24em] text-slate-500">
                {isAdmin ? 'Suggestions Box' : 'Your History'}
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-1">Submitted Feedback</h3>
            </div>

            <div className="flex flex-wrap gap-2.5 items-center">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all"
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 focus:outline-none transition-all cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin relative z-10">
            {loading ? (
              <p className="text-center text-xs text-slate-500 py-10">Loading submissions directory...</p>
            ) : filteredSuggestions.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-10">No matching suggestions found.</p>
            ) : (
              filteredSuggestions.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-white/[0.03] bg-slate-950/50 p-5 space-y-3.5 hover:border-white/5 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                      <h4 className="mt-2 text-sm font-bold text-white leading-snug">{item.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{item.description}</p>

                  <div className="flex items-center justify-between border-t border-white/[0.02] pt-3 text-[10px] text-slate-500">
                    <span>
                      Submitted by: <strong className="text-slate-300 font-semibold">{item.user?.name || 'Unknown User'}</strong>
                    </span>
                    {item.anonymous && (
                      <span className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[9px] font-bold text-violet-400 uppercase tracking-widest">
                        Anonymous
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}

export default SuggestionsPage;
