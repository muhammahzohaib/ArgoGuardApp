process.env.NODE_ENV = 'test';

const app = require('../src/app');
const http = require('http');

let server;
const PORT = 5001; // Separate port for tests

const startServer = () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[TEST SERVER] Running on port ${PORT}`);
      resolve();
    });
  });
};

const stopServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      console.log('[TEST SERVER] Stopped.');
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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    await startServer();

    console.log('\n--- STARTING AGROGUARD AI INTEGRATION TESTS ---');

    // 1. Health check
    console.log('\nTesting GET /health...');
    const health = await request('GET', '/health');
    console.assert(health.status === 200, `Health check failed: status ${health.status}`);
    console.assert(health.body.success === true, 'Health check success flag mismatch');
    console.log('✓ Health check passed');

    // 2. Authentication Login (Seeded User)
    console.log('\nTesting POST /auth/login...');
    const loginRes = await request('POST', '/auth/login', {}, {
      email: 'demo@agroguard.ai',
      password: 'password123'
    });
    console.assert(loginRes.status === 200, `Login failed: status ${loginRes.status}`);
    console.assert(loginRes.body.success === true, 'Login response success flag mismatch');
    console.assert(loginRes.body.data.token !== undefined, 'Login did not return a JWT token');
    const token = loginRes.body.data.token;
    console.log('✓ Authentication Login passed');

    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 3. GET /auth/me
    console.log('\nTesting GET /auth/me...');
    const meRes = await request('GET', '/auth/me', authHeader);
    console.assert(meRes.status === 200, `GET /auth/me failed: status ${meRes.status}`);
    console.assert(meRes.body.data.email === 'demo@agroguard.ai', 'User profile email mismatch');
    console.log('✓ GET /auth/me passed');

    // 4. GET /agents
    console.log('\nTesting GET /agents...');
    const agentsRes = await request('GET', '/agents', authHeader);
    console.assert(agentsRes.status === 200, `GET /agents failed: status ${agentsRes.status}`);
    console.assert(Array.isArray(agentsRes.body.data), 'Agents result is not an array');
    console.assert(agentsRes.body.data.length === 6, 'Expected exactly 6 agents in registry');
    console.log('✓ GET /agents passed');

    // 5. POST /analyze (Multi-agent orchestration check)
    console.log('\nTesting POST /analyze...');
    const analyzeRes = await request('POST', '/analyze', authHeader, {
      imagePath: '/uploads/tomato-leaf.jpg',
      introduceContradiction: true
    });
    console.assert(analyzeRes.status === 200, `POST /analyze failed: status ${analyzeRes.status}`);
    console.assert(analyzeRes.body.success === true, 'Analysis response success flag mismatch');
    console.assert(analyzeRes.body.data.disease !== undefined, 'Analysis did not identify disease');
    console.assert(analyzeRes.body.data.agentLogs.length > 0, 'Analysis logs are empty');
    console.log('✓ POST /analyze passed');

    // 5a. POST /analyze (Multi-agent retry and rollback check)
    console.log('\nTesting POST /analyze with Action Execution Failure...');
    const analyzeFailRes = await request('POST', '/analyze', authHeader, {
      imagePath: '/uploads/tomato-leaf.jpg',
      mockActionFail: true
    });
    console.assert(analyzeFailRes.status === 200, 'Expected status 200');
    console.assert(analyzeFailRes.body.data.executionStatus === 'failed', 'Execution status should be failed');
    console.assert(analyzeFailRes.body.data.rollbackExecuted === true, 'Rollback should be executed');
    const failLogs = analyzeFailRes.body.data.agentLogs;
    console.assert(failLogs.some(l => l.agent === 'Recovery Agent'), 'Recovery Agent should be logged');
    console.assert(failLogs[0].observation !== undefined, 'Log should contain observation field');
    console.assert(failLogs[0].reasoning !== undefined, 'Log should contain reasoning field');
    console.assert(failLogs[0].action !== undefined, 'Log should contain action field');
    console.assert(failLogs[0].outcome !== undefined, 'Log should contain outcome field');
    console.log('✓ POST /analyze Retry & Rollback passed');

    // 5b. POST /analyze/contradiction (Contradiction Service check)
    console.log('\nTesting POST /analyze/contradiction...');
    const contradictionRes = await request('POST', '/analyze/contradiction', authHeader, {
      sources: [
        {
          sourceId: 'sensor-moisture-01',
          type: 'physical-sensor',
          data: { soilMoisture: 85 },
          timestamp: new Date().toISOString(),
          baseCredibility: 0.95
        },
        {
          sourceId: 'vision-agent-mock',
          type: 'ai-agent',
          data: { soilMoistureEstimate: 'dry' },
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 hours old (stale)
          baseCredibility: 0.85
        }
      ]
    });
    console.assert(contradictionRes.status === 200, `POST /analyze/contradiction failed: status ${contradictionRes.status}`);
    console.assert(contradictionRes.body.data.contradictions.length > 0, 'Contradictions array should not be empty');
    console.assert(contradictionRes.body.data.contradictions[0].code === 'MOISTURE_CONFLICT', 'Expected MOISTURE_CONFLICT code');
    console.assert(contradictionRes.body.data.evaluatedSources[1].isStale === true, 'Expected second source to be flagged stale');
    console.assert(contradictionRes.body.data.confidenceScore < 1.0, 'Confidence score should be less than 1.0 due to conflicts');
    console.assert(contradictionRes.body.data.investigationPath.length > 0, 'Expected investigation path steps');
    console.log('✓ POST /analyze/contradiction passed');

    // 6. GET /logs
    console.log('\nTesting GET /logs...');
    const logsRes = await request('GET', '/logs', authHeader);
    console.assert(logsRes.status === 200, `GET /logs failed: status ${logsRes.status}`);
    console.assert(logsRes.body.data.length > 0, 'Logs array is empty');
    console.log('✓ GET /logs passed');

    // 7. POST /actions (Simulate drone activation)
    console.log('\nTesting POST /actions...');
    const actionRes = await request('POST', '/actions', authHeader, {
      actionType: 'Drone Spraying',
      parameters: {
        chemical: 'Copper Fungicide',
        latitude: '34.0522',
        longitude: '-118.2437'
      }
    });
    console.assert(actionRes.status === 202, `POST /actions failed: status ${actionRes.status}`);
    console.assert(actionRes.body.data.status === 'running', 'Simulated action status should be running initially');
    console.log('✓ POST /actions passed');

    // 8. GET /dashboard
    console.log('\nTesting GET /dashboard...');
    const dashRes = await request('GET', '/dashboard', authHeader);
    console.assert(dashRes.status === 200, `GET /dashboard failed: status ${dashRes.status}`);
    console.assert(dashRes.body.data.stats.totalScans > 0, 'Dashboard totalScans count mismatch');
    console.log('✓ GET /dashboard passed');

    console.log('\n--- ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ---');
    await stopServer();
    process.exit(0);

  } catch (error) {
    console.error('!!! TEST EXECUTION ENCOUNTERED ERROR !!!', error);
    if (server) await stopServer();
    process.exit(1);
  }
};

runTests();
