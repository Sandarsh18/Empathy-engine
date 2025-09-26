"""
FastAPI application main module.
Provides /health and /analyze endpoints with sentiment analysis and LLM responses.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging
from typing import Dict, Any

from .llm_adapter import generate_reply
from .sentiment import analyze_sentiment
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MH Companion Minimal",
    description="Minimal FastAPI app with sentiment analysis and LLM integration",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    provider: str
    sentiment: str
    emotion: str
    emotion_confidence: float
    reply: str
    debug: Dict[str, Any]

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalyzeRequest):
    """
    Analyze user text for sentiment and generate LLM response.
    
    Args:
        request: JSON with 'text' field containing user input
        
    Returns:
        JSON with provider, sentiment, reply, and debug information
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        logger.info(f"Analyzing text with provider: {settings.provider}")
        
        # Analyze sentiment
        sentiment_result = analyze_sentiment(request.text)
        
        # Generate LLM reply
        llm_reply = generate_reply(request.text)
        
        # Build response
        response = AnalyzeResponse(
            provider=settings.provider,
            sentiment=sentiment_result["label"],
            emotion=sentiment_result["emotion"],
            emotion_confidence=sentiment_result["emotion_confidence"],
            reply=llm_reply,
            debug={
                "score": sentiment_result["score"],
                "pos_hits": sentiment_result["pos_hits"],
                "neg_hits": sentiment_result["neg_hits"],
                "emotion_scores": sentiment_result["emotion_scores"]
            }
        )
        
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions to preserve status codes
        raise
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "MH Companion Minimal API",
        "provider": settings.provider,
        "endpoints": ["/health", "/analyze", "/debug", "/docs"]
    }

@app.post("/chat", response_model=AnalyzeResponse)
async def chat(request: AnalyzeRequest):
    """
    Chat endpoint that provides the same functionality as analyze.
    This is for compatibility with mobile app expectations.
    """
    return await analyze_text(request)

@app.get("/debug")
async def debug_info():
    """Debug endpoint to show configuration and provider status."""
    from .config import get_provider_status, validate_provider_config
    
    provider_status = get_provider_status()
    current_valid = validate_provider_config()
    
    return {
        "current_provider": settings.provider,
        "provider_configured": current_valid,
        "all_providers": provider_status,
        "app_config": {
            "debug": settings.debug,
            "log_level": settings.log_level
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
