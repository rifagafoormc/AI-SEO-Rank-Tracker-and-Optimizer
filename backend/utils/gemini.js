import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateSeoSuggestions = async (url, results) => {
  try {
    console.log('SERVER KEY END:', process.env.GEMINI_API_KEY?.slice(-4));

    // Create the client INSIDE the function
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
    });

    const prompt = `
Website: ${url}

Keyword ranking results:
${JSON.stringify(results, null, 2)}

Give 4 short SEO improvement suggestions for this website.
Use bullet points and keep it concise.
`;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'AI suggestions could not be generated at the moment.';
  }
};