import * as Notifications from 'expo-notifications';
import { NotificationSettings } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async setupNotifications(): Promise<void> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Notification permission not granted');
    }
  }

  static async scheduleMoodReminder(settings: NotificationSettings): Promise<string> {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getReminderTitle(settings.reminder_type),
        body: this.getReminderBody(settings.reminder_type),
        data: { type: settings.reminder_type },
      },
      trigger: this.getTrigger(settings),
    });
    return identifier;
  }

  static async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  private static getReminderTitle(type: string): string {
    switch (type) {
      case 'mood_check':
        return '🌟 How are you feeling?';
      case 'breathing':
        return '🫁 Time to breathe';
      case 'gratitude':
        return '🙏 Gratitude moment';
      default:
        return '💙 MH Companion';
    }
  }

  private static getReminderBody(type: string): string {
    switch (type) {
      case 'mood_check':
        return 'Take a moment to check in with yourself and share how you\'re feeling today.';
      case 'breathing':
        return 'Take a few deep breaths and center yourself. You deserve this moment of peace.';
      case 'gratitude':
        return 'What are you grateful for today? Reflecting on the positive can lift your spirits.';
      default:
        return 'We\'re here to support you on your mental health journey.';
    }
  }

  private static getTrigger(settings: NotificationSettings): any {
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    if (settings.frequency === 'daily') {
      return {
        hour: hours,
        minute: minutes,
        repeats: true,
      };
    } else if (settings.frequency === 'weekly') {
      return {
        weekday: 1, // Monday
        hour: hours,
        minute: minutes,
        repeats: true,
      };
    }
    
    // Custom frequency - for now, just daily
    return {
      hour: hours,
      minute: minutes,
      repeats: true,
    };
  }
}
