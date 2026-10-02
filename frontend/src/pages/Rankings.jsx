import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {
  ArrowLeft, Plus, Calendar, Sparkles
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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
        `${API_BASE_URL}/api/history`,
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
    if (rank === null) return 'bg-[#5E3E28]/10 dark:bg-white/5 text-[#5E3E28]/60 dark:text-[#D4B59E]/40';
    if (rank <= 3) return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
    if (rank <= 10) return 'bg-[#A47551]/15 dark:bg-[#A47551]/20 text-[#7A5236] dark:text-[#D4B59E] border border-[#7A5236]/25 dark:border-[#A47551]/30';
    return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20';
  };

  const getRankColor = (rank) => {
    if (rank === null) return 'text-[#5E3E28]/50 dark:text-[#D4B59E]/40';
    if (rank <= 3) return 'text-emerald-600 dark:text-emerald-400';
    if (rank <= 10) return 'text-[#7A5236] dark:text-[#D4B59E]';
    return 'text-rose-600 dark:text-rose-400';
  };

  const totalKeywords = rankings.length;
  const rankedKeywords = rankings.filter(r => r.rank !== null);
  const avgPosition = rankedKeywords.length > 0
    ? (rankedKeywords.reduce((acc, curr) => acc + Number(curr.rank), 0) / rankedKeywords.length).toFixed(1)
    : '0';
  const top3Count = rankings.filter(r => r.rank !== null && r.rank <= 3).length;

  return (
    <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] text-[#1A0F0A] dark:text-white relative overflow-hidden transition-colors duration-300">

      {/* Background Glows - Light/Dark mode aware */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7A5236]/15 dark:bg-[#A47551]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#A47551]/15 dark:bg-[#7A5236]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B59E]/20 dark:bg-[#3E2723]/40 rounded-full blur-3xl" />

        {/* Grid Pattern */}
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

        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
                Keyword Rankings
              </h1>
              <span className="bg-[#7A5236]/10 dark:bg-[#A47551]/15 text-[#7A5236] dark:text-[#D4B59E] text-xs px-3 py-1 rounded-full border border-[#7A5236]/25 dark:border-[#A47551]/30">
                Real SERP Data
              </span>
            </div>
            <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1">
              View the search engine ranking positions of your target keywords
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/analysis')}
              className="text-sm bg-[#7A5236] hover:bg-[#5E3E28] text-white px-4 py-2 rounded-xl transition shadow-lg shadow-[#7A5236]/40 hover:shadow-[#7A5236]/60 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Keywords
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-4xl mx-auto">
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl p-4 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300">
            <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">Total Keywords</p>
            <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">{totalKeywords}</p>
          </div>
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl p-4 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300">
            <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">Average Position</p>
            <p className="text-2xl font-bold text-[#7A5236] dark:text-[#D4B59E]">{avgPosition}</p>
          </div>
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/25 rounded-2xl p-4 shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-emerald-300 dark:hover:border-emerald-400/40 transition-all duration-300">
            <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">Top 3 Rankings</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{top3Count}</p>
          </div>
        </div>

        {/* Rankings Table */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 border-b border-[#7A5236]/20 dark:border-[#A47551]/25">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">#</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">Keyword</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">Website</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">Latest Ranking</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(4).fill(0).map((_, index) => (
                    <tr key={index} className="border-b border-[#7A5236]/10 dark:border-white/5 animate-pulse">
                      <td className="py-4 px-6"><div className="h-4 bg-[#7A5236]/10 dark:bg-white/5 rounded w-4"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-[#7A5236]/10 dark:bg-white/5 rounded w-32"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-[#7A5236]/10 dark:bg-white/5 rounded w-24"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-[#7A5236]/10 dark:bg-white/5 rounded w-8"></div></td>
                      <td className="py-4 px-6"><div className="h-4 bg-[#7A5236]/10 dark:bg-white/5 rounded w-20"></div></td>
                    </tr>
                  ))
                ) : (
                  rankings.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-[#7A5236]/10 dark:border-white/5 hover:bg-[#7A5236]/5 dark:hover:bg-[#A47551]/10 transition-colors duration-200 ${
                        item.rank !== null && item.rank <= 3 ? 'bg-emerald-50/30 dark:bg-emerald-500/5' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${getRankBadge(item.rank)}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-[#1A0F0A] dark:text-white">
                        {item.keyword}
                      </td>
                      <td className="py-4 px-6 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/70 max-w-[200px] truncate">
                        {item.website}
                      </td>
                      <td className="py-4 px-6">
                        {item.found ? (
                          <span className={`font-bold ${getRankColor(item.rank)}`}>
                            #{item.rank}
                          </span>
                        ) : (
                          <span className="text-[#5E3E28]/50 dark:text-[#D4B59E]/40 text-sm">
                            Not Found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
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
              <h3 className="text-lg font-medium text-[#1A0F0A] dark:text-white mb-2">No rankings found</h3>
              <p className="text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mb-4">Start analysis to see their rankings here</p>
              <button
                onClick={() => navigate('/analysis')}
                className="bg-[#7A5236] hover:bg-[#5E3E28] text-white px-6 py-2 rounded-xl transition shadow-lg shadow-[#7A5236]/40"
              >
                Start Analysis
              </button>
            </div>
          )}
        </div>

        {/* Note about keyword management */}
        <div className="mt-6 bg-[#F5EBDD] dark:bg-[#A47551]/10 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-2xl p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E] mt-0.5" />
            <div>
              <p className="text-sm text-[#5E3E28]/80 dark:text-[#D4B59E]/70">
                <strong className="text-[#7A5236] dark:text-[#D4B59E]">Note:</strong> Rankings are updated daily.
                To add new keywords, go to the
                <button
                  onClick={() => navigate('/analysis')}
                  className="text-[#7A5236] dark:text-[#D4B59E] font-medium hover:text-[#5E3E28] dark:hover:text-[#A47551] mx-1 transition"
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