// analysisController.js

import axios from 'axios';
import * as cheerio from 'cheerio';
import Analysis from '../models/Analysis.js';
import {
  checkKeywordRelevance,
  generateKeywordOptimization
} from '../utils/gemini.js';

/* ============================================================
   🌐 EXTRACT WEBSITE CONTEXT (title, meta, headings, body text)
   ============================================================ */
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

    const title = $('title').first().text().trim();

    const description =
      $('meta[name="description"]').attr('content')?.trim() || '';

    const headings = [];

    $('h1, h2').each((index, element) => {
      const heading = $(element).text().replace(/\s+/g, ' ').trim();
      if (heading) {
        headings.push(heading);
      }
    });

    $('script, style, noscript, svg').remove();

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

/* ============================================================
   🔎 EXTRACT DETAILED PAGE DATA (for keyword optimization)
   ============================================================ */
const extractDetailedPageData = async (url, keyword = '') => {
  try {
    console.log('🔎 Extracting detailed page data:', url);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });

    const $ = cheerio.load(response.data);

    const title = $('title').first().text().trim();
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() || '';
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    const robots = $('meta[name="robots"]').attr('content') || '';
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const language = $('html').attr('lang') || '';

    const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
    const h2s = [];
    $('h2').each((_, el) => {
      const t = $(el).text().replace(/\s+/g, ' ').trim();
      if (t) h2s.push(t);
    });
    const h3s = [];
    $('h3').each((_, el) => {
      const t = $(el).text().replace(/\s+/g, ' ').trim();
      if (t) h3s.push(t);
    });

    $('script, style, noscript, svg').remove();
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = content ? content.split(/\s+/).length : 0;

    let totalImages = 0;
    let imagesWithAlt = 0;
    const missingAltSamples = [];

    $('img').each((_, el) => {
      totalImages++;
      const alt = $(el).attr('alt');
      if (alt && alt.trim()) {
        imagesWithAlt++;
      } else if (missingAltSamples.length < 5) {
        missingAltSamples.push($(el).attr('src') || '(no src)');
      }
    });

    let internalLinks = 0;
    let externalLinks = 0;
    const hostname = new URL(url).hostname;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.startsWith('#') || href.startsWith('javascript:')) return;
      if (href.startsWith('/') || href.includes(hostname)) {
        internalLinks++;
      } else if (href.startsWith('http')) {
        externalLinks++;
      }
    });

    let keywordOccurrences = 0;
    if (keyword) {
      const lowerContent = content.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      let idx = lowerContent.indexOf(lowerKeyword);
      while (idx !== -1) {
        keywordOccurrences++;
        idx = lowerContent.indexOf(lowerKeyword, idx + lowerKeyword.length);
      }
    }

    return {
      title,
      metaDescription,
      canonical,
      robots,
      viewport,
      language,
      h1,
      h2s,
      h3s,
      content,
      wordCount,
      totalImages,
      imagesWithAlt,
      missingAltSamples,
      internalLinks,
      externalLinks,
      keywordOccurrences,
    };

  } catch (error) {
    console.error('⚠️ Detailed page data extraction failed:', error.message);
    return null;
  }
};

/* ============================================================
   📊 ANALYZE WEBSITE — Rank tracking ONLY (no Gemini here)
   ============================================================ */
export const analyzeWebsite = async (req, res) => {
  try {
    const { url, keywords, country, searchDepth } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Website URL is required',
      });
    }

    const normalizedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    const keywordArray = keywords
      ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [];

    if (keywordArray.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'At least one valid keyword is required. Please enter keywords separated by commas.',
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
      let rankingUrl = '';
      let serpTitle = '';
      let serpSnippet = '';

      for (const item of organicResults) {
        try {
          if (item.link?.includes(domain)) {
            rank = item.position;
            rankingUrl = item.link;
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
        googlePage: rank ? Math.ceil(rank / 10) : null,
        rankingUrl: rankingUrl || null,
        found: !!rank,
        // ✅ Keep SERP evidence — the optimizer needs it later
        serpTitle,
        serpSnippet,
      });
    }

    console.log('✅ SERP results:', results);

    // Save analysis with ranking only
    const savedAnalysis = await Analysis.create({
      userId: req.userId,
      websiteUrl: normalizedUrl,
      keywords: keywordArray,
      rankingData: {
        results,
      },
      status: 'completed',
      country: selectedCountry,
      searchDepth: selectedSearchDepth,
      aiSuggestions: '',
    });

    console.log('✅ Analysis saved with ID:', savedAnalysis._id);

    res.status(200).json({
      success: true,
      message: 'Real Google rank tracking completed',
      data: {
        url: normalizedUrl,
        results,
        selectedCountry,
        selectedSearchDepth,
      },
      analysisId: savedAnalysis._id,
    });

  } catch (error) {
    console.error(
      '❌ Error in analyzeWebsite:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: 'Rank tracking failed',
    });
  }
};

/* ============================================================
   🤖 CHECK KEYWORD RELEVANCE (on-demand, user-triggered)
   ============================================================ */
export const checkRelevance = async (req, res) => {
  try {
    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: 'analysisId is required',
      });
    }

    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    if (String(analysis.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to check this analysis',
      });
    }

    const normalizedUrl = analysis.websiteUrl;
    const domain = new URL(normalizedUrl).hostname.replace('www.', '');

    console.log('🌐 Extracting website information for relevance check...');
    const websiteContext = await extractWebsiteContext(normalizedUrl);

    console.log('🤖 Checking keyword relevance with Gemini...');
    const relevanceResults = await checkKeywordRelevance(
      websiteContext,
      analysis.keywords,
      domain,
      analysis.rankingData.results
    );

    console.log(
      '🤖 Keyword relevance results:',
      JSON.stringify(relevanceResults, null, 2)
    );

    const results = analysis.rankingData.results.map((result) => {
      const relevance = relevanceResults.find(
        (item) =>
          item.keyword.toLowerCase().trim() ===
          result.keyword.toLowerCase().trim()
      );

      if (!relevance) {
        return {
          ...result.toObject?.() ?? result,
          relevant: null,
          relevanceConfidence: 0,
          relevanceReason: 'Relevance information was not available.',
          optimizationStatus: 'relevance_unknown',
        };
      }

      return {
        ...result.toObject?.() ?? result,
        relevant: relevance.relevant,
        relevanceConfidence: relevance.confidence,
        relevanceReason: relevance.reason,
        optimizationStatus:
          relevance.relevant === true
            ? 'needs_optimization'
            : relevance.relevant === false
            ? 'optimization_skipped'
            : 'relevance_unknown',
      };
    });

    analysis.rankingData.results = results;

    analysis.websiteContext = {
      title: websiteContext.title,
      description: websiteContext.description,
      headings: websiteContext.headings,
      contentPreview: websiteContext.content.slice(0, 500),
    };

    await analysis.save();

    return res.status(200).json({
      success: true,
      message: 'Keyword relevance checked',
      data: {
        results,
      },
    });

  } catch (error) {
    console.error(
      '❌ Error checking keyword relevance:',
      error.response?.data || error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Keyword relevance check failed',
    });
  }
};

/* ============================================================
   ✨ OPTIMIZE A SINGLE KEYWORD
   ============================================================ */
export const optimizeKeyword = async (req, res) => {
  try {
    const {
      analysisId,
      keyword,
      rank,
      rankingUrl,
      url,
      country,
    } = req.body;

    if (!analysisId || !keyword) {
      return res.status(400).json({
        success: false,
        message: 'analysisId and keyword are required',
      });
    }

    const analysis = await Analysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found',
      });
    }

    if (String(analysis.userId) !== String(req.userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to optimize this analysis',
      });
    }

    const websiteUrl = url || analysis.websiteUrl;
    const targetPage = rankingUrl || websiteUrl;

    const storedResult = analysis.rankingData?.results?.find(
      (r) =>
        r.keyword.toLowerCase().trim() ===
        keyword.toLowerCase().trim()
    );

    console.log('🔎 Extracting detailed page data for optimization...');
    const pageData = await extractDetailedPageData(targetPage, keyword);

    if (!pageData) {
      return res.status(502).json({
        success: false,
        message:
          'Unable to fetch the ranking page for optimization. Please try again later.',
      });
    }

    const optimizationPayload = {
      keyword,
      currentRank: rank ?? storedResult?.rank ?? 'Not Found',
      targetPage,
      title: pageData.title,
      metaDescription: pageData.metaDescription,
      h1: pageData.h1,
      headings: {
        h2s: pageData.h2s,
        h3s: pageData.h3s,
      },
      content: pageData.content.slice(0, 6000),
      wordCount: pageData.wordCount,
      images: {
        total: pageData.totalImages,
        withAlt: pageData.imagesWithAlt,
        missingAltSamples: pageData.missingAltSamples,
      },
      internalLinks: pageData.internalLinks,
      externalLinks: pageData.externalLinks,
      keywordOccurrences: pageData.keywordOccurrences,
      serpTitle: storedResult?.serpTitle || '',
      serpSnippet: storedResult?.serpSnippet || '',
      canonical: pageData.canonical,
      robots: pageData.robots,
      viewport: pageData.viewport,
      language: pageData.language,
    };

    console.log('🤖 Generating keyword-specific optimization...');
    const optimization = await generateKeywordOptimization(
      optimizationPayload
    );

    return res.status(200).json({
      success: true,
      message: 'Keyword optimization generated',
      data: optimization,
    });

  } catch (error) {
    console.error(
      '❌ Error in optimizeKeyword:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: 'Keyword optimization failed',
    });
  }
};