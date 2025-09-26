#!/usr/bin/env node
/**
 * Test script to validate the chat interface integration
 * Run this to test the API endpoints from Node.js (simulating frontend requests)
 */

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

async function testChatAPI() {
  console.log('🧪 Testing MH Companion Chat API Integration...\n');

  const testMessages = [
    {
      name: 'Positive Message',
      text: 'I am feeling amazing and so happy today! Everything is going wonderfully!'
    },
    {
      name: 'Negative Message', 
      text: 'I am feeling very anxious and sad about work tomorrow. I feel overwhelmed.'
    },
    {
      name: 'Neutral Message',
      text: 'The weather is changing today. I went to the store to buy groceries.'
    },
    {
      name: 'Mixed Message',
      text: 'I had a good morning but now I feel worried about the presentation. Feeling both excited and nervous.'
    }
  ];

  for (const testCase of testMessages) {
    try {
      console.log(`📝 Testing: ${testCase.name}`);
      console.log(`💬 Input: "${testCase.text}"`);
      
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        text: testCase.text
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const data = response.data;
      
      console.log(`🤖 Provider: ${data.provider}`);
      console.log(`😊 Sentiment: ${data.sentiment} (score: ${data.debug.score})`);
      console.log(`💭 Reply: ${data.reply}`);
      console.log(`🔍 Debug: pos_hits=[${data.debug.pos_hits.join(', ')}], neg_hits=[${data.debug.neg_hits.join(', ')}]`);
      console.log('✅ Success!\n');
      
    } catch (error) {
      console.error(`❌ Error testing "${testCase.name}":`, error.message);
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
      console.log('');
    }
  }

  // Test error cases
  console.log('🚨 Testing Error Cases...\n');
  
  try {
    console.log('📝 Testing: Empty Message');
    await axios.post(`${API_BASE_URL}/analyze`, { text: '' });
    console.log('❌ Should have failed for empty message');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Correctly rejected empty message');
    } else {
      console.log('❌ Unexpected error for empty message:', error.message);
    }
  }

  console.log('\n🎉 API Integration Test Complete!');
}

// Run the test
testChatAPI().catch(console.error);
