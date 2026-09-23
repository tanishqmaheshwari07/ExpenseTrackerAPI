import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  WalletCards,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  PieChart,
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { useAuthStore } from '../store/authStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const scrollToPreview = () => {
    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-ink flex flex-col selection:bg-accent-end selection:text-white">
      {/* ============================================================ */}
      {/* TOP NAVIGATION BAR                                            */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo Left */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-pill bg-ink text-white flex items-center justify-center font-bold text-base shadow-sm">
              <WalletCards className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-ink">
                Expense<span className="text-accent-end">Tracker</span>
              </span>
              <span className="text-[10px] font-semibold text-faint uppercase tracking-wider -mt-1">
                Financial Suite
              </span>
            </div>
          </Link>

          {/* Links Centered */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#features" className="hover:text-ink transition-colors">
              Product
            </a>
            <a href="#preview-section" className="hover:text-ink transition-colors">
              Preview
            </a>
            <a href="#pricing" className="hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#company" className="hover:text-ink transition-colors">
              Company
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                variant="primary"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-muted hover:text-ink transition-colors px-2 py-1"
                >
                  Log in
                </Link>
                <Button
                  variant="primary"
                  onClick={handleGetStarted}
                  className="px-5 shadow-sm"
                >
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION                                                 */}
      {/* ============================================================ */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-accent-start/5 via-accent-end/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Tag pill */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill bg-surface border border-border text-xs font-semibold text-ink mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-accent-end animate-ping" />
            <span>Next-Gen Personal Finance & Budgeting</span>
          </motion.div>

          {/* Bold Black H1 (2 lines) */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.1]"
          >
            Know exactly where <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-ink via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              your money goes
            </span>
          </motion.h1>

          {/* Gray Subhead Below */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Effortlessly monitor transactions, categorize daily spending, and unlock automated
            budget insights with a sleek, ultra-fast interface.
          </motion.p>

          {/* Row of 3 Small Checkmark Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-muted"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Trusted by 50K+ users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>99.9% Cloud Uptime</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Bank-grade 256-bit encryption</span>
            </div>
          </motion.div>

          {/* Two CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Solid Black Pill "Get started" */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get started free
            </Button>

            {/* Outlined Gray Pill "See how it works" */}
            <Button
              variant="secondary"
              size="lg"
              onClick={scrollToPreview}
              className="w-full sm:w-auto px-8 h-12 text-base text-muted hover:text-ink font-semibold"
            >
              See how it works
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BELOW THE FOLD: DASHBOARD PREVIEW MOCKUP                      */}
      {/* ============================================================ */}
      <section id="preview-section" className="py-12 pb-24 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <Badge variant="accent" className="mb-2">
              Interactive Mockup
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              Experience the clarity of modern money management
            </h2>
            <p className="text-sm text-muted mt-1 max-w-lg mx-auto">
              Everything you need in a single consolidated view, built with pure precision.
            </p>
          </motion.div>

          {/* Card containing the dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Card className="bg-paper border-border shadow-2xl p-6 sm:p-8 rounded-card overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* 1. Stat Tile with Mini Bar Chart (gray bars, one highlighted in accent-end) */}
                <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                        Monthly Spending
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-pill">
                        -8.4%
                      </span>
                    </div>
                    <div className="text-3xl font-extrabold text-ink mt-2">₹2,840.50</div>
                    <p className="text-xs text-muted mt-0.5">Average: ₹94.60 / day</p>
                  </div>

                  {/* Mini Bar Chart Mockup: Gray bars + 1 Highlighted in accent-end */}
                  <div className="mt-6 pt-4 border-t border-border/80">
                    <div className="flex items-end justify-between gap-2 h-24 px-1">
                      {[
                        { day: 'M', height: '45%', highlight: false },
                        { day: 'T', height: '60%', highlight: false },
                        { day: 'W', height: '35%', highlight: false },
                        { day: 'T', height: '80%', highlight: false },
                        { day: 'F', height: '95%', highlight: true }, // Highlighted bar in accent-end
                        { day: 'S', height: '55%', highlight: false },
                        { day: 'S', height: '40%', highlight: false },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            style={{ height: bar.height }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              bar.highlight
                                ? 'bg-accent-end shadow-md ring-2 ring-accent-end/30'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          />
                          <span className={`text-[10px] font-semibold ${bar.highlight ? 'text-accent-end' : 'text-faint'}`}>
                            {bar.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Dark Gradient (accent-start -> #111111) "Card Balance" Tile */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-accent-start via-neutral-900 to-ink text-white shadow-lg flex flex-col justify-between relative overflow-hidden min-h-[220px]">
                  {/* Decorative card chip & contactless icons */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-7 rounded bg-amber-400/90 border border-amber-300/40 flex items-center justify-center">
                        <div className="w-5 h-4 border border-amber-800/40 rounded-sm" />
                      </div>
                      <CreditCard className="w-5 h-5 text-white/70" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                      ExpenseCard
                    </span>
                  </div>

                  {/* Masked Card Number */}
                  <div className="my-4 relative z-10">
                    <span className="text-xs text-white/60 uppercase tracking-wider block text-[10px]">
                      Account Balance
                    </span>
                    <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                      ₹14,250.00
                    </div>
                    <div className="font-mono text-sm tracking-widest text-white/80 mt-3">
                      •••• •••• •••• 4289
                    </div>
                  </div>

                  {/* Cardholder Name & Expiry */}
                  <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">
                        Cardholder
                      </span>
                      <span className="font-semibold text-white/95">ALEX MORGAN</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">
                        Expires
                      </span>
                      <span className="font-semibold text-white/95">08/29</span>
                    </div>
                  </div>

                  {/* Card Gloss Effects */}
                  <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                </div>

                {/* 3. "Recent Transactions" List Tile */}
                <div className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-faint">
                      Recent Activity
                    </span>
                    <span className="text-xs font-semibold text-accent-end">View all</span>
                  </div>

                  <div className="space-y-3 mt-3">
                    {[
                      {
                        name: 'Whole Foods Market',
                        category: 'Groceries',
                        date: 'Today, 2:45 PM',
                        amount: '-₹84.20',
                        isNegative: true,
                      },
                      {
                        name: 'Direct Deposit / Payroll',
                        category: 'Income',
                        date: 'Yesterday',
                        amount: '+₹3,450.00',
                        isNegative: false,
                      },
                      {
                        name: 'Apple Services Subscription',
                        category: 'Digital',
                        date: 'Sep 21',
                        amount: '-₹14.99',
                        isNegative: true,
                      },
                      {
                        name: 'Starbucks Coffee',
                        category: 'Dining',
                        date: 'Sep 20',
                        amount: '-₹6.50',
                        isNegative: true,
                      },
                    ].map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center text-ink shrink-0 font-bold">
                            {tx.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-ink">{tx.name}</div>
                            <div className="text-[10px] text-faint">{tx.date}</div>
                          </div>
                        </div>
                        <div
                          className={`font-bold ${
                            tx.isNegative ? 'text-ink' : 'text-success font-extrabold'
                          }`}
                        >
                          {tx.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FEATURES HIGHLIGHT SECTION                                   */}
      {/* ============================================================ */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-ink tracking-tight">
              Engineered for absolute financial peace of mind
            </h2>
            <p className="text-muted text-base mt-2">
              Everything from automatic category insights to token-based bank security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-card border border-border bg-surface hover:shadow-card transition-all"
            >
              <div className="w-10 h-10 rounded-pill bg-ink text-white flex items-center justify-center mb-4">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Smart Categorization</h3>
              <p className="text-sm text-muted mt-2">
                Classify expenses across Food, Travel, Shopping, Bills, and custom categories automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 rounded-card border border-border bg-surface hover:shadow-card transition-all"
            >
              <div className="w-10 h-10 rounded-pill bg-ink text-white flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Instant Analytics</h3>
              <p className="text-sm text-muted mt-2">
                Gain real-time visibility into spending trends, monthly budget caps, and variance reports.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-card border border-border bg-surface hover:shadow-card transition-all"
            >
              <div className="w-10 h-10 rounded-pill bg-ink text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-ink">Enterprise-Grade Security</h3>
              <p className="text-sm text-muted mt-2">
                Secure JWT authentication with automatic token rotation and end-to-end data isolation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER                                                       */}
      {/* ============================================================ */}
      <footer id="company" className="mt-auto bg-white border-t border-border pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-border">
            {/* Brand column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-pill bg-ink text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <WalletCards className="w-4 h-4" />
                </div>
                <span className="text-base font-bold tracking-tight text-ink">
                  Expense<span className="text-accent-end">Tracker</span>
                </span>
              </div>
              <p className="text-xs text-muted max-w-sm">
                Next-generation financial tracking engineered for individuals and modern teams.
              </p>
            </div>

            {/* Link Column 1: Product */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Product</h4>
              <ul className="space-y-2 text-xs text-muted">
                <li><a href="#features" className="hover:text-ink">Overview</a></li>
                <li><a href="#preview-section" className="hover:text-ink">Analytics</a></li>
                <li><a href="#features" className="hover:text-ink">Security</a></li>
                <li><a href="#pricing" className="hover:text-ink">Integrations</a></li>
              </ul>
            </div>

            {/* Link Column 2: Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Resources</h4>
              <ul className="space-y-2 text-xs text-muted">
                <li><a href="/swagger-ui.html" className="hover:text-ink">REST API</a></li>
                <li><a href="#company" className="hover:text-ink">Documentation</a></li>
                <li><a href="#company" className="hover:text-ink">Guides</a></li>
                <li><a href="#company" className="hover:text-ink">Support</a></li>
              </ul>
            </div>

            {/* Link Column 3: Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-muted">
                <li><a href="#company" className="hover:text-ink">About</a></li>
                <li><a href="#company" className="hover:text-ink">Privacy Policy</a></li>
                <li><a href="#company" className="hover:text-ink">Terms of Service</a></li>
                <li><a href="#company" className="hover:text-ink">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-faint gap-4">
            <p>© {new Date().getFullYear()} ExpenseTracker Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-ink cursor-pointer">Privacy</span>
              <span className="hover:text-ink cursor-pointer">Terms</span>
              <span className="hover:text-ink cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
