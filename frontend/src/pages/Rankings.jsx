import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Rankings() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - would come from API
  const mockRankings = [
    { keyword: 'SEO Services', rank: 3, previousRank: 5, engine: 'Google', updated: 'Today', change: '+2' },
    { keyword: 'React Developer', rank: 8, previousRank: 7, engine: 'Google', updated: 'Today', change: '-1' },
    { keyword: 'AI SEO Tool', rank: 2, previousRank: 4, engine: 'Google', updated: 'Yesterday', change: '+2' },
    { keyword: 'Digital Marketing', rank: 11, previousRank: 9, engine: 'Google', updated: 'Yesterday', change: '-2' },
    { keyword: 'Content Strategy', rank: 5, previousRank: 6, engine: 'Google', updated: '2 days ago', change: '+1' },
    { keyword: 'Backlink Building', rank: 15, previousRank: 12, engine: 'Google', updated: '2 days ago', change: '-3' },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRankings(mockRankings);
      setLoading(false);
    }, 500);
  }, []);

  const getChangeColor = (change) => {
    if (!change) return 'text-gray-500';
    const num = parseInt(change);
    if (num > 0) return 'text-green-600';
    if (num < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (change) => {
    if (!change) return '→';
    const num = parseInt(change);
    if (num > 0) return '↑';
    if (num < 0) return '↓';
    return '→';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header with navigation */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Keyword Rankings
                </h1>
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                View the search engine ranking positions of your target keywords
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/keywords')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Manage Keywords
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Total Keywords</p>
              <p className="text-2xl font-bold text-gray-900">{rankings.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Average Position</p>
              <p className="text-2xl font-bold text-blue-600">
                {rankings.length > 0 
                  ? (rankings.reduce((acc, curr) => acc + curr.rank, 0) / rankings.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Top 3 Rankings</p>
              <p className="text-2xl font-bold text-green-600">
                {rankings.filter(r => r.rank <= 3).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-500">Needs Improvement</p>
              <p className="text-2xl font-bold text-red-600">
                {rankings.filter(r => r.rank > 10).length}
              </p>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Keyword</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Current Rank</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Change</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Search Engine</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeletons
                    Array(4).fill(0).map((_, index) => (
                      <tr key={index} className="border-b border-gray-100 animate-pulse">
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-4"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-8"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    rankings.map((item, index) => (
                      <tr 
                        key={index} 
                        className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200 ${
                          item.rank <= 3 ? 'bg-green-50/30' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            item.rank <= 3 
                              ? 'bg-green-100 text-green-700' 
                              : item.rank <= 10 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-medium text-gray-900">
                          {item.keyword}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-bold ${
                            item.rank <= 3 
                              ? 'text-green-600' 
                              : item.rank <= 10 
                                ? 'text-blue-600' 
                                : 'text-red-600'
                          }`}>
                            #{item.rank}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-medium ${getChangeColor(item.change)}`}>
                            {getChangeIcon(item.change)} {item.change}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                            </svg>
                            {item.engine}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
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
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No keywords tracked yet</h3>
                <p className="text-gray-500 mb-4">Start tracking keywords to see their rankings here</p>
                <button 
                  onClick={() => navigate('/keywords')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Add Keywords
                </button>
              </div>
            )}
          </div>

          {/* Note about keyword management */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Rankings are updated daily. 
                  To track new keywords, go to the 
                  <button 
                    onClick={() => navigate('/keywords')}
                    className="text-blue-800 font-medium hover:underline mx-1"
                  >
                    Keyword Management
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