const orchestrator = require('../agents/multi_agent_orchestrator');

const getAgentLogs = async (req, res, next) => {
  try {
    const runs = orchestrator.getAnalysisHistory();
    // Return logs from the most recent run, or return all runs logs
    const allLogs = runs.map(run => ({
      runId: run.runId,
      disease: run.disease,
      timestamp: run.timestamp,
      logs: run.agentLogs
    }));

    res.status(200).json({
      success: true,
      data: allLogs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentLogs
};
