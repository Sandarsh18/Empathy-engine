export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sentiment?: 'positive' | 'negative' | 'neutral';
  emotion?: Emotion;
  emotion_confidence?: number;
  provider?: string;
}

export interface Emotion {
  primary: string;
  confidence: number;
  all_emotions: {
    happy: number;
    sad: number;
    anxious: number;
    frustrated: number;
    excited: number;
    worried: number;
  };
}

export interface VoiceInputState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
}

export interface NotificationSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string;
  reminder_type: 'mood_check' | 'breathing' | 'gratitude';
}
