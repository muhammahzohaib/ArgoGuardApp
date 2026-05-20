const logger = require('../utils/logger');

/**
 * Calculates final credibility score based on base score and freshness of the source
 */
const calculateFinalCredibility = (source) => {
  const base = source.baseCredibility || 0.5;
  const timestamp = new Date(source.timestamp);
  
  if (isNaN(timestamp.getTime())) {
    return base; // If timestamp is missing or invalid
  }

  const ageMs = Date.now() - timestamp.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // If data is older than 24 hours, apply 50% penalty
  if (ageHours > 24) {
    logger.warn(`Stale data source identified: ${source.sourceId} (${Math.round(ageHours)} hours old)`);
    return base * 0.5;
  }

  // Linear decay for younger files (decay 5% every 4 hours)
  const decayCount = Math.floor(ageHours / 4);
  const decayPenalty = Math.max(0, decayCount * 0.05);
  return Math.max(0.1, base - decayPenalty);
};

/**
 * Analyzes multiple data sources for contradictions, assigns final credibility,
 * and proposes resolution paths.
 * 
 * @param {Array} sources List of sources to compare
 */
const analyzeContradictions = (sources = []) => {
  logger.info(`Running contradiction checks across ${sources.length} sources`);

  const evaluatedSources = sources.map(source => ({
    ...source,
    finalCredibility: calculateFinalCredibility(source),
    isStale: (Date.now() - new Date(source.timestamp).getTime()) > (24 * 60 * 60 * 1000)
  }));

  const contradictions = [];
  const investigationPath = [];
  let suggestedResolution = 'No actions required, data matches.';

  // 1. Check Sensor Soil Moisture vs AI Leaf Diagnosis (Moisture conflict)
  const sensorMoisture = evaluatedSources.find(s => s.type === 'physical-sensor' && s.data.soilMoisture !== undefined);
  const aiVision = evaluatedSources.find(s => s.type === 'ai-agent' && s.data.soilMoistureEstimate !== undefined);

  if (sensorMoisture && aiVision) {
    const isSensorHigh = sensorMoisture.data.soilMoisture > 70;
    const isVisionDry = aiVision.data.soilMoistureEstimate === 'dry';

    if (isSensorHigh && isVisionDry) {
      contradictions.push({
        code: 'MOISTURE_CONFLICT',
        severity: 'high',
        description: `Physical sensor reports high moisture (${sensorMoisture.data.soilMoisture}%), but AI Vision Agent diagnosed dry drought-like symptoms.`
      });

      investigationPath.push('1. Inspect physical soil moisture sensor calibration.');
      investigationPath.push('2. Check leaf visual signs for fungal root-rot which mimics drought symptoms.');
      
      if (sensorMoisture.finalCredibility >= aiVision.finalCredibility) {
        suggestedResolution = `Trust sensor (${sensorMoisture.sourceId}). Suspend watering; visual wilt is likely due to root damage or over-saturation, not drought.`;
      } else {
        suggestedResolution = `Trust vision report (${aiVision.sourceId}). Sensor may be miscalibrated or stuck in wet pocket. Perform manual soil check.`;
      }
    }
  }

  // 2. Check Treatment Conflict (Foliage Dryness vs Spraying Irrigation)
  const diagAgent = evaluatedSources.find(s => s.type === 'ai-agent' && s.data.requirements !== undefined);
  const agronAgent = evaluatedSources.find(s => s.type === 'ai-agent' && s.data.culturalControl !== undefined);

  if (diagAgent && agronAgent) {
    const reqs = diagAgent.data.requirements || [];
    const control = (agronAgent.data.culturalControl || '').toLowerCase();

    if (reqs.includes('keep foliage dry') && (control.includes('overhead') || control.includes('sprinkler') || control.includes('spray leaves'))) {
      contradictions.push({
        code: 'TREATMENT_CONFLICT',
        severity: 'high',
        description: 'Diagnostic pathogen requirements demand dry foliage, but agronomic controls suggest overhead spraying/misting.'
      });

      investigationPath.push('1. Confirm pathogen genus requirements regarding leaf surface humidity.');
      investigationPath.push('2. Evaluate alternative irrigation protocols (e.g. drip, soil line).');

      suggestedResolution = 'Revise agronomic schedule: Override overhead watering with soil-level drip irrigation. Keep leaf surfaces dry to inhibit fungal sporulation.';
    }
  }

  // 3. User Crop Type Input vs AI Crop Classification
  const userInput = evaluatedSources.find(s => s.type === 'user-input' && s.data.cropType !== undefined);
  const visionClassification = evaluatedSources.find(s => s.type === 'ai-agent' && s.data.cropTypeClassification !== undefined);

  if (userInput && visionClassification) {
    if (userInput.data.cropType.toLowerCase() !== visionClassification.data.cropTypeClassification.toLowerCase()) {
      contradictions.push({
        code: 'CROP_MISMATCH_CONFLICT',
        severity: 'medium',
        description: `User declared crop as "${userInput.data.cropType}", but AI classified leaf shape as "${visionClassification.data.cropTypeClassification}".`
      });

      investigationPath.push('1. Ask user to confirm if surrounding crops match the photo specimen.');
      investigationPath.push('2. Inspect photo for image resolution or leaf occlusion issues.');

      if (userInput.finalCredibility >= visionClassification.finalCredibility) {
        suggestedResolution = `Proceed with User classification: ${userInput.data.cropType}. Re-classify leaf symptoms manually.`;
      } else {
        suggestedResolution = `Proceed with AI suggestion: ${visionClassification.data.cropTypeClassification}. Visual leaf details are highly confident.`;
      }
    }
  }

  // Calculate consistency confidence score
  let confidenceScore = 1.0;
  if (contradictions.length > 0) {
    // Drop confidence based on severity
    const penalties = contradictions.map(c => c.severity === 'high' ? 0.35 : 0.15);
    const totalPenalty = penalties.reduce((a, b) => a + b, 0);
    confidenceScore = Math.max(0.1, 1.0 - totalPenalty);
  }

  return {
    contradictions,
    confidenceScore: parseFloat(confidenceScore.toFixed(2)),
    investigationPath,
    suggestedResolution,
    evaluatedSources
  };
};

module.exports = {
  analyzeContradictions
};
