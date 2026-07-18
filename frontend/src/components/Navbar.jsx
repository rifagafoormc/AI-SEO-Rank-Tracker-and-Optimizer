import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const activeLink = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
      : "text-gray-700 hover:text-blue-600 transition";

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-2xl font-bold text-blue-600">
        AI SEO Rank Tracker
      </h1>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/dashboard" className={activeLink("/dashboard")}>
          Dashboard
        </Link>

        <Link to="/analysis" className={activeLink("/analysis")}>
          SEO Analysis
        </Link>

        <Link to="/rankings" className={activeLink("/rankings")}>
          Rankings
        </Link>

        <Link to="/history" className={activeLink("/history")}>
          History
        </Link>
      </div>

      {/* Profile Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-10 h-10 rounded-full bg-blue-600 text-white text-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition"
        >
          👤
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-50">
            <div className="px-4 py-3 border-b">
              <p className="font-semibold">Guest User</p>
              <p className="text-sm text-gray-500">
                Login to view your profile
              </p>
            </div>

            <Link
              to="/profile"
              className="block px-4 py-3 hover:bg-gray-100"
              onClick={() => setShowMenu(false)}
            >
              👤 My Profile
            </Link>

            <button
              className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600"
              onClick={() => setShowMenu(false)}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}