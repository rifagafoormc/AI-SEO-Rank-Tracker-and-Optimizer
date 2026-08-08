import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

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

      // Get history only - no keywords filtering
      const response = await axios.get(
        "http://localhost:5000/api/history",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const history = response.data.history || [];

      // Get all rankings from history - no filtering
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

      // Remove duplicates - keep only the latest entry for each website + keyword
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
          // Put found rankings first
          if (a.rank === null) return 1;
          if (b.rank === null) return -1;
          return a.rank - b.rank;
        });

      console.log("History response:", response.data);
      console.log("All rankings:", allRankings);

      setRankings(allRankings);

    } catch (error) {
      console.error("Failed to fetch rankings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* ✅ 1. Background: Lighter Dark Gray (Matches Dashboard) */}
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Keyword Rankings
                </h1>
                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-3 py-1 rounded-full border border-green-200 dark:border-green-800">
                  Real SERP Data
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View the search engine ranking positions of your target keywords
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/analysis')}
                className="text-sm bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Keywords
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          {/* ✅ 2. Small Summary Cards: Darker than the background */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Keywords</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{rankings.length}</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Position</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {rankings.length > 0
                  ? (
                      rankings
                        .filter(r => !isNaN(Number(r.rank)) && r.rank !== null)
                        .reduce((acc, curr) => acc + Number(curr.rank), 0) /
                      rankings.filter(r => !isNaN(Number(r.rank)) && r.rank !== null).length
                    ).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Top 3 Rankings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {rankings.filter(r => r.rank !== null && r.rank <= 3).length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Needs Improvement</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {rankings.filter(r => r.rank !== null && r.rank > 10).length}
              </p>
            </div>
          </div>

          {/* Rankings Table */}
          {/* ✅ 3. Main Table Card: Darker Background */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* ✅ 4. Table Header: Darkened */}
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/70">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Keyword</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Website</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Current Rank</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Page</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Search Engine</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeletons
                    Array(4).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700/50 animate-pulse">
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    rankings.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/30 dark:hover:bg-gray-800/60 transition-colors duration-200 ${
                          item.rank !== null && item.rank <= 3 ? 'bg-green-50/30 dark:bg-green-900/20' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            item.rank !== null && item.rank <= 3 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : item.rank !== null && item.rank <= 10 
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-200">
                          {item.keyword}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-[200px] truncate">
                          {item.website}
                        </td>
                        <td className="py-4 px-6">
                          {item.found ? (
                            <span className={`font-bold ${
                              item.rank <= 3
                                ? 'text-green-600 dark:text-green-400'
                                : item.rank <= 10
                                  ? 'text-blue-600 dark:text-blue-400'
                                  : 'text-red-600 dark:text-red-400'
                            }`}>
                              #{item.rank}
                            </span>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">
                              Not Found
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          {item.page}
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            {item.engine}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {item.updated}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Empty state */}
            {!loading && rankings.length === 0 && (
              <div className="text-center py-12 dark:text-gray-300">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No rankings found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start analysis to see their rankings here</p>
                <button 
                  onClick={() => navigate('/analysis')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Start Analysis
                </button>
              </div>
            )}
          </div>

          {/* Note about keyword management */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-300">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Rankings are updated daily. 
                  To add new keywords, go to the 
                  <button 
                    onClick={() => navigate('/analysis')}
                    className="text-blue-800 dark:text-blue-200 font-medium hover:underline mx-1"
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
    </>
  );
}