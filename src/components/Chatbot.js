import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './Chatbot.css';

// Initialize the Gemini API with environment variable
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
let genAI = null;

try {
  if (!API_KEY) {
    console.error('Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment variables.');
  } else {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    previousQuestion: null,
    waitingForFollowUp: false,
    followUpType: null
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: "Hello! I'm your Net Buddy. How can I help you today?",
        sender: 'bot'
      }]);
    }
  }, [isOpen, messages.length]);

  const isNetworkRelatedQuery = (query) => {
    const networkKeywords = ['sim', 'network', 'provider', 'location', 'coverage', 'signal', 'mobile', 'data', 'plan', 'roaming'];
    const queryLower = query.toLowerCase();
    return networkKeywords.some(keyword => queryLower.includes(keyword));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (conversationContext.waitingForFollowUp) {
        // Handle follow-up response
        const followUpContext = {
          originalQuestion: conversationContext.previousQuestion,
          followUpInfo: inputMessage,
          type: conversationContext.followUpType
        };
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        let combinedQuestion = followUpContext.originalQuestion;
        
        if (combinedQuestion.toLowerCase().includes('my city') || 
            combinedQuestion.toLowerCase().includes('your city')) {
          combinedQuestion = combinedQuestion.replace(/my city|your city/i, followUpContext.followUpInfo);
        } else {
          combinedQuestion = `${followUpContext.originalQuestion} in ${followUpContext.followUpInfo}`;
        }

        const prompt = `Please answer this question directly and naturally: ${combinedQuestion}. Provide a complete and informative response about ${followUpContext.followUpInfo} that fully addresses the original question.`;
        
        const result = await model.generateContent(prompt);
        const geminiResponse = await result.response;
        response = geminiResponse.text();

        setConversationContext({
          previousQuestion: null,
          waitingForFollowUp: false,
          followUpType: null
        });
      } else {
        // Handle new question
        if (isNetworkRelatedQuery(inputMessage)) {
          try {
            console.log('Sending network query:', { query: inputMessage });
            
            const backendResponse = await fetch('https://ml-shree007.azurewebsites.net/api/chatbot', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ 
                query: inputMessage
              }),
            });

            console.log('Backend response status:', backendResponse.status);
            
            if (!backendResponse.ok) {
              const errorText = await backendResponse.text();
              console.error('Backend error response:', errorText);
              throw new Error(`Backend service error: ${backendResponse.status} - ${errorText}`);
            }

            const data = await backendResponse.json();
            console.log('Backend response data:', data);
            
            // Handle the specific response structure for network queries
            if (data && typeof data === 'object') {
              if (data.provider && data.sentiment) {
                // Format the response in a user-friendly way
                response = `${data.provider} in ${data.location}: ${data.sentiment}`;
                if (data.score) {
                  response += `\nNetwork Score: ${data.score}/2.0`;
                }
              } else if (data.error) {
                throw new Error(data.error);
              } else if (data.response) {
                // Fallback for other response formats
                response = data.response;
              } else {
                console.error('Unexpected response structure:', data);
                throw new Error('Invalid response structure from backend');
              }
            } else {
              console.error('Invalid response type:', typeof data, data);
              throw new Error('Invalid response format from backend');
            }
          } catch (networkError) {
            console.error('Detailed network error:', {
              name: networkError.name,
              message: networkError.message,
              stack: networkError.stack
            });

            // Check if it's a parsing error
            if (networkError instanceof SyntaxError) {
              throw new Error('Invalid response format from server. Please try again.');
            }
            
            // Check if it's a network error
            if (networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
              throw new Error('Network connection error. Please check your internet connection.');
            }

            throw new Error(`Error processing request: ${networkError.message}`);
          }
        } else {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
          const prompt = `If you need more information to answer this question, ask for clarification. Otherwise, answer the question: ${inputMessage}`;
          const result = await model.generateContent(prompt);
          const geminiResponse = await result.response;
          response = geminiResponse.text();

          if (needsMoreInformation(response)) {
            setConversationContext({
              previousQuestion: inputMessage,
              waitingForFollowUp: true,
              followUpType: 'general'
            });
          }
        }
      }

      // Only add the bot message if we have a valid response
      if (response) {
        const botMessage = { text: response, sender: 'bot' };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Final error handler:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = { 
        text: error.message || 'An unexpected error occurred. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  // Helper function to check if response needs more information
  const needsMoreInformation = (response) => {
    if (!response) return false;
    const indicators = ['clarify', 'what city', 'which city', 'where are you'];
    return indicators.some(indicator => response.toLowerCase().includes(indicator));
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      <button 
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Chat Assistant</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender}`}
                role={message.sender === 'bot' ? 'status' : 'user'}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot loading" role="status" aria-label="Loading">
                <span>.</span><span>.</span><span>.</span>
              </div>
            )}
            {error && (
              <div className="message error" role="alert">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              aria-label="Chat message"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;