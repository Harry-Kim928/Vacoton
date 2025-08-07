import React from 'react';

const ChatMessage = ({ message, isAI, timestamp }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours < 12 ? '오전' : '오후';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  if (isAI) {
    return (
      <div className="flex justify-start items-start mb-5 max-w-full px-4">
        {/* AI 아이콘 */}
        <div className="flex-shrink-0 w-8 h-8 mr-3 mt-1">
          <img 
            src="/assets/ai-icon.png" 
            alt="AI" 
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold hidden">
            🧠
          </div>
        </div>
        
        {/* AI 말풍선 */}
        <div className="relative max-w-[90%]">
          <div className="bg-gray-200 text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 pr-12 pb-6">
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message}
            </div>
            
            {/* 타임스탬프 */}
            <div className="absolute bottom-2 right-3 text-xs text-gray-500">
              {formatTime(timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end items-start mb-5 max-w-full px-4">
      {/* 사용자 말풍선 */}
      <div className="relative max-w-[90%]">
        <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3 pr-12 pb-6">
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </div>
          
          {/* 타임스탬프 */}
          <div className="absolute bottom-2 right-3 text-xs text-blue-100">
            {formatTime(timestamp)}
          </div>
        </div>
      </div>
      
      {/* 사용자 아이콘 */}
      <div className="flex-shrink-0 w-8 h-8 ml-3 mt-1">
        <img 
          src="/assets/user-icon.png" 
          alt="User" 
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold hidden">
          👤
        </div>
      </div>
    </div>
  );
};

// 사용 예시 컴포넌트
const ChatContainer = () => {
  const messages = [
    {
      id: 1,
      message: "안녕하세요! 수학 문제를 도와드릴게요. 어떤 문제가 있나요?",
      isAI: true,
      timestamp: new Date()
    },
    {
      id: 2,
      message: "이차함수 문제를 풀고 있는데 어려워요.",
      isAI: false,
      timestamp: new Date()
    },
    {
      id: 3,
      message: "이차함수 문제를 풀 때는 먼저 표준형으로 변환하는 것이 중요해요. 구체적으로 어떤 문제인지 알려주시면 더 자세히 도와드릴게요!",
      isAI: true,
      timestamp: new Date()
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-800">수학 튜터</h1>
      </div>
      
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg.message}
            isAI={msg.isAI}
            timestamp={msg.timestamp}
          />
        ))}
      </div>
      
      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="메시지를 입력하세요..."
            rows="1"
          />
          <button className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
export { ChatContainer };
