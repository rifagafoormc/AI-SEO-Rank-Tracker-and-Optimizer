import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function Analysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Pre-fill URL if coming from dashboard
  useEffect(() => {
    if (location.state?.url) {
      setUrl(location.state.url);
    }
  }, [location]);

const handleAnalyze = async () => {
  if (!url) return;

  try {
    setIsAnalyzing(true);

    const response = await axios.post(
      "http://localhost:5000/api/analysis",
      {
        url,
        keywords,
      }
    );

    console.log(response.data);

    alert("Analysis request sent successfully!");
  } catch (error) {
    console.error(error);

    alert("Analysis failed");
  } finally {
    setIsAnalyzing(false);
  }
};

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back to Dashboard */}
          <button 
            onClick={() => navigate('/dashboard')}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SEO Analysis
              </h1>
              <p className="text-gray-600 mt-1">
                Get detailed SEO insights and AI-powered recommendations
              </p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm text-blue-700">⏳ 9 analyses remaining today</span>
            </div>
          </div>

          {/* Analysis Form */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">
              Website Details
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Target Keywords
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="seo, digital marketing, react"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={!url || isAnalyzing}
                className={`px-8 py-3 rounded-lg text-white transition
                  ${!url || isAnalyzing 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
              </button>
            </div>
          </div>

          {/* Analysis Results - Your existing code */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              Analysis Result
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">SEO Score</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  87 / 100
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">PageSpeed Score</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">
                  91
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Meta Description</h3>
                <p className="text-green-600 mt-2">
                  ✔ Good
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold">Image ALT Text</h3>
                <p className="text-red-600 mt-2">
                  ✖ Missing on 5 Images
                </p>
              </div>
            </div>
            <div className="mt-8">
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
                View AI Recommendations
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}