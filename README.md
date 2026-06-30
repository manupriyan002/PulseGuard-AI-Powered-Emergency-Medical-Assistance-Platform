<p align="center">
  <img src="https://img.shields.io/badge/PulseGuard-Emergency%20Medical%20Platform-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+PHBhdGggZD0iTTEyIDJMNCAxMmg4djEwbDgtMTBoLThWMnoiLz48L3N2Zz4=" alt="PulseGuard"/>
</p>

<h1 align="center">🚑 PulseGuard</h1>
<h3 align="center">AI-Powered Emergency Medical Assistance Platform</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Express.js-5-green?style=flat-square&logo=express" alt="Express"/>
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase" alt="Firebase"/>
  <img src="https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google" alt="Gemini"/>
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai" alt="OpenAI"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind"/>
</p>

<p align="center">
  A full-stack emergency medical assistance platform that combines <strong>AI-driven triage assessment</strong>, <strong>real-time SOS activation</strong>, <strong>live GPS tracking</strong>, <strong>encrypted QR-based medical profiles</strong>, and <strong>hospital discovery</strong> — designed to protect human life when every second counts.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [AI Triage Engine](#-ai-triage-engine)
- [Security & Encryption](#-security--encryption)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [License](#-license)

---

## 🧠 Overview

**PulseGuard** is a production-grade emergency medical assistance platform built to bridge the critical gap between a medical emergency and professional help arriving. It uses a multi-model AI triage engine (Google Gemini / OpenAI) powered by a comprehensive emergency medicine system prompt to assess symptoms in real-time, cross-referencing the patient's encrypted medical history, vital signs, and geolocation.

The platform is designed as a **Progressive Web App (PWA)** accessible on any device — desktop, tablet, or mobile — with offline fallback capability and one-tap SOS activation.

### Problem Statement

In medical emergencies, **panic leads to poor decisions**. Most people don't know how to assess severity, what first-aid to apply, or which hospital is closest. PulseGuard solves this by providing:

- **Instant AI-powered triage** — severity assessment in under 3 seconds
- **Context-aware analysis** — considers allergies, medications, age, and chronic conditions
- **Evidence-based first-aid** — step-by-step guidance while waiting for paramedics
- **One-tap SOS** — notifies emergency contacts with live GPS location
- **Encrypted medical profile** — responders scan a QR code for critical patient data

---

## ✨ Key Features

### 🤖 AI Triage Assessment
- Multi-turn conversational triage with context memory
- 4-level severity classification: **Critical** (🔴), **High** (🟠), **Moderate** (🟡), **Low** (🟢)
- Severity scoring (0–100) with confidence percentage
- Intelligent follow-up questions for better assessment
- Evidence-based first-aid instructions for critical emergencies
- Possible condition identification with clinical reasoning
- Hospital visit urgency recommendation (Immediate / Today / Within 24hrs / Monitor)

### 🚨 SOS Emergency System
- One-tap SOS activation with GPS coordinates
- Automatic emergency contact notification via email
- Real-time session tracking with battery level monitoring
- Emergency session history and audit trail
- Session status management (active / resolved / cancelled)

### 📍 Live Location Tracking
- Real-time GPS tracking during emergencies
- Live location sharing with emergency contacts
- Session-based tracking with persistent history

### 🏥 Hospital Finder
- Nearby hospital discovery based on GPS coordinates
- Distance and ETA calculation
- Direct navigation integration

### 🔐 Secure Medical Profile
- AES-256 encrypted storage of sensitive medical data
- Allergies, conditions, medications, and surgical history
- Blood group and emergency contact management
- QR code generation for instant medical profile sharing
- PIN-protected QR access with audit logging

### 👤 Authentication & Profiles
- Firebase Authentication (Email/Password + Google OAuth)
- JWT-based API session management
- Secure profile management with image support
- OTP verification flow

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (PWA)                         │
│              Next.js 16 + Tailwind CSS + App Router         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Dashboard │ │AI Triage │ │   SOS    │ │Hospital Finder│  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │QR Profile│ │ Medical  │ │ Tracking │ │  Contacts     │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (Axios + JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js 5)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Middleware Layer                    │    │
│  │  JWT Auth │ Rate Limiting │ CORS │ Error Handler     │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Module Layer                       │    │
│  │  Auth │ Profile │ Medical │ Triage │ SOS │ QR │ ...  │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 AI Provider Layer                    │    │
│  │         ┌──────────┐    ┌──────────┐                │    │
│  │         │  Gemini  │    │  OpenAI  │  ← AI_PROVIDER │    │
│  │         │  (default)│    │  (flag)  │    env switch  │    │
│  │         └──────────┘    └──────────┘                │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Utilities Layer                     │    │
│  │        AES-256 Encryption │ Email │ QR Generator     │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
             ▼                          ▼
    ┌────────────────┐        ┌────────────────┐
    │  MongoDB Atlas  │        │    Firebase     │
    │  (Data Store)   │        │ (Auth Provider) │
    └────────────────┘        └────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | Server-side rendering, file-based routing, PWA |
| **Styling** | Tailwind CSS 3 | Utility-first responsive design with Material Design 3 tokens |
| **State Management** | React Context API | Global auth state, user session management |
| **Backend** | Express.js 5 | RESTful API server with modular architecture |
| **Database** | MongoDB Atlas (Mongoose 9) | Document-based NoSQL storage with schema validation |
| **Authentication** | Firebase Auth + JWT | Dual-layer auth: Firebase handles identity, JWT secures API |
| **AI (Primary)** | Google Gemini 2.0 Flash | Emergency medical triage with system-prompted clinical reasoning |
| **AI (Secondary)** | OpenAI GPT-4o Mini | Alternate AI provider, switchable via environment flag |
| **Encryption** | AES-256 (CryptoJS) | Client-transparent encryption of sensitive medical data |
| **Email** | Nodemailer + Gmail SMTP | Emergency contact notifications during SOS |
| **QR System** | `qrcode` library | Medical profile QR generation with PIN-protected access |
| **Rate Limiting** | `express-rate-limit` | API abuse prevention (100 req / 15 min window) |
| **Security** | Helmet.js, bcrypt.js | HTTP header hardening, password/PIN hashing (12 salt rounds) |

---

## 🤖 AI Triage Engine

The triage engine is the core intelligence of PulseGuard, built with a **300+ line clinical system prompt** that instructs the AI to behave as a professional emergency medical triage assistant.

### How It Works

```
User Symptoms → Rule-Based Safety Net → Patient Context Assembly → AI Assessment → Structured JSON Response
```

1. **Rule-Based Safety Net** — Critical keywords (chest pain, seizure, unconscious, etc.) trigger an **instant CRITICAL response** before the AI is even called, ensuring zero delay for life-threatening situations.

2. **Patient Context Assembly** — The system automatically fetches and decrypts the user's medical profile (allergies, medications, conditions, surgeries, blood group) and assembles it with demographics, vital signs, and GPS location into a structured message.

3. **AI Assessment** — The assembled context is sent to the configured AI provider (Gemini or OpenAI) with the full system prompt. The AI returns a structured JSON response.

4. **Structured Output** — Every response follows a strict JSON schema:

```json
{
  "severity": { "level": "CRITICAL", "color": "RED", "score": 95, "confidence": 90 },
  "summary": "...",
  "possible_conditions": ["..."],
  "reasoning": "...",
  "immediate_actions": ["..."],
  "first_aid": ["..."],
  "recommendations": {
    "activate_sos": true,
    "notify_contacts": true,
    "call_emergency_services": true,
    "hospital_visit": "IMMEDIATE",
    "show_hospital_finder": true,
    "show_qr_profile": true,
    "start_live_tracking": true
  },
  "follow_up_question": "",
  "disclaimer": "..."
}
```

### Provider Switching

The AI provider is controlled by a single environment variable — **no code changes required**:

```env
# Switch between providers
AI_PROVIDER=gemini    # Google Gemini (default)
AI_PROVIDER=openai    # OpenAI GPT
```

| Provider | Model | Best For |
|----------|-------|----------|
| Google Gemini | `gemini-2.0-flash` | Fast responses, lower cost, default choice |
| OpenAI | `gpt-4o-mini` | Higher reasoning capability, alternative option |

---

## 🔐 Security & Encryption

PulseGuard implements **defense-in-depth** security:

| Layer | Implementation |
|-------|---------------|
| **Authentication** | Firebase Auth (Google OAuth + Email/Password) → JWT tokens (7-day expiry) |
| **API Security** | JWT verification middleware on all protected routes |
| **Data Encryption** | AES-256 encryption for allergies, conditions, medications, surgeries |
| **Password Security** | bcrypt hashing with 12 salt rounds for PINs |
| **Rate Limiting** | 100 requests per 15-minute window per IP |
| **HTTP Hardening** | Helmet.js security headers |
| **CORS** | Whitelist-based origin validation |
| **QR Access Control** | PIN-protected medical profile access with audit logging |

### Encryption Flow

```
User Data → JSON.stringify() → AES-256 Encrypt (CryptoJS) → MongoDB
MongoDB → AES-256 Decrypt → JSON.parse() → API Response
```

Sensitive fields are encrypted **at rest** in MongoDB and decrypted **only** when accessed through authenticated API calls.

---

## 📁 Project Structure

```
PulseGuard/
├── frontend/                          # Next.js 16 PWA
│   ├── app/                           # App Router pages
│   │   ├── ai-triage/                 # AI triage chat interface
│   │   ├── dashboard/                 # Main dashboard
│   │   ├── emergency-contacts/        # Contact management
│   │   ├── emergency-history/         # Past emergency sessions
│   │   ├── hospital-finder/           # GPS-based hospital search
│   │   ├── login/                     # Firebase authentication
│   │   ├── register/                  # User registration
│   │   ├── medical-profile/           # Encrypted health records
│   │   ├── qr-profile/               # QR medical ID
│   │   ├── settings/                  # App settings
│   │   ├── sos/                       # One-tap SOS activation
│   │   └── tracking/                  # Live location tracking
│   ├── components/                    # Reusable UI components
│   ├── context/                       # React Context (AuthProvider)
│   ├── hooks/                         # Custom hooks (useProtectedRoute)
│   ├── services/                      # API client & Firebase config
│   └── public/                        # Static assets, PWA manifest
│
├── backend/                           # Express.js 5 API Server
│   ├── src/
│   │   ├── config/                    # Database & Firebase admin config
│   │   ├── middleware/                # JWT auth, error handler
│   │   ├── modules/
│   │   │   ├── auth/                  # Registration, login, JWT
│   │   │   ├── profile/              # User profile CRUD
│   │   │   ├── medical/              # Encrypted medical records
│   │   │   ├── triage/               # AI triage engine
│   │   │   │   ├── ai-provider.js    # Multi-provider abstraction (Gemini/OpenAI)
│   │   │   │   ├── triage.prompt.js  # 300+ line clinical system prompt
│   │   │   │   └── triage.routes.js  # Triage API routes
│   │   │   ├── sos/                  # SOS session management
│   │   │   ├── tracking/            # GPS tracking sessions
│   │   │   ├── emergency/           # Emergency contacts
│   │   │   ├── hospital/            # Hospital finder API
│   │   │   └── qr/                  # QR code generation & verification
│   │   └── utils/                    # AES encryption, email service
│   └── .env.example                  # Environment variable template
│
├── run.js                            # Node.js unified launcher
├── run.py                            # Python unified launcher
├── package.json                      # Root scripts (npm run dev)
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB Atlas | Free tier (M0) or above |
| Firebase Project | Authentication enabled |
| AI API Key | Google Gemini or OpenAI |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/pulseguard.git
cd pulseguard

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Return to root
cd ..
```

### Configuration

```bash
# Copy the environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

```env
# MongoDB connection string
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/pulseguard

# JWT secret (generate: openssl rand -hex 32)
JWT_SECRET=your_jwt_secret_here

# Firebase Admin SDK credentials
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key

# AI Provider ("gemini" or "openai")
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
```

Create `frontend/.env.local` with your Firebase client config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Run

```bash
# Start both frontend and backend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/health |

---

## 📡 API Documentation

### Base URL: `http://localhost:5000/api`

All protected routes require `Authorization: Bearer <JWT_TOKEN>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register new user |
| `POST` | `/auth/login` | ❌ | Login with Firebase UID |
| `GET` | `/auth/me` | ✅ | Get authenticated user |
| `GET` | `/profile` | ✅ | Get user profile |
| `PUT` | `/profile` | ✅ | Update user profile |
| `GET` | `/medical` | ✅ | Get decrypted medical profile |
| `PUT` | `/medical` | ✅ | Update medical profile (encrypted) |
| `POST` | `/triage/assess` | ✅ | **AI triage assessment** |
| `POST` | `/sos/activate` | ✅ | Activate emergency SOS |
| `POST` | `/sos/deactivate` | ✅ | Deactivate SOS session |
| `GET` | `/sos/history` | ✅ | Get SOS session history |
| `GET` | `/contacts` | ✅ | List emergency contacts |
| `POST` | `/contacts` | ✅ | Add emergency contact |
| `PUT` | `/contacts/:id` | ✅ | Update emergency contact |
| `DELETE` | `/contacts/:id` | ✅ | Remove emergency contact |
| `POST` | `/tracking/update` | ✅ | Update GPS location |
| `GET` | `/tracking/session/:id` | ✅ | Get tracking session |
| `POST` | `/qr/generate` | ✅ | Generate medical QR code |
| `GET` | `/qr/:userId` | ❌ | View QR medical profile |
| `POST` | `/qr/:userId/verify` | ❌ | Verify QR PIN for access |
| `GET` | `/hospitals/nearby` | ✅ | Find hospitals by GPS |

### Triage Request Example

```bash
curl -X POST http://localhost:5000/api/triage/assess \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "symptoms": "severe chest pain and difficulty breathing",
    "duration": "30 minutes",
    "painScore": 8,
    "vitalSigns": {
      "heartRate": "120 bpm",
      "bloodPressure": "160/95"
    }
  }'
```

---

## ⚙ Environment Configuration

See [`backend/.env.example`](backend/.env.example) for the complete template.

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `JWT_EXPIRY` | ❌ | Token expiry duration (default: `7d`) |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project identifier |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase admin private key |
| `AI_PROVIDER` | ✅ | `gemini` or `openai` |
| `GEMINI_API_KEY` | ✅* | Google Gemini API key |
| `GEMINI_MODEL` | ❌ | Model name (default: `gemini-2.0-flash`) |
| `OPENAI_API_KEY` | ✅* | OpenAI API key |
| `OPENAI_MODEL` | ❌ | Model name (default: `gpt-4o-mini`) |
| `AES_ENCRYPTION_KEY` | ✅ | 32-char key for medical data encryption |
| `SMTP_HOST` | ✅ | Email SMTP server |
| `SMTP_USER` | ✅ | SMTP username |
| `SMTP_PASS` | ✅ | SMTP password / app password |

*Required based on `AI_PROVIDER` selection.

---

## 👥 Authors

- **Chinmay Giri** — Full-Stack Development & System Design

---

## 📜 License

This project is proprietary. All rights reserved.
