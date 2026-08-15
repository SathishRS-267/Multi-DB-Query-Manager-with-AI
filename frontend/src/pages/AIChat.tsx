import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Share2, Clock, Trash2, Database, Save } from 'lucide-react';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface ChatHistory {
  id: string;
  name: string;
  date: string;
}

interface ConnectionDetails {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dbms: string;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I can help you to query databases.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareName, setShareName] = useState('');
  const [showEmailShare, setShowEmailShare] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveChatName, setSaveChatName] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef<number>(2);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
    const connectWebSocket = () => {
      if (socket) {
        socket.close();
      }
  
      const wsUrl = `ws://${window.location.hostname}:8080/ws/chat`;
      socket = new WebSocket(wsUrl);
  
      socket.onopen = () => {
        console.log('WebSocket connection established');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        fetchChatHistory();
      };
  
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'history') {
            setChatHistory(data.chats || []);
          }
          else if (data.type === 'share_link') {
            setShareUrl(data.url);
            setShowShareModal(true);
          }
          else if (data.type === 'email_share_result') {
            if (data.success) {
              alert('Chat shared successfully via email!');
            } else {
              alert('Failed to share chat via email. Please try again.');
            }
            setShowEmailShare(false);
          }
          else if (data.type === 'load_chat') {
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
              nextId.current = data.messages.length + 1;
              
              if (data.connection_id) {
                setIsConnected(true);
                setConnectionId(data.connection_id);
              } else {
                setIsConnected(false);
                setConnectionId(null);
              }
            }
          }
          else if (data.type === 'chat_saved') {
            if (data.chat_id) {
              setCurrentChatId(data.chat_id);
              fetchChatHistory();
              alert('Chat saved successfully!');
            }
          }
          else if (data.type === 'bot') {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: nextId.current++,
                type: 'bot',
                content: data.content,
                timestamp: new Date().toISOString(),
              },
            ]);
            setIsProcessing(false);
  
            if (data.content.includes('Connected to') && !data.content.includes('Not connected')) {
              setIsConnected(true);
              setConnectionId(data?.connection_id || extractConnectionId(data.content));
            }
  
            if (data.content.includes('connection closed') || data.content.includes('disconnected')) {
              setIsConnected(false);
              setConnectionId(null);
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
  
      socket.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        if (event.code !== 1000) {
          reconnectTimer = setTimeout(connectWebSocket, 3000);
        }
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      ws.current = socket;
    };
  
    connectWebSocket();
  
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
  
      if (socket) {
        socket.close(1000, "Component unmounting");
      }
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractConnectionId = (message: string): string => {
    const dbMatch = message.match(/Connected to \w+ database at (.+?):(.+?)\/(.+?)(?:$|\s)/);
    if (dbMatch && dbMatch[3]) {
      return dbMatch[3];
    }
    return 'database';
  };

  const generateDefaultChatName = (): string => {
    const queryMessages = messages.filter(msg => 
      msg.content.includes('SELECT') || 
      msg.content.includes('INSERT') || 
      msg.content.includes('UPDATE') || 
      msg.content.includes('Query results:')
    );
    
    if (queryMessages.length > 0) {
      const content = queryMessages[0].content;
      
      const tableMatch = content.match(/FROM\s+(\w+)/i);
      if (tableMatch && tableMatch[1]) {
        return `Query on ${tableMatch[1]} table`;
      }
      
      const anyTableMatch = content.match(/\b(\w+)\b\s+table/i);
      if (anyTableMatch && anyTableMatch[1]) {
        return `Query on ${anyTableMatch[1]} table`;
      }
      
      return "Database Query Chat";
    }
    
    const userMessages = messages.filter(msg => msg.type === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content.trim();
      
      if (firstMessage.length <= 30) {
        return firstMessage;
      }
      
      return firstMessage.substring(0, 27) + '...';
    }
    
    return `Database Chat - ${new Date().toLocaleString()}`;
  };

  const saveChat = () => {
    if (messages.length <= 1) {
      alert("There's no conversation to save yet.");
      return;
    }
    
    setSaveChatName(generateDefaultChatName());
    setShowSaveModal(true);
  };

  const handleSaveChat = () => {
    if (!saveChatName.trim()) {
      alert("Please enter a name for this chat");
      return;
    }
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'save_chat',
        messages: messages,
        connection_id: connectionId,
        name: saveChatName
      }));
      
      setShowSaveModal(false);
    } else {
      alert("Cannot connect to server. Please try again later.");
    }
  };

  const fetchChatHistory = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'request_history'
      }));
    }
  };

  const loadChat = (chatId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'load_chat',
        chat_id: chatId
      }));
      setCurrentChatId(chatId);
    }
  };

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this chat?")) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'delete_chat',
          chat_id: chatId
        }));
        
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        if (currentChatId === chatId) {
          setMessages([{
            id: 1,
            type: 'bot',
            content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
            timestamp: new Date().toISOString(),
          }]);
          setCurrentChatId(null);
          setIsConnected(false);
          setConnectionId(null);
          nextId.current = 2;
        }
      }
    }
  };

  const startNewChat = () => {
    setMessages([{
      id: 1,
      type: 'bot',
      content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
      timestamp: new Date().toISOString(),
    }]);
    setCurrentChatId(null);
    setIsConnected(false);
    setConnectionId(null);
    nextId.current = 2;
  };

  const shareViaEmail = () => {
    if (!shareEmail.trim() || !shareName.trim()) {
      alert("Please fill in all fields");
      return;
    }
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'share_email',
        chat_id: currentChatId,
        recipient_email: shareEmail,
        sender_name: shareName
      }));
    }
  };

  const parseConnectionDetails = (message: string): ConnectionDetails | null => {
    try {
      if (!message.toLowerCase().includes('host:')) {
        return null;
      }

      let lines = message.split(/[\n:]/).map(line => line.trim());
      
      const details: ConnectionDetails = {
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
        dbms: 'postgresql'
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase();
        
        if (line === 'host' && i + 1 < lines.length) {
          details.host = lines[i + 1];
        } 
        else if (line === 'port' && i + 1 < lines.length) {
          details.port = parseInt(lines[i + 1], 10);
        }
        else if (line === 'database' && i + 1 < lines.length) {
          details.database = lines[i + 1];
        }
        else if ((line === 'username' || line === 'user') && i + 1 < lines.length) {
          details.username = lines[i + 1];
        }
        else if ((line === 'password' || line === 'pass') && i + 1 < lines.length) {
          details.password = lines[i + 1];
        }
        else if (line === 'dbms' && i + 1 < lines.length) {
          details.dbms = lines[i + 1];
        }
      }

      return details;
    } catch (error) {
      console.error('Error parsing connection details:', error);
      return null;
    }
  };

  const processMessageContent = (message: Message) => {
    if (message.type === 'bot' && message.content.includes('Query results:')) {
      const parts = message.content.split('Query results:');
      const beforeHtml = parts[0];
      
      if (parts[1] && (parts[1].includes('<div') || parts[1].includes('<table'))) {
        return (
          <>
            <div className="whitespace-pre-wrap">{beforeHtml + 'Query results:'}</div>
            <div 
              className="mt-2 query-result-container" 
              dangerouslySetInnerHTML={{ __html: parts[1] }} 
            />
          </>
        );
      }
    }
    
    if (message.content.includes('```')) {
      const segments = message.content.split(/(```[\s\S]*?```)/g);
      
      return (
        <div className="whitespace-pre-wrap">
          {segments.map((segment, index) => {
            if (segment.startsWith('```') && segment.endsWith('```')) {
              const code = segment.substring(3, segment.length - 3);
              const language = code.split('\n')[0].trim();
              const codeContent = language ? code.substring(language.length).trim() : code;
              
              return (
                <pre key={index} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
                  <code>{codeContent}</code>
                </pre>
              );
            } else {
              return <span key={index}>{segment}</span>;
            }
          })}
        </div>
      );
    }
    
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const handleSendMessage = () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: nextId.current++,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const connectionDetails = parseConnectionDetails(input);
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageToSend: any = {
        id: userMessage.id,
        type: 'user',
        content: input,
        timestamp: userMessage.timestamp
      };
      
      if (currentChatId) {
        messageToSend.chat_id = currentChatId;
      }
      
      if (connectionDetails) {
        messageToSend.content = `Host: ${connectionDetails.host}\nPort: ${connectionDetails.port}\nDatabase: ${connectionDetails.database}\nUsername: ${connectionDetails.username}\nPassword: ${connectionDetails.password}\nDBMS: ${connectionDetails.dbms}`;
      }
      
      ws.current.send(JSON.stringify(messageToSend));
      setIsProcessing(true);
    }

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex">
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">History</h2>
            <button 
              onClick={startNewChat}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              New Chat
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {chatHistory.length === 0 && (
              <div className="text-sm text-gray-500 italic p-3">
                No chat history yet. Start a new conversation!
              </div>
            )}
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                  currentChatId === chat.id ? 'bg-gray-100 border border-indigo-300' : 'bg-gray-50'
                }`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-900 truncate">{chat.name}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{chat.date}</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => deleteChat(chat.id, e)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="py-2 px-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></div>
            <span className="text-sm font-medium text-gray-700 flex items-center">
              <Database className="h-4 w-4 mr-1" />
              {isConnected
                ? `Connected to ${connectionId}`
                : 'Not connected to database'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowEmailShare(true)}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              disabled={!currentChatId}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share via Email
            </button>
            <button
              onClick={saveChat}
              className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
              disabled={messages.length <= 1}
            >
              <Save className="h-4 w-4 mr-1" />
              Save Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 mr-1" />
                  ) : (
                    <Bot className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {processMessageContent(message)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message or SQL query..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              className={`p-2 rounded-r-md ${
                isProcessing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
              disabled={isProcessing}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {isProcessing && (
            <div className="mt-2 text-center text-sm text-gray-500">
              Processing your request...
            </div>
          )}
        </div>

        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">Save Chat</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chat Name
                  </label>
                  <input
                    type="text"
                    value={saveChatName}
                    onChange={(e) => setSaveChatName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter a name for this chat"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChat}
                    className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEmailShare && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">Share Chat via Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={shareName}
                    onChange={(e) => setShareName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="recipient@example.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowEmailShare(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={shareViaEmail}
                    className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-medium mb-4">Share Chat</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share this link with others to give them access to this chat:
                </p>
                <div className="flex">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl || ''}
                    className="flex-1 p-2 border border-gray-300 rounded-l"
                  />
                  <button
                    onClick={() => {
                      if (shareUrl) {
                        navigator.clipboard.writeText(shareUrl)
                          .then(() => alert('URL copied to clipboard'))
                          .catch(err => console.error('Failed to copy URL: ', err));
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 rounded-r text-white hover:bg-indigo-700"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChat;
