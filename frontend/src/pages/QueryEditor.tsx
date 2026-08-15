// // import React, { useState } from 'react';
// // import { Save, Share, Download, Play, Sparkles } from 'lucide-react';

// // const QueryEditor = () => {
// //   const [savedQueries] = useState([
// //     { id: 1, name: 'Monthly Sales Report', description: 'Aggregates monthly sales data' },
// //     { id: 2, name: 'User Analytics', description: 'User engagement metrics' }
// //   ]);

// //   return (
// //     <div className="h-full flex">
// //       {/* Saved Queries Sidebar */}
// //       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
// //         <div className="p-4">
// //           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
// //           <div className="mt-4 space-y-2">
// //             {savedQueries.map((query) => (
// //               <div
// //                 key={query.id}
// //                 className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
// //               >
// //                 <h3 className="text-sm font-medium text-gray-900">
// //                   {query.name}
// //                 </h3>
// //                 <p className="text-xs text-gray-500 mt-1">
// //                   {query.description}
// //                 </p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Editor Area */}
// //       <div className="flex-1 flex flex-col">
// //         <div className="p-4 border-b border-gray-200 bg-white">
// //           <div className="flex items-center space-x-4">
// //             <input
// //               type="text"
// //               placeholder="Query Name"
// //               className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
// //             />
// //             <input
// //               type="text"
// //               placeholder="Description"
// //               className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
// //             />
// //           </div>
// //         </div>

// //         <div className="flex-1 p-4">
// //           <div className="h-64 mb-4">
// //             <textarea
// //               className="w-full h-full p-4 font-mono text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
// //               placeholder="Write your SQL query here..."
// //             />
// //           </div>

// //           <div className="flex justify-between items-center">
// //             <div className="space-x-2">
// //               <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
// //                 <Play className="h-4 w-4 mr-2" />
// //                 Run Query
// //               </button>
// //               <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
// //                 <Sparkles className="h-4 w-4 mr-2" />
// //                 Validate with AI
// //               </button>
// //             </div>
// //             <div className="space-x-2">
// //               <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
// //                 <Save className="h-4 w-4 mr-2" />
// //                 Save
// //               </button>
// //               <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
// //                 <Share className="h-4 w-4 mr-2" />
// //                 Share
// //               </button>
// //               <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
// //                 <Download className="h-4 w-4 mr-2" />
// //                 Export
// //               </button>
// //             </div>
// //           </div>

// //           <div className="mt-4">
// //             <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
// //             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
// //               <div className="overflow-x-auto">
// //                 <table className="min-w-full divide-y divide-gray-200">
// //                   <thead className="bg-gray-50">
// //                     <tr>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                         Column 1
// //                       </th>
// //                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                         Column 2
// //                       </th>
// //                     </tr>
// //                   </thead>
// //                   <tbody className="bg-white divide-y divide-gray-200">
// //                     <tr>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                         No results yet
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
// //                         Run a query to see results
// //                       </td>
// //                     </tr>
// //                   </tbody>
// //                 </table>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default QueryEditor;


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Save, Share, Download, Play, Sparkles } from 'lucide-react';

// const API_BASE_URL = "http://localhost:8080";

// const QueryEditor = () => {
//   const [savedQueries, setSavedQueries] = useState([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState(null);
//   const [validationMessage, setValidationMessage] = useState("");

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/get_saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     }
//   };

//   const executeQuery = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/execute_query`, { query: queryText });
//       setQueryResult(response.data.result);
//     } catch (error) {
//       console.error("Error executing query:", error);
//     }
//   };

//   const validateQuery = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/validate_query`, { query: queryText });
//       setValidationMessage(response.data.description);
//     } catch (error) {
//       console.error("Error validating query:", error);
//     }
//   };

//   const saveQuery = async () => {
//     try {
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//     } catch (error) {
//       console.error("Error saving query:", error);
//     }
//   };

//   return (
//     <div className="h-full flex">
//       {/* Saved Queries Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {savedQueries.map((query, index) => (
//               <div key={index} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer">
//                 <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                 <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Main Editor Area */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input type="text" placeholder="Query Name" value={queryName} onChange={(e) => setQueryName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
//             <input type="text" placeholder="Description" value={queryDescription} onChange={(e) => setQueryDescription(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
//           </div>
//         </div>

//         <div className="flex-1 p-4">
//           <textarea className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md" placeholder="Write your SQL query here..." value={queryText} onChange={(e) => setQueryText(e.target.value)} />

//           <div className="flex justify-between items-center mt-4">
//             <div className="space-x-2">
//               <button onClick={executeQuery} className="px-4 py-2 bg-indigo-600 text-white rounded-md"><Play className="h-4 w-4 mr-2" />Run Query</button>
//               <button onClick={validateQuery} className="px-4 py-2 bg-green-600 text-white rounded-md"><Sparkles className="h-4 w-4 mr-2" />Validate</button>
//             </div>
//             <div className="space-x-2">
//               <button onClick={saveQuery} className="px-4 py-2 bg-white border border-gray-300 rounded-md"><Save className="h-4 w-4 mr-2" />Save</button>
//             </div>
//           </div>

//           {validationMessage && <p className="mt-4 text-green-600">{validationMessage}</p>}

//           <div className="mt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {queryResult && queryResult.length > 0 && Object.keys(queryResult[0]).map((col, index) => (
//                         <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500">{col}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {queryResult && queryResult.length > 0 ? (
//                       queryResult.map((row, index) => (
//                         <tr key={index}>
//                           {Object.values(row).map((val, i) => (
//                             <td key={i} className="px-6 py-4 text-sm text-gray-500">{val}</td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>No results yet</td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QueryEditor;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles,Trash } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface Query {
//   name: string;
//   description: string;
//   query: string;
// }

// interface QueryResult {
//   [key: string]: string | number; // Example: Dynamic key-value pairs
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState<string>("");
//   const [queryDescription, setQueryDescription] = useState<string>("");
//   const [queryText, setQueryText] = useState<string>("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState<string>("");

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     }
//   };

//   const deleteQuery = async (queryName: string) => {
//     try {
//       await axios.delete(`${API_BASE_URL}/delete_query`, { data: { name: queryName } });
//       fetchSavedQueries();
//     } catch (error) {
//       console.error("Error deleting query:", error);
//     }
//   };

//   const executeQuery = async () => {
//     try {
//       const response = await axios.post<{ result: QueryResult[] }>(`${API_BASE_URL}/execute-query`, {
//         query: queryText,
//       });
//       setQueryResult(response.data.result);
//     } catch (error) {
//       console.error("Error executing query:", error);
//     }
//   };

//   const validateQuery = async () => {
//     try {
//       const response = await axios.post<{ description: string }>(`${API_BASE_URL}/validate-query`, {
//         query: queryText,
//       });
//       setValidationMessage(response.data.description);
//     } catch (error) {
//       console.error("Error validating query:", error);
//     }
//   };

//   const saveQuery = async () => {
//     try {
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//     } catch (error) {
//       console.error("Error saving query:", error);
//     }
//   };

//   return (
//     <div className="h-full flex">
//       {/* Saved Queries Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {savedQueries.map((query, index) => (
//               <div
//                 key={index}
//                 className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
//               >
                
//                 <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                 <p className="text-xs text-gray-500 mt-1">{query.description}</p>
               
//               </div>
              
//             ))}
//           </div>
//         </div>
//       </div>


//       {/* Main Editor Area */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         <div className="flex-1 p-4">
//           <textarea
//             className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Write your SQL query here..."
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 Run Query
//               </button>
//               <button
//                 onClick={validateQuery}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//   onClick={() => {
//     setQueryText("");
//     setQueryName("");
//     setQueryDescription("");
//   }}
//   className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center"
// >
//   Clear
// </button>
//             </div>
//             <button
//               onClick={saveQuery}
//               className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center"
//             >
//               <Save className="h-4 w-4 mr-2" />
//               Save
//             </button>
            
//           </div>

//           {validationMessage && <p className="mt-4 text-green-600">{validationMessage}</p>}

//           {/* Query Results Table */}
//           <div className="mt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {queryResult.length > 0 &&
//                         Object.keys(queryResult[0]).map((col, index) => (
//                           <th
//                             key={index}
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                           >
//                             {col}
//                           </th>
//                         ))}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {queryResult.length > 0 ? (
//                       queryResult.map((row, index) => (
//                         <tr key={index}>
//                           {Object.values(row).map((val, i) => (
//                             <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                               {val}
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
//                           No results yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QueryEditor;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles, Trash2 } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface Query {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
// }

// interface QueryResult {
//   [key: string]: string | number;
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithParams = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query with parameters:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setShowParamModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       const response = await axios.post<{ description: string }>(
//         `${API_BASE_URL}/validate-query`,
//         { query: queryText }
//       );
//       setValidationMessage(response.data.description);
//     } catch (error: any) {
//       console.error("Error validating query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     if (!queryName.trim()) {
//       setValidationMessage("Please enter a name for your query");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//       setValidationMessage("Query saved successfully");
//     } catch (error: any) {
//       console.error("Error saving query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteQuery = async (id: number) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
//       fetchSavedQueries();
//       setValidationMessage("Query deleted successfully");
//     } catch (error: any) {
//       console.error("Error deleting query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadQuery = (query: Query) => {
//     setQueryName(query.name);
//     setQueryDescription(query.description);
//     setQueryText(query.query);
//     setQueryResult([]);
//     setValidationMessage("");
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {isLoading && savedQueries.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading...</div>
//             ) : savedQueries.length > 0 ? (
//               savedQueries.map((query) => (
//                 <div 
//                   key={query.id} 
//                   className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div 
//                       className="cursor-pointer flex-1"
//                       onClick={() => loadQuery(query)}
//                     >
//                       <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                       <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//                     </div>
//                     <button 
//                       onClick={() => deleteQuery(query.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm text-gray-500">No saved queries</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         <div className="flex-1 p-4">
//           <textarea
//             className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Write your SQL query here..."
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 {isLoading ? "Running..." : "Run Query"}
//               </button>
//               <button
//                 onClick={validateQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
//               >
//                 Clear
//               </button>
//             </div>

//             <button
//               onClick={saveQuery}
//               disabled={isLoading}
//               className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
//             >
//               <Save className="h-4 w-4 mr-2" />
//               Save
//             </button>
//           </div>

//           {validationMessage && (
//             <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
//               {validationMessage}
//             </p>
//           )}

//           {/* Results Table */}
//           <div className="mt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//               <div className="overflow-x-auto">
//                 {isLoading ? (
//                   <div className="p-4 text-center text-gray-500">Loading results...</div>
//                 ) : queryResult.length > 0 ? (
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         {Object.keys(queryResult[0]).map((col, index) => (
//                           <th
//                             key={index}
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                           >
//                             {col}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {queryResult.map((row, index) => (
//                         <tr key={index}>
//                           {Object.values(row).map((val, i) => (
//                             <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                               {val?.toString() || ""}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 ) : (
//                   <div className="p-4 text-center text-gray-500">No results yet</div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Parameter Modal */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles, Trash2, Share2, X } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface Query {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
// }

// interface QueryResult {
//   [key: string]: string | number;
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [aiAnalysis, setAiAnalysis] = useState(""); // New state for AI analysis
//   const [includeResults, setIncludeResults] = useState(true);

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query with parameters:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setShowParamModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setQueryResult([]); // Clear any previous results
//       const response = await axios.post<{ description: string }>(
//         `${API_BASE_URL}/validate-query`,
//         { query: queryText }
//       );
      
//       // Store the AI analysis in state
//       setAiAnalysis(response.data.description);
//       setValidationMessage("Query analyzed successfully");
//     } catch (error: any) {
//       console.error("Error validating query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setAiAnalysis("");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     if (!queryName.trim()) {
//       setValidationMessage("Please enter a name for your query");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//       setValidationMessage("Query saved successfully");
//     } catch (error: any) {
//       console.error("Error saving query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteQuery = async (id: number) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
//       fetchSavedQueries();
//       setValidationMessage("Query deleted successfully");
//     } catch (error: any) {
//       console.error("Error deleting query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadQuery = (query: Query) => {
//     setQueryName(query.name);
//     setQueryDescription(query.description);
//     setQueryText(query.query);
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis(""); // Clear any previous AI analysis
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
//   };

//   // Convert results to a formatted string for email
//   const formatResultsForEmail = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     // Create header row
//     const headers = Object.keys(results[0]);
//     let resultString = headers.join("\t") + "\n";
    
//     // Create data rows
//     results.forEach(row => {
//       resultString += Object.values(row).join("\t") + "\n";
//     });
    
//     return resultString;
//   };

//   // Create a CSV string from results
//   const resultsToCSV = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     const headers = Object.keys(results[0]);
//     let csv = headers.join(",") + "\n";
    
//     results.forEach(row => {
//       // Ensure proper CSV formatting with quotes around values that might contain commas
//       const values = Object.values(row).map(val => {
//         const strVal = String(val || "");
//         return strVal.includes(",") ? `"${strVal}"` : strVal;
//       });
//       csv += values.join(",") + "\n";
//     });
    
//     return csv;
//   };

//   const openShareModal = (query?: Query) => {
//     if (query) {
//       setQueryName(query.name);
//       setQueryDescription(query.description);
//       setQueryText(query.query);
//       // Need to execute the query to get results
//       // This is a simplified approach - you might want to check if there are already results
//       // or add a button to run the query first before sharing
//     }
    
//     // Create results section if available and option is checked
//     const resultSection = queryResult.length > 0 && includeResults
//       ? `\n\nResults:\n${formatResultsForEmail(queryResult)}`
//       : "";
    
//     // Pre-populate email subject and message
//     setEmailSubject(`Shared SQL Query: ${query ? query.name : queryName}`);
//     setEmailMessage(`Hi,\n\nI'm sharing this SQL query with you:\n\nName: ${query ? query.name : queryName}\nDescription: ${query ? query.description : queryDescription}\n\nQuery:\n${query ? query.query : queryText}${resultSection}\n\nRegards,`);
    
//     setShowShareModal(true);
//   };

//   const shareQuery = async () => {
//     if (!emailTo.trim()) {
//       setValidationMessage("Please enter a recipient email");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
      
//       // Prepare CSV attachment if including results
//       const attachment = includeResults && queryResult.length > 0
//         ? { 
//             fileName: `${queryName.replace(/\s+/g, '_')}_results.csv`,
//             content: resultsToCSV(queryResult),
//             contentType: 'text/csv'
//           }
//         : null;
      
//       await axios.post(`${API_BASE_URL}/share_query`, {
//         to_email: emailTo,
//         subject: emailSubject,
//         message: emailMessage,
//         query: {
//           name: queryName,
//           description: queryDescription,
//           query: queryText,
//         },
//         attachment: attachment,
//         includeResults: includeResults
//       });
//       setShowShareModal(false);
//       setValidationMessage("Query shared successfully");
//       // Reset email fields
//       setEmailTo("");
//       setEmailSubject("");
//       setEmailMessage("");
//     } catch (error: any) {
//       console.error("Error sharing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to render markdown content
//   const renderMarkdown = (content: string) => {
//     // This is a simple way to show the markdown content
//     return (
//       <div className="markdown-content p-4 bg-gray-50 rounded-md border border-gray-200">
//         <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
//       </div>
//     );
//   };

//   const needsToRunQuery = (query: Query) => {
//     // Check if the current query text is different from the selected saved query
//     return queryText !== query.query || queryResult.length === 0;
//   };

//   const prepareAndShareQuery = async (query: Query) => {
//     if (needsToRunQuery(query)) {
//       // Load the query first
//       setQueryName(query.name);
//       setQueryDescription(query.description);
//       setQueryText(query.query);
      
//       try {
//         setIsLoading(true);
//         // Execute the query to get results
//         const response = await axios.post<{ result: QueryResult[] }>(
//           `${API_BASE_URL}/execute-query`,
//           { query: query.query }
//         );
//         setQueryResult(response.data.result);
//         // Now open share modal with results
//         openShareModal(query);
//       } catch (error: any) {
//         console.error("Error executing query for sharing:", error);
//         setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//         // Still open share modal but without results
//         openShareModal(query);
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       // We already have the results, just open the share modal
//       openShareModal(query);
//     }
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {isLoading && savedQueries.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading...</div>
//             ) : savedQueries.length > 0 ? (
//               savedQueries.map((query) => (
//                 <div 
//                   key={query.id} 
//                   className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div 
//                       className="cursor-pointer flex-1"
//                       onClick={() => loadQuery(query)}
//                     >
//                       <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                       <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => prepareAndShareQuery(query)}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         <Share2 className="h-4 w-4" />
//                       </button>
//                       <button 
//                         onClick={() => deleteQuery(query.id)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm text-gray-500">No saved queries</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         <div className="flex-1 p-4 overflow-auto">
//           <textarea
//             className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Write your SQL query here..."
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 {isLoading ? "Running..." : "Run Query"}
//               </button>
//               <button
//                 onClick={validateQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
//               >
//                 Clear
//               </button>
//             </div>

//             <div className="flex space-x-2">
//               <button
//                 onClick={() => openShareModal()}
//                 disabled={!queryText.trim() || isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400"
//               >
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </button>
//               <button
//                 onClick={saveQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
//               >
//                 <Save className="h-4 w-4 mr-2" />
//                 Save
//               </button>
//             </div>
//           </div>

//           {validationMessage && (
//             <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
//               {validationMessage}
//             </p>
//           )}

//           {/* AI Analysis Section */}
//           {aiAnalysis && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 AI Query Analysis
//               </h3>
//               {renderMarkdown(aiAnalysis)}
//             </div>
//           )}

//           {/* Results Table */}
//           {queryResult.length > 0 && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//               <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//                 <div className="overflow-x-auto">
//                   {isLoading ? (
//                     <div className="p-4 text-center text-gray-500">Loading results...</div>
//                   ) : queryResult.length > 0 ? (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           {Object.keys(queryResult[0]).map((col, index) => (
//                             <th
//                               key={index}
//                               className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                             >
//                               {col}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {queryResult.map((row, index) => (
//                           <tr key={index}>
//                             {Object.values(row).map((val, i) => (
//                               <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                                 {val?.toString() || ""}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="p-4 text-center text-gray-500">No results yet</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Parameter Modal */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Share Query via Email</h3>
//               <button onClick={() => setShowShareModal(false)} className="text-gray-500">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Recipient Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Enter email address"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailTo}
//                   onChange={(e) => setEmailTo(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailSubject}
//                   onChange={(e) => setEmailSubject(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   className="w-full h-40 border border-gray-300 p-2 rounded-md"
//                   value={emailMessage}
//                   onChange={(e) => setEmailMessage(e.target.value)}
//                 />
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="includeResults"
//                   checked={includeResults}
//                   onChange={(e) => setIncludeResults(e.target.checked)}
//                   className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                 />
//                 <label htmlFor="includeResults" className="ml-2 text-sm text-gray-700">
//                   Include query results as CSV attachment
//                 </label>
//               </div>
//             </div>
            
//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowShareModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={shareQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
//               >
//                 {isLoading ? "Sending..." : "Send"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles, Trash2, Share2, X, Database } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces

// interface MongoContext {
//   database: string;
//   collection: string;
//   operation: string;
//   options?: any;
// }

// interface Query {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
//   type: "sql" | "mongo"; // Add type field to distinguish between SQL and MongoDB queries
//   mongoContext?: MongoContext;
// }

// interface QueryResult {
//   [key: string]: any; // More flexible type for MongoDB results
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [aiAnalysis, setAiAnalysis] = useState("");
//   const [includeResults, setIncludeResults] = useState(true);
//   const [queryType, setQueryType] = useState<"sql" | "mongo">("sql"); // New state for query type
//   const [collection, setCollection] = useState(""); // MongoDB collection name
//   const [mongoDb, setMongoDb] = useState(""); // MongoDB database name
//   const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
//   const [availableCollections, setAvailableCollections] = useState<string[]>([]);
//   const [mongoOperation, setMongoOperation] = useState("find"); // Default MongoDB operation
//   const [mongoOptions, setMongoOptions] = useState("{}"); // Options for MongoDB operations

//   useEffect(() => {
//     fetchSavedQueries();
//     if (queryType === "mongo") {
//       fetchMongoDatabases();
//     }
//   }, [queryType]);

//   useEffect(() => {
//     if (queryType === "mongo" && mongoDb) {
//       fetchMongoCollections();
//     }
//   }, [mongoDb, queryType]);

//   const fetchSavedQueries = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchMongoDatabases = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<string[]>(`${API_BASE_URL}/mongo/databases`);
//       setAvailableDatabases(response.data);
//     } catch (error) {
//       console.error("Error fetching MongoDB databases:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchMongoCollections = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<string[]>(`${API_BASE_URL}/mongo/collections?db=${mongoDb}`);
//       setAvailableCollections(response.data);
//     } catch (error) {
//       console.error("Error fetching MongoDB collections:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = async () => {
//     if (queryType === "sql") {
//       executeSqlQuery();
//     } else {
//       executeMongoQuery();
//     }
//   };

//   const executeSqlQuery = () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const executeMongoQuery = async () => {
//     if (!mongoDb.trim()) {
//       setValidationMessage("Please select a database");
//       return;
//     }
    
//     if (!collection.trim()) {
//       setValidationMessage("Please select a collection");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
      
//       let query = queryText;
//       // If query is empty, use an empty object for find operation
//       if (!query.trim() && mongoOperation === "find") {
//         query = "{}";
//       }
      
//       if (!query.trim()) {
//         setValidationMessage("Please enter a query first");
//         setIsLoading(false);
//         return;
//       }
      
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/mongo/execute`,
//         {
//           database: mongoDb,
//           collection: collection,
//           operation: mongoOperation,
//           query: query,
//           options: mongoOptions
//         }
//       );
      
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing MongoDB query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithParams = async () => {
//     // This is SQL-specific
//     try {
//       setIsLoading(true);
//       setAiAnalysis("");
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query with parameters:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setShowParamModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setQueryResult([]);
      
//       // Different validation endpoints for SQL vs MongoDB
//       const endpoint = queryType === "sql" 
//         ? `${API_BASE_URL}/validate-query`
//         : `${API_BASE_URL}/mongo/validate`;
        
//       const payload = queryType === "sql" 
//         ? { query: queryText }
//         : { 
//             database: mongoDb,
//             collection: collection,
//             operation: mongoOperation,
//             query: queryText
//           };
      
//       const response = await axios.post<{ description: string }>(endpoint, payload);
      
//       setAiAnalysis(response.data.description);
//       setValidationMessage("Query analyzed successfully");
//     } catch (error: any) {
//       console.error("Error validating query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setAiAnalysis("");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveQuery = async () => {
//     if ((queryType === "sql" && !queryText.trim()) || 
//         (queryType === "mongo" && !queryText.trim() && mongoOperation !== "find")) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     if (!queryName.trim()) {
//       setValidationMessage("Please enter a name for your query");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
      
//       // For MongoDB queries, store the complete context
//       const mongoContext = queryType === "mongo" ? {
//         database: mongoDb,
//         collection: collection,
//         operation: mongoOperation,
//         options: mongoOptions
//       } : null;
      
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//         type: queryType,
//         mongoContext: mongoContext
//       });
      
//       fetchSavedQueries();
//       setValidationMessage("Query saved successfully");
//     } catch (error: any) {
//       console.error("Error saving query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteQuery = async (id: number) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
//       fetchSavedQueries();
//       setValidationMessage("Query deleted successfully");
//     } catch (error: any) {
//       console.error("Error deleting query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadQuery = (query: Query) => {
//     setQueryName(query.name);
//     setQueryDescription(query.description);
//     setQueryText(query.query);
//     setQueryType(query.type || "sql");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
    
//     // Handle MongoDB specific fields
//     if (query.type === "mongo" && query.mongoContext) {
//       setMongoDb(query.mongoContext.database);
//       setCollection(query.mongoContext.collection);
//       setMongoOperation(query.mongoContext.operation);
//       setMongoOptions(query.mongoContext.options);
//     }
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
    
//     // Keep the current query type selected
//     if (queryType === "mongo") {
//       // Just clear the mongo-specific fields
//       setMongoOptions("{}");
//     }
//   };

//   const toggleQueryType = (type: "sql" | "mongo") => {
//     if (type !== queryType) {
//       setQueryType(type);
//       clearFields();
//     }
//   };

//   // Format results for email
//   const formatResultsForEmail = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     // Create header row
//     const headers = Object.keys(results[0]);
//     let resultString = headers.join("\t") + "\n";
    
//     // Create data rows
//     results.forEach(row => {
//       resultString += Object.values(row).map(val => 
//         typeof val === 'object' ? JSON.stringify(val) : val
//       ).join("\t") + "\n";
//     });
    
//     return resultString;
//   };

//   // Create a CSV string from results
//   const resultsToCSV = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     const headers = Object.keys(results[0]);
//     let csv = headers.join(",") + "\n";
    
//     results.forEach(row => {
//       // Handle MongoDB objects properly
//       const values = Object.values(row).map(val => {
//         const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || "");
//         return strVal.includes(",") ? `"${strVal}"` : strVal;
//       });
//       csv += values.join(",") + "\n";
//     });
    
//     return csv;
//   };

//   const openShareModal = (query?: Query) => {
//     if (query) {
//       setQueryName(query.name);
//       setQueryDescription(query.description);
//       setQueryText(query.query);
//       setQueryType(query.type || "sql");
      
//       // Handle MongoDB specific fields if present
//       if (query.type === "mongo" && query.mongoContext) {
//         setMongoDb(query.mongoContext.database);
//         setCollection(query.mongoContext.collection);
//         setMongoOperation(query.mongoContext.operation);
//         setMongoOptions(query.mongoContext.options);
//       }
//     }
    
//     // Create results section if available and option is checked
//     const resultSection = queryResult.length > 0 && includeResults
//       ? `\n\nResults:\n${formatResultsForEmail(queryResult)}`
//       : "";
    
//     const queryTypeInfo = queryType === "mongo" 
//       ? `\nType: MongoDB\nDatabase: ${mongoDb}\nCollection: ${collection}\nOperation: ${mongoOperation}` 
//       : "\nType: SQL";
    
//     // Pre-populate email subject and message
//     setEmailSubject(`Shared ${queryType.toUpperCase()} Query: ${query ? query.name : queryName}`);
//     setEmailMessage(`Hi,\n\nI'm sharing this ${queryType.toUpperCase()} query with you:\n\nName: ${query ? query.name : queryName}\nDescription: ${query ? query.description : queryDescription}${queryTypeInfo}\n\nQuery:\n${query ? query.query : queryText}${resultSection}\n\nRegards,`);
    
//     setShowShareModal(true);
//   };

//   const shareQuery = async () => {
//     if (!emailTo.trim()) {
//       setValidationMessage("Please enter a recipient email");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
      
//       // Prepare CSV attachment if including results
//       const attachment = includeResults && queryResult.length > 0
//         ? { 
//             fileName: `${queryName.replace(/\s+/g, '_')}_results.csv`,
//             content: resultsToCSV(queryResult),
//             contentType: 'text/csv'
//           }
//         : null;
      
//       const mongoContext = queryType === "mongo" ? {
//         database: mongoDb,
//         collection: collection,
//         operation: mongoOperation,
//         options: mongoOptions
//       } : null;
      
//       await axios.post(`${API_BASE_URL}/share_query`, {
//         to_email: emailTo,
//         subject: emailSubject,
//         message: emailMessage,
//         query: {
//           name: queryName,
//           description: queryDescription,
//           query: queryText,
//           type: queryType,
//           mongoContext: mongoContext
//         },
//         attachment: attachment,
//         includeResults: includeResults
//       });
      
//       setShowShareModal(false);
//       setValidationMessage("Query shared successfully");
//       setEmailTo("");
//       setEmailSubject("");
//       setEmailMessage("");
//     } catch (error: any) {
//       console.error("Error sharing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to render markdown content
//   const renderMarkdown = (content: string) => {
//     return (
//       <div className="markdown-content p-4 bg-gray-50 rounded-md border border-gray-200">
//         <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
//       </div>
//     );
//   };

//   // MongoDB specific UI components
//   const renderMongoInterface = () => {
//     return (
//       <>
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Database
//             </label>
//             <select
//               className="w-full border border-gray-300 p-2 rounded-md"
//               value={mongoDb}
//               onChange={(e) => setMongoDb(e.target.value)}
//             >
//               <option value="">Select Database</option>
//               {availableDatabases.map((db) => (
//                 <option key={db} value={db}>
//                   {db}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Collection
//             </label>
//             <select
//               className="w-full border border-gray-300 p-2 rounded-md"
//               value={collection}
//               onChange={(e) => setCollection(e.target.value)}
//               disabled={!mongoDb}
//             >
//               <option value="">Select Collection</option>
//               {availableCollections.map((col) => (
//                 <option key={col} value={col}>
//                   {col}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Operation
//             </label>
//             <select
//               className="w-full border border-gray-300 p-2 rounded-md"
//               value={mongoOperation}
//               onChange={(e) => setMongoOperation(e.target.value)}
//             >
//               <option value="find">find</option>
//               <option value="findOne">findOne</option>
//               <option value="count">count</option>
//               <option value="distinct">distinct</option>
//               <option value="aggregate">aggregate</option>
//             </select>
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Options (JSON format)
//             </label>
//             <input
//               type="text"
//               placeholder='{"limit": 10, "sort": {"_id": -1}}'
//               className="w-full border border-gray-300 p-2 rounded-md"
//               value={mongoOptions}
//               onChange={(e) => setMongoOptions(e.target.value)}
//             />
//           </div>
//         </div>
        
//         <textarea
//           className="w-full h-40 p-4 font-mono text-sm border border-gray-300 rounded-md"
//           placeholder={getMongoPlaceholderText()}
//           value={queryText}
//           onChange={(e) => setQueryText(e.target.value)}
//         />
//       </>
//     );
//   };
  
//   const getMongoPlaceholderText = () => {
//     switch (mongoOperation) {
//       case 'find':
//         return '{ "status": "active", "age": { "$gte": 18 } }';
//       case 'findOne':
//         return '{ "_id": ObjectId("507f1f77bcf86cd799439011") }';
//       case 'count':
//         return '{ "category": "books" }';
//       case 'distinct':
//         return '"category"  // Field name to find distinct values';
//       case 'aggregate':
//         return '[\n  { "$match": { "status": "active" } },\n  { "$group": { "_id": "$category", "count": { "$sum": 1 } } }\n]';
//       default:
//         return 'Enter MongoDB query in JSON format...';
//     }
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {isLoading && savedQueries.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading...</div>
//             ) : savedQueries.length > 0 ? (
//               savedQueries.map((query) => (
//                 <div 
//                   key={query.id} 
//                   className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div 
//                       className="cursor-pointer flex-1"
//                       onClick={() => loadQuery(query)}
//                     >
//                       <div className="flex items-center">
//                         <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                         <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
//                           query.type === "mongo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
//                         }`}>
//                           {query.type === "mongo" ? "MongoDB" : "SQL"}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openShareModal(query);
//                         }}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         <Share2 className="h-4 w-4" />
//                       </button>
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteQuery(query.id);
//                         }}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm text-gray-500">No saved queries</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         {/* Query Type Toggle */}
//         <div className="flex border-b border-gray-200">
//           <button
//             onClick={() => toggleQueryType("sql")}
//             className={`flex-1 py-2 text-center font-medium ${
//               queryType === "sql" 
//                 ? "text-blue-600 border-b-2 border-blue-600" 
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             SQL Editor
//           </button>
//           <button
//             onClick={() => toggleQueryType("mongo")}
//             className={`flex-1 py-2 text-center font-medium ${
//               queryType === "mongo" 
//                 ? "text-green-600 border-b-2 border-green-600" 
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             MongoDB Editor
//           </button>
//         </div>

//         <div className="flex-1 p-4 overflow-auto">
//           {/* Show different editor based on query type */}
//           {queryType === "sql" ? (
//             <textarea
//               className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//               placeholder="Write your SQL query here..."
//               value={queryText}
//               onChange={(e) => setQueryText(e.target.value)}
//             />
//           ) : (
//             renderMongoInterface()
//           )}

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 {isLoading ? "Running..." : "Run Query"}
//               </button>
//               <button
//                 onClick={validateQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
//               >
//                 Clear
//               </button>
//             </div>

//             <div className="flex space-x-2">
//               <button
//                 onClick={() => openShareModal()}
//                 disabled={(!queryText.trim() && queryType !== "mongo") || isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400"
//               >
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </button>
//               <button
//                 onClick={saveQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
//               >
//                 <Save className="h-4 w-4 mr-2" />
//                 Save
//               </button>
//             </div>
//           </div>

//           {validationMessage && (
//             <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
//               {validationMessage}
//             </p>
//           )}

//           {/* AI Analysis Section */}
//           {aiAnalysis && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 AI Query Analysis
//               </h3>
//               {renderMarkdown(aiAnalysis)}
//             </div>
//           )}

//           {/* Results Table */}
//           {queryResult.length > 0 && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//               <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//                 <div className="overflow-x-auto">
//                   {isLoading ? (
//                     <div className="p-4 text-center text-gray-500">Loading results...</div>
//                   ) : queryResult.length > 0 ? (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           {Object.keys(queryResult[0]).map((col, index) => (
//                             <th
//                               key={index}
//                               className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                             >
//                               {col}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {queryResult.map((row, index) => (
//                           <tr key={index}>
//                             {Object.entries(row).map(([key, val], i) => (
//                               <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                                 {typeof val === 'object' ? 
//                                   JSON.stringify(val) : 
//                                   (val?.toString() || "")}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="p-4 text-center text-gray-500">No results yet</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Parameter Modal - SQL specific */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
//           <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Share Query via Email</h3>
//               <button onClick={() => setShowShareModal(false)} className="text-gray-500">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Recipient Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Enter email address"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailTo}
//                   onChange={(e) => setEmailTo(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailSubject}
//                   onChange={(e) => setEmailSubject(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   className="w-full h-40 border border-gray-300 p-2 rounded-md"
//                   value={emailMessage}
//                   onChange={(e) => setEmailMessage(e.target.value)}
//                 />
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="includeResults"
//                   checked={includeResults}
//                   onChange={(e) => setIncludeResults(e.target.checked)}
//                   className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                 />
//                 <label htmlFor="includeResults" className="ml-2 text-sm text-gray-700">
//                   Include query results as CSV attachment
//                 </label>
//               </div>
//             </div>
            
//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowShareModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={shareQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
//               >
//                 {isLoading ? "Sending..." : "Send"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles, Trash2, Share2, X, Database } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface MongoCommand {
//   command: string;
//   database?: string;
// }

// interface Query {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
//   type: "sql" | "mongo";
//   database?: string; // For MongoDB, store the database name
// }

// interface QueryResult {
//   [key: string]: any; // More flexible type for MongoDB results
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [emailTo, setEmailTo] = useState("");
//   const [emailSubject, setEmailSubject] = useState("");
//   const [emailMessage, setEmailMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [aiAnalysis, setAiAnalysis] = useState("");
//   const [includeResults, setIncludeResults] = useState(true);
//   const [queryType, setQueryType] = useState<"sql" | "mongo">("sql");
//   const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
//   const [selectedDatabase, setSelectedDatabase] = useState("");

//   useEffect(() => {
//     fetchSavedQueries();
//     if (queryType === "mongo") {
//       fetchMongoDatabases();
//     }
//   }, [queryType]);

//   const fetchSavedQueries = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const fetchMongoDatabases = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<string[]>(`${API_BASE_URL}/mongo/databases`);
//       setAvailableDatabases(response.data);
//     } catch (error) {
//       console.error("Error fetching MongoDB databases:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = async () => {
//     if (queryType === "sql") {
//       executeSqlQuery();
//     } else {
//       executeMongoCommand();
//     }
//   };

//   const executeSqlQuery = () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const executeMongoCommand = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a MongoDB command");
//       return;
//     }

//     if (!selectedDatabase) {
//       setValidationMessage("Please select a database");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
      
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/mongo/execute-command`,
//         {
//           command: queryText,
//           database: selectedDatabase
//         }
//       );
      
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing MongoDB command:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithParams = async () => {
//     // This is SQL-specific
//     try {
//       setIsLoading(true);
//       setAiAnalysis("");
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query with parameters:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setShowParamModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setQueryResult([]);
      
//       // Different validation endpoints for SQL vs MongoDB
//       const endpoint = queryType === "sql" 
//         ? `${API_BASE_URL}/validate-query`
//         : `${API_BASE_URL}/mongo/validate-command`;
        
//       const payload = queryType === "sql" 
//         ? { query: queryText }
//         : { 
//             command: queryText,
//             database: selectedDatabase
//           };
      
//       const response = await axios.post<{ description: string }>(endpoint, payload);
      
//       setAiAnalysis(response.data.description);
//       setValidationMessage("Query analyzed successfully");
//     } catch (error: any) {
//       console.error("Error validating query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setAiAnalysis("");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     if (!queryName.trim()) {
//       setValidationMessage("Please enter a name for your query");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
      
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//         type: queryType,
//         database: queryType === "mongo" ? selectedDatabase : undefined
//       });
      
//       fetchSavedQueries();
//       setValidationMessage("Query saved successfully");
//     } catch (error: any) {
//       console.error("Error saving query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteQuery = async (id: number) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
//       fetchSavedQueries();
//       setValidationMessage("Query deleted successfully");
//     } catch (error: any) {
//       console.error("Error deleting query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadQuery = (query: Query) => {
//     setQueryName(query.name);
//     setQueryDescription(query.description);
//     setQueryText(query.query);
//     setQueryType(query.type || "sql");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
    
//     // Handle MongoDB specific fields
//     if (query.type === "mongo" && query.database) {
//       setSelectedDatabase(query.database);
//     }
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
//   };

//   const toggleQueryType = (type: "sql" | "mongo") => {
//     if (type !== queryType) {
//       setQueryType(type);
//       clearFields();
//     }
//   };

//   // Format results for email
//   const formatResultsForEmail = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     // Create header row
//     const headers = Object.keys(results[0]);
//     let resultString = headers.join("\t") + "\n";
    
//     // Create data rows
//     results.forEach(row => {
//       resultString += Object.values(row).map(val => 
//         typeof val === 'object' ? JSON.stringify(val) : val
//       ).join("\t") + "\n";
//     });
    
//     return resultString;
//   };

//   // Create a CSV string from results
//   const resultsToCSV = (results: QueryResult[]) => {
//     if (!results || results.length === 0) return "";
    
//     const headers = Object.keys(results[0]);
//     let csv = headers.join(",") + "\n";
    
//     results.forEach(row => {
//       // Handle MongoDB objects properly
//       const values = Object.values(row).map(val => {
//         const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || "");
//         return strVal.includes(",") ? `"${strVal}"` : strVal;
//       });
//       csv += values.join(",") + "\n";
//     });
    
//     return csv;
//   };

//   const openShareModal = (query?: Query) => {
//     if (query) {
//       setQueryName(query.name);
//       setQueryDescription(query.description);
//       setQueryText(query.query);
//       setQueryType(query.type || "sql");
      
//       // Handle MongoDB specific fields if present
//       if (query.type === "mongo" && query.database) {
//         setSelectedDatabase(query.database);
//       }
//     }
    
//     // Create results section if available and option is checked
//     const resultSection = queryResult.length > 0 && includeResults
//       ? `\n\nResults:\n${formatResultsForEmail(queryResult)}`
//       : "";
    
//     const queryTypeInfo = queryType === "mongo" 
//       ? `\nType: MongoDB\nDatabase: ${selectedDatabase}` 
//       : "\nType: SQL";
    
//     // Pre-populate email subject and message
//     setEmailSubject(`Shared ${queryType.toUpperCase()} Query: ${query ? query.name : queryName}`);
//     setEmailMessage(`Hi,\n\nI'm sharing this ${queryType.toUpperCase()} query with you:\n\nName: ${query ? query.name : queryName}\nDescription: ${query ? query.description : queryDescription}${queryTypeInfo}\n\nQuery:\n${query ? query.query : queryText}${resultSection}\n\nRegards,`);
    
//     setShowShareModal(true);
//   };

//   const shareQuery = async () => {
//     if (!emailTo.trim()) {
//       setValidationMessage("Please enter a recipient email");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
      
//       // Prepare CSV attachment if including results
//       const attachment = includeResults && queryResult.length > 0
//         ? { 
//             fileName: `${queryName.replace(/\s+/g, '_')}_results.csv`,
//             content: resultsToCSV(queryResult),
//             contentType: 'text/csv'
//           }
//         : null;
      
//       await axios.post(`${API_BASE_URL}/share_query`, {
//         to_email: emailTo,
//         subject: emailSubject,
//         message: emailMessage,
//         query: {
//           name: queryName,
//           description: queryDescription,
//           query: queryText,
//           type: queryType,
//           database: queryType === "mongo" ? selectedDatabase : undefined
//         },
//         attachment: attachment,
//         includeResults: includeResults
//       });
      
//       setShowShareModal(false);
//       setValidationMessage("Query shared successfully");
//       setEmailTo("");
//       setEmailSubject("");
//       setEmailMessage("");
//     } catch (error: any) {
//       console.error("Error sharing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Function to render markdown content
//   const renderMarkdown = (content: string) => {
//     return (
//       <div className="markdown-content p-4 bg-gray-50 rounded-md border border-gray-200">
//         <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
//       </div>
//     );
//   };

//   // MongoDB specific UI components
//   const renderMongoInterface = () => {
//     return (
//       <div className="flex flex-col space-y-4">
//         <div className="flex">
//           <div className="w-1/3 pr-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Database
//             </label>
//             <select
//               className="w-full border border-gray-300 p-2 rounded-md"
//               value={selectedDatabase}
//               onChange={(e) => setSelectedDatabase(e.target.value)}
//             >
//               <option value="">Select Database</option>
//               {availableDatabases.map((db) => (
//                 <option key={db} value={db}>
//                   {db}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="w-2/3">
//             <div className="flex items-center h-full pt-6">
//               <span className="text-sm text-gray-500">
//                 {selectedDatabase ? 
//                   `Connected to ${selectedDatabase}` : 
//                   "Select a database to execute commands"}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="w-full">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             MongoDB Command
//           </label>
//           <textarea
//             className="w-full h-56 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Enter MongoDB command (e.g. db.users.find({status: 'active'}))"
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />
//           <p className="mt-1 text-xs text-gray-500">
//             Write MongoDB commands as you would in the mongo shell. Commands are executed against the selected database.
//           </p>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {isLoading && savedQueries.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading...</div>
//             ) : savedQueries.length > 0 ? (
//               savedQueries.map((query) => (
//                 <div 
//                   key={query.id} 
//                   className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div 
//                       className="cursor-pointer flex-1"
//                       onClick={() => loadQuery(query)}
//                     >
//                       <div className="flex items-center">
//                         <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                         <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
//                           query.type === "mongo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
//                         }`}>
//                           {query.type === "mongo" ? "MongoDB" : "SQL"}
//                         </span>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           openShareModal(query);
//                         }}
//                         className="text-blue-500 hover:text-blue-700"
//                       >
//                         <Share2 className="h-4 w-4" />
//                       </button>
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteQuery(query.id);
//                         }}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm text-gray-500">No saved queries</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         {/* Query Type Toggle */}
//         <div className="flex border-b border-gray-200">
//           <button
//             onClick={() => toggleQueryType("sql")}
//             className={`flex-1 py-2 text-center font-medium ${
//               queryType === "sql" 
//                 ? "text-blue-600 border-b-2 border-blue-600" 
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             SQL Editor
//           </button>
//           <button
//             onClick={() => toggleQueryType("mongo")}
//             className={`flex-1 py-2 text-center font-medium ${
//               queryType === "mongo" 
//                 ? "text-green-600 border-b-2 border-green-600" 
//                 : "text-gray-500 hover:text-gray-700"
//             }`}
//           >
//             MongoDB Shell
//           </button>
//         </div>

//         <div className="flex-1 p-4 overflow-auto">
//           {/* Show different editor based on query type */}
//           {queryType === "sql" ? (
//             <textarea
//               className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//               placeholder="Write your SQL query here..."
//               value={queryText}
//               onChange={(e) => setQueryText(e.target.value)}
//             />
//           ) : (
//             renderMongoInterface()
//           )}

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 disabled={isLoading || (queryType === "mongo" && !selectedDatabase)}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 {isLoading ? "Running..." : "Run Command"}
//               </button>
//               <button
//                 onClick={validateQuery}
//                 disabled={isLoading || (queryType === "mongo" && !selectedDatabase)}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
//               >
//                 Clear
//               </button>
//             </div>

//             <div className="flex space-x-2">
//               <button
//                 onClick={() => openShareModal()}
//                 disabled={!queryText.trim() || isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400"
//               >
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </button>
//               <button
//                 onClick={saveQuery}
//                 disabled={isLoading || !queryText.trim() || !queryName.trim() || (queryType === "mongo" && !selectedDatabase)}
//                 className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
//               >
//                 <Save className="h-4 w-4 mr-2" />
//                 Save
//               </button>
//             </div>
//           </div>

//           {validationMessage && (
//             <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
//               {validationMessage}
//             </p>
//           )}

//           {/* AI Analysis Section */}
//           {aiAnalysis && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 AI Query Analysis
//               </h3>
//               {renderMarkdown(aiAnalysis)}
//             </div>
//           )}

//           {/* Results Table */}
//           {queryResult.length > 0 && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//               <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//                 <div className="overflow-x-auto">
//                   {isLoading ? (
//                     <div className="p-4 text-center text-gray-500">Loading results...</div>
//                   ) : queryResult.length > 0 ? (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           {Object.keys(queryResult[0]).map((col, index) => (
//                             <th
//                               key={index}
//                               className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                             >
//                               {col}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {queryResult.map((row, index) => (
//                           <tr key={index}>
//                             {Object.entries(row).map(([key, val], i) => (
//                               <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                                 {typeof val === 'object' ? 
//                                   JSON.stringify(val) : 
//                                   (val?.toString() || "")}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="p-4 text-center text-gray-500">No results yet</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Parameter Modal - SQL specific */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Share Modal */}
//       {showShareModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
//           <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">Share Query via Email</h3>
//               <button onClick={() => setShowShareModal(false)} className="text-gray-500">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
            
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Recipient Email
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="Enter email address"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailTo}
//                   onChange={(e) => setEmailTo(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Subject
//                 </label>
//                 <input
//                   type="text"
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={emailSubject}
//                   onChange={(e) => setEmailSubject(e.target.value)}
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   className="w-full h-40 border border-gray-300 p-2 rounded-md"
//                   value={emailMessage}
//                   onChange={(e) => setEmailMessage(e.target.value)}
//                 />
//               </div>

//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="includeResults"
//                   checked={includeResults}
//                   onChange={(e) => setIncludeResults(e.target.checked)}
//                   className="h-4 w-4 text-blue-600 border-gray-300 rounded"
//                 />
//                 <label htmlFor="includeResults" className="ml-2 text-sm text-gray-700">
//                   Include query results as CSV attachment
//                 </label>
//               </div>
//             </div>
            
//             <div className="mt-6 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowShareModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={shareQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
//               >
//                 {isLoading ? "Sending..." : "Send"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Save, Play, Sparkles, Trash2, Share2, X, Database, Search } from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

// Define TypeScript Interfaces
interface MongoCommand {
  command: string;
  database?: string;
}

interface Query {
  id: number;
  name: string;
  description: string;
  query: string;
  type: "sql" | "mongo";
  database?: string; // For MongoDB, store the database name
}

interface QueryResult {
  [key: string]: any; // More flexible type for MongoDB results
}

// Add interface for auto-completion
interface AutoCompleteSuggestion {
  suggestions: string[];
  complete_query: string;
}

const QueryEditor: React.FC = () => {
  const [savedQueries, setSavedQueries] = useState<Query[]>([]);
  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [queryText, setQueryText] = useState("");
  const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [paramCount, setParamCount] = useState(0);
  const [paramValues, setParamValues] = useState<string[]>([]);
  const [showParamModal, setShowParamModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [includeResults, setIncludeResults] = useState(true);
  const [queryType, setQueryType] = useState<"sql" | "mongo">("sql");
  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  
  // Auto-completion state
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<string[]>([]);
  const [completeQuerySuggestion, setCompleteQuerySuggestion] = useState<string>("");
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
  const [isAutoCompleteLoading, setIsAutoCompleteLoading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoCompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSavedQueries();
    if (queryType === "mongo") {
      fetchMongoDatabases();
    }
  }, [queryType]);

  // Auto-complete outside click handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autoCompleteRef.current && !autoCompleteRef.current.contains(event.target as Node)) {
        setShowAutoComplete(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchSavedQueries = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
      setSavedQueries(response.data);
    } catch (error) {
      console.error("Error fetching saved queries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMongoDatabases = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<string[]>(`${API_BASE_URL}/mongo/databases`);
      setAvailableDatabases(response.data);
    } catch (error) {
      console.error("Error fetching MongoDB databases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (queryType === "sql") {
      executeSqlQuery();
    } else {
      executeMongoCommand();
    }
  };

  const executeSqlQuery = () => {
    if (!queryText.trim()) {
      setValidationMessage("Please enter a query first");
      return;
    }
    
    const count = (queryText.match(/\?/g) || []).length;
    if (count > 0) {
      setParamCount(count);
      setParamValues(Array(count).fill(""));
      setShowParamModal(true);
    } else {
      runQueryWithoutParams();
    }
  };

  const executeMongoCommand = async () => {
    if (!queryText.trim()) {
      setValidationMessage("Please enter a MongoDB command");
      return;
    }

    if (!selectedDatabase) {
      setValidationMessage("Please select a database");
      return;
    }
    
    try {
      setIsLoading(true);
      setAiAnalysis(""); // Clear any previous AI analysis
      
      const response = await axios.post<{ result: QueryResult[] }>(
        `${API_BASE_URL}/mongo/execute-command`,
        {
          command: queryText,
          database: selectedDatabase
        }
      );
      
      setQueryResult(response.data.result);
      setValidationMessage("");
    } catch (error: any) {
      console.error("Error executing MongoDB command:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runQueryWithoutParams = async () => {
    try {
      setIsLoading(true);
      setAiAnalysis(""); // Clear any previous AI analysis
      const response = await axios.post<{ result: QueryResult[] }>(
        `${API_BASE_URL}/execute-query`,
        { query: queryText }
      );
      setQueryResult(response.data.result);
      setValidationMessage("");
    } catch (error: any) {
      console.error("Error executing query:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runQueryWithParams = async () => {
    // This is SQL-specific
    try {
      setIsLoading(true);
      setAiAnalysis("");
      const response = await axios.post<{ result: QueryResult[] }>(
        `${API_BASE_URL}/execute-query`,
        {
          query: queryText,
          parameters: paramValues,
        }
      );
      setQueryResult(response.data.result);
      setShowParamModal(false);
      setValidationMessage("");
    } catch (error: any) {
      console.error("Error executing query with parameters:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
      setShowParamModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validateQuery = async () => {
    if (!queryText.trim()) {
      setValidationMessage("Please enter a query first");
      return;
    }
    
    try {
      setIsLoading(true);
      setQueryResult([]);
      
      // Different validation endpoints for SQL vs MongoDB
      const endpoint = queryType === "sql" 
        ? `${API_BASE_URL}/validate-query`
        : `${API_BASE_URL}/mongo/validate-command`;
        
      const payload = queryType === "sql" 
        ? { query: queryText }
        : { 
            command: queryText,
            database: selectedDatabase
          };
      
      const response = await axios.post<{ description: string }>(endpoint, payload);
      
      setAiAnalysis(response.data.description);
      setValidationMessage("Query analyzed successfully");
    } catch (error: any) {
      console.error("Error validating query:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
      setAiAnalysis("");
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuery = async () => {
    if (!queryText.trim()) {
      setValidationMessage("Please enter a query first");
      return;
    }
    
    if (!queryName.trim()) {
      setValidationMessage("Please enter a name for your query");
      return;
    }
    
    try {
      setIsLoading(true);
      
      await axios.post(`${API_BASE_URL}/save_query`, {
        name: queryName,
        description: queryDescription,
        query: queryText,
        type: queryType,
        database: queryType === "mongo" ? selectedDatabase : undefined
      });
      
      fetchSavedQueries();
      setValidationMessage("Query saved successfully");
    } catch (error: any) {
      console.error("Error saving query:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuery = async (id: number) => {
    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
      fetchSavedQueries();
      setValidationMessage("Query deleted successfully");
    } catch (error: any) {
      console.error("Error deleting query:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuery = (query: Query) => {
    setQueryName(query.name);
    setQueryDescription(query.description);
    setQueryText(query.query);
    setQueryType(query.type || "sql");
    setQueryResult([]);
    setValidationMessage("");
    setAiAnalysis("");
    
    // Handle MongoDB specific fields
    if (query.type === "mongo" && query.database) {
      setSelectedDatabase(query.database);
    }
  };

  const clearFields = () => {
    setQueryName("");
    setQueryDescription("");
    setQueryText("");
    setQueryResult([]);
    setValidationMessage("");
    setAiAnalysis("");
  };

  const toggleQueryType = (type: "sql" | "mongo") => {
    if (type !== queryType) {
      setQueryType(type);
      clearFields();
    }
  };

  // Format results for email
  const formatResultsForEmail = (results: QueryResult[]) => {
    if (!results || results.length === 0) return "";
    
    // Create header row
    const headers = Object.keys(results[0]);
    let resultString = headers.join("\t") + "\n";
    
    // Create data rows
    results.forEach(row => {
      resultString += Object.values(row).map(val => 
        typeof val === 'object' ? JSON.stringify(val) : val
      ).join("\t") + "\n";
    });
    
    return resultString;
  };

  // Create a CSV string from results
  const resultsToCSV = (results: QueryResult[]) => {
    if (!results || results.length === 0) return "";
    
    const headers = Object.keys(results[0]);
    let csv = headers.join(",") + "\n";
    
    results.forEach(row => {
      // Handle MongoDB objects properly
      const values = Object.values(row).map(val => {
        const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || "");
        return strVal.includes(",") ? `"${strVal}"` : strVal;
      });
      csv += values.join(",") + "\n";
    });
    
    return csv;
  };

  const openShareModal = (query?: Query) => {
    if (query) {
      setQueryName(query.name);
      setQueryDescription(query.description);
      setQueryText(query.query);
      setQueryType(query.type || "sql");
      
      // Handle MongoDB specific fields if present
      if (query.type === "mongo" && query.database) {
        setSelectedDatabase(query.database);
      }
    }
    
    // Create results section if available and option is checked
    const resultSection = queryResult.length > 0 && includeResults
      ? `\n\nResults:\n${formatResultsForEmail(queryResult)}`
      : "";
    
    const queryTypeInfo = queryType === "mongo" 
      ? `\nType: MongoDB\nDatabase: ${selectedDatabase}` 
      : "\nType: SQL";
    
    // Pre-populate email subject and message
    setEmailSubject(`Shared ${queryType.toUpperCase()} Query: ${query ? query.name : queryName}`);
    setEmailMessage(`Hi,\n\nI'm sharing this ${queryType.toUpperCase()} query with you:\n\nName: ${query ? query.name : queryName}\nDescription: ${query ? query.description : queryDescription}${queryTypeInfo}\n\nQuery:\n${query ? query.query : queryText}${resultSection}\n\nRegards,`);
    
    setShowShareModal(true);
  };

  const shareQuery = async () => {
    if (!emailTo.trim()) {
      setValidationMessage("Please enter a recipient email");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare CSV attachment if including results
      const attachment = includeResults && queryResult.length > 0
        ? { 
            fileName: `${queryName.replace(/\s+/g, '_')}_results.csv`,
            content: resultsToCSV(queryResult),
            contentType: 'text/csv'
          }
        : null;
      
      await axios.post(`${API_BASE_URL}/share_query`, {
        to_email: emailTo,
        subject: emailSubject,
        message: emailMessage,
        query: {
          name: queryName,
          description: queryDescription,
          query: queryText,
          type: queryType,
          database: queryType === "mongo" ? selectedDatabase : undefined
        },
        attachment: attachment,
        includeResults: includeResults
      });
      
      setShowShareModal(false);
      setValidationMessage("Query shared successfully");
      setEmailTo("");
      setEmailSubject("");
      setEmailMessage("");
    } catch (error: any) {
      console.error("Error sharing query:", error);
      setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render markdown content
  const renderMarkdown = (content: string) => {
    return (
      <div className="markdown-content p-4 bg-gray-50 rounded-md border border-gray-200">
        <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
      </div>
    );
  };

  // MongoDB specific UI components
  const renderMongoInterface = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex">
          <div className="w-1/3 pr-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Database
            </label>
            <select
              className="w-full border border-gray-300 p-2 rounded-md"
              value={selectedDatabase}
              onChange={(e) => setSelectedDatabase(e.target.value)}
            >
              <option value="">Select Database</option>
              {availableDatabases.map((db) => (
                <option key={db} value={db}>
                  {db}
                </option>
              ))}
            </select>
          </div>
          <div className="w-2/3">
            <div className="flex items-center h-full pt-6">
              <span className="text-sm text-gray-500">
                {selectedDatabase ? 
                  `Connected to ${selectedDatabase}` : 
                  "Select a database to execute commands"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MongoDB Command
          </label>
          <textarea
            className="w-full h-56 p-4 font-mono text-sm border border-gray-300 rounded-md"
            placeholder="Enter MongoDB command (e.g. db.users.find({status: 'active'}))"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Write MongoDB commands as you would in the mongo shell. Commands are executed against the selected database.
          </p>
        </div>
      </div>
    );
  };

  // Auto-completion related functions
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQueryText(e.target.value);
    if (queryType === "sql") {
      // Reset suggestions when the query changes
      setShowAutoComplete(false);
    }
  };

  const handleTextareaKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Get cursor position
    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);

    // Handle special keys for suggestion navigation
    if (showAutoComplete && autoCompleteSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < autoCompleteSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => prev > 0 ? prev - 1 : 0);
      } else if (e.key === "Enter" && showAutoComplete) {
        e.preventDefault();
        insertSuggestion(autoCompleteSuggestions[selectedSuggestionIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowAutoComplete(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        insertSuggestion(autoCompleteSuggestions[selectedSuggestionIndex]);
      }
    } else if (e.ctrlKey && e.key === " " && queryType === "sql") {
      // Ctrl+Space triggers auto-completion
      e.preventDefault();
      fetchAutoCompleteSuggestions();
    }
  };

  const fetchAutoCompleteSuggestions = async () => {
    if (!queryText || queryType !== "sql") return;
    
    try {
      setIsAutoCompleteLoading(true);
      const response = await axios.post<AutoCompleteSuggestion>(
        `${API_BASE_URL}/autocomplete-query`,
        {
          partial_query: queryText,
          cursor_position: cursorPosition
        }
      );
      
      if (response.data.suggestions && response.data.suggestions.length > 0) {
        setAutoCompleteSuggestions(response.data.suggestions);
        setCompleteQuerySuggestion(response.data.complete_query);
        setSelectedSuggestionIndex(0);
        setShowAutoComplete(true);
      } else {
        setShowAutoComplete(false);
      }
    } catch (error) {
      console.error("Error fetching auto-completion suggestions:", error);
    } finally {
      setIsAutoCompleteLoading(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    
    // Find the word boundary before the cursor
    let startPos = cursorPos;
    while (startPos > 0) {
      const prevChar = queryText.charAt(startPos - 1);
      if (/\s|[,()=]/.test(prevChar)) {
        break;
      }
      startPos--;
    }
    
    // Create the new query text with the suggestion inserted
    const textBefore = queryText.substring(0, startPos);
    const textAfter = queryText.substring(cursorPos);
    const newText = textBefore + suggestion + textAfter;
    
    setQueryText(newText);
    setShowAutoComplete(false);
    
    // Set cursor position after the suggestion
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = startPos + suggestion.length;
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const useCompleteSuggestion = () => {
    if (completeQuerySuggestion) {
      setQueryText(completeQuerySuggestion);
      setShowAutoComplete(false);
    }
  };

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
          <div className="mt-4 space-y-2">
            {isLoading && savedQueries.length === 0 ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : savedQueries.length > 0 ? (
              savedQueries.map((query) => (
                <div 
                  key={query.id} 
                  className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => loadQuery(query)}
                    >
                      <div className="flex items-center">
                        <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          query.type === "mongo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {query.type === "mongo" ? "MongoDB" : "SQL"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{query.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openShareModal(query);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuery(query.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No saved queries</div>
            )}
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Query Name"
              value={queryName}
              onChange={(e) => setQueryName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="Description"
              value={queryDescription}
              onChange={(e) => setQueryDescription(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Query Type Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => toggleQueryType("sql")}
            className={`flex-1 py-2 text-center font-medium ${
              queryType === "sql" 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            SQL Editor
          </button>
          <button
            onClick={() => toggleQueryType("mongo")}
            className={`flex-1 py-2 text-center font-medium ${
              queryType === "mongo" 
                ? "text-green-600 border-b-2 border-green-600" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            MongoDB Shell
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {/* Show different editor based on query type */}
          {queryType === "sql" ? (
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
                placeholder="Write your SQL query here... (Press Ctrl+Space for auto-completion)"
                value={queryText}
                onChange={handleTextareaChange}
                onKeyDown={handleTextareaKeyDown}
              />
              
              {/* Auto-completion popup */}
              {showAutoComplete && (
                <div 
                  ref={autoCompleteRef}
                  className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-64"
                  style={{ top: textareaRef.current?.selectionStart ? '100%' : '100%', left: '0' }}
                >
                  <div className="p-2 bg-gray-100 border-b border-gray-300 flex justify-between items-center">
                    <span className="text-xs font-medium">Suggestions</span>
                    {isAutoCompleteLoading && <span className="text-xs text-gray-500">Loading...</span>}
                  </div>
                  <ul className="py-1">
                    {autoCompleteSuggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                          selectedSuggestionIndex === index ? 'bg-blue-50 font-medium' : ''
                        }`}
                        onClick={() => insertSuggestion(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                  {completeQuerySuggestion && (
                    <div className="p-2 border-t border-gray-300">
                      <div className="text-xs font-medium mb-1">Complete Query:</div>
                      <div className="text-xs bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100" onClick={useCompleteSuggestion}>
                        {completeQuerySuggestion}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-1 flex items-center">
                <button
                  onClick={fetchAutoCompleteSuggestions}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-xs flex items-center border border-gray-300"
                  disabled={isAutoCompleteLoading}
                >
                  <Search className="h-3 w-3 mr-1" />
                  {isAutoCompleteLoading ? "Loading..." : "Get Suggestions"}
                </button>
                <span className="ml-2 text-xs text-gray-500">
                  Press Ctrl+Space for auto-completion
                </span>
              </div>
            </div>
          ) : (
            renderMongoInterface()
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <button
                onClick={executeQuery}
                disabled={isLoading || (queryType === "mongo" && !selectedDatabase)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
              >
                <Play className="h-4 w-4 mr-2" />
                {isLoading ? "Running..." : "Run Command"}
              </button>
              <button
                onClick={validateQuery}
                disabled={isLoading || (queryType === "mongo" && !selectedDatabase)}
                className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Validate
              </button>
              <button
                onClick={clearFields}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
              >
                Clear
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => openShareModal()}
                disabled={!queryText.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center disabled:bg-blue-400"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={saveQuery}
                disabled={isLoading || !queryText.trim() || !queryName.trim() || (queryType === "mongo" && !selectedDatabase)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>

          {validationMessage && (
            <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
              {validationMessage}
            </p>
          )}

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Query Analysis
              </h3>
              {renderMarkdown(aiAnalysis)}
            </div>
          )}

          {/* Results Table */}
          {queryResult.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">Loading results...</div>
                  ) : queryResult.length > 0 ? (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(queryResult[0]).map((col, index) => (
                            <th
                              key={index}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {queryResult.map((row, index) => (
                          <tr key={index}>
                            {Object.entries(row).map(([key, val], i) => (
                              <td key={i} className="px-6 py-4 text-sm text-gray-500">
                                {typeof val === 'object' ? 
                                  JSON.stringify(val) : 
                                  (val?.toString() || "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-4 text-center text-gray-500">No results yet</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parameter Modal - SQL specific */}
      {showParamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
            <div className="space-y-3">
              {Array.from({ length: paramCount }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Parameter ${index + 1}`}
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={paramValues[index]}
                  onChange={(e) => {
                    const newParams = [...paramValues];
                    newParams[index] = e.target.value;
                    setParamValues(newParams);
                  }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowParamModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={runQueryWithParams}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              >
                Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Query via Email</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full h-40 border border-gray-300 p-2 rounded-md"
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeResults"
                  checked={includeResults}
                  onChange={(e) => setIncludeResults(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="includeResults" className="ml-2 text-sm text-gray-700">
                  Include query results as CSV attachment
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={shareQuery}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryEditor;

//previous correct code is above
//corrected

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles, Trash2 } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface Query {
//   id: number;
//   name: string;
//   description: string;
//   query: string;
// }

// interface QueryResult {
//   [key: string]: string | number;
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [aiAnalysis, setAiAnalysis] = useState(""); // New state for AI analysis

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       setIsLoading(true);
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const executeQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const runQueryWithParams = async () => {
//     try {
//       setIsLoading(true);
//       setAiAnalysis(""); // Clear any previous AI analysis
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//       setValidationMessage("");
//     } catch (error: any) {
//       console.error("Error executing query with parameters:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setShowParamModal(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       setQueryResult([]); // Clear any previous results
//       const response = await axios.post<{ description: string }>(
//         `${API_BASE_URL}/validate-query`,
//         { query: queryText }
//       );
      
//       // Store the AI analysis in state
//       setAiAnalysis(response.data.description);
//       setValidationMessage("Query analyzed successfully");
//     } catch (error: any) {
//       console.error("Error validating query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//       setAiAnalysis("");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const saveQuery = async () => {
//     if (!queryText.trim()) {
//       setValidationMessage("Please enter a query first");
//       return;
//     }
    
//     if (!queryName.trim()) {
//       setValidationMessage("Please enter a name for your query");
//       return;
//     }
    
//     try {
//       setIsLoading(true);
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//       setValidationMessage("Query saved successfully");
//     } catch (error: any) {
//       console.error("Error saving query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteQuery = async (id: number) => {
//     try {
//       setIsLoading(true);
//       await axios.delete(`${API_BASE_URL}/delete_query/${id}`);
//       fetchSavedQueries();
//       setValidationMessage("Query deleted successfully");
//     } catch (error: any) {
//       console.error("Error deleting query:", error);
//       setValidationMessage(`Error: ${error.response?.data?.detail || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const loadQuery = (query: Query) => {
//     setQueryName(query.name);
//     setQueryDescription(query.description);
//     setQueryText(query.query);
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis(""); // Clear any previous AI analysis
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//     setAiAnalysis("");
//   };

//   // Function to render markdown content
//   const renderMarkdown = (content: string) => {
//     // This is a simple way to show the markdown content
//     return (
//       <div className="markdown-content p-4 bg-gray-50 rounded-md border border-gray-200">
//         <pre className="whitespace-pre-wrap font-mono text-sm">{content}</pre>
//       </div>
//     );
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {isLoading && savedQueries.length === 0 ? (
//               <div className="text-sm text-gray-500">Loading...</div>
//             ) : savedQueries.length > 0 ? (
//               savedQueries.map((query) => (
//                 <div 
//                   key={query.id} 
//                   className="p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//                 >
//                   <div className="flex justify-between items-start">
//                     <div 
//                       className="cursor-pointer flex-1"
//                       onClick={() => loadQuery(query)}
//                     >
//                       <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                       <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//                     </div>
//                     <button 
//                       onClick={() => deleteQuery(query.id)}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="text-sm text-gray-500">No saved queries</div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         <div className="flex-1 p-4 overflow-auto">
//           <textarea
//             className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Write your SQL query here..."
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center disabled:bg-indigo-400"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 {isLoading ? "Running..." : "Run Query"}
//               </button>
//               <button
//                 onClick={validateQuery}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-green-400"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 disabled={isLoading}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-red-400"
//               >
//                 Clear
//               </button>
//             </div>

//             <button
//               onClick={saveQuery}
//               disabled={isLoading}
//               className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center disabled:bg-gray-100"
//             >
//               <Save className="h-4 w-4 mr-2" />
//               Save
//             </button>
//           </div>

//           {validationMessage && (
//             <p className={`mt-4 ${validationMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
//               {validationMessage}
//             </p>
//           )}

//           {/* AI Analysis Section */}
//           {aiAnalysis && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">
//                 AI Query Analysis
//               </h3>
//               {renderMarkdown(aiAnalysis)}
//             </div>
//           )}

//           {/* Results Table */}
//           {queryResult.length > 0 && (
//             <div className="mt-4">
//               <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//               <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//                 <div className="overflow-x-auto">
//                   {isLoading ? (
//                     <div className="p-4 text-center text-gray-500">Loading results...</div>
//                   ) : queryResult.length > 0 ? (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           {Object.keys(queryResult[0]).map((col, index) => (
//                             <th
//                               key={index}
//                               className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                             >
//                               {col}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {queryResult.map((row, index) => (
//                           <tr key={index}>
//                             {Object.values(row).map((val, i) => (
//                               <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                                 {val?.toString() || ""}
//                               </td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   ) : (
//                     <div className="p-4 text-center text-gray-500">No results yet</div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Parameter Modal */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Save, Play, Sparkles } from "lucide-react";

// const API_BASE_URL = "http://localhost:8080";

// // Define TypeScript Interfaces
// interface Query {
//   name: string;
//   description: string;
//   query: string;
// }

// interface QueryResult {
//   [key: string]: string | number;
// }

// const QueryEditor: React.FC = () => {
//   const [savedQueries, setSavedQueries] = useState<Query[]>([]);
//   const [queryName, setQueryName] = useState("");
//   const [queryDescription, setQueryDescription] = useState("");
//   const [queryText, setQueryText] = useState("");
//   const [queryResult, setQueryResult] = useState<QueryResult[]>([]);
//   const [validationMessage, setValidationMessage] = useState("");
//   const [paramCount, setParamCount] = useState(0);
//   const [paramValues, setParamValues] = useState<string[]>([]);
//   const [showParamModal, setShowParamModal] = useState(false);

//   useEffect(() => {
//     fetchSavedQueries();
//   }, []);

//   const fetchSavedQueries = async () => {
//     try {
//       const response = await axios.get<Query[]>(`${API_BASE_URL}/saved_queries`);
//       setSavedQueries(response.data);
//     } catch (error) {
//       console.error("Error fetching saved queries:", error);
//     }
//   };

//   const executeQuery = async () => {
//     const count = (queryText.match(/\?/g) || []).length;
//     if (count > 0) {
//       setParamCount(count);
//       setParamValues(Array(count).fill(""));
//       setShowParamModal(true);
//     } else {
//       runQueryWithoutParams();
//     }
//   };

//   const runQueryWithoutParams = async () => {
//     try {
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         { query: queryText }
//       );
//       setQueryResult(response.data.result);
//     } catch (error) {
//       console.error("Error executing query:", error);
//     }
//   };

//   const runQueryWithParams = async () => {
//     try {
//       const response = await axios.post<{ result: QueryResult[] }>(
//         `${API_BASE_URL}/execute-query`,
//         {
//           query: queryText,
//           parameters: paramValues,
//         }
//       );
//       setQueryResult(response.data.result);
//       setShowParamModal(false);
//     } catch (error) {
//       console.error("Error executing query with parameters:", error);
//     }
//   };

//   const validateQuery = async () => {
//     try {
//       const response = await axios.post<{ description: string }>(
//         `${API_BASE_URL}/validate-query`,
//         { query: queryText }
//       );
//       setValidationMessage(response.data.description);
//     } catch (error) {
//       console.error("Error validating query:", error);
//     }
//   };

//   const saveQuery = async () => {
//     try {
//       await axios.post(`${API_BASE_URL}/save_query`, {
//         name: queryName,
//         description: queryDescription,
//         query: queryText,
//       });
//       fetchSavedQueries();
//     } catch (error) {
//       console.error("Error saving query:", error);
//     }
//   };

//   const clearFields = () => {
//     setQueryName("");
//     setQueryDescription("");
//     setQueryText("");
//     setQueryResult([]);
//     setValidationMessage("");
//   };

//   return (
//     <div className="h-full flex">
//       {/* Sidebar */}
//       <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
//         <div className="p-4">
//           <h2 className="text-lg font-medium text-gray-900">Saved Queries</h2>
//           <div className="mt-4 space-y-2">
//             {savedQueries.map((query, index) => (
//               <div key={index} className="p-3 bg-gray-50 rounded-md hover:bg-gray-100">
//                 <h3 className="text-sm font-medium text-gray-900">{query.name}</h3>
//                 <p className="text-xs text-gray-500 mt-1">{query.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Editor */}
//       <div className="flex-1 flex flex-col">
//         <div className="p-4 border-b border-gray-200 bg-white">
//           <div className="flex items-center space-x-4">
//             <input
//               type="text"
//               placeholder="Query Name"
//               value={queryName}
//               onChange={(e) => setQueryName(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="text"
//               placeholder="Description"
//               value={queryDescription}
//               onChange={(e) => setQueryDescription(e.target.value)}
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
//             />
//           </div>
//         </div>

//         <div className="flex-1 p-4">
//           <textarea
//             className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-md"
//             placeholder="Write your SQL query here..."
//             value={queryText}
//             onChange={(e) => setQueryText(e.target.value)}
//           />

//           <div className="flex justify-between items-center mt-4">
//             <div className="flex space-x-2">
//               <button
//                 onClick={executeQuery}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center"
//               >
//                 <Play className="h-4 w-4 mr-2" />
//                 Run Query
//               </button>
//               <button
//                 onClick={validateQuery}
//                 className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center"
//               >
//                 <Sparkles className="h-4 w-4 mr-2" />
//                 Validate
//               </button>
//               <button
//                 onClick={clearFields}
//                 className="px-4 py-2 bg-red-600 text-white rounded-md"
//               >
//                 Clear
//               </button>
//             </div>

//             <button
//               onClick={saveQuery}
//               className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center"
//             >
//               <Save className="h-4 w-4 mr-2" />
//               Save
//             </button>
//           </div>

//           {validationMessage && <p className="mt-4 text-green-600">{validationMessage}</p>}

//           {/* Results Table */}
//           <div className="mt-4">
//             <h3 className="text-lg font-medium text-gray-900 mb-2">Results</h3>
//             <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {queryResult.length > 0 &&
//                         Object.keys(queryResult[0]).map((col, index) => (
//                           <th
//                             key={index}
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500"
//                           >
//                             {col}
//                           </th>
//                         ))}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {queryResult.length > 0 ? (
//                       queryResult.map((row, index) => (
//                         <tr key={index}>
//                           {Object.values(row).map((val, i) => (
//                             <td key={i} className="px-6 py-4 text-sm text-gray-500">
//                               {val}
//                             </td>
//                           ))}
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td className="px-6 py-4 text-sm text-gray-500" colSpan={3}>
//                           No results yet
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Parameter Modal */}
//       {showParamModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//             <h3 className="text-lg font-semibold mb-4">Enter Query Parameters</h3>
//             <div className="space-y-3">
//               {Array.from({ length: paramCount }).map((_, index) => (
//                 <input
//                   key={index}
//                   type="text"
//                   placeholder={`Parameter ${index + 1}`}
//                   className="w-full border border-gray-300 p-2 rounded-md"
//                   value={paramValues[index]}
//                   onChange={(e) => {
//                     const newParams = [...paramValues];
//                     newParams[index] = e.target.value;
//                     setParamValues(newParams);
//                   }}
//                 />
//               ))}
//             </div>
//             <div className="mt-4 flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowParamModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={runQueryWithParams}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-md"
//               >
//                 Run
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QueryEditor;
