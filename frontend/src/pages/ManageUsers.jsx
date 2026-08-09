import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

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
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] p-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manage Users
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage all registered users
              </p>
            </div>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
              {message.text}
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Admin Users</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Regular Users</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-4 mb-6 transition-colors duration-300">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none 
                bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 
                text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 transition-colors"
              />
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700/70">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">#</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Analyses</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="text-6xl mb-4">👤</div>
                        <p className="text-lg font-medium dark:text-gray-300">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-blue-50/30 dark:hover:bg-gray-800/60 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                        <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                          {user.analysisCount || 0}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => handleDeleteClick(user)}
                                disabled={deletingId === user.id}
                                className={`text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium text-sm transition flex items-center gap-1 ${
                                  deletingId === user.id ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                {deletingId === user.id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                            {user.role === 'admin' && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">Cannot delete admin</span>
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
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelDelete}
          ></div>
          
          <div className="relative bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700/50 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Delete User
            </h3>
            
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-gray-900 dark:text-white">"{userToDelete?.name}"</span>? 
              This action cannot be undone and will delete all their analyses.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-md shadow-red-600/20"
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