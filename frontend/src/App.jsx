import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Activity, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Droplet, 
  Eye, 
  Flame, 
  Layers, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  Smartphone, 
  TrendingUp, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

const BACKEND_URL = 'http://localhost:5000';

// High-fidelity local simulated data in case the backend is temporarily offline
const MOCK_ANALYTICS_DATA = [
  { name: 'Week 1', Tomato: 88, Wheat: 74, Corn: 62 },
  { name: 'Week 2', Tomato: 85, Wheat: 76, Corn: 63 },
  { name: 'Week 3', Tomato: 82, Wheat: 79, Corn: 61 },
  { name: 'Week 4', Tomato: 78, Wheat: 81, Corn: 65 },
  { name: 'Week 5', Tomato: 89, Wheat: 83, Corn: 68 },
  { name: 'Week 6', Tomato: 92, Wheat: 85, Corn: 70 },
];

const MOCK_BAR_DATA = [
  { name: 'Zone A', moisture: 40, spreadRisk: 80, health: 87 },
  { name: 'Zone B', moisture: 65, spreadRisk: 30, health: 91 },
  { name: 'Zone C', moisture: 30, spreadRisk: 90, health: 65 },
  { name: 'Zone D', moisture: 55, spreadRisk: 45, health: 82 },
];

function App() {
  // Connection states
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  // Scan states
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [scanResult, setScanResult] = useState(null);
  const [scanLogs, setScanLogs] = useState([]);
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Before vs After Slider position
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(null);

  // Action Simulation states
  const [selectedActionType, setSelectedActionType] = useState('Emergency Pesticide Order');
  const [selectedScenario, setSelectedScenario] = useState('none');
  const [simulatingAction, setSimulatingAction] = useState(false);
  const [simulatedActionResult, setSimulatedActionResult] = useState(null);
  const [actionHistory, setActionHistory] = useState([]);

  // Check health and log in automatically
  useEffect(() => {
    const initConnection = async () => {
      try {
        const healthRes = await axios.get(`${BACKEND_URL}/health`);
        if (healthRes.status === 200) {
          setBackendHealthy(true);
          
          // Auto login demo farmer
          const loginRes = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'demo@agroguard.ai',
            password: 'password123'
          });
          if (loginRes.data && loginRes.data.data.token) {
            setAuthToken(loginRes.data.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${loginRes.data.data.token}`;
          }
        }
      } catch (err) {
        console.warn('Backend is offline. Running dashboard in premium simulation mode.');
        setBackendHealthy(false);
      }
    };
    initConnection();
  }, []);

  // Trigger analysis simulation
  const handleTriggerAnalysis = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    setActiveStep(0);
    setScanLogs([]);

    // Telemetry log templates for dynamic rendering
    const logTemplates = [
      {
        id: 'input-aggregator',
        agent: 'Input Aggregation Agent',
        observation: 'Ingested leaf camera frames alongside agricultural telemetries.',
        reasoning: 'Compiling local humidity and soil metrics before vision diagnostic sweeps.',
        action: 'Queried weather APIs and loaded Zone C microclimates.',
        outcome: 'Telemetry verified: humidity=75%, soilMoisture=40%, temperature=28°C.',
        status: 'running'
      },
      {
        id: 'disease-analyzer',
        agent: 'Disease Analysis Agent',
        observation: 'Visual characteristics: brown target-shaped spots with yellow chlorosis halos.',
        reasoning: 'Matching symptom boundaries with plant pathogen matrices.',
        action: 'Triggered Gemini Generative multimodal API.',
        outcome: 'Identified Late Blight (Phytophthora infestans) with 92% confidence.',
        status: 'pending'
      },
      {
        id: 'risk-assessor',
        agent: 'Risk Assessment Agent',
        observation: 'Environmental conditions extremely damp (>70% humidity).',
        reasoning: 'Blight spores multiply exponentially in high humidity parameters.',
        action: 'Ran spore multiplication scoring models.',
        outcome: 'Calculated Spread Risk: HIGH. Immediate containment advised.',
        status: 'pending'
      },
      {
        id: 'constraint-planner',
        agent: 'Constraint Planning Agent',
        observation: 'AI treatment scheduled overhead misting; pathology requires dry leaves.',
        reasoning: 'System contradiction detected: Overhead water accelerates blight spread.',
        action: 'Invoked Contradiction Resolution Service.',
        outcome: 'Override irrigation controls. Switch overhead sprinkler with soil drip lines.',
        recovery: 'Override overhead watering recommendations to keep leaf surface dry.',
        status: 'pending'
      },
      {
        id: 'action-executor',
        agent: 'Action Execution Agent',
        observation: 'Coordinates set. Targets: Valves 1-3 and active Spraying Actuator.',
        reasoning: 'Applying targeted Copper-based fungicide to containing Sector 4.',
        action: 'Fired drone flight coordinate release codes.',
        outcome: 'Valves triggered. Chemical reserves deployed successfully.',
        status: 'pending'
      },
      {
        id: 'recovery-agent',
        agent: 'Recovery Agent',
        observation: 'Valves monitored. Flight telemetry landing green.',
        reasoning: 'No actuator pressure loss or communication dropouts encountered.',
        action: 'Checked final hardware status checks.',
        outcome: 'Orchestration complete. System idle monitoring active.',
        status: 'pending'
      }
    ];

    setScanLogs(logTemplates);

    // Dynamic animation sequence
    for (let i = 0; i < logTemplates.length; i++) {
      setActiveStep(i);
      setScanProgress(Math.floor(((i + 0.5) / logTemplates.length) * 100));
      
      setScanLogs(prev => prev.map((item, idx) => {
        if (idx < i) return { ...item, status: 'done' };
        if (idx === i) return { ...item, status: 'running' };
        return item;
      }));

      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    setScanLogs(prev => prev.map(item => ({ ...item, status: 'done' })));
    setScanProgress(100);
    setIsScanning(false);
    setActiveStep(6);
    
    setScanResult({
      diseaseName: 'Late Blight (Phytophthora infestans)',
      confidence: 0.92,
      severity: 'HIGH',
      recommendations: [
        'Apply Copper Fungicide within 4 hours',
        'Override overhead sprinkler schedules with soil drip line watering'
      ],
      description: 'Identified via sequential 6-agent diagnostics. System resolved environmental scheduling conflicts to prevent pathogen spread.'
    });
  };

  // Trigger Action Simulation Engine
  const handleSimulateAction = async () => {
    setSimulatingAction(true);
    setSimulatedActionResult(null);

    try {
      if (backendHealthy && authToken) {
        // Hitting the real failure recovery simulation engine
        const res = await axios.post(`${BACKEND_URL}/actions`, {
          actionType: selectedActionType,
          parameters: { scenario: selectedScenario }
        });
        
        const actionId = res.data.data.id;
        
        // Poll for completion
        let completed = false;
        let actionData = null;
        for (let poll = 0; poll < 15; poll++) {
          await new Promise(resolve => setTimeout(resolve, 300));
          const check = await axios.get(`${BACKEND_URL}/actions/${actionId}`);
          if (check.data.data.status !== 'running') {
            actionData = check.data.data;
            completed = true;
            break;
          }
        }
        
        if (completed && actionData) {
          setSimulatedActionResult(actionData);
          setActionHistory(prev => [actionData, ...prev]);
        }
      } else {
        // Fallback simulation runner
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let cost = 0.0;
        let latency = 800;
        let retries = 0;
        let success = true;
        let beforeState = {};
        let afterState = {};
        let logs = [];

        if (selectedActionType === 'Emergency Pesticide Order') {
          if (selectedScenario === 'API failure') {
            beforeState = { supplier: 'AgriCorp Supplies', orderStatus: 'none', paymentAuthorized: false };
            afterState = { supplier: 'GreenGrow Logistics', orderStatus: 'dispatched_via_fallback', paymentAuthorized: true };
            cost = 280.00;
            latency = 1100;
            retries = 1;
            logs = [
              '[1/4] Connecting to primary supplier API: AgriCorp Supplies...',
              '[2/4] [API FAILURE] Primary supplier returned 500 Internal Server Error.',
              '[3/4] Triggering fallback supplier failover sequence...',
              '[4/4] Connection to fallback supplier "GreenGrow Logistics" successful.'
            ];
          } else if (selectedScenario === 'timeout') {
            beforeState = { supplier: 'AgriCorp Supplies', orderStatus: 'none', paymentAuthorized: false };
            afterState = { supplier: 'EcoShield Pesticides', orderStatus: 'dispatched_priority_express', paymentAuthorized: true };
            cost = 295.00;
            latency = 1650;
            retries = 2;
            logs = [
              '[1/4] Connecting to primary supplier API: AgriCorp Supplies...',
              '[2/4] [TIMEOUT ERROR] Connection exceeded 500ms threshold.',
              '[3/4] Warning: Solenoid connection failed. Retrying (Attempt 1)...',
              '[4/4] Primary supplier timed out. Seamlessly routing to "EcoShield Pesticides"...'
            ];
          } else if (selectedScenario === 'missing data') {
            beforeState = { supplier: 'AgriCorp Supplies', orderStatus: 'none', paymentAuthorized: false };
            afterState = { supplier: 'AgriCorp Supplies', orderStatus: 'aborted_invalid_input', paymentAuthorized: false };
            success = false;
            retries = 0;
            latency = 250;
            logs = [
              '[1/4] Connecting to primary supplier API: AgriCorp Supplies...',
              '[2/4] [MISSING DATA] Request rejected: missing latitude/longitude coordinates.',
              '[3/4] Raising validation exception. Aborting transaction.',
              'Executing rollback sequence due to permanent task failure...',
              '[ROLLBACK] * Resetting reservoir locks and physical valve actuators.',
              '[ROLLBACK] * Releasing pesticide reserves back to inventory buffers.'
            ];
          } else {
            beforeState = { supplier: 'AgriCorp Supplies', orderStatus: 'none', paymentAuthorized: false };
            afterState = { supplier: 'AgriCorp Supplies', orderStatus: 'confirmed_and_dispatched', paymentAuthorized: true };
            cost = 240.00;
            latency = 600;
            logs = [
              '[1/4] Connecting to supplier API: AgriCorp Supplies...',
              '[2/4] Checking supplier catalog price matches...',
              '[3/4] Authorizing standard payment of $240.00...',
              '[4/4] Order confirmed and dispatched.'
            ];
          }
        } else if (selectedActionType === 'Farmer Alerts') {
          if (selectedScenario === 'API failure' || selectedScenario === 'timeout') {
            beforeState = { alertDispatched: false, currentChannel: 'SMS Gateway' };
            afterState = { alertDispatched: true, currentChannel: 'Push Notification & Email', fallbackDeployed: true };
            cost = 0.02;
            latency = 800;
            retries = 1;
            logs = [
              '[1/3] Attempting broadcast via SMS Gateway...',
              '[2/3] [GATEWAY FAULT] Carrier returned connection drop.',
              '[3/3] SMS fail. Deploying notification recovery: falling back to Push & Email.'
            ];
          } else {
            beforeState = { alertDispatched: false, currentChannel: 'SMS Gateway' };
            afterState = { alertDispatched: true, currentChannel: 'SMS Gateway' };
            cost = 0.08;
            latency = 400;
            logs = [
              '[1/3] Ingesting farmer contact registry...',
              '[2/3] Broadcasting alert payload to registered mobile devices...',
              '[3/3] Alert successfully broadcast and received.'
            ];
          }
        } else {
          beforeState = { waterValvesActive: false, currentSchedule: 'overhead_mist' };
          afterState = { waterValvesActive: true, currentSchedule: 'drip_soil' };
          cost = 0.00;
          latency = 650;
          logs = [
            'Overriding overhead daily irrigation sequence...',
            'Triggering soil drip valves...'
          ];
        }

        const simulatedResult = {
          id: 'act-' + Math.random().toString(36).substr(2, 9),
          type: selectedActionType,
          status: success ? 'completed' : 'failed',
          success,
          cost,
          latency,
          retries,
          beforeState,
          afterState,
          logs
        };

        setSimulatedActionResult(simulatedResult);
        setActionHistory(prev => [simulatedResult, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulatingAction(false);
    }
  };

  // Drag slider calculation
  const handleSliderMove = (e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(5, Math.min(pos, 95)));
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-[#f1f5f9] pb-16">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-primary-green/10 p-2.5 rounded-xl border border-primary-green/20">
            <Cpu className="text-primary-green w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-white via-[#a7f3d0] to-primary-green bg-clip-text text-transparent">
              AGROGUARD AI
            </h1>
            <p className="text-xs text-white/40">Multi-Agent Orchestration Cockpit</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            backendHealthy 
              ? 'bg-primary-green/5 border-primary-green/20 text-primary-green' 
              : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
          }`}>
            {backendHealthy ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{backendHealthy ? 'CONNECTED' : 'SIMULATION MODE'}</span>
          </div>
          <span className="text-white/30 hidden sm:inline">2026-05-19T21:39:19+05:00</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── LEFT HAND SYSTEM CONTROLS & TIMELINE (8 COLS) ── */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Diagnostic Ingest panel */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-green/5 rounded-full blur-3xl -z-10" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Crop Disease Diagnostics</h2>
                <p className="text-sm text-white/55">Orchestrate the 6-agent sequential classification pipeline</p>
              </div>
              <button 
                onClick={handleTriggerAnalysis}
                disabled={isScanning}
                className="bg-primary-green hover:bg-emerald-600 text-dark-slate hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-sm px-5 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:pointer-events-none"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>ANALYZING LEAF...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-dark-slate" />
                    <span>TRIGGER 6-AGENT RUN</span>
                  </>
                )}
              </button>
            </div>

            {/* Ingest logs rendering */}
            {(isScanning || scanLogs.length > 0) && (
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white/40">
                  <span>PIPELINE PROGRESSION</span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary-green to-emerald-accent h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>

                {/* Progressive timeline step nodes */}
                <div className="mt-6 flex flex-col gap-4">
                  {scanLogs.map((log, idx) => {
                    const isOpen = expandedLogId === log.id;
                    const isActive = log.status === 'running';
                    const isDone = log.status === 'done';

                    return (
                      <div 
                        key={log.id} 
                        className={`glass-card rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'border-primary-green/30 bg-primary-green/[0.03] active-border-pulse' 
                            : isDone 
                              ? 'border-white/10' 
                              : 'border-white/5 opacity-40'
                        }`}
                      >
                        <div 
                          onClick={() => log.status !== 'pending' && setExpandedLogId(isOpen ? null : log.id)}
                          className="px-4 py-3.5 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                              isDone 
                                ? 'bg-primary-green text-dark-slate' 
                                : isActive 
                                  ? 'bg-amber-500 text-[#070b13] animate-pulse' 
                                  : 'bg-white/10 text-white/50'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-sm font-bold ${isActive ? 'text-primary-green' : ''}`}>
                              {log.agent}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isDone 
                                ? 'bg-primary-green/10 text-primary-green' 
                                : isActive 
                                  ? 'bg-amber-500/10 text-amber-500' 
                                  : 'bg-white/5 text-white/30'
                            }`}>
                              {log.status.toUpperCase()}
                            </span>
                            {log.status !== 'pending' && (
                              isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />
                            )}
                          </div>
                        </div>

                        {/* Collapsible Details */}
                        {isOpen && log.status !== 'pending' && (
                          <div className="px-4 pb-4 pt-2 text-xs border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="font-black text-primary-green uppercase tracking-wide text-[9px]">Observation</span>
                                <p className="text-white/70">{log.observation}</p>
                              </div>
                              <div className="mt-2">
                                <span className="font-black text-amber-450 text-[9px] uppercase tracking-wide">Reasoning</span>
                                <p className="text-white/70 italic">"{log.reasoning}"</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div>
                                <span className="font-black text-blue-400 uppercase tracking-wide text-[9px]">Action</span>
                                <p className="text-white/70">{log.action}</p>
                              </div>
                              <div className="mt-2">
                                <span className="font-black text-emerald-400 uppercase tracking-wide text-[9px]">Outcome</span>
                                <p className="text-white/80 font-semibold">{log.outcome}</p>
                              </div>
                              {log.recovery && (
                                <div className="mt-2 p-2 bg-red-500/5 border border-red-500/20 rounded-lg flex gap-2">
                                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0" />
                                  <div>
                                    <span className="font-black text-red-400 uppercase tracking-wide text-[8px]">Failsafe Recovery</span>
                                    <p className="text-red-300/80 text-[10px]">{log.recovery}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic Result Details Panel */}
          {scanResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Diagnosis Leaf Details */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <span>Pathology Diagnostic Result</span>
                </h3>
                
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-white/40">CLASSIFICATION</span>
                    <h4 className="text-sm font-black text-white">{scanResult.diseaseName}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/40">CONFIDENCE</span>
                    <h4 className="text-sm font-black text-primary-green">{(scanResult.confidence * 100).toFixed(0)}%</h4>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs text-white/40">DIAGNOSTIC DESCRIPTION</span>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">{scanResult.description}</p>
                </div>

                <div>
                  <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Recommendations:</span>
                  <ul className="mt-2 flex flex-col gap-2">
                    {scanResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs flex gap-2 items-start text-white/70">
                        <CheckCircle className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Before vs After comparison slider */}
              <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
                <div>
                  <h3 className="text-base font-bold">Treatment Simulation</h3>
                  <p className="text-xs text-white/40">Drag slider to compare before vs after treatment</p>
                </div>

                <div 
                  ref={sliderRef}
                  onMouseMove={handleSliderMove}
                  onTouchMove={handleSliderMove}
                  className="relative w-full h-56 rounded-xl overflow-hidden cursor-ew-resize select-none border border-white/10"
                >
                  {/* After Treatment (Healthy green) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950 flex flex-col items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-emerald-400 opacity-30" />
                    <span className="text-xs text-emerald-300 mt-2 font-bold uppercase tracking-wide">Healthy treated state</span>
                  </div>

                  {/* Before Treatment (Diseased orange) - clipped */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-red-950 to-orange-950 flex flex-col items-center justify-center transition-all duration-75"
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                  >
                    <AlertTriangle className="w-12 h-12 text-orange-500 opacity-30" />
                    <span className="text-xs text-orange-400 mt-2 font-bold uppercase tracking-wide">Infected foliage state</span>
                  </div>

                  {/* Slider divider line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20"
                    style={{ left: `${sliderPosition}%` }}
                  />

                  {/* Drag Button handle */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-dark-slate flex items-center justify-center shadow-2xl z-30"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <span className="text-[10px] font-black">↔</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-white/40 uppercase">
                  <span>← INFECTED</span>
                  <span>HEALTHY →</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Simulation Board */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold">Dynamic Action Simulation Engine</h2>
              <p className="text-sm text-white/55">Simulate hardware actions and verify failure-recovery workflows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/40 font-bold uppercase">Select Action Type</label>
                <select 
                  value={selectedActionType} 
                  onChange={(e) => setSelectedActionType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-green text-white"
                >
                  <option className="bg-dark-slate text-white" value="Emergency Pesticide Order">Emergency Pesticide Order</option>
                  <option className="bg-dark-slate text-white" value="Farmer Alerts">Farmer Alerts</option>
                  <option className="bg-dark-slate text-white" value="Irrigation Scheduling">Irrigation Scheduling</option>
                  <option className="bg-dark-slate text-white" value="Monitoring Setup">Monitoring Setup</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/40 font-bold uppercase">Simulate Failure Scenario</label>
                <select 
                  value={selectedScenario} 
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-green text-white"
                >
                  <option className="bg-dark-slate text-white" value="none">None (Standard Success)</option>
                  <option className="bg-dark-slate text-white" value="API failure">API Failure (500 Error / Failover)</option>
                  <option className="bg-dark-slate text-white" value="timeout">Timeout Error (Delay / Failover)</option>
                  <option className="bg-dark-slate text-white" value="invalid response">Invalid Supplier Response (Failover)</option>
                  <option className="bg-dark-slate text-white" value="missing data">Missing Vital Coordinate Data (Rollback)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSimulateAction}
              disabled={simulatingAction}
              className="bg-primary-green hover:bg-emerald-600 text-dark-slate font-black text-sm py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {simulatingAction ? 'SIMULATING RECOVERY FLOW...' : 'TRIGGER ACTION SIMULATION'}
            </button>

            {/* Results tracking */}
            {simulatedActionResult && (
              <div className="mt-4 p-5 bg-white/[0.02] border border-white/5 rounded-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <span className="text-[10px] text-white/40 font-bold uppercase">SIMULATED ID</span>
                    <h4 className="text-sm font-black text-white">{simulatedActionResult.id}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 font-bold uppercase">OUTCOME</span>
                    <h4 className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      simulatedActionResult.success 
                        ? 'bg-primary-green/10 text-primary-green' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {simulatedActionResult.status.toUpperCase()}
                    </h4>
                  </div>
                </div>

                {/* Simulation Performance Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 font-bold block uppercase">Latency</span>
                    <span className="text-sm font-black text-white">{simulatedActionResult.latency} ms</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 font-bold block uppercase">Financial Cost</span>
                    <span className="text-sm font-black text-white">${simulatedActionResult.cost.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 font-bold block uppercase">Retries Used</span>
                    <span className="text-sm font-black text-white">{simulatedActionResult.retries}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/40 font-bold block uppercase">State Rollback</span>
                    <span className={`text-sm font-black ${simulatedActionResult.rollbackExecuted ? 'text-red-400' : 'text-white/40'}`}>
                      {simulatedActionResult.rollbackExecuted ? 'EXECUTED' : 'NONE'}
                    </span>
                  </div>
                </div>

                {/* Progress logs */}
                <div className="text-xs">
                  <span className="font-bold text-white/40 block mb-2 uppercase">Execution Traces</span>
                  <div className="bg-[#070b13] p-3 rounded-lg border border-white/5 flex flex-col gap-1.5 font-mono max-h-36 overflow-y-auto">
                    {simulatedActionResult.logs.map((log, i) => (
                      <p 
                        key={i} 
                        className={
                          log.includes('[API FAILURE]') || log.includes('[TIMEOUT') || log.includes('[INVALID') || log.includes('[VALIDATION')
                            ? 'text-amber-500'
                            : log.includes('[ROLLBACK]') || log.includes('Executing rollback')
                              ? 'text-red-400'
                              : 'text-white/70'
                        }
                      >
                        {log}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Before vs After matrix comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">State Snapshot (Before)</span>
                    <pre className="bg-[#070b13] p-3 rounded-lg border border-white/5 text-[10px] font-mono text-white/60 overflow-x-auto">
                      {JSON.stringify(simulatedActionResult.beforeState, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-white/40 uppercase block mb-1">State Snapshot (After)</span>
                    <pre className="bg-[#070b13] p-3 rounded-lg border border-white/5 text-[10px] font-mono text-emerald-450/80 overflow-x-auto">
                      {JSON.stringify(simulatedActionResult.afterState, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT HAND CROP ANALYTICS & STATS GRID (4 COLS) ── */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Active Alerts Panel */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-amber-500 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="text-amber-500 w-5 h-5 animate-bounce" />
                <span>Active Safety Alerts</span>
              </h3>
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                CRITICAL
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Late Blight Warning</span>
                  <span className="text-white/40">10m ago</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1">Spore growth model indicates high probability of spread due to high humidity (75%). Override overhead watering triggered.</p>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Failsafe Valve Trip</span>
                  <span className="text-white/40">1h ago</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1">Solenoid #3 experienced transient latency. Automated self-correction engaged. Valves re-calibrated correctly.</p>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Panel */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="text-primary-green w-5 h-5" />
                <span>Historic Crop Health</span>
              </h3>
              <p className="text-xs text-white/40">Aggregated health index logs over 6-week spans</p>
            </div>

            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_ANALYTICS_DATA}>
                  <defs>
                    <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
                  <YAxis stroke="rgba(255,255,255,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend />
                  <Area type="monotone" dataKey="Tomato" stroke="#10b981" fillOpacity={1} fill="url(#colorTomato)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Moisture and Spread Risks */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Droplet className="text-blue-400 w-5 h-5" />
                <span>Zone Moisture & Spread Risk</span>
              </h3>
              <p className="text-xs text-white/40">Comparison parameters across sector boundaries</p>
            </div>

            <div className="h-56 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_BAR_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" />
                  <YAxis stroke="rgba(255,255,255,0.4)" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="moisture" fill="#60a5fa" name="Moisture %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spreadRisk" fill="#f87171" name="Spread Risk" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Agents Registries */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Layers className="text-[#a7f3d0] w-5 h-5" />
              <span>Registered AI Diagnostics</span>
            </h3>

            <div className="flex flex-col gap-2 text-xs">
              {[
                { name: 'Input Aggregation Agent', role: 'Sensor Telemetry Ingest' },
                { name: 'Disease Analysis Agent', role: 'Multimodal Diagnostics' },
                { name: 'Risk Assessment Agent', role: 'Quantification Models' },
                { name: 'Constraint Planning Agent', role: 'Contradiction Resolution' },
                { name: 'Action Execution Agent', role: 'Actuator Spray Dispatches' },
                { name: 'Recovery Agent', role: 'Rollback & Safe Restoration' }
              ].map((agent, i) => (
                <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-white">{agent.name}</h5>
                    <span className="text-[10px] text-white/40">{agent.role}</span>
                  </div>
                  <span className="text-[9px] font-black bg-primary-green/10 text-primary-green px-2 py-0.5 rounded-full">
                    ONLINE
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
