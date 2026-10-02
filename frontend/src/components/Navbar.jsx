import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  /* ------------------------------------------------------------
     Re-sync auth state on every route change.

     Fixes: after logging in, the Navbar would still show the
     public "Login / Get Started" state on /dashboard or /history
     because the component stayed mounted and never re-read
     localStorage.
  ------------------------------------------------------------ */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);

    // Close any open menus on route change
    setShowProfile(false);
    setShowMobileMenu(false);
  }, [location.pathname]);

  const isLoggedIn = !!token;
  const isAdmin = user?.role === "admin";

  const publicRoutes = ["/", "/login", "/register"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  // Active link — darker caramel in dark mode, so it reads on the warm bg
  const activeLink = (path) =>
    location.pathname === path
      ? "text-[#7A5236] dark:text-[#D4B59E] font-semibold"
      : "text-gray-600 dark:text-gray-300 hover:text-[#7A5236] dark:hover:text-[#D4B59E] transition";

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
        bg-white/90 dark:bg-[#1A0F0A]/90
        backdrop-blur-xl
        border-b border-gray-200/70 dark:border-[#7A5236]/20
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
        {/* LOGO */}
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
            from-[#7A5236] via-[#A47551] to-[#D4B59E]
            bg-clip-text text-transparent
            hover:opacity-80
            transition
          "
        >
          AI SEO Rank Tracker
        </Link>

        {/* DESKTOP NAVIGATION */}
        {isLoggedIn && !isPublicPage ? (
          <>
            <div className="hidden lg:flex items-center gap-5 xl:gap-7">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 ${activeLink("/admin")}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>

                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1.5 ${activeLink("/admin/users")}`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-1.5 ${activeLink("/dashboard")}`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    to="/analysis"
                    className={`flex items-center gap-1.5 ${activeLink("/analysis")}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    SEO Analysis
                  </Link>

                  <Link
                    to="/seo-audit"
                    className={`flex items-center gap-1.5 ${activeLink("/seo-audit")}`}
                  >
                    <SearchCheck className="w-4 h-4" />
                    SEO Audit
                  </Link>

                  <Link
                    to="/performance"
                    className={`flex items-center gap-1.5 ${activeLink("/performance")}`}
                  >
                    <Gauge className="w-4 h-4" />
                    Performance
                  </Link>

                  <Link
                    to="/rankings"
                    className={`flex items-center gap-1.5 ${activeLink("/rankings")}`}
                  >
                    <LineChart className="w-4 h-4" />
                    Rankings
                  </Link>

                  <Link
                    to="/history"
                    className={`flex items-center gap-1.5 ${activeLink("/history")}`}
                  >
                    <History className="w-4 h-4" />
                    History
                  </Link>
                </>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="
                  p-2 sm:p-2.5
                  rounded-xl
                  bg-gray-100/70 dark:bg-white/[0.04]
                  hover:bg-gray-200/70 dark:hover:bg-white/[0.08]
                  border border-gray-200/70 dark:border-white/10
                  hover:scale-105
                  transition
                "
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4B59E]" />
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
                    from-[#7A5236] to-[#A47551]
                    text-white
                    text-sm sm:text-base
                    font-semibold
                    flex items-center justify-center
                    hover:scale-105
                    transition
                    shadow-lg
                    shadow-[#7A5236]/40
                  "
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "👤"}
                </button>

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
                        bg-white/95 dark:bg-[#251710]/95
                        backdrop-blur-xl
                        rounded-2xl
                        shadow-2xl
                        border
                        border-gray-200/70
                        dark:border-[#7A5236]/25
                        z-50
                        overflow-hidden
                      "
                    >
                      <div
                        className="
                          px-4 py-4
                          border-b
                          border-gray-200/70
                          dark:border-[#7A5236]/25
                        "
                      >
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {user?.name || "User"}
                        </p>

                        <p className="text-sm text-gray-500 dark:text-[#D4B59E]/60 truncate">
                          {user?.email || ""}
                        </p>

                        {isAdmin && (
                          <span
                            className="
                              inline-flex items-center gap-1
                              mt-2
                              text-xs
                              bg-[#7A5236]/15
                              text-[#D4B59E]
                              px-2 py-1
                              rounded-full
                              border
                              border-[#7A5236]/30
                            "
                          >
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            onClick={handleNavigation}
                            className="
                              flex items-center gap-3
                              px-4 py-3
                              text-gray-700 dark:text-gray-300
                              hover:bg-[#7A5236]/15
                              transition
                            "
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#A47551]" />
                            Admin Dashboard
                          </Link>

                          <Link
                            to="/admin/users"
                            onClick={handleNavigation}
                            className="
                              flex items-center gap-3
                              px-4 py-3
                              text-gray-700 dark:text-gray-300
                              hover:bg-[#7A5236]/15
                              transition
                            "
                          >
                            <Users className="w-4 h-4 text-[#A47551]" />
                            Manage Users
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={handleNavigation}
                        className="
                          flex items-center gap-3
                          px-4 py-3
                          text-gray-700 dark:text-gray-300
                          hover:bg-[#7A5236]/15
                          transition
                        "
                      >
                        <User className="w-4 h-4 text-[#A47551]" />
                        My Profile
                      </Link>

                      <Link
                        to="/change-password"
                        onClick={handleNavigation}
                        className="
                          flex items-center gap-3
                          px-4 py-3
                          text-gray-700 dark:text-gray-300
                          hover:bg-[#7A5236]/15
                          transition
                        "
                      >
                        <Key className="w-4 h-4 text-[#A47551]" />
                        Change Password
                      </Link>

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
                          dark:border-[#7A5236]/25
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle navigation menu"
                className="
                  lg:hidden
                  p-2
                  rounded-xl
                  bg-gray-100/70
                  dark:bg-white/[0.04]
                  hover:bg-gray-200
                  dark:hover:bg-white/[0.08]
                  border
                  border-gray-200/70
                  dark:border-white/10
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
          /* PUBLIC PAGE DESKTOP ACTIONS */
          <div className="hidden sm:flex items-center gap-3 md:gap-5">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="
                p-2
                rounded-xl
                bg-gray-100/70 dark:bg-white/[0.04]
                hover:bg-gray-200/70 dark:hover:bg-white/[0.08]
                border border-gray-200/70 dark:border-white/10
                transition
              "
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#D4B59E]" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700" />
              )}
            </button>

            <Link
              to="/login"
              className="
                text-gray-600 dark:text-gray-300
                hover:text-[#7A5236] dark:hover:text-[#D4B59E]
                transition
                font-medium
              "
            >
              Login
            </Link>

            <Link
              to="/register"
              className="
                bg-[#7A5236]
                hover:bg-[#5E3E28]
                text-white
                px-4 md:px-5
                py-2
                rounded-xl
                transition
                shadow-lg
                shadow-[#7A5236]/40
                font-medium
                whitespace-nowrap
              "
            >
              Get Started
            </Link>
          </div>
        )}

        {/* MOBILE MENU - PROTECTED PAGES */}
        {isLoggedIn && !isPublicPage && showMobileMenu && (
          <div
            className="
              absolute
              top-16
              left-0
              right-0
              lg:hidden
              bg-white/95 dark:bg-[#251710]/95
              backdrop-blur-xl
              border-b
              border-gray-200
              dark:border-[#7A5236]/25
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                      hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
                    `}
                  >
                    <History className="w-5 h-5" />
                    History
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                onClick={handleNavigation}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
                "
              >
                <User className="w-5 h-5 text-[#A47551]" />
                My Profile
              </Link>

              <Link
                to="/change-password"
                onClick={handleNavigation}
                className="
                  flex items-center gap-3
                  px-4 py-3
                  rounded-xl
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
                "
              >
                <Key className="w-5 h-5 text-[#A47551]" />
                Change Password
              </Link>

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
                  dark:border-[#7A5236]/25
                  mt-2
                "
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* MOBILE MENU - PUBLIC PAGES */}
        {!isLoggedIn && isPublicPage && showMobileMenu && (
          <div
            className="
              absolute
              top-16
              left-0
              right-0
              sm:hidden
              bg-white/95 dark:bg-[#251710]/95
              backdrop-blur-xl
              border-b
              border-gray-200
              dark:border-[#7A5236]/25
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
                  hover:bg-gray-100 dark:hover:bg-[#7A5236]/15
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
                  bg-[#7A5236]
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
              dark:bg-white/[0.04]
              border
              border-gray-200/70
              dark:border-white/10
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