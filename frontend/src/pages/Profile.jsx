import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Shield, LogOut, 
  Key, Sparkles, CheckCircle 
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">

          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            My Profile
          </h1>

          <p className="text-gray-600 dark:text-violet-300/60 mb-8 transition-colors duration-300">
            View and manage your account details.
          </p>

          {/* Profile Card */}
          <div className="bg-white dark:bg-[#0a0a1a]/80 backdrop-blur-xl border border-violet-200 dark:border-violet-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-xl dark:shadow-black/20 hover:border-violet-300 dark:hover:border-violet-400/30 transition-all duration-300 p-8">

            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-800 text-white text-4xl font-bold flex items-center justify-center shadow-lg shadow-violet-500/30 dark:shadow-violet-600/30">
                {user?.name?.charAt(0) || '👤'}
              </div>
              {isAdmin && (
                <span className="mt-2 text-xs bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 px-3 py-1 rounded-full border border-violet-200 dark:border-violet-500/20 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-violet-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type="text"
                    value={user?.name || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl text-gray-900 dark:text-white cursor-default transition-all duration-300"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-violet-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl text-gray-900 dark:text-white cursor-default transition-all duration-300"
                  />
                </div>
              </div>

              {/* Role Badge - Full width */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-violet-300">
                  Account Type
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-violet-400" />
                  <input
                    type="text"
                    value={isAdmin ? 'Administrator' : 'Regular User'}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-violet-500/20 rounded-xl text-gray-900 dark:text-white cursor-default transition-all duration-300"
                  />
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={() => navigate("/change-password")}
                className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 flex items-center gap-2"
              >
                <Key className="w-5 h-5" />
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}