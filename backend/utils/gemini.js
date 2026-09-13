import { GoogleGenerativeAI } from '@google/generative-ai';

const getGeminiModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  return genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
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
    console.log('🤖 Checking keyword relevance...');

    const model = getGeminiModel();

    /*
     * Build additional evidence from SERP results.
     *
     * If the website itself blocks our request (403),
     * SERP results can still provide useful information
     * about what the website is ranking for.
     */
    const serpEvidence = rankingResults.map((item) => ({
      keyword: item.keyword,
      rank: item.rank,
      found: item.found,
      searchEvidence: item.serpTitle || '',
      searchSnippet: item.serpSnippet || '',
    }));

    const hasWebsiteContext =
      Boolean(websiteContext.title) ||
      Boolean(websiteContext.description) ||
      websiteContext.headings?.length > 0 ||
      Boolean(websiteContext.content);

    const prompt = `
You are an SEO keyword relevance analyzer.

Your task is to determine whether each target keyword is genuinely
relevant to the website.

IMPORTANT:

1. A keyword is RELEVANT if it naturally matches the website's
   primary topic, products, services, audience, or search intent.

2. A keyword is UNRELATED if targeting it would require the website
   to change its primary business/topic.

3. Do NOT consider a keyword relevant merely because it could
   technically be added to the website.

4. Do NOT recommend keyword stuffing.

5. A website should NOT target unrelated keywords simply to obtain
   search traffic.

6. When website content is available, use it as the strongest evidence.

7. When website content is unavailable because the website blocks
   automated access, you MAY use:
   - the website domain
   - SERP ranking evidence
   - SERP title
   - SERP snippet
   - the apparent business/topic of the website

8. If there is genuinely not enough evidence to determine relevance,
   return "relevant": null.

9. NEVER return relevant=false merely because website content is
   unavailable.

10. Confidence must represent confidence in the classification.
    If relevance cannot be determined, confidence should be 0-30.

WEBSITE DOMAIN:
${domain}

WEBSITE CONTENT AVAILABLE:
${hasWebsiteContext ? 'YES' : 'NO'}

WEBSITE INFORMATION:

Title:
${websiteContext.title || 'Not available'}

Meta Description:
${websiteContext.description || 'Not available'}

Headings:
${websiteContext.headings?.join(' | ') || 'Not available'}

Website Content:
${websiteContext.content || 'Not available'}


SERP EVIDENCE:

${JSON.stringify(serpEvidence, null, 2)}


TARGET KEYWORDS:

${JSON.stringify(keywords, null, 2)}


Return ONLY valid JSON.

Return exactly one object for every keyword.

Format:

[
  {
    "keyword": "example keyword",
    "relevant": true,
    "confidence": 95,
    "reason": "Short explanation"
  }
]

The "relevant" value MUST be one of:

true
false
null

Use true when clearly relevant.
Use false when clearly unrelated.
Use null when there is insufficient evidence.

Do not include markdown.
Do not include code fences.
`;

    const result = await model.generateContent(prompt);

    const text = result.response.text().trim();

    console.log('🤖 Gemini relevance response:', text);

    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText);

    /*
     * Validate Gemini's response before returning it.
     */
    return keywords.map((keyword) => {
      const item = parsed.find(
        (result) =>
          result.keyword?.toLowerCase().trim() ===
          keyword.toLowerCase().trim()
      );

      if (!item) {
        return {
          keyword,
          relevant: null,
          confidence: 0,
          reason: 'Relevance could not be determined.',
        };
      }

      return {
        keyword,
        relevant:
          item.relevant === true
            ? true
            : item.relevant === false
            ? false
            : null,
        confidence: Math.max(
          0,
          Math.min(100, Number(item.confidence) || 0)
        ),
        reason:
          item.reason ||
          'Relevance could not be determined.',
      };
    });

  } catch (error) {
    console.error('❌ Gemini relevance check error:', error);

    /*
     * IMPORTANT:
     * If Gemini itself fails, use null rather than false.
     *
     * null = unknown
     * false = definitely unrelated
     */
    return keywords.map((keyword) => ({
      keyword,
      relevant: null,
      confidence: 0,
      reason: 'Relevance could not be determined because the AI analysis failed.',
    }));
  }
};


/*
====================================================
2. GENERATE SEO SUGGESTIONS
====================================================
*/

export const generateSeoSuggestions = async (
  url,
  results
) => {
  try {
    console.log('🤖 Generating SEO suggestions...');

    const model = getGeminiModel();

    /*
     * ONLY clearly relevant keywords are allowed
     * to reach the optimization stage.
     */
    const relevantResults = results.filter(
      (item) => item.relevant === true
    );

    if (relevantResults.length === 0) {
      return 'No SEO optimization suggestions were generated because no keywords were confirmed as relevant to this website.';
    }

    const prompt = `
You are an SEO optimization expert.

Website:
${url}

Relevant keyword ranking results:
${JSON.stringify(relevantResults, null, 2)}

Generate useful SEO optimization suggestions ONLY for the
keywords that have been confirmed as relevant.

IMPORTANT:

- Do NOT recommend unrelated keywords.
- Do NOT recommend keyword stuffing.
- Do NOT suggest changing the website's primary business/topic.
- Do NOT recommend artificially inserting keywords.
- Suggestions must naturally fit the website.
- Consider the current Google ranking.
- A keyword that is already ranking highly may need refinement
  rather than basic keyword insertion.
- Focus on realistic, actionable SEO improvements.

For each relevant keyword, provide up to 4 suggestions.

Use this structure:

Keyword: [keyword]

• Suggestion
• Suggestion
• Suggestion
• Suggestion
`;

    const result = await model.generateContent(prompt);

    return result.response.text();

  } catch (error) {
    console.error('❌ Gemini SEO suggestion error:', error);

    return 'AI suggestions could not be generated at the moment.';
  }
};