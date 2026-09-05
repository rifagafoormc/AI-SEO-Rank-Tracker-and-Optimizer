import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { 
  ArrowLeft, Search, Sparkles, TrendingUp, Award, 
  Zap, Clock, BarChart3, Eye, EyeOff, 
  ChevronRight, CheckCircle, XCircle,
  ChevronDown 
} from 'lucide-react';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [country, setCountry] = useState('in');
  const [searchDepth, setSearchDepth] = useState(100);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [analysisId, setAnalysisId] = useState(null);

  // State for custom dropdowns
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isDepthOpen, setIsDepthOpen] = useState(false);
  const countryRef = useRef(null);
  const depthRef = useRef(null);

  // Pre-fill URL if coming from dashboard
  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
      if (depthRef.current && !depthRef.current.contains(event.target)) {
        setIsDepthOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAnalyze = async () => {
    if (!url) return;

    try {
      setIsAnalyzing(true);

      const response = await axios.post(
        "http://localhost:5000/api/analysis",
        {
          url,
          keywords,
          country,
          searchDepth,
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

  // Country data
  const countries = [
    { code: 'in', name: 'India', flag: '🇮🇳' },
    { code: 'us', name: 'United States', flag: '🇺🇸' },
    { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'ca', name: 'Canada', flag: '🇨🇦' },
    { code: 'au', name: 'Australia', flag: '🇦🇺' },
    { code: 'de', name: 'Germany', flag: '🇩🇪' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
    { code: 'jp', name: 'Japan', flag: '🇯🇵' },
    { code: 'br', name: 'Brazil', flag: '🇧🇷' },
    { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
    { code: 'it', name: 'Italy', flag: '🇮🇹' },
    { code: 'es', name: 'Spain', flag: '🇪🇸' },
    { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'se', name: 'Sweden', flag: '🇸🇪' },
    { code: 'no', name: 'Norway', flag: '🇳🇴' },
    { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
    { code: 'fi', name: 'Finland', flag: '🇫🇮' },
    { code: 'pl', name: 'Poland', flag: '🇵🇱' },
    { code: 'ru', name: 'Russia', flag: '🇷🇺' },
    { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
    { code: 'ae', name: 'UAE', flag: '🇦🇪' },
    { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
    { code: 'za', name: 'South Africa', flag: '🇿🇦' },
    { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
    { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
    { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
    { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'th', name: 'Thailand', flag: '🇹🇭' },
    { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
    { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'lk', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: 'np', name: 'Nepal', flag: '🇳🇵' },
  ];

  const depthOptions = [
    { value: 10, label: 'Top 10 Results' },
    { value: 20, label: 'Top 20 Results' },
    { value: 50, label: 'Top 50 Results' },
    { value: 100, label: 'Top 100 Results' },
  ];

  const getCountryLabel = (code) => {
    const country = countries.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getDepthLabel = (value) => {
    const option = depthOptions.find(d => d.value === value);
    return option ? option.label : `${value} Results`;
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative transition-colors duration-300">
        
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

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          
          {/* Back to Dashboard */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Analysis
              </h1>
              <p className="text-gray-600 dark:text-violet-300/60 mt-1">
                Get detailed SEO insights, PageSpeed metrics, and AI-powered recommendations
              </p>
            </div>
          </div>

          {/* Analysis Form */}
          <div className="relative z-20 bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Website Details
            </h2>
            <div className="space-y-5">
              {/* Website URL */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                />
              </div>

              {/* Target Keywords */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                  Target Keywords *
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo, digital marketing, react"
                  className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">Separate keywords with commas</p>
              </div>

              {/* Country and Search Depth - Custom Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Country Custom Dropdown */}
                <div ref={countryRef}>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                    Target Country
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCountryOpen(!isCountryOpen);
                        setIsDepthOpen(false);
                      }}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white outline-none flex items-center justify-between"
                    >
                      <span>{getCountryLabel(country)}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isCountryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isCountryOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a2e] border border-violet-200 dark:border-violet-500/20 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {countries.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountry(c.code);
                              setIsCountryOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors flex items-center gap-2 ${
                              country === c.code 
                                ? 'bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Check Google rankings for the selected country
                  </p>
                </div>

                {/* Search Depth Custom Dropdown */}
                <div ref={depthRef}>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                    Search Depth
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDepthOpen(!isDepthOpen);
                        setIsCountryOpen(false);
                      }}
                      className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white outline-none flex items-center justify-between"
                    >
                      <span>{getDepthLabel(searchDepth)}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isDepthOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isDepthOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a2e] border border-violet-200 dark:border-violet-500/20 rounded-xl shadow-lg">
                        {depthOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSearchDepth(option.value);
                              setIsDepthOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors ${
                              searchDepth === option.value 
                                ? 'bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    How many Google results to search
                  </p>
                </div>
              </div>

              {/* Analyze Button */}
              <button 
                onClick={handleAnalyze}
                disabled={!url || !keywords || isAnalyzing}
                className={`w-full px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200
                  ${!url || !keywords || isAnalyzing 
                    ? 'bg-gray-200 dark:bg-white/5 cursor-not-allowed text-gray-400 dark:text-gray-500' 
                    : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 active:scale-95'
                  }`}
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </div>
                ) : (
                  'Analyze Website'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="relative z-10 bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Rank Tracking Result
            </h2>

            {!result ? (
              <p className="text-gray-500 dark:text-gray-500">
                No tracking data yet. Enter a website and keywords.
              </p>
            ) : (
              <>
                {/* Website Info */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                  <p className="font-medium text-gray-700 dark:text-violet-300">Website</p>
                  <p className="text-gray-900 dark:text-white break-all">{result.url}</p>
                  {result.selectedCountry && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      🌍 Country: {result.selectedCountry.toUpperCase()} | 
                      🔎 Depth: {result.selectedSearchDepth || 100} results
                    </p>
                  )}
                  {analysisId && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Analysis ID: {analysisId}
                    </p>
                  )}
                </div>

                {/* Keyword Rankings Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-violet-200 dark:border-violet-500/20 bg-gray-50 dark:bg-white/5">
                        <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Keyword</th>
                        <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Google Rank</th>
                        <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Page</th>
                        <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results?.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="p-3 font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                          <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">
                            {item.rank !== 'Not Found' ? `#${item.rank}` : '—'}
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400">{item.page}</td>
                          <td className="p-3">
                            {item.relevant === false ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                  <XCircle className="w-4 h-4" />
                                  Unrelated
                                </span>
                                {item.relevanceReason && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                    {item.relevanceReason}
                                  </span>
                                )}
                              </div>
                            ) : item.relevant === null ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                                  ⚠️ Unable to determine
                                </span>
                                {item.relevanceReason && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                    {item.relevanceReason}
                                  </span>
                                )}
                              </div>
                            ) : item.found ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Found
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Not Found
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Suggestions */}
                <div className="mt-8">
                  {result.results?.some(item => item.relevant === true) ? (
                    <>
                      <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-4 py-2.5 rounded-xl transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        {showSuggestions
                          ? 'Hide AI Optimization Suggestions'
                          : 'View AI Optimization Suggestions'}
                      </button>

                      {showSuggestions && aiSuggestions && (
                        <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl transition-colors">
                          <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-400 mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            AI SEO Suggestions
                          </h3>
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-sans">
                            {aiSuggestions}
                          </pre>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                      <p className="text-amber-700 dark:text-amber-400">
                        ⚠️ No optimization suggestions were generated because the
                        entered keywords are not relevant to this website.
                      </p>
                    </div>
                  )}
                </div>

                {/* 🚀 PERFORMANCE ANALYSIS SECTION - Updated with FCP and 5 columns */}
                <div className="mt-10 border-t border-gray-200 dark:border-violet-500/20 pt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Performance Analysis
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Google PageSpeed Insights & Core Web Vitals
                      </p>
                    </div>
                  </div>

                  {/* Performance Cards - Updated to 5 columns with FCP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Performance Score */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-500">Performance</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.performance)
                          ? result.performance >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                            : result.performance >= 50 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.performance) 
                          ? `${result.performance}/100` 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Overall speed score</p>
                    </div>

                    {/* FCP - First Contentful Paint */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/20 transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-500">FCP</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.fcp)
                          ? parseFloat(result.fcp) < 1.8 ? 'text-emerald-600 dark:text-emerald-400'
                            : parseFloat(result.fcp) < 3.0 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.fcp) ? result.fcp : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">First Contentful Paint</p>
                    </div>

                    {/* LCP - Largest Contentful Paint */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-cyan-200 dark:hover:border-cyan-500/20 transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-500">LCP</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.lcp)
                          ? parseFloat(result.lcp) < 2.5 ? 'text-emerald-600 dark:text-emerald-400'
                            : parseFloat(result.lcp) < 4.0 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.lcp) ? result.lcp : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Largest Contentful Paint</p>
                    </div>

                    {/* CLS - Cumulative Layout Shift */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-500/20 transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-500">CLS</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.cls)
                          ? parseFloat(result.cls) < 0.1 ? 'text-emerald-600 dark:text-emerald-400'
                            : parseFloat(result.cls) < 0.25 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.cls) ? result.cls : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Cumulative Layout Shift</p>
                    </div>

                    {/* TBT - Total Blocking Time */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-gray-200 dark:border-white/5 hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors">
                      <p className="text-sm text-gray-500 dark:text-gray-500">TBT</p>
                      <p className={`text-3xl font-bold mt-2 ${
                        hasValue(result.tbt)
                          ? parseInt(result.tbt) < 200 ? 'text-emerald-600 dark:text-emerald-400'
                            : parseInt(result.tbt) < 500 ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {hasValue(result.tbt) ? result.tbt : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Total Blocking Time</p>
                    </div>
                  </div>

                  {/* Show message when no performance data is available */}
                  {!hasValue(result.performance) && 
                   !hasValue(result.fcp) &&
                   !hasValue(result.lcp) && 
                   !hasValue(result.cls) && 
                   !hasValue(result.tbt) && (
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                      <p className="text-amber-700 dark:text-amber-400 text-center">
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