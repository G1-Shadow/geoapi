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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when chat is first opened
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot'
      }]);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Check if API is properly initialized
    if (!genAI) {
      setError('Chat service is currently unavailable. Please try again later.');
      return;
    }

    // Add user message to chat
    const userMessage = { text: inputMessage, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Get response from Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"  });
      const briefPrompt = "Answer very briefly and in one short sentence: " + inputMessage;
      const result = await model.generateContent(briefPrompt);
      const response = await result.response;
      const botMessage = { text: response.text(), sender: 'bot' };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, I encountered an error. Please try again.');
      const errorMessage = { 
        text: 'Sorry, I encountered an error. Please try again.', 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
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