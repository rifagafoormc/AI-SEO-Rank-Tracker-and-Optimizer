import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#050816] text-slate-900 dark:text-white min-h-[calc(100vh-80px)] flex items-center transition-colors duration-500">

      {/* ================= BACKGROUND GLOWS ================= */}

      {/* Cyan glow - top left */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[140px]" />

      {/* Violet glow - top right */}
      <div className="absolute -top-32 right-[-120px] w-[500px] h-[500px] bg-violet-400/20 dark:bg-violet-600/25 rounded-full blur-[140px]" />

      {/* Purple glow - bottom */}
      <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-400/20 dark:bg-purple-700/20 rounded-full blur-[150px]" />

      {/* Subtle center glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px]" />

      {/* Grid - Darkens slightly in light mode so it doesn't overpower */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
          bg-violet-500/10 dark:bg-violet-500/10
          border border-violet-400/30 dark:border-violet-400/30
          backdrop-blur-md
          text-violet-700 dark:text-violet-200
          text-sm font-medium
          shadow-[0_0_30px_rgba(139,92,246,0.15)] dark:shadow-[0_0_30px_rgba(139,92,246,0.15)]
          mb-8"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 dark:bg-cyan-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 dark:bg-cyan-400"></span>
          </span>

          AI-POWERED SEO PLATFORM
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl mx-auto text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">

          <span className="block bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
            AI SEO
          </span>

          <span className="block text-slate-900 dark:text-white mt-2">
            Rank Tracker & Optimizer
          </span>

        </h1>

        {/* Description */}
        <p className="max-w-2xl mx-auto mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          Track keyword rankings, analyze website performance,
          and optimize your website with real-time SEO insights.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">

          <Link
            to="/register"
            className="
              group
              relative
              overflow-hidden
              bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600
              text-white
              px-9 py-4
              rounded-xl
              font-semibold
              shadow-[0_10px_40px_rgba(79,70,229,0.35)]
              hover:shadow-[0_10px_50px_rgba(139,92,246,0.5)]
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <span className="relative z-10">
              Get Started Free →
            </span>

            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition" />
          </Link>

          <Link
            to="/login"
            className="
              px-9 py-4
              rounded-xl
              font-semibold
              text-slate-700 dark:text-white
              bg-slate-100/80 dark:bg-white/[0.06]
              backdrop-blur-md
              border border-slate-300/50 dark:border-white/15
              hover:bg-slate-200/80 dark:hover:bg-white/[0.1]
              hover:border-violet-500/50 dark:hover:border-violet-400/40
              transition-all duration-300
            "
          >
            Login
          </Link>

        </div>

        {/* ================= TRUST / FEATURES ================= */}

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-10 text-sm text-slate-600 dark:text-slate-400">

          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              ✓
            </span>
            Real SERP Data
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/10 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
              ✓
            </span>
            Performance Analysis
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              ✓
            </span>
            Secure Authentication
          </div>

        </div>

        {/* ================= SEO VISUAL ================= */}

        <div className="relative max-w-4xl mx-auto mt-20">

          {/* Glow behind visual */}
          <div className="absolute inset-x-20 -bottom-10 h-32 bg-violet-500/30 dark:bg-violet-600/20 blur-[80px]" />

          <div
            className="
              relative
              h-28
              rounded-2xl
              border border-slate-200/80 dark:border-white/10
              bg-white/80 dark:bg-white/[0.025]
              backdrop-blur-xl
              shadow-[0_20px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.35)]
              overflow-hidden
            "
          >

            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/80 dark:via-cyan-400/60 to-transparent" />

            {/* Fake analytics line */}
            <div className="absolute inset-x-8 top-10 h-12">

              <svg
                viewBox="0 0 800 100"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="seoGradient" x1="0" x2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                <path
                  d="M0 80 C80 70 100 75 160 55 S250 65 310 40 S400 50 460 35 S560 45 620 20 S720 30 800 10"
                  fill="none"
                  stroke="url(#seoGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

              </svg>

            </div>

            {/* Floating metrics */}
            <div className="absolute left-6 top-4 text-left">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Ranking Growth
              </p>
              <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                +24.8%
              </p>
            </div>

            <div className="absolute right-6 top-4 text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                SEO Visibility
              </p>
              <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                +18.4%
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero;