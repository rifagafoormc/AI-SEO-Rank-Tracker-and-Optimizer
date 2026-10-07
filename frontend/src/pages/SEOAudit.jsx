import { useState } from "react";
import axios from "axios";
import {
  Search,
  Globe,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Heading,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SEOAudit = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // AI suggestions state
  const [suggestions, setSuggestions] = useState(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");

  const handleAudit = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    let websiteUrl = url.trim();

    if (
      !websiteUrl.startsWith("http://") &&
      !websiteUrl.startsWith("https://")
    ) {
      websiteUrl = `https://${websiteUrl}`;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);
    setSuggestions(null);
    setSuggestionsError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/seo-audit`,
        {
          url: websiteUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(response.data.data);
    } catch (err) {
      console.error("SEO Audit Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to analyze this website. Please check the URL and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!result) return;

    setIsGeneratingSuggestions(true);
    setSuggestionsError("");
    setSuggestions(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_BASE_URL}/api/seo-audit/suggestions`,
        {
          auditData: result,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.suggestions)
      ) {
        setSuggestions(response.data.suggestions);
      } else {
        throw new Error("Invalid suggestions response.");
      }
    } catch (err) {
      console.error("SEO Suggestions Error:", err);

      setSuggestionsError(
        err.response?.data?.message ||
          "Unable to generate AI suggestions. Please try again."
      );
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const getScoreStatus = (score) => {
    if (score >= 80) {
      return {
        label: "Good",
        icon: CheckCircle,
      };
    }

    if (score >= 50) {
      return {
        label: "Needs Improvement",
        icon: AlertTriangle,
      };
    }

    return {
      label: "Poor",
      icon: XCircle,
    };
  };

  const StatusIcon = ({ status }) => {
    if (status === "good" || status === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }

    if (status === "warning") {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }

    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const MetricCard = ({ icon: Icon, title, value, description }) => (
    <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-xl p-5 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[#7A5236]/10 dark:bg-[#A47551]/15">
          <Icon className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
        </div>

        <h3 className="font-semibold text-[#1A0F0A] dark:text-white">
          {title}
        </h3>
      </div>

      <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
        {value}
      </p>

      {description && (
        <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
          {description}
        </p>
      )}
    </div>
  );

  // ---------------------------------------------------------
  // Score color
  // ---------------------------------------------------------
  const score = result?.score ?? 0;

  const scoreColor =
    score >= 80
      ? "#22C55E" // Green
      : score >= 50
      ? "#F59E0B" // Orange
      : "#EF4444"; // Red

  const scoreBackground =
    score >= 80
      ? "rgba(34, 197, 94, 0.15)"
      : score >= 50
      ? "rgba(245, 158, 11, 0.15)"
      : "rgba(239, 68, 68, 0.15)";

  return (
    <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] p-6 transition-colors duration-300 relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7A5236]/15 dark:bg-[#A47551]/20 rounded-full blur-3xl" />

        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#A47551]/15 dark:bg-[#7A5236]/15 rounded-full blur-3xl" />

        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B59E]/20 dark:bg-[#3E2723]/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-[#7A5236]/10 dark:bg-[#A47551]/15 rounded-xl">
              <Search className="w-7 h-7 text-[#7A5236] dark:text-[#D4B59E]" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
                SEO Audit
              </h1>

              <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1">
                Analyze your website's on-page and technical SEO factors.
              </p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 mb-8 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

          <label className="block text-sm font-medium text-[#7A5236] dark:text-[#D4B59E] mb-2">
            Website URL
          </label>

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAudit();
                  }
                }}
                placeholder="example.com or https://example.com"
                className="w-full pl-12 pr-4 py-3 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 focus:outline-none focus:ring-2 focus:ring-[#7A5236]/30 dark:focus:ring-[#A47551]/30 focus:border-[#7A5236] dark:focus:border-[#A47551] transition-all"
              />
            </div>

            <button
              onClick={handleAudit}
              disabled={isAnalyzing}
              className="px-7 py-3 bg-[#7A5236] hover:bg-[#5E3E28] disabled:bg-[#7A5236]/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-[#7A5236]/40"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze Website
                </>
              )}
            </button>
          </div>

          <p className="mt-2 text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
            Enter a URL with or without{" "}
            <span className="font-mono">https://</span> — we'll add it
            automatically.
          </p>

          {error && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />

              <p className="text-sm text-rose-700 dark:text-rose-300">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {isAnalyzing && (
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-12 text-center shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

            <Loader2 className="w-12 h-12 text-[#7A5236] dark:text-[#D4B59E] animate-spin mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white">
              Analyzing Website
            </h2>

            <p className="text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-2">
              Extracting SEO information and checking your website...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">

            {/* Score */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-8 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                <div>
                  <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mb-2">
                    Website
                  </p>

                  <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white break-all">
                    {result.url}
                  </h2>

                  <div className="flex items-center gap-2 mt-3">
                    <Globe className="w-4 h-4 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />

                    <span className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      SEO Audit Report
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5">

                  {/* Dynamic Score Circle */}
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(
                        ${scoreColor} ${score * 3.6}deg,
                        ${scoreBackground} ${score * 3.6}deg
                      )`,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-white dark:bg-[#251710] flex flex-col items-center justify-center">
                      <p
                        className="text-3xl font-bold"
                        style={{ color: scoreColor }}
                      >
                        {score}
                      </p>

                      <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                      Overall SEO Score
                    </p>

                    <p
                      className="text-lg font-bold"
                      style={{ color: scoreColor }}
                    >
                      {getScoreStatus(score).label}
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

              <MetricCard
                icon={FileText}
                title="Word Count"
                value={result.wordCount ?? 0}
                description="Visible page content"
              />

              <MetricCard
                icon={ImageIcon}
                title="Images"
                value={result.images?.total ?? 0}
                description={`${result.images?.missingAlt ?? 0} missing ALT text`}
              />

              <MetricCard
                icon={LinkIcon}
                title="Links"
                value={result.links?.total ?? 0}
                description={`${result.links?.internal ?? 0} internal links`}
              />

              <MetricCard
                icon={Heading}
                title="Headings"
                value={result.headings?.total ?? 0}
                description={`${result.headings?.h1 ?? 0} H1 tags`}
              />

            </div>

            {/* SEO Checks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* On Page */}
              <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

                <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white mb-5">
                  On-Page SEO
                </h2>

                <div className="space-y-4">

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Page Title
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                        {result.title || "No title found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.title} />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Meta Description
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-1">
                        {result.metaDescription ||
                          "No meta description found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.metaDescription} />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        H1 Tag
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.headings?.h1 ?? 0} found
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.h1} />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Canonical URL
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.canonical || "Not found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.canonical} />
                  </div>

                </div>
              </div>

              {/* Technical SEO */}
              <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

                <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white mb-5">
                  Technical SEO
                </h2>

                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Robots Meta
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.robots || "Not specified"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.robots} />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Open Graph
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.openGraph ? "Detected" : "Not detected"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.openGraph} />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        Internal Links
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.links?.internal ?? 0}
                      </p>
                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="border-t border-[#7A5236]/10 dark:border-white/5" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                        External Links
                      </p>

                      <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                        {result.links?.external ?? 0}
                      </p>
                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                </div>
              </div>
            </div>

            {/* Issues */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

              <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white mb-5">
                SEO Issues
              </h2>

              {result.issues?.length > 0 ? (
                <div className="space-y-3">

                  {result.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/25"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />

                      <div>
                        <p className="font-medium text-[#1A0F0A] dark:text-[#D4B59E]/90">
                          {issue.title || issue}
                        </p>

                        {issue.description && (
                          <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/70 mt-1">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 rounded-xl">

                  <CheckCircle className="w-5 h-5 text-green-500" />

                  <p className="text-green-700 dark:text-green-300">
                    No major SEO issues were detected.
                  </p>

                </div>
              )}
            </div>

            {/* AI Optimization Suggestions */}
            <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-6 shadow-lg shadow-[#7A5236]/5 dark:shadow-black/40">

              <div className="flex items-center gap-3 mb-2">

                <div className="p-2 rounded-lg bg-[#A47551]/10 dark:bg-[#A47551]/15">
                  <Sparkles className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E]" />
                </div>

                <h2 className="text-xl font-semibold text-[#1A0F0A] dark:text-white">
                  AI Optimization Suggestions
                </h2>

              </div>

              <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mb-5">
                Generate evidence-based recommendations from the audit findings
                above.
              </p>

              <button
                onClick={handleGenerateSuggestions}
                disabled={isGeneratingSuggestions}
                className="px-6 py-3 bg-[#A47551] hover:bg-[#8B6044] disabled:bg-[#A47551]/40 disabled:cursor-not-allowed text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-[#A47551]/30"
              >
                {isGeneratingSuggestions ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    {suggestions
                      ? "Regenerate Suggestions"
                      : "Generate AI Suggestions"}
                  </>
                )}
              </button>

              {suggestionsError && (
                <div className="mt-5 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl flex items-center gap-3">

                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />

                  <p className="text-sm text-rose-700 dark:text-rose-300">
                    {suggestionsError}
                  </p>

                </div>
              )}

              {suggestions && suggestions.length > 0 && (
                <div className="mt-6 space-y-4">

                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl bg-[#F5EBDD] dark:bg-[#A47551]/10 border border-[#7A5236]/20 dark:border-[#A47551]/25"
                    >

                      <div className="flex items-start gap-3">

                        <Sparkles className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E] shrink-0 mt-0.5" />

                        <div className="flex-1">

                          <h3 className="font-semibold text-[#1A0F0A] dark:text-white">
                            {s.issue}
                          </h3>

                          <p className="text-sm text-[#5E3E28]/80 dark:text-[#D4B59E]/70 mt-2">
                            <span className="font-medium text-[#7A5236] dark:text-[#D4B59E]">
                              Evidence:
                            </span>{" "}
                            {s.evidence}
                          </p>

                          <p className="text-sm text-[#5E3E28]/80 dark:text-[#D4B59E]/70 mt-2">
                            <span className="font-medium text-[#7A5236] dark:text-[#D4B59E]">
                              Recommendation:
                            </span>{" "}
                            {s.recommendation}
                          </p>

                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              )}

              {suggestions && suggestions.length === 0 && (
                <p className="mt-5 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  No optimization suggestions were returned.
                </p>
              )}

            </div>

            {/* Re-analyze */}
            <div className="flex justify-center pb-8">

              <button
                onClick={handleAudit}
                className="px-6 py-3 border border-[#7A5236]/25 dark:border-[#A47551]/30 rounded-xl text-[#7A5236] dark:text-[#D4B59E] hover:bg-[#7A5236]/10 dark:hover:bg-[#A47551]/15 flex items-center gap-2 transition"
              >
                <RefreshCw className="w-5 h-5" />
                Run Audit Again
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SEOAudit;