import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { 
  Sparkles, Search, TrendingUp, Award, AlertTriangle, 
  Zap, Clock, ArrowRight, BarChart3, Globe,
  Rocket, Shield, FileText, Activity, 
  CheckCircle, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalAnalyses: 0,
    uniqueWebsites: 0,
    avgPerformance: 0,
    aiInsights: 0,
    recentAnalyses: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/history', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.history)) {
        const history = data.history;
        
        const totalAnalyses = history.length;
        
        const uniqueWebsites = new Set();
        history.forEach(item => {
          if (item.websiteUrl) {
            try {
              const url = item.websiteUrl.startsWith('http') 
                ? item.websiteUrl 
                : `https://${item.websiteUrl}`;
              uniqueWebsites.add(new URL(url).hostname);
            } catch (e) {
              uniqueWebsites.add(item.websiteUrl);
            }
          }
        });

        let totalPerformance = 0;
        let performanceCount = 0;
        history.forEach(item => {
          if (item.pageSpeedData?.performance) {
            totalPerformance += item.pageSpeedData.performance;
            performanceCount++;
          }
        });
        const avgPerformance = performanceCount > 0 
          ? Math.round(totalPerformance / performanceCount) 
          : 0;

        const aiInsights = history.filter(item => 
          item.aiSuggestions && item.aiSuggestions !== 'No suggestions available'
        ).length;

        const recentAnalyses = history.slice(0, 5).map(item => {
          let website = 'Unknown';
          try {
            if (item.websiteUrl) {
              const url = item.websiteUrl.startsWith('http') 
                ? item.websiteUrl 
                : `https://${item.websiteUrl}`;
              website = new URL(url).hostname;
            }
          } catch (e) {
            website = item.websiteUrl || 'Unknown';
          }

          return {
            id: item._id,
            website,
            performance: item.pageSpeedData?.performance || 0,
            keywords: item.keywords?.length || 0,
            status: item.status || 'completed',
            date: new Date(item.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            hasAiSuggestions: !!(item.aiSuggestions && item.aiSuggestions !== 'No suggestions available'),
          };
        });

        setDashboardData({
          totalAnalyses,
          uniqueWebsites: uniqueWebsites.size,
          avgPerformance,
          aiInsights,
          recentAnalyses,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    if (!url) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/analysis', { 
        state: { 
          url: url,
          fromDashboard: true 
        } 
      });
    }, 1500);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-cyan-600 dark:text-cyan-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    }
    if (status === 'pending') {
      return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20';
    }
    return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#070714] flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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

        <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back
                </h1>
                <p className="text-gray-600 dark:text-violet-300/60 mt-1 text-lg">
                  Track your website's SEO performance and receive AI-powered optimization suggestions.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-violet-100 dark:bg-violet-500/10 px-4 py-2 rounded-full border border-violet-200 dark:border-violet-500/20">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">AI Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Analysis Section */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg">
                  <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Website Analysis
                </h2>
              </div>
              <button 
                onClick={() => navigate('/analysis')}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium flex items-center gap-1 transition"
              >
                Full Analysis <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3.5 pl-12 
                    focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 
                    transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing}
                className={`px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200 
                  ${!url || isAnalyzing 
                    ? 'bg-gray-200 dark:bg-white/5 cursor-not-allowed text-gray-400 dark:text-gray-500' 
                    : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-600/30 dark:shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-95'
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
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Real-time SEO check</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span>AI-powered suggestions</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Competitor analysis</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div 
              onClick={() => navigate('/history')}
              className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Analyses</p>
                <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalAnalyses}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Analyses performed</p>
            </div>

            <div 
              onClick={() => navigate('/history')}
              className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/40 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Websites Analyzed</p>
                <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.uniqueWebsites}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Unique websites</p>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Performance</p>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
                  <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className={`text-3xl font-bold ${getScoreColor(dashboardData.avgPerformance)}`}>
                  {dashboardData.avgPerformance}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-500 mb-1">/ 100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-white/5 rounded-full h-1.5 mt-2">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    dashboardData.avgPerformance >= 70 ? 'bg-emerald-500' :
                    dashboardData.avgPerformance >= 50 ? 'bg-amber-500' :
                    'bg-rose-500'
                  }`}
                  style={{ width: `${dashboardData.avgPerformance}%` }}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/40 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Insights</p>
                <div className="p-2 bg-violet-100 dark:bg-violet-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.aiInsights}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">AI-powered suggestions</p>
            </div>
          </div>

          {/* Features & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Platform Features */}
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Platform Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">SEO Analysis</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Real-time SEO audit & keyword tracking</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-cyan-200 dark:hover:border-cyan-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">PageSpeed Insights</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Core Web Vitals & performance metrics</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">AI Suggestions</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Gemini-powered SEO recommendations</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Rank Tracking</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Google SERP position monitoring</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-cyan-200 dark:hover:border-cyan-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Analysis History</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Track progress over time</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors cursor-default">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">Real-time Data</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Live API integrations</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Total Analyses</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.totalAnalyses}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-emerald-200 dark:hover:border-emerald-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Average Performance</p>
                      <p className={`text-2xl font-bold ${getScoreColor(dashboardData.avgPerformance)}`}>
                        {dashboardData.avgPerformance}/100
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">AI Insights Generated</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.aiInsights}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Recent Analyses
              </h3>
              <button 
                onClick={() => navigate('/history')}
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition"
              >
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {dashboardData.recentAnalyses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-500">
                  <p>No analyses yet</p>
                  <p className="text-sm mt-1">Start analyzing websites to see results here</p>
                </div>
              ) : (
                dashboardData.recentAnalyses.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate('/analysis')}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{item.website}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500 dark:text-gray-500">{item.date}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-2">
                      <span className={`font-bold text-sm ${getScoreColor(item.performance)}`}>
                        {item.performance}
                      </span>
                      {item.hasAiSuggestions && (
                        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}