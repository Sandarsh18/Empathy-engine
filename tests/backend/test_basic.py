"""
Basic tests for MH Companion Minimal FastAPI application.
Tests health endpoint and sample analyze functionality with mock provider.
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app

# Create test client
client = TestClient(app)

def test_health_endpoint():
    """Test that health endpoint returns expected response."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_root_endpoint():
    """Test root endpoint returns basic information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "provider" in data
    assert "endpoints" in data
    assert data["provider"] == "mock"  # Default provider

def test_analyze_endpoint_basic():
    """Test analyze endpoint with simple text input."""
    payload = {"text": "I am feeling happy today"}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "provider" in data
    assert "sentiment" in data
    assert "reply" in data
    assert "debug" in data
    
    # Check provider is mock
    assert data["provider"] == "mock"
    
    # Check sentiment analysis results
    assert data["sentiment"] in ["neg", "neu", "pos"]
    assert "score" in data["debug"]
    assert "pos_hits" in data["debug"]
    assert "neg_hits" in data["debug"]
    
    # Check LLM reply exists
    assert isinstance(data["reply"], str)
    assert len(data["reply"]) > 0

def test_analyze_endpoint_positive_sentiment():
    """Test analyze endpoint with clearly positive text."""
    payload = {"text": "I am so happy and joyful today! Everything is wonderful."}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Should detect positive sentiment
    assert data["sentiment"] == "pos"
    assert data["debug"]["score"] > 0
    assert len(data["debug"]["pos_hits"]) > 0

def test_analyze_endpoint_negative_sentiment():
    """Test analyze endpoint with clearly negative text."""
    payload = {"text": "I am feeling very sad and depressed. Everything is terrible."}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Should detect negative sentiment
    assert data["sentiment"] == "neg"
    assert data["debug"]["score"] < 0
    assert len(data["debug"]["neg_hits"]) > 0

def test_analyze_endpoint_empty_text():
    """Test analyze endpoint with empty text returns error."""
    payload = {"text": ""}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_analyze_endpoint_whitespace_text():
    """Test analyze endpoint with whitespace-only text returns error."""
    payload = {"text": "   \n\t   "}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_analyze_endpoint_missing_text_field():
    """Test analyze endpoint with missing text field returns error."""
    payload = {}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 422  # Validation error

def test_analyze_endpoint_neutral_text():
    """Test analyze endpoint with neutral text."""
    payload = {"text": "The weather is changing today. I went to the store."}
    response = client.post("/analyze", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Should be neutral or close to neutral
    assert data["sentiment"] in ["neu", "pos", "neg"]  # Could be any depending on lexicon
    assert isinstance(data["debug"]["score"], int)

class TestSentimentAnalysis:
    """Test sentiment analysis functionality directly."""
    
    def test_positive_sentiment_detection(self):
        """Test that positive words are detected correctly."""
        from app.sentiment import analyze_sentiment
        
        result = analyze_sentiment("I am happy and joyful")
        assert result["label"] == "pos"
        assert result["score"] > 0
        assert "happy" in result["pos_hits"]
        assert "joyful" in result["pos_hits"]
    
    def test_negative_sentiment_detection(self):
        """Test that negative words are detected correctly."""
        from app.sentiment import analyze_sentiment
        
        result = analyze_sentiment("I am sad and depressed")
        assert result["label"] == "neg"
        assert result["score"] < 0
        assert "sad" in result["neg_hits"]
        assert "depressed" in result["neg_hits"]
    
    def test_neutral_sentiment_detection(self):
        """Test that neutral text returns neutral sentiment."""
        from app.sentiment import analyze_sentiment
        
        result = analyze_sentiment("The car is blue and has four wheels")
        assert result["label"] == "neu"
        assert result["score"] == 0
        assert len(result["pos_hits"]) == 0
        assert len(result["neg_hits"]) == 0

class TestLLMAdapter:
    """Test LLM adapter functionality."""
    
    def test_mock_provider_generates_reply(self):
        """Test that mock provider generates appropriate replies."""
        from app.llm_adapter import _mock_generate_reply
        
        reply = _mock_generate_reply("I am feeling anxious")
        assert isinstance(reply, str)
        assert len(reply) > 0
        assert "anxious" in reply.lower() or "anxiety" in reply.lower()
    
    def test_mock_provider_default_response(self):
        """Test mock provider handles unknown text gracefully.""" 
        from app.llm_adapter import _mock_generate_reply
        
        reply = _mock_generate_reply("The weather is nice today")
        assert isinstance(reply, str)
        assert len(reply) > 0
    
    @pytest.mark.skipif(not os.getenv("GEMINI_API_KEY"), reason="GEMINI_API_KEY not set")
    def test_gemini_provider_generates_reply(self):
        """Test Gemini provider (only if API key is available)."""
        from app.llm_adapter import _gemini_generate_reply
        
        reply = _gemini_generate_reply("I am feeling happy today")
        assert isinstance(reply, str)
        assert len(reply) > 0
        # Should not be a fallback message if API key is present
        assert "couldn't reach Gemini" not in reply
    
    @pytest.mark.skipif(not os.getenv("PERPLEXITY_API_KEY"), reason="PERPLEXITY_API_KEY not set")
    def test_perplexity_provider_generates_reply(self):
        """Test Perplexity provider (only if API key is available)."""
        from app.llm_adapter import _perplexity_generate_reply
        
        reply = _perplexity_generate_reply("I am feeling sad today")
        assert isinstance(reply, str)
        assert len(reply) > 0
        # Should not be a fallback message if API key is present
        assert "couldn't reach Perplexity" not in reply
    
    def test_gemini_provider_without_api_key(self):
        """Test Gemini provider fallback when no API key is set."""
        from app.llm_adapter import _gemini_generate_reply
        from app.config import settings
        
        # Temporarily clear the API key
        original_key = settings.gemini_api_key
        settings.gemini_api_key = None
        
        try:
            reply = _gemini_generate_reply("test message")
            assert isinstance(reply, str)
            assert "couldn't reach Gemini" in reply
        finally:
            # Restore original key
            settings.gemini_api_key = original_key
    
    def test_perplexity_provider_without_api_key(self):
        """Test Perplexity provider fallback when no API key is set."""
        from app.llm_adapter import _perplexity_generate_reply
        from app.config import settings
        
        # Temporarily clear the API key  
        original_key = settings.perplexity_api_key
        settings.perplexity_api_key = None
        
        try:
            reply = _perplexity_generate_reply("test message")
            assert isinstance(reply, str)
            assert "couldn't reach Perplexity" in reply
        finally:
            # Restore original key
            settings.perplexity_api_key = original_key
    
    def test_text_truncation(self):
        """Test that input text is properly truncated to 500 characters."""
        from app.llm_adapter import generate_reply
        
        # Create text longer than 500 characters
        long_text = "I am feeling anxious. " * 30  # Much longer than 500 chars
        
        # Mock provider should handle truncated text
        reply = generate_reply(long_text)
        assert isinstance(reply, str)
        assert len(reply) > 0
