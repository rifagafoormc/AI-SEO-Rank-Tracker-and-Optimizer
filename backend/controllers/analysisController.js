import axios from 'axios';
import * as cheerio from 'cheerio';

import Analysis from '../models/Analysis.js';

import {
  checkKeywordRelevance,
  generateKeywordOptimization
} from '../utils/gemini.js';

/* ------------------------------------------------------------------ */
/* TEMPORARY — remove after confirming .env loads correctly            */
/* ------------------------------------------------------------------ */

console.log('🔧 ENV CHECK:', {
  SERP_LOCATION: process.env.SERP_LOCATION,
  SERP_NO_CACHE: process.env.SERP_NO_CACHE,
  HAS_SERP_KEY: Boolean(process.env.SERP_API_KEY)
});

/* ------------------------------------------------------------------ */

const SERP_API_URL = 'https://serpapi.com/search.json';

const RESULTS_PER_PAGE = 10;
const MAX_SEARCH_DEPTH = 100;
const DEFAULT_SEARCH_DEPTH = 10;

const GOOGLE_DOMAIN = 'google.co.in';
const DEFAULT_COUNTRY = 'in';
const DEFAULT_LANGUAGE = 'en';

/*
 * Fixed default Google search location.
 *
 * Set in .env:
 * SERP_LOCATION=Kottayam, Kerala, India
 */
const DEFAULT_LOCATION = process.env.SERP_LOCATION || '';

const DEFAULT_DEVICE = 'desktop';

const SERP_NO_CACHE =
  process.env.SERP_NO_CACHE === 'true';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

/* ==========================================================================
   HELPERS
========================================================================== */

const cleanText = (text = '') =>
  String(text)
    .replace(/\s+/g, ' ')
    .trim();

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getMetaDescription = ($) => {
  const found = {};

  $('meta').each((_, el) => {
    const key = (
      $(el).attr('name') ||
      $(el).attr('property') ||
      ''
    ).toLowerCase();

    const content = cleanText(
      $(el).attr('content') || ''
    );

    if (content && !found[key]) {
      found[key] = content;
    }
  });

  return (
    found.description ||
    found['og:description'] ||
    found['twitter:description'] ||
    ''
  );
};

const normalizeDomain = (value) => {
  try {
    let input = String(value || '').trim();

    if (!input) return '';

    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`;
    }

    return new URL(input)
      .hostname
      .toLowerCase()
      .replace(/^www\./, '');
  } catch {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0];
  }
};

const normalizeUrl = (url) => {
  const value = String(url || '').trim();

  if (!value) {
    throw new Error('URL is required.');
  }

  const normalized =
    /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

  const parsed = new URL(normalized);

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(
      'Please enter a valid HTTP or HTTPS website URL.'
    );
  }

  return parsed.href;
};

const domainMatches = (
  resultDomain,
  targetDomain
) => {
  const result = normalizeDomain(resultDomain);
  const target = normalizeDomain(targetDomain);

  if (!result || !target) return false;

  return (
    result === target ||
    result.endsWith(`.${target}`)
  );
};

const getAnalysisForUser = async (
  analysisId,
  userId
) =>
  Analysis.findOne({
    _id: analysisId,
    userId
  });

/* ==========================================================================
   WEBSITE CONTEXT
========================================================================== */

const extractWebsiteContext = async (url) => {
  try {
    console.log(
      '🌐 Extracting website context:',
      url
    );

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    const $ = cheerio.load(response.data);

    const title = cleanText(
      $('title').first().text()
    );

    const description = getMetaDescription($);

    const headings = [];

    $('h1, h2, h3').each((_, element) => {
      if (headings.length >= 15) return;

      const text = cleanText(
        $(element).text()
      );

      if (text) {
        headings.push(text);
      }
    });

    const bodyText = cleanText(
      $('body').text()
    ).slice(0, 5000);

    return {
      title,
      description,
      headings,
      bodyText
    };
  } catch (error) {
    console.error(
      '⚠️ Website context extraction failed:',
      error.response?.status ||
        error.message
    );

    return {
      title: '',
      description: '',
      headings: [],
      bodyText: ''
    };
  }
};

/* ==========================================================================
   DETAILED RANKING PAGE EXTRACTION
========================================================================== */

const extractDetailedPageData = async (
  url,
  keyword = ''
) => {
  try {
    console.log(
      '📄 Extracting ranking page:',
      url
    );

    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    const $ = cheerio.load(response.data);

    console.log(
      '🧪 HTML length:',
      String(response.data).length,
      '| meta tags:',
      $('meta').length
    );

    const title = cleanText(
      $('title').first().text()
    );

    const metaDescription =
      getMetaDescription($);

    console.log(
      '🧪 Meta description found:',
      metaDescription ? 'YES' : 'NO'
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

    $('h1').each((_, el) => {
      if (h1.length >= 10) return;

      const text = cleanText($(el).text());

      if (text) {
        h1.push(text);
      }
    });

    $('h2').each((_, el) => {
      if (h2.length >= 20) return;

      const text = cleanText($(el).text());

      if (text) {
        h2.push(text);
      }
    });

    $('h3').each((_, el) => {
      if (h3.length >= 20) return;

      const text = cleanText($(el).text());

      if (text) {
        h3.push(text);
      }
    });

    $('p').each((_, el) => {
      if (paragraphs.length >= 30) return;

      const text = cleanText($(el).text());

      if (text) {
        paragraphs.push(text);
      }
    });

    $('img').each((_, el) => {
      if (imageAlts.length >= 30) return;

      const alt = cleanText(
        $(el).attr('alt') || ''
      );

      imageAlts.push(alt);

      if (
        !alt &&
        missingAltSamples.length < 10
      ) {
        missingAltSamples.push(
          cleanText($(el).attr('src') || '')
        );
      }
    });

    const baseDomain =
      normalizeDomain(url);

    $('a[href]').each((_, el) => {
      if (
        internalLinks.length >= 30 &&
        externalLinks.length >= 30
      ) {
        return;
      }

      const href = $(el).attr('href');

      if (!href) return;

      try {
        const absoluteUrl =
          new URL(href, url);

        if (
          !['http:', 'https:'].includes(
            absoluteUrl.protocol
          )
        ) {
          return;
        }

        const link = {
          text: cleanText($(el).text()),
          url: absoluteUrl.href
        };

        if (
          normalizeDomain(
            absoluteUrl.href
          ) === baseDomain
        ) {
          if (internalLinks.length < 30) {
            internalLinks.push(link);
          }
        } else {
          if (externalLinks.length < 30) {
            externalLinks.push(link);
          }
        }
      } catch {
        // Ignore invalid links.
      }
    });

    const content = cleanText(
      $('body').text()
    ).slice(0, 10000);

    const keywordLower = String(keyword)
      .toLowerCase()
      .trim();

    let keywordOccurrences = 0;

    if (keywordLower && content) {
      const escapedKeyword =
        keywordLower.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        );

      keywordOccurrences =
        content.match(
          new RegExp(
            escapedKeyword,
            'gi'
          )
        )?.length || 0;
    }

    const wordCount = content
      ? content.split(/\s+/).length
      : 0;

    const totalImages = $('img').length;

    const imagesWithAlt = $('img')
      .filter((_, el) =>
        Boolean(
          cleanText(
            $(el).attr('alt') || ''
          )
        )
      )
      .length;

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
      wordCount,
      totalImages,
      imagesWithAlt,
      keywordOccurrences
    };
  } catch (error) {
    const statusCode =
      error.response?.status;

    console.error(
      '⚠️ Ranking page extraction failed:',
      statusCode || error.message
    );

    return {
      success: false,
      errorType:
        statusCode === 403
          ? 'FORBIDDEN'
          : 'FETCH_FAILED',
      statusCode:
        statusCode || null,
      error: error.message,
      url,
      keyword
    };
  }
};

/* ==========================================================================
   SERPAPI REQUEST
========================================================================== */

const fetchSerpPage = async (params) => {
  const maxAttempts = 3;
  let lastData = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      console.log(
        `➡️ SERP REQUEST | keyword="${params.q}" | start=${params.start} | attempt=${attempt}`
      );

      const response =
        await axios.get(
          SERP_API_URL,
          {
            params,
            timeout: 60000
          }
        );

      lastData = response.data;

      if (lastData?.error) {
        console.error(
          '❌ SERPAPI ERROR:',
          lastData.error
        );

        if (attempt === maxAttempts) {
          return {
            data: lastData,
            organic: []
          };
        }
      } else {
        const organic =
          Array.isArray(
            lastData?.organic_results
          )
            ? lastData.organic_results
            : [];

        if (organic.length > 0) {
          return {
            data: lastData,
            organic
          };
        }

        console.log(
          `⚠️ No organic results (attempt ${attempt}/${maxAttempts}). State: ${
            lastData?.search_information
              ?.organic_results_state ||
            'unknown'
          }`
        );
      }
    } catch (error) {
      const status =
        error.response?.status;

      const retryable =
        !status ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      console.error(
        `❌ SERP request attempt ${attempt} failed:`,
        error.response?.data ||
          error.message
      );

      if (
        !retryable ||
        attempt === maxAttempts
      ) {
        throw error;
      }
    }

    await sleep(attempt * 1500);
  }

  return {
    data: lastData,
    organic: []
  };
};

/* ==========================================================================
   FIND WEBSITE RANK
========================================================================== */

const findRankForKeyword = async ({
  keyword,
  domain,
  country,
  location,
  searchDepth,
  apiKey
}) => {
  const targetDomain =
    normalizeDomain(domain);

  const pagesToFetch =
    Math.ceil(
      searchDepth /
        RESULTS_PER_PAGE
    );

  console.log(
    '\n========================================'
  );

  console.log(
    '🔎 SEARCHING KEYWORD:',
    keyword
  );

  console.log(
    '🌐 TARGET DOMAIN:',
    targetDomain
  );

  console.log(
    '🌍 COUNTRY:',
    country
  );

  console.log(
    '📍 LOCATION:',
    location || 'default'
  );

  console.log(
    '📊 SEARCH DEPTH:',
    searchDepth
  );

  console.log(
    '📄 PAGES:',
    pagesToFetch
  );

  console.log(
    '🗂️ NO CACHE:',
    SERP_NO_CACHE
  );

  console.log(
    '========================================'
  );

  let totalOrganicResults = 0;
  let pagesChecked = 0;

  for (
    let page = 0;
    page < pagesToFetch;
    page++
  ) {
    const start =
      page * RESULTS_PER_PAGE;

    const params = {
      engine: 'google',
      q: keyword,
      google_domain: GOOGLE_DOMAIN,
      gl:
        country ||
        DEFAULT_COUNTRY,
      hl: DEFAULT_LANGUAGE,
      device: DEFAULT_DEVICE,
      num: RESULTS_PER_PAGE,
      start,
      no_cache: SERP_NO_CACHE,
      api_key: apiKey
    };

    /*
     * This is the important location change.
     *
     * If location is supplied, SerpApi receives it.
     * Otherwise the .env default is used by analyzeWebsite().
     */
    if (location) {
      params.location = location;
    }

    const {
      data,
      organic
    } =
      await fetchSerpPage(params);

    pagesChecked++;

    console.log(
      '🔗 Google URL:',
      data?.search_metadata
        ?.google_url
    );

    console.log(
      '🆔 SerpApi Search ID:',
      data?.search_metadata?.id
    );

    console.log(
      '📡 SerpApi status:',
      data?.search_metadata?.status ||
        'unknown'
    );

    console.log(
      '📍 Location requested:',
      data?.search_parameters
        ?.location_requested ||
        'default'
    );

    console.log(
      '📍 Location used:',
      data?.search_parameters
        ?.location_used ||
        'default'
    );

    console.log(
      '🌐 Search Parameters:',
      data?.search_parameters
    );

    console.log(
      '📊 Organic result state:',
      data?.search_information
        ?.organic_results_state ||
        'unknown'
    );

    console.log(
      `✅ Page ${page + 1}: ${organic.length} organic results`
    );

    totalOrganicResults +=
      organic.length;

    organic.forEach(
      (item, index) => {
        console.log(
          `${index + 1}. position=${item.position} | title=${item.title} | link=${item.link}`
        );
      }
    );

    for (
      let i = 0;
      i < organic.length;
      i++
    ) {
      const item = organic[i];

      const resultUrl =
        item.link ||
        item.redirect_link ||
        '';

      if (!resultUrl) {
        continue;
      }

      const resultPosition =
        Number(item.position);

      const actualPosition =
        Number.isFinite(
          resultPosition
        ) &&
        resultPosition > 0
          ? resultPosition
          : start + i + 1;

      if (
        actualPosition >
        searchDepth
      ) {
        continue;
      }

      const resultDomain =
        normalizeDomain(resultUrl);

      const matches =
        domainMatches(
          resultDomain,
          targetDomain
        );

      console.log(
        '🔍 DOMAIN CHECK:',
        resultDomain,
        'vs',
        targetDomain,
        matches
          ? '→ MATCH'
          : '→ no'
      );

      if (!matches) {
        continue;
      }

      console.log(
        '\n🎯 MATCH FOUND!'
      );

      console.log(
        'Keyword:',
        keyword
      );

      console.log(
        'Rank:',
        actualPosition
      );

      console.log(
        'URL:',
        resultUrl
      );

      console.log(
        'Title:',
        item.title
      );

      return {
        rank: actualPosition,
        rankingUrl: resultUrl,
        serpTitle:
          item.title || '',
        serpSnippet:
          item.snippet || '',
        found: true,
        pagesChecked
      };
    }

    if (organic.length === 0) {
      console.log(
        'ℹ️ No organic results returned. Stopping.'
      );

      break;
    }
  }

  console.log(
    '\n❌ NO MATCH FOUND'
  );

  console.log(
    'Keyword:',
    keyword
  );

  console.log(
    'Target domain:',
    targetDomain
  );

  console.log(
    'Total organic results checked:',
    totalOrganicResults
  );

  return {
    rank: null,
    rankingUrl: null,
    serpTitle: '',
    serpSnippet: '',
    found: false,
    pagesChecked
  };
};

/* ==========================================================================
   POST /api/analysis
========================================================================== */

export const analyzeWebsite = async (
  req,
  res
) => {
  try {
    console.log(
      '\n🔍 RANK TRACKING STARTED'
    );

    console.log(
      'Request body:',
      req.body
    );

    console.log(
      'User ID:',
      req.userId
    );

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
        message:
          'Website URL is required.'
      });
    }

    let normalizedUrl;
    let domain;

    try {
      normalizedUrl =
        normalizeUrl(url);

      domain =
        normalizeDomain(
          normalizedUrl
        );

      if (!domain) {
        throw new Error(
          'Invalid domain'
        );
      }
    } catch {
      return res.status(400).json({
        success: false,
        message:
          'Please enter a valid website URL.'
      });
    }

    const keywordArray =
      Array.isArray(keywords)
        ? keywords
            .map((item) =>
              String(item).trim()
            )
            .filter(Boolean)
        : String(keywords || '')
            .split(',')
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);

    if (
      keywordArray.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please enter at least one keyword.'
      });
    }

    const selectedCountry =
      String(
        country ||
          DEFAULT_COUNTRY
      ).toLowerCase();

    const requestedDepth =
      Number(searchDepth) ||
      DEFAULT_SEARCH_DEPTH;

    const selectedSearchDepth =
      Math.min(
        Math.max(
          requestedDepth,
          RESULTS_PER_PAGE
        ),
        MAX_SEARCH_DEPTH
      );

    /*
     * Explicit frontend location takes priority.
     * Otherwise use SERP_LOCATION from .env.
     */
    const selectedLocation =
      String(
        location ||
          DEFAULT_LOCATION
      ).trim();

    const serpApiKey =
      process.env.SERP_API_KEY;

    if (!serpApiKey) {
      return res.status(500).json({
        success: false,
        message:
          'SERP_API_KEY is not configured on the server.'
      });
    }

    console.log(
      '🌐 Website:',
      normalizedUrl
    );

    console.log(
      '🏷️ Domain:',
      domain
    );

    console.log(
      '🌍 Country:',
      selectedCountry
    );

    console.log(
      '📍 Location:',
      selectedLocation ||
        'default'
    );

    console.log(
      '🔎 Search depth:',
      selectedSearchDepth
    );

    console.log(
      '🏷️ Keywords:',
      keywordArray
    );

    const results = [];

    for (
      const keyword of keywordArray
    ) {
      try {
        const found =
          await findRankForKeyword({
            keyword,
            domain,
            country:
              selectedCountry,
            location:
              selectedLocation,
            searchDepth:
              selectedSearchDepth,
            apiKey:
              serpApiKey
          });

        results.push({
          keyword,

          rank:
            found.rank !== null
              ? found.rank
              : 'Not Found',

          googlePage:
            found.rank
              ? Math.ceil(
                  found.rank /
                    RESULTS_PER_PAGE
                )
              : null,

          rankingUrl:
            found.rankingUrl ||
            null,

          found:
            found.rank !== null,

          serpTitle:
            found.serpTitle || '',

          serpSnippet:
            found.serpSnippet || '',

          status:
            found.rank !== null
              ? 'Found'
              : 'Not Found in selected depth',

          pagesChecked:
            found.pagesChecked
        });
      } catch (error) {
        console.error(
          `❌ SerpAPI failed for "${keyword}":`,
          error.response?.data ||
            error.message
        );

        return res.status(502).json({
          success: false,
          message:
            `SerpAPI search failed for keyword "${keyword}".`,
          error:
            error.response?.data
              ?.error ||
            error.message
        });
      }
    }

    const savedAnalysis =
      await Analysis.create({
        userId: req.userId,

        websiteUrl:
          normalizedUrl,

        keywords:
          keywordArray,

        rankingData: {
          results
        },

        status: 'completed',

        country:
          selectedCountry,

        searchDepth:
          selectedSearchDepth,

        aiSuggestions: ''
      });

    console.log(
      '✅ Analysis saved:',
      savedAnalysis._id
    );

    return res.status(200).json({
      success: true,

      message:
        'Google rank tracking completed.',

      data: {
        url: normalizedUrl,

        results,

        selectedCountry,

        selectedSearchDepth,

        searchEngine: 'Google',

        googleDomain:
          GOOGLE_DOMAIN,

        language:
          DEFAULT_LANGUAGE,

        searchLocation:
          selectedLocation,

        device:
          DEFAULT_DEVICE
      },

      analysisId:
        savedAnalysis._id
    });
  } catch (error) {
    console.error(
      '❌ ANALYSIS CONTROLLER ERROR:',
      error.response?.data ||
        error.message ||
        error
    );

    return res.status(500).json({
      success: false,

      message:
        'Unable to complete website analysis.',

      error:
        error.response?.data?.error ||
        error.message
    });
  }
};

/* ==========================================================================
   POST /api/analysis/check-relevance
========================================================================== */

export const checkRelevance = async (
  req,
  res
) => {
  try {
    const {
      analysisId
    } = req.body;

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message:
          'Analysis ID is required.'
      });
    }

    const analysis =
      await getAnalysisForUser(
        analysisId,
        req.userId
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message:
          'Analysis not found.'
      });
    }

    const websiteUrl =
      analysis.websiteUrl;

    console.log(
      '🤖 KEYWORD RELEVANCE CHECK:',
      websiteUrl
    );

    const websiteContext =
      await extractWebsiteContext(
        websiteUrl
      );

    const updatedResults = [];

    const storedResults =
      analysis.rankingData
        ?.results || [];

    for (
      const item of storedResults
    ) {
      const plainItem =
        item.toObject?.() ?? item;

      try {
        console.log(
          `🔎 Checking relevance: "${plainItem.keyword}"`
        );

        const relevance =
          await checkKeywordRelevance({
            keyword:
              plainItem.keyword,

            websiteUrl,

            websiteContext,

            rankingResult:
              plainItem
          });

        updatedResults.push({
          ...plainItem,

          relevant:
            relevance?.relevant ??
            null,

          confidence:
            relevance?.confidence ??
            null,

          reason:
            relevance?.reason || '',

          relevanceStatus:
            relevance?.status ||
            'completed'
        });
      } catch (error) {
        console.error(
          `⚠️ Relevance failed for "${plainItem.keyword}":`,
          error.message
        );

        updatedResults.push({
          ...plainItem,

          relevant: null,

          confidence: null,

          reason:
            'Unable to determine relevance.',

          relevanceStatus:
            'error'
        });
      }
    }

    analysis.rankingData.results =
      updatedResults;

    await analysis.save();

    return res.status(200).json({
      success: true,

      data: {
        results:
          updatedResults,

        websiteContext: {
          title:
            websiteContext.title,

          description:
            websiteContext.description,

          headings:
            websiteContext.headings
        }
      }
    });
  } catch (error) {
    console.error(
      '❌ Relevance controller error:',
      error.response?.data ||
        error.message ||
        error
    );

    return res.status(500).json({
      success: false,

      message:
        'Unable to check keyword relevance.',

      error:
        error.response?.data?.error ||
        error.message
    });
  }
};

/* ==========================================================================
   POST /api/analysis/optimize-keyword
========================================================================== */

export const optimizeKeyword = async (
  req,
  res
) => {
  try {
    const {
      analysisId,
      keyword,
      rank,
      rankingUrl,
      url,
      country
    } = req.body;

    console.log(
      '\n================ OPTIMIZATION START ================'
    );

    console.log(
      'analysisId:',
      analysisId
    );

    console.log(
      'keyword:',
      keyword
    );

    console.log(
      'rank from frontend:',
      rank
    );

    console.log(
      'rankingUrl from frontend:',
      rankingUrl
    );

    console.log(
      'website url:',
      url
    );

    console.log(
      'country:',
      country
    );

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message:
          'Analysis ID is required.'
      });
    }

    if (
      !keyword ||
      !String(keyword).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Keyword is required.'
      });
    }

    const analysis =
      await getAnalysisForUser(
        analysisId,
        req.userId
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message:
          'Analysis not found.'
      });
    }

    const storedResults =
      analysis.rankingData
        ?.results || [];

    const storedResult =
      storedResults.find(
        (item) =>
          String(
            item.keyword || ''
          )
            .trim()
            .toLowerCase() ===
          String(keyword)
            .trim()
            .toLowerCase()
      );

    if (!storedResult) {
      return res.status(404).json({
        success: false,
        message:
          `Keyword "${keyword}" was not found in this analysis.`
      });
    }

    const targetPage =
      rankingUrl ||
      storedResult.rankingUrl ||
      null;

    if (!targetPage) {
      return res.status(422).json({
        success: false,
        message:
          'No ranking page was found for this keyword. Run the analysis again with a sufficient search depth.'
      });
    }

    let validTargetPage;

    try {
      validTargetPage =
        normalizeUrl(targetPage);
    } catch {
      return res.status(400).json({
        success: false,
        message:
          'Please provide a valid ranking page URL.'
      });
    }

    const currentRank =
      rank ??
      storedResult.rank ??
      'Not Found';

    console.log(
      '🎯 FINAL KEYWORD:',
      String(keyword).trim()
    );

    console.log(
      '🎯 FINAL RANK:',
      currentRank
    );

    console.log(
      '🎯 FINAL TARGET PAGE:',
      validTargetPage
    );

    const pageData =
      await extractDetailedPageData(
        validTargetPage,
        String(keyword).trim()
      );

    if (!pageData?.success) {
      if (
        pageData?.errorType ===
        'FORBIDDEN'
      ) {
        return res.status(422).json({
          success: false,
          message:
            'The ranking page blocked access (HTTP 403), so the current page content could not be verified for optimization.'
        });
      }

      return res.status(422).json({
        success: false,
        message:
          'Unable to fetch the ranking page. Optimization requires access to the actual ranking page.'
      });
    }

    if (
      !pageData.title &&
      !pageData.metaDescription &&
      (!pageData.h1 ||
        pageData.h1.length === 0) &&
      (!pageData.content ||
        !pageData.content.trim())
    ) {
      return res.status(422).json({
        success: false,
        message:
          'The ranking page was fetched, but no usable page content was detected.'
      });
    }

    const optimization =
      await generateKeywordOptimization({
        keyword:
          String(keyword).trim(),

        currentRank,

        targetPage:
          validTargetPage,

        websiteUrl:
          analysis.websiteUrl,

        country:
          country ||
          analysis.country ||
          DEFAULT_COUNTRY,

        title:
          pageData.title || '',

        metaDescription:
          pageData.metaDescription ||
          '',

        canonical:
          pageData.canonical || '',

        robots:
          pageData.robots || '',

        viewport:
          pageData.viewport || '',

        language:
          pageData.language || '',

        h1:
          pageData.h1 || [],

        headings: {
          h2s:
            pageData.h2 || [],

          h3s:
            pageData.h3 || []
        },

        content:
          (pageData.content || '')
            .slice(0, 6000),

        wordCount:
          pageData.wordCount || 0,

        images: {
          total:
            pageData.totalImages || 0,

          withAlt:
            pageData.imagesWithAlt || 0,

          missingAltSamples:
            pageData.missingAltSamples ||
            []
        },

        internalLinks:
          (
            pageData.internalLinks ||
            []
          ).length,

        externalLinks:
          (
            pageData.externalLinks ||
            []
          ).length,

        keywordOccurrences:
          pageData.keywordOccurrences ||
          0,

        serpTitle:
          storedResult.serpTitle ||
          '',

        serpSnippet:
          storedResult.serpSnippet ||
          ''
      });

    if (!optimization) {
      return res.status(500).json({
        success: false,
        message:
          'No optimization result was generated.'
      });
    }

    console.log(
      '================ OPTIMIZATION END ================\n'
    );

    return res.json({
      success: true,

      data: {
        ...optimization,

        current: {
          title:
            pageData.title || '',

          metaDescription:
            pageData.metaDescription ||
            '',

          canonical:
            pageData.canonical || '',

          robots:
            pageData.robots || '',

          viewport:
            pageData.viewport || '',

          language:
            pageData.language || '',

          h1:
            pageData.h1 || [],

          h2:
            pageData.h2 || [],

          h3:
            pageData.h3 || [],

          keywordOccurrences:
            pageData.keywordOccurrences ||
            0,

          wordCount:
            pageData.wordCount || 0
        }
      }
    });
  } catch (error) {
    console.error(
      '❌ OPTIMIZE KEYWORD FAILED:',
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        'Unable to generate optimization suggestions.'
    });
  }
};