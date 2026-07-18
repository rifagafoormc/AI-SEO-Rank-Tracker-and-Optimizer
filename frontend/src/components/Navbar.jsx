import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
 const token = localStorage.getItem("token");
const isLoggedIn = !!token;

const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ Define which routes are public
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  const activeLink = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1"
      : "text-gray-700 hover:text-blue-600 transition";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowMenu(false);
    navigate('/'); // ✅ Redirect to home page
  };

  return (
    <nav className="bg-white shadow-sm px-4 md:px-8 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          to={isLoggedIn && !isPublicPage ? "/dashboard" : "/"} 
          className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
        >
          AI SEO Rank Tracker
        </Link>

        {/* ✅ Show Dashboard Navbar ONLY on protected pages when logged in */}
        {isLoggedIn && !isPublicPage ? (
          <>
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

            {/* Profile Dropdown - Logged In */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white text-lg font-semibold flex items-center justify-center hover:bg-blue-700 transition"
              >
                {user?.name?.charAt(0) || '👤'}
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email || ''}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-3 hover:bg-gray-100 transition"
                      onClick={() => setShowMenu(false)}
                    >
                      👤 My Profile
                    </Link>
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-600 transition border-t"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* ✅ Show Login/Register on Public Pages */
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        )}

        {/* ✅ Mobile Menu Button - Only on protected pages */}
        {isLoggedIn && !isPublicPage && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}