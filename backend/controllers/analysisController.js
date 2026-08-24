import axios from 'axios';
import Analysis from '../models/Analysis.js';
import { generateSeoSuggestions } from '../utils/gemini.js';

export const analyzeWebsite = async (req, res) => {
  try {
    // ✅ UPDATED: Added country and searchDepth to destructuring
    const { url, keywords, country, searchDepth } = req.body;

    // Validate input
    if (!url || !keywords) {
      return res.status(400).json({
        success: false,
        message: 'Website URL and keywords are required',
      });
    }

    // ✅ NEW: Set default values for country and search depth
    const selectedCountry = country || 'in';
    const selectedSearchDepth = Number(searchDepth) || 100;

    // Convert keywords into array
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // Add https:// automatically if missing
    const normalizedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    // ✅ UPDATED: Added logging for new parameters
    console.log('🔍 Analyzing URL:', normalizedUrl);
    console.log('🌍 Country:', selectedCountry);
    console.log('🔎 Search Depth:', selectedSearchDepth);

    // Extract domain
    const domain = new URL(normalizedUrl).hostname.replace('www.', '');

    const results = [];

    // Check each keyword
    for (const keyword of keywordArray) {
      console.log(`🔍 Checking keyword: ${keyword}`);
      
      // ✅ UPDATED: Using dynamic country and search depth values
      const response = await axios.get(
        'https://serpapi.com/search.json',
        {
          params: {
            engine: 'google',
            q: keyword,
            gl: selectedCountry,        // ✅ Dynamic country
            hl: 'en',
            num: selectedSearchDepth,   // ✅ Dynamic search depth
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

    console.log('✅ SERP results:', results);

    // 🚀 FETCH PAGESPEED INSIGHTS DATA - Only Performance metrics
    let pageSpeedData = {
      performance: null,
      lcp: null,
      cls: null,
      tbt: null,
      fcp: null,
    };

    try {
      console.log('🚀 Fetching PageSpeed data for:', normalizedUrl);
      
      const pageSpeedResponse = await axios.get(
        'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
        {
          params: {
            url: normalizedUrl,
            key: process.env.GOOGLE_PAGESPEED_API_KEY,
            strategy: 'desktop',
          },
          paramsSerializer: (params) => {
            return [
              `url=${encodeURIComponent(params.url)}`,
              `key=${params.key}`,
              `strategy=${params.strategy}`,
              'category=performance',
            ].join('&');
          },
        }
      );

      const lighthouseResult = pageSpeedResponse.data.lighthouseResult;
      
      if (lighthouseResult) {
        const categories = lighthouseResult.categories;
        
        console.log('📊 Lighthouse categories:', Object.keys(categories));

        // ✅ Only extract Performance score
        pageSpeedData.performance = categories.performance?.score != null
          ? Math.round(categories.performance.score * 100)
          : null;

        // Extract Core Web Vitals from audits
        const audits = lighthouseResult.audits;
        
        // LCP (Largest Contentful Paint)
        if (audits['largest-contentful-paint']) {
          pageSpeedData.lcp = audits['largest-contentful-paint'].displayValue || 
                             `${(audits['largest-contentful-paint'].numericValue / 1000).toFixed(1)}s`;
        }

        // CLS (Cumulative Layout Shift)
        if (audits['cumulative-layout-shift']) {
          pageSpeedData.cls = audits['cumulative-layout-shift'].displayValue || 
                             audits['cumulative-layout-shift'].numericValue?.toFixed(2) || '0.00';
        }

        // TBT (Total Blocking Time)
        if (audits['total-blocking-time']) {
          pageSpeedData.tbt = audits['total-blocking-time'].displayValue || 
                             `${Math.round(audits['total-blocking-time'].numericValue || 0)}ms`;
        }

        // FCP (First Contentful Paint)
        if (audits['first-contentful-paint']) {
          pageSpeedData.fcp = audits['first-contentful-paint'].displayValue || 
                             `${(audits['first-contentful-paint'].numericValue / 1000).toFixed(1)}s`;
        }
      }

      console.log('✅ PageSpeed Data fetched successfully:', pageSpeedData);

    } catch (pageSpeedError) {
      console.error(
        '⚠️ PageSpeed API Error:',
        pageSpeedError.response?.data || pageSpeedError.message
      );

      // Keep values null if API fails
      pageSpeedData = {
        performance: null,
        lcp: null,
        cls: null,
        tbt: null,
        fcp: null,
      };
    }

    // GENERATE AI SEO SUGGESTIONS
    console.log('🤖 Generating AI suggestions...');
    const aiSuggestions = await generateSeoSuggestions(
      normalizedUrl,
      results,
      pageSpeedData
    );

    // 🔥 CRITICAL DEBUG: Log before saving
    console.log('🔥 FINAL pageSpeedData BEFORE SAVE:', JSON.stringify(pageSpeedData, null, 2));

    // ✅ SAVE TO MONGODB - Updated to include country and searchDepth
    const savedAnalysis = await Analysis.create({
      userId: req.userId,
      websiteUrl: normalizedUrl,
      keywords: keywordArray,
      rankingData: {
        results,
      },
      pageSpeedData: pageSpeedData,
      aiSuggestions,
      status: 'completed',
      // ✅ NEW: Save the selected parameters
      country: selectedCountry,
      searchDepth: selectedSearchDepth,
    });

    console.log('✅ Analysis saved with ID:', savedAnalysis._id);
    console.log('✅ Saved pageSpeedData:', savedAnalysis.pageSpeedData);
    console.log('✅ Saved with country:', savedAnalysis.country);
    console.log('✅ Saved with searchDepth:', savedAnalysis.searchDepth);

    // 🚀 RETURN ALL DATA INCLUDING PAGESPEED AND SELECTED PARAMETERS
    res.status(200).json({
      success: true,
      message: 'Real Google rank tracking completed with PageSpeed data',
      data: {
        url: normalizedUrl,
        results,
        aiSuggestions,
        // Only Performance metrics
        performance: pageSpeedData.performance,
        lcp: pageSpeedData.lcp,
        cls: pageSpeedData.cls,
        tbt: pageSpeedData.tbt,
        fcp: pageSpeedData.fcp,
        // ✅ NEW: Include selected parameters in response
        selectedCountry: selectedCountry,
        selectedSearchDepth: selectedSearchDepth,
      },
      analysisId: savedAnalysis._id,
    });

  } catch (error) {
    console.error('❌ Error in analyzeWebsite:', error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Rank tracking failed',
    });
  }
};