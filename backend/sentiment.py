"""
Enhanced lexicon-based sentiment and emotion analyzer.
Provides fast, offline sentiment analysis and emotion detection without API costs.
"""
import logging
import re
from typing import Dict, List, Any, Tuple

logger = logging.getLogger(__name__)

# Minimal positive sentiment lexicon
POSITIVE_WORDS = {
    # Core positive emotions
    "happy", "joy", "joyful", "excited", "elated", "cheerful", "pleased", "delighted",
    "content", "satisfied", "glad", "euphoric", "blissful", "ecstatic",
    
    # Achievement and success  
    "proud", "accomplished", "successful", "confident", "motivated", "inspired",
    "optimistic", "hopeful", "encouraged", "empowered",
    
    # Relationships and connection
    "loved", "supported", "connected", "grateful", "thankful", "blessed",
    "appreciated", "valued", "accepted", "understood",
    
    # Energy and vitality
    "energetic", "vibrant", "alive", "refreshed", "revitalized", "strong",
    "healthy", "active", "dynamic",
    
    # Peace and calm
    "peaceful", "calm", "relaxed", "serene", "tranquil", "balanced", "centered",
    "harmonious", "stable"
}

# Minimal negative sentiment lexicon  
NEGATIVE_WORDS = {
    # Core negative emotions
    "sad", "depressed", "unhappy", "miserable", "devastated", "heartbroken",
    "grief", "sorrow", "despair", "hopeless", "defeated",
    
    # Anxiety and fear
    "anxious", "worried", "nervous", "scared", "afraid", "terrified", "panicked",
    "stressed", "overwhelmed", "tense", "restless", "uneasy",
    
    # Anger and frustration
    "angry", "frustrated", "irritated", "annoyed", "furious", "enraged",
    "bitter", "resentful", "hostile", "aggressive",
    
    # Isolation and rejection
    "lonely", "isolated", "abandoned", "rejected", "unwanted", "excluded",
    "disconnected", "alienated", "ignored", "forgotten",
    
    # Physical and mental distress
    "tired", "exhausted", "drained", "weak", "sick", "painful", "hurt",
    "suffering", "struggling", "broken", "empty", "numb"
}

# Multi-dimensional emotion lexicons
EMOTION_LEXICONS = {
    "happy": {
        "happy", "joy", "joyful", "excited", "elated", "cheerful", "pleased", "delighted",
        "content", "satisfied", "glad", "euphoric", "blissful", "ecstatic", "amazing",
        "wonderful", "fantastic", "great", "awesome", "brilliant", "excellent", "perfect",
        "love", "loving", "adore", "celebrate", "celebrating", "thrilled", "overjoyed"
    },
    
    "sad": {
        "sad", "depressed", "unhappy", "miserable", "devastated", "heartbroken",
        "grief", "sorrow", "despair", "hopeless", "defeated", "crying", "tears",
        "melancholy", "gloomy", "downhearted", "dejected", "despondent", "mourn",
        "mourning", "weep", "weeping", "blue", "down", "low", "empty"
    },
    
    "anxious": {
        "anxious", "worried", "nervous", "scared", "afraid", "terrified", "panicked",
        "stressed", "overwhelmed", "tense", "restless", "uneasy", "panic", "fear",
        "fearful", "apprehensive", "concerned", "troubled", "distressed", "agitated",
        "jittery", "edgy", "unsettled", "bothered", "worry", "stress", "tension"
    },
    
    "frustrated": {
        "frustrated", "annoyed", "irritated", "angry", "furious", "enraged", "mad",
        "bitter", "resentful", "hostile", "aggressive", "impatient", "fed up",
        "aggravated", "exasperated", "infuriated", "livid", "outraged", "indignant",
        "vexed", "irked", "peeved", "bothered", "upset", "cross", "grumpy"
    },
    
    "excited": {
        "excited", "enthusiastic", "eager", "thrilled", "pumped", "energetic",
        "motivated", "inspired", "passionate", "animated", "vibrant", "dynamic",
        "stimulated", "invigorated", "electrified", "exhilarated", "fired up",
        "psyched", "amped", "stoked", "buzzing", "charged", "alive"
    },
    
    "worried": {
        "worried", "concerned", "troubled", "anxious", "apprehensive", "fearful",
        "uneasy", "disturbed", "perturbed", "bothered", "distressed", "nervous",
        "tense", "stressed", "overwhelmed", "burden", "burdened", "preoccupied",
        "restless", "unsettled", "agitated", "fretful", "care", "caring"
    }
}

def detect_emotion(text: str) -> Tuple[str, float, Dict[str, int]]:
    """
    Detect primary emotion from text using lexicon-based approach.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Tuple containing:
        - Primary emotion (string)
        - Confidence score (float 0-1)
        - Emotion scores dictionary
    """
    if not text or not text.strip():
        return "neutral", 0.0, {}
    
    # Normalize text: lowercase, remove punctuation, split into words
    normalized_text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = set(normalized_text.split())  # Use set to avoid duplicate counting
    
    # Calculate scores for each emotion
    emotion_scores = {}
    total_words = len(words)
    
    for emotion, lexicon in EMOTION_LEXICONS.items():
        matches = words.intersection(lexicon)
        emotion_scores[emotion] = len(matches)
    
    # Find primary emotion
    if not any(emotion_scores.values()):
        return "neutral", 0.0, emotion_scores
    
    primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])
    emotion_name = primary_emotion[0]
    match_count = primary_emotion[1]
    
    # Calculate confidence based on match density and uniqueness
    confidence = min(match_count / max(total_words * 0.1, 1), 1.0)
    
    # Boost confidence if emotion is significantly stronger than others
    other_scores = [score for name, score in emotion_scores.items() if name != emotion_name]
    if other_scores and match_count > max(other_scores) * 1.5:
        confidence = min(confidence * 1.3, 1.0)
    
    return emotion_name, confidence, emotion_scores

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """
    Analyze sentiment and emotion of input text using lexicon-based approach.
    
    Args:
        text: Input text to analyze
        
    Returns:
        Dictionary containing:
        - score: Integer sentiment score (negative = sad, 0 = neutral, positive = happy)  
        - pos_hits: List of positive words found
        - neg_hits: List of negative words found
        - label: String label ("neg", "neu", "pos")
        - emotion: Primary detected emotion
        - emotion_confidence: Confidence score for emotion detection
        - emotion_scores: Dictionary of all emotion scores
    """
    if not text or not text.strip():
        return {
            "score": 0,
            "pos_hits": [],
            "neg_hits": [], 
            "label": "neu",
            "emotion": "neutral",
            "emotion_confidence": 0.0,
            "emotion_scores": {}
        }
    
    # Normalize text: lowercase, remove punctuation, split into words
    normalized_text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = normalized_text.split()
    
    # Find positive and negative word matches (for backward compatibility)
    pos_hits = [word for word in words if word in POSITIVE_WORDS]
    neg_hits = [word for word in words if word in NEGATIVE_WORDS]
    
    # Calculate simple sentiment score
    pos_count = len(pos_hits)
    neg_count = len(neg_hits)
    score = pos_count - neg_count
    
    # Determine sentiment label
    if score > 0:
        label = "pos"
    elif score < 0:
        label = "neg"
    else:
        label = "neu"
    
    # Detect specific emotion
    emotion, emotion_confidence, emotion_scores = detect_emotion(text)
    
    result = {
        "score": score,
        "pos_hits": pos_hits,
        "neg_hits": neg_hits,
        "label": label,
        "emotion": emotion,
        "emotion_confidence": emotion_confidence,
        "emotion_scores": emotion_scores
    }
    
    logger.debug(f"Sentiment and emotion analysis: {result}")
    return result

def get_sentiment_summary(sentiment_data: Dict[str, Any]) -> str:
    """
    Generate a human-readable summary of sentiment analysis.
    
    Args:
        sentiment_data: Output from analyze_sentiment()
        
    Returns:
        Human-readable sentiment summary string
    """
    score = sentiment_data["score"]
    pos_hits = sentiment_data["pos_hits"]
    neg_hits = sentiment_data["neg_hits"]
    label = sentiment_data["label"]
    
    if label == "pos":
        return f"Positive sentiment detected (score: +{score}). Key positive indicators: {', '.join(pos_hits[:3])}"
    elif label == "neg":
        return f"Negative sentiment detected (score: {score}). Key negative indicators: {', '.join(neg_hits[:3])}"
    else:
        return f"Neutral sentiment detected (score: {score}). Mixed or neutral language used."
