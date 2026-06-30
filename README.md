# PulseGuard — AI-Powered Emergency Medical Assistance Platform

A comprehensive emergency medical assistance web application that combines AI-driven triage, instant SOS activation, live location tracking, secure QR-based medical profiles, and hospital discovery.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account
- Firebase project
- GenSARA API key

### Setup

1. **Clone and install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

2. **Configure environment variables:**
- Copy `backend/.env.example` to `backend/.env` and fill in your credentials
- Update `frontend/.env.local` with your Firebase config

3. **Start the application:**
```bash
python run.py
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## 📁 Project Structure

```
PulseGuard/
├── frontend/           # Next.js PWA
│   ├── app/            # App Router pages
│   ├── components/     # Reusable components
│   ├── services/       # API service layer
│   └── styles/         # Design tokens
├── backend/            # Node.js + Express
│   └── src/
│       ├── config/     # DB & Firebase config
│       ├── middleware/  # Auth & error handling
│       ├── modules/    # Feature modules
│       └── utils/      # Encryption, email
├── run.py              # Unified launcher
└── README.md
```

## 🔑 Environment Variables

See `backend/.env.example` for all required variables.

## 📜 License

Private — All rights reserved.
