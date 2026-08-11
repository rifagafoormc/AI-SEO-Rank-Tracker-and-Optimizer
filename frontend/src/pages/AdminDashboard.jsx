import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Users, BarChart3, Globe, TrendingUp, Zap, 
  Sparkles, Activity, AlertTriangle,
  CheckCircle, Clock, Eye, ArrowRight,
  Server, Database, Shield, Cpu
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      newUsersToday: 0,
      totalAnalyses: 0,
      analysesToday: 0,
      totalUniqueWebsites: 0,
      avgPerformance: 0,
    },
    statusCounts: {
      completed: 0,
      pending: 0,
      failed: 0,
    },
    aiStats: {
      totalAiSuggestions: 0,
      aiSuggestionsToday: 0,
    },
    recentAnalyses: [],
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
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const statsResponse = await axios.get(
        'http://localhost:5000/api/admin/stats',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const aiResponse = await axios.get(
        'http://localhost:5000/api/admin/ai/usage-stats',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      if (aiResponse.data.success) {
        setAiUsage(aiResponse.data.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
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
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
      pending: 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
      failed: 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
    };
    return styles[status] || styles.completed;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-cyan-600 dark:text-cyan-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#070714] flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
        
        {/* Background Glows - Light/Dark mode aware */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300/20 dark:bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl" />
          
          {/* Grid Pattern - Dark mode only */}
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139,92,246,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-violet-300/60 mt-1">
                Monitor your AI SEO Rank Tracker platform
              </p>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Users Card with Manage Link */}
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.overview.totalUsers}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      +{stats.overview.newUsersToday} today
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/users"
                  className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition"
                >
                  Manage <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalAnalyses}
                  </p>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">
                    +{stats.overview.analysesToday} today
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-emerald-300 dark:hover:border-emerald-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Unique Websites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalUniqueWebsites}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Analyzed so far
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-amber-300 dark:hover:border-amber-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Avg Performance</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.overview.avgPerformance)}`}>
                    {stats.overview.avgPerformance || '—'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Across all analyses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Usage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <p className="text-sm text-gray-500 dark:text-gray-500">AI Requests Today</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.dailyRequests}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      aiUsage.usagePercentage >= 90 ? 'bg-rose-500' :
                      aiUsage.usagePercentage >= 70 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(aiUsage.usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {aiUsage.usagePercentage}% of daily limit ({aiUsage.dailyLimit})
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <p className="text-sm text-gray-500 dark:text-gray-500">Active Users Today</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.activeUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Unique users using AI
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <p className="text-sm text-gray-500 dark:text-gray-500">AI Insights Generated</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.aiStats.totalAiSuggestions}
              </p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400">
                +{stats.aiStats.aiSuggestionsToday} today
              </p>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-emerald-300 dark:hover:border-emerald-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-gray-500 dark:text-gray-500">Unique URLs Today</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.uniqueUrls}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Analyzed today
              </p>
            </div>
          </div>

          {/* High Usage Warning */}
          {aiUsage.usagePercentage >= 80 && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                <div>
                  <h4 className="font-semibold text-rose-800 dark:text-rose-300">
                    High AI Usage Alert
                  </h4>
                  <p className="text-sm text-rose-700 dark:text-rose-400">
                    AI usage is at {aiUsage.usagePercentage}% of daily limit. Consider increasing the limit or optimizing usage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.systemStatus).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    value === 'Connected' || value === 'Available' 
                      ? 'bg-emerald-500' 
                      : value === 'Missing API Key' 
                        ? 'bg-rose-500' 
                        : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-violet-500/20">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Recent Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-violet-500/20">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">User</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">Website</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">Performance</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">Keywords</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">Date</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-violet-300">AI</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-500">
                        No recent analyses
                      </td>
                    </tr>
                  ) : (
                    stats.recentAnalyses.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-6">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.user}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{item.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-gray-700 dark:text-gray-400">{item.website}</td>
                        <td className="py-3 px-6">
                          <span className={`font-bold ${getScoreColor(item.performanceScore)}`}>
                            {item.performanceScore}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-sm">/100</span>
                        </td>
                        <td className="py-3 px-6 text-gray-600 dark:text-gray-400">{item.keywords}</td>
                        <td className="py-3 px-6 text-sm text-gray-500 dark:text-gray-500">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {item.hasAiSuggestions ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}