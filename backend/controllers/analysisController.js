

import axios from 'axios';

export const analyzeWebsite = async (req, res) => {
  try {
    const { url, keywords } = req.body;

    // Validate input
    if (!url || !keywords) {
      return res.status(400).json({
        success: false,
        message: 'Website URL and keywords are required',
      });
    }

    // Convert keywords into array
    const keywordArray = keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    // Add https:// automatically if missing
    const normalizedUrl = url.startsWith('http')
      ? url
      : `https://${url}`;

    // Extract domain
    const domain = new URL(normalizedUrl).hostname.replace('www.', '');

    const results = [];

    // Check each keyword
    for (const keyword of keywordArray) {
      const response = await axios.get(
        'https://serpapi.com/search.json',
        {
          params: {
            engine: 'google',
            q: keyword,
              gl: 'in',
              hl: 'en',
            num: 100,
            api_key: process.env.SERP_API_KEY,
          },
        }
      );

      const organicResults = response.data.organic_results || [];

      let rank = null;

//console.log(`Searching for domain: ${domain}`);

for (const item of organicResults) {
  try {
    //console.log(item.position, item.link);

    if (item.link.includes(domain)) {
      rank = item.position;
      break;
    }
  } catch (err) {
    console.log(err.message);
  }
}

      results.push({
        keyword,
        rank: rank || 'Not Found',
        page: rank ? Math.ceil(rank / 10) : '-',
        found: !!rank,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Real Google rank tracking completed',
      data: {
        url: normalizedUrl,
        results,
      },
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: 'Rank tracking failed',
    });
  }
};

