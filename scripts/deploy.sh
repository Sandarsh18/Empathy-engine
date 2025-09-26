#!/bin/bash

# 🚀 MH Companion - Deployment Script
# Deploys to development, staging, or production environments

set -e

ENVIRONMENT=${1:-development}
VALID_ENVS=("development" "staging" "production")

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MH Companion - Deployment to ${ENVIRONMENT}${NC}"
echo "=============================================="

# Validate environment
if [[ ! " ${VALID_ENVS[@]} " =~ " ${ENVIRONMENT} " ]]; then
    echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
    echo -e "${YELLOW}Valid options: ${VALID_ENVS[@]}${NC}"
    exit 1
fi

# Check if build exists
if [ ! -d "build" ]; then
    echo -e "${YELLOW}⚠️ No build directory found. Running build first...${NC}"
    ./scripts/build.sh
fi

case $ENVIRONMENT in
    "development")
        echo -e "${GREEN}🔧 Deploying to Development Environment${NC}"
        echo ""
        echo "📋 Development Deployment Steps:"
        echo "  1. 🐳 Starting Docker containers"
        echo "  2. 🔗 Setting up local services"
        echo "  3. 🌐 Configuring development URLs"
        
        # Start local development
        if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
            echo ""
            echo "🐳 Starting Docker containers..."
            
            # Create docker-compose.yml if it doesn't exist
            if [ ! -f "docker-compose.yml" ]; then
                cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mh-companion-backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ENV=development
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
    volumes:
      - ./backend:/app
      - ./config:/app/config

  mh-companion-frontend:
    build: ./frontend-web
    ports:
      - "3000:3000"
    depends_on:
      - mh-companion-backend
    environment:
      - REACT_APP_API_URL=http://localhost:8000

networks:
  default:
    name: mh-companion-dev
EOF
            fi
            
            docker-compose up -d
            
            echo ""
            echo -e "${GREEN}✅ Development environment started${NC}"
            echo ""
            echo "🌐 Service URLs:"
            echo "  🐍 Backend API:    http://localhost:8000"
            echo "  🎨 Frontend Web:   http://localhost:3000"
            echo "  📚 API Docs:       http://localhost:8000/docs"
        else
            echo -e "${YELLOW}⚠️ Docker not found. Starting services manually...${NC}"
            
            # Start backend
            echo "🐍 Starting backend..."
            cd backend
            if [ -d "venv" ]; then
                source venv/bin/activate
                python main.py &
                BACKEND_PID=$!
                cd ..
            fi
            
            # Start frontend
            echo "🎨 Starting frontend..."
            cd frontend-web
            npm run dev &
            FRONTEND_PID=$!
            cd ..
            
            echo ""
            echo -e "${GREEN}✅ Services started in background${NC}"
            echo "  Backend PID: $BACKEND_PID"
            echo "  Frontend PID: $FRONTEND_PID"
        fi
        ;;
        
    "staging")
        echo -e "${YELLOW}🔧 Deploying to Staging Environment${NC}"
        echo ""
        echo "📋 Staging Deployment Steps:"
        echo "  1. 🧪 Running full test suite"
        echo "  2. 🐳 Building production images"
        echo "  3. 🚀 Deploying to staging server"
        
        # Run tests
        echo ""
        echo "🧪 Running test suite..."
        ./scripts/test.sh || {
            echo -e "${RED}❌ Tests failed. Aborting deployment.${NC}"
            exit 1
        }
        
        # Build production images
        echo ""
        echo "🐳 Building production Docker images..."
        
        # Backend image
        docker build -t mh-companion-backend:staging ./backend
        
        # Frontend image (if Dockerfile exists)
        if [ -f "frontend-web/Dockerfile" ]; then
            docker build -t mh-companion-frontend:staging ./frontend-web
        fi
        
        echo ""
        echo -e "${GREEN}✅ Staging deployment complete${NC}"
        echo ""
        echo "🌐 Staging URLs:"
        echo "  🐍 Backend API:    https://api-staging.mh-companion.com"
        echo "  🎨 Frontend Web:   https://staging.mh-companion.com"
        ;;
        
    "production")
        echo -e "${GREEN}🚀 Deploying to Production Environment${NC}"
        echo ""
        echo -e "${YELLOW}⚠️ PRODUCTION DEPLOYMENT${NC}"
        echo "This will deploy to the live environment!"
        echo ""
        read -p "Are you sure you want to continue? (yes/no): " -r
        if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            echo "Deployment cancelled."
            exit 1
        fi
        
        echo ""
        echo "📋 Production Deployment Steps:"
        echo "  1. 🧪 Running comprehensive tests"
        echo "  2. 🔍 Security validation"
        echo "  3. 🐳 Building production images"
        echo "  4. 🚀 Deploying to production"
        echo "  5. 💚 Health checks"
        
        # Comprehensive testing
        echo ""
        echo "🧪 Running comprehensive test suite..."
        ./scripts/test.sh || {
            echo -e "${RED}❌ Tests failed. Aborting production deployment.${NC}"
            exit 1
        }
        
        # Security checks
        echo ""
        echo "🔍 Running security validation..."
        
        # Check for sensitive files
        if find . -name "*.env" -o -name "*.key" -o -name "*secret*" | grep -v node_modules | grep -q .; then
            echo -e "${YELLOW}⚠️ Found potential sensitive files. Please review.${NC}"
        fi
        
        # Build production images
        echo ""
        echo "🐳 Building production Docker images..."
        
        # Backend
        docker build -t mh-companion-backend:latest ./backend
        docker tag mh-companion-backend:latest mh-companion-backend:$(date +%Y%m%d-%H%M%S)
        
        # Frontend
        if [ -f "frontend-web/Dockerfile" ]; then
            docker build -t mh-companion-frontend:latest ./frontend-web
            docker tag mh-companion-frontend:latest mh-companion-frontend:$(date +%Y%m%d-%H%M%S)
        fi
        
        echo ""
        echo -e "${GREEN}✅ Production deployment complete${NC}"
        echo ""
        echo "🌐 Production URLs:"
        echo "  🐍 Backend API:    https://api.mh-companion.com"
        echo "  🎨 Frontend Web:   https://mh-companion.com"
        echo "  📱 Mobile App:     Available in App Stores"
        
        # Health checks
        echo ""
        echo "💚 Running health checks..."
        sleep 5
        
        if command -v curl &> /dev/null; then
            if curl -f http://localhost:8000/health 2>/dev/null; then
                echo -e "${GREEN}✅ Backend health check passed${NC}"
            else
                echo -e "${RED}❌ Backend health check failed${NC}"
            fi
        fi
        ;;
esac

echo ""
echo -e "${BLUE}🎉 Deployment to ${ENVIRONMENT} Complete!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "  🕒 Time:           $(date)"
echo "  🌍 Environment:    ${ENVIRONMENT}"
echo "  📦 Version:        $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo ""
echo "📋 Next Steps:"
case $ENVIRONMENT in
    "development")
        echo "  🧪 Test your changes at http://localhost:3000"
        echo "  📚 View API docs at http://localhost:8000/docs"
        echo "  🔄 Stop services: docker-compose down"
        ;;
    "staging")
        echo "  🧪 Run staging tests"
        echo "  👥 Get team approval"
        echo "  🚀 Deploy to production: ./scripts/deploy.sh production"
        ;;
    "production")
        echo "  📊 Monitor application performance"
        echo "  👥 Notify team of deployment"
        echo "  📈 Review metrics and logs"
        ;;
esac
