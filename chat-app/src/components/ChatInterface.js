import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import { BlockMath } from 'react-katex';
import { Upload, Send, Loader2, Image, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import './ChatInterface.css';

const ChatInterface = ({ apiKey }) => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsLoading(true);

    try {
      // Add image message
      const imageMessage = {
        id: Date.now(),
        type: 'image',
        content: file,
        timestamp: new Date(),
        sender: 'user'
      };
      setMessages(prev => [...prev, imageMessage]);

      // Analyze image with OCR
      const ocrResult = await analyzeImage(file);
      
      // Add OCR result message
      const ocrMessage = {
        id: Date.now() + 1,
        type: 'ocr',
        content: ocrResult,
        timestamp: new Date(),
        sender: 'assistant'
      };
      setMessages(prev => [...prev, ocrMessage]);

      // Generate question based on OCR result
      const questionResult = await generateQuestion(ocrResult);
      
      // Add question message
      const questionMessage = {
        id: Date.now() + 2,
        type: 'question',
        content: questionResult,
        timestamp: new Date(),
        sender: 'assistant'
      };
      setMessages(prev => [...prev, questionMessage]);

    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: 'Sorry, there was an error processing your image. Please try again.',
        timestamp: new Date(),
        sender: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('apiKey', apiKey);

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }

    return await response.json();
  };

  const generateQuestion = async (ocrResult) => {
    const response = await fetch('/api/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ocrResult,
        apiKey
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate question');
    }

    return await response.json();
  };

  const generateFeedback = async (userAnswer, questionData) => {
    const response = await fetch('/api/generate-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAnswer,
        questionData,
        apiKey
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate feedback');
    }

    return await response.json();
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'text',
      content: currentInput,
      timestamp: new Date(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsLoading(true);

    try {
      // Find the last question message to get context
      const lastQuestionMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.type === 'question');

      if (lastQuestionMessage) {
        const feedbackResult = await generateFeedback(currentInput, lastQuestionMessage.content);
        
        const feedbackMessage = {
          id: Date.now() + 1,
          type: 'feedback',
          content: feedbackResult,
          timestamp: new Date(),
          sender: 'assistant'
        };
        setMessages(prev => [...prev, feedbackMessage]);
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, there was an error generating feedback. Please try again.',
        timestamp: new Date(),
        sender: 'assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    
    return (
      <div key={message.id} className={`message ${isUser ? 'user' : 'assistant'}`}>
        <div className="message-avatar">
          {isUser ? '👤' : '🤖'}
        </div>
        <div className="message-content">
          {message.type === 'image' && (
            <div className="image-message">
              <img 
                src={URL.createObjectURL(message.content)} 
                alt="Uploaded content"
                className="uploaded-image"
              />
            </div>
          )}
          
          {message.type === 'ocr' && (
            <div className="ocr-message">
              <div className="message-header">
                <Image size={16} />
                <span>Extracted Content</span>
              </div>
              <div className="ocr-content">
                {message.content.text && (
                  <div className="text-content">
                    <h4>Text:</h4>
                    <p>{message.content.text}</p>
                  </div>
                )}
                {message.content.latex && (
                  <div className="latex-content">
                    <h4>Formulas:</h4>
                    <BlockMath math={message.content.latex} />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {message.type === 'question' && (
            <div className="question-message">
              <div className="message-header">
                <MessageSquare size={16} />
                <span>Generated Question</span>
              </div>
              <div className="question-content">
                <ReactMarkdown>{message.content.question}</ReactMarkdown>
                {message.content.latex && (
                  <div className="question-latex">
                    <BlockMath math={message.content.latex} />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {message.type === 'text' && (
            <div className="text-message">
              <p>{message.content}</p>
            </div>
          )}
          
          {message.type === 'feedback' && (
            <div className="feedback-message">
              <div className="message-header">
                <CheckCircle size={16} />
                <span>Feedback & Follow-up</span>
              </div>
              <div className="feedback-content">
                <ReactMarkdown>{message.content.feedback}</ReactMarkdown>
                {message.content.followUpQuestion && (
                  <div className="follow-up-question">
                    <h4>Follow-up Question:</h4>
                    <ReactMarkdown>{message.content.followUpQuestion}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {message.type === 'error' && (
            <div className="error-message">
              <div className="message-header">
                <AlertCircle size={16} />
                <span>Error</span>
              </div>
              <p>{message.content}</p>
            </div>
          )}
          
          <div className="message-timestamp">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && !isLoading && (
            <div className="empty-state">
              <div className="upload-area" {...getRootProps()}>
                <input {...getInputProps()} />
                <Upload size={48} />
                <h3>Upload an Image</h3>
                <p>Drag and drop an image here, or click to select</p>
                <p className="upload-hint">Supports: JPG, PNG, GIF, BMP, WebP</p>
              </div>
            </div>
          )}
          
          {messages.map(renderMessage)}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="loading-message">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              disabled={isLoading}
              rows={1}
            />
            <div className="input-actions">
              <button
                className="upload-button"
                onClick={() => document.querySelector('input[type="file"]')?.click()}
                disabled={isLoading}
                title="Upload Image"
              >
                <Upload size={20} />
              </button>
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <div className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
      
      {/* Hidden dropzone for the upload button */}
      <div style={{ display: 'none' }}>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
