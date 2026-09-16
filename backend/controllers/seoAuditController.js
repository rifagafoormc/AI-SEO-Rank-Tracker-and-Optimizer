import axios from "axios";
import * as cheerio from "cheerio";
import { generateAuditOptimizationSuggestions } from "../utils/gemini.js";

/**
 * SEO Audit Controller
 *
 * Fetches a webpage, extracts SEO-related information,
 * evaluates predefined SEO rules and calculates an SEO score.
 */

export const auditWebsite = async (req, res) => {
  try {
    let { url } = req.body;

    // -----------------------------------------
    // 1. Validate URL
    // -----------------------------------------

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "Website URL is required",
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
        message: "Invalid website URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Only HTTP and HTTPS URLs are supported",
      });
    }

    // -----------------------------------------
    // 2. Fetch website HTML
    // -----------------------------------------

    const startTime = Date.now();

    const response = await axios.get(url, {
      timeout: 15000,

      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",

        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",

        "Accept-Language": "en-US,en;q=0.9",

        "Cache-Control": "no-cache",

        Pragma: "no-cache",
      },

      maxContentLength: 5 * 1024 * 1024,
      maxBodyLength: 5 * 1024 * 1024,

      // Do not automatically throw for 4xx/5xx responses.
      // This allows us to inspect the response and provide
      // a meaningful message to the user.
      validateStatus: () => true,
    });

    const loadTime = Date.now() - startTime;

    const html = response.data;

    // -----------------------------------------
    // 3. Validate HTML response
    // -----------------------------------------

    if (!html || typeof html !== "string") {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve HTML content from this website.",
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
          "This website returned a security verification page instead of its actual webpage. Automated SEO auditing is not available for this website.",
        reason: "SECURITY_CHALLENGE",
        data: {
          url,
          statusCode: response.status,
          contentType: response.headers["content-type"] || "",
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
        message: `Website returned HTTP ${response.status}. Unable to perform SEO audit.`,
        data: {
          url,
          statusCode: response.status,
          contentType: response.headers["content-type"] || "",
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

      if (text) {
        h1Texts.push(text);
      }
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

    // Page title
    if (title) {
      if (titleLength >= 30 && titleLength <= 60) {
        score += 15;
      } else {
        score += 8;
      }
    }

    // Meta description
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

    // H1
    if (h1.length === 1) {
      score += 10;
    } else if (h1.length > 0) {
      score += 5;
    }

    // Images
    if (images.length === 0) {
      score += 10;
    } else if (missingAlt === 0) {
      score += 10;
    } else if (missingAlt < images.length) {
      score += 5;
    }

    // Canonical
    if (canonical) {
      score += 10;
    }

    // Content
    if (wordCount >= 1000) {
      score += 10;
    } else if (wordCount >= 300) {
      score += 7;
    } else if (wordCount > 0) {
      score += 3;
    }

    // Internal links
    if (internalLinks >= 5) {
      score += 10;
    } else if (internalLinks >= 3) {
      score += 7;
    } else if (internalLinks > 0) {
      score += 3;
    }

    // Open Graph
    if (openGraph) {
      score += 5;
    }

    // Robots
    if (!robots.toLowerCase().includes("noindex")) {
      score += 5;
    }

    // Viewport
    if (hasViewport) {
      score += 5;
    }

    // Structured data
    if (hasStructuredData) {
      score += 5;
    }

    // Language
    if (hasLanguage) {
      score += 5;
    }

    score = Math.min(score, 100);

    // -----------------------------------------
    // 21. Generate SEO Issues
    // -----------------------------------------

    const issues = [];

    // Title issues
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

    // Meta description issues
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

    // H1 issues
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

    // ALT issues
    if (missingAlt > 0) {
      issues.push({
        title: `${missingAlt} image(s) missing ALT text`,
        description:
          "Add descriptive ALT attributes to images to improve accessibility and image SEO.",
      });
    }

    // Canonical
    if (!canonical) {
      issues.push({
        title: "Canonical URL is missing",
        description:
          "Consider adding a canonical link element to identify the preferred version of the page.",
      });
    }

    // Content
    if (wordCount < 300) {
      issues.push({
        title: "Low content volume",
        description: `Only ${wordCount} words were detected in the page body.`,
      });
    }

    // Internal links
    if (internalLinks < 3) {
      issues.push({
        title: "Few internal links",
        description:
          "Add relevant internal links to improve navigation and help search engines discover pages.",
      });
    }

    // Open Graph
    if (!openGraph) {
      issues.push({
        title: "Open Graph metadata is missing",
        description:
          "Add Open Graph tags to improve how the page appears when shared on social platforms.",
      });
    }

    // Viewport
    if (!hasViewport) {
      issues.push({
        title: "Viewport meta tag is missing",
        description:
          "Add a responsive viewport meta tag for better mobile rendering.",
      });
    }

    // Language
    if (!hasLanguage) {
      issues.push({
        title: "HTML language attribute is missing",
        description:
          'Add a language attribute such as lang="en" to the HTML element.',
      });
    }

    // Structured data
    if (!hasStructuredData) {
      issues.push({
        title: "Structured data not detected",
        description:
          "Consider adding relevant Schema.org structured data where appropriate.",
      });
    }

    // -----------------------------------------
    // 22. Return Audit Result
    // -----------------------------------------

    return res.status(200).json({
      success: true,

      data: {
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
      },
    });
  } catch (error) {
    console.error("SEO Audit Error:", error.message);

    let message = "Unable to analyze the website.";

    if (error.code === "ECONNABORTED") {
      message = "Website took too long to respond.";
    } else if (error.response) {
      message = `Website returned HTTP ${error.response.status}.`;
    } else if (error.request) {
      message = "Unable to connect to the website.";
    }

    return res.status(500).json({
      success: false,
      message,
    });
  }
};

/*
====================================================
getAuditSuggestions
POST /api/seo-audit/suggestions

Body:
{
  auditData: <the `data` object returned by auditWebsite>
}
====================================================
*/

export const getAuditSuggestions = async (req, res) => {
  try {
    const { auditData } = req.body;

    if (!auditData || typeof auditData !== "object") {
      return res.status(400).json({
        success: false,
        message: "auditData is required.",
      });
    }

    if (!auditData.url) {
      return res.status(400).json({
        success: false,
        message: "auditData.url is required.",
      });
    }

    const suggestions =
      await generateAuditOptimizationSuggestions(auditData);

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