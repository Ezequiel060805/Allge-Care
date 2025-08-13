# Spirulina IoT – Mobile Monitoring & Control App

[![Made with React Native](https://img.shields.io/badge/React%20Native-0.7x-blue)](https://reactnative.dev/)  
[![Expo](https://img.shields.io/badge/Expo-~51-000?logo=expo&logoColor=fff)](https://expo.dev/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)

A cross-platform (iOS/Android) app to **monitor and optimize Spirulina cultivation** using an IoT architecture. The app surfaces real-time readings (pH, temperature, light), shows trends with charts, and sends alerts when parameters drift out of optimal ranges. It also supports **automated agitation scheduling** (e.g., every 2–4 hours based on CO₂ concentration) and remote control features.

---

## ✨ Key Features

- **Real-time monitoring** of pH, temperature,light.  
- **Automated agitation control** (water bump) with cycles tuned to CO₂ levels (every 2–4 hours).  
- **Threshold-based alerts & predictive notifications** when values leave safe ranges.  
- **Historical charts & trends** (day, week, month) for data-driven decisions.  
- **Remote access** to the cultivation system via Wi-Fi + cloud.  
- **Modular IoT architecture** integrating sensors, microcontroller, cloud, and mobile UI.

---

## 🧭 App Structure

This project uses **Expo Router** with TypeScript.

```
app/
  _layout.tsx          # Root layout (navigation shell)
  index.tsx            # Home / Dashboard (quick stats, charts, alerts)
  two.tsx              # Trends / Analytics (D/W/M charts)
  three.tsx            # Controls (agitation scheduling, thresholds)
  LoginScreen.tsx      # Auth screen (optional, can be moved under /auth)
  Acerca de.tsx        # About / Project info (rename to about.tsx if desired)
assets/
```

## 🏗️ Architecture (High Level)

**Devices/Sensors**: pH, temperature, light.  
**Controller/Actuators**: Microcontroller (Arduino/Raspberry Pi), water bump, relays  
**Connectivity**: Wi-Fi to cloud or local gateway  
**Data & App**: Cloud API (REST/MQTT) + this React Native app for visualization, control, and alerts

---

## 🔧 Tech Stack

- **App**: React Native + Expo + TypeScript + Expo Router  
- **State**: (Choose) Redux Toolkit / Zustand / React Query for server cache  
- **Charts**: Victory Native / react-native-svg-charts (pick one)  
- **Networking**: Fetch/Axios, optional MQTT client (e.g., `sp-react-native-mqtt`)  
- **Auth**: (Optional) JWT/OAuth2/OpenID Connect

---

## 🚀 Getting Started

### Prerequisites

- Node.js LTS (≥ 18) and pnpm/npm/yarn  
- Expo CLI (`npm i -g expo`)  
- iOS Simulator (Xcode) or Android Emulator (Android Studio), or Expo Go app on a device  
- (Optional) Running **IoT backend** (MQTT broker / REST server)

### Installation

```bash
# clone
git clone https://github.com/Ezequiel060805/Allge-Care.git
cd Allge-Care

# install deps
npm install
npm install expo
npx expo install expo-linear-gradient
```

### Environment Variables

Create a `.env` or use Expo config:

```
API_BASE_URL=https://api.example.com
MQTT_URL=wss://mqtt.example.com:8083/mqtt
MQTT_USER=youruser
MQTT_PASSWORD=yourpass
ALERT_EMAIL=alerts@example.com
PH_MIN=8
PH_MAX=11
```

> Keep secrets out of source control. Use `app.config.ts` or `expo-env` solutions to inject at build time.

### Run (Development)

```bash
pnpm expo start
# then press i for iOS simulator, a for Android, or scan the QR with Expo Go
```

### Build (Production)

```bash
# EAS is recommended
pnpm expo prebuild
eas build -p ios
eas build -p android
```

---

## 🔌 Data Contracts

### REST (example)

- `GET /metrics/latest` → `{ ph, temperature, oxygen, light, co2, timestamp }`  
- `GET /metrics/history?range=day|week|month` → array of samples  
- `POST /control/agitation` → `{ enabled: boolean, intervalHours: number }`  
- `POST /alerts/thresholds` → `{ phMin, phMax, tempMin, tempMax, ... }`

### MQTT (example topics)

- `spirulina/metrics` → JSON payloads at fixed intervals  
- `spirulina/alerts` → threshold/predictive alerts  
- `spirulina/control` → downlink commands (e.g., agitation on/off, interval)

> Tune publish intervals and QoS to balance latency vs. battery/bandwidth.


## ✅ Quality

- **Type Safety**: strict TS, eslint, prettier  
- **Testing**: Jest + React Native Testing Library  
- **CI**: GitHub Actions (lint/test on PR, EAS build on tag)  
- **Accessibility**: meaningful labels, color-contrast, dynamic font sizes  
- **Offline-first**: cache last readings, show stale indicators

---

## 🔒 Security & Reliability

- TLS for API/MQTT, token-based auth, secure storage (e.g., `expo-secure-store`)  
- Input validation on both client and server  
- Rate limiting on control endpoints; audit logs for commands  
- Graceful retries/backoff; exponential reconnect for MQTT

---

## 🗺️ Roadmap

- [ ] Monitoring sensors 
- [ ] Multi-tank support & tagging  
- [ ] Local Alerts

---

## 📚 Background & Motivation

This app is part of a broader initiative to **optimize Spirulina cultivation** by maintaining optimal environmental conditions (pH 8–11, proper temperature, light balance) and reducing manual supervision through **automation and real-time monitoring**. The system aims to ensure stable growth, minimize losses, and promote sustainable practices in microalgae cultivation.

---

## 👥 Authors & Credits

University project contributors and collaborators.   
Acknowledgments to the IoT architecture and design guidelines referenced in the project brief.

---

## 📝 License

MIT — see [LICENSE](./LICENSE) for details.

---

## 🙌 Contributing

Issues and PRs are welcome!  
Please follow the commit style, run `pnpm lint && pnpm test` before pushing, and add tests for new features.

---

## 🧪 Demo & Screenshots

_Add GIFs/screenshots of the dashboard, trends, and controls here._  
_Optional: link to a public Expo preview or TestFlight/Play Store betas._
<img width="616" height="1352" alt="image" src="https://github.com/user-attachments/assets/95e7fe8d-a76d-4cf8-8e6d-1972c4ff9e19" />
<img width="617" height="1299" alt="image" src="https://github.com/user-attachments/assets/d9a4a846-4c0d-4f16-91d5-e39bb7857a7d" />
<img width="619" height="1334" alt="image" src="https://github.com/user-attachments/assets/097f4add-074b-4374-baba-2a0025d0592d" />
<img width="627" height="1328" alt="image" src="https://github.com/user-attachments/assets/e551797a-6f27-4cf7-bdbe-143f8356e4bd" />
