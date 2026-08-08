import axios from 'axios';
import Analysis from '../models/Analysis.js';
import { generateSeoSuggestions } from '../utils/gemini.js';

export const analyzeWebsite = async (req, res) => {
  try {
    const { url, keywords } = req.body;

    // Validate input
    if (!url || !keywords) {
      return res.status(400).json({
        success: false,
        message: 'Website URL and keywords are required',
      });
    }

    // Convert keywords into array
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // Add https:// automatically if missing
    const normalizedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    // Extract domain
    const domain = new URL(normalizedUrl).hostname.replace('www.', '');

    const results = [];

    // Check each keyword
    for (const keyword of keywordArray) {
      const response = await axios.get(
        'https://serpapi.com/search.json',
        {
          params: {
            engine: 'google',
            q: keyword,
            gl: 'in',
            hl: 'en',
            num: 100,
            api_key: process.env.SERP_API_KEY,
          },
        }
      );

      const organicResults = response.data.organic_results || [];

      let rank = null;

      for (const item of organicResults) {
        try {
          if (item.link.includes(domain)) {
            rank = item.position;
            break;
          }
        } catch (err) {
          console.log(err.message);
        }
      }

      results.push({
        keyword,
        rank: rank || 'Not Found',
        page: rank ? Math.ceil(rank / 10) : '-',
        found: !!rank,
      });
    }

    // GENERATE AI SEO SUGGESTIONS
    const aiSuggestions = await generateSeoSuggestions(
      normalizedUrl,
      results
    );

    // ✅ SAVE TO MONGODB - FIXED: Use req.userId instead of req.user.id
    const savedAnalysis = await Analysis.create({
      userId: req.userId,  // ✅ This is the fix
      websiteUrl: normalizedUrl,
      keywords: keywordArray,
      rankingData: {
        results,
      },
      aiSuggestions,
      status: 'completed',
    });

    res.status(200).json({
      success: true,
      message: 'Real Google rank tracking completed',
      data: {
        url: normalizedUrl,
        results,
        aiSuggestions,
      },
      analysisId: savedAnalysis._id,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Rank tracking failed',
    });
  }
};