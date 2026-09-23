import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import {
  ArrowLeft, Search, Sparkles, BarChart3,
  CheckCircle, XCircle, ChevronDown
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
  const [analysisId, setAnalysisId] = useState(null);

  // ✅ Relevance check state
  const [checkingRelevance, setCheckingRelevance] = useState(false);

  // ✅ Per-keyword optimization state
  const [optimizingKeyword, setOptimizingKeyword] = useState(null);
  const [keywordOptimizations, setKeywordOptimizations] = useState({});
  const [optimizationErrors, setOptimizationErrors] = useState({});

  // Dropdowns
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isDepthOpen, setIsDepthOpen] = useState(false);
  const countryRef = useRef(null);
  const depthRef = useRef(null);

  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location]);

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

  /* ============================================================
     STEP 1: Analyze Website (ranking only)
     ============================================================ */
  const handleAnalyze = async () => {
    if (!url) return;

    try {
      setIsAnalyzing(true);

      // Reset all per-keyword state
      setKeywordOptimizations({});
      setOptimizationErrors({});
      setOptimizingKeyword(null);

      const response = await axios.post(
        "http://localhost:5000/api/analysis",
        { url, keywords, country, searchDepth },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log('Analysis API Response:', response.data);

      setResult(response.data.data);
      setAnalysisId(response.data.analysisId);

    } catch (error) {
      console.error('Analysis Error:', error.response?.data || error.message);
      alert(error.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ============================================================
     STEP 2: Check Keyword Relevance (on-demand)
     ============================================================ */
  const handleCheckRelevance = async () => {
    if (!analysisId) return;

    try {
      setCheckingRelevance(true);

      const response = await axios.post(
        "http://localhost:5000/api/analysis/check-relevance",
        { analysisId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Relevance API Response:", response.data);

      setResult((prev) => ({
        ...prev,
        results: response.data.data.results,
      }));

    } catch (error) {
      console.error(
        "Relevance Error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to check keyword relevance."
      );

    } finally {
      setCheckingRelevance(false);
    }
  };

  /* ============================================================
     STEP 3: Optimize a single keyword
     ============================================================ */
  const handleOptimizeKeyword = async (item) => {
    if (!analysisId) return;

    try {
      setOptimizingKeyword(item.keyword);

      setOptimizationErrors((prev) => ({
        ...prev,
        [item.keyword]: null,
      }));

      const response = await axios.post(
        "http://localhost:5000/api/analysis/optimize-keyword",
        {
          analysisId,
          keyword: item.keyword,
          rank: item.rank,
          rankingUrl: item.rankingUrl,
          url: result.url,
          country: result.selectedCountry || country,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setKeywordOptimizations((prev) => ({
        ...prev,
        [item.keyword]: response.data.data,
      }));

    } catch (error) {
      console.error(
        "Keyword optimization error:",
        error.response?.data || error.message
      );

      setOptimizationErrors((prev) => ({
        ...prev,
        [item.keyword]:
          error.response?.data?.message ||
          "Unable to generate optimization suggestions.",
      }));
    } finally {
      setOptimizingKeyword(null);
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative transition-colors duration-300">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-300/20 dark:bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl" />

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

        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              SEO Analysis
            </h1>
            <p className="text-gray-600 dark:text-violet-300/60 mt-1">
              Get detailed SEO insights and AI-powered recommendations
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              {/* Check Relevance Button */}
              <div className="mb-6">
                <button
                  onClick={handleCheckRelevance}
                  disabled={!analysisId || checkingRelevance}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-medium hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {checkingRelevance
                    ? "Checking Relevance..."
                    : "Check Keyword Relevance"}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Uses AI to determine whether each target keyword is relevant
                  to the website.
                </p>
              </div>

              {/* Keyword Rankings Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-violet-200 dark:border-violet-500/20 bg-gray-50 dark:bg-white/5">
                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Keyword</th>
                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Google Rank</th>
                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Ranking Page</th>
                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Status</th>
                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">Optimization</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-medium text-gray-900 dark:text-white">{item.keyword}</td>
                        <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">
                          {item.rank !== 'Not Found' ? `#${item.rank}` : '—'}
                        </td>
                        <td className="p-3 text-gray-500 dark:text-gray-400 break-all max-w-xs text-xs">
                          {item.rankingUrl ? (
                            <a
                              href={item.rankingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-violet-500 hover:underline"
                            >
                              {item.rankingUrl}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Status column — handles 3 states:
                            undefined → relevance not yet checked
                            false     → unrelated
                            null      → unable to determine
                            true      → relevant */}
                        <td className="p-3">
                          {item.relevant === undefined ? (
                            item.found ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Found
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                                <XCircle className="w-4 h-4" />
                                Not Found
                              </span>
                            )
                          ) : item.relevant === false ? (
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
                            <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                              ⚠️ Unable to determine
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Relevant
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Confidence: {item.relevanceConfidence}%
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Optimization column — only when relevance === true */}
                        <td className="p-3">
                          {item.relevant === true ? (
                            <button
                              onClick={() => handleOptimizeKeyword(item)}
                              disabled={optimizingKeyword === item.keyword}
                              className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-medium hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 transition flex items-center gap-2"
                            >
                              <Sparkles className="w-4 h-4" />
                              {optimizingKeyword === item.keyword
                                ? "Optimizing..."
                                : item.found
                                ? "Optimize"
                                : "Find & Optimize"}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Not available
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Per-keyword optimization results */}
              {Object.keys(keywordOptimizations).length > 0 && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Keyword Optimization
                  </h3>

                  {Object.entries(keywordOptimizations).map(([kw, opt]) => (
                    <KeywordOptimizationCard
                      key={kw}
                      keyword={kw}
                      optimization={opt}
                    />
                  ))}
                </div>
              )}

              {/* Optimization errors */}
              {Object.entries(optimizationErrors).some(([, v]) => v) && (
                <div className="mt-6 space-y-2">
                  {Object.entries(optimizationErrors)
                    .filter(([, v]) => v)
                    .map(([kw, err]) => (
                      <div
                        key={kw}
                        className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm"
                      >
                        <span className="font-medium text-rose-700 dark:text-rose-400">
                          {kw}:
                        </span>{" "}
                        <span className="text-rose-600 dark:text-rose-300">{err}</span>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Sub-component: renders one keyword's optimization card
------------------------------------------------------- */
function KeywordOptimizationCard({ keyword, optimization }) {
  if (!optimization) return null;

  const recs = optimization.recommendations || [];
  const notes = optimization.generalNotes || [];

  return (
    <div className="p-5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl">
      <div className="mb-4">
        <h4 className="text-base font-semibold text-violet-800 dark:text-violet-300">
          Keyword: <span className="text-gray-900 dark:text-white">{keyword}</span>
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Current Rank:{" "}
          <span className="font-medium text-violet-600 dark:text-violet-400">
            {optimization.currentRank === 'Not Found'
              ? 'Not Found'
              : `#${optimization.currentRank}`}
          </span>
          {optimization.targetPage && (
            <>
              {" | "}Target Page:{" "}
              <a
                href={optimization.targetPage}
                target="_blank"
                rel="noreferrer"
                className="text-violet-500 hover:underline break-all"
              >
                {optimization.targetPage}
              </a>
            </>
          )}
        </p>
      </div>

      {recs.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No specific recommendations were generated for this keyword.
        </p>
      ) : (
        <div className="space-y-4">
          {recs.map((rec, i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-[#0a0a1a]/80 border border-violet-100 dark:border-violet-500/10 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-violet-700 dark:text-violet-400 text-sm">
                  {rec.element}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
                  {rec.status}
                </span>
              </div>

              {rec.current && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                    {rec.current}
                  </p>
                </div>
              )}

              {rec.suggested && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Suggested
                  </p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 break-words">
                    {rec.suggested}
                  </p>
                </div>
              )}

              {rec.reason && (
                <div className="mb-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Why
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.reason}
                  </p>
                </div>
              )}

              {rec.impact && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Potential benefit
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {rec.impact}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-4 pt-3 border-t border-violet-200 dark:border-violet-500/20">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            General Notes
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-0.5">
            {notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}