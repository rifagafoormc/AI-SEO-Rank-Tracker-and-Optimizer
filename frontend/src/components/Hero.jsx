import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Text Content */}
        <div>
          {/* Badge */}
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            ⚡ Next-Gen SEO Tool
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
            AI-Powered SEO Rank Tracker & Optimizer
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Track keyword rankings, analyze website performance,
            and receive AI-powered SEO recommendations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3.5 rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl font-medium text-center"
            >
              Get Started Free →
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3.5 rounded-lg hover:bg-gray-50 transition border border-blue-600 font-medium text-center"
            >
              Login
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 10 free analyses
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> No credit card
            </span>
          </div>
        </div>

        {/* Right - Stats Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto md:mx-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600">📊 SEO Score</span>
            <span className="text-2xl font-bold text-green-600">87%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div className="bg-green-500 h-2.5 rounded-full w-[87%]"></div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Keywords</span>
              <span className="font-semibold text-gray-800">1,247</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Avg. Position</span>
              <span className="font-semibold text-gray-800">#4.8</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Issues</span>
              <span className="font-semibold text-red-500">12</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;