const orchestrator = require('../agents/multi_agent_orchestrator');
const contradictionService = require('../services/contradiction_service');
const logger = require('../utils/logger');

const analyzeImage = async (req, res, next) => {
  try {
    const { imagePath, introduceContradiction, mockDiagnosticFail, mockActionFail, humidity, soilMoisture, temperature } = req.body;

    if (!imagePath) {
      return res.status(400).json({ success: false, message: 'imagePath is required for analysis' });
    }

    logger.info('Received analysis trigger request', { imagePath });

    const result = await orchestrator.orchestrateAnalysis(imagePath, {
      introduceContradiction: introduceContradiction !== false, // Default: true for showcase/demo
      mockDiagnosticFail: mockDiagnosticFail === true,
      mockActionFail: mockActionFail === true,
      humidity,
      soilMoisture,
      temperature
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const checkContradictions = async (req, res, next) => {
  try {
    const { sources } = req.body;

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ success: false, message: 'sources array is required for contradiction check' });
    }

    const result = contradictionService.analyzeContradictions(sources);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: orchestrator.getAnalysisHistory()
    });
  } catch (error) {
    next(error);
  }
};

const getAnalysisDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detail = orchestrator.getAnalysisById(id);
    
    if (!detail) {
      return res.status(404).json({ success: false, message: 'Analysis run not found' });
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
  analyzeImage,
  checkContradictions,
  getHistory,
  getAnalysisDetail
};
