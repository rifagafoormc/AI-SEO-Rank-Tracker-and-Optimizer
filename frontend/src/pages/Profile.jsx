import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  // Get user from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); // ✅ Redirects to landing page
  };

  return (
    <>
      <Navbar />
      
      {/* ✅ 1. Outer Background: Lighter dark gray */}
      <div className="min-h-screen bg-gray-100 dark:bg-[#1e293b] transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-8">

          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            My Profile
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            View and manage your account details.
          </p>

          {/* ✅ 2. Card: Darker dark gray */}
          <div className="bg-white dark:bg-[#0f172a] rounded-xl shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700/30 p-8 transition-colors duration-300">

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-600 dark:bg-blue-500 text-white text-4xl font-bold flex items-center justify-center shadow-md">
                👤
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full border rounded-lg px-4 py-3 bg-gray-100 dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full border rounded-lg px-4 py-3 bg-gray-100 dark:bg-[#1e293b] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                />
              </div>

            </div>

            <div className="flex gap-4 mt-8">

              <button
                onClick={() => navigate("/change-password")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 transition"
              >
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}