import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="bg-blue-50 min-h-[80vh] flex items-center justify-center">
      <div className="text-center px-6">

        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          AI-Powered SEO Rank Tracker & Optimizer 
        </h1>

        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Track keyword rankings, analyze website performance,
          and receive AI-powered SEO recommendations.
        </p>

        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>

      </div>
    </section>
  );
}

export default Hero;