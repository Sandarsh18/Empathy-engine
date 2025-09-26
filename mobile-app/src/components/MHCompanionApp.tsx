import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Card,
  Text,
  Chip,
  FAB,
  useTheme,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Message, VoiceInputState } from '../types';
import { APIService } from '../services/api';
import { VoiceService } from '../services/voice';
import { NotificationService } from '../services/notifications';

export default function MHCompanionApp() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceInputState>({
    isListening: false,
    isProcessing: false,
    transcript: '',
  });
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.setupNotifications();
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const getEmotionColor = (emotion?: string, confidence?: number): string => {
    if (!emotion || !confidence) return theme.colors.outline;
    
    const baseColors: { [key: string]: string } = {
      happy: '#4CAF50',
      sad: '#2196F3',
      anxious: '#FF9800',
      frustrated: '#F44336',
      excited: '#E91E63',
      worried: '#9C27B0',
    };
    
    const baseColor = baseColors[emotion] || theme.colors.outline;
    return baseColor;
  };

  const getEmotionIcon = (emotion?: string): string => {
    const icons: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      anxious: '😰',
      frustrated: '😤',
      excited: '🤩',
      worried: '😟',
    };
    return icons[emotion || ''] || '🤔';
  };

  const getSentimentEmoji = (sentiment?: string): string => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await APIService.getChatResponse(text.trim());
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.response,
        timestamp: new Date(),
        sentiment: response.sentiment,
        emotion: response.emotion ? {
          primary: response.emotion,
          confidence: response.emotion_confidence || 0,
          all_emotions: response.emotion_breakdown || {},
        } : undefined,
        emotion_confidence: response.emotion_confidence,
        provider: response.provider,
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Speak the response
      VoiceService.speak(response.response);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (voiceState.isListening) {
      return;
    }

    try {
      await VoiceService.startListening(
        (transcript) => {
          setInputText(transcript);
        },
        (state) => {
          setVoiceState(prev => ({ ...prev, ...state }));
        }
      );
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert('Error', 'Voice input failed. Please try again.');
    }
  };

  const renderMessage = (message: Message) => (
    <Card
      key={message.id}
      style={[
        styles.messageCard,
        message.type === 'user' ? styles.userMessage : styles.botMessage,
      ]}
      mode={message.type === 'user' ? 'contained' : 'elevated'}
    >
      <Card.Content>
        {message.type === 'bot' && (
          <View style={styles.messageHeader}>
            {message.emotion && (
              <Chip
                icon={() => (
                  <Text style={{ fontSize: 16 }}>
                    {getEmotionIcon(message.emotion?.primary)}
                  </Text>
                )}
                textStyle={{ color: getEmotionColor(message.emotion?.primary, message.emotion_confidence) }}
                style={[styles.emotionChip, { borderColor: getEmotionColor(message.emotion?.primary, message.emotion_confidence) }]}
                compact
              >
                {message.emotion.primary} ({Math.round((message.emotion_confidence || 0) * 100)}%)
              </Chip>
            )}
            {message.sentiment && (
              <Chip
                icon={() => (
                  <Text style={{ fontSize: 14 }}>
                    {getSentimentEmoji(message.sentiment)}
                  </Text>
                )}
                style={styles.sentimentChip}
                compact
              >
                {message.sentiment}
              </Chip>
            )}
          </View>
        )}
        <Text variant="bodyMedium" style={styles.messageText}>
          {message.content}
        </Text>
        <Text variant="bodySmall" style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="MH Companion" />
        <Appbar.Action
          icon="bell"
          onPress={() => {
            // Navigate to notification settings
            Alert.alert('Notifications', 'Notification settings coming soon!');
          }}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 && (
            <Surface style={styles.welcomeCard}>
              <Text variant="headlineSmall" style={styles.welcomeTitle}>
                Welcome to MH Companion 💙
              </Text>
              <Text variant="bodyMedium" style={styles.welcomeText}>
                I'm here to listen and support your mental health journey. 
                Share how you're feeling, and I'll provide personalized guidance 
                with emotion-aware responses.
              </Text>
            </Surface>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <Text variant="bodySmall" style={styles.loadingText}>
                Thinking...
              </Text>
            </View>
          )}
        </ScrollView>

        <Surface style={styles.inputContainer}>
          {voiceState.isListening && (
            <View style={styles.voiceIndicator}>
              <MaterialCommunityIcons
                name="microphone"
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="bodySmall" style={styles.voiceText}>
                Listening...
              </Text>
            </View>
          )}
          
          {voiceState.isProcessing && (
            <View style={styles.voiceIndicator}>
              <ActivityIndicator size="small" />
              <Text variant="bodySmall" style={styles.voiceText}>
                Processing...
              </Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              mode="outlined"
              placeholder="Share how you're feeling..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              multiline
              disabled={isLoading}
            />
            
            <FAB
              style={[
                styles.voiceButton,
                { backgroundColor: voiceState.isListening ? theme.colors.error : theme.colors.primary }
              ]}
              size="small"
              icon={voiceState.isListening ? "microphone-off" : "microphone"}
              onPress={handleVoiceInput}
              disabled={isLoading || voiceState.isProcessing}
            />
            
            <FAB
              style={styles.sendButton}
              size="small"
              icon="send"
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
            />
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeCard: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  welcomeText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  messageCard: {
    marginBottom: 12,
    maxWidth: '85%',
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 6,
  },
  emotionChip: {
    borderWidth: 1,
  },
  sentimentChip: {
    opacity: 0.8,
  },
  messageText: {
    marginBottom: 4,
    lineHeight: 20,
  },
  timestamp: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    opacity: 0.7,
  },
  inputContainer: {
    padding: 16,
    elevation: 8,
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  voiceText: {
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
  },
  voiceButton: {
    marginBottom: 4,
  },
  sendButton: {
    marginBottom: 4,
  },
});
