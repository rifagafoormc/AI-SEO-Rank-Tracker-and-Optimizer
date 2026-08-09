import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import mongoose from 'mongoose';

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    // Get total analyses
    const totalAnalyses = await Analysis.countDocuments();

    // Get analyses today
    const analysesToday = await Analysis.countDocuments({
      createdAt: { $gte: today }
    });

    // Get unique websites analyzed
    const uniqueWebsites = await Analysis.distinct('websiteUrl');
    const totalUniqueWebsites = uniqueWebsites.length;

    // Get analyses by status
    const completedAnalyses = await Analysis.countDocuments({ status: 'completed' });
    const pendingAnalyses = await Analysis.countDocuments({ status: 'pending' });
    const failedAnalyses = await Analysis.countDocuments({ status: 'failed' });

    // Get AI suggestions count (total and today)
    const totalAiSuggestions = await Analysis.countDocuments({
      aiSuggestions: { $ne: null, $ne: '' }
    });

    const aiSuggestionsToday = await Analysis.countDocuments({
      aiSuggestions: { $ne: null, $ne: '' },
      createdAt: { $gte: today }
    });

    // Get average performance score (from pageSpeedData)
    const allAnalyses = await Analysis.find({
      'pageSpeedData.performance': { $ne: null }
    });

    let avgPerformance = 0;
    if (allAnalyses.length > 0) {
      const totalScore = allAnalyses.reduce((acc, item) => {
        return acc + (item.pageSpeedData?.performance || 0);
      }, 0);
      avgPerformance = Math.round(totalScore / allAnalyses.length);
    }

    // Get recent analyses (last 10)
    const recentAnalyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    // Format recent analyses
    const formattedRecent = recentAnalyses.map(item => {
      let website = 'Unknown';
      try {
        if (item.websiteUrl) {
          const url = item.websiteUrl.startsWith('http') 
            ? item.websiteUrl 
            : `https://${item.websiteUrl}`;
          website = new URL(url).hostname;
        }
      } catch (e) {
        website = item.websiteUrl || 'Unknown';
      }

      return {
        id: item._id,
        user: item.userId?.name || 'Unknown User',
        email: item.userId?.email || 'No email',
        website,
        performanceScore: item.pageSpeedData?.performance || 0,
        keywords: item.keywords?.length || 0,
        date: item.createdAt,
        status: item.status || 'completed',
        hasAiSuggestions: !!item.aiSuggestions
      };
    });

    // Get daily activity for chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyActivity = await Analysis.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    const chartData = dailyActivity.map(item => ({
      date: `${item._id.month}/${item._id.day}`,
      analyses: item.count
    }));

    // System status (check API keys)
    const systemStatus = {
      mongodb: 'Connected',
      serpApi: process.env.SERP_API_KEY ? 'Available' : 'Missing API Key',
      pageSpeedApi: process.env.GOOGLE_PAGESPEED_API_KEY ? 'Available' : 'Missing API Key',
      geminiApi: process.env.GEMINI_API_KEY ? 'Available' : 'Missing API Key',
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsersToday,
          totalAnalyses,
          analysesToday,
          totalUniqueWebsites,
          avgPerformance,
        },
        statusCounts: {
          completed: completedAnalyses,
          pending: pendingAnalyses,
          failed: failedAnalyses,
        },
        aiStats: {
          totalAiSuggestions,
          aiSuggestionsToday,
        },
        recentAnalyses: formattedRecent,
        chartData,
        systemStatus,
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics',
    });
  }
};

// Get AI usage stats (for the AI usage dashboard)
export const getAIUsageStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's analyses with AI suggestions
    const todayAnalyses = await Analysis.find({
      createdAt: { $gte: today },
      aiSuggestions: { $ne: null, $ne: '' }
    });

    // Get unique users who used AI today
    const uniqueUsersToday = await Analysis.distinct('userId', {
      createdAt: { $gte: today },
      aiSuggestions: { $ne: null, $ne: '' }
    });

    // Get unique URLs analyzed today
    const uniqueUrlsToday = await Analysis.distinct('websiteUrl', {
      createdAt: { $gte: today }
    });

    // Get total AI insights generated
    const totalAiInsights = await Analysis.countDocuments({
      aiSuggestions: { $ne: null, $ne: '' }
    });

    // Daily limit (can be configured)
    const dailyLimit = 100;

    res.status(200).json({
      success: true,
      data: {
        dailyRequests: todayAnalyses.length,
        dailyLimit,
        activeUsers: uniqueUsersToday.length,
        aiInsights: totalAiInsights,
        uniqueUrls: uniqueUrlsToday.length,
        usagePercentage: Math.round((todayAnalyses.length / dailyLimit) * 100),
      }
    });

  } catch (error) {
    console.error('Error fetching AI usage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage statistics',
    });
  }
};

// ✅ NEW: Get all users (except the requesting admin)
export const getAllUsers = async (req, res) => {
  try {
    // Get all users except the current admin
    const users = await User.find({ 
      _id: { $ne: req.userId } 
    }).select('-password').sort({ createdAt: -1 });

    // Get analysis count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const analysisCount = await Analysis.countDocuments({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          analysisCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithCounts,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

// ✅ NEW: Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users',
      });
    }

    // Delete all analyses for this user
    await Analysis.deleteMany({ userId: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};