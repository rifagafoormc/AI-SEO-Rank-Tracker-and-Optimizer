import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar"; // ✅ 1. Import the Navbar

export default function Dashboard() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const stats = {
    totalKeywords: 1247,
    averagePosition: 4.8,
    seoScore: 78,
    issuesFound: 12
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

  return (
    <>
      {/* ✅ 2. Render the Navbar right here */}
      <Navbar /> 

      {/* ✅ 3. Your dashboard content */}
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
        
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Track your website's SEO performance and receive AI-powered optimization suggestions.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-700/50">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">✨ AI Ready</span>
              </div>
            </div>
          </div>

          {/* Quick Analysis Section */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 mb-8 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Website Analysis
                </h2>
              </div>
              <button 
                onClick={() => navigate('/analysis')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition"
              >
                Full Analysis →
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 pl-12 
                    focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 
                    transition-all duration-200 bg-white dark:bg-[#1e293b] text-gray-900 dark:text-white 
                    placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing}
                className={`px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200 
                  ${!url || isAnalyzing 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 hover:shadow-lg dark:hover:shadow-blue-900/50 active:scale-95'
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
            
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real-time SEO check</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>AI-powered suggestions</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Competitor analysis</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div 
              onClick={() => navigate('/keywords')}
              className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-blue-200 dark:hover:border-blue-700/50 group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Keywords</p>
                <div className="p-2 bg-blue-50 dark:bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalKeywords}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>+12.5% this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Position</p>
                <div className="p-2 bg-purple-50 dark:bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averagePosition}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>↑ 0.8 since last week</span>
              </div>
            </div>

            <div 
              onClick={() => navigate('/analysis')}
              className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 cursor-pointer hover:border-green-200 dark:hover:border-green-700/50 group"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">SEO Score</p>
                <div className="p-2 bg-green-50 dark:bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.seoScore}</p>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">/ 100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.seoScore}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Issues Found</p>
                <div className="p-2 bg-red-50 dark:bg-red-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.issuesFound}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600 dark:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span>{stats.issuesFound} need attention</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Analyses</h3>
                <button 
                  onClick={() => navigate('/analysis')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div 
                    key={item} 
                    onClick={() => navigate('/analysis')}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1e293b] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-200">example-{item}.com</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</p>
                    </div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Score: 82</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg dark:shadow-xl border border-blue-100 dark:border-blue-700/40 p-6 transition-colors duration-300">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 Quick SEO Tips</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-white/80 dark:bg-gray-800/40 rounded-xl p-3 transition-colors">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-lg mt-0.5 shrink-0">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">Optimize your meta descriptions</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Keep them between 150-160 characters for better CTR</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 dark:bg-gray-800/40 rounded-xl p-3 transition-colors">
                  <div className="p-1.5 bg-green-100 dark:bg-green-500/20 rounded-lg mt-0.5 shrink-0">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">Improve page speed</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Compress images and leverage browser caching</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/80 dark:bg-gray-800/40 rounded-xl p-3 transition-colors">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-500/20 rounded-lg mt-0.5 shrink-0">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-200">Use header tags properly</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Structure your content with H1, H2, H3 tags</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}