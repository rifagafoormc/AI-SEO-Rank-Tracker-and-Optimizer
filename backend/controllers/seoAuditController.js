import axios from "axios";
import * as cheerio from "cheerio";
import { generateAuditOptimizationSuggestions } from "../utils/gemini.js";
import Audit from "../models/Audit.js";

/**
 * SEO Audit Controller
 *
 * Fetches a webpage, extracts SEO-related information,
 * evaluates predefined SEO rules and calculates an SEO score.
 *
 * Error messages are written in a user-friendly style:
 *   what happened → why → what the user can do
 */

/* ============================================================
   ROBUST FETCHER
============================================================ */

const AUDIT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, maxAttempts = 3) => {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startTime = Date.now();

    try {
      console.log(
        `➡️ AUDIT FETCH | attempt=${attempt}/${maxAttempts} | url=${url}`
      );

      const response = await axios.get(url, {
        timeout: 25000,

        headers: {
          "User-Agent": AUDIT_USER_AGENT,

          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",

          "Accept-Language": "en-US,en;q=0.9",

          "Accept-Encoding": "gzip, deflate, br",

          Connection: "keep-alive",

          "Upgrade-Insecure-Requests": "1",
        },

        validateStatus: () => true,

        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,

        maxRedirects: 5,
      });

      const loadTime = Date.now() - startTime;

      const html = response.data;

      console.log(
        `✅ AUDIT FETCH OK | status=${response.status} | length=${
          typeof html === "string" ? html.length : "n/a"
        } | time=${loadTime}ms`
      );

      return {
        ok: true,
        response,
        html,
        loadTime,
      };
    } catch (error) {
      lastError = error;

      const status = error.response?.status;

      const retryable =
        !status ||
        error.code === "ECONNABORTED" ||
        error.code === "ETIMEDOUT" ||
        error.code === "ECONNRESET" ||
        error.code === "EAI_AGAIN" ||
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      console.error(
        `❌ AUDIT FETCH attempt ${attempt} failed:`,
        error.code || status || error.message
      );

      if (!retryable || attempt === maxAttempts) {
        return {
          ok: false,
          error,
        };
      }

      await sleep(attempt * 1500);
    }
  }

  return {
    ok: false,
    error: lastError,
  };
};

/* ============================================================
   HELPER — Friendly HTTP status messages
============================================================ */

const getFriendlyHttpMessage = (status) => {
  if (status === 401) {
    return "This website requires authentication, so an SEO audit cannot be performed for this URL.";
  }

  if (status === 403) {
    return "Access denied. This website is blocking automated access, so an SEO audit cannot be performed for this URL.";
  }

  if (status === 404) {
    return "The requested webpage could not be found. Please check the URL and try again.";
  }

  if (status === 429) {
    return "The website is temporarily limiting requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "The website's server is currently unavailable. Please try again later.";
  }

  return `The website could not be audited because it returned an HTTP ${status} response.`;
};

/* ============================================================
   AUDIT WEBSITE
============================================================ */

export const auditWebsite = async (req, res) => {
  try {
    let { url } = req.body;

    // -----------------------------------------
    // 1. Validate URL
    // -----------------------------------------

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a website URL to start the SEO audit.",
      });
    }

    url = url.trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid website URL, such as https://example.com.",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a website URL that starts with http:// or https://.",
      });
    }

    // -----------------------------------------
    // 2. Fetch website HTML
    // -----------------------------------------

    const fetchResult = await fetchWithRetry(url, 3);

    if (!fetchResult.ok) {
      const err = fetchResult.error;

      let message =
        "We couldn't complete the SEO audit. Please try again.";

      if (
        err?.code === "ECONNABORTED" ||
        err?.code === "ETIMEDOUT"
      ) {
        message =
          "The website took too long to respond. It may be temporarily unavailable or blocking automated access.";
      } else if (err?.code === "ENOTFOUND") {
        message =
          "We couldn't find this website. Please check the URL and try again.";
      } else if (err?.code === "ECONNRESET") {
        message =
          "The website closed the connection before the audit could be completed. It may be blocking automated access.";
      } else if (err?.response) {
        message = getFriendlyHttpMessage(err.response.status);
      } else if (err?.request) {
        message =
          "We couldn't connect to this website. Please check the URL and try again.";
      }

      console.error("SEO Audit fetch failure:", err?.message);

      return res.status(502).json({
        success: false,
        message,
        reason: "FETCH_FAILED",
        statusCode: err?.response?.status || null,
      });
    }

    const { response, html, loadTime } = fetchResult;

    // -----------------------------------------
    // 3. Validate HTML response
    // -----------------------------------------

    if (!html || typeof html !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "We couldn't retrieve the webpage content needed for the SEO audit.",
      });
    }

    // -----------------------------------------
    // 4. Detect security / WAF challenge pages
    // -----------------------------------------

    const lowerHtml = html.toLowerCase();

    const isAwsWafChallenge =
      lowerHtml.includes("awswafcookiedomainlist") ||
      lowerHtml.includes("gokuprops") ||
      lowerHtml.includes("aws waf") ||
      lowerHtml.includes("awswaf") ||
      (response.status === 202 &&
        lowerHtml.includes("<title></title>"));

    if (isAwsWafChallenge) {
      console.warn(
        `SEO Audit blocked by AWS WAF/security challenge: ${url}`
      );

      return res.status(422).json({
        success: false,
        message:
          "This website returned a security verification page instead of its actual webpage. The SEO audit cannot be completed automatically.",
        reason: "SECURITY_CHALLENGE",
        data: {
          url,
          statusCode: response.status,
          contentType:
            response.headers["content-type"] || "",
          loadTime,
        },
      });
    }

    // -----------------------------------------
    // 5. Handle unsuccessful HTTP responses
    // -----------------------------------------

    if (response.status < 200 || response.status >= 400) {
      return res.status(422).json({
        success: false,
        message: getFriendlyHttpMessage(response.status),
        data: {
          url,
          statusCode: response.status,
          contentType:
            response.headers["content-type"] || "",
          loadTime,
        },
      });
    }

    // -----------------------------------------
    // 6. Parse HTML
    // -----------------------------------------

    const $ = cheerio.load(html);

    // -----------------------------------------
    // 7. Page Title
    // -----------------------------------------

    const title = $("title").first().text().trim();
    const titleLength = title.length;

    // -----------------------------------------
    // 8. Meta Description
    // -----------------------------------------

    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || "";

    const metaDescriptionLength = metaDescription.length;

    // -----------------------------------------
    // 9. Headings
    // -----------------------------------------

    const h1 = $("h1");
    const h2 = $("h2");
    const h3 = $("h3");

    const headings = {
      total: $("h1, h2, h3, h4, h5, h6").length,
      h1: h1.length,
      h2: h2.length,
      h3: h3.length,
    };

    const h1Texts = [];

    h1.each((index, element) => {
      const text = $(element).text().trim();
      if (text) h1Texts.push(text);
    });

    // -----------------------------------------
    // 10. Images / ALT text
    // -----------------------------------------

    const images = $("img");
    let missingAlt = 0;

    images.each((index, element) => {
      const alt = $(element).attr("alt");

      if (alt === undefined || alt.trim() === "") {
        missingAlt++;
      }
    });

    const imageData = {
      total: images.length,
      missingAlt,
      withAlt: images.length - missingAlt,
    };

    // -----------------------------------------
    // 11. Links
    // -----------------------------------------

    const links = $("a[href]");
    let internalLinks = 0;
    let externalLinks = 0;

    links.each((index, element) => {
      const href = $(element).attr("href");
      if (!href) return;

      if (
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:")
      ) {
        return;
      }

      try {
        const linkUrl = new URL(href, url);

        if (linkUrl.hostname === parsedUrl.hostname) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch (error) {
        // Ignore malformed URLs
      }
    });

    const linkData = {
      total: links.length,
      internal: internalLinks,
      external: externalLinks,
    };

    // -----------------------------------------
    // 12. Word Count
    // -----------------------------------------

    $("script, style, noscript, svg").remove();

    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const words = bodyText
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const wordCount = words.length;

    // -----------------------------------------
    // 13. Canonical URL
    // -----------------------------------------

    const canonical =
      $('link[rel="canonical"]').attr("href")?.trim() || "";

    // -----------------------------------------
    // 14. Robots Meta
    // -----------------------------------------

    const robots =
      $('meta[name="robots"]').attr("content")?.trim() || "";

    // -----------------------------------------
    // 15. Open Graph
    // -----------------------------------------

    const ogTitle = $('meta[property="og:title"]').attr("content");

    const ogDescription = $(
      'meta[property="og:description"]'
    ).attr("content");

    const ogImage = $('meta[property="og:image"]').attr("content");

    const openGraph = !!(ogTitle || ogDescription || ogImage);

    // -----------------------------------------
    // 16. Viewport
    // -----------------------------------------

    const viewport =
      $('meta[name="viewport"]').attr("content") || "";

    const hasViewport = viewport.length > 0;

    // -----------------------------------------
    // 17. HTML Language
    // -----------------------------------------

    const language = $("html").attr("lang") || "";

    const hasLanguage = language.length > 0;

    // -----------------------------------------
    // 18. Structured Data
    // -----------------------------------------

    const structuredDataCount = $(
      'script[type="application/ld+json"]'
    ).length;

    const hasStructuredData = structuredDataCount > 0;

    // -----------------------------------------
    // 19. SEO Rules
    // -----------------------------------------

    const checks = {
      title: titleLength >= 30 && titleLength <= 60,

      metaDescription:
        metaDescriptionLength >= 120 &&
        metaDescriptionLength <= 160,

      h1: h1.length === 1,

      images: images.length === 0 || missingAlt === 0,

      canonical: canonical.length > 0,

      robots: !robots.toLowerCase().includes("noindex"),

      openGraph,

      viewport: hasViewport,

      language: hasLanguage,

      structuredData: hasStructuredData,

      content: wordCount >= 300,

      internalLinks: internalLinks >= 3,
    };

    // -----------------------------------------
    // 20. Calculate SEO Score
    // -----------------------------------------

    let score = 0;

    if (title) {
      if (titleLength >= 30 && titleLength <= 60) score += 15;
      else score += 8;
    }

    if (metaDescription) {
      if (
        metaDescriptionLength >= 120 &&
        metaDescriptionLength <= 160
      ) {
        score += 15;
      } else {
        score += 8;
      }
    }

    if (h1.length === 1) score += 10;
    else if (h1.length > 0) score += 5;

    if (images.length === 0) score += 10;
    else if (missingAlt === 0) score += 10;
    else if (missingAlt < images.length) score += 5;

    if (canonical) score += 10;

    if (wordCount >= 1000) score += 10;
    else if (wordCount >= 300) score += 7;
    else if (wordCount > 0) score += 3;

    if (internalLinks >= 5) score += 10;
    else if (internalLinks >= 3) score += 7;
    else if (internalLinks > 0) score += 3;

    if (openGraph) score += 5;
    if (!robots.toLowerCase().includes("noindex")) score += 5;
    if (hasViewport) score += 5;
    if (hasStructuredData) score += 5;
    if (hasLanguage) score += 5;

    score = Math.min(score, 100);

    // -----------------------------------------
    // 21. Generate SEO Issues
    // -----------------------------------------

    const issues = [];

    if (!title) {
      issues.push({
        title: "Missing page title",
        description:
          "Add a descriptive title tag to help search engines understand the page.",
      });
    } else if (titleLength < 30) {
      issues.push({
        title: "Page title is too short",
        description: `The title contains ${titleLength} characters. Aim for approximately 30–60 characters.`,
      });
    } else if (titleLength > 60) {
      issues.push({
        title: "Page title is too long",
        description: `The title contains ${titleLength} characters. Keep it around 30–60 characters.`,
      });
    }

    if (!metaDescription) {
      issues.push({
        title: "Missing meta description",
        description:
          "Add a meta description that summarizes the page content.",
      });
    } else if (metaDescriptionLength < 120) {
      issues.push({
        title: "Meta description is too short",
        description: `The meta description contains ${metaDescriptionLength} characters.`,
      });
    } else if (metaDescriptionLength > 160) {
      issues.push({
        title: "Meta description is too long",
        description: `The meta description contains ${metaDescriptionLength} characters.`,
      });
    }

    if (h1.length === 0) {
      issues.push({
        title: "Missing H1 heading",
        description:
          "Add a primary H1 heading that describes the main topic of the page.",
      });
    } else if (h1.length > 1) {
      issues.push({
        title: "Multiple H1 headings found",
        description: `The page contains ${h1.length} H1 headings. A single clear primary H1 is recommended.`,
      });
    }

    if (missingAlt > 0) {
      issues.push({
        title: `${missingAlt} image(s) missing ALT text`,
        description:
          "Add descriptive ALT attributes to images to improve accessibility and image SEO.",
      });
    }

    if (!canonical) {
      issues.push({
        title: "Canonical URL is missing",
        description:
          "Consider adding a canonical link element to identify the preferred version of the page.",
      });
    }

    if (wordCount < 300) {
      issues.push({
        title: "Low content volume",
        description: `Only ${wordCount} words were detected in the page body.`,
      });
    }

    if (internalLinks < 3) {
      issues.push({
        title: "Few internal links",
        description:
          "Add relevant internal links to improve navigation and help search engines discover pages.",
      });
    }

    if (!openGraph) {
      issues.push({
        title: "Open Graph metadata is missing",
        description:
          "Add Open Graph tags to improve how the page appears when shared on social platforms.",
      });
    }

    if (!hasViewport) {
      issues.push({
        title: "Viewport meta tag is missing",
        description:
          "Add a responsive viewport meta tag for better mobile rendering.",
      });
    }

    if (!hasLanguage) {
      issues.push({
        title: "HTML language attribute is missing",
        description:
          'Add a language attribute such as lang="en" to the HTML element.',
      });
    }

    if (!hasStructuredData) {
      issues.push({
        title: "Structured data not detected",
        description:
          "Consider adding relevant Schema.org structured data where appropriate.",
      });
    }

    // -----------------------------------------
    // 22. OPTIONAL SAVE TO DATABASE
    // -----------------------------------------
    //
    // IMPORTANT:
    // The original SEO Audit did not require authentication.
    // Therefore, absence of a user ID must NEVER prevent
    // the audit result from being returned.
    //
    // If a user ID is available, save the audit.
    // Otherwise, simply continue with the original behavior.
    // -----------------------------------------

    let savedAudit = null;

    const userId = req.user?.id || req.userId;

    if (userId) {
      try {
        savedAudit = await Audit.create({
          userId,
          websiteUrl: url,

          seoScore: score,

          title,
          titleLength,

          metaDescription,
          metaDescriptionLength,

          canonical,
          robots,

          openGraph,

          viewport: hasViewport,

          language,

          structuredData: hasStructuredData,
          structuredDataCount,

          headings,
          h1Texts,

          images: imageData,

          links: linkData,

          wordCount,

          loadTime,

          checks,

          issues,

          statusCode: response.status,

          contentType:
            response.headers["content-type"] || "",

          aiSuggestions: [],

          status: "completed",
        });

        console.log(
          "✅ SEO Audit saved:",
          savedAudit._id
        );
      } catch (saveError) {
        // Saving history must NEVER break the working audit.
        console.error(
          "⚠️ SEO Audit could not be saved:",
          saveError.message
        );
      }
    } else {
      console.log(
        "ℹ️ SEO Audit completed without a user ID. Result will be returned normally."
      );
    }

    // -----------------------------------------
    // 23. Return Audit Result
    // -----------------------------------------

    return res.status(200).json({
      success: true,

      data: {
        id: savedAudit?._id || null,

        url,

        score,

        title,
        titleLength,

        metaDescription,
        metaDescriptionLength,

        canonical,

        robots,

        openGraph,

        viewport: hasViewport,

        language,

        structuredData: hasStructuredData,
        structuredDataCount,

        headings,
        h1Texts,

        images: imageData,

        links: linkData,

        wordCount,

        loadTime,

        checks,

        issues,

        statusCode: response.status,

        contentType:
          response.headers["content-type"] || "",

        createdAt: savedAudit?.createdAt || null,
      },
    });
  } catch (error) {
    console.error("SEO Audit Error:", error.message);

    let message =
      "We couldn't complete the SEO audit. Please try again.";

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      message =
        "The website took too long to respond. It may be temporarily unavailable or blocking automated access.";
    } else if (error.response?.status === 401) {
      message =
        "This website requires authentication, so an SEO audit cannot be performed for this URL.";
    } else if (error.response?.status === 403) {
      message =
        "Access denied. This website is blocking automated access, so an SEO audit cannot be performed for this URL.";
    } else if (error.response?.status === 404) {
      message =
        "The requested webpage could not be found. Please check the URL and try again.";
    } else if (error.response?.status === 429) {
      message =
        "The website is temporarily limiting requests. Please wait a moment and try again.";
    } else if (error.response?.status >= 500) {
      message =
        "The website's server is currently unavailable. Please try again later.";
    } else if (error.response) {
      message = `The website could not be audited because it returned an HTTP ${error.response.status} response.`;
    } else if (error.request) {
      message =
        "We couldn't connect to this website. Please check the URL and try again.";
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

/* ============================================================
   getAuditSuggestions
   POST /api/seo-audit/suggestions
============================================================ */

export const getAuditSuggestions = async (req, res) => {
  try {
    const { auditData } = req.body;

    if (!auditData || typeof auditData !== "object") {
      return res.status(400).json({
        success: false,
        message:
          "The audit data is missing. Please run the SEO audit again.",
      });
    }

    if (!auditData.url) {
      return res.status(400).json({
        success: false,
        message:
          "The audit data is incomplete. Please run the SEO audit again.",
      });
    }

    const suggestions =
      await generateAuditOptimizationSuggestions(auditData);

    // -----------------------------------------
    // OPTIONAL: Save AI suggestions if the audit
    // was successfully persisted.
    // -----------------------------------------

    const userId = req.user?.id || req.userId;

    if (userId && auditData.id) {
      try {
        const updated = await Audit.findOneAndUpdate(
          {
            _id: auditData.id,
            userId,
          },
          {
            $set: {
              aiSuggestions: Array.isArray(suggestions)
                ? suggestions
                : [],
            },
          },
          {
            new: true,
          }
        );

        if (updated) {
          console.log(
            `✅ AI suggestions saved to Audit ${updated._id}`
          );
        }
      } catch (saveError) {
        // Persistence failure must not break Gemini response.
        console.error(
          "⚠️ Failed to attach AI suggestions to Audit:",
          saveError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("❌ getAuditSuggestions error:", error);

    return res.status(500).json({
      success: false,
      message:
        "AI optimization suggestions could not be generated at the moment.",
    });
  }
};