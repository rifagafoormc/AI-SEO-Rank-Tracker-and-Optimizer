// gemini.js

import { GoogleGenerativeAI } from "@google/generative-ai";

/*
====================================================
GEMINI MODEL
====================================================
*/

const getGeminiModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });
};

/*
====================================================
1. CHECK KEYWORD RELEVANCE
====================================================
*/

export const checkKeywordRelevance = async (
  websiteContext,
  keywords,
  domain,
  rankingResults
) => {
  try {
    console.log("🤖 Checking keyword relevance...");

    const model = getGeminiModel();

    const serpEvidence = rankingResults.map((item) => ({
      keyword: item.keyword,
      rank: item.rank,
      serpTitle: item.serpTitle || "",
      serpSnippet: item.serpSnippet || "",
    }));

    const prompt = `
You are an SEO keyword relevance analyzer.

Your task is to determine whether each target keyword is genuinely
relevant to the website based on the website content and Google SERP
evidence provided.

Do NOT assume a keyword is relevant simply because the website ranks
for it.

A keyword should be considered relevant when it is reasonably connected
to the website's actual topic, products, services, or content.

Return ONLY valid JSON as an array.

For each keyword return:

{
  "keyword": "keyword",
  "relevant": true,
  "confidence": 85,
  "reason": "Short explanation"
}

The "relevant" value must be:
- true
- false
- null

Use null when there is insufficient evidence.

WEBSITE DOMAIN:
${domain}

WEBSITE TITLE:
${websiteContext.title || "Not available"}

META DESCRIPTION:
${websiteContext.description || "Not available"}

HEADINGS:
${JSON.stringify(websiteContext.headings || [], null, 2)}

WEBSITE CONTENT:
${websiteContext.content || "Not available"}

GOOGLE SERP EVIDENCE:
${JSON.stringify(serpEvidence, null, 2)}

TARGET KEYWORDS:
${JSON.stringify(keywords, null, 2)}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed)) {
      throw new Error("Gemini returned an invalid relevance format.");
    }

    return parsed.map((item) => ({
      keyword: item.keyword || "",
      relevant:
        item.relevant === true
          ? true
          : item.relevant === false
          ? false
          : null,
      confidence: Number(item.confidence) || 0,
      reason:
        item.reason ||
        "Gemini could not determine keyword relevance.",
    }));

  } catch (error) {
    console.error(
      "❌ Gemini keyword relevance error:",
      error.message
    );

    throw error;
  }
};

/*
====================================================
2. GENERATE SEO SUGGESTIONS (legacy — no longer used
   by analysisController.js, kept for compatibility)
====================================================
*/

export const generateSeoSuggestions = async (
  url,
  results
) => {
  try {
    console.log("🤖 Generating SEO optimization suggestions...");

    const model = getGeminiModel();

    const relevantResults = results.filter(
      (item) => item.relevant === true
    );

    if (relevantResults.length === 0) {
      return "No optimization suggestions were generated because no relevant keywords were identified.";
    }

    const prompt = `
You are an SEO optimization assistant.

Generate practical SEO optimization suggestions for the website below.

IMPORTANT RULES:

1. Only consider keywords where "relevant" is true.

2. Do NOT recommend unrelated keywords.

3. Do NOT recommend keyword stuffing.

4. Do NOT change the website's primary business or topic.

5. Suggestions should focus on improving the website's ability to
   target the relevant keywords.

6. Consider the Google ranking information provided.

7. Do not claim that a specific SEO change will guarantee a ranking
   improvement.

8. Keep the recommendations practical and understandable.

WEBSITE:
${url}

RELEVANT KEYWORD RESULTS:
${JSON.stringify(relevantResults, null, 2)}

Provide clear SEO recommendations for the relevant keywords.
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

/*
====================================================
3. GENERATE AUDIT OPTIMIZATION SUGGESTIONS
   (unchanged — used by the SEO Audit module)
====================================================
*/

export const generateAuditOptimizationSuggestions = async (
  auditData
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
You are an SEO optimization assistant.

You are given the results of an automated SEO audit for a website.

Your task is to generate practical SEO optimization recommendations
based ONLY on the audit information provided.

IMPORTANT RULES:

1. Do NOT invent problems that are not present in the audit data.

2. Do NOT recommend fixing something that has already passed the
corresponding audit check unless the recommendation is clearly
an improvement supported by the available data.

3. Prioritize actual failed checks and the detected issues list.

4. Every recommendation must be connected to evidence from the audit.

5. Do NOT recommend keyword stuffing.

6. Do NOT recommend unrelated keywords.

7. Do NOT recommend changing the website's primary business or topic.

8. Do NOT make recommendations about Core Web Vitals, backlinks,
keyword rankings, or other metrics that are not included in this
audit data.

9. Keep recommendations practical and understandable.

10. If an issue is already satisfactory, do not present it as a problem.

11. Do not create recommendations for issues that are not present
in the "DETECTED SEO ISSUES" section.

12. Return a maximum of 8 recommendations.

For every recommendation return:

- issue: the detected SEO issue
- evidence: the specific audit evidence supporting the recommendation
- recommendation: what the website owner should do

Return ONLY valid JSON as an array.

Format:

[
  {
    "issue": "Missing meta description",
    "evidence": "No meta description was detected.",
    "recommendation": "Add a concise meta description that accurately summarizes the page content and encourages relevant users to click."
  }
]

WEBSITE:
${url}

SEO SCORE:
${score}

PAGE TITLE:
${title || "Not available"}

TITLE LENGTH:
${titleLength}

META DESCRIPTION:
${metaDescription || "Not available"}

META DESCRIPTION LENGTH:
${metaDescriptionLength}

CANONICAL:
${canonical || "Not available"}

ROBOTS:
${robots || "Not available"}

OPEN GRAPH:
${openGraph ? "Detected" : "Not detected"}

VIEWPORT:
${viewport ? "Detected" : "Not detected"}

HTML LANGUAGE:
${language || "Not available"}

STRUCTURED DATA:
${structuredData ? "Detected" : "Not detected"}

STRUCTURED DATA COUNT:
${structuredDataCount}

HEADINGS:
${JSON.stringify(headings || {}, null, 2)}

IMAGES:
${JSON.stringify(images || {}, null, 2)}

LINKS:
${JSON.stringify(links || {}, null, 2)}

WORD COUNT:
${wordCount}

PAGE LOAD TIME:
${loadTime} ms

SEO CHECKS:
${JSON.stringify(checks || {}, null, 2)}

DETECTED SEO ISSUES:
${JSON.stringify(issues || [], null, 2)}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Gemini returned an invalid suggestion format."
      );
    }

    return parsed.map((item) => ({
      issue: item.issue || "SEO issue",
      evidence:
        item.evidence ||
        "Based on the audit results.",
      recommendation:
        item.recommendation ||
        "Review this issue and make the appropriate SEO improvement.",
    }));

  } catch (error) {
    console.error(
      "❌ Gemini SEO audit suggestion error:",
      error.message
    );

    throw error;
  }
};

/*
====================================================
4. GENERATE KEYWORD-SPECIFIC OPTIMIZATION
====================================================
*/

export const generateKeywordOptimization = async (payload) => {
  try {
    console.log("🤖 Generating keyword-specific optimization...");

    const model = getGeminiModel();

    const {
      keyword,
      currentRank,
      targetPage,
      title,
      metaDescription,
      h1,
      headings,
      content,
      wordCount,
      images,
      internalLinks,
      externalLinks,
      keywordOccurrences,
      serpTitle,
      serpSnippet,
      canonical,
      robots,
      viewport,
      language,
    } = payload;

    const prompt = `
You are an SEO optimization assistant.

You are given one target keyword and the actual on-page SEO elements
of the page that currently ranks (or should rank) for it.

Your task is to produce concrete, page-specific optimization
recommendations for THIS keyword on THIS page.

IMPORTANT RULES:

1. Only produce recommendations that are directly supported by the
provided page data. Do NOT invent elements that were not provided.

2. Do NOT recommend keyword stuffing.

3. Do NOT recommend unrelated keywords.

4. Do NOT change the website's primary business or topic.

5. Do NOT guarantee ranking improvements. Use cautious language.

6. Every recommendation must include:
   - element: which on-page element it refers to
   - status: one of
     "Modification recommended" | "No major change required" | "Improvement possible"
   - current: the current value (or a short description if it is long)
   - suggested: the suggested improved value (or "" if no change)
   - reason: short explanation
   - impact: short, cautious description of the potential benefit

7. If an element is already well-optimized for this keyword, use
   status "No major change required", suggested "", and explain why.

8. Return a maximum of 8 recommendations, prioritized by impact.

9. Also return a "generalNotes" array of short, cautious, high-level
   reminders (max 5).

10. Return ONLY valid JSON in the following exact format:

{
  "keyword": "${keyword}",
  "currentRank": ${typeof currentRank === 'number' ? currentRank : JSON.stringify(currentRank)},
  "targetPage": "${targetPage}",
  "recommendations": [
    {
      "element": "Title",
      "status": "Modification recommended",
      "current": "...",
      "suggested": "...",
      "reason": "...",
      "impact": "..."
    }
  ],
  "generalNotes": [
    "..."
  ]
}

TARGET KEYWORD:
${keyword}

CURRENT GOOGLE RANK:
${currentRank}

TARGET PAGE:
${targetPage}

PAGE TITLE:
${title || "Not available"}

META DESCRIPTION:
${metaDescription || "Not available"}

H1:
${h1 || "Not available"}

H2 / H3 HEADINGS:
${JSON.stringify(headings || {}, null, 2)}

WORD COUNT:
${wordCount}

KEYWORD OCCURRENCES ON PAGE:
${keywordOccurrences}

CANONICAL:
${canonical || "Not available"}

ROBOTS:
${robots || "Not available"}

VIEWPORT:
${viewport || "Not available"}

HTML LANGUAGE:
${language || "Not available"}

IMAGES:
${JSON.stringify(images || {}, null, 2)}

INTERNAL LINKS: ${internalLinks}
EXTERNAL LINKS: ${externalLinks}

PAGE CONTENT (truncated):
${content || "Not available"}

GOOGLE SERP TITLE FOR THIS KEYWORD:
${serpTitle || "Not available"}

GOOGLE SERP SNIPPET FOR THIS KEYWORD:
${serpSnippet || "Not available"}
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      console.error("❌ Failed to parse Gemini optimization JSON:", cleanedText);
      throw new Error("Gemini returned an invalid optimization format.");
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray(parsed.recommendations)
    ) {
      throw new Error("Gemini returned an invalid optimization structure.");
    }

    const normalized = {
      keyword: parsed.keyword || keyword,
      currentRank:
        parsed.currentRank !== undefined ? parsed.currentRank : currentRank,
      targetPage: parsed.targetPage || targetPage,
      recommendations: parsed.recommendations.map((r) => ({
        element: r.element || "Element",
        status: r.status || "Improvement possible",
        current: r.current || "",
        suggested: r.suggested || "",
        reason: r.reason || "",
        impact: r.impact || "",
      })),
      generalNotes: Array.isArray(parsed.generalNotes)
        ? parsed.generalNotes.map((n) => String(n)).slice(0, 5)
        : [],
    };

    return normalized;

  } catch (error) {
    console.error(
      "❌ Gemini keyword optimization error:",
      error.message
    );

    throw error;
  }
};