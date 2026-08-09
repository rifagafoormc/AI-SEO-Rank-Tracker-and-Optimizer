import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Add Link
import Navbar from '../components/Navbar';
import axios from 'axios';

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
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return styles[status] || styles.completed;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor your AI SEO Rank Tracker platform
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* ✅ Total Users Card with Manage Link */}
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                    👥
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.overview.totalUsers}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      +{stats.overview.newUsersToday} today
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/users"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Manage →
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Analyses</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalAnalyses}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    +{stats.overview.analysesToday} today
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                  🌐
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unique Websites</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overview.totalUniqueWebsites}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Analyzed so far
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl">
                  📈
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Performance</p>
                  <p className={`text-2xl font-bold ${getScoreColor(stats.overview.avgPerformance)}`}>
                    {stats.overview.avgPerformance || '—'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Across all analyses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Usage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Requests Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.dailyRequests}
              </p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      aiUsage.usagePercentage >= 90 ? 'bg-red-500' :
                      aiUsage.usagePercentage >= 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(aiUsage.usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {aiUsage.usagePercentage}% of daily limit ({aiUsage.dailyLimit})
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.activeUsers}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Unique users using AI
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">AI Insights Generated</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.aiStats.totalAiSuggestions}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                +{stats.aiStats.aiSuggestionsToday} today
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Unique URLs Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {aiUsage.uniqueUrls}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Analyzed today
              </p>
            </div>
          </div>

          {/* High Usage Warning */}
          {aiUsage.usagePercentage >= 80 && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-300">
                    High AI Usage Alert
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    AI usage is at {aiUsage.usagePercentage}% of daily limit. Consider increasing the limit or optimizing usage.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Status */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.systemStatus).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    value === 'Connected' || value === 'Available' 
                      ? 'bg-green-500' 
                      : value === 'Missing API Key' 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/70">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Website</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Performance</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Keywords</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">AI</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No recent analyses
                      </td>
                    </tr>
                  ) : (
                    stats.recentAnalyses.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/30 dark:hover:bg-gray-800/60 transition-colors">
                        <td className="py-3 px-6">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item.user}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-gray-700 dark:text-gray-300">{item.website}</td>
                        <td className="py-3 px-6">
                          <span className={`font-bold ${getScoreColor(item.performanceScore)}`}>
                            {item.performanceScore}
                          </span>
                          <span className="text-gray-400 text-sm">/100</span>
                        </td>
                        <td className="py-3 px-6 text-gray-600 dark:text-gray-400">{item.keywords}</td>
                        <td className="py-3 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {item.hasAiSuggestions ? (
                            <span className="text-green-600 dark:text-green-400">✅</span>
                          ) : (
                            <span className="text-gray-400">—</span>
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