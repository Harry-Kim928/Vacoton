import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import ApiKeyModal from './components/ApiKeyModal';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiModal, setShowApiModal] = useState(!apiKey);

  const handleApiKeySubmit = (key) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setShowApiModal(false);
  };

  const handleApiKeyChange = () => {
    setShowApiModal(true);
  };

  useEffect(() => {
    // Check if API key exists on app load
    if (!apiKey) {
      setShowApiModal(true);
    }
  }, [apiKey]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-left">
            <img 
              src="/ai-tutor-profile.png" 
              alt="AI Tutor" 
              className="tutor-avatar"
            />
            <div className="tutor-info">
              <h1>콴다 AI 복습코치</h1>
              <p>수학 문제를 업로드하고 대화해보세요</p>
            </div>
          </div>
          <button 
            className="api-key-button"
            onClick={handleApiKeyChange}
          >
            {apiKey ? '🔑' : '🔑'}
          </button>
        </div>
      </header>

      <main className="App-main">
        {apiKey ? (
          <ChatInterface apiKey={apiKey} />
        ) : (
          <div className="no-api-key">
            <p>OpenAI API 키를 설정하여 채팅을 시작하세요.</p>
            <button 
              className="set-api-key-button"
              onClick={() => setShowApiModal(true)}
            >
              API 키 설정
            </button>
          </div>
        )}
      </main>

      {showApiModal && (
        <ApiKeyModal 
          onSubmit={handleApiKeySubmit}
          onClose={() => setShowApiModal(false)}
        />
      )}
    </div>
  );
}

export default App;
