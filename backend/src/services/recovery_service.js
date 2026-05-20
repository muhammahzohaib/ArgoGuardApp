const logger = require('../utils/logger');

/**
 * Utility to run an async operation with retries, logging, and custom delay backoff.
 */
const executeWithRetry = async (taskName, taskFn, maxRetries = 3, initialDelay = 100) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      logger.info(`[RECOVERY ENGINE] Running task "${taskName}" (Attempt ${attempt}/${maxRetries})...`);
      const result = await taskFn(attempt);
      return { success: true, result, attempt };
    } catch (error) {
      logger.warn(`[RECOVERY ENGINE] Task "${taskName}" failed on attempt ${attempt}/${maxRetries}: ${error.message}`);
      if (attempt >= maxRetries) {
        return { success: false, error, attempt };
      }
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Handles Emergency Pesticide Orders with robust supplier failover logic and scenario handling.
 */
const handleSupplierOrderWithFailover = async (orderData) => {
  const logs = [];
  let beforeState = { supplier: 'AgriCorp Supplies', orderStatus: 'none', paymentAuthorized: false, activeStock: 'low' };
  let afterState = { ...beforeState };
  let currentSupplier = 'AgriCorp Supplies';
  let retries = 0;
  let success = false;
  let latency = 0;
  let cost = 0.0;

  logs.push(`[1/4] Connecting to primary supplier API: ${currentSupplier}...`);
  
  // Scenario Simulations
  try {
    if (orderData.scenario === 'API failure') {
      retries = 1;
      logs.push(`[2/4] [API FAILURE] Primary supplier "${currentSupplier}" returned 500 Internal Server Error.`);
      logs.push(`[3/4] Triggering fallback supplier failover sequence...`);
      
      currentSupplier = 'GreenGrow Logistics';
      logs.push(`[4/4] Connection to fallback supplier "${currentSupplier}" successful. Authorizing $280.00 via secondary credit line.`);
      
      afterState = {
        supplier: currentSupplier,
        orderStatus: 'dispatched_via_fallback',
        paymentAuthorized: true,
        activeStock: 'replenishing (+100L)'
      };
      cost = 280.00;
      latency = 1100;
      success = true;

    } else if (orderData.scenario === 'timeout') {
      retries = 2;
      logs.push(`[2/4] [TIMEOUT ERROR] Connection to primary supplier "${currentSupplier}" exceeded 500ms threshold.`);
      logs.push(`[3/4] Warning: Solenoid connection failed. Retrying gateway connection (Attempt 1)...`);
      logs.push(`[4/4] Primary supplier timed out. Seamlessly routing order to tertiary supplier "EcoShield Pesticides"...`);
      
      currentSupplier = 'EcoShield Pesticides';
      afterState = {
        supplier: currentSupplier,
        orderStatus: 'dispatched_priority_express',
        paymentAuthorized: true,
        activeStock: 'replenishing (+100L)'
      };
      cost = 295.00;
      latency = 1650;
      success = true;

    } else if (orderData.scenario === 'invalid response') {
      retries = 1;
      logs.push(`[2/4] [INVALID RESPONSE] Primary supplier returned malformed XML or empty JSON payload.`);
      logs.push(`[3/4] Validator failed. Rejecting transaction signature.`);
      logs.push(`[4/4] Failing over to "GreenGrow Logistics" with pre-validated data structures...`);
      
      currentSupplier = 'GreenGrow Logistics';
      afterState = {
        supplier: currentSupplier,
        orderStatus: 'completed_with_fallback_payload',
        paymentAuthorized: true,
        activeStock: 'replenishing (+100L)'
      };
      cost = 280.00;
      latency = 950;
      success = true;

    } else if (orderData.scenario === 'missing data') {
      // Missing vital telemetry parameters
      logs.push(`[2/4] [MISSING DATA] Request rejected: missing latitude/longitude coordinates.`);
      logs.push(`[3/4] Raising validation exception. Aborting transaction. Calling rollback protocols.`);
      
      afterState = {
        ...beforeState,
        orderStatus: 'aborted_invalid_input',
        activeStock: 'low'
      };
      cost = 0.00;
      latency = 250;
      success = false;

    } else {
      // Standard Success Path
      afterState = {
        supplier: currentSupplier,
        orderStatus: 'confirmed_and_dispatched',
        paymentAuthorized: true,
        activeStock: 'replenishing (+100L)'
      };
      cost = 240.00;
      latency = 600;
      success = true;
      logs.push(`[2/4] Checking supplier catalog and price match matrices...`);
      logs.push(`[3/4] Authorizing payment of $240.00 via standard farm line...`);
      logs.push(`[4/4] Order dispatched from main distribution depot.`);
    }
  } catch (err) {
    logs.push(`[ERROR] Uncaught recovery exception: ${err.message}`);
    success = false;
  }

  return {
    success,
    supplier: currentSupplier,
    cost,
    latency,
    retries,
    beforeState,
    afterState,
    logs
  };
};

/**
 * Handles Farmer Alerts with multi-channel notification failover recovery.
 */
const handleNotificationWithChannelRecovery = async (alertData) => {
  const logs = [];
  let beforeState = { alertDispatched: false, currentChannel: 'SMS Gateway', recipientCount: 0 };
  let afterState = { ...beforeState };
  let currentChannel = 'SMS Gateway';
  let retries = 0;
  let success = false;
  let latency = 0;
  let cost = 0.0;

  logs.push(`[1/3] Attempting broadcast via primary channel: ${currentChannel}...`);

  if (alertData.scenario === 'API failure' || alertData.scenario === 'timeout') {
    retries = 1;
    logs.push(`[2/3] [GATEWAY FAULT] SMS Gateway carrier returned connection drop or packet loss.`);
    logs.push(`[3/3] SMS fail. Deploying notification recovery pathway: falling back to Push Notifications + Email...`);
    
    currentChannel = 'Push Notification & Email';
    afterState = {
      alertDispatched: true,
      currentChannel: currentChannel,
      recipientCount: 4,
      fallbackDelployed: true
    };
    cost = 0.02; // Push/Email cheaper than SMS
    latency = 800;
    success = true;
  } else if (alertData.scenario === 'missing data') {
    logs.push(`[2/3] [VALIDATION ERROR] Missing telephone contact fields for farmer Ali.`);
    logs.push(`[3/3] Aborted SMS dispatch. Recovered by routing alert to registered Android/iOS active Push token.`);
    
    currentChannel = 'Push Notification';
    afterState = {
      alertDispatched: true,
      currentChannel: currentChannel,
      recipientCount: 1,
      fallbackDelployed: true
    };
    cost = 0.00;
    latency = 450;
    success = true;
  } else {
    // Normal SMS route success
    afterState = {
      alertDispatched: true,
      currentChannel: currentChannel,
      recipientCount: 4,
      fallbackDelployed: false
    };
    cost = 0.08;
    latency = 400;
    success = true;
    logs.push(`[2/3] Broadcasting alert payload to registered mobile telephone numbers...`);
    logs.push(`[3/3] Handshake received. Farmer alerts successfully broadcast.`);
  }

  return {
    success,
    channel: currentChannel,
    cost,
    latency,
    retries,
    beforeState,
    afterState,
    logs
  };
};

/**
 * Rollback updates to safe system states.
 */
const rollbackStateUpdate = async (actionId, beforeState) => {
  logger.warn(`[RECOVERY ENGINE] Initiating terminal rollback sequence for Action ID: ${actionId}`);
  const rollbackLogs = [
    `[ROLLBACK 1/3] Resetting chemical reservoir locks and physical valve actuators.`,
    `[ROLLBACK 2/3] Releasing pesticide reserves back to inventory buffers.`,
    `[ROLLBACK 3/3] Dispatching high-priority safety alert email to supervisor Ali.`
  ];
  return {
    actionId,
    rollbackExecuted: true,
    restoredState: beforeState,
    logs: rollbackLogs
  };
};

module.exports = {
  executeWithRetry,
  handleSupplierOrderWithFailover,
  handleNotificationWithChannelRecovery,
  rollbackStateUpdate
};
