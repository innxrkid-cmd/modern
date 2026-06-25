import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// Custom SVG Icons
const ShieldIcon = () => (
  <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

// Marquee Brands
const brands = [
  'Vercel', 'Linear', 'Stripe', 'Framer', 'Apple', 'Slack', 'Amazon', 'Google', 'Netflix', 'Airbnb', 'Adobe', 'Spotify'
];

// Features List
const features = [
  {
    title: 'Employee Directory',
    description: 'Beautiful visual profiles matching title, department, skills, and managers.',
    icon: '👥',
    color: 'from-blue-500/20 to-sky-500/20'
  },
  {
    title: 'Smart Attendance',
    description: 'Dynamic check-in systems with IP tracking, geofencing, and shift schedules.',
    icon: '🕒',
    color: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    title: 'Automated Payroll',
    description: 'Direct-to-bank payroll automation with embedded taxes and deductions calculation.',
    icon: '💳',
    color: 'from-violet-500/20 to-purple-500/20'
  },
  {
    title: 'Leave Planning',
    description: 'Request, approve, and track time-off balances using interactive team calendars.',
    icon: '📅',
    color: 'from-amber-500/20 to-orange-500/20'
  },
  {
    title: 'AI Sentiment Analytics',
    description: 'Real-time mood index tracking and stress markers calculated via team feedback surveys.',
    icon: '🤖',
    color: 'from-pink-500/20 to-rose-500/20'
  },
  {
    title: 'Role Management',
    description: 'Enterprise grade role-based access rules. Restrict fields per department.',
    icon: '🔒',
    color: 'from-indigo-500/20 to-blue-500/20'
  }
];

// AI Capabilities
const aiCapabilities = [
  {
    title: 'Resume Screening',
    description: 'Auto-extract skills and score applicants against open jobs in 3 seconds.',
    icon: '📄'
  },
  {
    title: 'Attrition Predictor',
    description: 'Identify departure risk index before key talent decides to submit a resignation.',
    icon: '📉'
  },
  {
    title: 'Automatic Scheduling',
    description: 'AI balances shifts matching employee leave plans and history preferences.',
    icon: '⚡'
  },
  {
    title: 'HR Copilot Bot',
    description: 'Solve employee FAQs about payroll, leaves, and policy handbook instantly.',
    icon: '💬'
  }
];

// FAQs
const faqs = [
  {
    question: 'How does the AI predict employee attrition?',
    answer: 'Dayflow AI analyzes anonymized data patterns including feedback sentiment, check-in variations, leave frequency, and role tenure to assess risk levels without violating personal privacy.'
  },
  {
    question: 'Can I import my existing employee database?',
    answer: 'Absolutely. Dayflow supports quick CSV imports, as well as direct API sync with Workday, BambooHR, and standard active directory integrations.'
  },
  {
    question: 'Is employee data secure and GDPR-compliant?',
    answer: 'Yes, data safety is our priority. We employ end-to-end encryption in transit and at rest, host on ISO-certified secure servers, and maintain full GDPR & HIPAA compliance audits.'
  },
  {
    question: 'Can we configure custom approval workflows for leaves?',
    answer: 'Yes, you can build multi-stage approval paths (e.g. Manager -> Department Head -> HR) with automated Slack and email notification triggers.'
  }
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('growth');
  const [faqOpen, setFaqOpen] = useState(null);
  const heroRef = useRef(null);
  
  // Parallax / Scroll effect
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#090D1A] text-slate-100 font-sans selection:bg-violet-500 selection:text-white overflow-x-hidden relative">
      
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[160px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/10 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[180px] pointer-events-none" />

      {/* Sticky Navigation Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/70 border-b border-slate-800/60 backdrop-blur-xl py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-xl font-black text-white tracking-tighter">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Dayflow
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#showcase" className="hover:text-white transition">Solutions</a>
            <a href="#analytics" className="hover:text-white transition">Analytics</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="relative group overflow-hidden rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-violet-600/35"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              Get Started
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-32 lg:pt-48 pb-20 max-w-7xl mx-auto px-6 grid gap-16 lg:grid-cols-12 items-center relative z-10">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="lg:col-span-6 space-y-8"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            Next Gen HR Workflows
          </div>

          <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.08]">
            Every Workday. <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Perfectly Aligned.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            The AI-first workplace platform that unifies employee directory, smart shift planning, payroll automation, and stress predictors in a secure, unified workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 transition-all hover:border-slate-700"
            >
              Book Demo
            </button>
          </div>

          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <ShieldIcon /> Secure
            </div>
            <div className="flex items-center gap-2">
              <SparklesIcon /> AI-First
            </div>
            <div className="flex items-center gap-2">
              <DatabaseIcon /> GDPR Ready
            </div>
            <div className="flex items-center gap-2">
              <GlobeIcon /> Enterprise
            </div>
          </div>
        </motion.div>

        {/* Hero Right: Mockup Dashboard */}
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lg:col-span-6 relative"
        >
          {/* Glass Card Mockup wrapper */}
          <div className="relative rounded-[2.5rem] border border-slate-800/80 bg-slate-950/40 p-6 shadow-2xl backdrop-blur-xl">
            <div className="absolute -inset-px rounded-[2.5rem] bg-gradient-to-tr from-violet-500/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 font-mono ml-2">dayflow.app/dashboard</span>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">Live Status</span>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid gap-4 grid-cols-12">
              {/* Profile Card */}
              <div className="col-span-12 sm:col-span-5 rounded-2xl border border-slate-900 bg-slate-900/40 p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">AC</div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Ava Clarke</h3>
                    <p className="text-xs text-slate-500">Lead Product Designer</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-900 pt-3">
                  <span className="text-slate-500">Department</span>
                  <span className="text-slate-200">Product Design</span>
                </div>
              </div>

              {/* Real-time Counter */}
              <div className="col-span-6 sm:col-span-4 rounded-2xl border border-slate-900 bg-slate-900/40 p-4 flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Employees</p>
                <div className="mt-2">
                  <p className="text-3xl font-bold text-white tracking-tight">1,248</p>
                  <span className="text-[10px] text-emerald-400">↑ 12% this month</span>
                </div>
              </div>

              {/* Stress Level Dial Indicator */}
              <div className="col-span-6 sm:col-span-3 rounded-2xl border border-slate-900 bg-slate-900/40 p-4 flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Risk Index</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <p className="text-2xl font-bold text-rose-400">Low</p>
                  <span className="text-[10px] text-slate-500">0.02%</span>
                </div>
              </div>

              {/* Interactive Graph mockup inside hero */}
              <div className="col-span-12 rounded-2xl border border-slate-900 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Workforce Activity Overview</h4>
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" />
                    <span className="text-[10px] text-slate-500">Attendance</span>
                  </div>
                </div>

                {/* Simulated Wave Line Path Chart */}
                <div className="h-28 w-full relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="glow-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Area under curve */}
                    <path d="M 0 100 Q 20 40 40 70 T 80 20 T 100 50 L 100 100 L 0 100 Z" fill="url(#glow-grad)" />
                    {/* Curve Line */}
                    <motion.path 
                      d="M 0 100 Q 20 40 40 70 T 80 20 T 100 50" 
                      fill="none" 
                      stroke="#8B5CF6" 
                      strokeWidth="2.5" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </svg>
                  {/* Glowing Tracker node */}
                  <div className="absolute top-[28%] left-[78%] w-3 h-3 rounded-full bg-violet-400 border border-white animate-ping" />
                  <div className="absolute top-[28%] left-[78%] w-2 h-2 rounded-full bg-violet-500 border border-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted By Brand Loop */}
      <section className="py-12 border-y border-slate-900 bg-slate-950/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 overflow-hidden">
          <p className="text-center text-xs font-semibold text-slate-600 uppercase tracking-widest mb-6">
            Trusted by fast-moving teams worldwide
          </p>
          <div className="w-full flex gap-12 select-none overflow-hidden relative after:absolute after:inset-y-0 after:right-0 after:w-20 after:bg-gradient-to-l after:from-[#090D1A] before:absolute before:inset-y-0 before:left-0 before:w-20 before:bg-gradient-to-r before:from-[#090D1A]">
            <motion.div 
              animate={{ x: [0, -1035] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="flex gap-20 items-center justify-between text-lg font-bold text-slate-700 tracking-tight whitespace-nowrap min-w-max"
            >
              {brands.concat(brands).map((brand, i) => (
                <span key={i} className="hover:text-slate-400 transition cursor-default">
                  {brand}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Dayflow Capabilities</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Unifying all HR departments under one workspace.
          </h2>
          <p className="text-slate-400 text-lg">
            Say goodbye to fragmented SaaS apps. Dayflow acts as the single source of truth for your entire workforce.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6 overflow-hidden backdrop-blur-md"
            >
              {/* Card Gradient Hover Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-violet-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600/10 to-blue-600/10 border border-violet-500/20 flex items-center justify-center text-2xl mb-6 shadow-inner">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold text-white mb-3 group-hover:text-violet-300 transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="showcase" className="py-24 border-t border-slate-900/60 bg-slate-950/20 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* Showcase Feature 1 */}
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 ring-1 ring-blue-500/20">
                Shift Scheduling
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Intelligent shift assignment. Driven by calendar metrics.
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Dayflow automates calendar scheduling by cross-referencing manager needs, historical shift patterns, and pending team leaves. Minimize manual changes and over-scheduling conflicts.
              </p>
              <ul className="space-y-3 text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ Automatic shift balancing and priority matching</li>
                <li className="flex items-center gap-2">✓ Integration with Slack and Email notifications</li>
                <li className="flex items-center gap-2">✓ Real-time manager request dashboards</li>
              </ul>
            </div>
            
            <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute -inset-px bg-gradient-to-tr from-blue-500/10 to-transparent opacity-50" />
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Schedule Simulator</span>
                <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] text-blue-300 font-semibold">Active Period</span>
              </div>
              
              {/* Simulated Shift Grid */}
              <div className="space-y-3">
                {[
                  { name: 'Chloe Davis', role: 'Operations Lead', shifts: ['Mon (Day)', 'Tue (Day)', 'Wed (Night)', 'Off'] },
                  { name: 'Lucas Carter', role: 'Support Analyst', shifts: ['Off', 'Tue (Night)', 'Wed (Night)', 'Thu (Day)'] },
                  { name: 'Isla Bennett', role: 'HR Specialist', shifts: ['Mon (Day)', 'Off', 'Wed (Day)', 'Thu (Day)'] }
                ].map((emp, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-900 p-3 text-xs">
                    <div className="col-span-4 flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                        {emp.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{emp.name}</p>
                        <p className="text-[10px] text-slate-500">{emp.role}</p>
                      </div>
                    </div>
                    {emp.shifts.map((shift, i) => (
                      <span key={i} className={`col-span-2 text-center py-1 rounded font-semibold ${
                        shift === 'Off' ? 'bg-slate-950/60 text-slate-600' : 'bg-blue-500/10 text-blue-300 border border-blue-500/10'
                      }`}>
                        {shift}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Showcase Feature 2 */}
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 lg:order-last space-y-6">
              <div className="inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/20">
                Automated Payroll
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Global salary disbursements in one click.
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Streamline global contractor and full-time employee payouts. Dayflow manages taxation, pension funds, local benefits adjustments, and delivers clear digital payslips directly into employee dashboards automatically.
              </p>
              <ul className="space-y-3 text-sm text-slate-300 font-medium">
                <li className="flex items-center gap-2">✓ Global tax withholding calculation automations</li>
                <li className="flex items-center gap-2">✓ Automatic payslip downloads for audit reports</li>
                <li className="flex items-center gap-2">✓ Support for Multi-currency and direct bank deposits</li>
              </ul>
            </div>
            
            <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/10 to-transparent opacity-50" />
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payroll Disbursal Queue</span>
                <span className="text-xs font-mono text-emerald-400">Ready</span>
              </div>

              {/* Payout breakdown UI */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-900 flex justify-between items-center text-xs">
                  <div>
                    <p className="text-slate-500">Next Payout Date</p>
                    <p className="text-lg font-bold text-white mt-1">July 1, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Gross Total (USD)</p>
                    <p className="text-lg font-bold text-violet-300 mt-1">$48,150.00</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-3 space-y-2">
                  {[
                    { label: 'Basic Salary Allocation', val: '$41,200.00' },
                    { label: 'Allowances & Reimbursements', val: '$8,250.00' },
                    { label: 'Tax & Insurance Deductions', val: '-$1,300.00' }
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-slate-500">{row.label}</span>
                      <span className="text-slate-200 font-semibold font-mono">{row.val}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 text-xs font-semibold text-white shadow-lg">
                  Disburse Total Salaries
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Analytics Section - Breathtaking Charts */}
      <section id="analytics" className="py-24 max-w-7xl mx-auto px-6 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Real-time Metrics</span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Breathtaking analytics. Instant visual understanding.
          </h2>
          <p className="text-slate-400 text-lg">
            Interact with the analytics console. Toggle between key workforce indexes to see real-time chart shifts.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {[
            { id: 'growth', label: 'Workforce Growth', color: 'border-violet-500 text-violet-300' },
            { id: 'attendance', label: 'Attendance Breakdown', color: 'border-emerald-500 text-emerald-300' },
            { id: 'payroll', label: 'Payroll Distribution', color: 'border-blue-500 text-blue-300' },
            { id: 'productivity', label: 'Productivity Index', color: 'border-indigo-500 text-indigo-300' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2.5 text-xs font-semibold transition border ${
                activeTab === tab.id
                  ? 'bg-slate-900 border-slate-700 text-white shadow-lg shadow-slate-950/40'
                  : 'bg-slate-950/40 border-slate-900/60 text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Console Dashboard Area */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute -inset-px bg-gradient-to-tr from-violet-500/5 via-transparent to-blue-500/5 opacity-60" />
          
          <div className="grid gap-8 lg:grid-cols-12 relative z-10">
            {/* KPI list */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-slate-900/40 border border-slate-900 p-4">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Workforce Headcount</span>
                <p className="text-3xl font-extrabold text-white mt-1">1,200+</p>
                <p className="text-[10px] text-emerald-400 mt-1">✓ Across 6 countries</p>
              </div>
              <div className="rounded-2xl bg-slate-900/40 border border-slate-900 p-4">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Employee Satisfaction</span>
                <p className="text-3xl font-extrabold text-emerald-300 mt-1">98.7%</p>
                <p className="text-[10px] text-slate-500 mt-1">Based on monthly pulse reviews</p>
              </div>
              <div className="rounded-2xl bg-slate-900/40 border border-slate-900 p-4">
                <span className="text-[10px] uppercase font-semibold text-slate-500">System Uptime SLA</span>
                <p className="text-3xl font-extrabold text-blue-300 mt-1">99.9%</p>
                <p className="text-[10px] text-slate-500 mt-1">Real-time status check</p>
              </div>
              <div className="rounded-2xl bg-slate-900/40 border border-slate-900 p-4">
                <span className="text-[10px] uppercase font-semibold text-slate-500">Avg Productivity Lift</span>
                <p className="text-3xl font-extrabold text-violet-300 mt-1">+34%</p>
                <p className="text-[10px] text-emerald-400 mt-1">↑ Post integration</p>
              </div>
            </div>

            {/* Dynamic Interactive Chart display */}
            <div className="lg:col-span-8 rounded-2xl bg-slate-900/20 border border-slate-900/80 p-6 flex flex-col justify-between min-h-[350px]">
              <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                    {activeTab === 'growth' && 'Growth Index Chart'}
                    {activeTab === 'attendance' && 'Daily Attendance Summary'}
                    {activeTab === 'payroll' && 'Payroll Monthly Distribution'}
                    {activeTab === 'productivity' && 'Productivity Ratio Trend'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Simulated visual metrics from continuous database feedback</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  {new Date().getFullYear()} Target
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'growth' && (
                    <motion.div
                      key="growth"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-48 relative"
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 0 80 Q 25 70 50 40 T 100 20 L 100 100 L 0 100 Z" fill="url(#grow-grad)" />
                        <motion.path
                          d="M 0 80 Q 25 70 50 40 T 100 20"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                    </motion.div>
                  )}

                  {activeTab === 'attendance' && (
                    <motion.div
                      key="attendance"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-end gap-6 justify-center w-full h-40"
                    >
                      {[
                        { day: 'Mon', present: 88, color: 'bg-emerald-500' },
                        { day: 'Tue', present: 94, color: 'bg-emerald-500' },
                        { day: 'Wed', present: 91, color: 'bg-emerald-500' },
                        { day: 'Thu', present: 85, color: 'bg-emerald-500' },
                        { day: 'Fri', present: 78, color: 'bg-emerald-400' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.present}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.05 }}
                            className={`w-10 rounded-t-xl ${item.color} shadow-lg shadow-emerald-500/10`}
                            style={{ maxHeight: '120px', minWidth: '40px' }}
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">{item.day}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeTab === 'payroll' && (
                    <motion.div
                      key="payroll"
                      initial={{ opacity: 0, rotate: -45 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 45 }}
                      className="relative h-40 w-40 flex items-center justify-center"
                    >
                      {/* Simulated Donut Chart */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#0f172a" strokeWidth="3" />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3.2"
                          strokeDasharray="70 30"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 0 }}
                          transition={{ duration: 1 }}
                        />
                        <motion.circle
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3.2"
                          strokeDasharray="30 70"
                          strokeDashoffset="-70"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: -70 }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-xl font-bold text-white">$48k</p>
                        <p className="text-[8px] uppercase tracking-widest text-slate-500">Net Paid</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'productivity' && (
                    <motion.div
                      key="productivity"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="w-full h-48 relative"
                    >
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 0 50 C 20 40 30 80 60 30 T 100 10 L 100 100 L 0 100 Z" fill="url(#glow-grad)" />
                        <motion.path
                          d="M 0 50 C 20 40 30 80 60 30 T 100 10"
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="3"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section className="py-24 border-t border-slate-900/60 bg-slate-950/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-12 items-center mb-16">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Intelligent Automation</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                HR powered by Dayflow intelligence.
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-slate-400 text-lg">
                Let machine learning handle heavy workflows. From resume screening to forecasting resignations, Dayflow processes signals to help you manage with foresight.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiCapabilities.map((cap, idx) => (
              <div key={idx} className="group relative rounded-3xl border border-slate-900 bg-slate-950/60 p-6 backdrop-blur-md">
                <div className="absolute -inset-px rounded-3xl bg-gradient-to-tr from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-10 w-10 rounded-xl bg-violet-600/15 border border-violet-500/15 flex items-center justify-center text-xl mb-6">
                  {cap.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{cap.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 border-t border-slate-900/60 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Success Stories</span>
            <h2 className="text-4xl font-bold tracking-tight text-white">What HR Leaders are saying.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                text: "Dayflow completely streamlined our shift scheduling. The stress forecasting allows us to step in before designers burnout.",
                author: "Marcus Aurelius",
                role: "Director of HR, Linear",
                avatar: "MA"
              },
              {
                text: "Automating payroll across our 4 regional branches now takes 5 minutes instead of 3 days. Full GDPR safety makes it an easy choice.",
                author: "Sarah Connor",
                role: "VP of People, Vercel",
                avatar: "SC"
              },
              {
                text: "The AI candidate evaluation automatically filters 90% of irrelevant CVs. A huge time saver for our talent acquisition team.",
                author: "Neil DeGrasse",
                role: "Head of Talent, Spotify",
                avatar: "ND"
              }
            ].map((test, i) => (
              <div key={i} className="rounded-3xl border border-slate-800/80 bg-slate-950/40 p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
                <div className="space-y-2">
                  <div className="text-amber-400 text-sm">★★★★★</div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">"{test.text}"</p>
                </div>
                <div className="flex items-center gap-3 border-t border-slate-900 pt-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {test.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{test.author}</p>
                    <p className="text-[10px] text-slate-500">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900/60 bg-slate-950/20 relative z-10 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Pricing Tiers</span>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">Scale HR effortlessly.</h2>
            <p className="text-slate-400 text-lg">Predictable pricing tailored for growing startups and established enterprises.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 items-stretch max-w-5xl mx-auto">
            {/* Starter Tier */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8 flex flex-col justify-between space-y-8 backdrop-blur-md">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$49</span>
                  <span className="text-xs text-slate-500 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-400">Great for small startups up to 25 employees.</p>
                <div className="h-px bg-slate-900" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li>👥 Basic Employee Directory</li>
                  <li>🕒 Standard Attendance Log</li>
                  <li>💳 Single-currency Payroll</li>
                  <li>🔒 Role access controls</li>
                </ul>
              </div>
              <button onClick={() => navigate('/login')} className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-3 text-xs font-semibold text-white">
                Start Free Trial
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="relative rounded-3xl border border-violet-500 bg-slate-950/90 p-8 flex flex-col justify-between space-y-8 backdrop-blur-md shadow-2xl shadow-violet-500/5">
              <div className="absolute top-0 right-6 -translate-y-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Professional</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$149</span>
                  <span className="text-xs text-slate-400 font-semibold">/ month</span>
                </div>
                <p className="text-xs text-slate-300">Designed for scale. Up to 150 employees.</p>
                <div className="h-px bg-slate-900" />
                <ul className="space-y-3 text-xs text-slate-200">
                  <li>👥 Everything in Starter</li>
                  <li>📅 Shift Scheduling Simulator</li>
                  <li>🤖 AI Sentiment Analysis Index</li>
                  <li>💬 HR Bot Copilot Assistant</li>
                  <li>📈 Complete Analytics reports</li>
                </ul>
              </div>
              <button onClick={() => navigate('/login')} className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/20">
                Choose Professional
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/60 p-8 flex flex-col justify-between space-y-8 backdrop-blur-md">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise</span>
                <div className="flex items-baseline text-white">
                  <span className="text-4xl font-extrabold">Custom</span>
                </div>
                <p className="text-xs text-slate-400">Complete workforce solutions for global operations.</p>
                <div className="h-px bg-slate-900" />
                <ul className="space-y-3 text-xs text-slate-300">
                  <li>⚡ Unlimited active employees</li>
                  <li>💳 Multi-currency automated payroll</li>
                  <li>📉 Custom machine learning churn reports</li>
                  <li>👥 Dedicated account manager support</li>
                  <li>🔒 Custom SSO & SAML validation</li>
                </ul>
              </div>
              <button onClick={() => navigate('/login')} className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 py-3 text-xs font-semibold text-white">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 border-t border-slate-900/60 relative z-10 scroll-mt-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-widest">Common Questions</span>
            <h2 className="text-4xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-900 bg-slate-950/60 overflow-hidden transition backdrop-blur-sm"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full text-left p-6 flex justify-between items-center text-slate-200 hover:text-white"
                >
                  <span className="text-base font-semibold">{faq.question}</span>
                  <span className="text-xl text-slate-500 font-light">{faqOpen === i ? '−' : '+'}</span>
                </button>
                
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-6 pt-0 text-sm text-slate-400 border-t border-slate-900/40 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 border-t border-slate-900/60 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-[3rem] border border-slate-800 bg-slate-950/90 p-8 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-blue-500/10 opacity-70 pointer-events-none" />
            
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Optimize Workforce Management</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Transform HR into your core competitive advantage.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Get started with Dayflow today. Fully automated payroll, scheduling, and risk diagnostics ready for your team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-violet-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate('/login')}
                className="rounded-full border border-slate-800 bg-slate-900/40 hover:bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 transition"
              >
                Contact Sales Office
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid gap-12 sm:grid-cols-2 lg:grid-cols-6 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/10">
                <span className="text-sm font-black text-white">D</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Dayflow</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Dayflow is the AI-first HR platform that streamlines operations, scheduling, and payroll for next generation teams.
            </p>
            <p className="text-xs text-slate-600">© {new Date().getFullYear()} Dayflow Inc. All rights reserved.</p>
          </div>

          {[
            {
              title: 'Product',
              links: ['Features', 'Integrations', 'Pricing', 'Security']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Newsroom']
            },
            {
              title: 'Resources',
              links: ['HR Glossary', 'FAQ', 'API Guides', 'Help Center']
            }
          ].map((column, i) => (
            <div key={i} className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{column.title}</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="hover:text-slate-300 transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Stay Updated</h4>
            <p className="text-xs text-slate-500">Subscribe for insights and handbook templates.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="your@email.com"
                className="rounded-full bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 w-full"
              />
              <button type="submit" className="rounded-full bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-violet-500">
                Join
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
