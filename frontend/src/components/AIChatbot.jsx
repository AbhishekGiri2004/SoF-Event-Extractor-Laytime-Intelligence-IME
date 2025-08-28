import React, { useState, useRef, useEffect } from 'react';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Hello! I\'m your AI assistant. Ask me anything about maritime operations, document processing, or how to use this platform.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getAIResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('hello') || msg.includes('hi')) {
      return 'Hello! How can I help you today?';
    } else if (msg.includes('upload') || msg.includes('document')) {
      return 'To upload documents: 1) Go to Dashboard 2) Drag & drop PDF/Word/CSV files 3) Wait for processing 4) Review extracted data';
    } else if (msg.includes('export') || msg.includes('download')) {
      return 'You can export data as CSV or JSON from the results page. Click Export CSV or Export JSON buttons after processing.';
    } else if (msg.includes('profile') || msg.includes('account')) {
      return 'Go to Profile page to update your name, email, role, and company information. Changes sync across all pages.';
    } else if (msg.includes('maritime') || msg.includes('vessel') || msg.includes('ship')) {
      return 'This platform processes maritime documents like Statement of Facts (SoF), extracting vessel info, port details, cargo data, and laytime events.';
    } else if (msg.includes('save') || msg.includes('saved')) {
      return 'Processed documents are automatically saved. View them in Saved Events page where you can edit names, export data, or delete entries.';
    } else if (msg.includes('help') || msg.includes('support')) {
      return 'Need help? Use the Support option in the menu to contact our team directly via email.';
    } else {
      return 'I can help with document processing, maritime operations, profile management, data export, and platform navigation. What would you like to know?';
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { id: Date.now(), type: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    setTimeout(() => {
      const aiResponse = getAIResponse(inputMessage);
      const botMessage = { id: Date.now() + 1, type: 'bot', content: aiResponse };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-lg border flex flex-col z-50">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg">
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
