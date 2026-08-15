// import React, { useState } from 'react';
// import { Plus, Database, X } from 'lucide-react';

// import { useEffect, useState } from "react";



// const Dashboard = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [connectionType, setConnectionType] = useState('');
//   const [formData, setFormData] = useState({
//     name: '',
//     host: '',
//     port: '',
//     database: '',
//     username: '',
//     password: '',
//     connectionString: ''
//   });

  
//   const recentConnections = [
//     {
//       id: 1,
//       name: 'Production DB',
//       type: 'postgres',
//       host: 'prod-db.example.com',
//       lastAccessed: '2024-03-10T10:30:00Z'
//     },
//     {
//       id: 2,
//       name: 'Analytics MongoDB',
//       type: 'mongodb',
//       host: 'mongodb://analytics.example.com',
//       lastAccessed: '2024-03-09T15:45:00Z'
//     }
//   ];

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

  
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   // ✅ Ensure `type` matches backend expectations
//   const databaseType = connectionType === "postgresql" ? "postgres" : connectionType;

//   const requestData: any = {
//     type: databaseType,  // ✅ Fixing 'postgresql' -> 'postgres'
//     name: formData.name || "",
//     host: formData.host || "",
//     port: formData.port ? Number(formData.port) : undefined, // Ensure port is a number
//     database: formData.database || "",
//     username: formData.username || "",
//     password: formData.password || "",
//   };

//   if (databaseType === "mongodb") {
//     requestData.connection_string = formData.connectionString || "";
//   } else {
//     delete requestData.connection_string;
//   }

//   console.log("🚀 Sending data:", requestData);

//   try {
//     const response = await fetch("http://localhost:8080/connect", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(requestData),
//     });

//     const result = await response.json();

//     if (response.ok) {
//       alert(result.message);
//     } else {
//       alert("Connection failed: " + result.detail);
//     }
//   } catch (error) {
//     alert("Error connecting to database");
//   }

//   setIsModalOpen(false);
//   setFormData({
//     name: "",
//     host: "",
//     port: "",
//     database: "",
//     username: "",
//     password: "",
//     connectionString: "",
//   });
// };


//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           New Connection
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {['PostgreSQL', 'MongoDB', 'Redshift'].map((db) => (
//           <div
//             key={db}
//             onClick={() => {
//               setConnectionType(db.toLowerCase());
//               setIsModalOpen(true);
//             }}
//             className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
//           >
//             <div className="flex items-center">
//               <Database className="h-8 w-8 text-indigo-600" />
//               <h3 className="ml-3 text-lg font-medium text-gray-900">{db}</h3>
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               Connect to your {db} database
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white shadow rounded-lg">
//         <div className="px-4 py-5 sm:px-6">
//           <h2 className="text-lg font-medium text-gray-900">
//             Recent Connections
//           </h2>
//         </div>
//         <div className="border-t border-gray-200">
//           <ul className="divide-y divide-gray-200">
//             {recentConnections.map((connection) => (
//               <li key={connection.id} className="px-4 py-4 sm:px-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <Database className="h-5 w-5 text-gray-400" />
//                     <p className="ml-2 text-sm font-medium text-gray-900">
//                       {connection.name}
//                     </p>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-sm text-gray-500">
//                       Last accessed:{' '}
//                       {new Date(connection.lastAccessed).toLocaleDateString()}
//                     </span>
//                     <button className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500">
//                       Connect
//                     </button>
//                   </div>
//                 </div>
//                 <div className="mt-2">
//                   <p className="text-sm text-gray-500">
//                     {connection.type} • {connection.host}
//                   </p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Connection Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 New {connectionType || 'Database'} Connection
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-500"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               {connectionType === 'mongodb' ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Connection String
//                   </label>
//                   <input
//                     type="text"
//                     name="connectionString"
//                     value={formData.connectionString}
//                     onChange={handleInputChange}
//                     placeholder="mongodb://username:password@host:port/database"
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Host
//                     </label>
//                     <input
//                       type="text"
//                       name="host"
//                       value={formData.host}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Port
//                     </label>
//                     <input
//                       type="text"
//                       name="port"
//                       value={formData.port}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Database Name
//                     </label>
//                     <input
//                       type="text"
//                       name="database"
//                       value={formData.database}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//                 >
//                   Connect
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Plus, Database, X, Power, Trash2 } from 'lucide-react';

// Define the Connection interface
interface Connection {
  id: string;
  type: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  lastAccessed: string;
}

// Define the form data interface
interface FormData {
  name: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  connectionString: string;
}

// Define request data interface
interface RequestData {
  type: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connection_string?: string;
}

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionType, setConnectionType] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    connectionString: ''
  });
  
  // State for recent connections
  const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  
  // Fetch recent connections on component mount
  useEffect(() => {
    fetchRecentConnections();
  }, []);
  
  // Function to fetch recent connections from the backend
  const fetchRecentConnections = async () => {
    try {
      const response = await fetch("http://localhost:8080/recent-connections");
      
      if (response.ok) {
        const data = await response.json();
        setRecentConnections(data);
      } else {
        console.error("Failed to fetch recent connections");
      }
    } catch (error) {
      console.error("Error fetching recent connections:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Ensure `type` matches backend expectations
    const databaseType = connectionType === "postgresql" ? "postgres" : connectionType;

    const requestData: RequestData = {
      type: databaseType,
      name: formData.name || "",
      host: formData.host || "",
      port: formData.port ? Number(formData.port) : 0, // Ensure port is a number
      database: formData.database || "",
      username: formData.username || "",
      password: formData.password || "",
    };

    if (databaseType === "mongodb") {
      requestData.connection_string = formData.connectionString || "";
    }

    console.log("🚀 Sending data:", requestData);

    try {
      const response = await fetch("http://localhost:8080/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        // Add a small delay before fetching connections
        setTimeout(() => {
          fetchRecentConnections();
        }, 500); // 500ms delay
      } else {
        alert("Connection failed: " + result.detail);
      }
    } catch (error) {
      alert("Error connecting to database");
    }

    setIsModalOpen(false);
    setFormData({
      name: "",
      host: "",
      port: "",
      database: "",
      username: "",
      password: "",
      connectionString: "",
    });
  };

  // Function to handle reconnecting to a database
  const handleReconnect = async (connection: Connection) => {
    // For reconnecting, you need to send a connection request to the backend
    try {
      const requestData: RequestData = {
        type: connection.type,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        database: connection.database,
        username: connection.username,
        password: connection.password,
      };
      
      // For MongoDB, you would handle the connection string
      if (connection.type === "mongodb") {
        requestData.connection_string = connection.host;
      }
      
      const response = await fetch("http://localhost:8080/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        // Refresh the recent connections list
        fetchRecentConnections();
      } else {
        alert("Reconnection failed: " + result.detail);
      }
    } catch (error) {
      alert("Error reconnecting to database");
    }
  };

  // Function to handle disconnecting from a database
  const handleDisconnect = async (connectionId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/disconnect/${connectionId}`, {
        method: "POST",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        // Refresh the recent connections list
        fetchRecentConnections();
      } else {
        alert("Disconnection failed: " + result.detail);
      }
    } catch (error) {
      alert("Error disconnecting from database");
    }
  };

  // Function to handle deleting a connection
  const handleDelete = async (connectionId: string) => {
    // Ask for confirmation before deleting
    const confirmed = window.confirm("Are you sure you want to delete this connection?");
    if (!confirmed) return;
    
    try {
      const response = await fetch(`http://localhost:8080/delete-connection/${connectionId}`, {
        method: "DELETE",
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert(result.message);
        // Refresh the recent connections list
        fetchRecentConnections();
      } else {
        alert("Deletion failed: " + result.detail);
      }
    } catch (error) {
      alert("Error deleting connection");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Connection
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {['PostgreSQL', 'MongoDB', 'Redshift', 'MySQL'].map((db) => (
          <div
            key={db}
            onClick={() => {
              setConnectionType(db.toLowerCase());
              setIsModalOpen(true);
            }}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Database className="h-8 w-8 text-indigo-600" />
              <h3 className="ml-3 text-lg font-medium text-gray-900">{db}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Connect to your {db} database
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Connections
          </h2>
        </div>
        <div className="border-t border-gray-200">
          {recentConnections.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentConnections.map((connection) => (
                <li key={connection.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 text-gray-400" />
                      <p className="ml-2 text-sm font-medium text-gray-900">
                        {connection.name}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-4">
                        Last accessed:{' '}
                        {new Date(connection.lastAccessed).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleReconnect(connection)}
                        className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Connect
                      </button>
                      <button 
                        onClick={() => handleDisconnect(connection.id)}
                        className="ml-3 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <Power className="h-4 w-4 mr-1" />
                        Disconnect
                      </button>
                      <button 
                        onClick={() => handleDelete(connection.id)}
                        className="ml-3 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {connection.type} • {connection.host}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No recent connections. Connect to a database to see it here.
            </div>
          )}
        </div>
      </div>

      {/* Connection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                New {connectionType || 'Database'} Connection
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Connection Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {connectionType === 'mongodb' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Connection String
                  </label>
                  <input
                    type="text"
                    name="connectionString"
                    value={formData.connectionString}
                    onChange={handleInputChange}
                    placeholder="mongodb://username:password@host:port/database"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Host
                    </label>
                    <input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Port
                    </label>
                    <input
                      type="text"
                      name="port"
                      value={formData.port}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Database Name
                    </label>
                    <input
                      type="text"
                      name="database"
                      value={formData.database}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
//corrected

// import React, { useEffect, useState } from 'react';
// import { Plus, Database, X, Power } from 'lucide-react';

// // Define the Connection interface
// interface Connection {
//   id: string;
//   type: string;
//   name: string;
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   lastAccessed: string;
// }

// // Define the form data interface
// interface FormData {
//   name: string;
//   host: string;
//   port: string;
//   database: string;
//   username: string;
//   password: string;
//   connectionString: string;
// }

// // Define request data interface
// interface RequestData {
//   type: string;
//   name: string;
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   connection_string?: string;
// }

// const Dashboard = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [connectionType, setConnectionType] = useState('');
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     host: '',
//     port: '',
//     database: '',
//     username: '',
//     password: '',
//     connectionString: ''
//   });
  
//   // State for recent connections
//   const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  
//   // Fetch recent connections on component mount
//   useEffect(() => {
//     fetchRecentConnections();
//   }, []);
  
//   // Function to fetch recent connections from the backend
//   const fetchRecentConnections = async () => {
//     try {
//       const response = await fetch("http://localhost:8080/recent-connections");
      
//       if (response.ok) {
//         const data = await response.json();
//         setRecentConnections(data);
//       } else {
//         console.error("Failed to fetch recent connections");
//       }
//     } catch (error) {
//       console.error("Error fetching recent connections:", error);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // ✅ Ensure `type` matches backend expectations
//     const databaseType = connectionType === "postgresql" ? "postgres" : connectionType;

//     const requestData: RequestData = {
//       type: databaseType,
//       name: formData.name || "",
//       host: formData.host || "",
//       port: formData.port ? Number(formData.port) : 0, // Ensure port is a number
//       database: formData.database || "",
//       username: formData.username || "",
//       password: formData.password || "",
//     };

//     if (databaseType === "mongodb") {
//       requestData.connection_string = formData.connectionString || "";
//     }

//     console.log("🚀 Sending data:", requestData);

//     try {
//       const response = await fetch("http://localhost:8080/connect", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert(result.message);
//         // Fetch updated recent connections after successful connection
//         //fetchRecentConnections();
//         // Add a small delay before fetching connections
//       setTimeout(() => {
//         fetchRecentConnections();
//       }, 500); // 500ms delay
//       } else {
//         alert("Connection failed: " + result.detail);
//       }
//     } catch (error) {
//       alert("Error connecting to database");
//     }

//     setIsModalOpen(false);
//     setFormData({
//       name: "",
//       host: "",
//       port: "",
//       database: "",
//       username: "",
//       password: "",
//       connectionString: "",
//     });
//   };

//   // Function to handle reconnecting to a database
//   const handleReconnect = async (connection: Connection) => {
//     // For reconnecting, you need to send a connection request to the backend
//     try {
//       const requestData: RequestData = {
//         type: connection.type,
//         name: connection.name,
//         host: connection.host,
//         port: connection.port,
//         database: connection.database,
//         username: connection.username,
//         password: connection.password,
//       };
      
//       // For MongoDB, you would handle the connection string
//       if (connection.type === "mongodb") {
//         requestData.connection_string = connection.host;
//       }
      
//       const response = await fetch("http://localhost:8080/connect", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestData),
//       });
      
//       const result = await response.json();
      
//       if (response.ok) {
//         alert(result.message);
//         // Refresh the recent connections list
//         fetchRecentConnections();
//       } else {
//         alert("Reconnection failed: " + result.detail);
//       }
//     } catch (error) {
//       alert("Error reconnecting to database");
//     }
//   };

//   // Function to handle disconnecting from a database
//   const handleDisconnect = async (connectionId: string) => {
//     try {
//       const response = await fetch(`http://localhost:8080/disconnect/${connectionId}`, {
//         method: "POST",
//       });
      
//       const result = await response.json();
      
//       if (response.ok) {
//         alert(result.message);
//         // Refresh the recent connections list
//         fetchRecentConnections();
//       } else {
//         alert("Disconnection failed: " + result.detail);
//       }
//     } catch (error) {
//       alert("Error disconnecting from database");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           New Connection
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         {['PostgreSQL', 'MongoDB', 'Redshift', 'MySQL'].map((db) => (
//           <div
//             key={db}
//             onClick={() => {
//               setConnectionType(db.toLowerCase());
//               setIsModalOpen(true);
//             }}
//             className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
//           >
//             <div className="flex items-center">
//               <Database className="h-8 w-8 text-indigo-600" />
//               <h3 className="ml-3 text-lg font-medium text-gray-900">{db}</h3>
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               Connect to your {db} database
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white shadow rounded-lg">
//         <div className="px-4 py-5 sm:px-6">
//           <h2 className="text-lg font-medium text-gray-900">
//             Recent Connections
//           </h2>
//         </div>
//         <div className="border-t border-gray-200">
//           {recentConnections.length > 0 ? (
//             <ul className="divide-y divide-gray-200">
//               {recentConnections.map((connection) => (
//                 <li key={connection.id} className="px-4 py-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Database className="h-5 w-5 text-gray-400" />
//                       <p className="ml-2 text-sm font-medium text-gray-900">
//                         {connection.name}
//                       </p>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-sm text-gray-500 mr-4">
//                         Last accessed:{' '}
//                         {new Date(connection.lastAccessed).toLocaleString()}
//                       </span>
//                       <button 
//                         onClick={() => handleReconnect(connection)}
//                         className="ml-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                       >
//                         Connect
//                       </button>
//                       <button 
//                         onClick={() => handleDisconnect(connection.id)}
//                         className="ml-3 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
//                       >
//                         <Power className="h-4 w-4 mr-1" />
//                         Disconnect
//                       </button>
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       {connection.type} • {connection.host}
//                     </p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
//               No recent connections. Connect to a database to see it here.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Connection Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 New {connectionType || 'Database'} Connection
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-500"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               {connectionType === 'mongodb' ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Connection String
//                   </label>
//                   <input
//                     type="text"
//                     name="connectionString"
//                     value={formData.connectionString}
//                     onChange={handleInputChange}
//                     placeholder="mongodb://username:password@host:port/database"
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Host
//                     </label>
//                     <input
//                       type="text"
//                       name="host"
//                       value={formData.host}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Port
//                     </label>
//                     <input
//                       type="text"
//                       name="port"
//                       value={formData.port}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Database Name
//                     </label>
//                     <input
//                       type="text"
//                       name="database"
//                       value={formData.database}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//                 >
//                   Connect
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;

// import React, { useEffect, useState } from 'react';
// import { Plus, Database, X } from 'lucide-react';

// // Define the Connection interface
// interface Connection {
//   id: string;
//   type: string;
//   name: string;
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   lastAccessed: string;
// }

// // Define the form data interface
// interface FormData {
//   name: string;
//   host: string;
//   port: string;
//   database: string;
//   username: string;
//   password: string;
//   connectionString: string;
// }

// // Define request data interface
// interface RequestData {
//   type: string;
//   name: string;
//   host: string;
//   port: number;
//   database: string;
//   username: string;
//   password: string;
//   connection_string?: string;
// }

// const Dashboard = () => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [connectionType, setConnectionType] = useState('');
//   const [formData, setFormData] = useState<FormData>({
//     name: '',
//     host: '',
//     port: '',
//     database: '',
//     username: '',
//     password: '',
//     connectionString: ''
//   });
  
//   // State for recent connections
//   const [recentConnections, setRecentConnections] = useState<Connection[]>([]);
  
//   // Fetch recent connections on component mount
//   useEffect(() => {
//     fetchRecentConnections();
//   }, []);
  
//   // Function to fetch recent connections from the backend
//   const fetchRecentConnections = async () => {
//     try {
//       const response = await fetch("http://localhost:8080/recent-connections");
      
//       if (response.ok) {
//         const data = await response.json();
//         setRecentConnections(data);
//       } else {
//         console.error("Failed to fetch recent connections");
//       }
//     } catch (error) {
//       console.error("Error fetching recent connections:", error);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // ✅ Ensure `type` matches backend expectations
//     const databaseType = connectionType === "postgresql" ? "postgres" : connectionType;

//     const requestData: RequestData = {
//       type: databaseType,  // ✅ Fixing 'postgresql' -> 'postgres'
//       name: formData.name || "",
//       host: formData.host || "",
//       port: formData.port ? Number(formData.port) : 0, // Ensure port is a number
//       database: formData.database || "",
//       username: formData.username || "",
//       password: formData.password || "",
//     };

//     if (databaseType === "mongodb") {
//       requestData.connection_string = formData.connectionString || "";
//     }

//     console.log("🚀 Sending data:", requestData);

//     try {
//       const response = await fetch("http://localhost:8080/connect", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert(result.message);
//         // Fetch updated recent connections after successful connection
//         fetchRecentConnections();
//       } else {
//         alert("Connection failed: " + result.detail);
//       }
//     } catch (error) {
//       alert("Error connecting to database");
//     }

//     setIsModalOpen(false);
//     setFormData({
//       name: "",
//       host: "",
//       port: "",
//       database: "",
//       username: "",
//       password: "",
//       connectionString: "",
//     });
//   };

//   // Function to handle reconnecting to a database
//   const handleReconnect = async (connection: Connection) => {
//     // For reconnecting, you need to send a connection request to the backend
//     // This is a simplified example, you would need to retrieve the full connection details
//     try {
//       const requestData: RequestData = {
//         type: connection.type,
//         name: connection.name,
//         host: connection.host,
//         // You would need to get these values from somewhere or store them securely
//         port: connection.port || 5432, // Use connection port or default
//         database: connection.database || "",
//         username: connection.username || "",
//         password: connection.password || "",
//       };
      
//       // For MongoDB, you would handle the connection string
//       if (connection.type === "mongodb") {
//         requestData.connection_string = connection.host;
//       }
      
//       const response = await fetch("http://localhost:8080/connect", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestData),
//       });
      
//       const result = await response.json();
      
//       if (response.ok) {
//         alert(result.message);
//         // Refresh the recent connections list
//         fetchRecentConnections();
//       } else {
//         alert("Reconnection failed: " + result.detail);
//       }
//     } catch (error) {
//       alert("Error reconnecting to database");
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           <Plus className="h-5 w-5 mr-2" />
//           New Connection
//         </button>
//       </div>

//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//         {['PostgreSQL', 'MongoDB', 'Redshift'].map((db) => (
//           <div
//             key={db}
//             onClick={() => {
//               setConnectionType(db.toLowerCase());
//               setIsModalOpen(true);
//             }}
//             className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50"
//           >
//             <div className="flex items-center">
//               <Database className="h-8 w-8 text-indigo-600" />
//               <h3 className="ml-3 text-lg font-medium text-gray-900">{db}</h3>
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               Connect to your {db} database
//             </p>
//           </div>
//         ))}
//       </div>

//       <div className="bg-white shadow rounded-lg">
//         <div className="px-4 py-5 sm:px-6">
//           <h2 className="text-lg font-medium text-gray-900">
//             Recent Connections
//           </h2>
//         </div>
//         <div className="border-t border-gray-200">
//           {recentConnections.length > 0 ? (
//             <ul className="divide-y divide-gray-200">
//               {recentConnections.map((connection) => (
//                 <li key={connection.id} className="px-4 py-4 sm:px-6">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <Database className="h-5 w-5 text-gray-400" />
//                       <p className="ml-2 text-sm font-medium text-gray-900">
//                         {connection.name}
//                       </p>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-sm text-gray-500">
//                         Last accessed:{' '}
//                         {new Date(connection.lastAccessed).toLocaleString()}
//                       </span>
//                       <button 
//                         onClick={() => handleReconnect(connection)}
//                         className="ml-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                       >
//                         Connect
//                       </button>
//                     </div>
//                   </div>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       {connection.type} • {connection.host}
//                     </p>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <div className="px-4 py-4 sm:px-6 text-center text-gray-500">
//               No recent connections. Connect to a database to see it here.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Connection Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 max-w-md w-full">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 New {connectionType || 'Database'} Connection
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-gray-400 hover:text-gray-500"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Connection Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               {connectionType === 'mongodb' ? (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Connection String
//                   </label>
//                   <input
//                     type="text"
//                     name="connectionString"
//                     value={formData.connectionString}
//                     onChange={handleInputChange}
//                     placeholder="mongodb://username:password@host:port/database"
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                     required
//                   />
//                 </div>
//               ) : (
//                 <>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Host
//                     </label>
//                     <input
//                       type="text"
//                       name="host"
//                       value={formData.host}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Port
//                     </label>
//                     <input
//                       type="text"
//                       name="port"
//                       value={formData.port}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Database Name
//                     </label>
//                     <input
//                       type="text"
//                       name="database"
//                       value={formData.database}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Username
//                     </label>
//                     <input
//                       type="text"
//                       name="username"
//                       value={formData.username}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700">
//                       Password
//                     </label>
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                       required
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="flex justify-end space-x-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setIsModalOpen(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//                 >
//                   Connect
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;