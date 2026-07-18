import MainLayout from "../layouts/MainLayout";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // Use a default URL if none provided
    const targetUrl = url || 'https://example.com';
    setIsAnalyzing(true);
    
    setTimeout(() => {
      setIsAnalyzing(false);
      navigate('/analysis', { 
        state: { 
          url: targetUrl,
          fromDashboard: true 
        } 
      });
    }, 1500);
  };

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Track your website's SEO performance and receive AI-powered optimization suggestions.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-blue-700">✨ AI Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Analysis Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quick Website Analysis
          </h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com (or leave empty for demo)"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200 
              ${isAnalyzing 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
              }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              url ? 'Analyze Website' : '🚀 Try Demo Analysis'
            )}
          </button>
        </div>
        
        {!url && (
          <p className="mt-2 text-sm text-blue-600 flex items-center gap-1">
            <span>💡</span> 
            Click "Try Demo Analysis" to see how it works with a sample website
          </p>
        )}
        
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Real-time SEO check</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI-powered suggestions</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Competitor analysis</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Same as before */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Keywords */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Total Keywords</p>
            <div className="p-2 bg-blue-50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalKeywords}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>+12.5% this month</span>
          </div>
        </div>

        {/* Average Position */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Avg. Position</p>
            <div className="p-2 bg-purple-50 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.averagePosition}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>↑ 0.8 since last week</span>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">SEO Score</p>
            <div className="p-2 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-gray-900">{stats.seoScore}</p>
            <span className="text-sm text-gray-500 mb-1">/ 100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.seoScore}%` }}
            ></div>
          </div>
        </div>

        {/* Issues Found */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-500">Issues Found</p>
            <div className="p-2 bg-red-50 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.issuesFound}</p>
          <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>{stats.issuesFound} need attention</span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Quick Actions - Same as before */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <p className="font-medium text-gray-900">example-{item}.com</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
                <span className="text-sm font-medium text-green-600">Score: 82</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick SEO Tips</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/80 rounded-xl p-3">
              <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Optimize your meta descriptions</p>
                <p className="text-sm text-gray-600">Keep them between 150-160 characters for better CTR</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/80 rounded-xl p-3">
              <div className="p-1.5 bg-green-100 rounded-lg mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Improve page speed</p>
                <p className="text-sm text-gray-600">Compress images and leverage browser caching</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/80 rounded-xl p-3">
              <div className="p-1.5 bg-purple-100 rounded-lg mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Use header tags properly</p>
                <p className="text-sm text-gray-600">Structure your content with H1, H2, H3 tags</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}