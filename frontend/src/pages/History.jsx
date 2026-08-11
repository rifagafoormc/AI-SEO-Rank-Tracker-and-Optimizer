import Navbar from "../components/Navbar";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Plus, TrendingUp, Award, AlertTriangle, 
  BarChart3, Calendar, Sparkles, Trash2, Eye,
  ChevronRight, CheckCircle, XCircle, Clock,
  FileText, Activity, Shield
} from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [historyData, setHistoryData] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');

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

      const data = await response.json();
      
      console.log('📊 History API data:', JSON.stringify(data, null, 2));

      if (data.success && Array.isArray(data.history)) {
        const formattedData = data.history.map((item) => {
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

          const score = item.pageSpeedData?.performance ?? 0;

          let status = 'Poor';
          let statusColor = 'text-rose-600 dark:text-rose-400';
          let bgColor = 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';

          if (score >= 90) {
            status = 'Excellent';
            statusColor = 'text-emerald-600 dark:text-emerald-400';
            bgColor = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
          } else if (score >= 80) {
            status = 'Good';
            statusColor = 'text-cyan-600 dark:text-cyan-400';
            bgColor = 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20';
          } else if (score >= 70) {
            status = 'Needs Improvement';
            statusColor = 'text-amber-600 dark:text-amber-400';
            bgColor = 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
          }

          return {
            id: item._id,
            website,
            score: Math.round(score),
            performanceScore: item.pageSpeedData?.performance ?? 0,
            lcp: item.pageSpeedData?.lcp || 'N/A',
            cls: item.pageSpeedData?.cls || 'N/A',
            tbt: item.pageSpeedData?.tbt || 'N/A',
            status,
            statusColor,
            bgColor,
            date: new Date(item.createdAt).toLocaleDateString(),
            keywords: item.keywords?.length || 0,
            issues: Math.max(0, 20 - Math.round(score / 5)),
            aiSuggestions: item.aiSuggestions || 'No suggestions available',
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

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeletingId(itemToDelete.id);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/history/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setHistoryData(historyData.filter(item => item.id !== itemToDelete.id));
        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        alert('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Failed to delete analysis');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const filteredData = historyData.filter(item => {
    const matchesSearch = item.website.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 80) return 'text-cyan-600 dark:text-cyan-400';
    if (score >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Excellent': 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20',
      'Good': 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20',
      'Needs Improvement': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20',
      'Poor': 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20',
    };
    return styles[status] || styles['Poor'];
  };

  return (
    <>
      <Navbar />
      
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
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analysis History
                </h1>
                <span className="bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20">
                  {historyData.length} analyses
                </span>
              </div>
              <p className="text-gray-600 dark:text-violet-300/60 mt-1">
                View all previously analyzed websites and their real PageSpeed Performance scores
              </p>
            </div>
            <button 
              onClick={() => navigate('/analysis')}
              className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-6 py-2 rounded-xl transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-500">Total Analyses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{historyData.length}</p>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/30 transition-all duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-500">Average Performance</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {historyData.length > 0
                  ? (historyData.reduce((acc, curr) => acc + curr.score, 0) / historyData.length).toFixed(1)
                  : '0.0'}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-emerald-300 dark:hover:border-emerald-400/30 transition-all duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-500">Best Performance</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {historyData.length > 0
                 ? Math.max(...historyData.map(item => item.score))
                 : 0}
                </p>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-rose-300 dark:hover:border-rose-400/30 transition-all duration-300">
              <p className="text-sm text-gray-500 dark:text-gray-500">Needs Attention</p>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {historyData.filter(item => item.score < 70).length}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search websites..."
                  className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-2 pl-10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {['All', 'Excellent', 'Good', 'Needs Improvement', 'Poor'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-violet-200 dark:border-violet-500/20">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Website</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Performance Score</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Keywords</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Issues</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">AI Suggestions</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-12 text-gray-500 dark:text-gray-500">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">No analyses found</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr 
                        key={item.id} 
                        className={`border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200 ${
                          item.score < 70 ? 'bg-rose-50/30 dark:bg-rose-500/5' : ''
                        }`}
                      >
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">{index + 1}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-500/10 rounded-xl flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-400">
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{item.keywords}</td>
                        <td className="py-4 px-6">
                          <span className={item.issues > 10 ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-gray-600 dark:text-gray-400'}>
                            {item.issues}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                          <div className="truncate" title={item.aiSuggestions}>
                            {item.aiSuggestions.length > 80
                              ? item.aiSuggestions.slice(0, 80) + '...'
                              : item.aiSuggestions}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => navigate(`/analysis/${item.id}`)}
                              className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 font-medium text-sm hover:underline flex items-center gap-1 transition"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item)}
                              disabled={deletingId === item.id}
                              className={`text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium text-sm transition flex items-center gap-1 ${
                                deletingId === item.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingId === item.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
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
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                Export Report
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Download all history as CSV</p>
              <button className="mt-2 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 text-sm hover:underline transition">
                Export Now →
              </button>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                Compare Websites
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Compare scores across different sites</p>
              <button className="mt-2 text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 text-sm hover:underline transition">
                Compare →
              </button>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                View Trends
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">See your SEO improvement over time</p>
              <button className="mt-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 text-sm hover:underline transition">
                View Trends →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          ></div>
          
          <div className="relative bg-white dark:bg-[#0a0a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-rose-200 dark:border-rose-500/20 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete Analysis
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete the analysis for <span className="font-semibold text-gray-900 dark:text-white">"{itemToDelete?.website}"</span>? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium transition shadow-lg shadow-rose-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}