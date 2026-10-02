import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Search,
  User, Mail, Calendar, BarChart3, Trash2,
  ArrowLeft, AlertTriangle, CheckCircle, XCircle,
  Plus, Eye, EyeOff,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add User states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
  });

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
        `${API_BASE_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
        `${API_BASE_URL}/api/admin/users/${userToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setMessage({
          type: 'success',
          text: `User ${userToDelete.name} deleted successfully!`,
        });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete user',
      });
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

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    try {
      setCreatingUser(true);

      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}/api/admin/users`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUsers((prevUsers) => [response.data.user, ...prevUsers]);

        setMessage({
          type: 'success',
          text: `User ${response.data.user.name} created successfully!`,
        });

        setNewUser({ name: '', email: '', password: '' });
        setShowAddUserModal(false);
        setShowPassword(false);

        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      }
    } catch (error) {
      console.error('Create user failed:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create user',
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  });

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return 'bg-[#7A5236]/10 dark:bg-[#A47551]/15 text-[#7A5236] dark:text-[#D4B59E] border border-[#7A5236]/25 dark:border-[#A47551]/30';
    }
    return 'bg-[#A47551]/10 dark:bg-[#A47551]/15 text-[#A47551] dark:text-[#D4B59E] border border-[#A47551]/25 dark:border-[#A47551]/30';
  };

  /* ============================================================
     LOADING
  ============================================================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7A5236] dark:border-[#A47551] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5E3E28] dark:text-[#D4B59E]/70">Loading users...</p>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="min-h-screen bg-[#F5EBDD] dark:bg-[#1A0F0A] text-[#1A0F0A] dark:text-white relative overflow-hidden transition-colors duration-300">

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#7A5236]/15 dark:bg-[#A47551]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#A47551]/15 dark:bg-[#7A5236]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4B59E]/20 dark:bg-[#3E2723]/40 rounded-full blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(122,82,54,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(122,82,54,0.4) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
              Manage Users
            </h1>
            <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mt-1">
              View and manage all registered users
            </p>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#7A5236] hover:bg-[#5E3E28] text-white font-medium shadow-lg shadow-[#7A5236]/40 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            {message.text}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#7A5236] dark:text-[#D4B59E]" />
              </div>
              <div>
                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">Total Users</p>
                <p className="text-2xl font-bold text-[#1A0F0A] dark:text-white">
                  {users.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#A47551]/25 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#A47551]/45 dark:hover:border-[#A47551]/40 transition-all duration-300 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A47551]/10 dark:bg-[#A47551]/15 flex items-center justify-center">
                <User className="w-5 h-5 text-[#A47551] dark:text-[#D4B59E]" />
              </div>
              <div>
                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">Regular Users</p>
                <p className="text-2xl font-bold text-[#A47551] dark:text-[#D4B59E]">
                  {users.filter((u) => u.role === 'user').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-2 pl-10 focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25 dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25 transition-all duration-200 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5EBDD] dark:bg-[#1A0F0A]/50 border-b border-[#7A5236]/20 dark:border-[#A47551]/25">
                <tr>
                  {['#', 'Name', 'Email', 'Role', 'Joined', 'Analyses', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-4 px-6 text-sm font-semibold text-[#5E3E28] dark:text-[#D4B59E]/80"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="text-center py-12 text-[#5E3E28]/70 dark:text-[#D4B59E]/60"
                    >
                      <div className="text-6xl mb-4">👤</div>
                      <p className="text-lg font-medium text-[#1A0F0A] dark:text-white">
                        No users found
                      </p>
                      <p className="text-sm mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#7A5236]/10 dark:border-white/5 hover:bg-[#7A5236]/5 dark:hover:bg-[#A47551]/10 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#1A0F0A] dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7A5236] to-[#A47551] text-white flex items-center justify-center text-sm font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          {user.name}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#5E3E28]/80 dark:text-[#D4B59E]/70">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#7A5236]/50 dark:text-[#D4B59E]/40" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-[#5E3E28]/60 dark:text-[#D4B59E]/50">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#7A5236]/50 dark:text-[#D4B59E]/40" />
                          {new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-[#5E3E28]/80 dark:text-[#D4B59E]/70">
                        <div className="flex items-center justify-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#7A5236]/50 dark:text-[#D4B59E]/40" />
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
                                deletingId === user.id
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              {deletingId === user.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                          {user.role === 'admin' && (
                            <span className="text-xs text-[#5E3E28]/50 dark:text-[#D4B59E]/40 flex items-center gap-1">
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
            className="text-[#7A5236] dark:text-[#D4B59E] hover:text-[#5E3E28] dark:hover:text-[#A47551] flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Admin Dashboard
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />

          <div className="relative bg-white/95 dark:bg-[#251710]/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-rose-200 dark:border-rose-500/25">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-center text-[#1A0F0A] dark:text-white mb-2">
              Delete User
            </h3>

            <p className="text-center text-[#5E3E28]/80 dark:text-[#D4B59E]/70 mb-6">
              Are you sure you want to permanently delete{' '}
              <span className="font-semibold text-[#1A0F0A] dark:text-white">
                "{userToDelete?.name}"
              </span>
              ? This action cannot be undone and will delete all their
              analyses.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#7A5236]/25 dark:border-white/10 text-[#7A5236] dark:text-[#D4B59E] hover:bg-[#7A5236]/10 dark:hover:bg-white/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium transition shadow-lg shadow-rose-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!creatingUser) {
                setShowAddUserModal(false);
                setShowPassword(false);
              }
            }}
          />

          <div className="relative bg-white/95 dark:bg-[#251710]/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#7A5236]/15 dark:border-[#A47551]/25">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#7A5236]/10 dark:bg-[#A47551]/15 flex items-center justify-center">
                <User className="w-6 h-6 text-[#7A5236] dark:text-[#D4B59E]" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1A0F0A] dark:text-white">
                  Add New User
                </h3>
                <p className="text-sm text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
                  Create a new user account
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser}>
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#7A5236] dark:text-[#D4B59E] mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder="Enter user's name"
                  className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3 focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25 dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25 transition-all outline-none text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40"
                  required
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#7A5236] dark:text-[#D4B59E] mb-2">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A5236]/50 dark:text-[#D4B59E]/40" />

                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3 pl-10 focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25 dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25 transition-all outline-none text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#7A5236] dark:text-[#D4B59E] mb-2">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Enter password"
                    className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3 pr-11 focus:border-[#7A5236] focus:ring-2 focus:ring-[#7A5236]/25 dark:focus:border-[#A47551] dark:focus:ring-[#A47551]/25 transition-all outline-none text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40"
                    required
                    minLength={6}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5236]/60 dark:text-[#D4B59E]/50 hover:text-[#7A5236] dark:hover:text-[#D4B59E]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-2">
                  At least 6 characters, including a number and special character.
                </p>
              </div>

              {/* Role */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#7A5236] dark:text-[#D4B59E] mb-2">
                  Role
                </label>

                <div className="w-full bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl px-4 py-3 text-[#5E3E28] dark:text-[#D4B59E]/80">
                  User
                </div>

                <p className="text-xs text-[#5E3E28]/70 dark:text-[#D4B59E]/60 mt-2">
                  Admin-created accounts are regular users.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setShowPassword(false);
                  }}
                  disabled={creatingUser}
                  className="flex-1 px-4 py-3 rounded-xl border border-[#7A5236]/25 dark:border-white/10 text-[#7A5236] dark:text-[#D4B59E] hover:bg-[#7A5236]/10 dark:hover:bg-white/5 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#7A5236] hover:bg-[#5E3E28] text-white font-medium transition shadow-lg shadow-[#7A5236]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingUser ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}