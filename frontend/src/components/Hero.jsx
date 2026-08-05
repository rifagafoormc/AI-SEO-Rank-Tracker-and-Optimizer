import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        {/* Left - Text Content */}
        <div>
          {/* Badge */}
          <div className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            ⚡ Next-Gen SEO Tool
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
            AI-Powered SEO Rank Tracker & Optimizer
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
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
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-3.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-blue-600 dark:border-blue-400 font-medium text-center"
            >
              Login
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 10 free analyses
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> No credit card
            </span>
          </div>
        </div>

        {/* Right - Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-sm mx-auto md:mx-0 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              📊 SEO Score
            </span>
            <span className="text-2xl font-bold text-green-600">87%</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div className="bg-green-500 h-2.5 rounded-full w-[87%]"></div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Keywords</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">1,247</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Avg. Position</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">#4.8</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 dark:text-gray-400">Issues</span>
              <span className="font-semibold text-red-500">12</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;