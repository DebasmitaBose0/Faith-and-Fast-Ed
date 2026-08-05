import React, { useState } from 'react';
import './SupportChatbot.css';

export default function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: 'Hello! How can I help you?', sender: 'bot' }]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button onClick={() => setOpen(!open)} className="bg-yellow-400 p-4 rounded-full shadow-lg">💬</button>
      {open && (
        <div className="w-80 h-96 bg-white dark:bg-black rounded-lg shadow-xl flex flex-col p-4 border">
          <h3 className="font-bold border-b pb-2">Support Chatbot</h3>
          <div className="flex-1 overflow-y-auto space-y-2 py-2">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded ${m.sender === 'bot' ? 'bg-gray-100 dark:bg-gray-800' : 'bg-yellow-200'}`}>{m.text}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}