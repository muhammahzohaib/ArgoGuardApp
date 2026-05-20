const orchestrator = require('../agents/multi_agent_orchestrator');
const actionService = require('../services/action_service');

const getDashboardStats = async (req, res, next) => {
  try {
    const history = orchestrator.getAnalysisHistory();
    const actions = actionService.getActions();

    // Default mock stats if empty
    const totalScans = history.length || 24;
    const healthyCropsPercent = 78;
    const activeAlertsCount = 3;
    const actionsTriggered = actions.length || 8;

    // Calculate crop distribution from history or standard mock data
    const cropHealthStatus = [
      { crop: 'Tomatoes', health: 85, status: 'Good' },
      { crop: 'Potatoes', health: 62, status: 'Warning' },
      { crop: 'Wheat', health: 94, status: 'Excellent' }
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalScans,
          healthyCropsPercent,
          activeAlertsCount,
          actionsTriggered
        },
        cropHealthStatus,
        recentScans: history.slice(-5),
        recentActions: actions.slice(-5)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
