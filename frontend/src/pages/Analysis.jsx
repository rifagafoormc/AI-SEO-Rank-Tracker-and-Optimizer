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
  const [result, setResult] = useState(null);

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
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log(response.data);

    setResult(response.data.data);

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

          <div className="bg-white rounded-xl shadow-md p-6">
  <h2 className="text-xl font-semibold mb-6">
    Rank Tracking Result
  </h2>

  {!result ? (
    <p className="text-gray-500">
      No tracking data yet. Enter a website and keywords.
    </p>
  ) : (
    <>
      <div className="mb-6">
        <p className="font-medium text-gray-700">Website</p>
        <p className="text-blue-600 break-all">{result.url}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3">Keyword</th>
              <th className="text-left p-3">Google Rank</th>
              <th className="text-left p-3">Page</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {result.results.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{item.keyword}</td>
                <td className="p-3 text-blue-600 font-bold">#{item.rank}</td>
                <td className="p-3">{item.page}</td>
                <td className="p-3">
                  {item.found ? (
                    <span className="text-green-600 font-medium">Found</span>
                  ) : (
                    <span className="text-red-600 font-medium">Not Found</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
          View AI Optimization Suggestions
        </button>
      </div>
    </>
  )}
</div>
        </div>
      </div>
    </>
  );
}