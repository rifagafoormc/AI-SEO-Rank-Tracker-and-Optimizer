import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Sun,
  Moon,
  LayoutDashboard,
  BarChart3,
  LineChart,
  History,
  Gauge,
  Users,
  Shield,
  LogOut,
  User,
  Key,
  Menu,
  X,
  SearchCheck,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { theme, toggleTheme } = useTheme();

  // User Auth State
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "admin";

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  // Close mobile menu whenever route changes
  // This prevents the menu from staying open after navigation.
  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const activeLink = (path) =>
    location.pathname === path
      ? "text-cyan-600 dark:text-purple-400 font-semibold"
      : "text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-purple-400 transition";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    setShowProfile(false);
    setShowMobileMenu(false);

    navigate("/");
  };

  const handleNavigation = () => {
    setShowMobileMenu(false);
    setShowProfile(false);
  };

  return (
    <nav
      className="
        sticky top-0 z-50
        bg-white/90 dark:bg-[#070714]/90
        backdrop-blur-xl
        border-b border-gray-200/70 dark:border-purple-500/20
        transition-colors duration-300
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          h-16
          flex items-center justify-between
        "
      >
        {/* =====================================================
            LOGO
        ===================================================== */}
        <Link
          to={
            isLoggedIn && !isPublicPage
              ? isAdmin
                ? "/admin"
                : "/dashboard"
              : "/"
          }
          onClick={handleNavigation}
          className="
            text-lg sm:text-xl md:text-2xl
            font-bold
            whitespace-nowrap
            bg-gradient-to-r
            from-cyan-600 to-blue-600
            dark:from-purple-400 dark:to-purple-600
            bg-clip-text text-transparent
            hover:opacity-80
            transition
          "
        >
          AI SEO Rank Tracker
        </Link>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}
        {isLoggedIn && !isPublicPage ? (
          <>
            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/admin"
                    )}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/admin/users"
                    )}`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/dashboard"
                    )}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    to="/analysis"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/analysis"
                    )}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    SEO Analysis
                  </Link>

                  <Link
                    to="/seo-audit"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/seo-audit"
                    )}`}
                  >
                    <SearchCheck className="w-4 h-4" />
                    SEO Audit
                  </Link>

                  <Link
                    to="/performance"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/performance"
                    )}`}
                  >
                    <Gauge className="w-4 h-4" />
                    Performance
                  </Link>

                  <Link
                    to="/rankings"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/rankings"
                    )}`}
                  >
                    <LineChart className="w-4 h-4" />
                    Rankings
                  </Link>

                  <Link
                    to="/history"
                    className={`flex items-center gap-1.5 ${activeLink(
                      "/history"
                    )}`}
                  >
                    <History className="w-4 h-4" />
                    History
                  </Link>
                </>
              )}
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="
                  p-2 sm:p-2.5
                  rounded-xl
                  bg-gray-100/70 dark:bg-gray-800/60
                  hover:bg-gray-200/70 dark:hover:bg-gray-700/70
                  border border-gray-200/70 dark:border-gray-700/40
                  hover:scale-105
                  transition
                "
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                )}
              </button>

              {/* Profile - Desktop */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  aria-label="Open profile menu"
                  className="
                    w-9 h-9 sm:w-10 sm:h-10
                    rounded-full
                    bg-gradient-to-r
                    from-cyan-500 to-blue-600
                    dark:from-purple-600 dark:to-purple-800
                    text-white
                    text-sm sm:text-base
                    font-semibold
                    flex items-center justify-center
                    hover:scale-105
                    transition
                    shadow-lg
                    shadow-cyan-500/20
                    dark:shadow-purple-600/30
                  "
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "👤"}
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfile(false)}
                    />

                    <div
                      className="
                        absolute right-0 mt-3
                        w-64
                        max-w-[calc(100vw-2rem)]
                        bg-white/95 dark:bg-[#11111f]/95
                        backdrop-blur-xl
                        rounded-2xl
                        shadow-2xl
                        border
                        border-gray-200/70
                        dark:border-purple-500/20
                        z-50
                        overflow-hidden
                      "
                    >
                      {/* User Info */}
                      <div
                        className="
                          px-4 py-4
                          border-b
                          border-gray-200/70
                          dark:border-purple-500/20
                        "
                      >
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || "User"}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-purple-300/50 truncate">
                          {user?.email || ""}
                        </p>

                        {isAdmin && (
                          <span
                            className="
                              inline-flex items-center gap-1
                              mt-2
                              text-xs
                              bg-violet-100 dark:bg-violet-500/10
                              text-violet-700 dark:text-violet-400
                              px-2 py-1
                              rounded-full
                              border
                              border-violet-200
                              dark:border-violet-500/20
                            "
                          >
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Admin Links */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={handleNavigation}
                            className="
                              flex items-center gap-3
                              px-4 py-3
                              text-gray-700 dark:text-gray-300
                              hover:bg-cyan-50 dark:hover:bg-purple-500/10
                              transition
                            "
                          >
                            <LayoutDashboard className="w-4 h-4 text-cyan-600 dark:text-purple-400" />
                            Admin Dashboard
                          </Link>

                          <Link
                            to="/admin/users"
                            onClick={handleNavigation}
                            className="
                              flex items-center gap-3
                              px-4 py-3
                              text-gray-700 dark:text-gray-300
                              hover:bg-cyan-50 dark:hover:bg-purple-500/10
                              transition
                            "
                          >
                            <Users className="w-4 h-4 text-cyan-600 dark:text-purple-400" />
                            Manage Users
                          </Link>
                        </>
                      )}

                      {/* Profile */}
                      <Link
                        to="/profile"
                        onClick={handleNavigation}
                        className="
                          flex items-center gap-3
                          px-4 py-3
                          text-gray-700 dark:text-gray-300
                          hover:bg-cyan-50 dark:hover:bg-purple-500/10
                          transition
                        "
                      >
                        <User className="w-4 h-4 text-cyan-600 dark:text-purple-400" />
                        My Profile
                      </Link>

                      {/* Change Password */}
                      <Link
                        to="/change-password"
                        onClick={handleNavigation}
                        className="
                          flex items-center gap-3
                          px-4 py-3
                          text-gray-700 dark:text-gray-300
                          hover:bg-cyan-50 dark:hover:bg-purple-500/10
                          transition
                        "
                      >
                        <Key className="w-4 h-4 text-cyan-600 dark:text-purple-400" />
                        Change Password
                      </Link>

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="
                          w-full
                          flex items-center gap-3
                          px-4 py-3
                          text-left
                          text-rose-600 dark:text-rose-400
                          hover:bg-rose-50 dark:hover:bg-rose-900/20
                          border-t
                          border-gray-200/70
                          dark:border-purple-500/20
                          transition
                        "
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* =================================================
                  MOBILE MENU BUTTON
              ================================================= */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle navigation menu"
                className="
                  lg:hidden
                  p-2
                  rounded-xl
                  bg-gray-100/70
                  dark:bg-gray-800/60
                  hover:bg-gray-200
                  dark:hover:bg-gray-700
                  border
                  border-gray-200/70
                  dark:border-gray-700/40
                  transition
                "
              >
                {showMobileMenu ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </>
        ) : (
          /* =====================================================
             PUBLIC PAGE DESKTOP ACTIONS
          ===================================================== */
          <div className="hidden sm:flex items-center gap-3 md:gap-5">
            {/* Theme */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="
                p-2
                rounded-xl
                bg-gray-100/70 dark:bg-gray-800/60
                hover:bg-gray-200/70 dark:hover:bg-gray-700/70
                border border-gray-200/70 dark:border-gray-700/40
                transition
              "
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>

            <Link
              to="/login"
              className="
                text-gray-600 dark:text-gray-300
                hover:text-cyan-600 dark:hover:text-purple-400
                transition
                font-medium
              "
            >
              Login
            </Link>

            <Link
              to="/register"
              className="
                bg-gradient-to-r
                from-cyan-600 to-blue-600
                dark:from-purple-600 dark:to-purple-800
                hover:from-cyan-700 hover:to-blue-700
                dark:hover:from-purple-700 dark:hover:to-purple-900
                text-white
                px-4 md:px-5
                py-2
                rounded-xl
                transition
                shadow-lg
                shadow-cyan-600/20
                dark:shadow-purple-600/30
                font-medium
                whitespace-nowrap
              "
            >
              Get Started
            </Link>
          </div>
        )}

        {/* =====================================================
            MOBILE MENU - PROTECTED PAGES
        ===================================================== */}
        {isLoggedIn && !isPublicPage && showMobileMenu && (
          <div
            className="
              absolute
              top-16
              left-0
              right-0
              lg:hidden
              bg-white/95 dark:bg-[#0a0a1a]/95
              backdrop-blur-xl
              border-b
              border-gray-200
              dark:border-purple-500/20
              shadow-xl
              px-4
              py-4
            "
          >
            <div className="flex flex-col gap-1">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3
                      rounded-xl
                      ${activeLink("/admin")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/users"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3
                      rounded-xl
                      ${activeLink("/admin/users")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <Users className="w-5 h-5" />
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/dashboard")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/analysis"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/analysis")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <BarChart3 className="w-5 h-5" />
                    SEO Analysis
                  </Link>

                  <Link
                    to="/seo-audit"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/seo-audit")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <SearchCheck className="w-5 h-5" />
                    SEO Audit
                  </Link>

                  <Link
                    to="/performance"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/performance")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <Gauge className="w-5 h-5" />
                    Performance
                  </Link>

                  <Link
                    to="/rankings"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/rankings")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <LineChart className="w-5 h-5" />
                    Rankings
                  </Link>

                  <Link
                    to="/history"
                    onClick={handleNavigation}
                    className={`
                      flex items-center gap-3
                      px-4 py-3 rounded-xl
                      ${activeLink("/history")}
                      hover:bg-gray-100 dark:hover:bg-purple-500/10
                    `}
                  >
                    <History className="w-5 h-5" />
                    History
                  </Link>
                </>
              )}

              {/* Mobile Profile */}
              <Link
                to="/profile"
                onClick={handleNavigation}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-purple-500/10
                "
              >
                <User className="w-5 h-5 text-cyan-600 dark:text-purple-400" />
                My Profile
              </Link>

              {/* Change Password */}
              <Link
                to="/change-password"
                onClick={handleNavigation}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-purple-500/10
                "
              >
                <Key className="w-5 h-5 text-cyan-600 dark:text-purple-400" />
                Change Password
              </Link>

              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  text-left
                  text-rose-600 dark:text-rose-400
                  hover:bg-rose-50 dark:hover:bg-rose-900/20
                  border-t
                  border-gray-200
                  dark:border-purple-500/20
                  mt-2
                "
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            MOBILE MENU - PUBLIC PAGES
        ===================================================== */}
        {!isLoggedIn && isPublicPage && showMobileMenu && (
          <div
            className="
              absolute
              top-16
              left-0
              right-0
              sm:hidden
              bg-white/95 dark:bg-[#0a0a1a]/95
              backdrop-blur-xl
              border-b
              border-gray-200
              dark:border-purple-500/20
              shadow-xl
              px-4
              py-4
            "
          >
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={handleNavigation}
                className="
                  px-4 py-3
                  rounded-xl
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-purple-500/10
                  font-medium
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={handleNavigation}
                className="
                  px-4 py-3
                  rounded-xl
                  text-center
                  bg-gradient-to-r
                  from-cyan-600 to-blue-600
                  dark:from-purple-600 dark:to-purple-800
                  text-white
                  font-medium
                "
              >
                Get Started
              </Link>
            </div>
          </div>
        )}

        {/* Public Mobile Menu Button */}
        {!isLoggedIn && isPublicPage && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle navigation menu"
            className="
              sm:hidden
              p-2
              rounded-xl
              bg-gray-100/70
              dark:bg-gray-800/60
              border
              border-gray-200/70
              dark:border-gray-700/40
              transition
            "
          >
            {showMobileMenu ? (
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
}