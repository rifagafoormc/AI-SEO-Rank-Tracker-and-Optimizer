import axios from "axios";
import Performance from "../models/Performance.js";

export const analyzePerformance = async (req, res) => {
  let normalizedWebsiteUrl = "";

  try {
    const { websiteUrl, strategy = "desktop" } = req.body;
    const userId = req.user.id;

    // ----------------------------------------
    // Validate website URL
    // ----------------------------------------

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a website URL.",
      });
    }

    normalizedWebsiteUrl = websiteUrl.trim();

    if (!normalizedWebsiteUrl) {
      return res.status(400).json({
        success: false,
        message: "Please enter a website URL.",
      });
    }

    // Automatically add HTTPS when protocol is missing
    if (
      !normalizedWebsiteUrl.startsWith("http://") &&
      !normalizedWebsiteUrl.startsWith("https://")
    ) {
      normalizedWebsiteUrl = `https://${normalizedWebsiteUrl}`;
    }

    // Validate normalized URL
    try {
      new URL(normalizedWebsiteUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid website URL.",
      });
    }

    // ----------------------------------------
    // Validate strategy
    // ----------------------------------------

    const allowedStrategies = ["desktop", "mobile"];

    if (!allowedStrategies.includes(strategy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid performance strategy.",
      });
    }

    // ----------------------------------------
    // Get PageSpeed API key
    // ----------------------------------------

    const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Google PageSpeed API key is not configured.",
      });
    }

    // ----------------------------------------
    // Build PageSpeed API URL
    // ----------------------------------------

    const apiUrl =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(normalizedWebsiteUrl)}` +
      `&strategy=${strategy}` +
      `&key=${apiKey}`;

    console.log(
      `🚀 PageSpeed Analysis | url=${normalizedWebsiteUrl} | strategy=${strategy}`
    );

    // ----------------------------------------
    // Call Google PageSpeed Insights
    // ----------------------------------------

    const response = await axios.get(apiUrl, {
      timeout: 60000,
    });

    const data = response.data;

    const lighthouseResult = data.lighthouseResult;

    if (!lighthouseResult) {
      throw new Error("PageSpeed response did not contain Lighthouse data.");
    }

    const categories = lighthouseResult.categories || {};
    const audits = lighthouseResult.audits || {};

    // ----------------------------------------
    // Extract performance score
    // ----------------------------------------

    const performanceScore =
      categories.performance?.score !== undefined &&
      categories.performance?.score !== null
        ? categories.performance.score * 100
        : null;

    // ----------------------------------------
    // Extract Core Web Vitals / metrics
    // ----------------------------------------

    const fcp =
      audits["first-contentful-paint"]?.numericValue ?? null;

    const lcp =
      audits["largest-contentful-paint"]?.numericValue ?? null;

    const cls =
      audits["cumulative-layout-shift"]?.numericValue ?? null;

    const tbt =
      audits["total-blocking-time"]?.numericValue ?? null;

    // ----------------------------------------
    // Save successful analysis
    // ----------------------------------------

    const performanceData = new Performance({
      userId,
      websiteUrl: normalizedWebsiteUrl,
      performance: performanceScore,
      fcp,
      lcp,
      cls,
      tbt,
      strategy,
      status: "completed",
    });

    await performanceData.save();

    console.log(
      `✅ PageSpeed Analysis Completed | score=${performanceScore}`
    );

    // ----------------------------------------
    // Send response
    // ----------------------------------------

    return res.status(201).json({
      success: true,
      message: "Performance analysis completed successfully",
      data: {
        performance: performanceScore,
        fcp,
        lcp,
        cls,
        tbt,
        strategy,
        websiteUrl: normalizedWebsiteUrl,
        id: performanceData._id,
        createdAt: performanceData.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Performance Analysis Error:", error);

    // ----------------------------------------
    // Save failed analysis
    // ----------------------------------------

    if (req.user?.id && normalizedWebsiteUrl) {
      try {
        const failedData = new Performance({
          userId: req.user.id,
          websiteUrl: normalizedWebsiteUrl,
          status: "failed",
          strategy: req.body?.strategy || "desktop",
        });

        await failedData.save();
      } catch (saveError) {
        console.error(
          "Failed to save error record:",
          saveError
        );
      }
    }

    // ----------------------------------------
    // PageSpeed API errors
    // ----------------------------------------

    if (error.response) {
      const status = error.response.status;

      const apiMessage =
        error.response.data?.error?.message ||
        "PageSpeed API error";

      console.error(
        `PageSpeed API Error | status=${status} | message=${apiMessage}`
      );

      if (status === 400) {
        return res.status(400).json({
          success: false,
          message:
            "The website URL could not be processed by PageSpeed Insights.",
          details: apiMessage,
        });
      }

      if (status === 403) {
        return res.status(403).json({
          success: false,
          message:
            "PageSpeed Insights access is unavailable. The API key may be invalid or the API quota may have been exceeded.",
          details: apiMessage,
        });
      }

      if (status === 429) {
        return res.status(429).json({
          success: false,
          message:
            "PageSpeed Insights is temporarily limiting requests. Please wait a moment and try again.",
          details: apiMessage,
        });
      }

      if (status >= 500) {
        return res.status(502).json({
          success: false,
          message:
            "Google PageSpeed Insights is temporarily unavailable. Please try again later.",
          details: apiMessage,
        });
      }
    }

    // ----------------------------------------
    // Timeout
    // ----------------------------------------

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return res.status(504).json({
        success: false,
        message:
          "The performance analysis took too long to complete. Please try again.",
      });
    }

    // ----------------------------------------
    // Network / connection error
    // ----------------------------------------

    if (error.request && !error.response) {
      return res.status(502).json({
        success: false,
        message:
          "We couldn't connect to Google PageSpeed Insights. Please try again.",
      });
    }

    // ----------------------------------------
    // Generic error
    // ----------------------------------------

    return res.status(500).json({
      success: false,
      message:
        "We couldn't complete the performance analysis. Please try again.",
    });
  }
};