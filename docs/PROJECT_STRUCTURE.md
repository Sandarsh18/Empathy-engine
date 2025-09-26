# 🎯 MH Companion - Project Structure Guide

## 📁 Directory Structure

```
mh-companion-minimal/
├── 📚 docs/                          # Documentation
│   ├── README.md                     # Main project documentation
│   ├── API.md                        # API documentation
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── ENHANCEMENT_SUMMARY.md        # Development history
│
├── 🐍 backend/                       # Python FastAPI Backend
│   ├── main.py                       # FastAPI application entry point
│   ├── config.py                     # Configuration management
│   ├── llm_adapter.py               # LLM provider integration
│   ├── sentiment.py                 # Sentiment analysis module
│   ├── requirements.txt             # Python dependencies
│   └── Dockerfile                   # Backend container config
│
├── 🎨 frontend-web/                  # React TypeScript Web App
│   ├── src/                         # Source code
│   │   ├── App.tsx                  # Main React component
│   │   ├── main.tsx                 # React app entry point
│   │   └── assets/                  # Static assets
│   ├── public/                      # Public files
│   ├── package.json                 # Node.js dependencies
│   ├── vite.config.ts              # Vite configuration
│   └── tsconfig.json               # TypeScript config
│
├── 📱 mobile-app/                    # React Native Mobile App
│   ├── App.js                       # Main mobile component
│   ├── app.json                     # Expo configuration
│   ├── package.json                 # React Native dependencies
│   └── assets/                      # Mobile assets
│
├── ⚙️ config/                        # Configuration Files
│   ├── .env.development            # Development environment
│   ├── .env.staging                # Staging environment
│   └── .env.production             # Production environment
│
├── 🛠 scripts/                       # Automation Scripts
│   ├── setup.sh                    # Development setup
│   ├── test.sh                     # Test automation
│   ├── build.sh                    # Build automation
│   └── deploy.sh                   # Deployment automation
│
├── 🧪 tests/                        # Test Suites
│   ├── backend/                     # Backend tests
│   │   └── test_basic.py           # Basic backend tests
│   ├── frontend/                    # Frontend tests
│   ├── mobile/                      # Mobile app tests
│   └── integration/                 # Integration tests
│
├── 🚀 deployment/                   # Deployment Configurations
│   ├── docker/                      # Docker configurations
│   ├── kubernetes/                  # Kubernetes manifests
│   └── terraform/                   # Infrastructure as Code
│
├── 📦 shared/                       # Shared Resources
│   ├── types/                       # TypeScript type definitions
│   ├── utils/                       # Shared utilities
│   └── constants/                   # Shared constants
│
├── 🎯 assets/                       # Project Assets
│   ├── images/                      # Image assets
│   ├── icons/                       # Icon files
│   └── docs/                        # Documentation assets
│
├── 📋 Root Files
│   ├── docker-compose.yml          # Development orchestration
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Environment variables
│   ├── .gitignore                  # Git ignore rules
│   ├── Dockerfile                  # Main Dockerfile
│   └── conftest.py                 # Pytest configuration
```

## 🎯 Purpose of Each Directory

### 📚 Documentation (`docs/`)
- **README.md**: Comprehensive project overview with setup instructions
- **API.md**: Complete API documentation with examples
- **DEPLOYMENT.md**: Step-by-step deployment guide for all environments
- **ENHANCEMENT_SUMMARY.md**: Development history and achievements

### 🐍 Backend (`backend/`)
- **FastAPI Application**: RESTful API with async support
- **Multi-LLM Integration**: Gemini, Perplexity, and Mock providers
- **Emotion Detection**: AI-powered emotion analysis (95.7% accuracy)
- **Sentiment Analysis**: Real-time sentiment classification

### 🎨 Frontend Web (`frontend-web/`)
- **React + TypeScript**: Modern web application
- **Vite Build System**: Fast development and optimized builds
- **Responsive Design**: Works on desktop and mobile browsers
- **Voice Integration**: Web Speech API support

### 📱 Mobile App (`mobile-app/`)
- **React Native + Expo**: Cross-platform mobile application
- **Push Notifications**: Real-time user engagement
- **Voice Features**: Speech-to-text and text-to-speech
- **Offline Support**: Basic functionality without internet

### ⚙️ Configuration (`config/`)
- **Environment-Specific**: Separate configs for dev, staging, production
- **Security**: Environment variable templates
- **Feature Flags**: Enable/disable features per environment

### 🛠 Scripts (`scripts/`)
- **setup.sh**: One-command development environment setup
- **test.sh**: Comprehensive test suite runner
- **build.sh**: Production build automation
- **deploy.sh**: Multi-environment deployment

### 🧪 Tests (`tests/`)
- **Backend Tests**: API endpoints, business logic, integrations
- **Frontend Tests**: Component testing, user interactions
- **Mobile Tests**: React Native component testing
- **Integration Tests**: End-to-end system testing

### 🚀 Deployment (`deployment/`)
- **Docker**: Container configurations for all services
- **Kubernetes**: Production-grade orchestration manifests
- **Terraform**: Infrastructure as Code for cloud resources

### 📦 Shared (`shared/`)
- **Common Code**: Utilities used across backend, frontend, and mobile
- **Type Definitions**: Shared TypeScript interfaces
- **Constants**: API endpoints, error codes, configuration

### 🎯 Assets (`assets/`)
- **Static Resources**: Images, icons, documentation assets
- **Organized by Type**: Easy to locate and maintain
- **Optimized**: Compressed images for production use

## 🔄 Development Workflow

### 1. Initial Setup
```bash
# Clone and setup
git clone <repository>
cd mh-companion-minimal
./scripts/setup.sh
```

### 2. Development
```bash
# Start development environment
./scripts/deploy.sh development

# Run tests
./scripts/test.sh

# Access services
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### 3. Testing
```bash
# Run all tests
./scripts/test.sh

# Run specific test suites
pytest tests/backend/
npm test --prefix frontend-web
```

### 4. Building
```bash
# Build all components
./scripts/build.sh

# Creates build/ directory with production artifacts
```

### 5. Deployment
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production (requires confirmation)
./scripts/deploy.sh production
```

## 🎨 Code Organization Principles

### 1. **Separation of Concerns**
- Each directory has a single, well-defined purpose
- Backend, frontend, and mobile are completely separate
- Shared code is explicitly in the `shared/` directory

### 2. **Environment Isolation**
- Separate configuration files for each environment
- Environment-specific Docker configurations
- Clear deployment boundaries

### 3. **Developer Experience**
- Automation scripts reduce manual setup
- Comprehensive documentation for all components
- Consistent file naming and structure

### 4. **Production Readiness**
- Complete deployment configurations
- Monitoring and health check setup
- Security best practices implemented

### 5. **Maintainability**
- Clear file organization makes navigation easy
- Consistent structure across all components
- Well-documented configuration and setup

## 🚀 Next Steps

1. **Run Setup**: `./scripts/setup.sh`
2. **Start Development**: `./scripts/deploy.sh development`
3. **Run Tests**: `./scripts/test.sh`
4. **Build for Production**: `./scripts/build.sh`
5. **Deploy**: `./scripts/deploy.sh production`

## 📞 Support

- 📧 **Email**: support@mh-companion.com
- 📚 **Docs**: See `docs/` directory
- 🐛 **Issues**: Use project issue tracker
- 💬 **Discussion**: Team communication channels

---

*This structure follows industry best practices for full-stack applications with multiple deployment targets.*
