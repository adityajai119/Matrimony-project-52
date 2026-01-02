# 🐉 LimitBreaker - AI-Powered Fitness App

<div align="center">

![LimitBreaker Logo](https://img.shields.io/badge/LimitBreaker-💪_Dragon_Ball_Themed-FF6B35?style=for-the-badge&logo=firebase&logoColor=white)

**Break your limits. Unleash your power.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-limitbreaker.pages.dev-00B4D8?style=for-the-badge)](https://limitbreaker.pages.dev)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular)](https://angular.io/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-Railway-4479A1?style=flat-square&logo=mysql)](https://railway.app/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI_Powered-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)

</div>

---

## ✨ Features

### 🏋️ AI-Powered Workouts
- **Smart Workout Generation** - Gemini AI creates personalized workout plans based on your goals
- **Exercise Tracking** - Check off completed exercises with XP rewards
- **AI Regenerate** - Get fresh workouts anytime with one click

### 🍱 Intelligent Meal Planning  
- **AI Meal Plans** - Personalized nutrition based on your fitness goals
- **Smart Swap** - Don't like a meal? AI suggests healthier alternatives instantly
- **Grocery List Export** - Download your shopping list for the week

### 🎮 Dragon Ball Z Gamification
- **Power Levels** - Earn XP and level up like a Saiyan warrior
- **Daily Challenges** - Complete challenges for bonus XP
- **Achievement Badges** - Unlock badges as you progress
- **Streak Tracking** - Maintain your training consistency

### 🎵 Workout Music Player
- **AI Playlist Generation** - Get curated workout playlists by mood
- **Voice Commands** - Control music hands-free ("Play Telugu songs", "Next track")
- **YouTube Integration** - Stream workout music directly

### 📧 Progress Sharing
- **Email Progress Reports** - Send your stats to Gmail
- **Activity Heatmap** - GitHub-style contribution graph

### 🔐 Authentication
- **Google Sign-In** - Quick registration via Firebase
- **Email + OTP** - Secure email verification via Brevo

---

## 🚀 Live Demo

**👉 [https://limitbreaker.pages.dev](https://limitbreaker.pages.dev)**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 18, Angular Material, Three.js (3D effects) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | MySQL (Railway) |
| **AI** | Google Gemini 2.0 Flash |
| **Auth** | Firebase Admin SDK, JWT |
| **Email** | Brevo (SendinBlue) API |
| **Hosting** | Cloudflare Pages (Frontend), Render (Backend) |

---

## 📦 Project Structure

```
project/
├── Frontend/                 # Angular 18 application
│   ├── src/app/
│   │   ├── components/       # UI components
│   │   ├── services/         # API & state services
│   │   └── guards/           # Auth guards
│   └── src/environments/     # Environment configs
│
├── Backend/                  # Express.js API
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic (AI, Email)
│   │   ├── config/           # Database, Firebase config
│   │   └── middleware/       # Auth, rate limiting
│   └── .env                  # Environment variables
│
└── Testing/                  # Test scripts
```

---

## 🏃 Running Locally

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file with:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=smart_fitness
# GEMINI_API_KEY=your_gemini_key
# JWT_SECRET=your_secret

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
ng serve
```

Open **http://localhost:4200** in your browser.

---

## 🌐 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Set environment variables:
   - `MYSQL_URL` - Railway connection string
   - `FIREBASE_SERVICE_ACCOUNT` - JSON string
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `BREVO_API_KEY`
   - `NODE_ENV=production`

### Frontend (Cloudflare Pages)
```bash
cd Frontend
npm run build
npx wrangler pages deploy dist/frontend --project-name=limitbreaker
```

---

## 📱 Screenshots

| Dashboard | Workouts | Meals |
|-----------|----------|-------|
| Power level tracking | AI-generated exercises | Smart meal planning |
| Daily challenges | Voice-controlled music | Grocery list export |
| Achievement badges | Progress tracking | AI swap alternatives |

---

## 🎯 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google-login` | Google OAuth login |
| POST | `/api/auth/send-otp` | Send OTP for registration |
| GET | `/api/workouts` | Get weekly workout plan |
| POST | `/api/ai/generate-workout` | AI generates new workout |
| POST | `/api/ai/generate-meal` | AI generates meal plan |
| POST | `/api/ai/swap-meal` | AI suggests meal alternative |
| GET | `/api/gamification/stats` | Get power level & XP |
| POST | `/api/gamification/add-xp` | Add XP points |

---

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_fitness

# Production Database (Railway)
MYSQL_URL=mysql://user:pass@host:port/db

# Firebase
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# AI
GEMINI_API_KEY=AIza...

# Auth
JWT_SECRET=your-secret-key

# Email (Brevo)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=your@email.com

# Environment
NODE_ENV=production
```

---

## 👨‍💻 Author

**Aditya Tummala**

---

## 📄 License

This project is for educational purposes.

---

<div align="center">

**💪 Break Your Limits. Become Legendary. 🐉**

[![Deploy Status](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)](https://limitbreaker.pages.dev)

</div>
