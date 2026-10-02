import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import Audit from '../models/Audit.js';
import Performance from '../models/Performance.js';

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    // Only regular users, not admins
    const totalUsers = await User.countDocuments({
      role: 'user'
    });

    // Start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: today }
    });

    // --------------------------------------------------
    // SEO ANALYSIS
    // --------------------------------------------------

    const totalAnalyses = await Analysis.countDocuments();

    const analysesToday = await Analysis.countDocuments({
      createdAt: { $gte: today }
    });

    const completedAnalyses = await Analysis.countDocuments({
      status: 'completed'
    });

    const pendingAnalyses = await Analysis.countDocuments({
      status: 'pending'
    });

    const failedAnalyses = await Analysis.countDocuments({
      status: 'failed'
    });

    // --------------------------------------------------
    // SEO AUDIT
    // --------------------------------------------------

    const totalAudits = await Audit.countDocuments();

    const auditsToday = await Audit.countDocuments({
      createdAt: { $gte: today }
    });

    const completedAudits = await Audit.countDocuments({
      status: 'completed'
    });

    const failedAudits = await Audit.countDocuments({
      status: 'failed'
    });

    // Average SEO audit score
    const auditScoreData = await Audit.aggregate([
      {
        $match: {
          seoScore: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$seoScore' }
        }
      }
    ]);

    const avgAuditScore =
      auditScoreData.length > 0
        ? Math.round(auditScoreData[0].averageScore)
        : 0;

    // --------------------------------------------------
    // PERFORMANCE
    // --------------------------------------------------

    const totalPerformanceChecks = await Performance.countDocuments();

    const performanceChecksToday = await Performance.countDocuments({
      createdAt: { $gte: today }
    });

    const completedPerformanceChecks = await Performance.countDocuments({
      status: 'completed'
    });

    const failedPerformanceChecks = await Performance.countDocuments({
      status: 'failed'
    });

    // Average PageSpeed performance score
    const performanceScoreData = await Performance.aggregate([
      {
        $match: {
          performance: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$performance' }
        }
      }
    ]);

    const avgPerformance =
      performanceScoreData.length > 0
        ? Math.round(performanceScoreData[0].averageScore)
        : 0;

    // --------------------------------------------------
    // UNIQUE WEBSITES
    // --------------------------------------------------

    const [
      analysisWebsites,
      auditWebsites,
      performanceWebsites
    ] = await Promise.all([
      Analysis.distinct('websiteUrl'),
      Audit.distinct('websiteUrl'),
      Performance.distinct('websiteUrl')
    ]);

    const allWebsites = new Set([
      ...analysisWebsites,
      ...auditWebsites,
      ...performanceWebsites
    ]);

    const totalUniqueWebsites = allWebsites.size;

    // --------------------------------------------------
    // AI SUGGESTIONS
    // --------------------------------------------------

    // Analysis AI suggestions
    const analysisAiSuggestions = await Analysis.countDocuments({
      aiSuggestions: {
        $nin: [null, '']
      }
    });

    const analysisAiSuggestionsToday = await Analysis.countDocuments({
      aiSuggestions: {
        $nin: [null, '']
      },
      createdAt: { $gte: today }
    });

    // Audit AI suggestions
    const auditAiSuggestions = await Audit.countDocuments({
      'aiSuggestions.0': {
        $exists: true
      }
    });

    const auditAiSuggestionsToday = await Audit.countDocuments({
      'aiSuggestions.0': {
        $exists: true
      },
      createdAt: { $gte: today }
    });

    const totalAiSuggestions =
      analysisAiSuggestions + auditAiSuggestions;

    const aiSuggestionsToday =
      analysisAiSuggestionsToday + auditAiSuggestionsToday;

    // --------------------------------------------------
    // RECENT ACTIVITY
    // --------------------------------------------------

    const recentAnalyses = await Analysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    const recentAudits = await Audit.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    const recentPerformance = await Performance.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    // Convert website URL to hostname
    const getWebsiteName = (websiteUrl) => {
      if (!websiteUrl) {
        return 'Unknown';
      }

      try {
        const url = websiteUrl.startsWith('http')
          ? websiteUrl
          : `https://${websiteUrl}`;

        return new URL(url).hostname;
      } catch (error) {
        return websiteUrl;
      }
    };

    // Analysis activity
    const formattedAnalyses = recentAnalyses.map((item) => ({
      id: item._id,
      type: 'analysis',

      user: item.userId?.name || 'Unknown User',
      email: item.userId?.email || 'No email',

      website: getWebsiteName(item.websiteUrl),

      activity: 'SEO Analysis',
      details: `${item.keywords?.length || 0} keyword${
        item.keywords?.length === 1 ? '' : 's'
      } analyzed`,

      score: null,
      date: item.createdAt,

      status: item.status || 'completed',

      hasAiSuggestions:
        !!item.aiSuggestions &&
        item.aiSuggestions !== ''
    }));

    // Audit activity
    const formattedAudits = recentAudits.map((item) => ({
      id: item._id,
      type: 'audit',

      user: item.userId?.name || 'Unknown User',
      email: item.userId?.email || 'No email',

      website: getWebsiteName(item.websiteUrl),

      activity: 'SEO Audit',
      details:
        item.seoScore !== null && item.seoScore !== undefined
          ? `SEO Score: ${item.seoScore}/100`
          : 'SEO audit completed',

      score: item.seoScore ?? null,
      date: item.createdAt,

      status: item.status || 'completed',

      hasAiSuggestions:
        Array.isArray(item.aiSuggestions) &&
        item.aiSuggestions.length > 0
    }));

    // Performance activity
    const formattedPerformance = recentPerformance.map((item) => ({
      id: item._id,
      type: 'performance',

      user: item.userId?.name || 'Unknown User',
      email: item.userId?.email || 'No email',

      website: getWebsiteName(item.websiteUrl),

      activity: 'Performance Check',
      details:
        item.performance !== null &&
        item.performance !== undefined
          ? `Performance Score: ${item.performance}/100`
          : 'Performance check completed',

      score: item.performance ?? null,
      date: item.createdAt,

      status: item.status || 'completed',

      hasAiSuggestions: false
    }));

    // Combine all three types
    const recentActivity = [
      ...formattedAnalyses,
      ...formattedAudits,
      ...formattedPerformance
    ]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 10);

    // --------------------------------------------------
    // DAILY ACTIVITY - LAST 7 DAYS
    // --------------------------------------------------

    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(
      sevenDaysAgo.getDate() - 7
    );

    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      dailyAnalysis,
      dailyAudit,
      dailyPerformance
    ] = await Promise.all([
      Analysis.aggregate([
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
        }
      ]),

      Audit.aggregate([
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
        }
      ]),

      Performance.aggregate([
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
        }
      ])
    ]);

    // Combine daily activity
    const activityMap = {};

    const addDailyActivity = (data, type) => {
      data.forEach((item) => {
        const key =
          `${item._id.year}-${item._id.month}-${item._id.day}`;

        if (!activityMap[key]) {
          activityMap[key] = {
            date: `${item._id.month}/${item._id.day}`,
            analyses: 0,
            audits: 0,
            performance: 0,
            total: 0
          };
        }

        activityMap[key][type] += item.count;
        activityMap[key].total += item.count;
      });
    };

    addDailyActivity(
      dailyAnalysis,
      'analyses'
    );

    addDailyActivity(
      dailyAudit,
      'audits'
    );

    addDailyActivity(
      dailyPerformance,
      'performance'
    );

    const chartData = Object.values(activityMap);

    // --------------------------------------------------
    // SYSTEM STATUS
    // --------------------------------------------------

    const systemStatus = {
      mongodb: 'Connected',

      serpApi: process.env.SERP_API_KEY
        ? 'Available'
        : 'Missing API Key',

      pageSpeedApi:
        process.env.GOOGLE_PAGESPEED_API_KEY
          ? 'Available'
          : 'Missing API Key',

      geminiApi: process.env.GEMINI_API_KEY
        ? 'Available'
        : 'Missing API Key'
    };

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    res.status(200).json({
      success: true,

      data: {
        overview: {
          totalUsers,
          newUsersToday,

          totalAnalyses,
          analysesToday,

          totalAudits,
          auditsToday,

          totalPerformanceChecks,
          performanceChecksToday,

          totalUniqueWebsites,

          avgAuditScore,
          avgPerformance
        },

        statusCounts: {
          analyses: {
            completed: completedAnalyses,
            pending: pendingAnalyses,
            failed: failedAnalyses
          },

          audits: {
            completed: completedAudits,
            failed: failedAudits
          },

          performance: {
            completed: completedPerformanceChecks,
            failed: failedPerformanceChecks
          }
        },

        aiStats: {
          totalAiSuggestions,
          aiSuggestionsToday,

          analysisAiSuggestions,
          auditAiSuggestions
        },

        recentActivity,

        chartData,

        systemStatus
      }
    });

  } catch (error) {
    console.error(
      'Error fetching admin stats:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin statistics'
    });
  }
};


// --------------------------------------------------
// GET AI USAGE STATS
// --------------------------------------------------

export const getAIUsageStats = async (req, res) => {
  try {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    // Analysis AI usage
    const analysisAiToday =
      await Analysis.countDocuments({
        createdAt: { $gte: today },
        aiSuggestions: {
          $nin: [null, '']
        }
      });

    // Audit AI usage
    const auditAiToday =
      await Audit.countDocuments({
        createdAt: { $gte: today },
        'aiSuggestions.0': {
          $exists: true
        }
      });

    const dailyRequests =
      analysisAiToday + auditAiToday;

    // Unique users using AI today
    const analysisUsers =
      await Analysis.distinct('userId', {
        createdAt: { $gte: today },
        aiSuggestions: {
          $nin: [null, '']
        }
      });

    const auditUsers =
      await Audit.distinct('userId', {
        createdAt: { $gte: today },
        'aiSuggestions.0': {
          $exists: true
        }
      });

    const uniqueUsersToday =
      new Set([
        ...analysisUsers.map(String),
        ...auditUsers.map(String)
      ]);

    // Unique URLs analyzed today
    const [
      analysisUrls,
      auditUrls,
      performanceUrls
    ] = await Promise.all([
      Analysis.distinct('websiteUrl', {
        createdAt: { $gte: today }
      }),

      Audit.distinct('websiteUrl', {
        createdAt: { $gte: today }
      }),

      Performance.distinct('websiteUrl', {
        createdAt: { $gte: today }
      })
    ]);

    const uniqueUrlsToday =
      new Set([
        ...analysisUrls,
        ...auditUrls,
        ...performanceUrls
      ]);

    // Total AI insights
    const totalAnalysisInsights =
      await Analysis.countDocuments({
        aiSuggestions: {
          $nin: [null, '']
        }
      });

    const totalAuditInsights =
      await Audit.countDocuments({
        'aiSuggestions.0': {
          $exists: true
        }
      });

    const totalAiInsights =
      totalAnalysisInsights +
      totalAuditInsights;

    // Keep your existing dashboard limit
    const dailyLimit = 100;

    const usagePercentage =
      Math.round(
        (dailyRequests / dailyLimit) * 100
      );

    res.status(200).json({
      success: true,

      data: {
        dailyRequests,

        dailyLimit,

        activeUsers:
          uniqueUsersToday.size,

        aiInsights:
          totalAiInsights,

        uniqueUrls:
          uniqueUrlsToday.size,

        usagePercentage
      }
    });

  } catch (error) {
    console.error(
      'Error fetching AI usage stats:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch AI usage statistics'
    });
  }
};


// --------------------------------------------------
// GET ALL USERS
// --------------------------------------------------

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: 'user'
    })
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithCounts =
      await Promise.all(
        users.map(async (user) => {

          const [
            analysisCount,
            auditCount,
            performanceCount
          ] = await Promise.all([
            Analysis.countDocuments({
              userId: user._id
            }),

            Audit.countDocuments({
              userId: user._id
            }),

            Performance.countDocuments({
              userId: user._id
            })
          ]);

          return {
            id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,

            createdAt: user.createdAt,

            analysisCount,

            auditCount,

            performanceCount,

            totalActivity:
              analysisCount +
              auditCount +
              performanceCount
          };
        })
      );

    res.status(200).json({
      success: true,
      data: usersWithCounts
    });

  } catch (error) {
    console.error(
      'Error fetching users:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};


// --------------------------------------------------
// DELETE USER
// --------------------------------------------------

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete all activity belonging to this user
    await Promise.all([
      Analysis.deleteMany({
        userId: id
      }),

      Audit.deleteMany({
        userId: id
      }),

      Performance.deleteMany({
        userId: id
      })
    ]);

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User and associated activity deleted successfully'
    });

  } catch (error) {
    console.error(
      'Error deleting user:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};


// --------------------------------------------------
// CREATE USER
// --------------------------------------------------

export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          'Name, email and password are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters long.'
      });
    }

    // Password must contain a number
    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one number.'
      });
    }

    // Password must contain special character
    if (
      !/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/~`;'+=]/.test(
        password
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Password must contain at least one special character.'
      });
    }

    // Check existing email
    const existingUser =
      await User.findOne({
        email: email.toLowerCase().trim()
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          'A user with this email already exists.'
      });
    }

    // Hash password
    const salt =
      await bcrypt.genSalt(10);

    const hashedPassword =
      await bcrypt.hash(
        password,
        salt
      );

    // Create regular user
    const user =
      await User.create({
        name: name.trim(),

        email:
          email.toLowerCase().trim(),

        password: hashedPassword,

        role: 'user'
      });

    res.status(201).json({
      success: true,

      message:
        'User created successfully',

      user: {
        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error(
      'Create user error:',
      error
    );

    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};