import axios from 'axios';
import * as cheerio from 'cheerio';
import Analysis from '../models/Analysis.js';

import {
  checkKeywordRelevance,
  generateKeywordOptimization
} from '../utils/gemini.js';

const SERP_API_URL = 'https://serpapi.com/search.json';

const RESULTS_PER_PAGE = 10;
const MAX_SEARCH_DEPTH = 100;
const DEFAULT_SEARCH_DEPTH = 10;

const GOOGLE_DOMAIN = 'google.co.in';
const DEFAULT_COUNTRY = 'in';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_LOCATION = 'Kottayam, Kerala, India';
const DEFAULT_DEVICE = 'desktop';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const cleanText = (text = '') =>
  String(text).replace(/\s+/g, ' ').trim();

const normalizeDomain = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

const normalizeUrl = (url) => {
  const value = String(url || '').trim();
  const normalized = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  const parsed = new URL(normalized);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Please enter a valid HTTP or HTTPS website URL.');
  }

  return parsed.href;
};

const domainMatches = (resultUrl, targetDomain) => {
  const resultDomain = normalizeDomain(resultUrl);
  const target = String(targetDomain || '')
    .toLowerCase()
    .replace(/^www\./, '')
    .trim();

  if (!resultDomain || !target) return false;

  return (
    resultDomain === target ||
    resultDomain.endsWith(`.${target}`)
  );
};

const getAnalysisForUser = async (analysisId, userId) => {
  return Analysis.findOne({
    _id: analysisId,
    userId
  });
};

/* -------------------------------------------------------------------------- */
/* Extract Website Context                                                    */
/* -------------------------------------------------------------------------- */

const extractWebsiteContext = async (url) => {
  try {
    console.log('🌐 Extracting website context:', url);

    const response = await axios.get(url, {
      timeout: 15000,
      headers: { 'User-Agent': USER_AGENT }
    });

    const $ = cheerio.load(response.data);

    const title = cleanText($('title').first().text());

    const description = cleanText(
      $('meta[name="description"]').attr('content') || ''
    );

    const headings = [];

    $('h1, h2, h3').each((_, element) => {
      if (headings.length >= 15) return;

      const text = cleanText($(element).text());

      if (text) headings.push(text);
    });

    const bodyText = cleanText($('body').text()).slice(0, 5000);

    return {
      title,
      description,
      headings,
      bodyText
    };
  } catch (error) {
    console.error(
      '⚠️ Website context extraction failed:',
      error.response?.status || error.message
    );

    return {
      title: '',
      description: '',
      headings: [],
      bodyText: ''
    };
  }
};

/* -------------------------------------------------------------------------- */
/* Extract Detailed Ranking Page Data                                         */
/* -------------------------------------------------------------------------- */

const extractDetailedPageData = async (url, keyword = '') => {
  try {
    console.log('📄 Extracting ranking page:', url);

    const response = await axios.get(url, {
      timeout: 20000,
      headers: { 'User-Agent': USER_AGENT }
    });

    const $ = cheerio.load(response.data);

    const title = cleanText($('title').first().text());

    const metaDescription = cleanText(
      $('meta[name="description"]').attr('content') || ''
    );

    const canonical = cleanText(
      $('link[rel="canonical"]').attr('href') || ''
    );

    const robots = cleanText(
      $('meta[name="robots"]').attr('content') || ''
    );

    const viewport = cleanText(
      $('meta[name="viewport"]').attr('content') || ''
    );

    const language = cleanText(
      $('html').attr('lang') || ''
    );

    const h1 = [];
    const h2 = [];
    const h3 = [];
    const paragraphs = [];
    const imageAlts = [];
    const missingAltSamples = [];
    const internalLinks = [];
    const externalLinks = [];

    $('h1').each((_, element) => {
      if (h1.length >= 10) return;

      const text = cleanText($(element).text());
      if (text) h1.push(text);
    });

    $('h2').each((_, element) => {
      if (h2.length >= 20) return;

      const text = cleanText($(element).text());
      if (text) h2.push(text);
    });

    $('h3').each((_, element) => {
      if (h3.length >= 20) return;

      const text = cleanText($(element).text());
      if (text) h3.push(text);
    });

    $('p').each((_, element) => {
      if (paragraphs.length >= 30) return;

      const text = cleanText($(element).text());
      if (text) paragraphs.push(text);
    });

    $('img').each((_, element) => {
      if (imageAlts.length >= 30) return;

      const alt = cleanText($(element).attr('alt') || '');
      imageAlts.push(alt);

      if (!alt && missingAltSamples.length < 10) {
        missingAltSamples.push(
          cleanText($(element).attr('src') || '')
        );
      }
    });

    const baseDomain = normalizeDomain(url);

    $('a[href]').each((_, element) => {
      if (
        internalLinks.length >= 30 &&
        externalLinks.length >= 30
      ) {
        return;
      }

      const href = $(element).attr('href');
      if (!href) return;

      try {
        const absoluteUrl = new URL(href, url);
        if (!['http:', 'https:'].includes(absoluteUrl.protocol)) return;

        const link = {
          text: cleanText($(element).text()),
          url: absoluteUrl.href
        };

        const linkDomain = normalizeDomain(absoluteUrl.href);

        if (linkDomain === baseDomain) {
          if (internalLinks.length < 30) {
            internalLinks.push(link);
          }
        } else if (externalLinks.length < 30) {
          externalLinks.push(link);
        }
      } catch {
        // Ignore malformed links.
      }
    });

    const content = cleanText($('body').text()).slice(0, 10000);
    const keywordLower = String(keyword).toLowerCase().trim();

    let keywordOccurrences = 0;

    if (keywordLower) {
      const escapedKeyword = keywordLower.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      keywordOccurrences = (
        content.toLowerCase().match(
          new RegExp(escapedKeyword, 'g')
        ) || []
      ).length;
    }

    return {
      success: true,
      url,
      keyword,
      title,
      metaDescription,
      canonical,
      robots,
      viewport,
      language,
      h1,
      h2,
      h3,
      paragraphs,
      imageAlts,
      missingAltSamples,
      internalLinks,
      externalLinks,
      content,
      wordCount: content ? content.split(/\s+/).length : 0,
      totalImages: $('img').length,
      imagesWithAlt: $('img[alt]').length,
      keywordOccurrences
    };
  } catch (error) {
    const statusCode = error.response?.status;

    console.error(
      '⚠️ Ranking page extraction failed:',
      statusCode || error.message
    );

    return {
      success: false,
      errorType: statusCode === 403
        ? 'FORBIDDEN'
        : 'FETCH_FAILED',
      statusCode: statusCode || null,
      error: error.message,
      url,
      keyword
    };
  }
};

/* -------------------------------------------------------------------------- */
/* Find Rank From Google / SerpAPI                                             */
/* -------------------------------------------------------------------------- */

const findRankForKeyword = async ({
  keyword,
  domain,
  country,
  location,
  searchDepth,
  apiKey
}) => {
  const pagesToFetch = Math.ceil(
    searchDepth / RESULTS_PER_PAGE
  );

  let rank = null;
  let rankingUrl = '';
  let serpTitle = '';
  let serpSnippet = '';

  let creditsUsed = 0;
  let pagesChecked = 0;

  console.log('');
  console.log('========================================');
  console.log('🔎 SERPAPI SEARCH');
  console.log('Keyword:', keyword);
  console.log('Target domain:', domain);
  console.log('Country:', country);
  console.log('Google domain:', GOOGLE_DOMAIN);
  console.log('Language:', DEFAULT_LANGUAGE);
  console.log('Search location:', location);
  console.log('Device:', DEFAULT_DEVICE);
  console.log('Depth:', searchDepth);
  console.log('Pages:', pagesToFetch);
  console.log('========================================');

  for (
    let page = 0;
    page < pagesToFetch && rank === null;
    page++
  ) {
    const start = page * RESULTS_PER_PAGE;

    console.log('');
    console.log(
      `🚀 SERPAPI REQUEST ${page + 1}/${pagesToFetch}`
    );

    console.log('➡️ Keyword:', keyword);
    console.log('➡️ Start:', start);
    console.log('➡️ Google domain:', GOOGLE_DOMAIN);
    console.log('➡️ Country:', country);
    console.log('➡️ Location:', location);
    console.log('➡️ Device:', DEFAULT_DEVICE);

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |--------------------------------------------------------------------------
    | This is the same request structure from the previously
    | working version.
    |
    | Do NOT add num: 10 here.
    |--------------------------------------------------------------------------
    */

    const params = {
      engine: 'google',
      q: keyword,
      google_domain: GOOGLE_DOMAIN,
      gl: country || DEFAULT_COUNTRY,
      hl: DEFAULT_LANGUAGE,
      location,
      device: DEFAULT_DEVICE,
      no_cache: true,
      start,
      api_key: apiKey
    };

    console.log('📤 SerpAPI parameters:', {
      engine: params.engine,
      q: params.q,
      google_domain: params.google_domain,
      gl: params.gl,
      hl: params.hl,
      location: params.location,
      device: params.device,
      no_cache: params.no_cache,
      start: params.start
    });

    const response = await axios.get(
      SERP_API_URL,
      {
        params,
        timeout: 60000
      }
    );

    creditsUsed++;
    pagesChecked++;

    if (response.data?.error) {
      console.error(
        '❌ SERPAPI ERROR:',
        response.data.error
      );

      throw new Error(
        response.data.error
      );
    }

    const organic =
      response.data?.organic_results || [];

    console.log(
      '📄 Organic results received:',
      organic.length
    );

    /*
    |--------------------------------------------------------------------------
    | Show exactly what Google returned
    |--------------------------------------------------------------------------
    */

    organic.forEach((item, index) => {
      const position =
        Number(item.position) ||
        start + index + 1;

      console.log(
        `${position}. ${item.title || '(no title)'}`
      );

      console.log(
        '   Domain:',
        item.link
          ? normalizeDomain(item.link)
          : 'N/A'
      );

      console.log(
        '   URL:',
        item.link || 'N/A'
      );
    });

    if (organic.length === 0) {
      console.log(
        'ℹ️ No organic results returned.'
      );

      break;
    }

    /*
    |--------------------------------------------------------------------------
    | Find Target Domain
    |--------------------------------------------------------------------------
    */

    for (
      let i = 0;
      i < organic.length;
      i++
    ) {
      const item = organic[i];

      if (!item?.link) {
        continue;
      }

      const resultPosition =
        Number(item.position) ||
        start + i + 1;

      /*
      |--------------------------------------------------------------------------
      | Do not accept a result outside selected depth.
      |--------------------------------------------------------------------------
      */

      if (
        resultPosition >
        searchDepth
      ) {
        continue;
      }

      const matches =
        domainMatches(
          item.link,
          domain
        );

      console.log(
        `🔍 Checking position ${resultPosition}:`,
        normalizeDomain(item.link),
        '→',
        matches
          ? 'MATCH'
          : 'NO MATCH'
      );

      if (!matches) {
        continue;
      }

      rank =
        resultPosition;

      rankingUrl =
        item.link;

      serpTitle =
        item.title || '';

      serpSnippet =
        item.snippet || '';

      console.log('');
      console.log(
        '🎯 MATCH FOUND'
      );

      console.log(
        '🎯 Keyword:',
        keyword
      );

      console.log(
        '🎯 Rank:',
        rank
      );

      console.log(
        '🌐 Matched domain:',
        normalizeDomain(
          rankingUrl
        )
      );

      console.log(
        '🔗 Ranking URL:',
        rankingUrl
      );

      console.log(
        '📝 SERP title:',
        serpTitle
      );

      break;
    }
  }

  console.log('');
  console.log(
    `📊 FINAL RESULT: "${keyword}" → ${
      rank !== null
        ? `#${rank}`
        : 'Not Found in returned organic results'
    }`
  );

  console.log(
    '💳 Credits used for keyword:',
    creditsUsed
  );

  return {
    rank,
    rankingUrl,
    serpTitle,
    serpSnippet,
    creditsUsed,
    pagesChecked
  };
};

/* -------------------------------------------------------------------------- */
/* POST /api/analysis                                                         */
/* -------------------------------------------------------------------------- */

export const analyzeWebsite = async (req, res) => {
  try {
    console.log('');
    console.log('🔍 RANK TRACKING STARTED');
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);

    const {
      url,
      keywords,
      country,
      searchDepth,
      location
    } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Website URL is required.'
      });
    }

    let normalizedUrl;
    let domain;

    try {
      normalizedUrl = normalizeUrl(url);
      domain = normalizeDomain(normalizedUrl);

      if (!domain) throw new Error('Invalid domain');
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid website URL.'
      });
    }

    const keywordArray = Array.isArray(keywords)
      ? keywords.map((item) => String(item).trim()).filter(Boolean)
      : String(keywords || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    if (keywordArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter at least one keyword.'
      });
    }

    const selectedCountry = String(
      country || DEFAULT_COUNTRY
    ).toLowerCase();

    const requestedDepth = Number(searchDepth) || DEFAULT_SEARCH_DEPTH;

    const selectedSearchDepth = Math.min(
      Math.max(requestedDepth, RESULTS_PER_PAGE),
      MAX_SEARCH_DEPTH
    );

    const selectedLocation = String(
      location || DEFAULT_LOCATION
    ).trim();

    const serpApiKey = process.env.SERP_API_KEY;

    if (!serpApiKey) {
      return res.status(500).json({
        success: false,
        message: 'SERP_API_KEY is not configured on the server.'
      });
    }

    console.log('🌐 Website:', normalizedUrl);
    console.log('🏷️ Domain:', domain);
    console.log('🌍 Country:', selectedCountry);
    console.log('📍 Location:', selectedLocation);
    console.log('🔎 Search depth:', selectedSearchDepth);

    const results = [];
    let totalCreditsUsed = 0;

    for (const keyword of keywordArray) {
      try {
        const found = await findRankForKeyword({
          keyword,
          domain,
          country: selectedCountry,
          location: selectedLocation,
          searchDepth: selectedSearchDepth,
          apiKey: serpApiKey
        });

        totalCreditsUsed += found.creditsUsed;

        results.push({
          keyword,
          rank: found.rank !== null ? found.rank : 'Not Found',
          googlePage: found.rank
            ? Math.ceil(found.rank / RESULTS_PER_PAGE)
            : null,
          rankingUrl: found.rankingUrl || null,
          found: found.rank !== null,
          serpTitle: found.serpTitle || '',
          serpSnippet: found.serpSnippet || '',
          status: found.rank !== null
            ? 'Found'
            : 'Not Found in selected depth',
          creditsUsed: found.creditsUsed,
          pagesChecked: found.pagesChecked
        });
      } catch (error) {
        console.error(
          `❌ SerpAPI failed for "${keyword}":`,
          error.response?.data || error.message
        );

        return res.status(502).json({
          success: false,
          message: `SerpAPI search failed for keyword "${keyword}".`,
          error: error.response?.data?.error || error.message
        });
      }
    }

    const savedAnalysis = await Analysis.create({
      userId: req.userId,
      websiteUrl: normalizedUrl,
      keywords: keywordArray,
      rankingData: { results },
      status: 'completed',
      country: selectedCountry,
      searchDepth: selectedSearchDepth,
      aiSuggestions: ''
    });

    console.log('✅ Analysis saved:', savedAnalysis._id);

    return res.status(200).json({
      success: true,
      message: 'Google rank tracking completed.',
      data: {
        url: normalizedUrl,
        results,
        selectedCountry,
        selectedSearchDepth,
        searchEngine: 'Google',
        googleDomain: GOOGLE_DOMAIN,
        language: DEFAULT_LANGUAGE,
        searchLocation: selectedLocation,
        device: DEFAULT_DEVICE,
        creditsUsed: totalCreditsUsed
      },
      analysisId: savedAnalysis._id
    });
  } catch (error) {
    console.error(
      '❌ ANALYSIS CONTROLLER ERROR:',
      error.response?.data || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to complete website analysis.',
      error: error.response?.data?.error || error.message
    });
  }
};

/* -------------------------------------------------------------------------- */
/* POST /api/analysis/check-relevance                                         */
/* -------------------------------------------------------------------------- */

export const checkRelevance = async (req, res) => {
  try {
    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: 'Analysis ID is required.'
      });
    }

    const analysis = await getAnalysisForUser(
      analysisId,
      req.userId
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.'
      });
    }

    const websiteUrl = analysis.websiteUrl;

    console.log('🤖 KEYWORD RELEVANCE CHECK:', websiteUrl);

    // If the website blocks automated access, continue with empty context.
    const websiteContext = await extractWebsiteContext(websiteUrl);

    const updatedResults = [];

    for (const item of analysis.rankingData.results) {
      try {
        console.log(`🔎 Checking relevance: "${item.keyword}"`);

        const relevance = await checkKeywordRelevance({
          keyword: item.keyword,
          websiteUrl,
          websiteContext,
          rankingResult: item
        });

        updatedResults.push({
          ...item.toObject?.() ?? item,
          relevant: relevance?.relevant ?? null,
          confidence: relevance?.confidence ?? null,
          reason: relevance?.reason || '',
          relevanceStatus: relevance?.status || 'completed'
        });
      } catch (error) {
        console.error(
          `⚠️ Relevance failed for "${item.keyword}":`,
          error.message
        );

        updatedResults.push({
          ...item.toObject?.() ?? item,
          relevant: null,
          confidence: null,
          reason: 'Unable to determine relevance.',
          relevanceStatus: 'error'
        });
      }
    }

    analysis.rankingData.results = updatedResults;
    await analysis.save();

    return res.status(200).json({
      success: true,
      data: {
        results: updatedResults,
        websiteContext: {
          title: websiteContext.title,
          description: websiteContext.description,
          headings: websiteContext.headings
        }
      }
    });
  } catch (error) {
    console.error(
      '❌ Relevance controller error:',
      error.response?.data || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to check keyword relevance.',
      error: error.response?.data?.error || error.message
    });
  }
};

/* -------------------------------------------------------------------------- */
/* POST /api/analysis/optimize-keyword                                         */
/* -------------------------------------------------------------------------- */

export const optimizeKeyword = async (req, res) => {
  try {
    const {
      analysisId,
      keyword,
      rank,
      rankingUrl,
      url,
      country
    } = req.body;

    if (!analysisId || !keyword) {
      return res.status(400).json({
        success: false,
        message: 'Analysis ID and keyword are required.'
      });
    }

    const analysis = await getAnalysisForUser(
      analysisId,
      req.userId
    );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found.'
      });
    }

    const storedResult = analysis.rankingData.results.find(
      (item) =>
        String(item.keyword).toLowerCase() ===
        String(keyword).trim().toLowerCase()
    );

    const targetPage =
      rankingUrl ||
      storedResult?.rankingUrl ||
      url ||
      analysis.websiteUrl;

    let validTargetPage;

    try {
      validTargetPage = normalizeUrl(targetPage);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid ranking page URL.'
      });
    }

    console.log('🛠️ KEYWORD OPTIMIZATION');
    console.log('Keyword:', keyword);
    console.log('Rank:', rank ?? storedResult?.rank);
    console.log('Ranking page:', validTargetPage);

    const pageData = await extractDetailedPageData(
      validTargetPage,
      keyword
    );

    if (!pageData.success) {
      if (pageData.errorType === 'FORBIDDEN') {
        return res.status(422).json({
          success: false,
          message:
            'The website blocked automated page access (HTTP 403). ' +
            'The optimizer cannot safely inspect the page HTML, so it ' +
            'cannot provide verified current-versus-suggested page changes.',
          errorType: 'FORBIDDEN',
          rankingUrl: validTargetPage
        });
      }

      return res.status(422).json({
        success: false,
        message:
          'Unable to retrieve the ranking page for optimization.',
        error: pageData.error,
        rankingUrl: validTargetPage
      });
    }

    const optimization = await generateKeywordOptimization({
      keyword,
      rank: rank ?? storedResult?.rank ?? null,
      rankingUrl: validTargetPage,
      websiteUrl: analysis.websiteUrl,
      country: country || analysis.country || DEFAULT_COUNTRY,
      title: pageData.title,
      metaDescription: pageData.metaDescription,
      canonical: pageData.canonical,
      robots: pageData.robots,
      viewport: pageData.viewport,
      language: pageData.language,
      h1: pageData.h1,
      headings: {
        h2s: pageData.h2,
        h3s: pageData.h3
      },
      content: pageData.content.slice(0, 6000),
      wordCount: pageData.wordCount,
      images: {
        total: pageData.totalImages,
        withAlt: pageData.imagesWithAlt,
        missingAltSamples: pageData.missingAltSamples
      },
      internalLinks: pageData.internalLinks,
      externalLinks: pageData.externalLinks,
      keywordOccurrences: pageData.keywordOccurrences,
      serpTitle: storedResult?.serpTitle || '',
      serpSnippet: storedResult?.serpSnippet || ''
    });

    return res.status(200).json({
      success: true,
      data: {
        keyword,
        rank: rank ?? storedResult?.rank ?? null,
        rankingUrl: validTargetPage,
        current: {
          title: pageData.title,
          metaDescription: pageData.metaDescription,
          canonical: pageData.canonical,
          robots: pageData.robots,
          viewport: pageData.viewport,
          language: pageData.language,
          h1: pageData.h1,
          h2: pageData.h2,
          h3: pageData.h3,
          keywordOccurrences: pageData.keywordOccurrences,
          imageAlts: pageData.imageAlts,
          missingAltSamples: pageData.missingAltSamples,
          internalLinks: pageData.internalLinks,
          externalLinks: pageData.externalLinks,
          wordCount: pageData.wordCount
        },
        suggestions: optimization
      }
    });
  } catch (error) {
    console.error(
      '❌ KEYWORD OPTIMIZATION ERROR:',
      error.response?.data || error.message || error
    );

    return res.status(500).json({
      success: false,
      message: 'Unable to generate keyword optimization suggestions.',
      error: error.response?.data?.error || error.message
    });
  }
};