# 🚀 MH Companion - Deployment Guide

## 📋 Table of Contents
- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Deployment Options](#-deployment-options)
- [Configuration](#-configuration)
- [Monitoring & Maintenance](#-monitoring--maintenance)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

This guide covers deploying MH Companion across different environments: development, staging, and production.

### Architecture Overview

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        subgraph "Backend Services"
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server 3]
        end
        subgraph "Frontend"
            WEB[Web Application]
            MOBILE[Mobile App]
        end
        subgraph "External Services"
            GEMINI[Gemini API]
            PERPLEXITY[Perplexity API]
        end
        subgraph "Monitoring"
            PROMETHEUS[Prometheus]
            GRAFANA[Grafana]
            ALERTS[AlertManager]
        end
    end
    
    LB --> API1
    LB --> API2
    LB --> API3
    WEB --> LB
    MOBILE --> LB
    API1 --> GEMINI
    API1 --> PERPLEXITY
    API2 --> GEMINI
    API2 --> PERPLEXITY
    API3 --> GEMINI
    API3 --> PERPLEXITY
    
    PROMETHEUS --> API1
    PROMETHEUS --> API2
    PROMETHEUS --> API3
    GRAFANA --> PROMETHEUS
    ALERTS --> PROMETHEUS
```

## 🔧 Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 20 GB | 50+ GB SSD |
| **Network** | 100 Mbps | 1 Gbps |

### Software Dependencies

- **Docker** 24.0+ & Docker Compose 2.0+
- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Git** (for source control)
- **SSL Certificate** (for production)

### API Keys Required

```bash
# Required for production
GEMINI_API_KEY=your_gemini_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here

# Optional but recommended
SENTRY_DSN=your_sentry_dsn_here
OPENTELEMETRY_ENDPOINT=your_observability_endpoint
```

## 🌍 Environment Setup

### Development Environment

```bash
# Quick setup
git clone https://github.com/your-org/mh-companion.git
cd mh-companion
./scripts/setup.sh

# Manual setup
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

cd frontend-web
npm install
cd ..

# Start services
./scripts/deploy.sh development
```

### Staging Environment

```bash
# Deploy to staging
./scripts/build.sh
./scripts/deploy.sh staging

# Or using Docker
docker-compose -f docker-compose.staging.yml up -d
```

### Production Environment

```bash
# Build production artifacts
./scripts/build.sh

# Deploy to production (requires confirmation)
./scripts/deploy.sh production
```

## 🐳 Deployment Options

### Option 1: Docker Compose (Recommended for Single Server)

**docker-compose.prod.yml**
```yaml
version: '3.8'
services:
  mh-companion-backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    environment:
      - ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - PERPLEXITY_API_KEY=${PERPLEXITY_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mh-companion-frontend:
    build:
      context: ./frontend-web
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - mh-companion-backend
    restart: unless-stopped
    volumes:
      - ./ssl:/etc/nginx/ssl:ro

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards
    restart: unless-stopped

volumes:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: mh-companion-prod
```

**Deploy:**
```bash
# Set environment variables
export GEMINI_API_KEY="your_key_here"
export PERPLEXITY_API_KEY="your_key_here"
export GRAFANA_PASSWORD="secure_password"

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Kubernetes (Recommended for Scale)

**k8s/namespace.yaml**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mh-companion
  labels:
    name: mh-companion
```

**k8s/backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mh-companion-backend
  namespace: mh-companion
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mh-companion-backend
  template:
    metadata:
      labels:
        app: mh-companion-backend
    spec:
      containers:
      - name: backend
        image: mh-companion/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: ENV
          value: "production"
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: gemini-api-key
        - name: PERPLEXITY_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-keys
              key: perplexity-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

**Deploy to Kubernetes:**
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create secrets
kubectl create secret generic api-keys \
  --from-literal=gemini-api-key="$GEMINI_API_KEY" \
  --from-literal=perplexity-api-key="$PERPLEXITY_API_KEY" \
  -n mh-companion

# Deploy applications
kubectl apply -f k8s/
```

### Option 3: Cloud Platform Deployment

#### AWS (using ECS)
```bash
# Build and push to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
docker build -t mh-companion/backend ./backend
docker tag mh-companion/backend:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/mh-companion/backend:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/mh-companion/backend:latest

# Deploy using ECS CLI or CloudFormation
aws ecs create-service --cluster mh-companion --service-name backend --task-definition mh-companion-backend:1 --desired-count 2
```

#### Google Cloud Platform (using Cloud Run)
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/mh-companion-backend ./backend
gcloud run deploy mh-companion-backend \
  --image gcr.io/your-project/mh-companion-backend \
  --platform managed \
  --region us-central1 \
  --set-env-vars="GEMINI_API_KEY=$GEMINI_API_KEY,PERPLEXITY_API_KEY=$PERPLEXITY_API_KEY"
```

#### Azure (using Container Instances)
```bash
# Deploy to Azure Container Instances
az container create \
  --resource-group mh-companion-rg \
  --name mh-companion-backend \
  --image mhcompanion/backend:latest \
  --environment-variables GEMINI_API_KEY="$GEMINI_API_KEY" PERPLEXITY_API_KEY="$PERPLEXITY_API_KEY" \
  --ports 8000 \
  --cpu 2 \
  --memory 4
```

## ⚙️ Configuration

### Environment Variables

**Backend Configuration (.env.prod)**
```bash
# Application
ENV=production
DEBUG=false
HOST=0.0.0.0
PORT=8000

# API Keys
GEMINI_API_KEY=your_gemini_key_here
PERPLEXITY_API_KEY=your_perplexity_key_here

# Security
SECRET_KEY=your_very_secure_secret_key_here
CORS_ORIGINS=https://mh-companion.com,https://www.mh-companion.com

# Database (if using)
DATABASE_URL=postgresql://username:password@localhost/mh_companion

# Redis (for caching/sessions)
REDIS_URL=redis://redis:6379

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
OPENTELEMETRY_ENDPOINT=http://otel-collector:4317

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_BURST=20

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

**Frontend Configuration (.env.production)**
```bash
# API Configuration
REACT_APP_API_URL=https://api.mh-companion.com
REACT_APP_WS_URL=wss://api.mh-companion.com/ws

# Features
REACT_APP_ENABLE_VOICE=true
REACT_APP_ENABLE_ANALYTICS=true

# Monitoring
REACT_APP_SENTRY_DSN=https://your-frontend-sentry-dsn@sentry.io/project

# Third-party Services
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### SSL/TLS Configuration

**nginx.conf (for frontend)**
```nginx
server {
    listen 80;
    server_name mh-companion.com www.mh-companion.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mh-companion.com www.mh-companion.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API proxy
    location /api/ {
        proxy_pass http://mh-companion-backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Monitoring & Maintenance

### Health Checks

**Backend Health Check**
```python
# In your FastAPI app
from fastapi import FastAPI
from starlette.responses import JSONResponse

@app.get("/health")
async def health_check():
    try:
        # Check database connection
        # Check external APIs
        # Check Redis connection
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0.0",
            "services": {
                "llm": "operational",
                "sentiment": "operational",
                "emotion_detection": "operational"
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )
```

### Prometheus Metrics

**prometheus.yml**
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'mh-companion-backend'
    static_configs:
      - targets: ['mh-companion-backend:8000']
    metrics_path: /metrics
    scrape_interval: 10s

  - job_name: 'nginx'
    static_configs:
      - targets: ['mh-companion-frontend:9113']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "id": null,
    "title": "MH Companion - System Overview",
    "panels": [
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Emotion Detection Accuracy",
        "type": "stat",
        "targets": [
          {
            "expr": "emotion_detection_accuracy",
            "legendFormat": "Accuracy %"
          }
        ]
      }
    ]
  }
}
```

### Log Management

**Fluentd Configuration**
```yaml
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<match mh-companion.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  index_name mh-companion
  type_name logs
  logstash_format true
  logstash_prefix mh-companion
  include_tag_key true
  tag_key @log_name
</match>
```

### Backup & Recovery

**Database Backup Script**
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Database backup (if using PostgreSQL)
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Configuration backup
tar -czf "$BACKUP_DIR/config_backup_$TIMESTAMP.tar.gz" config/

# Upload to S3 (optional)
aws s3 cp "$BACKUP_DIR/" s3://mh-companion-backups/ --recursive

echo "Backup completed: $TIMESTAMP"
```

**Automated Backup Cron**
```bash
# Add to crontab
0 2 * * * /scripts/backup.sh >> /var/log/backup.log 2>&1
```

## 🚨 Troubleshooting

### Common Issues

#### 1. API Key Errors
```bash
# Check if API keys are set
echo $GEMINI_API_KEY
echo $PERPLEXITY_API_KEY

# Test API connectivity
curl -H "Authorization: Bearer $GEMINI_API_KEY" \
  https://generativelanguage.googleapis.com/v1beta/models
```

#### 2. High Memory Usage
```bash
# Check memory usage
docker stats

# Scale down if necessary
docker-compose -f docker-compose.prod.yml scale mh-companion-backend=2
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
certbot renew --nginx
```

#### 4. Database Connection Issues
```bash
# Check database connectivity
docker-compose exec mh-companion-backend python -c "
import psycopg2
try:
    conn = psycopg2.connect('$DATABASE_URL')
    print('Database connection successful')
    conn.close()
except Exception as e:
    print(f'Database connection failed: {e}')
"
```

### Performance Tuning

#### Backend Optimization
```python
# In main.py
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        workers=4,  # Adjust based on CPU cores
        loop="uvloop",  # For better performance
        http="httptools"
    )
```

#### Frontend Optimization
```javascript
// In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@mui/material', '@mui/icons-material']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Scaling Strategies

#### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml scale mh-companion-backend=5

# Or with Kubernetes
kubectl scale deployment mh-companion-backend --replicas=5 -n mh-companion
```

#### Load Balancing
```nginx
upstream backend {
    server mh-companion-backend-1:8000;
    server mh-companion-backend-2:8000;
    server mh-companion-backend-3:8000;
    
    # Health checks
    keepalive 32;
}

server {
    location /api/ {
        proxy_pass http://backend/;
        # ... other proxy settings
    }
}
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] API keys configured
- [ ] SSL certificates ready
- [ ] Database migrations run
- [ ] Monitoring configured
- [ ] Backup strategy in place

### During Deployment
- [ ] Zero-downtime deployment
- [ ] Health checks passing
- [ ] Logs monitoring
- [ ] Performance metrics normal

### Post-Deployment
- [ ] Smoke tests passed
- [ ] All endpoints responding
- [ ] SSL working correctly
- [ ] Monitoring alerts configured
- [ ] Team notified
- [ ] Documentation updated

---

## 📞 Support & Resources

- 🔧 **DevOps Team**: devops@mh-companion.com
- 📚 **Runbooks**: `/docs/runbooks/`
- 🚨 **Incident Response**: `/docs/incident-response.md`
- 📊 **Monitoring Dashboard**: https://monitoring.mh-companion.com
- 🔍 **Log Analysis**: https://logs.mh-companion.com

---

*Last updated: January 15, 2024*
*Guide Version: 1.0.0*
