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
} from "lucide-react";

const SEOAudit = () => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleAudit = async () => {
    if (!url.trim()) {
      setError("Please enter a website URL.");
      return;
    }

    let websiteUrl = url.trim();

    // Automatically add https:// if user doesn't provide a protocol
    if (!websiteUrl.startsWith("http://") && !websiteUrl.startsWith("https://")) {
      websiteUrl = `https://${websiteUrl}`;
    }

    setIsAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/seo-audit",
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
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h3>
      </div>

      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>

      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Search className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                SEO Audit
              </h1>

              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Analyze your website's on-page and technical SEO factors.
              </p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm">

          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website URL
          </label>

          <div className="flex flex-col md:flex-row gap-3">

            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAudit();
                  }
                }}
                placeholder="https://example.com"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleAudit}
              disabled={isAnalyzing}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition"
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

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 shrink-0" />

              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Loading */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">

            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analyzing Website
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Extracting SEO information and checking your website...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">

            {/* Score */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">

              <div className="flex flex-col md:flex-row items-center justify-between gap-8">

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Website
                  </p>

                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white break-all">
                    {result.url}
                  </h2>

                  <div className="flex items-center gap-2 mt-3">
                    <Globe className="w-4 h-4 text-gray-400" />

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      SEO Audit Report
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-5">

                  <div className="w-32 h-32 rounded-full border-8 border-blue-100 dark:border-blue-900/40 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {result.score ?? 0}
                      </p>

                      <p className="text-xs text-gray-500">
                        / 100
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Overall SEO Score
                    </p>

                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {getScoreStatus(result.score ?? 0).label}
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
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
                  On-Page SEO
                </h2>

                <div className="space-y-4">

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Page Title
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {result.title || "No title found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.title} />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Meta Description
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {result.metaDescription || "No meta description found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.metaDescription} />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        H1 Tag
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.headings?.h1 ?? 0} found
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.h1} />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Canonical URL
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.canonical || "Not found"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.canonical} />
                  </div>

                </div>
              </div>

              {/* Technical SEO */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
                  Technical SEO
                </h2>

                <div className="space-y-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Robots Meta
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.robots || "Not specified"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.robots} />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Open Graph
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.openGraph ? "Detected" : "Not detected"}
                      </p>
                    </div>

                    <StatusIcon status={result.checks?.openGraph} />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        Internal Links
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.links?.internal ?? 0}
                      </p>
                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">
                        External Links
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {result.links?.external ?? 0}
                      </p>
                    </div>

                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>

                </div>
              </div>
            </div>

            {/* Issues */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5">
                SEO Issues
              </h2>

              {result.issues?.length > 0 ? (
                <div className="space-y-3">

                  {result.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />

                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {issue.title || issue}
                        </p>

                        {issue.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {issue.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500" />

                  <p className="text-green-700 dark:text-green-300">
                    No major SEO issues were detected.
                  </p>
                </div>
              )}
            </div>

            {/* Re-analyze */}
            <div className="flex justify-center pb-8">

              <button
                onClick={handleAudit}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 transition"
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