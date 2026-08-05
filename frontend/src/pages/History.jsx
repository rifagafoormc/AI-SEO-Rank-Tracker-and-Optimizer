import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');

        console.log('History token:', token);

        if (!token) {
          console.log('No token found');
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:5000/api/history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('History response status:', response.status);

        const data = await response.json();
        
        // ✅ UPDATED: Prints formatted JSON in the console
        console.log('History API data:', JSON.stringify(data, null, 2));

        if (data.success && Array.isArray(data.history)) {
          const formattedData = data.history.map((item) => {
            // Safe URL handling
            let website = 'Unknown Website';

            try {
              if (item.websiteUrl) {
                const formattedUrl = item.websiteUrl.startsWith('http')
                  ? item.websiteUrl
                  : `https://${item.websiteUrl}`;

                website = new URL(formattedUrl).hostname;
              }
            } catch (err) {
              console.error('Invalid URL:', item.websiteUrl);
            }

            // Calculate SEO score from ranking results
            const results = item.rankingData?.results || [];

            const foundRanks = results
              .filter(r => r.found && typeof r.rank === 'number')
              .map(r => r.rank);

            let score = 50;

            if (foundRanks.length > 0) {
              const avgRank =
                foundRanks.reduce((a, b) => a + b, 0) / foundRanks.length;

              score = Math.max(50, Math.min(100, 105 - avgRank * 2));
            }

            let status = 'Poor';
            let statusColor = 'text-red-600 dark:text-red-400';
            let bgColor = 'bg-red-50 dark:bg-red-900/20';

            if (score >= 90) {
              status = 'Excellent';
              statusColor = 'text-green-600 dark:text-green-400';
              bgColor = 'bg-green-50 dark:bg-green-900/20';
            } else if (score >= 80) {
              status = 'Good';
              statusColor = 'text-blue-600 dark:text-blue-400';
              bgColor = 'bg-blue-50 dark:bg-blue-900/20';
            } else if (score >= 70) {
              status = 'Needs Improvement';
              statusColor = 'text-yellow-600 dark:text-yellow-400';
              bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
            }

            return {
              id: item._id,
              website,
              score: Math.round(score),
              status,
              statusColor,
              bgColor,
              date: new Date(item.createdAt).toLocaleDateString(),
              keywords: item.keywords?.length || 0,
              issues: Math.max(0, 20 - Math.round(score / 5)),
              aiSuggestions:
                item.aiSuggestions || 'No suggestions available',
            };
          });

          setHistoryData(formattedData);
        } else {
          console.log('No history found or invalid response');
          setHistoryData([]);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setHistoryData([]);
      }
    };

    fetchHistory();
  }, [navigate]);

  // Filter data
  const filteredData = historyData.filter(item => {
    const matchesSearch = item.website.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analysis History
                </h1>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  {historyData.length} analyses
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View all previously analyzed websites and their SEO scores
              </p>
            </div>
            <button 
              onClick={() => navigate('/analysis')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Analysis
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{historyData.length}</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {historyData.length > 0
                  ? (historyData.reduce((acc, curr) => acc + curr.score, 0) / historyData.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Best Score</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {historyData.length > 0
                 ? Math.max(...historyData.map(item => item.score))
                 : 0}
                </p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-400">Needs Attention</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {historyData.filter(item => item.score < 70).length}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 mb-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search websites..."
                  className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                  bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 
                  text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
                />
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Excellent', 'Good', 'Needs Improvement', 'Poor'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/70">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Website</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">SEO Score</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Keywords</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Issues</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">AI Suggestions</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-lg font-medium dark:text-gray-300">No analyses found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/30 dark:hover:bg-gray-800/60 transition-colors duration-200 ${
                          item.score < 70 ? 'bg-red-50/20 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {item.website.charAt(0).toUpperCase()}
                            </div>
                            {item.website}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-bold text-lg ${getScoreColor(item.score)}`}>
                            {item.score}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-sm">/100</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium dark:bg-opacity-20 ${
                            item.status === 'Excellent' ? 'dark:bg-green-900 dark:text-green-300' :
                            item.status === 'Good' ? 'dark:bg-blue-900 dark:text-blue-300' :
                            item.status === 'Needs Improvement' ? 'dark:bg-yellow-900 dark:text-yellow-300' :
                            'dark:bg-red-900 dark:text-red-300'
                          } ${item.bgColor} ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.keywords}</td>
                        <td className="py-4 px-6">
                          <span className={item.issues > 10 ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                            {item.issues}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{item.date}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                          <div className="truncate" title={item.aiSuggestions}>
                            {item.aiSuggestions.length > 80
                              ? item.aiSuggestions.slice(0, 80) + '...'
                              : item.aiSuggestions}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button 
                            onClick={() => navigate(`/analysis/${item.id}`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm hover:underline flex items-center gap-1 transition"
                          >
                            View Report
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <h4 className="font-medium text-gray-900 dark:text-white">📊 Export Report</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Download all history as CSV</p>
              <button className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline">
                Export Now →
              </button>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <h4 className="font-medium text-gray-900 dark:text-white">🔍 Compare Websites</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compare scores across different sites</p>
              <button className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline">
                Compare →
              </button>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 transition-colors duration-300">
              <h4 className="font-medium text-gray-900 dark:text-white">📈 View Trends</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">See your SEO improvement over time</p>
              <button className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline">
                View Trends →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}