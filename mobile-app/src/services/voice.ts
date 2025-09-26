import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { VoiceInputState } from '../types';

export class VoiceService {
  private static recording: Audio.Recording | null = null;
  private static isRecording = false;

  static async startListening(
    onTranscript: (transcript: string) => void,
    onStateChange: (state: Partial<VoiceInputState>) => void
  ): Promise<void> {
    try {
      onStateChange({ isListening: true, isProcessing: false });
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
        },
      });

      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;

      // Simulate speech-to-text (in a real app, you'd use a service like Google Speech API)
      // For now, we'll just stop after 3 seconds and provide a mock transcript
      setTimeout(async () => {
        if (this.isRecording) {
          await this.stopListening(onTranscript, onStateChange);
        }
      }, 3000);

    } catch (error) {
      console.error('Error starting voice input:', error);
      onStateChange({ isListening: false, isProcessing: false });
      throw error;
    }
  }

  static async stopListening(
    onTranscript: (transcript: string) => void,
    onStateChange: (state: Partial<VoiceInputState>) => void
  ): Promise<void> {
    try {
      if (!this.recording || !this.isRecording) return;

      onStateChange({ isListening: false, isProcessing: true });
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.recording = null;
      this.isRecording = false;

      // In a real app, you would send the audio file to a speech-to-text service
      // For now, we'll simulate it with a mock response
      setTimeout(() => {
        const mockTranscript = "Hello, I'm feeling a bit anxious today.";
        onTranscript(mockTranscript);
        onStateChange({ isProcessing: false, transcript: mockTranscript });
      }, 1000);

    } catch (error) {
      console.error('Error stopping voice input:', error);
      onStateChange({ isListening: false, isProcessing: false });
      throw error;
    }
  }

  static speak(text: string, options?: Speech.SpeechOptions): void {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      ...options,
    });
  }

  static stopSpeaking(): void {
    Speech.stop();
  }
}
