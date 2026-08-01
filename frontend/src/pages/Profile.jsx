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
    navigate("/login");
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">

          <h1 className="text-3xl font-bold mb-2">
            My Profile
          </h1>

          <p className="text-gray-600 mb-8">
            View and manage your account details.
          </p>

          <div className="bg-white rounded-xl shadow-md p-8">

            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-4xl font-bold flex items-center justify-center">
                👤
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <label className="block font-semibold mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={user?.name || ""}
                  readOnly
                  className="w-full border rounded-lg px-4 py-3 bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full border rounded-lg px-4 py-3 bg-gray-100"
                />
              </div>

            </div>

            <div className="flex gap-4 mt-8">

              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Change Password
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
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