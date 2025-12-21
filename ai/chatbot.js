// AI Chatbot for Customer Support
class AIchatbot {
  constructor() {
    this.intents = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
        responses: [
          'Hello! How can I help you today?',
          'Hi there! What can I assist you with?',
          'Welcome to OYO! How may I help you?',
        ],
      },
      booking: {
        patterns: ['book', 'reservation', 'room', 'check availability'],
        responses: [
          'I can help you find and book a room. What city are you looking for?',
          'Let me help you with your booking. When do you need the room?',
        ],
      },
      cancellation: {
        patterns: ['cancel', 'refund', 'cancel booking'],
        responses: [
          'I can help you cancel your booking. Please provide your booking ID.',
          'To cancel your reservation, I\'ll need your booking reference number.',
        ],
      },
      payment: {
        patterns: ['payment', 'pay', 'bill', 'charge', 'cost'],
        responses: [
          'For payment issues, I can connect you with our billing team.',
          'What payment-related question can I help you with?',
        ],
      },
      location: {
        patterns: ['where', 'location', 'address', 'directions'],
        responses: [
          'I can help you find hotel locations. Which city are you interested in?',
          'Let me help you with location information. What area are you looking for?',
        ],
      },
    };
    
    this.context = new Map();
  }

  // Natural Language Processing (simplified)
  processMessage(userId, message) {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Get or create user context
    let userContext = this.context.get(userId) || { 
      lastIntent: null, 
      conversationState: 'initial',
      bookingData: {},
    };

    // Intent classification
    const intent = this.classifyIntent(normalizedMessage);
    const response = this.generateResponse(intent, normalizedMessage, userContext);
    
    // Update context
    userContext.lastIntent = intent;
    this.context.set(userId, userContext);
    
    return {
      message: response,
      intent,
      suggestions: this.getSuggestions(intent),
      quickReplies: this.getQuickReplies(intent),
    };
  }

  // Intent Classification
  classifyIntent(message) {
    let bestMatch = { intent: 'unknown', confidence: 0 };
    
    Object.entries(this.intents).forEach(([intentName, intentData]) => {
      const matches = intentData.patterns.filter(pattern => 
        message.includes(pattern)
      ).length;
      
      const confidence = matches / intentData.patterns.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent: intentName, confidence };
      }
    });
    
    return bestMatch.confidence > 0.3 ? bestMatch.intent : 'unknown';
  }

  // Response Generation
  generateResponse(intent, message, context) {
    if (intent === 'unknown') {
      return this.handleUnknownIntent(message);
    }
    
    const responses = this.intents[intent]?.responses || [];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Context-aware responses
    if (intent === 'booking' && context.conversationState === 'initial') {
      context.conversationState = 'booking_started';
      return randomResponse;
    }
    
    if (intent === 'cancellation') {
      context.conversationState = 'cancellation_started';
      return randomResponse;
    }
    
    return randomResponse || 'I understand you need help. Let me connect you with a human agent.';
  }

  // Handle unknown intents
  handleUnknownIntent(message) {
    // Extract entities (simplified)
    const entities = this.extractEntities(message);
    
    if (entities.bookingId) {
      return `I found booking ID ${entities.bookingId}. What would you like to do with this booking?`;
    }
    
    if (entities.city) {
      return `I see you mentioned ${entities.city}. Are you looking for hotels there?`;
    }
    
    return 'I\'m not sure I understand. Could you please rephrase your question?';
  }

  // Entity Extraction
  extractEntities(message) {
    const entities = {};
    
    // Booking ID pattern
    const bookingIdMatch = message.match(/OYO\d{6}/i);
    if (bookingIdMatch) {
      entities.bookingId = bookingIdMatch[0];
    }
    
    // City names (simplified)
    const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad'];
    const cityMatch = cities.find(city => message.toLowerCase().includes(city));
    if (cityMatch) {
      entities.city = cityMatch;
    }
    
    // Date patterns
    const dateMatch = message.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) {
      entities.date = dateMatch[0];
    }
    
    return entities;
  }

  // Get contextual suggestions
  getSuggestions(intent) {
    const suggestions = {
      greeting: ['Find hotels', 'Check my bookings', 'Contact support'],
      booking: ['Search hotels', 'Check availability', 'View prices'],
      cancellation: ['Cancel booking', 'Refund policy', 'Modify booking'],
      payment: ['Payment methods', 'Billing help', 'Refund status'],
      location: ['Hotel directions', 'Nearby attractions', 'Transportation'],
    };
    
    return suggestions[intent] || ['Contact support', 'View FAQ'];
  }

  // Get quick reply options
  getQuickReplies(intent) {
    const quickReplies = {
      greeting: ['Book a room', 'My bookings', 'Help'],
      booking: ['Mumbai', 'Delhi', 'Bangalore', 'Today', 'Tomorrow'],
      cancellation: ['Yes, cancel', 'No, keep booking', 'Modify instead'],
      payment: ['Payment failed', 'Refund query', 'Bill inquiry'],
    };
    
    return quickReplies[intent] || ['Yes', 'No', 'Help'];
  }

  // Sentiment Analysis (simplified)
  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'angry'];
    
    const words = message.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Escalate to human agent
  shouldEscalate(userId, message) {
    const userContext = this.context.get(userId);
    const sentiment = this.analyzeSentiment(message);
    
    // Escalate if user is frustrated or conversation is too long
    return sentiment === 'negative' || 
           (userContext && userContext.messageCount > 10) ||
           message.toLowerCase().includes('human') ||
           message.toLowerCase().includes('agent');
  }
}

module.exports = AIchatbot;