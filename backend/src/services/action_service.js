const logger = require('../utils/logger');
const recoveryService = require('./recovery_service');

const actionsDb = [];

const simulateAction = async (actionType, parameters, userId) => {
  logger.info(`Starting simulation for action: ${actionType}`, { parameters, userId });
  
  const actionId = 'act-' + Math.random().toString(36).substr(2, 9);
  
  let cost = 0.0;
  let latency = 1000;
  let retries = 0;
  let success = true;
  let beforeState = {};
  let afterState = {};
  let logs = [];
  let rollbackData = null;

  const type = actionType.toLowerCase().trim();
  const scenario = parameters.scenario || null;

  if (type.includes('pesticide') || type.includes('order')) {
    const recoveryResult = await recoveryService.handleSupplierOrderWithFailover({ scenario });
    cost = recoveryResult.cost;
    latency = recoveryResult.latency;
    retries = recoveryResult.retries;
    success = recoveryResult.success;
    beforeState = recoveryResult.beforeState;
    afterState = recoveryResult.afterState;
    logs = recoveryResult.logs;

    if (!success) {
      // Trigger rollback immediately
      rollbackData = await recoveryService.rollbackStateUpdate(actionId, beforeState);
    }
  } else if (type.includes('alert') || type.includes('farmer')) {
    const recoveryResult = await recoveryService.handleNotificationWithChannelRecovery({ scenario });
    cost = recoveryResult.cost;
    latency = recoveryResult.latency;
    retries = recoveryResult.retries;
    success = recoveryResult.success;
    beforeState = recoveryResult.beforeState;
    afterState = recoveryResult.afterState;
    logs = recoveryResult.logs;

    if (!success) {
      rollbackData = await recoveryService.rollbackStateUpdate(actionId, beforeState);
    }
  } else if (type.includes('irrigation') || type.includes('schedule')) {
    beforeState = { waterValvesActive: false, currentSchedule: 'overhead_mist_daily', nextRunTime: '2026-05-19T18:00:00Z', moistureThreshold: '35%' };
    afterState = { waterValvesActive: true, currentSchedule: 'drip_line_soil_level', nextRunTime: 'suspended_due_to_pathogen_guidelines', moistureThreshold: '50% (adjusted)' };
    cost = 0.00;
    latency = 850;
    retries = 2;
    success = true;
    logs = [
      '[1/5] Overriding default overhead daily irrigation sequence...',
      '[2/5] Adjusting soil humidity threshold rules (35% -> 50%)...',
      '[3/5] Warning: Solenoid valve #3 not responding. Retrying (Attempt 1)...',
      '[4/5] Warning: Solenoid valve #3 not responding. Retrying (Attempt 2)...',
      '[5/5] Soil drip-line valve triggered. Overhead sprinkler scheduled runs suspended.'
    ];
  } else if (type.includes('monitoring') || type.includes('setup')) {
    beforeState = { cameraSamplingRate: 'hourly', uavPatrolStatus: 'idle', activeEdgeNodes: 2 };
    afterState = { cameraSamplingRate: 'every-15-mins', uavPatrolStatus: 'patrolling', activeEdgeNodes: 6 };
    cost = 2.50;
    latency = 1450;
    retries = 0;
    success = true;
    logs = [
      '[1/4] Spawning additional localized visual inspection nodes...',
      '[2/4] Increasing high-resolution camera sampling frequency to 15-minute intervals...',
      '[3/4] Requesting UAV aerial reconnaissance sweep over infected sectors...',
      '[4/4] Setup complete. Drone launched and edge telemetry streaming established.'
    ];
  } else {
    // Default / Drone Spraying (Backward Compatibility)
    beforeState = { sprayingActuatorsActive: false, chemicalReserved: 0 };
    afterState = { sprayingActuatorsActive: true, chemicalReserved: 50 };
    cost = 45.00;
    latency = 2000;
    retries = 0;
    success = true;
    logs = [
      'Initializing system for Drone Spraying...',
      'Establishing drone communication link...',
      'Calibrating physical spray valves and pressure gauges...',
      'Commencing target delivery of Copper Fungicide...',
      'Action execution finalized. Disengaging links.'
    ];
  }

  const newAction = {
    id: actionId,
    type: actionType,
    parameters,
    userId,
    status: 'running',
    startedAt: new Date().toISOString(),
    logs: [logs[0]],
    completedAt: null,
    cost,
    latency,
    retries,
    success,
    beforeState,
    afterState,
    rollbackExecuted: !!rollbackData,
    rollbackLogs: rollbackData ? rollbackData.logs : []
  };

  actionsDb.push(newAction);

  // Progressive simulation updates using background execution
  let currentLogIdx = 1;
  const stepInterval = Math.max(10, Math.floor(latency / logs.length));
  
  const logTimer = setInterval(() => {
    if (currentLogIdx < logs.length) {
      newAction.logs.push(logs[currentLogIdx]);
      currentLogIdx++;
    } else {
      clearInterval(logTimer);
      if (rollbackData) {
        newAction.logs.push('Executing rollback sequence due to permanent task failure...');
        newAction.logs.push(...rollbackData.logs);
      }
      newAction.status = success ? 'completed' : 'failed';
      newAction.completedAt = new Date().toISOString();
      logger.info(`Completed simulation for action: ${actionId}`);
    }
  }, stepInterval);

  return newAction;
};

const getActions = () => actionsDb;

const getActionById = (id) => actionsDb.find(a => a.id === id);

module.exports = {
  simulateAction,
  getActions,
  getActionById
};
