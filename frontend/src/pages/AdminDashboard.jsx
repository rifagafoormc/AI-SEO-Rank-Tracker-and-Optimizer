import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  BarChart3,
  Globe,
  TrendingUp,
  Zap,
  Sparkles,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Server,
  Shield,
  FileText,
  Gauge,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      newUsersToday: 0,

      totalAnalyses: 0,
      analysesToday: 0,

      totalAudits: 0,
      auditsToday: 0,

      totalPerformanceChecks: 0,
      performanceChecksToday: 0,

      totalUniqueWebsites: 0,

      avgAuditScore: 0,
      avgPerformance: 0,
    },

    statusCounts: {
      analyses: {
        completed: 0,
        pending: 0,
        failed: 0,
      },

      audits: {
        completed: 0,
        failed: 0,
      },

      performance: {
        completed: 0,
        failed: 0,
      },
    },

    aiStats: {
      totalAiSuggestions: 0,
      aiSuggestionsToday: 0,
      analysisAiSuggestions: 0,
      auditAiSuggestions: 0,
    },

    recentActivity: [],
    chartData: [],
    systemStatus: {},
  });

  const [aiUsage, setAiUsage] = useState({
    dailyRequests: 0,
    dailyLimit: 100,
    activeUsers: 0,
    aiInsights: 0,
    uniqueUrls: 0,
    usagePercentage: 0,
  });

  useEffect(() => {
    fetchAdminData();

    const interval = setInterval(
      fetchAdminData,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsResponse, aiResponse] =
        await Promise.all([
          axios.get(
            `${API_BASE_URL}/api/admin/stats`,
            { headers }
          ),

          axios.get(
            `${API_BASE_URL}/api/admin/ai/usage-stats`,
            { headers }
          ),
        ]);

      if (statsResponse.data.success) {
        const data =
          statsResponse.data.data || {};

        setStats((prev) => ({
          ...prev,
          ...data,

          overview: {
            ...prev.overview,
            ...(data.overview || {}),
          },

          statusCounts: {
            ...prev.statusCounts,
            ...(data.statusCounts || {}),
          },

          aiStats: {
            ...prev.aiStats,
            ...(data.aiStats || {}),
          },

          recentActivity:
            Array.isArray(data.recentActivity)
              ? data.recentActivity
              : [],
        }));
      }

      if (aiResponse.data.success) {
        setAiUsage((prev) => ({
          ...prev,
          ...(aiResponse.data.data || {}),
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error(
        'Error fetching admin data:',
        error
      );

      if (error.response?.status === 403) {
        alert('Access denied. Admin only.');
        navigate('/dashboard');
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setLoading(false);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed:
        'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',

      pending:
        'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',

      failed:
        'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
    };

    return (
      styles[status] ||
      styles.completed
    );
  };

  const getScoreColor = (score) => {
    if (score >= 90) {
      return 'text-emerald-600 dark:text-emerald-400';
    }

    if (score >= 70) {
      return 'text-[#A47551] dark:text-[#D4B59E]';
    }

    if (score >= 50) {
      return 'text-amber-600 dark:text-amber-400';
    }

    return 'text-rose-600 dark:text-rose-400';
  };

  const getActivityInfo = (type) => {
    if (type === 'audit') {
      return {
        label: 'SEO Audit',
        Icon: FileText,
        className:
          'bg-[#A47551]/10 dark:bg-[#A47551]/15 text-[#A47551] dark:text-[#D4B59E] border-[#A47551]/25',
      };
    }

    if (type === 'performance') {
      return {
        label: 'Performance',
        Icon: Gauge,
        className:
          'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
      };
    }

    return {
      label: 'SEO Analysis',
      Icon: BarChart3,
      className:
        'bg-[#7A5236]/10 dark:bg-[#A47551]/15 text-[#7A5236] dark:text-[#D4B59E] border-[#7A5236]/25',
    };
  };

  const getDetailText = (item) => {
    if (item.details) {
      return item.details;
    }

    if (
      item.type === 'audit' &&
      item.score != null
    ) {
      return `SEO Score: ${Math.round(
        item.score
      )}/100`;
    }

    if (
      item.type === 'performance' &&
      item.score != null
    ) {
      return `Performance Score: ${Math.round(
        item.score
      )}/100`;
    }

    return '—';
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
            Loading admin dashboard...
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

      <div className="relative z-10 max-w-7xl mx-auto p-6">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white flex items-center gap-2">

              <Shield className="w-8 h-8 text-[#7A5236] dark:text-[#D4B59E]" />

              Admin Dashboard

            </h1>

            <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1">
              Monitor your AI SEO Rank Tracker platform
            </p>

          </div>

        </div>

        {/* =====================================================
            OVERVIEW CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Total Users */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">

                  <Users className="w-6 h-6 text-[#7A5236] dark:text-[#D4B59E]" />

                </div>

                <div>

                  <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                    Total Users
                  </p>

                  <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                    {stats.overview.totalUsers}
                  </p>

                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    +{stats.overview.newUsersToday} today
                  </p>

                </div>

              </div>

              <Link
                to="/admin/users"
                className="text-sm text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] font-medium flex items-center gap-1 transition"
              >
                Manage
                <ArrowRight className="w-3 h-3" />
              </Link>

            </div>

          </div>

          {/* SEO Analyses */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">

                <BarChart3 className="w-6 h-6 text-[#7A5236] dark:text-[#D4B59E]" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  SEO Analyses
                </p>

                <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                  {stats.overview.totalAnalyses}
                </p>

                <p className="text-xs text-[#7A5236] dark:text-[#D4B59E]">
                  +{stats.overview.analysesToday} today
                </p>

              </div>

            </div>

          </div>

          {/* SEO Audits */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-[#A47551]/10 dark:bg-[#A47551]/15 flex items-center justify-center">

                <FileText className="w-6 h-6 text-[#A47551] dark:text-[#D4B59E]" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  SEO Audits
                </p>

                <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                  {stats.overview.totalAudits ?? 0}
                </p>

                <p className="text-xs text-[#A47551] dark:text-[#D4B59E]">
                  +{stats.overview.auditsToday ?? 0} today
                </p>

              </div>

            </div>

          </div>

          {/* Performance */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">

                <Gauge className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Performance Checks
                </p>

                <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                  {stats.overview.totalPerformanceChecks ?? 0}
                </p>

                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  +{stats.overview.performanceChecksToday ?? 0} today
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            SECONDARY STATS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {/* Unique Websites */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">

                <Globe className="w-6 h-6 text-[#7A5236] dark:text-[#D4B59E]" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Unique Websites
                </p>

                <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                  {stats.overview.totalUniqueWebsites}
                </p>

                <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                  Across all modules
                </p>

              </div>

            </div>

          </div>

          {/* Average SEO Audit Score */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-[#A47551]/10 dark:bg-[#A47551]/15 flex items-center justify-center">

                <FileText className="w-6 h-6 text-[#A47551] dark:text-[#D4B59E]" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Avg SEO Score
                </p>

                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.overview.avgAuditScore
                  )}`}
                >
                  {stats.overview.avgAuditScore || '—'}
                </p>

                <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                  Across all SEO audits
                </p>

              </div>

            </div>

          </div>

          {/* Average Performance */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-amber-200 dark:border-amber-500/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-amber-300 dark:hover:border-amber-400/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">

                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />

              </div>

              <div>

                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Avg Performance
                </p>

                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    stats.overview.avgPerformance
                  )}`}
                >
                  {stats.overview.avgPerformance || '—'}
                </p>

                <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                  Across all performance checks
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            AI USAGE
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* AI Requests */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3 mb-2">

              <Zap className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                AI Requests Today
              </p>

            </div>

            <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
              {aiUsage.dailyRequests}
            </p>

            <div className="mt-2">

              <div className="w-full bg-[#7A5236]/10 dark:bg-white/5 rounded-full h-2">

                <div
                  className={`h-2 rounded-full transition-all ${
                    aiUsage.usagePercentage >= 90
                      ? 'bg-rose-500'
                      : aiUsage.usagePercentage >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      aiUsage.usagePercentage,
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50 mt-1">
                {aiUsage.usagePercentage}% of daily limit (
                {aiUsage.dailyLimit})
              </p>

            </div>

          </div>

          {/* Active Users */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3 mb-2">

              <Users className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E]" />

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                Active Users Today
              </p>

            </div>

            <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
              {aiUsage.activeUsers}
            </p>

            <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50 mt-1">
              Unique users using AI
            </p>

          </div>

          {/* AI Insights */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3 mb-2">

              <Sparkles className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                AI Insights
              </p>

            </div>

            <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
              {stats.aiStats.totalAiSuggestions}
            </p>

            <p className="text-xs text-[#7A5236] dark:text-[#D4B59E]">
              +{stats.aiStats.aiSuggestionsToday} today
            </p>

          </div>

          {/* Unique URLs */}

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300 p-6">

            <div className="flex items-center gap-3 mb-2">

              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                Unique URLs Today
              </p>

            </div>

            <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
              {aiUsage.uniqueUrls}
            </p>

            <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50 mt-1">
              Used across the platform
            </p>

          </div>

        </div>

        {/* =====================================================
            HIGH AI USAGE WARNING
        ====================================================== */}

        {aiUsage.usagePercentage >= 80 && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">

            <div className="flex items-center gap-3">

              <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />

              <div>

                <h4 className="font-semibold text-rose-800 dark:text-rose-300">
                  High AI Usage Alert
                </h4>

                <p className="text-sm text-rose-700 dark:text-rose-400">
                  AI usage is at {aiUsage.usagePercentage}% of daily limit.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            SYSTEM STATUS
        ====================================================== */}

        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6 mb-6">

          <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white mb-4 flex items-center gap-2">

            <Server className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />

            System Status

          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {Object.entries(
              stats.systemStatus
            ).map(([key, value]) => (

              <div
                key={key}
                className="flex items-center gap-3 p-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/10 dark:border-white/5"
              >

                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    value === 'Connected' ||
                    value === 'Available'
                      ? 'bg-emerald-500'
                      : value === 'Missing API Key'
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                />

                <div>

                  <p className="text-sm font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90 capitalize">
                    {key
                      .replace(
                        /([A-Z])/g,
                        ' $1'
                      )
                      .trim()}
                  </p>

                  <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                    {value}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

        {/* =====================================================
            RECENT ACTIVITY
        ====================================================== */}

        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 overflow-hidden">

          <div className="p-6 border-b border-[#7A5236]/15 dark:border-[#A47551]/25">

            <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white flex items-center gap-2">

              <Clock className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />

              Recent Activity

            </h3>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 border-b border-[#7A5236]/15 dark:border-[#A47551]/25">

                <tr>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    User
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    Website
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    Activity
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    Details
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    Date
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    Status
                  </th>

                  <th className="text-left py-3 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">
                    AI
                  </th>

                </tr>

              </thead>

              <tbody>

                {stats.recentActivity.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-8 text-[#5E3E28]/70 dark:text-[#D4B59E]/60"
                    >
                      No recent activity
                    </td>

                  </tr>

                ) : (

                  stats.recentActivity.map(
                    (item) => {

                      const activityInfo =
                        getActivityInfo(
                          item.type
                        );

                      const ActivityIcon =
                        activityInfo.Icon;

                      return (

                        <tr
                          key={`${item.type}-${item.id}`}
                          className="border-b border-[#7A5236]/10 dark:border-white/5 hover:bg-[#7A5236]/5 dark:hover:bg-[#A47551]/10 transition-colors"
                        >

                          {/* User */}

                          <td className="py-3 px-6">

                            <div>

                              <p className="font-medium text-[#1A0F0A] dark:text-white">
                                {item.user}
                              </p>

                              <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                                {item.email}
                              </p>

                            </div>

                          </td>

                          {/* Website */}

                          <td className="py-3 px-6 text-[#5E3E28]/80 dark:text-[#D4B59E]/70">
                            {item.website}
                          </td>

                          {/* Activity */}

                          <td className="py-3 px-6">

                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${activityInfo.className}`}
                            >

                              <ActivityIcon className="w-3.5 h-3.5" />

                              {activityInfo.label}

                            </span>

                          </td>

                          {/* Details */}

                          <td className="py-3 px-6 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                            {getDetailText(item)}
                          </td>

                          {/* Date */}

                          <td className="py-3 px-6 text-sm text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                            {formatDate(item.date)}
                          </td>

                          {/* Status */}

                          <td className="py-3 px-6">

                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>

                          </td>

                          {/* AI */}

                          <td className="py-3 px-6">

                            {item.hasAiSuggestions ? (

                              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

                            ) : (

                              <span className="text-[#5E3E28]/50 dark:text-[#D4B59E]/40">
                                —
                              </span>

                            )}

                          </td>

                        </tr>

                      );
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}