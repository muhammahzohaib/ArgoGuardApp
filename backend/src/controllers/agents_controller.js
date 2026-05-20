const orchestrator = require('../agents/multi_agent_orchestrator');

const getAgentsList = async (req, res, next) => {
  try {
    const list = orchestrator.getAgents();
    res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgentsList
};
