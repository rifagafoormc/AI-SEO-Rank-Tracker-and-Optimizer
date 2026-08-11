import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { 
  Lock, Key, CheckCircle, XCircle, 
  ArrowLeft, Shield, Eye, EyeOff
} from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    // ✅ Password validation (same as Register)
    const hasMinimumLength = newPassword.length >= 6;
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/`~;'+=]/.test(newPassword);

    if (!hasMinimumLength) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (!hasNumber) {
      setError("New password must contain at least one number.");
      return;
    }

    if (!hasSpecialCharacter) {
      setError("New password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 w-full max-w-md p-8">
            
            {/* Back Button */}
            <button
              onClick={() => navigate("/profile")}
              className="mb-4 text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/10">
                <Key className="w-6 h-6 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h2>
            </div>
            <p className="text-gray-600 dark:text-violet-300/60 mb-6">
              Enter your current password and choose a new one
            </p>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl mb-4 text-sm">
                <XCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-4 text-sm">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-violet-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-violet-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Must be at least 6 characters, 1 number and 1 special character
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-violet-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-4 py-3 rounded-xl transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}