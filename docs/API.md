# 🚀 MH Companion - API Documentation

## 📋 Table of Contents
- [Overview](#-overview)
- [Authentication](#-authentication)
- [Base URLs](#-base-urls)
- [Endpoints](#-endpoints)
- [Data Models](#-data-models)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [SDK & Examples](#-sdk--examples)

## 🎯 Overview

The MH Companion API provides a RESTful interface for mental health support services, including emotion detection, AI-powered conversations, and sentiment analysis.

### Key Features
- 🧠 **Multi-provider LLM Integration** (Gemini, Perplexity, Mock)
- 😊 **Real-time Emotion Detection** (6 emotion types with 95.7% accuracy)
- 💭 **Sentiment Analysis** (Positive, Negative, Neutral)
- 🎤 **Voice Integration Support**
- 📊 **Analytics & Insights**

## 🔐 Authentication

Currently, the API uses simple API key authentication for development. Production will implement OAuth 2.0.

### Development Authentication
```bash
# Add to headers
X-API-Key: your-dev-api-key
```

### Production Authentication (Coming Soon)
```bash
# OAuth 2.0 Bearer Token
Authorization: Bearer <access_token>
```

## 🌐 Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Staging | `https://api-staging.mh-companion.com` |
| Production | `https://api.mh-companion.com` |

## 📡 Endpoints

### Health Check

#### `GET /health`
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "llm": "operational",
    "sentiment": "operational",
    "emotion_detection": "operational"
  }
}
```

### Chat & Conversation

#### `POST /chat`
Send a message and receive AI-powered response with emotion detection.

**Request:**
```json
{
  "message": "I'm feeling really stressed about work lately",
  "user_id": "user123",
  "session_id": "session456",
  "context": {
    "previous_emotions": ["stress", "anxiety"],
    "conversation_history": []
  }
}
```

**Response:**
```json
{
  "response": "I understand that work stress can be overwhelming. Let's explore some strategies...",
  "emotion": {
    "detected": "stress",
    "confidence": 0.89,
    "secondary_emotions": ["anxiety", "overwhelm"],
    "valence": -0.6,
    "arousal": 0.7
  },
  "sentiment": {
    "classification": "negative",
    "score": -0.4,
    "confidence": 0.85
  },
  "recommendations": [
    {
      "type": "breathing_exercise",
      "title": "4-7-8 Breathing Technique",
      "description": "A calming breath work exercise"
    }
  ],
  "session_id": "session456",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Emotion Detection

#### `POST /analyze/emotion`
Analyze text for emotional content.

**Request:**
```json
{
  "text": "I'm having trouble sleeping and feel anxious all the time",
  "options": {
    "include_confidence": true,
    "include_secondary": true,
    "detailed_analysis": true
  }
}
```

**Response:**
```json
{
  "primary_emotion": "anxiety",
  "confidence": 0.92,
  "secondary_emotions": [
    {"emotion": "stress", "confidence": 0.76},
    {"emotion": "fatigue", "confidence": 0.68}
  ],
  "emotional_dimensions": {
    "valence": -0.7,
    "arousal": 0.8,
    "dominance": -0.4
  },
  "analysis": {
    "keywords": ["trouble", "sleeping", "anxious", "all the time"],
    "intensity": "high",
    "duration_indicators": ["all the time"]
  }
}
```

### Sentiment Analysis

#### `POST /analyze/sentiment`
Perform sentiment analysis on text.

**Request:**
```json
{
  "text": "Today was actually a pretty good day, I accomplished a lot",
  "options": {
    "detailed": true
  }
}
```

**Response:**
```json
{
  "sentiment": "positive",
  "score": 0.7,
  "confidence": 0.88,
  "breakdown": {
    "positive": 0.75,
    "neutral": 0.20,
    "negative": 0.05
  },
  "keywords": {
    "positive": ["good", "accomplished"],
    "neutral": ["today", "day"],
    "negative": []
  }
}
```

### LLM Providers

#### `GET /providers`
Get available LLM providers and their status.

**Response:**
```json
{
  "providers": [
    {
      "name": "gemini",
      "status": "active",
      "model": "gemini-2.0-flash-exp",
      "capabilities": ["chat", "emotion_analysis", "recommendations"],
      "rate_limit": "100/minute"
    },
    {
      "name": "perplexity",
      "status": "active",
      "model": "llama-3.1-sonar-small-128k-online",
      "capabilities": ["chat", "research", "real_time_info"],
      "rate_limit": "50/minute"
    },
    {
      "name": "mock",
      "status": "active",
      "model": "mock-llm-v1",
      "capabilities": ["testing", "development"],
      "rate_limit": "unlimited"
    }
  ]
}
```

#### `POST /providers/{provider_name}/chat`
Chat with a specific LLM provider.

**Parameters:**
- `provider_name`: One of `gemini`, `perplexity`, `mock`

**Request:**
```json
{
  "message": "What are some effective stress management techniques?",
  "system_prompt": "You are a compassionate mental health assistant.",
  "options": {
    "temperature": 0.7,
    "max_tokens": 500
  }
}
```

### User Sessions

#### `POST /sessions`
Create a new conversation session.

**Request:**
```json
{
  "user_id": "user123",
  "initial_context": {
    "user_preferences": {
      "communication_style": "supportive",
      "topics_of_interest": ["stress", "sleep", "productivity"]
    }
  }
}
```

**Response:**
```json
{
  "session_id": "session789",
  "created_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-01-15T22:30:00Z",
  "status": "active"
}
```

#### `GET /sessions/{session_id}`
Get session details and conversation history.

#### `DELETE /sessions/{session_id}`
End a conversation session.

### Analytics

#### `GET /analytics/emotions`
Get emotion analytics over time.

**Query Parameters:**
- `start_date`: ISO 8601 date
- `end_date`: ISO 8601 date
- `user_id`: Optional user filter
- `granularity`: `hour`, `day`, `week`, `month`

**Response:**
```json
{
  "period": "2024-01-01 to 2024-01-15",
  "total_interactions": 1250,
  "emotion_distribution": {
    "joy": 0.25,
    "calm": 0.20,
    "stress": 0.18,
    "anxiety": 0.15,
    "sadness": 0.12,
    "anger": 0.10
  },
  "trends": {
    "most_common": "joy",
    "trending_up": ["calm", "joy"],
    "trending_down": ["stress", "anxiety"]
  },
  "time_series": [
    {
      "date": "2024-01-01",
      "emotions": {"joy": 15, "stress": 8, "calm": 12}
    }
  ]
}
```

## 📊 Data Models

### Emotion Model
```typescript
interface Emotion {
  primary: "joy" | "sadness" | "anger" | "fear" | "surprise" | "disgust" | "calm" | "stress" | "anxiety";
  confidence: number; // 0.0 to 1.0
  secondary?: Array<{
    emotion: string;
    confidence: number;
  }>;
  dimensions: {
    valence: number;    // -1.0 (negative) to 1.0 (positive)
    arousal: number;    // 0.0 (calm) to 1.0 (excited)
    dominance: number;  // -1.0 (submissive) to 1.0 (dominant)
  };
}
```

### Sentiment Model
```typescript
interface Sentiment {
  classification: "positive" | "negative" | "neutral";
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  breakdown?: {
    positive: number;
    neutral: number;
    negative: number;
  };
}
```

### Chat Message Model
```typescript
interface ChatMessage {
  message: string;
  user_id: string;
  session_id: string;
  timestamp?: string;
  context?: {
    previous_emotions?: string[];
    conversation_history?: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  };
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is missing required parameters",
    "details": {
      "missing_fields": ["message", "user_id"],
      "provided_fields": ["session_id"]
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Malformed or incomplete request |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `PROVIDER_ERROR` | 502 | LLM provider unavailable |
| `INTERNAL_ERROR` | 500 | Internal server error |

## 🚦 Rate Limiting

Rate limits are applied per API key:

| Endpoint | Limit |
|----------|-------|
| `/chat` | 100 requests/minute |
| `/analyze/*` | 200 requests/minute |
| `/providers/*/chat` | Provider-specific |
| Other endpoints | 300 requests/minute |

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642234567
```

## 🛠 SDK & Examples

### JavaScript/TypeScript SDK

```typescript
import { MHCompanionAPI } from '@mh-companion/api-sdk';

const client = new MHCompanionAPI({
  apiKey: 'your-api-key',
  baseURL: 'http://localhost:8000'
});

// Send chat message
const response = await client.chat.send({
  message: "I'm feeling overwhelmed",
  userId: "user123",
  sessionId: "session456"
});

console.log(response.emotion.detected); // "stress"
console.log(response.response); // AI response
```

### Python SDK

```python
from mh_companion_sdk import MHCompanionClient

client = MHCompanionClient(
    api_key="your-api-key",
    base_url="http://localhost:8000"
)

# Analyze emotion
result = client.analyze_emotion(
    text="I can't stop worrying about everything"
)

print(result.primary_emotion)  # "anxiety"
print(result.confidence)       # 0.89
```

### cURL Examples

```bash
# Chat request
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "message": "I need help managing stress",
    "user_id": "user123",
    "session_id": "session456"
  }'

# Emotion analysis
curl -X POST "http://localhost:8000/analyze/emotion" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "text": "I feel so anxious about the presentation tomorrow",
    "options": {"detailed_analysis": true}
  }'
```

### Webhook Integration

```javascript
// Express.js webhook handler
app.post('/webhooks/mh-companion', (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'emotion_detected':
      handleEmotionDetection(data);
      break;
    case 'session_ended':
      handleSessionEnd(data);
      break;
  }
  
  res.json({ received: true });
});
```

## 🔄 Real-time Features

### Server-Sent Events (SSE)

```javascript
// Subscribe to real-time emotion updates
const eventSource = new EventSource('/stream/emotions?session_id=session456');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('New emotion detected:', data.emotion);
};
```

### WebSocket Support (Coming Soon)

```javascript
// Real-time bidirectional communication
const ws = new WebSocket('ws://localhost:8000/ws/chat/session456');

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'emotion_update') {
    updateEmotionDisplay(data.emotion);
  }
};
```

## 📈 Performance & Monitoring

### Metrics Endpoints

#### `GET /metrics`
Prometheus-compatible metrics for monitoring.

#### `GET /health/detailed`
Detailed health check with component status.

```json
{
  "status": "healthy",
  "components": {
    "database": {"status": "healthy", "response_time": "12ms"},
    "llm_providers": {
      "gemini": {"status": "healthy", "response_time": "450ms"},
      "perplexity": {"status": "healthy", "response_time": "380ms"}
    },
    "emotion_model": {"status": "healthy", "accuracy": "95.7%"}
  },
  "performance": {
    "avg_response_time": "245ms",
    "requests_per_minute": 89,
    "uptime": "99.8%"
  }
}
```

---

## 📞 Support

- 📧 **Email**: api-support@mh-companion.com
- 📚 **Documentation**: https://docs.mh-companion.com
- 🐛 **Issues**: https://github.com/mh-companion/api/issues
- 💬 **Discord**: https://discord.gg/mh-companion

---

*Last updated: January 15, 2024*
*API Version: 1.0.0*
