# 💻 ArgoGuard AI Web Dashboard Cockpit

This is the **Web Dashboard Frontend** for **ArgoGuard AI**, a smart farming and resiliency cockpit. It is built using **React (v19)**, **Vite**, **Tailwind CSS (v4)**, **Lucide React**, and **Recharts**.

---

## 🌟 Key Dashboard Features

1.  **Multi-Agent Orchestration Cockpit:**
    *   Initiate a sequential **6-agent classification run** directly from the UI.
    *   Follow step-by-step progress with progress bars and dynamic timeline checkpoints.
    *   Expand individual agent logs to inspect precise diagnostic telemetry: *Observation, Reasoning, Action, Outcome*, and *Failsafe Recovery* overrides.
2.  **Treatment Simulation Slider:**
    *   An interactive visual slider allowing comparison between diseased (before treatment) and healthy (after treatment) crop foliage.
3.  **Dynamic Action Simulation Engine:**
    *   Test hardware reliability by simulating actions (e.g. *Emergency Pesticide Orders*, *Farmer SMS Alerts*, *Irrigation Upgrades*).
    *   Select and inject failure scenarios: *API Failures*, *Connection Timeouts*, *Invalid Responses*, or *Missing Geographical Data*.
    *   Observe live metrics: transaction cost, execution latency, retry tracking, automatic supplier failover logs, rollback sequences, and before/after JSON states.
4.  **Recharts Agricultural Analytics:**
    *   Historical **Crop Health Index** over 6-week intervals.
    *   **Zonal Soil Moisture vs Spread Risk** comparison chart.
5.  **Active Safety Alerts Panel:**
    *   Instant display of ongoing biological risk notifications and transient valve/actuator failsafe reports.

---

## 🚀 Running the Web Dashboard

### Prerequisites
Make sure the **Backend Server** is up and running first so the dashboard can fetch live telemetry and communicate with the real failover services.
*(Note: If the backend is offline, the dashboard automatically runs in a local high-fidelity premium simulation mode so all interactive buttons and logs are still fully operational).*

### Commands
1. Navigate to this `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary node modules:
   ```bash
   npm install
   ```
3. Run the Vite local development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and go to `http://localhost:5173`.
