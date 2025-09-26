"""
LLM Adapter module for routing requests to different AI providers.
Supports mock, gemini, and perplexity providers with environment-based configuration.
"""
import logging
import random
import httpx
import asyncio
from typing import Dict, Any

from .config import settings

logger = logging.getLogger(__name__)

def generate_reply(text: str) -> str:
    """
    Generate a reply using the configured LLM provider.
    
    Args:
        text: Input text from user (will be truncated to 500 chars max)
        
    Returns:
        Generated reply string
    """
    # Trim input to 500 characters max to control costs
    trimmed_text = text[:500] if len(text) > 500 else text
    
    provider = settings.provider.lower()
    
    if provider == "mock":
        return _mock_generate_reply(trimmed_text)
    elif provider == "gemini":
        return _gemini_generate_reply(trimmed_text)
    elif provider == "perplexity":
        return _perplexity_generate_reply(trimmed_text)
    else:
        logger.warning(f"Unknown provider '{provider}', falling back to mock")
        return _mock_generate_reply(trimmed_text)

def _mock_generate_reply(text: str) -> str:
    """
    Mock LLM provider using simple rule-based responses.
    Perfect for local development and testing without API costs.
    """
    text_lower = text.lower()
    
    # Simple keyword-based responses for mental health context
    responses = {
        "anxious": [
            "I understand you're feeling anxious. Try taking deep breaths and focusing on the present moment.",
            "Anxiety can be overwhelming. Consider grounding techniques like naming 5 things you can see.",
            "It's okay to feel anxious sometimes. What specific situation is making you feel this way?"
        ],
        "sad": [
            "I'm sorry you're feeling sad. Your feelings are valid and it's okay to sit with them.",
            "Sadness is a natural emotion. Would you like to talk about what's contributing to these feelings?",
            "Thank you for sharing how you're feeling. Sometimes expressing sadness can be the first step."
        ],
        "happy": [
            "It's wonderful that you're feeling happy! What's bringing you joy today?",
            "I'm glad to hear you're in good spirits. Happiness is precious - savor this moment.",
            "That's great to hear! Positive emotions can be contagious and healing."
        ],
        "stressed": [
            "Stress can be really challenging. Have you tried any relaxation techniques recently?",
            "It sounds like you have a lot on your plate. What's the most pressing concern right now?",
            "Stress is your body's way of signaling that something needs attention. Let's break it down."
        ],
        "help": [
            "I'm here to listen and support you. What would be most helpful right now?",
            "Asking for help takes courage. What specific area would you like to focus on?",
            "You've taken an important step by reaching out. How can I best support you today?"
        ]
    }
    
    # Check for keywords and return appropriate response
    for keyword, reply_list in responses.items():
        if keyword in text_lower:
            return random.choice(reply_list)
    
    # Default responses for general input
    default_responses = [
        "Thank you for sharing that with me. Can you tell me more about how you're feeling?",
        "I hear you. It sounds like you have something important on your mind.",
        "I appreciate you opening up. What would be most helpful for you right now?",
        "Your thoughts and feelings matter. Would you like to explore this topic further?",
        "It takes strength to express yourself. How has your day been overall?"
    ]
    
    return random.choice(default_responses)

def _gemini_generate_reply(text: str) -> str:
    """
    Generate reply using Google's Gemini Pro API.
    
    Args:
        text: Input text from user
        
    Returns:
        Generated reply from Gemini or fallback message on error
    """
    if not settings.gemini_api_key:
        logger.error("GEMINI_API_KEY not found in environment")
        return "I'm here with you, though I couldn't reach Gemini right now."
    
    try:
        # Prepare the request (Gemini uses API key in URL, not header)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.gemini_api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        
        # Create a comprehensive prompt that includes system instruction and user message
        full_prompt = f"""You are a compassionate, empathetic mental health companion and active listener. Your role is to:

- Provide emotional support and validation
- Use active listening techniques  
- Offer gentle, non-judgmental guidance
- Encourage self-reflection and coping strategies
- Keep responses warm, supportive, and under 150 words
- Never provide medical advice or diagnose
- Focus on the person's feelings and experiences

Respond with empathy, understanding, and genuine care.

User message: {text}

Your supportive response:"""
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 200,
                "topP": 0.8,
                "topK": 40
            }
        }
        
        # Make synchronous HTTP request
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract the generated text
            if ("candidates" in data and 
                len(data["candidates"]) > 0 and 
                "content" in data["candidates"][0] and
                "parts" in data["candidates"][0]["content"] and
                len(data["candidates"][0]["content"]["parts"]) > 0):
                
                generated_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                logger.info(f"Gemini response generated successfully: {generated_text[:50]}...")
                return generated_text
            else:
                logger.error(f"Unexpected Gemini response structure: {data}")
                return "I'm here with you, though I couldn't reach Gemini right now."
                
    except httpx.TimeoutException:
        logger.error("Gemini API timeout")
        return "I'm here with you, though I couldn't reach Gemini right now."
    except httpx.HTTPStatusError as e:
        logger.error(f"Gemini API HTTP error: {e.response.status_code} - {e.response.text}")
        return "I'm here with you, though I couldn't reach Gemini right now."
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        return "I'm here with you, though I couldn't reach Gemini right now."

def _perplexity_generate_reply(text: str) -> str:
    """
    Generate reply using Perplexity API.
    
    Args:
        text: Input text from user
        
    Returns:
        Generated reply from Perplexity or fallback message on error
    """
    if not settings.perplexity_api_key:
        logger.error("PERPLEXITY_API_KEY not found in environment")
        return "I'm here with you, though I couldn't reach Perplexity right now."
    
    try:
        # Prepare the request
        url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.perplexity_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.1-sonar-small-128k-chat",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a compassionate mental health companion. Provide supportive, empathetic responses under 100 words. Focus on validation, understanding, and gentle guidance."
                },
                {
                    "role": "user", 
                    "content": text
                }
            ],
            "max_tokens": 150,
            "temperature": 0.7
        }
        
        # Make synchronous HTTP request
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            
            # Extract the generated text
            if ("choices" in data and 
                len(data["choices"]) > 0 and 
                "message" in data["choices"][0] and
                "content" in data["choices"][0]["message"]):
                
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"Unexpected Perplexity response structure: {data}")
                return "I'm here with you, though I couldn't reach Perplexity right now."
                
    except httpx.TimeoutException:
        logger.error("Perplexity API timeout")
        return "I'm here with you, though I couldn't reach Perplexity right now."
    except httpx.HTTPStatusError as e:
        logger.error(f"Perplexity API HTTP error: {e.response.status_code} - {e.response.text}")
        return "I'm here with you, though I couldn't reach Perplexity right now."
    except Exception as e:
        logger.error(f"Perplexity API error: {str(e)}")
        return "I'm here with you, though I couldn't reach Perplexity right now."
