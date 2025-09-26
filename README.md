# 💝 Empathy Engine - AI-Powered Mental Health Platform 🧠

<div align="center">

[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)]()
[![Backend](https://img.shields.io/badge/Backend-FastAPI_Python-green?style=for-the-badge&logo=fastapi)]()
[![Frontend](https://img.shields.io/badge/Frontend-React_TypeScript-blue?style=for-the-badge&logo=react)]()
[![Mobile](https://img.shields.io/badge/Mobile-React_Native-purple?style=for-the-badge&logo=react)]()
[![AI](https://img.shields.io/badge/AI-Multi_Provider_LLM-orange?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()
[![GitHub Stars](https://img.shields.io/github/stars/Sandarsh18/Empathy-engine?style=for-the-badge)]()
[![GitHub Forks](https://img.shields.io/github/forks/Sandarsh18/Empathy-engine?style=for-the-badge)]()

**💝 Empathetic AI platform providing mental health support through emotion-aware conversations and advanced therapeutic intelligence**

[🚀 Quick Start](#-quick-start) • [📖 Documentation](docs/) • [🏗️ Architecture](#-architecture) • [🤝 Contributing](#-contributing)

</div>

---

## 🚀 Quick Start

### 📋 Prerequisites
- 🐍 **Python 3.8+** ([Download](https://python.org/downloads/))
- 📦 **Node.js 18+** ([Download](https://nodejs.org/))
- 🔧 **Git** ([Download](https://git-scm.com/))

### ⚡ One-Command Setup
```bash
# Clone and setup everything
git clone https://github.com/Sandarsh18/Empathy-engine.git
cd Empathy-engine
./scripts/setup.sh
```

### 🔧 Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

#### 2. Frontend Web Setup  
```bash
cd frontend-web
npm install
npm run dev
```

#### 3. Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```

## 🏗️ Architecture

### 📁 Project Structure
```
mh-companion-minimal/
├── 📖 docs/                    # Documentation & guides
│   ├── README.md               # Main documentation  
│   ├── ENHANCEMENT_SUMMARY.md  # Development history
│   ├── API.md                  # API documentation
│   └── DEPLOYMENT.md           # Deployment guide
│
├── 🐍 backend/                 # FastAPI Python backend
│   ├── main.py                 # FastAPI application
│   ├── sentiment.py            # Emotion detection engine
│   ├── llm_adapter.py          # Multi-provider AI integration
│   ├── config.py               # Configuration management
│   ├── requirements.txt        # Python dependencies
│   └── Dockerfile              # Backend container
│
├── 🎨 frontend-web/            # React TypeScript web app
│   ├── src/                    # Source code
│   ├── public/                 # Static assets
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Build configuration
│
├── 📱 mobile-app/              # React Native mobile app
│   ├── src/                    # Source code
│   ├── assets/                 # Mobile assets
│   ├── package.json            # Dependencies
│   └── app.json                # Expo configuration
│
├── 🧪 tests/                   # Test suites
│   ├── backend/                # Backend tests
│   ├── frontend/               # Frontend tests
│   ├── mobile/                 # Mobile tests
│   └── integration/            # E2E tests
│
├── ⚙️ config/                  # Configuration files
│   ├── .env.example            # Environment template
│   ├── .env.local              # Local development config
│   ├── production.env          # Production config template
│   └── testing.env             # Testing environment
│
├── 🚀 deployment/              # Deployment configurations
│   ├── docker/                 # Docker configurations
│   ├── kubernetes/             # K8s manifests
│   └── scripts/                # Deployment scripts
│
├── 📦 shared/                  # Shared code & types
│   ├── types/                  # TypeScript interfaces
│   ├── utils/                  # Common utilities
│   └── constants/              # Shared constants
│
├── 🎯 scripts/                 # Development scripts
│   ├── setup.sh                # One-command setup
│   ├── build.sh                # Build all projects
│   ├── test.sh                 # Run all tests
│   └── deploy.sh               # Deployment script
│
└── 🎨 assets/                  # Project assets
    ├── images/                 # Images & icons
    ├── docs/                   # Documentation assets
    └── tests/                  # Test assets
```

## ✨ Features

### 🤖 AI & Backend
- 🧠 **Multi-Provider LLM**: Gemini 2.0 Flash, Perplexity, Mock providers
- 🎭 **Emotion Detection**: 6 emotions with confidence scoring
- 📊 **Sentiment Analysis**: Real-time emotion classification
- ⚡ **FastAPI Backend**: High-performance async API

### 🎨 Web Frontend  
- ⚛️ **React TypeScript**: Modern, type-safe frontend
- 🌓 **Theme System**: Dark/light mode with emotion-aware colors
- 🎙️ **Voice Integration**: Speech-to-text and text-to-speech
- 📱 **Responsive Design**: Works on all devices

### 📱 Mobile App
- 📱 **React Native**: Cross-platform iOS and Android
- 🎨 **Material Design 3**: Beautiful, consistent UI
- 📢 **Push Notifications**: Smart mental health reminders
- 🔊 **Voice Features**: Complete voice interaction

## 🧪 Testing & Quality

```bash
# Run all tests
./scripts/test.sh

# Individual test suites
cd tests/backend && pytest
cd tests/frontend && npm test
cd tests/mobile && npm test
```

## 🚀 Deployment

### 🐳 Docker (Recommended)
```bash
# Build and run all services
docker-compose up --build

# Production deployment
./scripts/deploy.sh production
```

### ☁️ Cloud Platforms
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, DigitalOcean
- **Mobile**: Expo Application Services (EAS)

## 🤝 Contributing

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **🔧 Make** your changes and add tests
4. **✅ Test** your changes: `./scripts/test.sh`
5. **📝 Commit**: `git commit -m 'Add amazing feature'`
6. **🚀 Push**: `git push origin feature/amazing-feature`
7. **🎯 Submit** a Pull Request

## 📖 Documentation

- 📚 **[Full Documentation](docs/README.md)** - Comprehensive guides
- 🔧 **[API Documentation](docs/API.md)** - Backend API reference
- 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- 📱 **[Mobile Development](docs/MOBILE.md)** - React Native setup
- 🎨 **[Frontend Guide](docs/FRONTEND.md)** - React development

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**💚 Made with love for Mental Health Support 💚**

[⭐ Star on GitHub](https://github.com/Sandarsh18/Empathy-engine) • [🐛 Report Issues](https://github.com/Sandarsh18/Empathy-engine/issues) • [💬 Discussions](https://github.com/Sandarsh18/Empathy-engine/discussions)

</div>
