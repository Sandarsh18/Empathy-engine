#!/bin/bash

# 🚀 MH Companion - One-Command Setup Script
# This script sets up the entire MH Companion development environment

set -e  # Exit on any error

echo "🧠 MH Companion Setup Starting..."
echo "================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required. Please install Node.js which includes npm."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Setup Backend
echo ""
echo "🐍 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔧 Activating virtual environment..."
source venv/bin/activate

echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete!"

# Setup Frontend Web
cd ../frontend-web
echo ""
echo "🎨 Setting up Frontend Web App..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "📦 Node modules already exist, skipping install..."
fi

echo "✅ Frontend web setup complete!"

# Setup Mobile App
cd ../mobile-app
echo ""
echo "📱 Setting up Mobile App..."

if [ ! -d "node_modules" ]; then
    echo "📦 Installing React Native dependencies..."
    npm install
else
    echo "📦 Node modules already exist, skipping install..."
fi

echo "✅ Mobile app setup complete!"

# Setup Configuration
cd ..
echo ""
echo "⚙️ Setting up Configuration..."

if [ ! -f ".env" ]; then
    if [ -f "config/.env.example" ]; then
        echo "📄 Creating .env from template..."
        cp config/.env.example .env
        echo "PROVIDER=mock" >> .env
        echo "DEBUG=true" >> .env
    else
        echo "📄 Creating default .env file..."
        cat > .env << EOF
# MH Companion Configuration
PROVIDER=mock
DEBUG=true
LOG_LEVEL=INFO
HOST=0.0.0.0
PORT=8000
EOF
    fi
else
    echo "📄 .env file already exists, skipping creation..."
fi

echo "✅ Configuration setup complete!"

# Make scripts executable
echo ""
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Final verification
echo ""
echo "🧪 Running verification tests..."

# Test backend
cd backend
echo "🔍 Testing backend setup..."
python -c "import fastapi; print('✅ FastAPI ready')" 2>/dev/null || echo "⚠️ FastAPI verification failed"
python -c "from main import app; print('✅ Main app imports successfully')" 2>/dev/null || echo "⚠️ Main app import failed"

# Test frontend
cd ../frontend-web
echo "🔍 Testing frontend setup..."
npm list react >/dev/null 2>&1 && echo "✅ React ready" || echo "⚠️ React verification failed"

# Test mobile
cd ../mobile-app
echo "🔍 Testing mobile setup..."
npm list react-native >/dev/null 2>&1 && echo "✅ React Native ready" || echo "⚠️ React Native verification failed"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "🚀 Quick Start Commands:"
echo ""
echo "  📱 Start Backend:     cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  🎨 Start Frontend:    cd frontend-web && npm run dev"
echo "  📱 Start Mobile:      cd mobile-app && npx expo start"
echo ""
echo "🌐 URLs:"
echo "  🔧 Backend API:       http://localhost:8000"
echo "  🎨 Frontend Web:      http://localhost:5173"
echo "  📱 Mobile App:        Expo DevTools will open automatically"
echo ""
echo "📖 Documentation:      docs/README.md"
echo "🆘 Need help?          Check docs/ or open an issue on GitHub"
echo ""
echo "💚 Happy coding with MH Companion!"
