import React, { useState } from 'react';
import './ApiKeyModal.css';

const ApiKeyModal = ({ onSubmit, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setIsValid(false);
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      setIsValid(false);
      return;
    }
    
    onSubmit(apiKey.trim());
  };

  const handleKeyChange = (e) => {
    setApiKey(e.target.value);
    setIsValid(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔑 Set OpenAI API Key</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="apiKey">OpenAI API Key</label>
            <input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={handleKeyChange}
              placeholder="sk-..."
              className={!isValid ? 'error' : ''}
              autoFocus
            />
            {!isValid && (
              <p className="error-message">
                Please enter a valid OpenAI API key starting with "sk-"
              </p>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Save API Key
            </button>
          </div>
        </form>
        
        <div className="modal-footer">
          <p>
            <strong>Note:</strong> Your API key is stored locally in your browser and is never sent to our servers.
          </p>
          <p>
            Get your API key from{' '}
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              OpenAI Platform
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
