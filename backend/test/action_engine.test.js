process.env.NODE_ENV = 'test';

const app = require('../src/app');
const http = require('http');

let server;
const PORT = 5002; // Separate port for simulation testing

const startServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[ACTION SERVER] Running on port ${PORT}`);
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[ACTION SERVER] Stopped.');
      resolve();
    });
  });
};

// Helper to make HTTP requests
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

// Helper to poll action until complete
const pollActionUntilComplete = async (actionId, authHeader) => {
  const maxPolls = 15;
  let polls = 0;
  
  while (polls < maxPolls) {
    polls++;
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const res = await request('GET', `/actions/${actionId}`, authHeader);
    if (res.status === 200 && res.body.success === true) {
      const action = res.body.data;
      if (action.status !== 'running') {
        return action;
      }
    }
  }
  throw new Error(`Action polling timed out for action ID: ${actionId}`);
};

const runActionEngineTests = async () => {
  try {
    await startServer();

    console.log('\n=============================================================');
    console.log('       STARTING AGROGUARD AI ACTION SIMULATION ENGINE TESTS   ');
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

    const actionsToSimulate = [
      {
        type: 'Emergency Pesticide Order',
        params: { supplier: 'AgriCorp Supplies', chemical: 'Copper Fungicide', volume: '100L' }
      },
      {
        type: 'Farmer Alerts',
        params: { zones: ['Zone-A', 'Zone-B'], severity: 'critical', triggerSms: true }
      },
      {
        type: 'Irrigation Scheduling',
        params: { scheduleOverride: true, preferredWatering: 'drip-soil', moistureCeiling: '50%' }
      },
      {
        type: 'Monitoring Setup',
        params: { edgeNodesCount: 6, aerialDronePatrol: true, pollingRateMinutes: 15 }
      }
    ];

    for (const item of actionsToSimulate) {
      console.log(`-------------------------------------------------------------`);
      console.log(`[ACTION INITIATED] Type: "${item.type}"`);
      console.log(`-------------------------------------------------------------`);
      
      // Trigger action via POST route
      const postRes = await request('POST', '/actions', authHeader, {
        actionType: item.type,
        parameters: item.params
      });

      console.assert(postRes.status === 202, `Trigger action should return status 202, got ${postRes.status}`);
      console.assert(postRes.body.success === true, 'Response success should be true');
      
      const initialAction = postRes.body.data;
      console.log(`> Spawned ID: ${initialAction.id} | Status: ${initialAction.status}`);
      
      // Poll until background process completes
      console.log(`> Executing task sequence (simulating hardware latency)...`);
      const completedAction = await pollActionUntilComplete(initialAction.id, authHeader);
      
      console.log(`\n> [EXECUTION FINALIZED] status: ${completedAction.status.toUpperCase()}`);
      console.log(`\n============== ENGINE PERFORMANCE SUMMARY ==============`);
      console.log(` - Action Type:   ${completedAction.type}`);
      console.log(` - Execution ID:  ${completedAction.id}`);
      console.log(` - Status Code:   ${completedAction.status}`);
      console.log(` - Success Flag:  ${completedAction.success}`);
      console.log(` - Retries Used:  ${completedAction.retries}`);
      console.log(` - Latency Cost:  ${completedAction.latency} ms`);
      console.log(` - Financial Cost: $${completedAction.cost.toFixed(2)}`);
      
      console.log(`\n=================== PROGRESS LOGS ======================`);
      completedAction.logs.forEach(log => console.log(`   * ${log}`));

      console.log(`\n============== STATE TRANSITION MATRIX =================`);
      console.log(` [BEFORE STATE]:`);
      console.log(JSON.stringify(completedAction.beforeState, null, 4).split('\n').map(line => `   ${line}`).join('\n'));
      console.log(` [AFTER STATE]:`);
      console.log(JSON.stringify(completedAction.afterState, null, 4).split('\n').map(line => `   ${line}`).join('\n'));
      console.log(`========================================================\n\n`);
    }

    console.log('=============================================================');
    console.log('       ALL ACTION ENGINE SIMULATIONS COMPLETED SUCCESSFULLY!  ');
    console.log('=============================================================');

    await stopServer();
    process.exit(0);

  } catch (error) {
    console.error('!!! TEST EXECUTION FAILED IN ACTION ENGINE !!!', error);
    if (server) await stopServer();
    process.exit(1);
  }
};

runActionEngineTests();
