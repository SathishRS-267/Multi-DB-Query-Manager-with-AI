// import React, { useState } from 'react';
// import { Send, Bot, User } from 'lucide-react';

// const AIChat = () => {
//   const [messages] = useState([
//     {
//       id: 1,
//       type: 'user',
//       content: 'Connect to my PostgreSQL database',
//       timestamp: new Date().toISOString()
//     },
//     {
//       id: 2,
//       type: 'bot',
//       content: 'Sure! I can help you connect to PostgreSQL. Please provide the following credentials:\n- Host\n- Port\n- Database name\n- Username\n- Password',
//       timestamp: new Date().toISOString()
//     }
//   ]);

//   return (
//     <div className="h-[calc(100vh-7rem)] flex">
//       {/* Chat History Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">History</h2>
//           <div className="mt-4 space-y-2">
//             {['PostgreSQL Connection', 'Query Analysis', 'Schema Overview'].map((chat, index) => (
//               <div
//                 key={index}
//                 className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
//               >
//                 <p className="text-sm text-gray-900">{chat}</p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {new Date().toLocaleDateString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex items-start space-x-2 ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               {message.type === 'bot' && (
//                 <div className="flex-shrink-0">
//                   <Bot className="h-8 w-8 rounded-full bg-indigo-100 p-1 text-indigo-600" />
//                 </div>
//               )}
//               <div
//                 className={`rounded-lg p-4 max-w-lg ${
//                   message.type === 'user'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-white text-gray-900'
//                 }`}
//               >
//                 <p className="whitespace-pre-wrap">{message.content}</p>
//                 <p
//                   className={`text-xs mt-1 ${
//                     message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
//                   }`}
//                 >
//                   {new Date(message.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//               {message.type === 'user' && (
//                 <div className="flex-shrink-0">
//                   <User className="h-8 w-8 rounded-full bg-indigo-600 p-1 text-white" />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="p-4 bg-white border-t border-gray-200">
//           <div className="flex space-x-4">
//             <input
//               type="text"
//               placeholder="Ask anything about your database..."
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             />
//             <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AIChat;



// // AIChat.tsx - updated with better connection string parsing
// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User } from 'lucide-react';

// interface Message {
//   id: number;
//   type: 'user' | 'bot';
//   content: string;
//   timestamp: string;
// }

// interface ChatHistory {
//   id: number;
//   name: string;
//   date: string;
// }

// // Connection details interface
// interface ConnectionDetails {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   dbms: string;
// }

// const AIChat = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//       timestamp: new Date().toISOString(),
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionId, setConnectionId] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const ws = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const nextId = useRef<number>(2);

//   // Connect to WebSocket
//   // useEffect(() => {
//   //   const connectWebSocket = () => {
//   //     const wsUrl = 'ws://localhost:8080/ws/chat';
//   //     const socket = new WebSocket(wsUrl);

//   //     socket.onopen = () => {
//   //       console.log('WebSocket connection established');
//   //     };

//   //     socket.onmessage = (event) => {
//   //       const data = JSON.parse(event.data);
//   //       if (data.type === 'bot') {
//   //         // Add new message from bot
//   //         setMessages((prevMessages) => [
//   //           ...prevMessages,
//   //           {
//   //             id: nextId.current++,
//   //             type: 'bot',
//   //             content: data.content,
//   //             timestamp: new Date().toISOString(),
//   //           },
//   //         ]);
//   //         setIsProcessing(false);

//   //         // Check if this is a connection success message
//   //         if (data.content.includes('Successfully connected')) {
//   //           setIsConnected(true);
//   //           setConnectionId(data?.connection_id || 'default');
            
//   //           // Add new chat to history
//   //           const newChatName = `Database Connection ${new Date().toLocaleTimeString()}`;
//   //           setChatHistory((prev) => [
//   //             ...prev,
//   //             {
//   //               id: Date.now(),
//   //               name: newChatName,
//   //               date: new Date().toLocaleDateString(),
//   //             },
//   //           ]);
//   //         }

//   //         // Check if this is a disconnect message
//   //         if (data.content.includes('connection closed')) {
//   //           setIsConnected(false);
//   //           setConnectionId(null);
//   //         }
//   //       }
//   //     };

//   //     socket.onclose = () => {
//   //       console.log('WebSocket connection closed');
//   //       // Try to reconnect after a delay
//   //       setTimeout(connectWebSocket, 3000);
//   //     };

//   //     socket.onerror = (error) => {
//   //       console.error('WebSocket error:', error);
//   //     };

//   //     ws.current = socket;
//   //   };

//   //   connectWebSocket();

//   //   // Cleanup on component unmount
//   //   return () => {
//   //     if (ws.current) {
//   //       ws.current.close();
//   //     }
//   //   };
//   // }, []);

//   useEffect(() => {
//     let socket: WebSocket | null = null;
//     let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
//     const connectWebSocket = () => {
//       if (socket) {
//         socket.close();
//       }
  
//       socket = new WebSocket('ws://localhost:8080/ws/chat');
  
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//         if (reconnectTimer) {
//           clearTimeout(reconnectTimer);
//           reconnectTimer = null;
//         }
//       };
  
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           if (data.type === 'bot') {
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               {
//                 id: nextId.current++,
//                 type: 'bot',
//                 content: data.content,
//                 timestamp: new Date().toISOString(),
//               },
//             ]);
//             setIsProcessing(false);
  
//             if (data.content.includes('Successfully connected')) {
//               setIsConnected(true);
//               setConnectionId(data?.connection_id || 'default');
  
//               const newChatName = `Database Connection ${new Date().toLocaleTimeString()}`;
//               setChatHistory((prev) => [
//                 ...prev,
//                 {
//                   id: Date.now(),
//                   name: newChatName,
//                   date: new Date().toLocaleDateString(),
//                 },
//               ]);
//             }
  
//             if (data.content.includes('connection closed')) {
//               setIsConnected(false);
//               setConnectionId(null);
//             }
//           }
//         } catch (e) {
//           console.error('Error parsing WebSocket message:', e);
//         }
//       };
  
//       socket.onclose = (event) => {
//         console.log('WebSocket connection closed', event.code, event.reason);
//         if (event.code !== 1000) {
//           reconnectTimer = setTimeout(connectWebSocket, 3000);
//         }
//       };
  
//       socket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
  
//       ws.current = socket;
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (reconnectTimer) {
//         clearTimeout(reconnectTimer);
//       }
  
//       if (socket) {
//         socket.close(1000, "Component unmounting");
//       }
//     };
//   }, []);
  
//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Load chat history
//   useEffect(() => {
//     // In a real app, you would fetch this from API/localStorage
//     setChatHistory([
//       {
//         id: 1,
//         name: 'PostgreSQL Connection',
//         date: new Date().toLocaleDateString(),
//       },
//       {
//         id: 2,
//         name: 'Query Analysis',
//         date: new Date().toLocaleDateString(),
//       },
//       {
//         id: 3,
//         name: 'Schema Overview',
//         date: new Date().toLocaleDateString(),
//       },
//     ]);
//   }, []);

//   // Parse connection details from message
//   const parseConnectionDetails = (message: string): ConnectionDetails | null => {
//     try {
//       // First check if this is a properly formatted connection request
//       if (!message.toLowerCase().includes('host:')) {
//         return null;
//       }

//       // Split the input by common delimiters
//       let lines = message.split(/[\n:]/).map(line => line.trim());
      
//       // Initialize connection details with defaults
//       const details: ConnectionDetails = {
//         host: 'localhost',
//         port: 5432,
//         database: '',
//         username: '',
//         password: '',
//         dbms: 'postgresql'
//       };

//       // Parse each parameter
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].toLowerCase();
        
//         if (line === 'host' && i + 1 < lines.length) {
//           details.host = lines[i + 1];
//         } 
//         else if (line === 'port' && i + 1 < lines.length) {
//           details.port = parseInt(lines[i + 1], 10);
//         }
//         else if (line === 'database' && i + 1 < lines.length) {
//           details.database = lines[i + 1];
//         }
//         else if ((line === 'username' || line === 'user') && i + 1 < lines.length) {
//           details.username = lines[i + 1];
//         }
//         else if ((line === 'password' || line === 'pass') && i + 1 < lines.length) {
//           details.password = lines[i + 1];
//         }
//         else if (line === 'dbms' && i + 1 < lines.length) {
//           details.dbms = lines[i + 1];
//         }
//       }

//       return details;
//     } catch (error) {
//       console.error('Error parsing connection details:', error);
//       return null;
//     }
//   };

//   const handleSendMessage = () => {
//     if (!input.trim() || isProcessing) return;

//     // Add user message
//     const userMessage: Message = {
//       id: nextId.current++,
//       type: 'user',
//       content: input,
//       timestamp: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
    
//     // Check if this is a connection request with details
//     const connectionDetails = parseConnectionDetails(input);
    
//     // Send message to WebSocket
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       if (connectionDetails) {
//         // Format the connection details properly before sending
//         const formattedMessage = {
//           id: userMessage.id,
//           type: 'user',
//           content: `Host: ${connectionDetails.host}\nPort: ${connectionDetails.port}\nDatabase: ${connectionDetails.database}\nUsername: ${connectionDetails.username}\nPassword: ${connectionDetails.password}\nDBMS: ${connectionDetails.dbms}`,
//           timestamp: userMessage.timestamp
//         };
//         ws.current.send(JSON.stringify(formattedMessage));
//       } else {
//         // Send the original message
//         ws.current.send(JSON.stringify(userMessage));
//       }
//       setIsProcessing(true);
//     }

//     setInput('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="h-[calc(100vh-7rem)] flex">
//       {/* Chat History Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">History</h2>
//           <div className="mt-4 space-y-2">
//             {chatHistory.map((chat) => (
//               <div
//                 key={chat.id}
//                 className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
//               >
//                 <p className="text-sm text-gray-900">{chat.name}</p>
//                 <p className="text-xs text-gray-500 mt-1">{chat.date}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {/* Connection Status */}
//         <div className="py-2 px-4 bg-white border-b border-gray-200">
//           <div className="flex items-center">
//             <div
//               className={`w-3 h-3 rounded-full mr-2 ${
//                 isConnected ? 'bg-green-500' : 'bg-gray-400'
//               }`}
//             ></div>
//             <span className="text-sm font-medium text-gray-700">
//               {isConnected
//                 ? `Connected to database (${connectionId})`
//                 : 'Not connected'}
//             </span>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex items-start space-x-2 ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               {message.type === 'bot' && (
//                 <div className="flex-shrink-0">
//                   <Bot className="h-8 w-8 rounded-full bg-indigo-100 p-1 text-indigo-600" />
//                 </div>
//               )}
//               <div
//                 className={`rounded-lg p-4 max-w-lg ${
//                   message.type === 'user'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-white text-gray-900'
//                 }`}
//               >
//                 <p className="whitespace-pre-wrap">{message.content}</p>
//                 <p
//                   className={`text-xs mt-1 ${
//                     message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
//                   }`}
//                 >
//                   {new Date(message.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//               {message.type === 'user' && (
//                 <div className="flex-shrink-0">
//                   <User className="h-8 w-8 rounded-full bg-indigo-600 p-1 text-white" />
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 bg-white border-t border-gray-200">
//           <div className="flex space-x-4">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask anything about your database..."
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               disabled={isProcessing}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={isProcessing || !input.trim()}
//               className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                 isProcessing || !input.trim()
//                   ? 'bg-indigo-400 cursor-not-allowed'
//                   : 'bg-indigo-600 hover:bg-indigo-700'
//               }`}
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AIChat;




// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User, Share2, Clock, Trash2 } from 'lucide-react';

// interface Message {
//   id: number;
//   type: 'user' | 'bot';
//   content: string;
//   timestamp: string;
// }

// interface ChatHistory {
//   id: string;
//   name: string;
//   date: string;
// }

// // Connection details interface
// interface ConnectionDetails {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   dbms: string;
// }

// const AIChat = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//       timestamp: new Date().toISOString(),
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionId, setConnectionId] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [currentChatId, setCurrentChatId] = useState<string | null>(null);
//   const [shareUrl, setShareUrl] = useState<string | null>(null);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const ws = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const nextId = useRef<number>(2);

//   useEffect(() => {
//     let socket: WebSocket | null = null;
//     let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
//     const connectWebSocket = () => {
//       if (socket) {
//         socket.close();
//       }
  
//       socket = new WebSocket('ws://localhost:8080/ws/chat');
  
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//         if (reconnectTimer) {
//           clearTimeout(reconnectTimer);
//           reconnectTimer = null;
//         }
//         // Request chat history on connection
//         fetchChatHistory();
//       };
  
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           if (data.type === 'history') {
//             // Handle chat history response
//             setChatHistory(data.chats || []);
//           }
//           else if (data.type === 'share_link') {
//             // Handle share link response
//             setShareUrl(data.url);
//             setShowShareModal(true);
//           }
//           else if (data.type === 'load_chat') {
//             // Handle loaded chat messages
//             if (data.messages && Array.isArray(data.messages)) {
//               setMessages(data.messages);
//               nextId.current = data.messages.length + 1;
              
//               // Update connection status if this chat has an active connection
//               if (data.connection_id) {
//                 setIsConnected(true);
//                 setConnectionId(data.connection_id);
//               } else {
//                 setIsConnected(false);
//                 setConnectionId(null);
//               }
//             }
//           }
//           else if (data.type === 'bot') {
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               {
//                 id: nextId.current++,
//                 type: 'bot',
//                 content: data.content,
//                 timestamp: new Date().toISOString(),
//               },
//             ]);
//             setIsProcessing(false);
  
//             if (data.content.includes('Successfully connected')) {
//               setIsConnected(true);
//               setConnectionId(data?.connection_id || 'default');
//             }
  
//             if (data.content.includes('connection closed')) {
//               setIsConnected(false);
//               setConnectionId(null);
//             }
//           }
//         } catch (e) {
//           console.error('Error parsing WebSocket message:', e);
//         }
//       };
  
//       socket.onclose = (event) => {
//         console.log('WebSocket connection closed', event.code, event.reason);
//         if (event.code !== 1000) {
//           reconnectTimer = setTimeout(connectWebSocket, 3000);
//         }
//       };
  
//       socket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
  
//       ws.current = socket;
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (reconnectTimer) {
//         clearTimeout(reconnectTimer);
//       }
  
//       if (socket) {
//         socket.close(1000, "Component unmounting");
//       }
//     };
//   }, []);
  
//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Fetch chat history from backend
//   const fetchChatHistory = () => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'request_history'
//       }));
//     }
//   };

//   // Load specific chat by ID
//   const loadChat = (chatId: string) => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'load_chat',
//         chat_id: chatId
//       }));
//       setCurrentChatId(chatId);
//     }
//   };

//   // Delete chat by ID
//   const deleteChat = (chatId: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent triggering the chat selection
    
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'delete_chat',
//         chat_id: chatId
//       }));
      
//       // Update local state
//       setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      
//       // If we're deleting the current chat, reset the interface
//       if (currentChatId === chatId) {
//         setMessages([{
//           id: 1,
//           type: 'bot',
//           content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//           timestamp: new Date().toISOString(),
//         }]);
//         setCurrentChatId(null);
//         setIsConnected(false);
//         setConnectionId(null);
//         nextId.current = 2;
//       }
//     }
//   };

//   // Start a new chat
//   const startNewChat = () => {
//     setMessages([{
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//       timestamp: new Date().toISOString(),
//     }]);
//     setCurrentChatId(null);
//     setIsConnected(false);
//     setConnectionId(null);
//     nextId.current = 2;
//   };

//   // Share chat
//   const shareChat = () => {
//     if (!currentChatId) {
//       // If no chat is currently loaded, first save the current conversation
//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify({
//           type: 'save_chat',
//           messages: messages,
//           connection_id: connectionId
//         }));
//       }
//     } else {
//       // Request share link for the current chat
//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify({
//           type: 'share_chat',
//           chat_id: currentChatId
//         }));
//       }
//     }
//   };

//   // Copy share URL to clipboard
//   const copyShareUrl = () => {
//     if (shareUrl) {
//       navigator.clipboard.writeText(shareUrl)
//         .then(() => {
//           // Show feedback that URL was copied (could use a toast notification in a real app)
//           console.log('URL copied to clipboard');
//         })
//         .catch(err => {
//           console.error('Failed to copy URL: ', err);
//         });
//     }
//   };

//   // Parse connection details from message
//   const parseConnectionDetails = (message: string): ConnectionDetails | null => {
//     try {
//       // First check if this is a properly formatted connection request
//       if (!message.toLowerCase().includes('host:')) {
//         return null;
//       }

//       // Split the input by common delimiters
//       let lines = message.split(/[\n:]/).map(line => line.trim());
      
//       // Initialize connection details with defaults
//       const details: ConnectionDetails = {
//         host: 'localhost',
//         port: 5432,
//         database: '',
//         username: '',
//         password: '',
//         dbms: 'postgresql'
//       };

//       // Parse each parameter
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].toLowerCase();
        
//         if (line === 'host' && i + 1 < lines.length) {
//           details.host = lines[i + 1];
//         } 
//         else if (line === 'port' && i + 1 < lines.length) {
//           details.port = parseInt(lines[i + 1], 10);
//         }
//         else if (line === 'database' && i + 1 < lines.length) {
//           details.database = lines[i + 1];
//         }
//         else if ((line === 'username' || line === 'user') && i + 1 < lines.length) {
//           details.username = lines[i + 1];
//         }
//         else if ((line === 'password' || line === 'pass') && i + 1 < lines.length) {
//           details.password = lines[i + 1];
//         }
//         else if (line === 'dbms' && i + 1 < lines.length) {
//           details.dbms = lines[i + 1];
//         }
//       }

//       return details;
//     } catch (error) {
//       console.error('Error parsing connection details:', error);
//       return null;
//     }
//   };

//   // Helper function to process message content
//   const processMessageContent = (message: Message) => {
//     // Check if content contains query results with HTML
//     if (message.type === 'bot' && message.content.includes('Query results:')) {
//       const parts = message.content.split('Query results:');
//       const beforeHtml = parts[0];
      
//       // Check if there's HTML content after "Query results:"
//       if (parts[1] && (parts[1].includes('<div') || parts[1].includes('<table'))) {
//         return (
//           <>
//             <div className="whitespace-pre-wrap">{beforeHtml + 'Query results:'}</div>
//             <div 
//               className="mt-2 query-result-container" 
//               dangerouslySetInnerHTML={{ __html: parts[1] }} 
//             />
//           </>
//         );
//       }
//     }
    
//     // For code blocks, we need to preserve formatting
//     if (message.content.includes('```')) {
//       const segments = message.content.split(/(```[\s\S]*?```)/g);
      
//       return (
//         <div className="whitespace-pre-wrap">
//           {segments.map((segment, index) => {
//             if (segment.startsWith('```') && segment.endsWith('```')) {
//               // Code block rendering
//               const code = segment.substring(3, segment.length - 3);
//               // Extract language if specified
//               const language = code.split('\n')[0].trim();
//               const codeContent = language ? code.substring(language.length).trim() : code;
              
//               return (
//                 <pre key={index} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
//                   <code>{codeContent}</code>
//                 </pre>
//               );
//             } else {
//               // Regular text
//               return <span key={index}>{segment}</span>;
//             }
//           })}
//         </div>
//       );
//     }
    
//     // Regular message without special formatting
//     return <div className="whitespace-pre-wrap">{message.content}</div>;
//   };

//   const handleSendMessage = () => {
//     if (!input.trim() || isProcessing) return;

//     // Add user message
//     const userMessage: Message = {
//       id: nextId.current++,
//       type: 'user',
//       content: input,
//       timestamp: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
    
//     // Check if this is a connection request with details
//     const connectionDetails = parseConnectionDetails(input);
    
//     // Send message to WebSocket
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       const messageToSend: any = {
//         id: userMessage.id,
//         type: 'user',
//         content: input,
//         timestamp: userMessage.timestamp
//       };
      
//       // If we have a current chat ID, include it
//       if (currentChatId) {
//         messageToSend.chat_id = currentChatId;
//       }
      
//       // If this is a connection request, format it specially
//       if (connectionDetails) {
//         messageToSend.content = `Host: ${connectionDetails.host}\nPort: ${connectionDetails.port}\nDatabase: ${connectionDetails.database}\nUsername: ${connectionDetails.username}\nPassword: ${connectionDetails.password}\nDBMS: ${connectionDetails.dbms}`;
//       }
      
//       ws.current.send(JSON.stringify(messageToSend));
//       setIsProcessing(true);
//     }

//     setInput('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="h-[calc(100vh-7rem)] flex">
//       {/* Chat History Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-medium text-gray-900">History</h2>
//             <button 
//               onClick={startNewChat}
//               className="text-sm text-indigo-600 hover:text-indigo-800"
//             >
//               New Chat
//             </button>
//           </div>
//           <div className="mt-4 space-y-2">
//             {chatHistory.map((chat) => (
//               <div
//                 key={chat.id}
//                 className={`p-3 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
//                   currentChatId === chat.id ? 'bg-gray-100 border border-indigo-300' : 'bg-gray-50'
//                 }`}
//                 onClick={() => loadChat(chat.id)}
//               >
//                 <div className="flex-1 overflow-hidden">
//                   <p className="text-sm text-gray-900 truncate">{chat.name}</p>
//                   <div className="flex items-center text-xs text-gray-500 mt-1">
//                     <Clock className="h-3 w-3 mr-1" />
//                     <span>{chat.date}</span>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={(e) => deleteChat(chat.id, e)}
//                   className="text-gray-400 hover:text-red-500 p-1"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {/* Connection Status & Actions */}
//         <div className="py-2 px-4 bg-white border-b border-gray-200 flex justify-between items-center">
//           <div className="flex items-center">
//             <div
//               className={`w-3 h-3 rounded-full mr-2 ${
//                 isConnected ? 'bg-green-500' : 'bg-gray-400'
//               }`}
//             ></div>
//             <span className="text-sm font-medium text-gray-700">
//               {isConnected
//                 ? `Connected to database (${connectionId})`
//                 : 'Not connected'}
//             </span>
//           </div>
          
//           <button
//             onClick={shareChat}
//             className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
//           >
//             <Share2 className="h-4 w-4 mr-1" />
//             Share Chat
//           </button>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex items-start space-x-2 ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               {message.type === 'bot' && (
//                 <div className="flex-shrink-0">
//                   <Bot className="h-8 w-8 rounded-full bg-indigo-100 p-1 text-indigo-600" />
//                 </div>
//               )}
//               <div
//                 className={`rounded-lg p-4 max-w-lg overflow-auto ${
//                   message.type === 'user'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-white text-gray-900'
//                 }`}
//                 style={{ maxWidth: message.type === 'bot' ? '80%' : 'auto' }}
//               >
//                 {processMessageContent(message)}
//                 <p
//                   className={`text-xs mt-2 ${
//                     message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
//                   }`}
//                 >
//                   {new Date(message.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//               {message.type === 'user' && (
//                 <div className="flex-shrink-0">
//                   <User className="h-8 w-8 rounded-full bg-indigo-600 p-1 text-white" />
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 bg-white border-t border-gray-200">
//           <div className="flex space-x-4">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask anything about your database..."
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               disabled={isProcessing}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={isProcessing || !input.trim()}
//               className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                 isProcessing || !input.trim()
//                   ? 'bg-indigo-400 cursor-not-allowed'
//                   : 'bg-indigo-600 hover:bg-indigo-700'
//               }`}
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white rounded-lg p-6 w-96">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Share Chat</h3>
//             <div className="mb-4">
//               <p className="text-sm text-gray-500 mb-2">Anyone with this link can view this chat:</p>
//               <div className="flex">
//                 <input 
//                   type="text" 
//                   readOnly 
//                   value={shareUrl || ''} 
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
//                 />
//                 <button
//                   onClick={copyShareUrl}
//                   className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 text-sm"
//                 >
//                   Copy
//                 </button>
//               </div>
//             </div>
//             <div className="flex justify-end">
//               <button
//                 onClick={() => setShowShareModal(false)}
//                 className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
      
//       {/* Global styles for query results */}
//       <style>{`
//         .query-result-container .table-container {
//           overflow-x: auto;
//           margin: 1rem 0;
//         }
//         .query-result-container .query-results {
//           border-collapse: collapse;
//           width: 100%;
//           font-family: sans-serif;
//         }
//         .query-result-container .query-results th,
//         .query-result-container .query-results td {
//           border: 1px solid #ddd;
//           padding: 8px;
//           text-align: left;
//         }
//         .query-result-container .query-results tr:nth-child(even) {
//           background-color: #f2f2f2;
//         }
//         .query-result-container .query-results th {
//           padding-top: 12px;
//           padding-bottom: 12px;
//           background-color: #4CAF50;
//           color: white;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AIChat;
//corrected

// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User, Share2, Clock, Trash2, Database } from 'lucide-react';

// interface Message {
//   id: number;
//   type: 'user' | 'bot';
//   content: string;
//   timestamp: string;
// }

// interface ChatHistory {
//   id: string;
//   name: string;
//   date: string;
// }

// // Connection details interface
// interface ConnectionDetails {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   dbms: string;
// }

// const AIChat = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you to query databases.',
//       timestamp: new Date().toISOString(),
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionId, setConnectionId] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [currentChatId, setCurrentChatId] = useState<string | null>(null);
//   const [shareUrl, setShareUrl] = useState<string | null>(null);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [shareEmail, setShareEmail] = useState('');
//   const [shareName, setShareName] = useState('');
//   const [showEmailShare, setShowEmailShare] = useState(false);
//   const ws = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const nextId = useRef<number>(2);

//   useEffect(() => {
//     let socket: WebSocket | null = null;
//     let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
//     const connectWebSocket = () => {
//       if (socket) {
//         socket.close();
//       }
  
//       socket = new WebSocket('ws://localhost:8080/ws/chat');
  
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//         if (reconnectTimer) {
//           clearTimeout(reconnectTimer);
//           reconnectTimer = null;
//         }
//         // Request chat history on connection
//         fetchChatHistory();
//       };
  
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           if (data.type === 'history') {
//             // Handle chat history response
//             setChatHistory(data.chats || []);
//           }
//           else if (data.type === 'share_link') {
//             // Handle share link response
//             setShareUrl(data.url);
//             setShowShareModal(true);
//           }
//           else if (data.type === 'email_share_result') {
//             // Handle email share result
//             if (data.success) {
//               alert('Chat shared successfully via email!');
//             } else {
//               alert('Failed to share chat via email. Please try again.');
//             }
//             setShowEmailShare(false);
//           }
//           else if (data.type === 'load_chat') {
//             // Handle loaded chat messages
//             if (data.messages && Array.isArray(data.messages)) {
//               setMessages(data.messages);
//               nextId.current = data.messages.length + 1;
              
//               // Update connection status if this chat has an active connection
//               if (data.connection_id) {
//                 setIsConnected(true);
//                 setConnectionId(data.connection_id);
//               } else {
//                 setIsConnected(false);
//                 setConnectionId(null);
//               }
//             }
//           }
//           else if (data.type === 'chat_saved') {
//             // Handle chat saved confirmation
//             if (data.chat_id) {
//               setCurrentChatId(data.chat_id);
//               // Refresh the chat history
//               fetchChatHistory();
//             }
//           }
//           else if (data.type === 'bot') {
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               {
//                 id: nextId.current++,
//                 type: 'bot',
//                 content: data.content,
//                 timestamp: new Date().toISOString(),
//               },
//             ]);
//             setIsProcessing(false);
  
//             // Update connection status based on message content
//             if (data.content.includes('Connected to') && !data.content.includes('Not connected')) {
//               setIsConnected(true);
//               setConnectionId(data?.connection_id || extractConnectionId(data.content));
//             }
  
//             if (data.content.includes('connection closed') || data.content.includes('disconnected')) {
//               setIsConnected(false);
//               setConnectionId(null);
//             }
            
//             // If there are chat results in the message, extract a good name for the chat
//             if (!currentChatId && prevMessagesContainQuery(messages)) {
//               saveChatWithGeneratedName();
//             }
//           }
//         } catch (e) {
//           console.error('Error parsing WebSocket message:', e);
//         }
//       };
  
//       socket.onclose = (event) => {
//         console.log('WebSocket connection closed', event.code, event.reason);
//         if (event.code !== 1000) {
//           reconnectTimer = setTimeout(connectWebSocket, 3000);
//         }
//       };
  
//       socket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
  
//       ws.current = socket;
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (reconnectTimer) {
//         clearTimeout(reconnectTimer);
//       }
  
//       if (socket) {
//         socket.close(1000, "Component unmounting");
//       }
//     };
//   }, []);
  
//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Extract connection ID from message
//   const extractConnectionId = (message: string): string => {
//     // Try to extract database name from connection message
//     const dbMatch = message.match(/Connected to \w+ database at (.+?):(.+?)\/(.+?)(?:$|\s)/);
//     if (dbMatch && dbMatch[3]) {
//       return dbMatch[3]; // Return the database name
//     }
//     return 'database';
//   };

//   // Check if previous messages contain a database query
//   const prevMessagesContainQuery = (messages: Message[]): boolean => {
//     return messages.some(msg => 
//       msg.type === 'bot' && 
//       (msg.content.includes('Query results:') || msg.content.includes('I\'ll run this query for you:'))
//     );
//   };

//   // Generate a meaningful name for the chat based on message content
//   const generateChatName = (): string => {
//     // First try to find a query
//     const queryMessages = messages.filter(msg => 
//       msg.content.includes('SELECT') || 
//       msg.content.includes('INSERT') || 
//       msg.content.includes('UPDATE') || 
//       msg.content.includes('Query results:')
//     );
    
//     if (queryMessages.length > 0) {
//       // Extract the first SELECT statement or table name
//       const content = queryMessages[0].content;
      
//       // Extract table name from SELECT query
//       const tableMatch = content.match(/FROM\s+(\w+)/i);
//       if (tableMatch && tableMatch[1]) {
//         return `Query on ${tableMatch[1]} table`;
//       }
      
//       // Extract any first table name
//       const anyTableMatch = content.match(/\b(\w+)\b\s+table/i);
//       if (anyTableMatch && anyTableMatch[1]) {
//         return `Query on ${anyTableMatch[1]} table`;
//       }
      
//       return "Database Query Chat";
//     }
    
//     // Try to extract keywords from user questions
//     const userMessages = messages.filter(msg => msg.type === 'user');
//     if (userMessages.length > 0) {
//       const firstMessage = userMessages[0].content.trim();
      
//       // If first message is short enough, use it directly
//       if (firstMessage.length <= 30) {
//         return firstMessage;
//       }
      
//       // Otherwise truncate it
//       return firstMessage.substring(0, 27) + '...';
//     }
    
//     // Default to timestamp
//     return `Database Chat - ${new Date().toLocaleString()}`;
//   };

//   // Save the current chat with a generated name
//   const saveChatWithGeneratedName = () => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN && messages.length > 1) {
//       const chatName = generateChatName();
      
//       ws.current.send(JSON.stringify({
//         type: 'save_chat',
//         messages: messages,
//         connection_id: connectionId,
//         name: chatName
//       }));
//     }
//   };

//   // Fetch chat history from backend
//   const fetchChatHistory = () => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'request_history'
//       }));
//     }
//   };

//   // Load specific chat by ID
//   const loadChat = (chatId: string) => {
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'load_chat',
//         chat_id: chatId
//       }));
//       setCurrentChatId(chatId);
//     }
//   };

//   // Delete chat by ID
//   const deleteChat = (chatId: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent triggering the chat selection
    
//     if (window.confirm("Are you sure you want to delete this chat?")) {
//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify({
//           type: 'delete_chat',
//           chat_id: chatId
//         }));
        
//         // Update local state
//         setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
//         // If we're deleting the current chat, reset the interface
//         if (currentChatId === chatId) {
//           setMessages([{
//             id: 1,
//             type: 'bot',
//             content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//             timestamp: new Date().toISOString(),
//           }]);
//           setCurrentChatId(null);
//           setIsConnected(false);
//           setConnectionId(null);
//           nextId.current = 2;
//         }
//       }
//     }
//   };

//   // Start a new chat
//   const startNewChat = () => {
//     setMessages([{
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//       timestamp: new Date().toISOString(),
//     }]);
//     setCurrentChatId(null);
//     setIsConnected(false);
//     setConnectionId(null);
//     nextId.current = 2;
//   };

//   // Share chat via link
//   const shareChat = () => {
//     if (!currentChatId) {
//       // If no chat is currently loaded, first save the current conversation
//       saveChatWithGeneratedName();
//     } else {
//       // Request share link for the current chat
//       if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//         ws.current.send(JSON.stringify({
//           type: 'share_chat',
//           chat_id: currentChatId
//         }));
//       }
//     }
//   };

//   // Share chat via email
//   const shareViaEmail = () => {
//     if (!shareEmail.trim() || !shareName.trim()) {
//       alert("Please fill in all fields");
//       return;
//     }
    
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       ws.current.send(JSON.stringify({
//         type: 'share_email',
//         chat_id: currentChatId,
//         recipient_email: shareEmail,
//         sender_name: shareName
//       }));
//     }
//   };

//   // Copy share URL to clipboard
//   const copyShareUrl = () => {
//     if (shareUrl) {
//       navigator.clipboard.writeText(shareUrl)
//         .then(() => {
//           alert('URL copied to clipboard');
//         })
//         .catch(err => {
//           console.error('Failed to copy URL: ', err);
//         });
//     }
//   };

//   // Parse connection details from message
//   const parseConnectionDetails = (message: string): ConnectionDetails | null => {
//     try {
//       // First check if this is a properly formatted connection request
//       if (!message.toLowerCase().includes('host:')) {
//         return null;
//       }

//       // Split the input by common delimiters
//       let lines = message.split(/[\n:]/).map(line => line.trim());
      
//       // Initialize connection details with defaults
//       const details: ConnectionDetails = {
//         host: 'localhost',
//         port: 5432,
//         database: '',
//         username: '',
//         password: '',
//         dbms: 'postgresql'
//       };

//       // Parse each parameter
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].toLowerCase();
        
//         if (line === 'host' && i + 1 < lines.length) {
//           details.host = lines[i + 1];
//         } 
//         else if (line === 'port' && i + 1 < lines.length) {
//           details.port = parseInt(lines[i + 1], 10);
//         }
//         else if (line === 'database' && i + 1 < lines.length) {
//           details.database = lines[i + 1];
//         }
//         else if ((line === 'username' || line === 'user') && i + 1 < lines.length) {
//           details.username = lines[i + 1];
//         }
//         else if ((line === 'password' || line === 'pass') && i + 1 < lines.length) {
//           details.password = lines[i + 1];
//         }
//         else if (line === 'dbms' && i + 1 < lines.length) {
//           details.dbms = lines[i + 1];
//         }
//       }

//       return details;
//     } catch (error) {
//       console.error('Error parsing connection details:', error);
//       return null;
//     }
//   };

//   // Helper function to process message content
//   const processMessageContent = (message: Message) => {
//     // Check if content contains query results with HTML
//     if (message.type === 'bot' && message.content.includes('Query results:')) {
//       const parts = message.content.split('Query results:');
//       const beforeHtml = parts[0];
      
//       // Check if there's HTML content after "Query results:"
//       if (parts[1] && (parts[1].includes('<div') || parts[1].includes('<table'))) {
//         return (
//           <>
//             <div className="whitespace-pre-wrap">{beforeHtml + 'Query results:'}</div>
//             <div 
//               className="mt-2 query-result-container" 
//               dangerouslySetInnerHTML={{ __html: parts[1] }} 
//             />
//           </>
//         );
//       }
//     }
    
//     // For code blocks, we need to preserve formatting
//     if (message.content.includes('```')) {
//       const segments = message.content.split(/(```[\s\S]*?```)/g);
      
//       return (
//         <div className="whitespace-pre-wrap">
//           {segments.map((segment, index) => {
//             if (segment.startsWith('```') && segment.endsWith('```')) {
//               // Code block rendering
//               const code = segment.substring(3, segment.length - 3);
//               // Extract language if specified
//               const language = code.split('\n')[0].trim();
//               const codeContent = language ? code.substring(language.length).trim() : code;
              
//               return (
//                 <pre key={index} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
//                   <code>{codeContent}</code>
//                 </pre>
//               );
//             } else {
//               // Regular text
//               return <span key={index}>{segment}</span>;
//             }
//           })}
//         </div>
//       );
//     }
    
//     // Regular message without special formatting
//     return <div className="whitespace-pre-wrap">{message.content}</div>;
//   };

//   const handleSendMessage = () => {
//     if (!input.trim() || isProcessing) return;

//     // Add user message
//     const userMessage: Message = {
//       id: nextId.current++,
//       type: 'user',
//       content: input,
//       timestamp: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
    
//     // Check if this is a connection request with details
//     const connectionDetails = parseConnectionDetails(input);
    
//     // Send message to WebSocket
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       const messageToSend: any = {
//         id: userMessage.id,
//         type: 'user',
//         content: input,
//         timestamp: userMessage.timestamp
//       };
      
//       // If we have a current chat ID, include it
//       if (currentChatId) {
//         messageToSend.chat_id = currentChatId;
//       }
      
//       // If this is a connection request, format it specially
//       if (connectionDetails) {
//         messageToSend.content = `Host: ${connectionDetails.host}\nPort: ${connectionDetails.port}\nDatabase: ${connectionDetails.database}\nUsername: ${connectionDetails.username}\nPassword: ${connectionDetails.password}\nDBMS: ${connectionDetails.dbms}`;
//       }
      
//       ws.current.send(JSON.stringify(messageToSend));
//       setIsProcessing(true);
//     }

//     setInput('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="h-[calc(100vh-7rem)] flex">
//       {/* Chat History Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-lg font-medium text-gray-900">History</h2>
//             <button 
//               onClick={startNewChat}
//               className="text-sm text-indigo-600 hover:text-indigo-800"
//             >
//               New Chat
//             </button>
//           </div>
//           <div className="mt-4 space-y-2">
//             {chatHistory.length === 0 && (
//               <div className="text-sm text-gray-500 italic p-3">
//                 No chat history yet. Start a new conversation!
//               </div>
//             )}
//             {chatHistory.map((chat) => (
//               <div
//                 key={chat.id}
//                 className={`p-3 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
//                   currentChatId === chat.id ? 'bg-gray-100 border border-indigo-300' : 'bg-gray-50'
//                 }`}
//                 onClick={() => loadChat(chat.id)}
//               >
//                 <div className="flex-1 overflow-hidden">
//                   <p className="text-sm text-gray-900 truncate">{chat.name}</p>
//                   <div className="flex items-center text-xs text-gray-500 mt-1">
//                     <Clock className="h-3 w-3 mr-1" />
//                     <span>{chat.date}</span>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={(e) => deleteChat(chat.id, e)}
//                   className="text-gray-400 hover:text-red-500 p-1"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {/* Connection Status & Actions */}
//         <div className="py-2 px-4 bg-white border-b border-gray-200 flex justify-between items-center">
//           <div className="flex items-center">
//             <div
//               className={`w-3 h-3 rounded-full mr-2 ${
//                 isConnected ? 'bg-green-500' : 'bg-gray-400'
//               }`}
//             ></div>
//             <span className="text-sm font-medium text-gray-700 flex items-center">
//               <Database className="h-4 w-4 mr-1" />
//               {isConnected
//                 ? `Connected to ${connectionId}`
//                 : 'Not connected to database'}
//             </span>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setShowEmailShare(true)}
//               className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
//               disabled={!currentChatId}
//             >
//               <Share2 className="h-4 w-4 mr-1" />
//               Share via Email
//             </button>
//             <button
//               onClick={shareChat}
//               className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
//               disabled={messages.length <= 1}
//             >
//               <Share2 className="h-4 w-4 mr-1" />
//               Share Link
//             </button>
//           </div>
//         </div>

//         {/* Messages Container */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               <div
//                 className={`max-w-[80%] p-3 rounded-lg ${
//                   message.type === 'user'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-white border border-gray-200'
//                 }`}
//               >
//                 <div className="flex items-center mb-1">
//                   {message.type === 'user' ? (
//                     <User className="h-4 w-4 mr-1" />
//                   ) : (
//                     <Bot className="h-4 w-4 mr-1" />
//                   )}
//                   <span className="text-xs opacity-70">
//                     {new Date(message.timestamp).toLocaleTimeString()}
//                   </span>
//                 </div>
//                 {processMessageContent(message)}
//               </div>
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 bg-white border-t border-gray-200">
//           <div className="flex items-center">
//             <textarea
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={handleKeyPress}
//               placeholder="Type a message or SQL query..."
//               className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
//               rows={2}
//               disabled={isProcessing}
//             />
//             <button
//               onClick={handleSendMessage}
//               className={`p-2 rounded-r-md ${
//                 isProcessing
//                   ? 'bg-gray-300 cursor-not-allowed'
//                   : 'bg-indigo-600 hover:bg-indigo-700'
//               } text-white`}
//               disabled={isProcessing}
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//           {isProcessing && (
//             <div className="mt-2 text-center text-sm text-gray-500">
//               Processing your request...
//             </div>
//           )}
//         </div>

//         {/* Share via Email Modal */}
//         {showEmailShare && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-96">
//               <h3 className="text-lg font-medium mb-4">Share Chat via Email</h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Your Name
//                   </label>
//                   <input
//                     type="text"
//                     value={shareName}
//                     onChange={(e) => setShareName(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded"
//                     placeholder="Your Name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Recipient Email
//                   </label>
//                   <input
//                     type="email"
//                     value={shareEmail}
//                     onChange={(e) => setShareEmail(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded"
//                     placeholder="recipient@example.com"
//                   />
//                 </div>
//                 <div className="flex justify-end space-x-2">
//                   <button
//                     onClick={() => setShowEmailShare(false)}
//                     className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={shareViaEmail}
//                     className="px-4 py-2 bg-indigo-600 rounded text-white hover:bg-indigo-700"
//                   >
//                     Send
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Share Link Modal */}
//         {showShareModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-6 rounded-lg w-96">
//               <h3 className="text-lg font-medium mb-4">Share Chat</h3>
//               <div className="space-y-4">
//                 <p className="text-sm text-gray-600">
//                   Share this link with others to give them access to this chat:
//                 </p>
//                 <div className="flex">
//                   <input
//                     type="text"
//                     readOnly
//                     value={shareUrl || ''}
//                     className="flex-1 p-2 border border-gray-300 rounded-l"
//                   />
//                   <button
//                     onClick={copyShareUrl}
//                     className="px-4 py-2 bg-indigo-600 rounded-r text-white hover:bg-indigo-700"
//                   >
//                     Copy
//                   </button>
//                 </div>
//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => setShowShareModal(false)}
//                     className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AIChat;

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

// Connection details interface
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
  
      socket = new WebSocket('ws://localhost:8080/ws/chat');
  
      socket.onopen = () => {
        console.log('WebSocket connection established');
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        // Request chat history on connection
        fetchChatHistory();
      };
  
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'history') {
            // Handle chat history response
            setChatHistory(data.chats || []);
          }
          else if (data.type === 'share_link') {
            // Handle share link response
            setShareUrl(data.url);
            setShowShareModal(true);
          }
          else if (data.type === 'email_share_result') {
            // Handle email share result
            if (data.success) {
              alert('Chat shared successfully via email!');
            } else {
              alert('Failed to share chat via email. Please try again.');
            }
            setShowEmailShare(false);
          }
          else if (data.type === 'load_chat') {
            // Handle loaded chat messages
            if (data.messages && Array.isArray(data.messages)) {
              setMessages(data.messages);
              nextId.current = data.messages.length + 1;
              
              // Update connection status if this chat has an active connection
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
            // Handle chat saved confirmation
            if (data.chat_id) {
              setCurrentChatId(data.chat_id);
              // Refresh the chat history
              fetchChatHistory();
              // Alert user that chat was saved successfully
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
  
            // Update connection status based on message content
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
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract connection ID from message
  const extractConnectionId = (message: string): string => {
    // Try to extract database name from connection message
    const dbMatch = message.match(/Connected to \w+ database at (.+?):(.+?)\/(.+?)(?:$|\s)/);
    if (dbMatch && dbMatch[3]) {
      return dbMatch[3]; // Return the database name
    }
    return 'database';
  };

  // Generate a default chat name based on message content
  const generateDefaultChatName = (): string => {
    // First try to find a query
    const queryMessages = messages.filter(msg => 
      msg.content.includes('SELECT') || 
      msg.content.includes('INSERT') || 
      msg.content.includes('UPDATE') || 
      msg.content.includes('Query results:')
    );
    
    if (queryMessages.length > 0) {
      // Extract the first SELECT statement or table name
      const content = queryMessages[0].content;
      
      // Extract table name from SELECT query
      const tableMatch = content.match(/FROM\s+(\w+)/i);
      if (tableMatch && tableMatch[1]) {
        return `Query on ${tableMatch[1]} table`;
      }
      
      // Extract any first table name
      const anyTableMatch = content.match(/\b(\w+)\b\s+table/i);
      if (anyTableMatch && anyTableMatch[1]) {
        return `Query on ${anyTableMatch[1]} table`;
      }
      
      return "Database Query Chat";
    }
    
    // Try to extract keywords from user questions
    const userMessages = messages.filter(msg => msg.type === 'user');
    if (userMessages.length > 0) {
      const firstMessage = userMessages[0].content.trim();
      
      // If first message is short enough, use it directly
      if (firstMessage.length <= 30) {
        return firstMessage;
      }
      
      // Otherwise truncate it
      return firstMessage.substring(0, 27) + '...';
    }
    
    // Default to timestamp
    return `Database Chat - ${new Date().toLocaleString()}`;
  };

  // Save the current chat with the user-provided name
  const saveChat = () => {
    if (messages.length <= 1) {
      alert("There's no conversation to save yet.");
      return;
    }
    
    // Set a default name for the chat and show the save modal
    setSaveChatName(generateDefaultChatName());
    setShowSaveModal(true);
  };

  // Handle the actual saving of the chat after name is confirmed
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

  // Fetch chat history from backend
  const fetchChatHistory = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'request_history'
      }));
    }
  };

  // Load specific chat by ID
  const loadChat = (chatId: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'load_chat',
        chat_id: chatId
      }));
      setCurrentChatId(chatId);
    }
  };

  // Delete chat by ID
  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the chat selection
    
    if (window.confirm("Are you sure you want to delete this chat?")) {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'delete_chat',
          chat_id: chatId
        }));
        
        // Update local state
        setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
        
        // If we're deleting the current chat, reset the interface
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

  // Start a new chat
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

  // Share chat via email
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

  // Parse connection details from message
  const parseConnectionDetails = (message: string): ConnectionDetails | null => {
    try {
      // First check if this is a properly formatted connection request
      if (!message.toLowerCase().includes('host:')) {
        return null;
      }

      // Split the input by common delimiters
      let lines = message.split(/[\n:]/).map(line => line.trim());
      
      // Initialize connection details with defaults
      const details: ConnectionDetails = {
        host: 'localhost',
        port: 5432,
        database: '',
        username: '',
        password: '',
        dbms: 'postgresql'
      };

      // Parse each parameter
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

  // Helper function to process message content
  const processMessageContent = (message: Message) => {
    // Check if content contains query results with HTML
    if (message.type === 'bot' && message.content.includes('Query results:')) {
      const parts = message.content.split('Query results:');
      const beforeHtml = parts[0];
      
      // Check if there's HTML content after "Query results:"
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
    
    // For code blocks, we need to preserve formatting
    if (message.content.includes('```')) {
      const segments = message.content.split(/(```[\s\S]*?```)/g);
      
      return (
        <div className="whitespace-pre-wrap">
          {segments.map((segment, index) => {
            if (segment.startsWith('```') && segment.endsWith('```')) {
              // Code block rendering
              const code = segment.substring(3, segment.length - 3);
              // Extract language if specified
              const language = code.split('\n')[0].trim();
              const codeContent = language ? code.substring(language.length).trim() : code;
              
              return (
                <pre key={index} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
                  <code>{codeContent}</code>
                </pre>
              );
            } else {
              // Regular text
              return <span key={index}>{segment}</span>;
            }
          })}
        </div>
      );
    }
    
    // Regular message without special formatting
    return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const handleSendMessage = () => {
    if (!input.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: nextId.current++,
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    
    // Check if this is a connection request with details
    const connectionDetails = parseConnectionDetails(input);
    
    // Send message to WebSocket
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageToSend: any = {
        id: userMessage.id,
        type: 'user',
        content: input,
        timestamp: userMessage.timestamp
      };
      
      // If we have a current chat ID, include it
      if (currentChatId) {
        messageToSend.chat_id = currentChatId;
      }
      
      // If this is a connection request, format it specially
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
      {/* Chat History Sidebar */}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Connection Status & Actions */}
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

        {/* Messages Container */}
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

        {/* Input Area */}
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

        {/* Save Chat Modal */}
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

        {/* Share via Email Modal */}
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

        {/* Share Link Modal - Kept for compatibility */}
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

// import React, { useState, useEffect, useRef } from 'react';
// import { Send, Bot, User } from 'lucide-react';

// interface Message {
//   id: number;
//   type: 'user' | 'bot';
//   content: string;
//   timestamp: string;
// }

// interface ChatHistory {
//   id: number;
//   name: string;
//   date: string;
// }

// // Connection details interface
// interface ConnectionDetails {
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   dbms: string;
// }

// const AIChat = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: 1,
//       type: 'bot',
//       content: 'Hi! I can help you connect to and query databases. Start by typing "Connect to a database".',
//       timestamp: new Date().toISOString(),
//     },
//   ]);
//   const [input, setInput] = useState('');
//   const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
//   const [isConnected, setIsConnected] = useState(false);
//   const [connectionId, setConnectionId] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const ws = useRef<WebSocket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const nextId = useRef<number>(2);

//   useEffect(() => {
//     let socket: WebSocket | null = null;
//     let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  
//     const connectWebSocket = () => {
//       if (socket) {
//         socket.close();
//       }
  
//       socket = new WebSocket('ws://localhost:8080/ws/chat');
  
//       socket.onopen = () => {
//         console.log('WebSocket connection established');
//         if (reconnectTimer) {
//           clearTimeout(reconnectTimer);
//           reconnectTimer = null;
//         }
//       };
  
//       socket.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           if (data.type === 'bot') {
//             setMessages((prevMessages) => [
//               ...prevMessages,
//               {
//                 id: nextId.current++,
//                 type: 'bot',
//                 content: data.content,
//                 timestamp: new Date().toISOString(),
//               },
//             ]);
//             setIsProcessing(false);
  
//             if (data.content.includes('Successfully connected')) {
//               setIsConnected(true);
//               setConnectionId(data?.connection_id || 'default');
  
//               const newChatName = `Database Connection ${new Date().toLocaleTimeString()}`;
//               setChatHistory((prev) => [
//                 ...prev,
//                 {
//                   id: Date.now(),
//                   name: newChatName,
//                   date: new Date().toLocaleDateString(),
//                 },
//               ]);
//             }
  
//             if (data.content.includes('connection closed')) {
//               setIsConnected(false);
//               setConnectionId(null);
//             }
//           }
//         } catch (e) {
//           console.error('Error parsing WebSocket message:', e);
//         }
//       };
  
//       socket.onclose = (event) => {
//         console.log('WebSocket connection closed', event.code, event.reason);
//         if (event.code !== 1000) {
//           reconnectTimer = setTimeout(connectWebSocket, 3000);
//         }
//       };
  
//       socket.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
  
//       ws.current = socket;
//     };
  
//     connectWebSocket();
  
//     return () => {
//       if (reconnectTimer) {
//         clearTimeout(reconnectTimer);
//       }
  
//       if (socket) {
//         socket.close(1000, "Component unmounting");
//       }
//     };
//   }, []);
  
//   // Auto-scroll to bottom of messages
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Load chat history
//   useEffect(() => {
//     // In a real app, you would fetch this from API/localStorage
//     setChatHistory([
//       {
//         id: 1,
//         name: 'PostgreSQL Connection',
//         date: new Date().toLocaleDateString(),
//       },
//       {
//         id: 2,
//         name: 'Query Analysis',
//         date: new Date().toLocaleDateString(),
//       },
//       {
//         id: 3,
//         name: 'Schema Overview',
//         date: new Date().toLocaleDateString(),
//       },
//     ]);
//   }, []);

//   // Parse connection details from message
//   const parseConnectionDetails = (message: string): ConnectionDetails | null => {
//     try {
//       // First check if this is a properly formatted connection request
//       if (!message.toLowerCase().includes('host:')) {
//         return null;
//       }

//       // Split the input by common delimiters
//       let lines = message.split(/[\n:]/).map(line => line.trim());
      
//       // Initialize connection details with defaults
//       const details: ConnectionDetails = {
//         host: 'localhost',
//         port: 5432,
//         database: '',
//         username: '',
//         password: '',
//         dbms: 'postgresql'
//       };

//       // Parse each parameter
//       for (let i = 0; i < lines.length; i++) {
//         const line = lines[i].toLowerCase();
        
//         if (line === 'host' && i + 1 < lines.length) {
//           details.host = lines[i + 1];
//         } 
//         else if (line === 'port' && i + 1 < lines.length) {
//           details.port = parseInt(lines[i + 1], 10);
//         }
//         else if (line === 'database' && i + 1 < lines.length) {
//           details.database = lines[i + 1];
//         }
//         else if ((line === 'username' || line === 'user') && i + 1 < lines.length) {
//           details.username = lines[i + 1];
//         }
//         else if ((line === 'password' || line === 'pass') && i + 1 < lines.length) {
//           details.password = lines[i + 1];
//         }
//         else if (line === 'dbms' && i + 1 < lines.length) {
//           details.dbms = lines[i + 1];
//         }
//       }

//       return details;
//     } catch (error) {
//       console.error('Error parsing connection details:', error);
//       return null;
//     }
//   };

//   // Helper function to process message content
//   const processMessageContent = (message: Message) => {
//     // Check if content contains query results with HTML
//     if (message.type === 'bot' && message.content.includes('Query results:')) {
//       const parts = message.content.split('Query results:');
//       const beforeHtml = parts[0];
      
//       // Check if there's HTML content after "Query results:"
//       if (parts[1] && (parts[1].includes('<div') || parts[1].includes('<table'))) {
//         return (
//           <>
//             <div className="whitespace-pre-wrap">{beforeHtml + 'Query results:'}</div>
//             <div 
//               className="mt-2 query-result-container" 
//               dangerouslySetInnerHTML={{ __html: parts[1] }} 
//             />
//           </>
//         );
//       }
//     }
    
//     // For code blocks, we need to preserve formatting
//     if (message.content.includes('```')) {
//       const segments = message.content.split(/(```[\s\S]*?```)/g);
      
//       return (
//         <div className="whitespace-pre-wrap">
//           {segments.map((segment, index) => {
//             if (segment.startsWith('```') && segment.endsWith('```')) {
//               // Code block rendering
//               const code = segment.substring(3, segment.length - 3);
//               // Extract language if specified
//               const language = code.split('\n')[0].trim();
//               const codeContent = language ? code.substring(language.length).trim() : code;
              
//               return (
//                 <pre key={index} className="bg-gray-100 p-2 rounded my-2 overflow-x-auto">
//                   <code>{codeContent}</code>
//                 </pre>
//               );
//             } else {
//               // Regular text
//               return <span key={index}>{segment}</span>;
//             }
//           })}
//         </div>
//       );
//     }
    
//     // Regular message without special formatting
//     return <div className="whitespace-pre-wrap">{message.content}</div>;
//   };

//   const handleSendMessage = () => {
//     if (!input.trim() || isProcessing) return;

//     // Add user message
//     const userMessage: Message = {
//       id: nextId.current++,
//       type: 'user',
//       content: input,
//       timestamp: new Date().toISOString(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
    
//     // Check if this is a connection request with details
//     const connectionDetails = parseConnectionDetails(input);
    
//     // Send message to WebSocket
//     if (ws.current && ws.current.readyState === WebSocket.OPEN) {
//       if (connectionDetails) {
//         // Format the connection details properly before sending
//         const formattedMessage = {
//           id: userMessage.id,
//           type: 'user',
//           content: `Host: ${connectionDetails.host}\nPort: ${connectionDetails.port}\nDatabase: ${connectionDetails.database}\nUsername: ${connectionDetails.username}\nPassword: ${connectionDetails.password}\nDBMS: ${connectionDetails.dbms}`,
//           timestamp: userMessage.timestamp
//         };
//         ws.current.send(JSON.stringify(formattedMessage));
//       } else {
//         // Send the original message
//         ws.current.send(JSON.stringify(userMessage));
//       }
//       setIsProcessing(true);
//     }

//     setInput('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="h-[calc(100vh-7rem)] flex">
//       {/* Chat History Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">History</h2>
//           <div className="mt-4 space-y-2">
//             {chatHistory.map((chat) => (
//               <div
//                 key={chat.id}
//                 className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
//               >
//                 <p className="text-sm text-gray-900">{chat.name}</p>
//                 <p className="text-xs text-gray-500 mt-1">{chat.date}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col bg-gray-50">
//         {/* Connection Status */}
//         <div className="py-2 px-4 bg-white border-b border-gray-200">
//           <div className="flex items-center">
//             <div
//               className={`w-3 h-3 rounded-full mr-2 ${
//                 isConnected ? 'bg-green-500' : 'bg-gray-400'
//               }`}
//             ></div>
//             <span className="text-sm font-medium text-gray-700">
//               {isConnected
//                 ? `Connected to database (${connectionId})`
//                 : 'Not connected'}
//             </span>
//           </div>
//         </div>

//         {/* Messages */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex items-start space-x-2 ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               {message.type === 'bot' && (
//                 <div className="flex-shrink-0">
//                   <Bot className="h-8 w-8 rounded-full bg-indigo-100 p-1 text-indigo-600" />
//                 </div>
//               )}
//               <div
//                 className={`rounded-lg p-4 max-w-lg overflow-auto ${
//                   message.type === 'user'
//                     ? 'bg-indigo-600 text-white'
//                     : 'bg-white text-gray-900'
//                 }`}
//                 style={{ maxWidth: message.type === 'bot' ? '80%' : 'auto' }}
//               >
//                 {processMessageContent(message)}
//                 <p
//                   className={`text-xs mt-2 ${
//                     message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
//                   }`}
//                 >
//                   {new Date(message.timestamp).toLocaleTimeString()}
//                 </p>
//               </div>
//               {message.type === 'user' && (
//                 <div className="flex-shrink-0">
//                   <User className="h-8 w-8 rounded-full bg-indigo-600 p-1 text-white" />
//                 </div>
//               )}
//             </div>
//           ))}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 bg-white border-t border-gray-200">
//           <div className="flex space-x-4">
//             <input
//               type="text"
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Ask anything about your database..."
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//               disabled={isProcessing}
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={isProcessing || !input.trim()}
//               className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//                 isProcessing || !input.trim()
//                   ? 'bg-indigo-400 cursor-not-allowed'
//                   : 'bg-indigo-600 hover:bg-indigo-700'
//               }`}
//             >
//               <Send className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Global styles for query results */}
//       <style>{`
//         .query-result-container .table-container {
//           overflow-x: auto;
//           margin: 1rem 0;
//         }
//         .query-result-container .query-results {
//           border-collapse: collapse;
//           width: 100%;
//           font-family: sans-serif;
//         }
//         .query-result-container .query-results th,
//         .query-result-container .query-results td {
//           border: 1px solid #ddd;
//           padding: 8px;
//           text-align: left;
//         }
//         .query-result-container .query-results tr:nth-child(even) {
//           background-color: #f2f2f2;
//         }
//         .query-result-container .query-results th {
//           padding-top: 12px;
//           padding-bottom: 12px;
//           background-color: #4CAF50;
//           color: white;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AIChat;