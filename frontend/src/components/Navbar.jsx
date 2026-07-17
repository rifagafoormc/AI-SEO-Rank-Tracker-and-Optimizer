import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">
          AI SEO Tracker
        </h1>

<div className="space-x-4">
  <Link
    to="/login"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    Login
  </Link>

  <Link
    to="/register"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    Register
  </Link>
</div>
      </div>
    </nav>
  );
}

export default Navbar;