import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, TrendingUp, Award,
  Zap, Clock, ArrowRight, BarChart3, Globe,
  Rocket, Shield, FileText, Activity,
  CheckCircle, ChevronRight
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboardData, setDashboardData] = useState({
    totalRecords: 0,
    uniqueWebsites: 0,
    seoAnalyses: 0,
    seoAudits: 0,
    performanceChecks: 0,
    averageAuditScore: 0,
    averagePerformance: 0,
    aiInsights: 0,
    recentActivity: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ============================================================
     FETCH DASHBOARD DATA
  ============================================================ */
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!data.success || !Array.isArray(data.history)) {
        setLoading(false);
        return;
      }

      const history = data.history;

      const analyses = history.filter((item) => item.type === 'analysis');
      const audits = history.filter((item) => item.type === 'audit');
      const performances = history.filter(
        (item) => item.type === 'performance'
      );

      const uniqueWebsites = new Set();

      history.forEach((item) => {
        if (!item.websiteUrl) return;

        try {
          const normalizedUrl = item.websiteUrl.startsWith('http')
            ? item.websiteUrl
            : `https://${item.websiteUrl}`;

          uniqueWebsites.add(
            new URL(normalizedUrl).hostname.replace(/^www\./, '')
          );
        } catch {
          uniqueWebsites.add(item.websiteUrl);
        }
      });

      const auditScores = audits
        .map((item) => Number(item.seoScore))
        .filter((score) => !Number.isNaN(score));

      const averageAuditScore =
        auditScores.length > 0
          ? Math.round(
              auditScores.reduce((sum, score) => sum + score, 0) /
                auditScores.length
            )
          : 0;

      const performanceScores = performances
        .map((item) => Number(item.performance))
        .filter((score) => !Number.isNaN(score));

      const averagePerformance =
        performanceScores.length > 0
          ? Math.round(
              performanceScores.reduce((sum, score) => sum + score, 0) /
                performanceScores.length
            )
          : 0;

      let aiInsights = 0;

      analyses.forEach((item) => {
        const results = item.rankingData?.results || [];

        results.forEach((result) => {
          if (
            result.aiSuggestions ||
            result.relevance ||
            result.optimization
          ) {
            aiInsights++;
          }
        });

        if (
          item.aiSuggestions &&
          item.aiSuggestions !== 'No suggestions available'
        ) {
          aiInsights++;
        }
      });

      audits.forEach((item) => {
        if (
          Array.isArray(item.aiSuggestions) &&
          item.aiSuggestions.length > 0
        ) {
          aiInsights++;
        }
      });

      const recentActivity = history
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 6)
        .map((item) => {
          let website = 'Unknown';

          try {
            if (item.websiteUrl) {
              const normalizedUrl = item.websiteUrl.startsWith('http')
                ? item.websiteUrl
                : `https://${item.websiteUrl}`;

              website = new URL(normalizedUrl).hostname.replace(
                /^www\./,
                ''
              );
            }
          } catch {
            website = item.websiteUrl || 'Unknown';
          }

          const formattedDate = new Date(
            item.createdAt
          ).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          if (item.type === 'analysis') {
            const keywordCount = Array.isArray(item.keywords)
              ? item.keywords.length
              : item.rankingData?.results?.length || 0;

            return {
              id: item._id,
              type: 'analysis',
              label: 'SEO Analysis',
              website,
              details: `${keywordCount} keyword${
                keywordCount === 1 ? '' : 's'
              } analyzed`,
              date: formattedDate,
              status: item.status || 'completed',
            };
          }

          if (item.type === 'audit') {
            return {
              id: item._id,
              type: 'audit',
              label: 'SEO Audit',
              website,
              details:
                item.seoScore !== null && item.seoScore !== undefined
                  ? `SEO Score: ${Math.round(item.seoScore)}/100`
                  : 'SEO audit completed',
              date: formattedDate,
              status: item.status || 'completed',
              score: item.seoScore,
            };
          }

          return {
            id: item._id,
            type: 'performance',
            label: 'Performance',
            website,
            details:
              item.performance !== null && item.performance !== undefined
                ? `Performance: ${Math.round(item.performance)}/100`
                : 'Performance check completed',
            date: formattedDate,
            status: item.status || 'completed',
            score: item.performance,
          };
        });

      setDashboardData({
        totalRecords: history.length,
        uniqueWebsites: uniqueWebsites.size,
        seoAnalyses: analyses.length,
        seoAudits: audits.length,
        performanceChecks: performances.length,
        averageAuditScore,
        averagePerformance,
        aiInsights,
        recentActivity,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  /* ============================================================
     QUICK ANALYZE
  ============================================================ */
  const handleAnalyze = () => {
    if (!url) return;

    let normalizedUrl = url.trim();

    if (
      !normalizedUrl.startsWith('http://') &&
      !normalizedUrl.startsWith('https://')
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/analysis', {
        state: {
          url: normalizedUrl,
          fromDashboard: true,
        },
      });
    }, 1000);
  };

  /* ============================================================
     HELPERS
  ============================================================ */
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-[#A47551] dark:text-[#D4B59E]';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getActivityIcon = (type) => {
    if (type === 'analysis') {
      return {
        Icon: Search,
        wrapperClass: 'bg-[#7A5236]/10 dark:bg-[#A47551]/15',
        iconClass: 'text-[#7A5236] dark:text-[#D4B59E]',
      };
    }

    if (type === 'audit') {
      return {
        Icon: FileText,
        wrapperClass: 'bg-[#A47551]/10 dark:bg-[#A47551]/15',
        iconClass: 'text-[#A47551] dark:text-[#D4B59E]',
      };
    }

    return {
      Icon: Zap,
      wrapperClass: 'bg-emerald-100 dark:bg-emerald-500/10',
      iconClass: 'text-emerald-600 dark:text-emerald-400',
    };
  };

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7A5236] dark:border-[#A47551] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5E3E28] dark:text-[#D4B59E]/70">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] text-[#1A0F0A] dark:text-white relative overflow-hidden transition-colors duration-300">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7A5236]/15 dark:bg-[#A47551]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#A47551]/15 dark:bg-[#7A5236]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B59E]/20 dark:bg-[#3E2723]/40 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(122,82,54,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(122,82,54,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
                Welcome back
              </h1>
              <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1 text-lg">
                Track your website's SEO performance and receive AI-powered
                optimization suggestions.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[#7A5236]/10 dark:bg-[#A47551]/15 px-4 py-2 rounded-full border border-[#7A5236]/25 dark:border-[#A47551]/30">
              <Sparkles className="w-4 h-4 text-[#7A5236] dark:text-[#D4B59E]" />
              <span className="text-sm font-medium text-[#7A5236] dark:text-[#D4B59E]">
                AI Ready
              </span>
            </div>
          </div>
        </div>

        {/* Quick Analysis */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 mb-8 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#7A5236]/10 dark:bg-[#A47551]/15 rounded-lg">
                <Search className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              </div>
              <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white">
                Quick Website Analysis
              </h2>
            </div>

            <button
              onClick={() => navigate('/analysis')}
              className="text-sm text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] font-medium flex items-center gap-1 transition"
            >
              Full Analysis <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com"
                className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3.5 pl-12
                  focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25
                  dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25
                  transition-all duration-200 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search className="w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!url || isAnalyzing}
              className={`px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200
                ${
                  !url || isAnalyzing
                    ? 'bg-[#7A5236]/40 dark:bg-white/5 cursor-not-allowed text-white/60'
                    : 'bg-[#7A5236] hover:bg-[#5E3E28] shadow-lg shadow-[#7A5236]/40 hover:shadow-[#7A5236]/60 active:scale-95'
                }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </div>
              ) : (
                'Analyze Website'
              )}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5E3E28] dark:text-[#D4B59E]/70">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Google SERP rank tracking</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-[#7A5236] dark:text-[#D4B59E]" />
              <span>AI-powered suggestions</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-[#A47551] dark:text-[#D4B59E]" />
              <span>Keyword rank tracking</span>
            </div>
          </div>
        </div>

        {/* Stats Grid — 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total Records */}
          <div
            onClick={() => navigate('/history')}
            className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/35 dark:hover:border-[#A47551]/40 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5E3E28] dark:text-[#D4B59E]/70">
                Total Records
              </p>
              <div className="p-2 bg-[#7A5236]/10 dark:bg-[#A47551]/15 rounded-lg group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
              {dashboardData.totalRecords}
            </p>
            <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/50 mt-2">
              All analysis activity
            </p>
          </div>

          {/* Unique Websites */}
          <div
            onClick={() => navigate('/history')}
            className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5E3E28] dark:text-[#D4B59E]/70">
                Unique Websites
              </p>
              <div className="p-2 bg-[#A47551]/10 dark:bg-[#A47551]/15 rounded-lg group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
              {dashboardData.uniqueWebsites}
            </p>
            <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/50 mt-2">
              Different websites analyzed
            </p>
          </div>

          {/* SEO Analyses */}
          <div
            onClick={() => navigate('/history')}
            className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/35 dark:hover:border-[#A47551]/40 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5E3E28] dark:text-[#D4B59E]/70">
                SEO Analyses
              </p>
              <div className="p-2 bg-[#7A5236]/10 dark:bg-[#A47551]/15 rounded-lg group-hover:scale-110 transition-transform">
                <Search className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
              {dashboardData.seoAnalyses}
            </p>
            <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/50 mt-2">
              Keyword ranking analyses
            </p>
          </div>

          {/* Performance Checks */}
          <div
            onClick={() => navigate('/history')}
            className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-[#5E3E28] dark:text-[#D4B59E]/70">
                Performance Checks
              </p>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
              {dashboardData.performanceChecks}
            </p>
            <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/50 mt-2">
              PageSpeed analyses
            </p>
          </div>
        </div>

        {/* Your SEO Toolkit — 3 modules */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white mb-4 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
            Your SEO Toolkit
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* SEO Analysis */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/35 dark:hover:border-[#A47551]/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#7A5236]/10 dark:bg-[#A47551]/15 rounded-lg">
                  <Search className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A0F0A] dark:text-white">
                    SEO Analysis
                  </h3>
                  <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                    Keyword Rank Tracking
                  </p>
                </div>
              </div>

              <p className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
                {dashboardData.seoAnalyses}
              </p>
              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                analys{dashboardData.seoAnalyses === 1 ? 'is' : 'es'}{' '}
                completed
              </p>

              <button
                onClick={() => navigate('/analysis')}
                className="mt-4 text-sm text-[#7A5236] dark:text-[#D4B59E] flex items-center gap-1 hover:gap-2 transition-all font-medium"
              >
                Start Analysis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* SEO Audit */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#A47551]/10 dark:bg-[#A47551]/15 rounded-lg">
                  <FileText className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A0F0A] dark:text-white">
                    SEO Audit
                  </h3>
                  <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                    On-Page SEO Analysis
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    dashboardData.averageAuditScore
                  )}`}
                >
                  {dashboardData.averageAuditScore}
                </p>
                <span className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mb-1">
                  avg / 100
                </span>
              </div>

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                {dashboardData.seoAudits} audit
                {dashboardData.seoAudits === 1 ? '' : 's'} completed
              </p>

              <button
                onClick={() => navigate('/seo-audit')}
                className="mt-4 text-sm text-[#A47551] dark:text-[#D4B59E] flex items-center gap-1 hover:gap-2 transition-all font-medium"
              >
                Run SEO Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Performance */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A0F0A] dark:text-white">
                    Performance
                  </h3>
                  <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                    PageSpeed & Core Web Vitals
                  </p>
                </div>
              </div>

              <div className="flex items-end gap-2">
                <p
                  className={`text-3xl font-bold ${getScoreColor(
                    dashboardData.averagePerformance
                  )}`}
                >
                  {dashboardData.averagePerformance}
                </p>
                <span className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mb-1">
                  avg / 100
                </span>
              </div>

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                {dashboardData.performanceChecks} check
                {dashboardData.performanceChecks === 1 ? '' : 's'} completed
              </p>

              <button
                onClick={() => navigate('/performance')}
                className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all font-medium"
              >
                Check Performance
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Platform Features + Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Platform Features */}
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              Platform Features
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-[#7A5236]/25 dark:hover:border-[#A47551]/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-[#7A5236] dark:text-[#D4B59E]" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    SEO Analysis
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Google SERP rank tracking
                </p>
              </div>

              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    PageSpeed Insights
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Core Web Vitals & performance metrics
                </p>
              </div>

              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-[#7A5236]/25 dark:hover:border-[#A47551]/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#7A5236] dark:text-[#D4B59E]" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    AI Suggestions
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Gemini-powered SEO recommendations
                </p>
              </div>

              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    Rank Tracking
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Google SERP position monitoring
                </p>
              </div>

              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-[#A47551]/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[#A47551] dark:text-[#D4B59E]" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    Analysis History
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Track progress over time
                </p>
              </div>

              <div className="p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-[#7A5236]/25 dark:hover:border-[#A47551]/25 transition-colors cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-[#7A5236] dark:text-[#D4B59E]" />
                  <p className="font-medium text-sm text-[#1A0F0A] dark:text-white">
                    API-Powered
                  </p>
                </div>
                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Fresh data on every analysis
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              Quick Stats
            </h3>

            <div className="space-y-3">
              {/* SEO Analyses */}
              <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/10 dark:border-white/5 hover:border-[#7A5236]/25 dark:hover:border-[#A47551]/25 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      SEO Analyses
                    </p>
                    <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                      {dashboardData.seoAnalyses}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">
                    <Search className="w-6 h-6 text-[#7A5236] dark:text-[#D4B59E]" />
                  </div>
                </div>
              </div>

              {/* SEO Audits */}
              <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/10 dark:border-white/5 hover:border-[#A47551]/25 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      SEO Audits
                    </p>
                    <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                      {dashboardData.seoAudits}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#A47551]/10 dark:bg-[#A47551]/15 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#A47551] dark:text-[#D4B59E]" />
                  </div>
                </div>
              </div>

              {/* Performance Checks */}
              <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/10 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/25 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      Performance Checks
                    </p>
                    <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                      {dashboardData.performanceChecks}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              Recent Activity
            </h3>

            <button
              onClick={() => navigate('/history')}
              className="text-sm text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] transition"
            >
              View All →
            </button>
          </div>

          <div className="space-y-3">
            {dashboardData.recentActivity.length === 0 ? (
              <div className="text-center py-8 text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                <p>No activity yet</p>
                <p className="text-sm mt-1">
                  Run an SEO analysis, audit, or performance check to see
                  activity here.
                </p>
              </div>
            ) : (
              dashboardData.recentActivity.map((item) => {
                const { Icon, wrapperClass, iconClass } =
                  getActivityIcon(item.type);

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center justify-between p-4 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5 hover:border-[#7A5236]/25 dark:hover:border-[#A47551]/25 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-lg ${wrapperClass} flex-shrink-0`}
                      >
                        <Icon className={`w-4 h-4 ${iconClass}`} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-[#1A0F0A] dark:text-white">
                            {item.label}
                          </p>
                          <span className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50 capitalize">
                            {item.status}
                          </span>
                        </div>

                        <p className="text-sm text-[#1A0F0A] dark:text-[#D4B59E] truncate">
                          {item.website}
                        </p>

                        <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/50 mt-1">
                          {item.details} • {item.date}
                        </p>
                      </div>
                    </div>

                    {item.score !== undefined &&
                      item.score !== null && (
                        <div
                          className={`font-bold text-sm ml-3 flex-shrink-0 ${getScoreColor(
                            item.score
                          )}`}
                        >
                          {Math.round(item.score)}/100
                        </div>
                      )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}