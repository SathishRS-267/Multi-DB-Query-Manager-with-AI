# This file is not currently used in the application
# It was part of an earlier implementation that has been replaced
        
#         # Get all tables
#         schema_data["tables"] = {}
#         for table_name in inspector.get_table_names():
#             schema_data["tables"][table_name] = {
#                 "columns": inspector.get_columns(table_name),
#                 "pk": inspector.get_pk_constraint(table_name),
#                 "fk": inspector.get_foreign_keys(table_name)
#             }
            
#         return schema_data
    
#     def execute_query(self, connection_id: str, sql_query: str):
#         """Execute SQL query on specified connection"""
#         if connection_id not in self.connections:
#             raise HTTPException(status_code=404, detail="Connection not found")
            
#         try:
#             conn = self.connections[connection_id]
#             result = conn.execute(text(sql_query))
            
#             if result.returns_rows:
#                 # Convert result to list of dictionaries
#                 columns = result.keys()
#                 rows = [dict(zip(columns, row)) for row in result.fetchall()]
#                 return {"columns": columns, "rows": rows}
#             else:
#                 return {"message": "Query executed successfully (no rows returned)"}
                
#         except Exception as e:
#             logger.error(f"Query execution error: {str(e)}")
#             raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")
    
#     def close_connection(self, connection_id: str):
#         """Close database connection"""
#         if connection_id not in self.connections:
#             raise HTTPException(status_code=404, detail="Connection not found")
            
#         try:
#             self.connections[connection_id].close()
#             del self.connections[connection_id]
#             del self.engines[connection_id]
#             if connection_id in self.metadata:
#                 del self.metadata[connection_id]
#             return {"message": "Connection closed successfully"}
            
#         except Exception as e:
#             logger.error(f"Connection closing error: {str(e)}")
#             raise HTTPException(status_code=400, detail=f"Failed to close connection: {str(e)}")
    
#     def get_metadata(self, connection_id: str) -> Dict:
#         """Get metadata for a connection"""
#         if connection_id not in self.metadata:
#             raise HTTPException(status_code=404, detail="Connection metadata not found")
#         return self.metadata[connection_id]

# # Create DB connection manager instance
# db_manager = DBConnectionManager()

# # AI service for processing natural language queries
# class AIQueryProcessor:
#     def __init__(self, api_key: str):
#         self.api_key = api_key
#         openai.api_key = api_key
    
#     async def process_query(self, query: str, db_metadata: Dict, connection_id: str) -> Dict:
#         """Process natural language query using OpenAI"""
#         if not self.api_key:
#             raise HTTPException(status_code=500, detail="OpenAI API key not configured")
            
#         try:
#             # Prepare context with database schema information
#             schema_context = self._prepare_schema_context(db_metadata)
            
#             # Create prompt for OpenAI
#             prompt = f"""
#             You are a database assistant that translates natural language queries into SQL and provides results.
            
#             DATABASE SCHEMA:
#             {schema_context}
            
#             USER QUERY: {query}
            
#             If this is a request to connect to a database, respond with information on what credentials are needed.
#             If this is a request to disconnect, respond with confirmation.
#             For database queries, respond with a valid SQL query that would answer the user's question.
#             Format your response as JSON with these fields:
#             - type: "connection_request", "disconnect_request", "sql_query", or "general_response"
#             - sql: (only for sql_query type) The SQL query to execute
#             - message: A human-readable message explaining the action or response
#             """
            
#             # Call OpenAI API
#             response = await openai.chat.completions.create(
#                 model="gpt-4-turbo",
#                 messages=[{"role": "system", "content": prompt}],
#                 response_format={"type": "json_object"}
#             )
            
#             # Parse response
#             ai_response = json.loads(response.choices[0].message.content)
            
#             # Process based on response type
#             if ai_response["type"] == "sql_query":
#                 # Execute the SQL query
#                 sql_query = ai_response["sql"]
#                 result = db_manager.execute_query(connection_id, sql_query)
                
#                 # Format the results for display
#                 formatted_result = self._format_query_results(result, ai_response["message"])
#                 return {"type": "bot", "content": formatted_result}
                
#             elif ai_response["type"] == "disconnect_request":
#                 # Handle disconnect request
#                 db_manager.close_connection(connection_id)
#                 return {"type": "bot", "content": "Database connection closed successfully."}
                
#             else:
#                 # Handle general response
#                 return {"type": "bot", "content": ai_response["message"]}
                
#         except Exception as e:
#             logger.error(f"AI processing error: {str(e)}")
#             return {"type": "bot", "content": f"Sorry, I encountered an error: {str(e)}"}
    
#     def _prepare_schema_context(self, db_metadata: Dict) -> str:
#         """Convert DB metadata to string format for context"""
#         schema_text = []
        
#         for table_name, table_info in db_metadata["tables"].items():
#             table_text = f"Table: {table_name}\nColumns:"
            
#             for column in table_info["columns"]:
#                 column_type = str(column["type"])
#                 nullable = "NULL" if column.get("nullable", True) else "NOT NULL"
#                 table_text += f"\n  - {column['name']} ({column_type}) {nullable}"
                
#             # Add primary key info
#             if table_info["pk"] and table_info["pk"]["constrained_columns"]:
#                 pk_cols = ", ".join(table_info["pk"]["constrained_columns"])
#                 table_text += f"\nPrimary Key: {pk_cols}"
                
#             # Add foreign key info
#             if table_info["fk"]:
#                 table_text += "\nForeign Keys:"
#                 for fk in table_info["fk"]:
#                     src_cols = ", ".join(fk["constrained_columns"])
#                     ref_cols = ", ".join(fk.get("referred_columns", []))
#                     ref_table = fk.get("referred_table", "unknown")
#                     table_text += f"\n  - {src_cols} → {ref_table}({ref_cols})"
                    
#             schema_text.append(table_text)
            
#         return "\n\n".join(schema_text)
    
#     def _format_query_results(self, result: Dict, explanation: str) -> str:
#         """Format query results for display"""
#         if "rows" not in result:
#             return explanation
            
#         formatted = f"{explanation}\n\n"
        
#         if len(result["rows"]) == 0:
#             return formatted + "Query executed successfully but returned no results."
            
#         # Create a markdown table of results
#         columns = result["columns"]
#         rows = result["rows"]
        
#         # Table header
#         formatted += "| " + " | ".join(str(col) for col in columns) + " |\n"
#         formatted += "| " + " | ".join("---" for _ in columns) + " |\n"
        
#         # Table rows (limit to 20 rows for display)
#         max_display_rows = min(20, len(rows))
#         for row_idx in range(max_display_rows):
#             row = rows[row_idx]
#             formatted += "| " + " | ".join(str(row[col]) for col in columns) + " |\n"
            
#         # Add note if results were truncated
#         if len(rows) > max_display_rows:
#             formatted += f"\n*Showing {max_display_rows} of {len(rows)} total results*"
            
#         return formatted

# # Create AI query processor instance
# ai_processor = AIQueryProcessor(openai_api_key)
# @router.websocket("/ws/chat")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     connection_id = None
    
#     try:
#         while True:
#             # Receive message from client
#             data = await websocket.receive_text()
#             message = json.loads(data)
            
#             if message["type"] == "user":
#                 user_query = message["content"]
                
#                 # Process user query
#                 if user_query.lower().startswith("connect"):
#                     # This is a connection request
#                     await websocket.send_json({
#                         "type": "bot",
#                         "content": "Sure! I can help you connect to a database. Please provide the following credentials:\n- Host\n- Port\n- Database name\n- Username\n- Password\n- DBMS (PostgreSQL, MySQL, etc.)"
#                     })
                    
#                 elif connection_id is None and "host:" in user_query.lower():
#                     # Parse connection details from message
#                     try:
#                         # Extract connection parameters more carefully
#                         params = {}
#                         patterns = {
#                             "host": r"host:\s*([^\n:]+)",
#                             "port": r"port:\s*(\d+)",
#                             "database": r"database:\s*([^\n:]+)",
#                             "username": r"username:\s*([^\n:]+)",
#                             "password": r"password:\s*([^\n:]+)",
#                             "dbms": r"dbms:\s*([^\n:]+)"
#                         }
                        
#                         for key, pattern in patterns.items():
#                             match = re.search(pattern, user_query, re.IGNORECASE)
#                             if match:
#                                 params[key] = match.group(1).strip()
                        
#                         # Set defaults if missing
#                         if "port" not in params and "port" in patterns:
#                             params["port"] = "5432"
#                         if "dbms" not in params and "dbms" in patterns:
#                             params["dbms"] = "postgresql"
                        
#                         # Validate required parameters
#                         required = ["host", "database", "username", "password"]
#                         missing = [p for p in required if p not in params]
                        
#                         if missing:
#                             await websocket.send_json({
#                                 "type": "bot",
#                                 "content": f"Missing required connection parameters: {', '.join(missing)}. Please provide all required information."
#                             })
#                             continue
                        
#                         # Create connection request
#                         conn_req = ConnectionRequest(
#                             host=params.get("host"),
#                             port=int(params.get("port", 5432)),
#                             database=params.get("database"),
#                             username=params.get("username"),
#                             password=params.get("password"),
#                             dbms=params.get("dbms", "postgresql").lower()
#                         )
                        
#                         # Create connection
#                         connection_id = db_manager.create_connection(conn_req)
                        
#                         await websocket.send_json({
#                             "type": "bot",
#                             "content": f"Successfully connected to the database! You can now ask questions about your data.",
#                             "connection_id": connection_id
#                         })
                        
#                     except Exception as e:
#                         logger.error(f"Connection error: {str(e)}")
#                         await websocket.send_json({
#                             "type": "bot",
#                             "content": f"Error connecting to database: {str(e)}"
#                         })
                        
#                 elif connection_id and user_query.lower().startswith("disconnect"):
#                     # Handle disconnect request
#                     try:
#                         db_manager.close_connection(connection_id)
#                         connection_id = None
#                         await websocket.send_json({
#                             "type": "bot",
#                             "content": "Database connection closed successfully."
#                         })
#                     except Exception as e:
#                         await websocket.send_json({
#                             "type": "bot",
#                             "content": f"Error disconnecting: {str(e)}"
#                         })
                        
#                 elif connection_id:
#                     # Handle database query through AI
#                     try:
#                         # Get database metadata
#                         db_metadata = db_manager.get_metadata(connection_id)
                        
#                         # Process query with AI
#                         response = await ai_processor.process_query(user_query, db_metadata, connection_id)
                        
#                         # Send response back to client
#                         await websocket.send_json(response)
                        
#                     except Exception as e:
#                         await websocket.send_json({
#                             "type": "bot",
#                             "content": f"Error processing query: {str(e)}"
#                         })
                        
#                 else:
#                     # No active connection
#                     await websocket.send_json({
#                         "type": "bot",
#                         "content": "You need to connect to a database first. Please start with 'Connect to [database type]'"
#                     })
                    
#     except WebSocketDisconnect:
#         logger.info("WebSocket client disconnected")
#         # Clean up any database connection if exists
#         if connection_id and connection_id in db_manager.connections:
#             db_manager.close_connection(connection_id)

# # WebSocket endpoint for chat
# # @router.websocket("/ws/chat")
# # async def websocket_endpoint(websocket: WebSocket):
# #     await websocket.accept()
# #     connection_id = None
    
# #     try:
# #         while True:
# #             # Receive message from client
# #             data = await websocket.receive_text()
# #             message = json.loads(data)
            
# #             if message["type"] == "user":
# #                 user_query = message["content"]
                
# #                 # Process user query
# #                 if user_query.lower().startswith("connect"):
# #                     # This is a connection request
# #                     await websocket.send_json({
# #                         "type": "bot",
# #                         "content": "Sure! I can help you connect to a database. Please provide the following credentials:\n- Host\n- Port\n- Database name\n- Username\n- Password\n- DBMS (PostgreSQL, MySQL, etc.)"
# #                     })
                    
# #                 elif connection_id is None and "host:" in user_query.lower():
# #                     # Parse connection details from message
# #                     try:
# #                         lines = user_query.split('\n')
# #                         conn_details = {}
                        
# #                         for line in lines:
# #                             if ":" in line:
# #                                 key, value = line.split(":", 1)
# #                                 conn_details[key.strip().lower()] = value.strip()
                        
# #                         # Create connection request
# #                         conn_req = ConnectionRequest(
# #                             host=conn_details.get("host", ""),
# #                             port=int(conn_details.get("port", 5432)),
# #                             database=conn_details.get("database", ""),
# #                             username=conn_details.get("username", ""),
# #                             password=conn_details.get("password", ""),
# #                             dbms=conn_details.get("dbms", "postgresql").lower()
# #                         )
                        
# #                         # Create connection
# #                         connection_id = db_manager.create_connection(conn_req)
                        
# #                         await websocket.send_json({
# #                             "type": "bot",
# #                             "content": f"Successfully connected to the database! You can now ask questions about your data."
# #                         })
                        
# #                     except Exception as e:
# #                         await websocket.send_json({
# #                             "type": "bot",
# #                             "content": f"Error connecting to database: {str(e)}"
# #                         })
                        
# #                 elif connection_id and user_query.lower().startswith("disconnect"):
# #                     # Handle disconnect request
# #                     try:
# #                         db_manager.close_connection(connection_id)
# #                         connection_id = None
# #                         await websocket.send_json({
# #                             "type": "bot",
# #                             "content": "Database connection closed successfully."
# #                         })
# #                     except Exception as e:
# #                         await websocket.send_json({
# #                             "type": "bot",
# #                             "content": f"Error disconnecting: {str(e)}"
# #                         })
                        
# #                 elif connection_id:
# #                     # Handle database query through AI
# #                     try:
# #                         # Get database metadata
# #                         db_metadata = db_manager.get_metadata(connection_id)
                        
# #                         # Process query with AI
# #                         response = await ai_processor.process_query(user_query, db_metadata, connection_id)
                        
# #                         # Send response back to client
# #                         await websocket.send_json(response)
                        
# #                     except Exception as e:
# #                         await websocket.send_json({
# #                             "type": "bot",
# #                             "content": f"Error processing query: {str(e)}"
# #                         })
                        
# #                 else:
# #                     # No active connection
# #                     await websocket.send_json({
# #                         "type": "bot",
# #                         "content": "You need to connect to a database first. Please start with 'Connect to [database type]'"
# #                     })
                    
# #     except WebSocketDisconnect:
# #         logger.info("WebSocket client disconnected")
# #         # Clean up any database connection if exists
# #         if connection_id and connection_id in db_manager.connections:
# #             db_manager.close_connection(connection_id)

# # HTTP endpoint to establish database connection
# @router.post("/connect", response_model=ConnectionResponse)
# async def connect_to_database(connection: ConnectionRequest):
#     try:
#         connection_id = db_manager.create_connection(connection)
#         return ConnectionResponse(
#             connection_id=connection_id,
#             status="success",
#             message="Successfully connected to database"
#         )
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# # HTTP endpoint to execute a query
# @router.post("/query")
# async def execute_query(query_request: QueryRequest):
#     try:
#         # Get database metadata
#         db_metadata = db_manager.get_metadata(query_request.connection_id)
        
#         # Process query with AI
#         response = await ai_processor.process_query(
#             query_request.query, 
#             db_metadata, 
#             query_request.connection_id
#         )
        
#         return response
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))

# # HTTP endpoint to disconnect
# @router.delete("/disconnect/{connection_id}")
# async def disconnect_database(connection_id: str):
#     return db_manager.close_connection(connection_id)

# # Root endpoint
# @router.get("/")
# async def root():
#     return {"message": "AI Database Assistant API", "status": "online"}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)