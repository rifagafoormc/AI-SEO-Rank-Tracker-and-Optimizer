import axios from "axios";
import Performance from "../models/Performance.js";

export const analyzePerformance = async (req, res) => {
  try {
    const { websiteUrl, strategy = "desktop" } = req.body;
    const userId = req.user.id;

    if (!websiteUrl) {
      return res.status(400).json({
        success: false,
        message: "Website URL is required",
      });
    }

    // Validate URL format
    try {
      new URL(websiteUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format. Please include http:// or https://",
      });
    }

    // Call Google PageSpeed Insights API
    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Google PageSpeed API key is not configured",
      });
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
      websiteUrl
    )}&strategy=${strategy}&key=${apiKey}`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    // Extract performance metrics
    const lighthouseResult = data.lighthouseResult;
    const categories = lighthouseResult.categories;
    const audits = lighthouseResult.audits;

    const performanceScore = categories.performance?.score * 100 || null;
    const fcp = audits["first-contentful-paint"]?.numericValue || null;
    const lcp = audits["largest-contentful-paint"]?.numericValue || null;
    const cls = audits["cumulative-layout-shift"]?.numericValue || null;
    const tbt = audits["total-blocking-time"]?.numericValue || null;

    // Save to database
    const performanceData = new Performance({
      userId,
      websiteUrl,
      performance: performanceScore,
      fcp,
      lcp,
      cls,
      tbt,
      strategy,
      status: "completed",
    });

    await performanceData.save();

    res.status(201).json({
      success: true,
      message: "Performance analysis completed successfully",
      data: {
        performance: performanceScore,
        fcp,
        lcp,
        cls,
        tbt,
        strategy,
        websiteUrl,
        id: performanceData._id,
        createdAt: performanceData.createdAt,
      },
    });
  } catch (error) {
    console.error("Performance Analysis Error:", error);

    // Save failed attempt if userId exists
    if (req.user?.id && req.body?.websiteUrl) {
      try {
        const failedData = new Performance({
          userId: req.user.id,
          websiteUrl: req.body.websiteUrl,
          status: "failed",
          strategy: req.body.strategy || "desktop",
        });
        await failedData.save();
      } catch (saveError) {
        console.error("Failed to save error record:", saveError);
      }
    }

    // Handle API-specific errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || "PageSpeed API error";

      if (status === 400) {
        return res.status(400).json({
          success: false,
          message: "Invalid URL or PageSpeed API request",
          details: message,
        });
      }

      if (status === 403) {
        return res.status(403).json({
          success: false,
          message: "PageSpeed API key is invalid or quota exceeded",
          details: message,
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to analyze performance",
      error: error.message,
    });
  }
};