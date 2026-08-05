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

      console.log(response.data);

      setResult(response.data.data);
      setAiSuggestions(
        response.data.data.aiSuggestions || 'No AI suggestions available'
      );

    } catch (error) {
      console.error(error);
      alert("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* ✅ 1. Outer Background: Lighter Dark Gray (Slate-800) */}
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
                Get detailed SEO insights and AI-powered recommendations
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-700 dark:text-blue-300">⏳ 9 analyses remaining today</span>
            </div>
          </div>

          {/* Analysis Form */}
          {/* ✅ 2. Inner Card: Darker than background (Slate-900) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6 mb-8 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">
              Website Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Website URL *
                </label>
                {/* ✅ 3. Input: Matches the outer background color (sunken effect) */}
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
          {/* ✅ 4. Result Card: Same Darker color as the form card */}
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
                <div className="mb-6">
                  <p className="font-medium text-gray-700 dark:text-gray-300">Website</p>
                  <p className="text-blue-600 dark:text-blue-400 break-all">{result.url}</p>
                </div>

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
                      {result.results.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-3 font-medium dark:text-gray-300">{item.keyword}</td>
                          <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">#{item.rank}</td>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}