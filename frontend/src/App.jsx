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
  WifiOff,
  Mail,
  Lock,
  User,
  Sparkles,
  KeyRound,
  Timer,
  LogOut,
  Globe
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
  // Authentication & Session States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Auth Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Farmer');
  
  // OTP Verification States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  
  // UX & Async States
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [notification, setNotification] = useState(null);

  // Connection & Diagnostics States
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

  // Check connection status & session persistence on startup
  useEffect(() => {
    const initSession = async () => {
      const storedToken = localStorage.getItem('argoguard_token');
      let isBackendAlive = false;

      try {
        const healthRes = await axios.get(`${BACKEND_URL}/health`);
        if (healthRes.status === 200) {
          setBackendHealthy(true);
          isBackendAlive = true;
        }
      } catch (err) {
        console.warn('Backend is offline. Running dashboard in premium simulation mode.');
        setBackendHealthy(false);
      }

      if (storedToken) {
        if (isBackendAlive) {
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            const meRes = await axios.get(`${BACKEND_URL}/auth/me`);
            if (meRes.data && meRes.data.success) {
              setAuthToken(storedToken);
              setUserProfile(meRes.data.data);
              setIsAuthenticated(true);
              showNotification(`Welcome back, ${meRes.data.data.name}!`, 'success');
            } else {
              localStorage.removeItem('argoguard_token');
            }
          } catch (err) {
            console.error('Session validation failed. Re-authentication required.');
            localStorage.removeItem('argoguard_token');
          }
        } else {
          // Offline persistent session recovery
          const offlineUser = localStorage.getItem('argoguard_user');
          if (offlineUser) {
            setAuthToken(storedToken);
            setUserProfile(JSON.parse(offlineUser));
            setIsAuthenticated(true);
            showNotification(`Offline session recovered! Welcome back!`, 'info');
          }
        }
      }
    };
    initSession();
  }, []);

  // OTP Countdown Timer Hook
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Alert/Notification Toast Manager
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 8000);
  };

  // Standard Form Submission (Login / Register Phase 1)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (!email || !password || (authMode === 'register' && !name)) {
      setAuthError('Please fill out all required fields.');
      setAuthLoading(false);
      return;
    }

    try {
      if (backendHealthy) {
        if (authMode === 'register') {
          // 1. Submit standard register to backend
          const res = await axios.post(`${BACKEND_URL}/auth/register`, {
            name,
            email,
            password,
            role
          });
          
          if (res.data && res.data.success) {
            // 2. Request OTP Code for verification
            await axios.post(`${BACKEND_URL}/auth/send-otp`, { email });
            showNotification('OTP verification code dispatched to your email!', 'success');
            setSimulatedOtp('');
            setOtpTimer(60);
            setShowOtpScreen(true);
          }
        } else {
          // 1. Submit login validation to backend
          const res = await axios.post(`${BACKEND_URL}/auth/login`, {
            email,
            password
          });
          
          if (res.data && res.data.success) {
            // 2. Request OTP code for multi-factor check
            await axios.post(`${BACKEND_URL}/auth/send-otp`, { email });
            showNotification('Security OTP code sent to your email!', 'success');
            setSimulatedOtp('');
            setOtpTimer(60);
            setShowOtpScreen(true);
          }
        }
      } else {
        // High-fidelity offline simulation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simulating the OTP code dispatch
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedOtp(generatedCode);
        setOtpTimer(60);
        setShowOtpScreen(true);
        
        showNotification(`[SIMULATION MODE] Verification code generated: ${generatedCode}`, 'info');
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.response?.data?.message || 'Authentication request failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // OTP Verification Submission (Phase 2)
  const handleOtpVerify = async (e) => {
    if (e) e.preventDefault();
    const joinedCode = otpDigits.join('');
    
    if (joinedCode.length !== 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    setAuthLoading(true);
    setOtpError('');

    try {
      if (backendHealthy) {
        const res = await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
          email,
          code: joinedCode
        });

        if (res.data && res.data.success) {
          const { token, id, name: uName, email: uEmail, role: uRole } = res.data.data;
          
          localStorage.setItem('argoguard_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const profile = { id, name: uName, email: uEmail, role: uRole };
          setUserProfile(profile);
          setAuthToken(token);
          setIsAuthenticated(true);
          showNotification('Verification successful! Cockpit unlocked.', 'success');
        }
      } else {
        // Offline validation
        await new Promise(resolve => setTimeout(resolve, 600));
        if (joinedCode === simulatedOtp || joinedCode === '123456') {
          const profile = {
            id: 'sim-user-' + Math.random().toString(36).substr(2, 5),
            name: name || email.split('@')[0],
            email,
            role
          };
          
          localStorage.setItem('argoguard_token', 'simulated_jwt_token_payload');
          localStorage.setItem('argoguard_user', JSON.stringify(profile));
          
          setUserProfile(profile);
          setAuthToken('simulated_jwt_token_payload');
          setIsAuthenticated(true);
          showNotification('Verification successful [Offline Simulation mode].', 'success');
        } else {
          setOtpError('Invalid simulated OTP code. Try "123456" as a master bypass.');
        }
      }
    } catch (err) {
      console.error(err);
      setOtpError(err.response?.data?.message || 'Verification failed. Please re-enter the code.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Social OAuth Handler (Google / Facebook)
  const handleSocialLogin = async (provider) => {
    setAuthLoading(true);
    setAuthError('');
    
    try {
      if (backendHealthy) {
        const res = await axios.post(`${BACKEND_URL}/auth/social-login`, {
          provider,
          token: 'mock-oauth-token-client-verification-code'
        });

        if (res.data && res.data.success) {
          const { token, id, name: uName, email: uEmail, role: uRole } = res.data.data;
          
          localStorage.setItem('argoguard_token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const profile = { id, name: uName, email: uEmail, role: uRole };
          setUserProfile(profile);
          setAuthToken(token);
          setIsAuthenticated(true);
          showNotification(`Social login successful! Logged in via ${provider}`, 'success');
        }
      } else {
        // Offline social login simulator
        await new Promise(resolve => setTimeout(resolve, 600));
        const profile = {
          id: `sim-${provider.toLowerCase()}-user`,
          name: `${provider} Farmer`,
          email: `${provider.toLowerCase()}.farmer@agroguard.ai`,
          role: 'Farmer'
        };
        
        localStorage.setItem('argoguard_token', 'simulated_social_token');
        localStorage.setItem('argoguard_user', JSON.stringify(profile));
        
        setUserProfile(profile);
        setAuthToken('simulated_social_token');
        setIsAuthenticated(true);
        showNotification(`Logged in via simulated ${provider} OAuth portal.`, 'success');
      }
    } catch (err) {
      console.error(err);
      setAuthError(`Failed to authenticate via ${provider}. Please try standard sign-in.`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend OTP Service
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    
    try {
      if (backendHealthy) {
        await axios.post(`${BACKEND_URL}/auth/send-otp`, { email });
        showNotification('New verification OTP dispatched successfully!', 'success');
      } else {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedOtp(generatedCode);
        showNotification(`[SIMULATION MODE] New verification code generated: ${generatedCode}`, 'info');
      }
      setOtpTimer(60);
    } catch (err) {
      console.error(err);
      showNotification('Failed to dispatch new verification code.', 'error');
    }
  };

  // Sign out / Destroy session
  const handleLogout = () => {
    localStorage.removeItem('argoguard_token');
    localStorage.removeItem('argoguard_user');
    setIsAuthenticated(false);
    setUserProfile(null);
    setAuthToken(null);
    setShowOtpScreen(false);
    setOtpDigits(['', '', '', '', '', '']);
    setEmail('');
    setPassword('');
    setName('');
    showNotification('Logged out successfully. Secure cockpit locked.', 'info');
  };

  // Handle OTP digit inputs focusing and keypress tabbing
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const value = element.value;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    // Shift focus forward
    if (value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newDigits = [...otpDigits];
      newDigits[index] = '';
      setOtpDigits(newDigits);
      
      // Shift focus backward
      if (e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

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

  // Rendering logic
  return (
    <div className="min-h-screen bg-[#070b13] text-[#f1f5f9] pb-16 selection:bg-primary-green selection:text-dark-slate">
      
      {/* ── NOTIFICATION FLOATING BANNER ── */}
      {notification && (
        <div className="fixed top-6 right-6 z-[9999] glass-panel px-5 py-4 rounded-xl border-l-4 border-primary-green flex items-start gap-3 shadow-2xl animate-fade-in max-w-sm">
          <div className="bg-primary-green/10 p-1.5 rounded-lg">
            <Sparkles className="text-primary-green w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-primary-green tracking-wider">ArgoGuard Telemetry</h4>
            <p className="text-xs text-white/80 mt-0.5 leading-relaxed">{notification.message}</p>
          </div>
        </div>
      )}

      {/* ── AUTHENTICATION PORTAL (IF NOT LOGGED IN) ── */}
      {!isAuthenticated ? (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 relative overflow-hidden">
          
          {/* Decorative glowing backdrops */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-700/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-700/10 rounded-full blur-[120px] -z-10" />

          {/* Left Side: Architectural Info Grid (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-r border-white/5 bg-[#080d16]/40 relative">
            <div className="flex items-center gap-3">
              <div className="bg-primary-green/10 p-2.5 rounded-xl border border-primary-green/20">
                <Cpu className="text-primary-green w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-white via-[#a7f3d0] to-primary-green bg-clip-text text-transparent uppercase">
                  AGROGUARD AI
                </h1>
                <p className="text-xs text-white/30 uppercase tracking-widest">Resiliency Cockpit</p>
              </div>
            </div>

            <div className="my-12 lg:my-0 flex flex-col gap-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  High-Fidelity <br />
                  <span className="text-primary-green bg-gradient-to-r from-primary-green via-emerald-accent to-emerald-400 bg-clip-text text-transparent">Multi-Agent</span> Control
                </h2>
                <p className="text-sm text-white/50 mt-4 leading-relaxed max-w-md">
                  Empowering modern agriculture with localized weather logic constraints, computer-vision pathology analytics, and robust self-healing hardware failovers.
                </p>
              </div>

              {/* Bullet Features */}
              <div className="flex flex-col gap-4 text-xs font-semibold">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-green/10 flex items-center justify-center border border-primary-green/20 flex-shrink-0 mt-0.5 text-primary-green">✓</div>
                  <div>
                    <h4 className="text-white">6-Agent Orchestrated Diagnostics</h4>
                    <p className="text-white/40 font-normal mt-0.5">Sequential analysis loops with full transparency into observation, reasoning and recovery paths.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-green/10 flex items-center justify-center border border-primary-green/20 flex-shrink-0 mt-0.5 text-primary-green">✓</div>
                  <div>
                    <h4 className="text-white">Resilient Failover & Rollback Engine</h4>
                    <p className="text-white/40 font-normal mt-0.5">Automated containment logic that handles external API dropouts and triggers transaction rollbacks safely.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-green/10 flex items-center justify-center border border-primary-green/20 flex-shrink-0 mt-0.5 text-primary-green">✓</div>
                  <div>
                    <h4 className="text-white">Contradiction Override Logic</h4>
                    <p className="text-white/40 font-normal mt-0.5">Resolves conflicting parameters to avoid damage from moisture-loving crop disease outbreaks.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-white/30 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>AgroGuard Safe Autonomous Farming System © 2026</span>
            </div>
          </div>

          {/* Right Side: Interactive Authentication Form Card (7 Cols) */}
          <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
            <div className="w-full max-w-md relative">
              
              {/* Glassmorphic Box */}
              <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl border border-white/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/10 rounded-full blur-2xl -z-10" />

                {/* OTP Overlay Screen */}
                {showOtpScreen ? (
                  <div className="flex flex-col gap-6 animate-fade-in">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary-green/10 border border-primary-green/20 flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="w-8 h-8 text-primary-green" />
                      </div>
                      <h3 className="text-xl font-black text-white">🔐 Multi-Factor Authentication</h3>
                      <p className="text-xs text-white/55 mt-2">
                        We have dispatched a 6-digit security token to <span className="font-bold text-white">{email}</span>. Please verify below.
                      </p>
                    </div>

                    <form onSubmit={handleOtpVerify} className="flex flex-col gap-6">
                      <div className="flex items-center justify-center gap-2.5">
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e.target, index)}
                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                            className="w-12 h-14 bg-white/5 border border-white/10 focus:border-primary-green rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary-green/30"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{otpError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="bg-primary-green hover:bg-emerald-600 text-dark-slate font-black text-sm py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                      >
                        {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>VERIFY & UNLOCK</span>}
                      </button>
                    </form>

                    <div className="text-center text-xs">
                      <p className="text-white/40">
                        Didn't receive the code?{' '}
                        {otpTimer > 0 ? (
                          <span className="text-white/60 font-semibold flex items-center justify-center gap-1.5 mt-1.5">
                            <Timer className="w-3.5 h-3.5 animate-pulse" />
                            <span>Resend in {otpTimer}s</span>
                          </span>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            className="text-primary-green hover:underline font-black focus:outline-none cursor-pointer mt-1"
                          >
                            Resend Verification OTP
                          </button>
                        )}
                      </p>
                      {simulatedOtp && (
                        <div className="mt-4 p-3 bg-white/5 border border-white/5 rounded-xl font-mono text-[10px] text-primary-green">
                          Simulated Code Output: {simulatedOtp} <br />
                          (Copy & enter this code)
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowOtpScreen(false);
                        setOtpDigits(['', '', '', '', '', '']);
                      }}
                      className="text-xs text-white/40 hover:text-white/70 flex items-center justify-center gap-1 mt-2 focus:outline-none"
                    >
                      ← Back to Auth Forms
                    </button>
                  </div>
                ) : (
                  // Sign In & Registration forms
                  <div className="flex flex-col gap-6">
                    {/* Toggles */}
                    <div className="grid grid-cols-2 bg-white/5 p-1 rounded-xl border border-white/5">
                      <button
                        onClick={() => {
                          setAuthMode('login');
                          setAuthError('');
                        }}
                        className={`py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                          authMode === 'login' 
                            ? 'bg-primary-green text-dark-slate shadow-md' 
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('register');
                          setAuthError('');
                        }}
                        className={`py-2 text-xs font-black tracking-wider uppercase rounded-lg transition-all ${
                          authMode === 'register' 
                            ? 'bg-primary-green text-dark-slate shadow-md' 
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Create Account
                      </button>
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-black text-white">
                        {authMode === 'login' ? '🔐 Cockpit Sign-In' : '🌱 Register Farmer'}
                      </h3>
                      <p className="text-xs text-white/50 mt-1">
                        {authMode === 'login' ? 'Unlock agricultural operations and telemetry' : 'Configure localized diagnostics parameters'}
                      </p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                      {/* Name field (Registration Only) */}
                      {authMode === 'register' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black">Full Name</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none">
                              <User className="w-4 h-4" />
                            </span>
                            <input
                              type="text"
                              required
                              placeholder="Jane Doe"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 focus:border-primary-green rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-white focus:ring-1 focus:ring-primary-green/30"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-black">Email Address</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none">
                            <Mail className="w-4 h-4" />
                          </span>
                          <input
                            type="email"
                            required
                            placeholder="demo@agroguard.ai"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-primary-green rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-white focus:ring-1 focus:ring-primary-green/30"
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-white/40 uppercase tracking-widest font-black">Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30 pointer-events-none">
                            <Lock className="w-4 h-4" />
                          </span>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-primary-green rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-white focus:ring-1 focus:ring-primary-green/30"
                          />
                        </div>
                      </div>

                      {/* Role selection (Registration Only) */}
                      {authMode === 'register' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] text-white/40 uppercase tracking-widest font-black">Operational Role</label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-primary-green rounded-xl px-4 py-3 text-sm focus:outline-none text-white"
                          >
                            <option value="Farmer" className="bg-dark-slate text-white">Farmer</option>
                            <option value="Agronomist" className="bg-dark-slate text-white">Agronomist</option>
                            <option value="Manager" className="bg-dark-slate text-white">Farm Manager</option>
                            <option value="Admin" className="bg-dark-slate text-white">Administrator</option>
                          </select>
                        </div>
                      )}

                      {authError && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2 mt-1">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                          <span>{authError}</span>
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="bg-primary-green hover:bg-emerald-600 text-dark-slate font-black text-sm py-3.5 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg"
                      >
                        {authLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{authMode === 'login' ? 'SEND VERIFICATION OTP' : 'REGISTER & VERIFY'}</span>
                        )}
                      </button>
                    </form>

                    {/* Social Logins */}
                    <div className="flex flex-col gap-4 mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-grow border-t border-white/5" />
                        <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Or continue with</span>
                        <div className="flex-grow border-t border-white/5" />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        {/* Google Button */}
                        <button
                          onClick={() => handleSocialLogin('Google')}
                          disabled={authLoading}
                          className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span>Google</span>
                        </button>

                        {/* Facebook Button */}
                        <button
                          onClick={() => handleSocialLogin('Facebook')}
                          disabled={authLoading}
                          className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                        >
                          <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>Facebook</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (

        // ── MAIN APPLICATION COCKPIT ──
        <>
          {/* ── HEADER ── */}
          <header className="sticky top-0 z-50 glass-panel px-6 py-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="bg-primary-green/10 p-2.5 rounded-xl border border-primary-green/20">
                <Cpu className="text-primary-green w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wide bg-gradient-to-r from-white via-[#a7f3d0] to-primary-green bg-clip-text text-transparent uppercase">
                  AGROGUARD AI
                </h1>
                <p className="text-xs text-white/40">Multi-Agent Orchestration Cockpit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs">
              {/* User Profile Badge */}
              {userProfile && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-primary-green/20 border border-primary-green/45 flex items-center justify-center text-[10px] text-primary-green font-bold uppercase">
                    {userProfile.name[0]}
                  </div>
                  <div className="text-left hidden sm:block">
                    <h5 className="font-bold text-white leading-none text-xs">{userProfile.name}</h5>
                    <span className="text-[9px] text-white/40 tracking-wider font-semibold uppercase">{userProfile.role}</span>
                  </div>
                </div>
              )}

              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                backendHealthy 
                  ? 'bg-primary-green/5 border-primary-green/20 text-primary-green' 
                  : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
              }`}>
                {backendHealthy ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span>{backendHealthy ? 'CONNECTED' : 'SIMULATION MODE'}</span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500/5 border border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 text-red-400 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none"
                title="Lock Cockpit"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
                        <span className="text-[9px] text-white/40 block uppercase">Latency</span>
                        <span className="text-sm font-black text-white">{simulatedActionResult.latency} ms</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-white/40 block uppercase">Financial Cost</span>
                        <span className="text-sm font-black text-white">${simulatedActionResult.cost.toFixed(2)}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-white/40 block uppercase">Retries Used</span>
                        <span className="text-sm font-black text-white">{simulatedActionResult.retries}</span>
                      </div>
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[9px] text-white/40 block uppercase">State Rollback</span>
                        <span className={`text-sm font-black ${simulatedActionResult.status === 'failed' && selectedScenario === 'missing data' ? 'text-red-400 animate-pulse' : 'text-white/45'}`}>
                          {simulatedActionResult.status === 'failed' && selectedScenario === 'missing data' ? 'EXECUTED' : 'NONE'}
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
                        <pre className="bg-[#070b13] p-3 rounded-lg border border-white/5 text-[10px] font-mono text-emerald-400/80 overflow-x-auto">
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
        </>
      )}
    </div>
  );
}

export default App;
