import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Sun, Moon } from "lucide-react"; 
import { useTheme } from "../context/ThemeContext"; // ✅ Import the custom hook

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  // ✅ Use the global theme context instead of local state/useEffect
  const { theme, toggleTheme } = useTheme();

  // User Auth State
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isLoggedIn = !!token;
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  const activeLink = (path) =>
    location.pathname === path
      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 dark:text-blue-400 dark:border-blue-400"
      : "text-gray-700 hover:text-blue-600 transition dark:text-gray-300 dark:hover:text-blue-400";

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setShowMenu(false);
    
    navigate('/'); 
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm px-4 md:px-8 py-4 transition-colors duration-300">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          to={isLoggedIn && !isPublicPage ? "/dashboard" : "/"} 
          className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
        >
          AI SEO Rank Tracker
        </Link>

        {/* Show Dashboard Navbar ONLY on protected pages when logged in */}
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

            {/* Right Side: Theme Toggle + Profile Dropdown */}
            <div className="flex items-center gap-4">
              
              {/* ✅ Inline Theme Button using context */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition duration-300"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                )}
              </button>

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
                    
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
                      <div className="px-4 py-3 border-b dark:border-gray-700">
                        <p className="font-semibold dark:text-white">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition dark:text-gray-300"
                        onClick={() => setShowMenu(false)}
                      >
                        👤 My Profile
                      </Link>
                      <button
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 transition border-t dark:border-gray-700"
                        onClick={handleLogout}
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Show Login/Register on Public Pages (Landing Page) */
          <div className="hidden md:flex items-center gap-6">
            
            {/* ✅ Inline Theme Button using context */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-105 transition duration-300"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
              )}
            </button>

            <Link 
              to="/login" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
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

        {/* Mobile Menu Button - Only on protected pages */}
        {isLoggedIn && !isPublicPage && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
      </div>
    </nav>
  );
}