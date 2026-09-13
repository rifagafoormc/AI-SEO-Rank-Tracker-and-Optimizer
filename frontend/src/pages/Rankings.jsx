import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { 
  ArrowLeft, Plus, Search, TrendingUp, Award, 
  AlertTriangle, BarChart3, Globe, Calendar, 
  Sparkles, ChevronRight, CheckCircle, XCircle,
  Hash, Link, Clock
} from 'lucide-react';

export default function Rankings() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/history",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const history = response.data.history || [];

      const allResults = history.flatMap((analysis) =>
        (analysis.rankingData?.results || analysis.results || []).map((item) => ({
          website: analysis.websiteUrl || analysis.url || "Unknown Website",
          keyword: item.keyword,
          rank: item.found ? item.rank : null,
          page: item.found ? item.page : '-',
          found: item.found,
          engine: "Google",
          updated: new Date(analysis.createdAt).toLocaleDateString(),
          createdAt: analysis.createdAt,
        }))
      );

      const uniqueMap = new Map();
      allResults.forEach((item) => {
        const key = `${item.website}-${item.keyword}`;
        const existing = uniqueMap.get(key);
        if (!existing || new Date(item.createdAt) > new Date(existing.createdAt)) {
          uniqueMap.set(key, item);
        }
      });

      const allRankings = Array.from(uniqueMap.values())
        .sort((a, b) => {
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return a.rank - b.rank;
        });

      setRankings(allRankings);
    } catch (error) {
      console.error("Failed to fetch rankings", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === null) return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-500';
    if (rank <= 3) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    if (rank <= 10) return 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20';
    return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
  };

  const getRankColor = (rank) => {
    if (rank === null) return 'text-gray-400 dark:text-gray-500';
    if (rank <= 3) return 'text-emerald-600 dark:text-emerald-400';
    if (rank <= 10) return 'text-cyan-600 dark:text-cyan-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const totalKeywords = rankings.length;
  const rankedKeywords = rankings.filter(r => r.rank !== null);
  const avgPosition = rankedKeywords.length > 0
    ? (rankedKeywords.reduce((acc, curr) => acc + Number(curr.rank), 0) / rankedKeywords.length).toFixed(1)
    : '0';
  const top3Count = rankings.filter(r => r.rank !== null && r.rank <= 3).length;
  const needsImprovement = rankings.filter(r => r.rank !== null && r.rank > 10).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      
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
        
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Keyword Rankings
              </h1>
              <span className="bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20">
                Real SERP Data
              </span>
            </div>
            <p className="text-gray-600 dark:text-violet-300/60 mt-1">
              View the search engine ranking positions of your target keywords
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/analysis')}
              className="text-sm bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Keywords
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-500">Total Keywords</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalKeywords}</p>
          </div>
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/30 transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-500">Average Position</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{avgPosition}</p>
          </div>
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-emerald-300 dark:hover:border-emerald-400/30 transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-500">Top 3 Rankings</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{top3Count}</p>
          </div>
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-rose-300 dark:hover:border-rose-400/30 transition-all duration-300">
            <p className="text-sm text-gray-500 dark:text-gray-500">Needs Improvement</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{needsImprovement}</p>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-violet-200 dark:border-violet-500/20">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">#</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Keyword</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Website</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Current Rank</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Page</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Search Engine</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-white/5 animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-4"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-32"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-8"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-8"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-16"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : (
                  rankings.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 ${
                        item.rank !== null && item.rank <= 3 ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${getRankBadge(item.rank)}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                        {item.keyword}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                        {item.website}
                      </td>
                      <td className="py-4 px-6">
                        {item.found ? (
                          <span className={`font-bold ${getRankColor(item.rank)}`}>
                            #{item.rank}
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-sm">
                            Not Found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        {item.page}
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          {item.engine}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.updated}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && rankings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rankings found</h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">Start analysis to see their rankings here</p>
              <button 
                onClick={() => navigate('/analysis')}
                className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-violet-600/30"
              >
                Start Analysis
              </button>
            </div>
          )}
        </div>

        {/* Note about keyword management */}
        <div className="mt-6 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 mt-0.5" />
            <div>
              <p className="text-sm text-violet-700 dark:text-violet-300/70">
                <strong className="text-violet-800 dark:text-violet-400">Note:</strong> Rankings are updated daily. 
                To add new keywords, go to the 
                <button 
                  onClick={() => navigate('/analysis')}
                  className="text-violet-800 dark:text-violet-400 font-medium hover:text-violet-600 dark:hover:text-violet-300 mx-1 transition"
                >
                  Analysis
                </button>
                page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}