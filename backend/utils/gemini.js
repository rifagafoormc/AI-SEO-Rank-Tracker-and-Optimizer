import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSeoSuggestions = async (url, results) => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });

    const prompt = `
Website: ${url}

Keyword ranking results:
${JSON.stringify(results, null, 2)}

Give 4 short SEO improvement suggestions.
`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Gemini Error:', error.message);

    // Return fallback instead of crashing
    return 'AI suggestions could not be generated at the moment.';
  }
};