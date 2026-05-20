const actionService = require('../services/action_service');
const logger = require('../utils/logger');

const triggerAction = async (req, res, next) => {
  try {
    const { actionType, parameters } = req.body;
    const userId = req.user.id;

    if (!actionType || !parameters) {
      return res.status(400).json({ success: false, message: 'actionType and parameters are required' });
    }

    logger.info(`Triggering simulation of action: ${actionType} by ${userId}`);
    const simulatedAction = await actionService.simulateAction(actionType, parameters, userId);

    res.status(202).json({
      success: true,
      message: 'Action simulation triggered successfully',
      data: simulatedAction
    });
  } catch (error) {
    next(error);
  }
};

const getActionsList = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: actionService.getActions()
    });
  } catch (error) {
    next(error);
  }
};

const getActionDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detail = actionService.getActionById(id);

    if (!detail) {
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    res.status(200).json({
      success: true,
      data: detail
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerAction,
  getActionsList,
  getActionDetail
};
