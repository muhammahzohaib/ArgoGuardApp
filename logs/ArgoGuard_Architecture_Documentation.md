# ArgoGuard AI: Architecture & Design Documentation

This document provides a comprehensive overview of the design, architecture, integrations, and intelligent agent orchestrations that power the **ArgoGuard AI** platform.

---

## 1. Overall Solution Overview

**ArgoGuard AI** is an advanced, AI-driven agricultural assistant platform designed to provide end-to-end crop management for farmers. It bridges the gap between digital AI analysis and physical farm operations. 

The system allows farmers to upload images of their crops, which are analyzed by a multi-agent orchestration engine. This engine doesn't just diagnose diseases; it assesses environmental risks, plans safe treatments, coordinates hardware actions (like smart sprinklers or pesticide drones), and features robust failsafe mechanisms to revert operations if hardware errors occur.

---

## 2. Brief Overview of Architecture

The system follows a classic decoupled client-server architecture:

### Frontend (Client)
- **Framework:** Flutter / Dart
- **State Management:** `Provider` architecture for reactive UI updates (`AuthProvider`, `AnalysisProvider`, `WeatherProvider`).
- **UI/UX:** A highly modern, premium glassmorphic interface with rich animations, responsive layouts, and intuitive dashboards.
- **Key Modules:** Dashboard (Weather & Stats), Camera Upload/Scan, Active Alerts, Notification History, and detailed AI Analysis breakdown.

### Backend (Server)
- **Framework:** Node.js with Express.js
- **Pattern:** Modular MVC-style design (`routes`, `controllers`, `services`, `middleware`).
- **Orchestration:** Custom Multi-Agent Orchestration pipeline simulating complex LLM and hardware interactions.
- **Data Flow:** RESTful API endpoints handling JSON payloads and multipart-form data for image uploads.

---

## 3. The Multi-Agent Orchestration Engine

The core of ArgoGuard AI's backend is a linear, multi-phase agent orchestration system. Each agent handles a specific domain of reasoning:

1. **Input Aggregation Agent:** Collects inputs from the user (images) and local sensors/APIs (temperature, humidity, location).
2. **Disease Analysis Agent:** Integrates with **Google Gemini Vision AI** to scan crop images, identify pathogens, determine confidence levels, and suggest immediate treatments.
3. **Risk Assessment Agent:** Evaluates secondary risks. For example, if a highly contagious fungus is detected, it assesses the spread probability based on current wind and humidity.
4. **Constraint Planning Agent (Contradiction Resolution):** Ensures safe operations. If the Disease Agent suggests pesticide spraying, but the Weather Agent detects high winds (>20km/h), this agent *resolves the contradiction* by overriding the spray command and suggesting a safer alternative (e.g., localized drip treatment).
5. **Action Execution Agent:** Interfaces with mocked hardware (IoT devices like valves or drones) to execute the planned treatment.
6. **Recovery Agent:** Monitors execution. If an execution fails (e.g., "Connection drop or valve error"), this agent initiates a rapid **Rollback Protocol**, resetting hardware states, preventing chemical leaks, and alerting the farmer.

---

## 4. Real / Mock APIs and Integrations

### External Integrations (Real APIs)
- **Open-Meteo API (Real-Time Weather):** 
  - **Type:** Real API (Keyless)
  - **Purpose:** Fetches high-fidelity, real-time meteorological data (temperature, windspeed, rain probability) based on the client's precise latitude and longitude. 
  - **Implementation:** Custom Node.js service that translates WMO weather codes into human-readable descriptions and feeds data into the Constraint Planning Agent for weather-based agricultural recommendations.

- **Google Gemini API (Vision):**
  - **Type:** Real API
  - **Purpose:** Analyzes uploaded crop images to diagnose diseases, identify crop types, and generate severity scores.

### Internal Endpoints (Mocked / Simulated Execution)
To demonstrate complex IoT capabilities without requiring physical hardware, several components are heavily mocked with high-fidelity simulations:
- **`POST /actions`**: Simulates the dispatch of physical hardware (e.g., Drone Spraying, Sprinkler Activation). It simulates network latency, connection drops, and hardware failures to trigger the Recovery Agent.
- **`POST /auth/login`**: Simulates JWT-based authentication for demo users without requiring a live database connection.
- **`GET /logs`**: Serves the step-by-step reasoning traces of all AI agents to the Flutter frontend so the farmer has full transparency into how a decision was made.

---

## 5. Failure Recovery & Failsafes

In an agricultural setting, an AI making a mistake (like over-watering or dumping excessive pesticide) can destroy a harvest. ArgoGuard AI emphasizes **Safe AI**:

- **Graceful Degradation:** If the backend weather API fails, the Flutter app instantly falls back to an offline mock state to prevent the UI from crashing.
- **Terminal Rollbacks:** If the `Action Execution Agent` attempts to spray crops but fails 3 times due to simulated connection drops, the `Recovery Agent` steps in. It logs a `[ROLLBACK]` event, mathematically resets simulated chemical reservoirs to prevent double-dosing, and triggers an emergency push notification to the farmer's dashboard.

---

## Summary

ArgoGuard AI is not a simple wrapper around an LLM. It is a comprehensive **Agentic Workflow** that processes visual data, correlates it with real-time environmental APIs, plans hardware-safe actions, resolves logical contradictions, and guarantees hardware safety through automated rollbacks.
