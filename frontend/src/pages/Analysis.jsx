import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  ArrowLeft,
  Search,
  Sparkles,
  BarChart3,
  CheckCircle,
  XCircle,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [country, setCountry] = useState('in');
  // Default 10 = 1 SerpAPI credit per keyword (each 10 results = 1 credit)
  const [searchDepth, setSearchDepth] = useState(10);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);

  // Relevance
  const [checkingRelevance, setCheckingRelevance] = useState(false);

  // Optimization
  const [optimizingKeyword, setOptimizingKeyword] = useState(null);
  const [keywordOptimizations, setKeywordOptimizations] = useState({});
  const [optimizationErrors, setOptimizationErrors] = useState({});

  // Dropdowns
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isDepthOpen, setIsDepthOpen] = useState(false);

  const countryRef = useRef(null);
  const depthRef = useRef(null);

  /* ============================================================
     Load URL passed from another page
  ============================================================ */
  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location]);

  /* ============================================================
     Close dropdowns when clicking outside
  ============================================================ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryRef.current &&
        !countryRef.current.contains(event.target)
      ) {
        setIsCountryOpen(false);
      }

      if (
        depthRef.current &&
        !depthRef.current.contains(event.target)
      ) {
        setIsDepthOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /* ============================================================
     Credit estimate (each 10 results = 1 SerpAPI search)
  ============================================================ */
  const keywordCount = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean).length;

  const maxCredits = keywordCount * Math.ceil(searchDepth / 10);

  /* ============================================================
     STEP 1: Analyze Website
  ============================================================ */
  const handleAnalyze = async () => {
    const trimmedUrl = url.trim();
    const cleanedKeywords = keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
      .join(', ');

    if (!trimmedUrl) {
      alert('Please enter a website URL.');
      return;
    }

    if (!cleanedKeywords) {
      alert('Please enter at least one keyword.');
      return;
    }

    // Warn before spending a lot of credits
    if (maxCredits > 10) {
      const proceed = window.confirm(
        `This analysis can use up to ${maxCredits} SerpAPI search credits ` +
        `(${keywordCount} keyword(s) × ${Math.ceil(searchDepth / 10)} page(s) each). Continue?`
      );
      if (!proceed) return;
    }

    try {
      setIsAnalyzing(true);

      // Reset previous analysis-dependent state
      setResult(null);
      setAnalysisId(null);
      setKeywordOptimizations({});
      setOptimizationErrors({});
      setOptimizingKeyword(null);

      const token = localStorage.getItem('token');

      console.log('========================================');
      console.log('🔵 ANALYZE BUTTON CLICKED');
      console.log('🌐 API:', `${API_BASE_URL}/api/analysis`);
      console.log('🔗 URL:', trimmedUrl);
      console.log('🔑 Keywords:', cleanedKeywords);
      console.log('🌍 Country:', country);
      console.log('🔎 Search depth:', searchDepth);
      console.log('🔐 Token exists:', !!token);
      console.log('========================================');

      if (!token) {
        alert('Your login session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/analysis`,
        {
          url: trimmedUrl,
          keywords: cleanedKeywords,
          country,
          searchDepth: Number(searchDepth),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          // Deep searches make several sequential SerpAPI calls
          timeout: 300000,
        }
      );

      console.log('========================================');
      console.log('🟢 ANALYSIS RESPONSE RECEIVED');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
      console.log('========================================');

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || 'Analysis failed.'
        );
      }

      if (!response.data?.data?.results) {
        throw new Error(
          'The server returned no ranking results.'
        );
      }

      setResult(response.data.data);
      setAnalysisId(response.data.analysisId || null);

    } catch (error) {
      console.error('========================================');
      console.error('🔴 ANALYSIS REQUEST FAILED');

      if (error.response) {
        console.error('HTTP Status:', error.response.status);
        console.error('Server Response:', error.response.data);
      } else if (error.request) {
        console.error(
          'No response received from backend.'
        );
        console.error(error.request);
      } else {
        console.error('Error:', error.message);
      }

      console.error('========================================');

      alert(
        error.response?.data?.message ||
        error.message ||
        'Analysis failed. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ============================================================
     STEP 2: Check Keyword Relevance
  ============================================================ */
  const handleCheckRelevance = async () => {
    if (!analysisId) {
      alert('Please run website analysis first.');
      return;
    }

    try {
      setCheckingRelevance(true);

      const token = localStorage.getItem('token');

      if (!token) {
        alert('Your login session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      console.log('🟡 Checking keyword relevance...');

      const response = await axios.post(
        `${API_BASE_URL}/api/analysis/check-relevance`,
        {
          analysisId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      console.log(
        '🟢 Relevance response:',
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Unable to check keyword relevance.'
        );
      }

      setResult((prev) => ({
        ...prev,
        results: response.data.data.results,
      }));

    } catch (error) {
      console.error(
        '🔴 Relevance Error:',
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        'Unable to check keyword relevance.'
      );
    } finally {
      setCheckingRelevance(false);
    }
  };

  /* ============================================================
     STEP 3: Optimize One Keyword
  ============================================================ */
  const handleOptimizeKeyword = async (item) => {
    if (!analysisId) {
      alert('Please run website analysis first.');
      return;
    }

    try {
      setOptimizingKeyword(item.keyword);

      setOptimizationErrors((prev) => ({
        ...prev,
        [item.keyword]: null,
      }));

      const token = localStorage.getItem('token');

      if (!token) {
        alert('Your login session has expired. Please log in again.');
        navigate('/login');
        return;
      }

      console.log(
        '🟣 Optimizing keyword:',
        item.keyword
      );

      const response = await axios.post(
        `${API_BASE_URL}/api/analysis/optimize-keyword`,
        {
          analysisId,
          keyword: item.keyword,
          rank: item.rank,
          rankingUrl: item.rankingUrl,
          url: result?.url,
          country:
            result?.selectedCountry || country,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 120000,
        }
      );

      console.log(
        '🟢 Optimization response:',
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
          'Unable to generate optimization suggestions.'
        );
      }

      setKeywordOptimizations((prev) => ({
        ...prev,
        [item.keyword]: response.data.data,
      }));

    } catch (error) {
      console.error(
        '🔴 Keyword optimization error:',
        error.response?.data || error.message
      );

      setOptimizationErrors((prev) => ({
        ...prev,
        [item.keyword]:
          error.response?.data?.message ||
          error.message ||
          'Unable to generate optimization suggestions.',
      }));
    } finally {
      setOptimizingKeyword(null);
    }
  };

  /* ============================================================
     Countries
  ============================================================ */
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
    { value: 10, label: 'Top 10 Results (1 credit / keyword)' },
    { value: 20, label: 'Top 20 Results (up to 2 credits / keyword)' },
    { value: 50, label: 'Top 50 Results (up to 5 credits / keyword)' },
    { value: 100, label: 'Top 100 Results (up to 10 credits / keyword)' },
  ];

  const getCountryLabel = (code) => {
    const c = countries.find(
      (item) => item.code === code
    );

    return c
      ? `${c.flag} ${c.name}`
      : code;
  };

  const getDepthLabel = (value) => {
    const option = depthOptions.find(
      (item) => item.value === value
    );

    return option
      ? option.label
      : `${value} Results`;
  };

  const hasRelevanceResults =
    result?.results?.some(
      (item) =>
        item.relevant !== undefined
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative transition-colors duration-300">

      {/* Background */}
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
            backgroundSize: '48px 48px',
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

        {/* =====================================================
            ANALYSIS FORM
        ===================================================== */}
        <div className="relative z-20 bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 mb-8 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Website Details
          </h2>

          <div className="space-y-5">

            {/* URL */}
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                Website URL *
              </label>

              <input
                type="url"
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                placeholder="https://example.com"
                className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                Target Keywords *
              </label>

              <input
                type="text"
                value={keywords}
                onChange={(e) =>
                  setKeywords(e.target.value)
                }
                placeholder="seo, digital marketing, react"
                className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />

              <p className="mt-1 text-sm text-gray-500">
                Separate keywords with commas
              </p>
            </div>

            {/* Country + Depth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Country */}
              <div ref={countryRef}>
                <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                  Target Country
                </label>

                <div className="relative">

                  <button
                    type="button"
                    onClick={() => {
                      setIsCountryOpen(
                        !isCountryOpen
                      );
                      setIsDepthOpen(false);
                    }}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none flex items-center justify-between"
                  >
                    <span>
                      {getCountryLabel(country)}
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        isCountryOpen
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
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

                <p className="mt-1 text-sm text-gray-500">
                  Check Google rankings for the selected country
                </p>
              </div>

              {/* Search Depth */}
              <div ref={depthRef}>
                <label className="block mb-2 font-medium text-gray-700 dark:text-violet-300">
                  Search Depth
                </label>

                <div className="relative">

                  <button
                    type="button"
                    onClick={() => {
                      setIsDepthOpen(
                        !isDepthOpen
                      );
                      setIsCountryOpen(false);
                    }}
                    className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none flex items-center justify-between"
                  >
                    <span>
                      {getDepthLabel(searchDepth)}
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        isDepthOpen
                          ? 'rotate-180'
                          : ''
                      }`}
                    />
                  </button>

                  {isDepthOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-[#1a1a2e] border border-violet-200 dark:border-violet-500/20 rounded-xl shadow-lg">

                      {depthOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSearchDepth(
                              option.value
                            );
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

                <p className="mt-1 text-sm text-gray-500">
                  How many Google results to search
                  {keywordCount > 0 && (
                    <>
                      {' · '}
                      <span className="font-medium text-violet-600 dark:text-violet-400">
                        up to {maxCredits} SerpAPI credit{maxCredits === 1 ? '' : 's'}
                      </span>
                    </>
                  )}
                </p>
              </div>

            </div>

            {/* Analyze */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                !url.trim() ||
                !keywords.trim() ||
                isAnalyzing
              }
              className={`w-full px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200 ${
                !url.trim() ||
                !keywords.trim() ||
                isAnalyzing
                  ? 'bg-gray-200 dark:bg-white/5 cursor-not-allowed text-gray-400 dark:text-gray-500'
                  : 'bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 shadow-lg shadow-violet-600/30'
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching Google Rankings...
                </div>
              ) : (
                'Analyze Website'
              )}
            </button>

          </div>
        </div>

        {/* =====================================================
            RESULTS
        ===================================================== */}
        <div className="relative z-10 bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-6 shadow-lg">

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Rank Tracking Result
          </h2>

          {!result ? (
            <p className="text-gray-500">
              No tracking data yet. Enter a website and keywords.
            </p>
          ) : (
            <>

              {/* Website information */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">

                <p className="font-medium text-gray-700 dark:text-violet-300">
                  Website
                </p>

                <p className="text-gray-900 dark:text-white break-all">
                  {result.url}
                </p>

                {result.selectedCountry && (
                  <p className="text-sm text-gray-500 mt-1">
                    🌍 Country:{' '}
                    {result.selectedCountry.toUpperCase()}
                    {' | '}
                    🔎 Depth:{' '}
                    {result.selectedSearchDepth || 10}
                    {' results'}
                    {result.creditsUsed !== undefined && (
                      <>
                        {' | '}
                        💳 Credits used: {result.creditsUsed}
                      </>
                    )}
                  </p>
                )}

                {analysisId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Analysis ID: {analysisId}
                  </p>
                )}

              </div>

              {/* =================================================
                  TABLE 1: RANKINGS
              ================================================= */}
              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  <thead>
                    <tr className="border-b border-violet-200 dark:border-violet-500/20 bg-gray-50 dark:bg-white/5">

                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                        Keyword
                      </th>

                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                        Google Rank
                      </th>

                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                        Ranking Page
                      </th>

                      <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {result.results?.map(
                      (item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-white/5"
                        >

                          <td className="p-3 font-medium text-gray-900 dark:text-white">
                            {item.keyword}
                          </td>

                          <td className="p-3 text-violet-600 dark:text-violet-400 font-bold">
                            {item.rank !== 'Not Found'
                              ? `#${item.rank}`
                              : '—'}
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

                          <td className="p-3">

                            {item.found ? (
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
                      )
                    )}

                  </tbody>
                </table>

              </div>

              {/* =================================================
                  RELEVANCE
              ================================================= */}
              <div className="mt-6">

                <button
                  type="button"
                  onClick={handleCheckRelevance}
                  disabled={
                    !analysisId ||
                    checkingRelevance
                  }
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-medium hover:from-cyan-500 hover:to-cyan-600 disabled:opacity-50 transition flex items-center gap-2"
                >

                  <Sparkles className="w-4 h-4" />

                  {checkingRelevance
                    ? 'Checking Relevance...'
                    : hasRelevanceResults
                    ? 'Re-check Keyword Relevance'
                    : 'Check Keyword Relevance'}

                </button>

                <p className="text-xs text-gray-500 mt-2">
                  Uses AI to determine whether each target keyword is relevant to the website.
                </p>

              </div>

              {/* =================================================
                  RELEVANCE TABLE
              ================================================= */}
              {hasRelevanceResults && (
                <div className="mt-8">

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    Keyword Relevance Result
                  </h3>

                  <div className="overflow-x-auto">

                    <table className="w-full border-collapse">

                      <thead>
                        <tr className="border-b border-violet-200 dark:border-violet-500/20 bg-gray-50 dark:bg-white/5">

                          <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                            Keyword
                          </th>

                          <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                            Relevance
                          </th>

                          <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                            Confidence
                          </th>

                          <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                            Reason
                          </th>

                          <th className="text-left p-3 text-gray-700 dark:text-violet-300 font-medium">
                            Optimization
                          </th>

                        </tr>
                      </thead>

                      <tbody>

                        {result.results?.map(
                          (item, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-white/5"
                            >

                              <td className="p-3 font-medium text-gray-900 dark:text-white">
                                {item.keyword}
                              </td>

                              <td className="p-3">

                                {item.relevant === true ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    Relevant
                                  </span>
                                ) : item.relevant === false ? (
                                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                                    <XCircle className="w-4 h-4" />
                                    Unrelated
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                                    ⚠️ Unable to determine
                                  </span>
                                )}

                              </td>

                              <td className="p-3 text-sm text-gray-700 dark:text-gray-300">

                                {item.relevant === null ||
                                item.relevant === undefined
                                  ? '—'
                                  : `${item.relevanceConfidence ?? 0}%`}

                              </td>

                              <td className="p-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                {item.relevanceReason || '—'}
                              </td>

                              <td className="p-3">

                                {item.relevant === true ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOptimizeKeyword(item)
                                    }
                                    disabled={
                                      optimizingKeyword ===
                                      item.keyword
                                    }
                                    className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-700 text-white text-sm font-medium hover:from-violet-500 hover:to-violet-600 disabled:opacity-50 transition flex items-center gap-2"
                                  >

                                    <Sparkles className="w-4 h-4" />

                                    {optimizingKeyword ===
                                    item.keyword
                                      ? 'Optimizing...'
                                      : item.found
                                      ? 'Optimize'
                                      : 'Find & Optimize'}

                                  </button>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    Not available
                                  </span>
                                )}

                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                </div>
              )}

              {/* =================================================
                  OPTIMIZATION RESULTS
              ================================================= */}
              {Object.keys(keywordOptimizations).length > 0 && (
                <div className="mt-8 space-y-6">

                  <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-400 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Keyword Optimization
                  </h3>

                  {Object.entries(
                    keywordOptimizations
                  ).map(([kw, opt]) => (
                    <KeywordOptimizationCard
                      key={kw}
                      keyword={kw}
                      optimization={opt}
                    />
                  ))}

                </div>
              )}

              {/* =================================================
                  OPTIMIZATION ERRORS
              ================================================= */}
              {Object.entries(
                optimizationErrors
              ).some(([, value]) => value) && (

                <div className="mt-6 space-y-2">

                  {Object.entries(
                    optimizationErrors
                  )
                    .filter(([, value]) => value)
                    .map(([kw, error]) => (

                      <div
                        key={kw}
                        className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-sm"
                      >

                        <span className="font-medium text-rose-700 dark:text-rose-400">
                          {kw}:
                        </span>{' '}

                        <span className="text-rose-600 dark:text-rose-300">
                          {error}
                        </span>

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

/* ============================================================
   Keyword Optimization Card
============================================================ */
function KeywordOptimizationCard({
  keyword,
  optimization,
}) {
  if (!optimization) return null;

  const recs =
    optimization.recommendations || [];

  const notes =
    optimization.generalNotes || [];

  return (
    <div className="p-5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-xl">

      <div className="mb-4">

        <h4 className="text-base font-semibold text-violet-800 dark:text-violet-300">
          Keyword:{' '}
          <span className="text-gray-900 dark:text-white">
            {keyword}
          </span>
        </h4>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">

          Current Rank:{' '}

          <span className="font-medium text-violet-600 dark:text-violet-400">
            {optimization.currentRank ===
            'Not Found'
              ? 'Not Found'
              : `#${optimization.currentRank}`}
          </span>

          {optimization.targetPage && (
            <>
              {' | '}
              Target Page:{' '}

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

          {recs.map((rec, index) => (

            <div
              key={index}
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

            {notes.map((note, index) => (
              <li key={index}>
                {note}
              </li>
            ))}

          </ul>

        </div>
      )}

    </div>
  );
}