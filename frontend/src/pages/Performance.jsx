import { useState } from "react";
import axios from "axios";
import {
  Gauge,
  Activity,
  Clock,
  Maximize,
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Monitor,
  Smartphone,
  ArrowLeft,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Performance() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState("desktop");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  /* ------------------------------------------------------------
     Normalize a user-supplied URL.
  ------------------------------------------------------------ */
  const normalizeUrl = (value) => {
    if (!value || typeof value !== "string") return null;

    let normalized = value.trim();

    if (!normalized) return null;

    if (
      !normalized.startsWith("http://") &&
      !normalized.startsWith("https://")
    ) {
      normalized = `https://${normalized}`;
    }

    try {
      const parsed = new URL(normalized);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        return null;
      }

      return parsed.href;
    } catch {
      return null;
    }
  };

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    const normalizedUrl = normalizeUrl(url);

    if (!normalizedUrl) {
      setError(
        "Please enter a valid website URL, such as https://example.com."
      );
      return;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your login session has expired. Please log in again.");
        setIsAnalyzing(false);
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/performance`,
        {
          websiteUrl: normalizedUrl,
          strategy: strategy,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 90000,
        }
      );

      if (response.data.success) {
        setResult(response.data.data);

        setHistory((prev) => [
          {
            id: response.data.data.id,
            websiteUrl: response.data.data.websiteUrl,
            performance: response.data.data.performance,
            strategy: response.data.data.strategy,
            date: new Date().toLocaleString(),
          },
          ...prev,
        ]);
      } else {
        setError(
          response.data.message || "Analysis failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Performance analysis error:", error);

      if (error.response) {
        setError(
          error.response.data?.message ||
            error.response.data?.error ||
            "Server error occurred. Please try again."
        );
      } else if (error.request) {
        setError(
          "Cannot connect to the server. Please check your internet connection."
        );
      } else {
        setError(error.message || "An unexpected error occurred.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 70) return "text-amber-600 dark:text-amber-400";
    if (score >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getPerformanceBadgeColor = (score) => {
    if (score >= 90)
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
    if (score >= 70)
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    if (score >= 50)
      return "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20";
    return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
  };

  const getPerformanceLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  const getCircleColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 70) return "#eab308";
    if (score >= 50) return "#f97316";
    return "#ef4444";
  };

  const formatTime = (ms) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const calculateCircleProgress = (score) => {
    if (!score) return 0;
    const clampedScore = Math.min(Math.max(score, 0), 100);
    return clampedScore;
  };

  const hasValue = (value) => {
    return value !== null && value !== undefined;
  };

  return (
    <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] text-[#1A0F0A] dark:text-white relative transition-colors duration-300">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7A5236]/15 dark:bg-[#A47551]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#A47551]/15 dark:bg-[#7A5236]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B59E]/20 dark:bg-[#3E2723]/40 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(122,82,54,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(122,82,54,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Back to Dashboard */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white flex items-center gap-3">
              <Gauge className="w-8 h-8 text-[#7A5236] dark:text-[#D4B59E]" />
              Performance Analysis
            </h1>
            <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1">
              Analyze your website's performance using Google PageSpeed
              Insights
            </p>
          </div>
        </div>

        {/* Analysis Form */}
        <div className="relative z-20 bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 mb-8 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
          <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
            Website Details
          </h2>

          <div className="space-y-5">
            {/* Website URL */}
            <div>
              <label className="block mb-2 font-medium text-[#7A5236] dark:text-[#D4B59E]">
                Website URL *
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="example.com or https://example.com"
                className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3 focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25 dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25 transition-all duration-200 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 outline-none"
                disabled={isAnalyzing}
              />
              <p className="mt-1 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                You don't need to type https:// — it will be added
                automatically.
              </p>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block mb-2 font-medium text-[#7A5236] dark:text-[#D4B59E]">
                Strategy
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setStrategy("desktop")}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                    strategy === "desktop"
                      ? "bg-[#7A5236] dark:bg-[#A47551] border-[#7A5236] dark:border-[#A47551] text-white shadow-lg shadow-[#7A5236]/40"
                      : "bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border-[#7A5236]/20 dark:border-[#A47551]/25 text-[#5E3E28] dark:text-[#D4B59E]/80 hover:bg-[#7A5236]/10 dark:hover:bg-[#A47551]/15"
                  }`}
                  disabled={isAnalyzing}
                >
                  <Monitor className="w-4 h-4" />
                  Desktop
                </button>
                <button
                  onClick={() => setStrategy("mobile")}
                  className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                    strategy === "mobile"
                      ? "bg-[#7A5236] dark:bg-[#A47551] border-[#7A5236] dark:border-[#A47551] text-white shadow-lg shadow-[#7A5236]/40"
                      : "bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border-[#7A5236]/20 dark:border-[#A47551]/25 text-[#5E3E28] dark:text-[#D4B59E]/80 hover:bg-[#7A5236]/10 dark:hover:bg-[#A47551]/15"
                  }`}
                  disabled={isAnalyzing}
                >
                  <Smartphone className="w-4 h-4" />
                  Mobile
                </button>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={!url.trim() || isAnalyzing}
              className={`w-full px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-200
                ${
                  !url.trim() || isAnalyzing
                    ? "bg-[#7A5236]/40 dark:bg-white/5 cursor-not-allowed text-white/60"
                    : "bg-[#7A5236] hover:bg-[#5E3E28] shadow-lg shadow-[#7A5236]/40 hover:shadow-[#7A5236]/60 active:scale-95"
                }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Analyze Performance"
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <p className="text-rose-600 dark:text-rose-400 text-sm">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="relative z-10 bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
          <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white mb-6 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
            Performance Results
          </h2>

          {!result ? (
            <p className="text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
              No performance data yet. Enter a website URL and analyze.
            </p>
          ) : (
            <>
              {/* Website Info */}
              <div className="mb-6 p-4 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl border border-[#7A5236]/15 dark:border-white/5">
                <p className="font-medium text-[#7A5236] dark:text-[#D4B59E]">
                  Website
                </p>
                <p className="text-[#1A0F0A] dark:text-white break-all">
                  {result.websiteUrl}
                </p>
                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                  📊 Strategy:{" "}
                  {result.strategy.charAt(0).toUpperCase() +
                    result.strategy.slice(1)}
                </p>
              </div>

              {/* Score Circle with Badge */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="relative flex-shrink-0">
                  <div className="relative w-40 h-40">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        className="dark:stroke-[#3E2723]"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="72"
                        fill="none"
                        stroke={getCircleColor(result.performance)}
                        strokeWidth="12"
                        strokeDasharray={`${
                          2 *
                          Math.PI *
                          72 *
                          (calculateCircleProgress(result.performance) / 100)
                        } ${2 * Math.PI * 72}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div
                        className={`text-4xl font-bold ${getPerformanceColor(
                          result.performance
                        )}`}
                      >
                        {result.performance
                          ? Math.round(result.performance)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        Score
                      </div>
                    </div>
                  </div>

                  <div className="absolute -top-2 -right-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getPerformanceBadgeColor(
                        result.performance
                      )}`}
                    >
                      <CheckCircle className="w-3 h-3" />
                      {getPerformanceLabel(result.performance)}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/15 dark:border-white/5 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/25 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      <Activity className="w-4 h-4" />
                      FCP
                    </div>
                    <div
                      className={`text-2xl font-bold mt-2 ${
                        hasValue(result.fcp)
                          ? parseFloat(result.fcp) < 1.8
                            ? "text-emerald-600 dark:text-emerald-400"
                            : parseFloat(result.fcp) < 3.0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                          : "text-[#5E3E28]/40 dark:text-[#D4B59E]/30"
                      }`}
                    >
                      {formatTime(result.fcp)}
                    </div>
                  </div>

                  <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/15 dark:border-white/5 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/25 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      <Clock className="w-4 h-4" />
                      LCP
                    </div>
                    <div
                      className={`text-2xl font-bold mt-2 ${
                        hasValue(result.lcp)
                          ? parseFloat(result.lcp) < 2.5
                            ? "text-emerald-600 dark:text-emerald-400"
                            : parseFloat(result.lcp) < 4.0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                          : "text-[#5E3E28]/40 dark:text-[#D4B59E]/30"
                      }`}
                    >
                      {formatTime(result.lcp)}
                    </div>
                  </div>

                  <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/15 dark:border-white/5 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/25 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      <Maximize className="w-4 h-4" />
                      CLS
                    </div>
                    <div
                      className={`text-2xl font-bold mt-2 ${
                        hasValue(result.cls)
                          ? parseFloat(result.cls) < 0.1
                            ? "text-emerald-600 dark:text-emerald-400"
                            : parseFloat(result.cls) < 0.25
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                          : "text-[#5E3E28]/40 dark:text-[#D4B59E]/30"
                      }`}
                    >
                      {result.cls !== null ? result.cls.toFixed(3) : "N/A"}
                    </div>
                  </div>

                  <div className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 rounded-xl p-4 border border-[#7A5236]/15 dark:border-white/5 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/25 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      <Zap className="w-4 h-4" />
                      TBT
                    </div>
                    <div
                      className={`text-2xl font-bold mt-2 ${
                        hasValue(result.tbt)
                          ? parseInt(result.tbt) < 200
                            ? "text-emerald-600 dark:text-emerald-400"
                            : parseInt(result.tbt) < 500
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                          : "text-[#5E3E28]/40 dark:text-[#D4B59E]/30"
                      }`}
                    >
                      {formatTime(result.tbt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-emerald-700 dark:text-emerald-400 text-sm">
                  Performance analysis completed successfully!
                </p>
              </div>

              {/* No data message */}
              {!hasValue(result.performance) &&
                !hasValue(result.fcp) &&
                !hasValue(result.lcp) &&
                !hasValue(result.cls) &&
                !hasValue(result.tbt) && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                    <p className="text-amber-700 dark:text-amber-400 text-center">
                      ⚠️ PageSpeed data unavailable. Unable to fetch
                      performance metrics right now. Please try again
                      later.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="relative z-10 mt-8 bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#1A0F0A] dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              Recent Analysis
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#7A5236]/20 dark:border-[#A47551]/25 bg-[#F5EBDD] dark:bg-[#1A0F0A]/50">
                    <th className="text-left p-3 text-[#5E3E28] dark:text-[#D4B59E]/80 font-medium">
                      URL
                    </th>
                    <th className="text-left p-3 text-[#5E3E28] dark:text-[#D4B59E]/80 font-medium">
                      Score
                    </th>
                    <th className="text-left p-3 text-[#5E3E28] dark:text-[#D4B59E]/80 font-medium">
                      Strategy
                    </th>
                    <th className="text-left p-3 text-[#5E3E28] dark:text-[#D4B59E]/80 font-medium">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#7A5236]/10 dark:border-white/5 hover:bg-[#7A5236]/5 dark:hover:bg-[#A47551]/10 transition-colors"
                    >
                      <td className="p-3 text-[#1A0F0A] dark:text-white truncate max-w-xs">
                        {item.websiteUrl}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${getPerformanceColor(
                            item.performance
                          )}`}
                        >
                          {item.performance
                            ? Math.round(item.performance)
                            : "N/A"}
                        </span>
                      </td>
                      <td className="p-3 text-[#5E3E28]/70 dark:text-[#D4B59E]/60 capitalize">
                        {item.strategy}
                      </td>
                      <td className="p-3 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/50">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}