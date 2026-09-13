import axios from 'axios';
import * as cheerio from 'cheerio';
import Analysis from '../models/Analysis.js';
import {
  checkKeywordRelevance,
  generateSeoSuggestions
} from '../utils/gemini.js';

// 🌐 EXTRACT WEBSITE CONTEXT FUNCTION
const extractWebsiteContext = async (url) => {
  try {
    console.log('🌐 Extracting website context:', url);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    // Page title
    const title = $('title').first().text().trim();

    // Meta description
    const description =
      $('meta[name="description"]').attr('content')?.trim() || '';

    // H1 and H2 headings
    const headings = [];

    $('h1, h2').each((index, element) => {
      const heading = $(element).text().replace(/\s+/g, ' ').trim();

      if (heading) {
        headings.push(heading);
      }
    });

    // Remove unnecessary elements
    $('script, style, noscript, svg').remove();

    // Extract limited visible text
    const content = $('body')
      .text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000);

    const websiteContext = {
      title,
      description,
      headings: headings.slice(0, 20),
      content,
    };

    console.log('🌐 Website context extracted:', {
      title,
      description,
      headings: headings.slice(0, 20),
      contentLength: content.length,
    });

    return websiteContext;

  } catch (error) {
    console.error(
      '⚠️ Website context extraction failed:',
      error.message
    );

    return {
      title: '',
      description: '',
      headings: [],
      content: '',
    };
  }
};

export const analyzeWebsite = async (req, res) => {
  try {
    const { url, keywords, country, searchDepth } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Website URL is required',
      });
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    // Parse and validate keywords
    const keywordArray = keywords
      ? keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
      : [];

    // Check if we have at least one valid keyword
    if (keywordArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid keyword is required. Please enter keywords separated by commas.',
      });
    }

    const selectedCountry = country || 'in';
    const selectedSearchDepth = Number(searchDepth) || 100;

    console.log('🔍 Analyzing URL:', normalizedUrl);
    console.log('🌍 Country:', selectedCountry);
    console.log('🔎 Search Depth:', selectedSearchDepth);
    console.log('📝 Keywords:', keywordArray);

    const domain = new URL(normalizedUrl).hostname.replace('www.', '');

    const results = [];

    // Check each keyword
    for (const keyword of keywordArray) {
      console.log(`🔍 Checking keyword: ${keyword}`);
      
      const response = await axios.get(
        'https://serpapi.com/search.json',
        {
          params: {
            engine: 'google',
            q: keyword,
            gl: selectedCountry,
            hl: 'en',
            num: selectedSearchDepth,
            api_key: process.env.SERP_API_KEY,
          },
        }
      );

      const organicResults = response.data.organic_results || [];

      let rank = null;
      let serpTitle = '';
      let serpSnippet = '';

      for (const item of organicResults) {
        try {
          if (item.link?.includes(domain)) {
            rank = item.position;

            // Save Google's title and snippet as relevance evidence
            serpTitle = item.title || '';
            serpSnippet = item.snippet || '';

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
        // Used internally for AI relevance analysis
        serpTitle,
        serpSnippet,
      });
    }

    console.log('✅ SERP results:', results);

    // ====================================================
    // KEYWORD RELEVANCE CHECK
    // ====================================================

    console.log('🌐 Extracting website information for relevance check...');

    const websiteContext = await extractWebsiteContext(normalizedUrl);

    console.log('🤖 Checking keyword relevance with Gemini...');

    const relevanceResults = await checkKeywordRelevance(
      websiteContext,
      keywordArray,
      domain,
      results
    );

    console.log(
      '🤖 Keyword relevance results:',
      JSON.stringify(relevanceResults, null, 2)
    );

    // ====================================================
    // COMBINE RANKING + RELEVANCE DATA
    // ====================================================

    for (const result of results) {
      const relevance = relevanceResults.find(
        (item) =>
          item.keyword.toLowerCase().trim() ===
          result.keyword.toLowerCase().trim()
      );

      if (relevance) {
        result.relevant = relevance.relevant;
        result.relevanceConfidence = relevance.confidence;
        result.relevanceReason = relevance.reason;

        // Three-state logic for optimization status
        if (relevance.relevant === true) {
          result.optimizationStatus = 'needs_optimization';
        } else if (relevance.relevant === false) {
          result.optimizationStatus = 'optimization_skipped';
        } else {
          result.optimizationStatus = 'relevance_unknown';
        }
      } else {
        result.relevant = null;
        result.relevanceConfidence = 0;
        result.relevanceReason =
          'Relevance information was not available.';
        result.optimizationStatus = 'relevance_unknown';
      }
    }

    // ✅ REMOVE INTERNAL SERP EVIDENCE BEFORE SENDING TO FRONTEND
    results.forEach((result) => {
      delete result.serpTitle;
      delete result.serpSnippet;
    });

    console.log(
      '✅ Results with relevance (cleaned):',
      JSON.stringify(results, null, 2)
    );

    // GENERATE AI SEO SUGGESTIONS
    console.log('🤖 Generating AI suggestions...');
    const aiSuggestions = await generateSeoSuggestions(
      normalizedUrl,
      results
    );

    // ✅ SAVE TO MONGODB
    const savedAnalysis = await Analysis.create({
      userId: req.userId,
      websiteUrl: normalizedUrl,
      keywords: keywordArray,
      rankingData: {
        results,
      },
      websiteContext: {
        title: websiteContext.title,
        description: websiteContext.description,
        headings: websiteContext.headings,
        contentPreview: websiteContext.content.slice(0, 500),
      },
      aiSuggestions,
      status: 'completed',
      country: selectedCountry,
      searchDepth: selectedSearchDepth,
    });

    console.log('✅ Analysis saved with ID:', savedAnalysis._id);
    console.log('✅ Saved with country:', savedAnalysis.country);
    console.log('✅ Saved with searchDepth:', savedAnalysis.searchDepth);

    // 🚀 RETURN ALL DATA
    res.status(200).json({
      success: true,
      message: 'Real Google rank tracking completed',
      data: {
        url: normalizedUrl,
        results,
        aiSuggestions,
        selectedCountry: selectedCountry,
        selectedSearchDepth: selectedSearchDepth,
        websiteContext: {
          title: websiteContext.title,
          description: websiteContext.description,
          headings: websiteContext.headings,
        },
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