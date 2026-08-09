import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [analysisId, setAnalysisId] = useState(null);

  // Pre-fill URL if coming from dashboard
  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location]);

  const handleAnalyze = async () => {
    if (!url) return;

    try {
      setIsAnalyzing(true);

      const response = await axios.post(
        "http://localhost:5000/api/analysis",
        {
          url,
          keywords,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log('Full API Response:', response.data);

      setResult(response.data.data);
      setAiSuggestions(
        response.data.data.aiSuggestions || 'No AI suggestions available'
      );
      setAnalysisId(response.data.analysisId);

    } catch (error) {
      console.error('Analysis Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to check if value exists
  const hasValue = (value) => {
    return value !== null && value !== undefined;
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] text-gray-900 dark:text-gray-100 p-6 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Back to Dashboard */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Get detailed SEO insights, PageSpeed metrics, and AI-powered recommendations
              </p>
            </div>
          </div>

          {/* Analysis Form */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 mb-8 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">
              Website Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                  bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 
                  text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Target Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo, digital marketing, react"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                  bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 
                  text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Separate keywords with commas</p>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing}
                className={`px-8 py-3 rounded-lg text-white transition font-medium
                  ${!url || isAnalyzing 
                    ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                  }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">
              Rank Tracking Result
            </h2>

            {!result ? (
              <p className="text-gray-500 dark:text-gray-400">
                No tracking data yet. Enter a website and keywords.
              </p>
            ) : (
              <>
                {/* Website Info */}
                <div className="mb-6">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Website</p>
                  <p className="text-blue-600 dark:text-blue-400 break-all">{result.url}</p>
                  {analysisId && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Analysis ID: {analysisId}
                    </p>
                  )}
                </div>

                {/* Keyword Rankings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300">Keyword</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300">Google Rank</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300">Page</th>
                        <th className="text-left p-3 text-gray-700 dark:text-gray-300">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results?.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-3 font-medium dark:text-gray-300">{item.keyword}</td>
                          <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">
                            {item.rank !== 'Not Found' ? `#${item.rank}` : '—'}
                          </td>
                          <td className="p-3 dark:text-gray-400">{item.page}</td>
                          <td className="p-3">
                            {item.found ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">Found</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 font-medium">Not Found</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Suggestions */}
                <div className="mt-8">
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    {showSuggestions
                      ? 'Hide AI Optimization Suggestions'
                      : 'View AI Optimization Suggestions'}
                  </button>
                  {showSuggestions && aiSuggestions && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors">
                      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
                        AI SEO Suggestions
                      </h3>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                        {aiSuggestions}
                      </pre>
                    </div>
                  )}
                </div>

                {/* 🚀 PERFORMANCE ANALYSIS SECTION - Clean version with only 4 cards */}
                <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Performance Analysis
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Google PageSpeed Insights & Core Web Vitals
                      </p>
                    </div>
                  </div>

                  {/* Only 4 Performance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Performance</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.performance)
                          ? result.performance >= 90 ? 'text-green-600 dark:text-green-400'
                            : result.performance >= 50 ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.performance) 
                          ? `${result.performance}/100` 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overall speed score</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">LCP</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {hasValue(result.lcp) ? result.lcp : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Largest Contentful Paint</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">CLS</p>
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                        {hasValue(result.cls) ? result.cls : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cumulative Layout Shift</p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">TBT</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.tbt)
                          ? parseInt(result.tbt) < 200 ? 'text-green-600 dark:text-green-400'
                            : parseInt(result.tbt) < 500 ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.tbt) ? result.tbt : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Blocking Time</p>
                    </div>
                  </div>

                  {/* Show message when no performance data is available */}
                  {!hasValue(result.performance) && 
                   !hasValue(result.lcp) && 
                   !hasValue(result.cls) && 
                   !hasValue(result.tbt) && (
                    <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-300 text-center">
                        ⚠️ PageSpeed data unavailable. Unable to fetch performance metrics right now. Please try again later.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}