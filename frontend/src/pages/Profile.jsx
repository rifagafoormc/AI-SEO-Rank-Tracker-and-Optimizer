import { useNavigate } from "react-router-dom";
import {
  User, Mail, Shield, LogOut,
  Key,
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
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">

        <h1 className="text-3xl font-bold mb-2 text-[#1A0F0A] dark:text-white">
          My Profile
        </h1>

        <p className="text-[#5E3E28] dark:text-[#D4B59E]/70 mb-8 transition-colors duration-300">
          View and manage your account details.
        </p>

        {/* Profile Card */}
        <div className="bg-white/90 dark:bg-[#251710]/80 backdrop-blur-xl border border-[#7A5236]/15 dark:border-[#A47551]/25 rounded-2xl shadow-lg shadow-[#7A5236]/5 dark:shadow-xl dark:shadow-black/40 hover:border-[#7A5236]/30 dark:hover:border-[#A47551]/40 transition-all duration-300 p-8">

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7A5236] to-[#A47551] text-white text-4xl font-bold flex items-center justify-center shadow-lg shadow-[#7A5236]/40">
              {user?.name?.charAt(0) || '👤'}
            </div>
            {isAdmin && (
              <span className="mt-2 text-xs bg-[#7A5236]/10 dark:bg-[#A47551]/15 text-[#7A5236] dark:text-[#D4B59E] px-3 py-1 rounded-full border border-[#7A5236]/25 dark:border-[#A47551]/30 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>

          <div className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block font-semibold mb-2 text-[#7A5236] dark:text-[#D4B59E]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />
                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl text-[#1A0F0A] dark:text-white cursor-default transition-all duration-300"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block font-semibold mb-2 text-[#7A5236] dark:text-[#D4B59E]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl text-[#1A0F0A] dark:text-white cursor-default transition-all duration-300"
                />
              </div>
            </div>

            {/* Role Badge */}
            <div>
              <label className="block font-semibold mb-2 text-[#7A5236] dark:text-[#D4B59E]">
                Account Type
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236]/60 dark:text-[#D4B59E]/50" />
                <input
                  type="text"
                  value={isAdmin ? 'Administrator' : 'Regular User'}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-[#F5EBDD] dark:bg-[#1A0F0A]/70 border border-[#7A5236]/20 dark:border-[#A47551]/25 rounded-xl text-[#1A0F0A] dark:text-white cursor-default transition-all duration-300"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => navigate("/change-password")}
              className="bg-[#7A5236] hover:bg-[#5E3E28] text-white px-6 py-3 rounded-xl transition shadow-lg shadow-[#7A5236]/40 hover:shadow-[#7A5236]/60 flex items-center gap-2"
            >
              <Key className="w-5 h-5" />
              Change Password
            </button>

            <button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}