import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { 
  Users, Search, 
  User, Mail, Calendar, BarChart3, Trash2, 
  ArrowLeft, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        'http://localhost:5000/api/admin/users',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        alert('Access denied. Admin only.');
        navigate('/admin');
      } else if (error.response?.status === 401) {
        navigate('/login');
      }
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setDeletingId(userToDelete.id);
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${userToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setMessage({ type: 'success', text: `User ${userToDelete.name} deleted successfully!` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20';
    }
    return 'bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#070714] flex items-center justify-center transition-colors duration-300">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-violet-600 dark:border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      </>
    );
  }

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

        <div className="relative z-10 max-w-7xl mx-auto p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Users
              </h1>
              <p className="text-gray-600 dark:text-violet-300/60 mt-1">
                View and manage all registered users
              </p>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              )}
              {message.text}
            </div>
          )}

          {/* Stats Summary - Only 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-cyan-200 dark:border-cyan-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-cyan-300 dark:hover:border-cyan-400/30 transition-all duration-300 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Regular Users</p>
                  <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {users.filter(u => u.role === 'user').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full bg-gray-100 dark:bg-white/5 border border-violet-200 dark:border-violet-500/20 rounded-xl px-4 py-2 pl-10 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-white/5 border-b border-violet-200 dark:border-violet-500/20">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Analyses</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-violet-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500 dark:text-gray-500">
                        <div className="text-6xl mb-4">👤</div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">{index + 1}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-800 text-white flex items-center justify-center text-sm font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {new Date(user.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                          <div className="flex items-center justify-center gap-1.5">
                            <BarChart3 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {user.analysisCount || 0}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteClick(user)}
                                disabled={deletingId === user.id}
                                className={`text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 font-medium text-sm transition flex items-center gap-1 ${
                                  deletingId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Trash2 className="w-4 h-4" />
                                {deletingId === user.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                Cannot delete
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Back to Admin Dashboard */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin')}
              className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin Dashboard
            </button>
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
              Delete User
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-gray-900 dark:text-white">"{userToDelete?.name}"</span>? 
              This action cannot be undone and will delete all their analyses.
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