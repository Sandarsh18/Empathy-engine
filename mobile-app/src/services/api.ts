import { Message } from '../types';

const API_BASE_URL = 'http://localhost:8000'; // Adjust this to your backend URL

export class APIService {
  static async analyzeText(text: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  static async getChatResponse(message: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting chat response:', error);
      throw error;
    }
  }
}
