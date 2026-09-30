import { GoogleGenerativeAI } from "@google/generative-ai";

/* ============================================================
   GEMINI MODEL
============================================================ */

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY
  );

  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });
};

/* ============================================================
   JSON RESPONSE HELPER
============================================================ */

const parseGeminiJSON = (text) => {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Handle occasional explanatory text surrounding JSON.
    const firstObject = cleaned.indexOf("{");
    const firstArray = cleaned.indexOf("[");
    const starts = [firstObject, firstArray].filter(
      (index) => index >= 0
    );

    if (!starts.length) {
      throw new Error("Gemini did not return valid JSON.");
    }

    const start = Math.min(...starts);
    const last = Math.max(
      cleaned.lastIndexOf("}"),
      cleaned.lastIndexOf("]")
    );

    if (last < start) {
      throw new Error("Gemini returned incomplete JSON.");
    }

    return JSON.parse(cleaned.slice(start, last + 1));
  }
};

/* ============================================================
   1. CHECK KEYWORD RELEVANCE

   Accepts ONE object per keyword.
   Does not require scraping the website.
============================================================ */

export const checkKeywordRelevance = async ({
  keyword,
  websiteUrl,
  websiteContext = {},
  rankingResult = {},
} = {}) => {
  try {
    if (!keyword || !websiteUrl) {
      throw new Error(
        "Keyword and website URL are required."
      );
    }

    console.log(
      `🤖 Checking keyword relevance: "${keyword}"`
    );

    const model = getGeminiModel();

    let domain = websiteUrl;

    try {
      const normalizedUrl = websiteUrl.startsWith("http")
        ? websiteUrl
        : `https://${websiteUrl}`;

      domain = new URL(normalizedUrl).hostname.replace(
        /^www\./i,
        ""
      );
    } catch {
      // Keep the supplied URL as fallback evidence.
    }

    const serpEvidence = {
      rank: rankingResult.rank ?? null,
      found: rankingResult.found ?? null,
      rankingUrl: rankingResult.rankingUrl || "",
      serpTitle: rankingResult.serpTitle || "",
      serpSnippet: rankingResult.serpSnippet || "",
    };

    const prompt = `
You are an SEO keyword relevance analyzer.

Determine whether the keyword is genuinely related to the
website's business, products, services, or content.

Use only the supplied evidence. Do not invent website content.
A website ranking for a keyword does not automatically mean
the keyword is relevant.

Return ONLY one valid JSON object in this format:

{
  "keyword": "example keyword",
  "relevant": true,
  "confidence": 85,
  "reason": "Short explanation based on the available evidence."
}

RULES:
- relevant must be true, false, or null.
- Use null if evidence is insufficient.
- confidence must be an integer from 0 to 100.
- Keep the reason short and specific.
- Do not include Markdown or code fences.

WEBSITE URL:
${websiteUrl}

WEBSITE DOMAIN:
${domain}

WEBSITE TITLE:
${websiteContext.title || "Not available"}

META DESCRIPTION:
${websiteContext.description || "Not available"}

HEADINGS:
${JSON.stringify(websiteContext.headings || [])}

AVAILABLE WEBSITE CONTENT:
${websiteContext.content || websiteContext.bodyText || "Not available"}

GOOGLE SEARCH EVIDENCE:
${JSON.stringify(serpEvidence, null, 2)}

TARGET KEYWORD:
${keyword}
`;

    const result = await model.generateContent(prompt);
    const parsed = parseGeminiJSON(
      result.response.text()
    );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      throw new Error(
        "Gemini returned an invalid relevance format."
      );
    }

    const relevant =
      parsed.relevant === true
        ? true
        : parsed.relevant === false
          ? false
          : null;

    const confidence = Number(parsed.confidence);

    return {
      keyword,
      relevant,
      confidence: Number.isFinite(confidence)
        ? Math.max(0, Math.min(100, confidence))
        : 0,
      reason:
        typeof parsed.reason === "string" &&
        parsed.reason.trim()
          ? parsed.reason.trim()
          : "There is insufficient evidence to explain relevance.",
    };
  } catch (error) {
    console.error(
      "❌ Gemini keyword relevance error:",
      error.message
    );

    throw error;
  }
};

/* ============================================================
   2. GENERATE SEO SUGGESTIONS — LEGACY
============================================================ */

export const generateSeoSuggestions = async (
  url,
  results = []
) => {
  try {
    console.log(
      "🤖 Generating general SEO suggestions..."
    );

    const relevantResults = results.filter(
      (item) => item.relevant === true
    );

    if (!relevantResults.length) {
      return (
        "No optimization suggestions were generated because " +
        "no relevant keywords were identified."
      );
    }

    const model = getGeminiModel();

    const prompt = `
You are an SEO optimization assistant.

Generate practical SEO suggestions for this website.

Rules:
1. Only consider keywords explicitly marked relevant.
2. Do not recommend keyword stuffing.
3. Do not change the website's primary business or topic.
4. Use the ranking evidence provided.
5. Do not guarantee ranking improvements.
6. Keep recommendations specific and understandable.

WEBSITE:
${url}

RELEVANT KEYWORD RESULTS:
${JSON.stringify(relevantResults, null, 2)}

Provide clear, practical SEO recommendations.
`;

    const result = await model.generateContent(prompt);

    return result.response.text().trim();
  } catch (error) {
    console.error(
      "❌ Gemini SEO suggestion error:",
      error.message
    );

    throw error;
  }
};

/* ============================================================
   3. GENERATE SEO AUDIT OPTIMIZATION SUGGESTIONS
============================================================ */

export const generateAuditOptimizationSuggestions = async (
  auditData = {}
) => {
  try {
    console.log(
      "🤖 Generating SEO audit optimization suggestions..."
    );

    const model = getGeminiModel();

    const {
      url,
      score,
      title,
      titleLength,
      metaDescription,
      metaDescriptionLength,
      canonical,
      robots,
      openGraph,
      viewport,
      language,
      structuredData,
      structuredDataCount,
      headings,
      images,
      links,
      wordCount,
      loadTime,
      checks,
      issues,
    } = auditData;

    const prompt = `
You are an SEO audit recommendation assistant.

Generate recommendations using ONLY the supplied audit data.

Rules:
1. Do not invent problems.
2. Prioritize failed checks and detected issues.
3. Each recommendation must cite evidence in the supplied data.
4. Do not recommend keyword stuffing or unrelated keywords.
5. Do not recommend changing the website's primary topic.
6. Do not invent Core Web Vitals or backlink issues.
7. Do not present passing checks as failures.
8. Return at most 8 recommendations.
9. If no issues are detected, return an empty array.
10. Return ONLY a valid JSON array.

Expected format:
[
  {
    "issue": "Missing meta description",
    "evidence": "No meta description was detected.",
    "recommendation": "Add a concise description that accurately summarizes the page."
  }
]

WEBSITE:
${url || "Not available"}

SEO SCORE:
${score ?? "Not available"}

TITLE:
${title || "Not available"}

TITLE LENGTH:
${titleLength ?? "Not available"}

META DESCRIPTION:
${metaDescription || "Not available"}

META DESCRIPTION LENGTH:
${metaDescriptionLength ?? "Not available"}

CANONICAL:
${canonical || "Not available"}

ROBOTS:
${robots || "Not available"}

OPEN GRAPH:
${openGraph ? "Detected" : "Not detected"}

VIEWPORT:
${viewport ? "Detected" : "Not detected"}

LANGUAGE:
${language || "Not available"}

STRUCTURED DATA:
${structuredData ? "Detected" : "Not detected"}

STRUCTURED DATA COUNT:
${structuredDataCount ?? "Not available"}

HEADINGS:
${JSON.stringify(headings || {}, null, 2)}

IMAGES:
${JSON.stringify(images || {}, null, 2)}

LINKS:
${JSON.stringify(links || {}, null, 2)}

WORD COUNT:
${wordCount ?? "Not available"}

PAGE LOAD TIME:
${loadTime ?? "Not available"} ms

SEO CHECKS:
${JSON.stringify(checks || {}, null, 2)}

DETECTED SEO ISSUES:
${JSON.stringify(issues || [], null, 2)}
`;

    const result = await model.generateContent(prompt);
    const parsed = parseGeminiJSON(
      result.response.text()
    );

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Gemini returned an invalid audit suggestion format."
      );
    }

    return parsed.slice(0, 8).map((item) => ({
      issue: item.issue || "SEO issue",
      evidence:
        item.evidence || "Based on the audit results.",
      recommendation:
        item.recommendation ||
        "Review the detected issue and make an appropriate improvement.",
    }));
  } catch (error) {
    console.error(
      "❌ Gemini SEO audit suggestion error:",
      error.message
    );

    throw error;
  }
};

/* ============================================================
   4. GENERATE KEYWORD-SPECIFIC OPTIMIZATION

   Accepts either flat page fields or a nested pageData object.
============================================================ */

export const generateKeywordOptimization = async (
  payload = {}
) => {
  try {
    console.log(
      "🤖 Generating keyword-specific optimization..."
    );

    const model = getGeminiModel();

    const {
      keyword,
      currentRank,
      targetPage,
      serpTitle,
      serpSnippet,
    } = payload;

    const pageData = payload.pageData || {};

    const title =
      payload.title ?? pageData.title ?? "";

    const metaDescription =
      payload.metaDescription ??
      pageData.metaDescription ??
      "";

    const h1 =
      payload.h1 ?? pageData.h1 ?? "";

    const headings =
      payload.headings ?? {
        h2s: pageData.h2s || [],
        h3s: pageData.h3s || [],
      };

    const content =
      payload.content ?? pageData.content ??
      pageData.bodyText ?? "";

    const wordCount =
      payload.wordCount ??
      pageData.wordCount ??
      (content ? content.trim().split(/\s+/).length : 0);

    const images =
      payload.images ?? {
        total: pageData.totalImages ?? 0,
        withAlt: pageData.imagesWithAlt ?? 0,
        missingAltSamples: pageData.missingAltSamples || [],
      };

    const internalLinks =
      payload.internalLinks ??
      pageData.internalLinks ??
      0;

    const externalLinks =
      payload.externalLinks ??
      pageData.externalLinks ??
      0;

    const keywordOccurrences =
      payload.keywordOccurrences ??
      pageData.keywordOccurrences ??
      0;

    const canonical =
      payload.canonical ?? pageData.canonical ?? "";

    const robots =
      payload.robots ?? pageData.robots ?? "";

    const viewport =
      payload.viewport ?? pageData.viewport ?? "";

    const language =
      payload.language ?? pageData.language ?? "";

    if (!keyword || !targetPage) {
      throw new Error(
        "Keyword and target page are required for optimization."
      );
    }

    const prompt = `
You are an SEO optimization assistant.

Recommend improvements for the specified keyword on the
specified page, using the actual page data below.

IMPORTANT RULES:

1. Use only the supplied evidence. Never claim that missing
   data was inspected or verified.
2. Do not recommend keyword stuffing.
3. Do not change the website's primary business or topic.
4. Never guarantee ranking improvements.
5. Focus on relevant on-page elements.
6. Return no more than 8 recommendations.
7. Prioritize meaningful improvements over unnecessary changes.
8. If an element is already satisfactory, use
   "No major change required" and an empty suggested value.
9. If the page could benefit from a modest improvement, use
   "Improvement possible".
10. Never invent a current title, description, heading, or
    paragraph if it is unavailable.
11. Use a concise replacement for title and meta description
    when a change is genuinely recommended.
12. Do not suggest replacing the entire page content.
13. Do not treat missing crawl data as proof that an element
    is missing from the real page.
14. Return ONLY a valid JSON object in the specified format.

Each recommendation must have:
- element
- status
- current
- suggested
- reason
- impact

Allowed status values:
- "Modification recommended"
- "No major change required"
- "Improvement possible"

Expected format:
{
  "keyword": "example",
  "currentRank": 7,
  "targetPage": "https://example.com/page",
  "recommendations": [
    {
      "element": "Title",
      "status": "Modification recommended",
      "current": "Current title",
      "suggested": "Suggested title",
      "reason": "Why the change is relevant.",
      "impact": "May improve keyword alignment and search-result clarity."
    }
  ],
  "generalNotes": [
    "Review changes before publishing."
  ]
}

TARGET KEYWORD:
${keyword}

CURRENT GOOGLE RANK:
${currentRank ?? "Not available"}

TARGET PAGE:
${targetPage}

PAGE TITLE:
${title || "Not available"}

META DESCRIPTION:
${metaDescription || "Not available"}

H1:
${typeof h1 === "string" ? h1 : JSON.stringify(h1)}

H2 / H3 HEADINGS:
${JSON.stringify(headings, null, 2)}

WORD COUNT:
${wordCount}

KEYWORD OCCURRENCES:
${keywordOccurrences}

CANONICAL:
${canonical || "Not available"}

ROBOTS:
${robots || "Not available"}

VIEWPORT:
${viewport || "Not available"}

LANGUAGE:
${language || "Not available"}

IMAGE INFORMATION:
${JSON.stringify(images, null, 2)}

INTERNAL LINKS:
${internalLinks}

EXTERNAL LINKS:
${externalLinks}

PAGE CONTENT:
${String(content || "Not available").slice(0, 6000)}

GOOGLE SERP TITLE:
${serpTitle || "Not available"}

GOOGLE SERP SNIPPET:
${serpSnippet || "Not available"}
`;

    const result = await model.generateContent(prompt);
    const parsed = parseGeminiJSON(
      result.response.text()
    );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error(
        "Gemini returned an invalid optimization structure."
      );
    }

    const allowedStatuses = new Set([
      "Modification recommended",
      "No major change required",
      "Improvement possible",
    ]);

    const recommendations = parsed.recommendations
      .slice(0, 8)
      .map((item) => {
        const status = allowedStatuses.has(item.status)
          ? item.status
          : "Improvement possible";

        return {
          element: item.element || "SEO element",
          status,
          current: item.current || "",
          suggested:
            status === "No major change required"
              ? ""
              : item.suggested || "",
          reason: item.reason || "",
          impact: item.impact || "",
        };
      });

    return {
      keyword,
      currentRank: currentRank ?? "Not available",
      targetPage,
      recommendations,
      generalNotes: Array.isArray(parsed.generalNotes)
        ? parsed.generalNotes
            .map((note) => String(note))
            .slice(0, 5)
        : [],
    };
  } catch (error) {
    console.error(
      "❌ Gemini keyword optimization error:",
      error.message
    );

    throw error;
  }
};