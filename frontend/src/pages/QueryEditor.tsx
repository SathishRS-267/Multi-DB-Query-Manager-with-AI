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
