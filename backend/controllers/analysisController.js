export const analyzeWebsite = async (req, res) => {
  try {
    const { url, keywords } = req.body;

    console.log("Website:", url);
    console.log("Keywords:", keywords);

    res.status(200).json({
      success: true,
      message: "Analysis request received successfully",
      data: {
        url,
        keywords,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};