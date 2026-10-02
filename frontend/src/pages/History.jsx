import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Search,
  Plus,
  Trash2,
  Calendar,
  Shield,
  BarChart3,
  Activity,
  AlertTriangle,
} from 'lucide-react';

export default function History() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
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

      const response = await fetch(
        'http://localhost:5000/api/history',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        '📊 Unified History API data:',
        JSON.stringify(data, null, 2)
      );

      if (data.success && Array.isArray(data.history)) {
        setHistoryData(data.history);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistoryData([]);
    }
  };


  // -----------------------------
  // Format website
  // -----------------------------
  const getWebsiteName = (url) => {
    if (!url) return 'Unknown Website';

    try {
      const formattedUrl = url.startsWith('http')
        ? url
        : `https://${url}`;

      return new URL(formattedUrl).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };


  // -----------------------------
  // Type information
  // -----------------------------
  const getTypeInfo = (type) => {
    if (type === 'analysis') {
      return {
        label: 'SEO Analysis',
        icon: BarChart3,
        className:
          'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-500/20',
      };
    }

    if (type === 'audit') {
      return {
        label: 'SEO Audit',
        icon: Shield,
        className:
          'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20',
      };
    }

    return {
      label: 'Performance',
      icon: Activity,
      className:
        'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    };
  };


  // -----------------------------
  // Details shown in table
  // -----------------------------
  const getDetails = (item) => {
    if (item.type === 'analysis') {
      const keywordCount = item.keywords?.length || 0;

      return `${keywordCount} ${
        keywordCount === 1 ? 'keyword' : 'keywords'
      } analyzed`;
    }

    if (item.type === 'audit') {
      const score =
        typeof item.seoScore === 'number'
          ? Math.round(item.seoScore)
          : 'N/A';

      return `SEO Score: ${score}/100`;
    }

    if (item.type === 'performance') {
      const score =
        typeof item.performance === 'number'
          ? Math.round(item.performance)
          : 'N/A';

      return `Performance: ${score}/100`;
    }

    return '—';
  };


  // -----------------------------
  // Date
  // -----------------------------
  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString();
  };


  // -----------------------------
  // Filter
  // -----------------------------
  const filteredData = historyData.filter((item) => {
    const website = getWebsiteName(item.websiteUrl);

    const matchesSearch = website
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'All' ||
      item.type === filterType;

    return matchesSearch && matchesType;
  });


  // -----------------------------
  // Delete
  // -----------------------------
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };


  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setDeletingId(itemToDelete._id);

      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5000/api/history/${itemToDelete.type}/${itemToDelete._id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setHistoryData((prev) =>
          prev.filter(
            (item) => item._id !== itemToDelete._id
          )
        );

        setShowDeleteModal(false);
        setItemToDelete(null);
      } else {
        alert(data.message || 'Failed to delete history item');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete history item');
    } finally {
      setDeletingId(null);
    }
  };


  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070714] text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analysis History
              </h1>

              <span className="bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20">
                {historyData.length} records
              </span>
            </div>

            <p className="text-gray-600 dark:text-violet-300/60 mt-1">
              View your previous SEO analyses, audits, and performance checks
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


        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

          {/* Total */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Total Records
            </p>

            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {historyData.length}
            </p>
          </div>


          {/* Analyses */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              SEO Analyses
            </p>

            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
              {
                historyData.filter(
                  (item) => item.type === 'analysis'
                ).length
              }
            </p>
          </div>


          {/* Audits */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              SEO Audits
            </p>

            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
              {
                historyData.filter(
                  (item) => item.type === 'audit'
                ).length
              }
            </p>
          </div>


          {/* Performance */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Performance Checks
            </p>

            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {
                historyData.filter(
                  (item) => item.type === 'performance'
                ).length
              }
            </p>
          </div>

        </div>


        {/* Search & Filter */}
        <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 p-4 mb-6">

          <div className="flex flex-col md:flex-row gap-4">

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                placeholder="Search websites..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-2 pl-10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
            </div>


            <div className="flex flex-wrap gap-2">

              {[
                { value: 'All', label: 'All' },
                { value: 'analysis', label: 'SEO Analysis' },
                { value: 'audit', label: 'SEO Audit' },
                { value: 'performance', label: 'Performance' },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() =>
                    setFilterType(filter.value)
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    filterType === filter.value
                      ? 'bg-gradient-to-r from-violet-600 to-violet-700 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}

            </div>

          </div>
        </div>


        {/* History Table */}
        <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-gray-50 dark:bg-white/5 border-b border-violet-200 dark:border-violet-500/20">

                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    #
                  </th>

                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    Type
                  </th>

                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    Website
                  </th>

                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    Details
                  </th>

                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    Date
                  </th>

                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">
                    Actions
                  </th>
                </tr>

              </thead>


              <tbody>

                {filteredData.length === 0 ? (

                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-12 text-gray-500 dark:text-gray-500"
                    >
                      <div className="text-6xl mb-4">
                        📋
                      </div>

                      <p className="text-lg font-medium text-gray-900 dark:text-white">
                        No history found
                      </p>

                      <p className="text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </td>
                  </tr>

                ) : (

                  filteredData.map((item, index) => {

                    const typeInfo =
                      getTypeInfo(item.type);

                    const TypeIcon =
                      typeInfo.icon;

                    return (
                      <tr
                        key={`${item.type}-${item._id}`}
                        className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200"
                      >

                        {/* Number */}
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">
                          {index + 1}
                        </td>


                        {/* Type */}
                        <td className="py-4 px-6">

                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${typeInfo.className}`}
                          >
                            <TypeIcon className="w-3.5 h-3.5" />

                            {typeInfo.label}
                          </span>

                        </td>


                        {/* Website */}
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">

                          <div className="flex items-center gap-2">

                            <div className="w-8 h-8 bg-violet-100 dark:bg-violet-500/10 rounded-xl flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-400">
                              {getWebsiteName(
                                item.websiteUrl
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            {getWebsiteName(
                              item.websiteUrl
                            )}

                          </div>

                        </td>


                        {/* Details */}
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          {getDetails(item)}
                        </td>


                        {/* Date */}
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">

                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />

                            {formatDate(
                              item.createdAt
                            )}
                          </div>

                        </td>


                        {/* Actions */}
                        <td className="py-4 px-6">

                          <button
                            onClick={() =>
                              handleDeleteClick(item)
                            }
                            disabled={
                              deletingId === item._id
                            }
                            className={`text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium text-sm transition flex items-center gap-1 ${
                              deletingId === item._id
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />

                            {deletingId === item._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />

          <div className="relative bg-white dark:bg-[#0a0a1a] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-rose-200 dark:border-rose-500/20">

            <div className="flex justify-center mb-4">

              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">

                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />

              </div>

            </div>


            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete History Item
            </h3>


            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">

              Are you sure you want to permanently delete the{' '}

              <span className="font-semibold text-gray-900 dark:text-white">
                {getTypeInfo(
                  itemToDelete?.type
                ).label}
              </span>{' '}

              for{' '}

              <span className="font-semibold text-gray-900 dark:text-white">
                "{getWebsiteName(
                  itemToDelete?.websiteUrl
                )}"
              </span>

              ?

              <br />

              This action cannot be undone.

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
                disabled={deletingId === itemToDelete?._id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-medium transition shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {deletingId === itemToDelete?._id
                  ? 'Deleting...'
                  : 'Delete'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}