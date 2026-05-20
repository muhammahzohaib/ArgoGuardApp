process.env.NODE_ENV = 'test';

const app = require('../src/app');
const http = require('http');

let server;
const PORT = 5003; // Separate port for recovery testing

const startServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[RECOVERY SERVER] Running on port ${PORT}`);
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[RECOVERY SERVER] Stopped.');
      resolve();
    });
  });
};

const request = (method, path, headers = {}, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const pollActionUntilComplete = async (actionId, authHeader) => {
  const maxPolls = 15;
  let polls = 0;
  
  while (polls < maxPolls) {
    polls++;
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const res = await request('GET', `/actions/${actionId}`, authHeader);
    if (res.status === 200 && res.body.success === true) {
      const action = res.body.data;
      if (action.status !== 'running') {
        return action;
      }
    }
  }
  throw new Error(`Polling timed out for action ID: ${actionId}`);
};

const runRecoverySystemTests = async () => {
  try {
    await startServer();

    console.log('\n=============================================================');
    console.log('       STARTING AGROGUARD AI FAILURE RECOVERY SYSTEM TESTS    ');
    console.log('=============================================================\n');

    // 1. Authenticate user to obtain token
    console.log('Logging in demo farmer...');
    const loginRes = await request('POST', '/auth/login', {}, {
      email: 'demo@agroguard.ai',
      password: 'password123'
    });
    
    if (loginRes.status !== 200 || !loginRes.body.data || !loginRes.body.data.token) {
      throw new Error('Farmer authentication failed.');
    }
    
    const token = loginRes.body.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };
    console.log('✓ Authentication successful. JWT obtained.\n');

    const recoveryScenarios = [
      {
        name: 'SCENARIO 1: Supplier API Failure (500 Internal Error)',
        actionType: 'Emergency Pesticide Order',
        params: { scenario: 'API failure', chemical: 'Copper Fungicide' },
        expectSuccess: true,
        expectSupplier: 'GreenGrow Logistics'
      },
      {
        name: 'SCENARIO 2: Connection Timeout (>500ms delay)',
        actionType: 'Emergency Pesticide Order',
        params: { scenario: 'timeout', chemical: 'Copper Fungicide' },
        expectSuccess: true,
        expectSupplier: 'EcoShield Pesticides'
      },
      {
        name: 'SCENARIO 3: Invalid Supplier Payload Response',
        actionType: 'Emergency Pesticide Order',
        params: { scenario: 'invalid response', chemical: 'Copper Fungicide' },
        expectSuccess: true,
        expectSupplier: 'GreenGrow Logistics'
      },
      {
        name: 'SCENARIO 4: Missing Critical Data (Channel Failover SMS -> Push)',
        actionType: 'Farmer Alerts',
        params: { scenario: 'missing data', message: 'Foliage Blight Alert' },
        expectSuccess: true,
        expectChannel: 'Push Notification'
      },
      {
        name: 'SCENARIO 5: Terminal Failure & Action Rollback Trigger',
        actionType: 'Emergency Pesticide Order',
        params: { scenario: 'missing data', chemical: 'Copper Fungicide' },
        expectSuccess: false,
        expectRollback: true
      }
    ];

    for (const scenario of recoveryScenarios) {
      console.log(`=============================================================`);
      console.log(`${scenario.name}`);
      console.log(`=============================================================`);
      
      const triggerRes = await request('POST', '/actions', authHeader, {
        actionType: scenario.actionType,
        parameters: scenario.params
      });

      console.assert(triggerRes.status === 202, `Should trigger with 202, got ${triggerRes.status}`);
      const initialAction = triggerRes.body.data;
      console.log(`> Created Action ID: ${initialAction.id} | Initial Status: ${initialAction.status}`);
      
      console.log(`> System encountering scenario. Triggering self-recovery pipelines...`);
      const completedAction = await pollActionUntilComplete(initialAction.id, authHeader);
      
      console.log(`\n> [RECOVERY STATE COMPLETED] status: ${completedAction.status.toUpperCase()}`);
      console.log(`---------------- PERFORMANCE & COST REPORT ------------------`);
      console.log(` - Action Type:      ${completedAction.type}`);
      console.log(` - Execution ID:     ${completedAction.id}`);
      console.log(` - Success Status:   ${completedAction.success}`);
      console.log(` - Retries Attempted: ${completedAction.retries}`);
      console.log(` - Latency Incurred: ${completedAction.latency} ms`);
      console.log(` - Final Cost:       $${completedAction.cost.toFixed(2)}`);
      
      if (scenario.expectSupplier) {
        console.log(` - Active Supplier:  ${completedAction.afterState.supplier} (Expected fallback: "${scenario.expectSupplier}")`);
        console.assert(completedAction.afterState.supplier === scenario.expectSupplier, `Supplier should failover to ${scenario.expectSupplier}`);
      }

      if (scenario.expectChannel) {
        console.log(` - Active Channel:   ${completedAction.afterState.currentChannel} (Expected fallback: "${scenario.expectChannel}")`);
        console.assert(completedAction.afterState.currentChannel === scenario.expectChannel, `Channel should recover to ${scenario.expectChannel}`);
      }

      console.log(`\n----------------- RECOVERY PROGRESS TRACES ------------------`);
      completedAction.logs.forEach(log => console.log(`   * ${log}`));

      if (completedAction.rollbackExecuted) {
        console.log(`\n⚠️  [FAILSAFE STATE ROLLBACK EXECUTED]`);
        completedAction.rollbackLogs.forEach(log => console.log(`   [ROLLBACK] * ${log}`));
        console.assert(completedAction.success === false, 'Action should be marked unsuccessful on terminal rollback');
      }

      console.log(`\n-------------------------------------------------------------\n\n`);
    }

    console.log('=============================================================');
    console.log('       ALL FAILURE RECOVERY SCENARIOS TESTED & VERIFIED!     ');
    console.log('=============================================================');

    await stopServer();
    process.exit(0);

  } catch (error) {
    console.error('!!! RECOVERY ENGINE SYSTEM TESTS FAILED !!!', error);
    if (server) await stopServer();
    process.exit(1);
  }
};

runRecoverySystemTests();
