

from fastapi import FastAPI, HTTPException, Body, Request, APIRouter
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import psycopg2
import psycopg2.extras
import pymysql
import pymongo
import openai
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import json


# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai_api_key)

router = APIRouter()

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    parameters: Optional[List[str]] = None

class SaveQuery(BaseModel):
    name: str
    description: str
    query: str
    type: str = "sql"  # Default to SQL, can be "mongo" as well
    database: Optional[str] = None  # For MongoDB, which database it applies to

# New Pydantic model for auto-completion requests
class AutoCompleteRequest(BaseModel):
    partial_query: str
    cursor_position: Optional[int] = None
    db_schema: Optional[Dict[str, Any]] = None

# Add this new model for email sharing
class Attachment(BaseModel):
    fileName: str
    content: str
    contentType: str

class QueryForSharing(BaseModel):
    name: str
    description: str
    query: str
    type: str = "sql"  # Default to SQL, can be "mongo" as well
    database: Optional[str] = None  # For MongoDB database

class ShareQueryRequest(BaseModel):
    to_email: str  # Consider using EmailStr if you add pydantic email-validator
    subject: str
    message: str
    query: QueryForSharing
    attachment: Optional[Attachment] = None
    includeResults: bool = True

# MongoDB models
class MongoCommandRequest(BaseModel):
    command: str
    database: str

# Connect to DB
def get_last_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv("MGMT_DB_HOST", "localhost"),
            port=int(os.getenv("MGMT_DB_PORT", "5432")),
            database=os.getenv("MGMT_DB_NAME", "sqleditor"),
            user=os.getenv("MGMT_DB_USER", "postgres"),
            password=os.getenv("MGMT_DB_PASSWORD")
        )
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT * FROM connections 
            ORDER BY last_accessed DESC 
            LIMIT 1
        """)
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get last connection: {str(e)}")

def get_db_connection():
    last_conn = get_last_connection()

    if not last_conn:
        raise HTTPException(status_code=404, detail="No recent connection found")

    db_type = last_conn['type'].lower()

    try:
        if db_type == 'postgres':
            return psycopg2.connect(
                host=last_conn['host'],
                port=last_conn['port'],
                database=last_conn['database_name'],
                user=last_conn['username'],
                password=last_conn['password']
            ), 'postgres'

        elif db_type == 'mysql':
            return pymysql.connect(
                host=last_conn['host'],
                port=int(last_conn['port']),
                db=last_conn['database_name'],
                user=last_conn['username'],
                password=last_conn['password'],
                cursorclass=pymysql.cursors.DictCursor
            ), 'mysql'
            
        elif db_type == 'mongodb':
            try:
        # Get host and port values
                host = last_conn['host'] if last_conn['host'] else 'localhost'
        
        # Get port value with fallback
                try:
                    port = int(last_conn['port'])
                    if port <= 0 or port > 65535:
                        port = 27017  # Use default MongoDB port
                except (ValueError, TypeError):
                    port = 27017  # Use default MongoDB port
        
        # Simple connection string for local MongoDB
                if host == 'localhost' or host == '127.0.0.1':
                    connection_string = f"mongodb://{host}:{port}/"
                    client = pymongo.MongoClient(connection_string)
                else:
            # For non-local, handle credentials if present
                    if last_conn['username'] and last_conn['password']:
                        connection_string = f"mongodb://{last_conn['username']}:{last_conn['password']}@{host}:{port}/"
                    else:
                        connection_string = f"mongodb://{host}:{port}/"
            
                    client = pymongo.MongoClient(connection_string)
        
        # Test connection
                client.admin.command('ping')
        
                return client, 'mongodb'
            except Exception as e:
                error_message = str(e)
                raise HTTPException(status_code=500, detail=f"Failed to connect to mongodb: {error_message}")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported database type: {db_type}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to {db_type}: {str(e)}")

# Function to fetch database schema information
async def get_db_schema():
    """
    Fetches the schema information from the current database connection.
    Returns a dictionary with tables, columns, and their data types.
    """
    try:
        conn, db_type = get_db_connection()
        schema_info = {}
        
        if db_type == 'postgres':
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            # Query to get tables and columns in PostgreSQL
            cursor.execute("""
                SELECT 
                    t.table_name, 
                    c.column_name, 
                    c.data_type
                FROM 
                    information_schema.tables t
                JOIN 
                    information_schema.columns c 
                    ON t.table_name = c.table_name
                WHERE 
                    t.table_schema = 'public'
                ORDER BY 
                    t.table_name, 
                    c.ordinal_position;
            """)
            
            rows = cursor.fetchall()
            
            # Organize into a structured schema dictionary
            for row in rows:
                table_name = row['table_name']
                if table_name not in schema_info:
                    schema_info[table_name] = []
                
                schema_info[table_name].append({
                    'column_name': row['column_name'],
                    'data_type': row['data_type']
                })
            
        elif db_type == 'mysql':
            cursor = conn.cursor()
            # Get current database name
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()['DATABASE()']
            
            # Query to get tables and columns in MySQL
            cursor.execute("""
                SELECT 
                    TABLE_NAME, 
                    COLUMN_NAME, 
                    DATA_TYPE
                FROM 
                    INFORMATION_SCHEMA.COLUMNS
                WHERE 
                    TABLE_SCHEMA = %s
                ORDER BY 
                    TABLE_NAME, 
                    ORDINAL_POSITION;
            """, (db_name,))
            
            rows = cursor.fetchall()
            
            # Organize into a structured schema dictionary
            for row in rows:
                table_name = row['TABLE_NAME']
                if table_name not in schema_info:
                    schema_info[table_name] = []
                
                schema_info[table_name].append({
                    'column_name': row['COLUMN_NAME'],
                    'data_type': row['DATA_TYPE']
                })
        
        cursor.close()
        conn.close()
        return schema_info
        
    except Exception as e:
        # If there's an error, return an empty schema
        return {}

# New route for SQL auto-completion
@router.post("/autocomplete-query")
async def autocomplete_query(data: AutoCompleteRequest):
    """
    Provides AI-powered auto-completion suggestions for SQL queries based on the partial query
    and cursor position.
    """
    try:
        # Get the database type for context
        last_conn = get_last_connection()
        db_type = last_conn['type'].lower() if last_conn else "unknown"
        
        # Fetch database schema if not provided
        schema_info = data.db_schema
        if not schema_info:
            try:
                schema_info = await get_db_schema()
            except:
                # If we can't get the schema, we'll continue without it
                schema_info = {}
        
        # Format schema info for the prompt
        schema_text = ""
        if schema_info:
            schema_text = "Database Schema:\n"
            for table, columns in schema_info.items():
                schema_text += f"- Table: {table}\n"
                for col in columns:
                    schema_text += f"  - Column: {col['column_name']} ({col['data_type']})\n"
        
        # Create a prompt for OpenAI that requests SQL completion
        prompt = f"""
        I'm writing a SQL query for a {db_type} database and need auto-completion suggestions.
        
        {schema_text}
        
        My partial query is:
        ```sql
        {data.partial_query}
        ```
        
        The cursor is currently at position {data.cursor_position if data.cursor_position is not None else 'end of query'}.
        
        Please provide:
        1. 3-5 most likely auto-completion suggestions (short phrases or keywords)
        2. One complete query suggestion that might represent what I'm trying to do
        
        Format as JSON with two properties: "suggestions" (array of strings) and "complete_query" (string).
        Only return valid JSON, no additional text.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": 
                 "You are an AI SQL assistant that provides helpful auto-completion suggestions based on partial SQL queries. "
                 "You understand various SQL dialects including PostgreSQL and MySQL. "
                 "You should only respond with valid JSON containing suggestions and a complete query suggestion. "
                 "Make sure your suggestions are contextually relevant to the partial query."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        completion_data = json.loads(response.choices[0].message.content)
        
        # Return the auto-completion suggestions
        return completion_data
    
    except Exception as e:
        # Fallback suggestions in case of API issues
        return {
            "suggestions": ["SELECT", "FROM", "WHERE", "JOIN", "GROUP BY"],
            "complete_query": data.partial_query,
            "error": str(e)
        }

# MongoDB endpoints
@router.get("/mongo/databases")
def get_mongo_databases():
    """Get all databases in the MongoDB server."""
    try:
        client, db_type = get_db_connection()
        
        if db_type != 'mongodb':
            raise HTTPException(status_code=400, detail="Current connection is not MongoDB")
        
        # Get list of database names excluding admin, local and config
        db_list = [db for db in client.list_database_names() 
                  if db not in ['admin', 'local', 'config']]
        
        return db_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch MongoDB databases: {str(e)}")

@router.post("/mongo/execute-command")
def execute_mongo_command(data: MongoCommandRequest):
    """Execute a MongoDB command on a specific database."""
    try:
        client, db_type = get_db_connection()
        
        if db_type != 'mongodb':
            raise HTTPException(status_code=400, detail="Current connection is not MongoDB")
        
        # Get the specified database
        db = client[data.database]
        
        # Parse and execute the command
        try:
            # For safety, we'll evaluate the command in a controlled way
            # This is a basic implementation - in production, you'd want more sophisticated parsing
            command = data.command.strip()
            
            # Basic support for common MongoDB operations
            if command.startswith('db.'):
                parts = command.split('.')
                if len(parts) < 3:
                    raise ValueError("Invalid MongoDB command format")
                
                collection_name = parts[1]
                operation = parts[2].split('(')[0]
                
                # Extract arguments between the first ( and the last )
                args_str = command[command.find('(')+1:command.rfind(')')]
                
                collection = db[collection_name]
                
                # Handle different MongoDB operations
                if operation == 'find':
                    # Parse arguments for find operation
                    query = {}
                    projection = None
                    
                    if args_str:
                        if ',' in args_str:
                            query_str, proj_str = args_str.split(',', 1)
                            query = eval(query_str)
                            projection = eval(proj_str)
                        else:
                            query = eval(args_str) if args_str.strip() else {}
                    
                    cursor = collection.find(query, projection)
                    result = list(cursor)
                    
                    # Convert ObjectId to string for JSON serialization
                    for doc in result:
                        if '_id' in doc and hasattr(doc['_id'], '__str__'):
                            doc['_id'] = str(doc['_id'])
                    
                    return {"result": result}
                
                elif operation == 'findOne':
                    query = eval(args_str) if args_str else {}
                    result = collection.find_one(query)
                    
                    # Convert ObjectId to string
                    if result and '_id' in result and hasattr(result['_id'], '__str__'):
                        result['_id'] = str(result['_id'])
                    
                    return {"result": [result] if result else []}
                
                elif operation == 'count':
                    query = eval(args_str) if args_str else {}
                    count = collection.count_documents(query)
                    return {"result": [{"count": count}]}
                
                elif operation == 'distinct':
                    args = [arg.strip() for arg in args_str.split(',')]
                    field = eval(args[0])
                    query = eval(args[1]) if len(args) > 1 else {}
                    values = collection.distinct(field, query)
                    return {"result": [{field: value} for value in values]}
                
                elif operation in ['insert', 'insertOne']:
                    doc = eval(args_str)
                    result = collection.insert_one(doc)
                    return {"result": [{"inserted_id": str(result.inserted_id)}]}
                
                elif operation == 'insertMany':
                    docs = eval(args_str)
                    result = collection.insert_many(docs)
                    return {"result": [{"inserted_count": len(result.inserted_ids)}]}
                
                elif operation in ['update', 'updateOne']:
                    args = args_str.split(',', 1)
                    filter_dict = eval(args[0])
                    update_dict = eval(args[1])
                    result = collection.update_one(filter_dict, update_dict)
                    return {"result": [{"matched_count": result.matched_count, "modified_count": result.modified_count}]}
                
                elif operation == 'updateMany':
                    args = args_str.split(',', 1)
                    filter_dict = eval(args[0])
                    update_dict = eval(args[1])
                    result = collection.update_many(filter_dict, update_dict)
                    return {"result": [{"matched_count": result.matched_count, "modified_count": result.modified_count}]}
                
                elif operation in ['delete', 'deleteOne']:
                    filter_dict = eval(args_str)
                    result = collection.delete_one(filter_dict)
                    return {"result": [{"deleted_count": result.deleted_count}]}
                
                elif operation == 'deleteMany':
                    filter_dict = eval(args_str)
                    result = collection.delete_many(filter_dict)
                    return {"result": [{"deleted_count": result.deleted_count}]}
                
                elif operation == 'aggregate':
                    pipeline = eval(args_str)
                    result = list(collection.aggregate(pipeline))
                    
                    # Convert ObjectId to string
                    for doc in result:
                        if '_id' in doc and hasattr(doc['_id'], '__str__'):
                            doc['_id'] = str(doc['_id'])
                    
                    return {"result": result}
                
                else:
                    raise ValueError(f"Unsupported MongoDB operation: {operation}")
            
            # Support for database commands like db.runCommand()
            elif command.startswith('db.runCommand'):
                args_str = command[command.find('(')+1:command.rfind(')')]
                cmd = eval(args_str)
                result = db.command(cmd)
                return {"result": [result]}
            
            # Support for collection listing
            elif command == 'show collections' or command == 'db.getCollectionNames()':
                collections = db.list_collection_names()
                return {"result": [{"collections": collections}]}
            
            else:
                raise ValueError(f"Unsupported MongoDB command: {command}")
                
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error executing MongoDB command: {str(e)}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(e)}")

@router.post("/mongo/validate-command")
async def validate_mongo_command(data: MongoCommandRequest):
    """Validate a MongoDB command using AI assistance."""
    try:
        # Create a prompt for OpenAI that requests analysis of the MongoDB command
        prompt = f"""
        Analyze the following MongoDB command for database '{data.database}':
        
        ```
        {data.command}
        ```
        
        Provide a comprehensive analysis including:
        1. A description of what this command does
        2. Optimization suggestions
        3. Potential issues or risks
        4. Best practices
        
        Format your response in markdown with clear sections.
        """
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert MongoDB database analyst that provides clear, concise insights about MongoDB commands."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the analysis from the response
        analysis = response.choices[0].message.content
        
        # Return the analysis as a description
        return {
            "description": analysis
        }
    
    except Exception as e:
        # Fallback response in case of API issues
        fallback_message = f"""
        ## MongoDB Command Analysis

        **Description:** This appears to be a MongoDB command operating on the '{data.database}' database.
        
        **Optimization Suggestions:**
        - Unable to provide detailed optimization suggestions due to API error.
        
        **Potential Issues:**
        - API error occurred during analysis: {str(e)}
        
        **Best Practices:**
        - Consider reviewing command structure and performance manually.
        """
        
        return {
            "description": fallback_message,
            "error": str(e)
        }

# Route: Execute query
@router.post("/execute-query")
def execute_query(data: QueryRequest):
    query = data.query.strip()
    parameters = data.parameters or []

    num_placeholders = query.count("?")

    if num_placeholders > 0 and not parameters:
        return {"message": f"Query requires {num_placeholders} parameter(s)", "needParams": True}

    try:
        conn, db_type = get_db_connection()
        
        # Create the appropriate cursor based on database type
        if db_type == 'postgres':
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            # Replace ? with %s for psycopg2
            param_query = query.replace("?", "%s")

        else:  # mysql
            cur = conn.cursor()
            param_query = query.replace("?", "%s")

        # Execute the query with parameters if they exist
        if parameters and len(parameters) > 0:
            cur.execute(param_query, tuple(parameters))
        else:
            cur.execute(param_query)
            
        if cur.description:  # If it's a SELECT query
            rows = cur.fetchall()
        else:
            conn.commit()
            rows = [{"message": f"{cur.rowcount} row(s) affected"}]

        cur.close()
        conn.close()
        return {"result": rows}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate-query")
async def validate_query(data: QueryRequest):
    query = data.query
    
    # Get the database type for context
    try:
        last_conn = get_last_connection()
        db_type = last_conn['type'].lower() if last_conn else "unknown"
    except:
        db_type = "unknown"
    
    # Create a prompt for OpenAI that requests analysis of the SQL query
    prompt = f"""
    Analyze the following SQL query for a {db_type} database:
    
    ```sql
    {query}
    ```
    
    Provide a comprehensive analysis including:
    1. A description of what the query does
    2. Optimization suggestions
    3. Potential issues or risks
    
    
    Format your response in markdown with clear sections.
    """
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo",  # Use appropriate model based on your OpenAI access
            messages=[
                {"role": "system", "content": "You are an expert SQL database analyst that provides clear, concise insights about SQL queries."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract the analysis from the response
        analysis = response.choices[0].message.content
        
        # Return the analysis as a description
        return {
            "description": analysis
        }
    
    except Exception as e:
        # Fallback response in case of API issues
        fallback_message = f"""
        Query Analysis

        **Description:** This query appears to {query.split()[0].lower()} data in the database.
        
        **Optimization Suggestions:**
        - Unable to provide detailed optimization suggestions due to API error.
        
        **Potential Issues:**
        - API error occurred during analysis: {str(e)}
        
        **Best Practices:**
        - Consider reviewing query structure and performance manually.
        """
        
        return {
            "description": fallback_message,
            "error": str(e)
        }

@router.post("/save_query")
def save_query(data: SaveQuery):
    try:
        # Connect to the management database
        conn = psycopg2.connect(
            host="localhost",  # Management DB
            port=5432,
            database="sqleditor",
            user="postgres",
            password="pwd"
        )
        
        cur = conn.cursor()
        
        # Create the saved_queries table if it doesn't exist
        # Use UUID type for connection_id to match your connections table
        # Added type and database fields for MongoDB support
        cur.execute("""
            CREATE TABLE IF NOT EXISTS saved_queries (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                query TEXT NOT NULL,
                connection_id UUID NOT NULL,
                db_type TEXT NOT NULL,
                type TEXT NOT NULL DEFAULT 'sql',
                database TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Get the current connection for association
        last_conn = get_last_connection()
        
        cur.execute("""
            INSERT INTO saved_queries (name, description, query, connection_id, db_type, type, database)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data.name, data.description, data.query, last_conn['id'], last_conn['type'].lower(), 
              data.type, data.database))
            
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Query saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Modified get_saved_queries to include type and database fields
@router.get("/saved_queries")
def get_saved_queries():
    try:
        # Get current connection
        last_conn = get_last_connection()
        
        if not last_conn:
            return []
            
        # Connect to the management database
        conn = psycopg2.connect(
            host="localhost",  # Management DB
            port=5432,
            database="sqleditor",
            user="postgres",
            password="pwd"
        )
        
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Get saved queries for the current connection type
        # Include type and database fields
        cur.execute("""
            SELECT id, name, description, query, 
                   COALESCE(type, 'sql') as type, database 
            FROM saved_queries 
            WHERE db_type = %s
            ORDER BY created_at DESC
        """, (last_conn['type'].lower(),))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/share_query")
async def share_query(data: ShareQueryRequest):
    # Get email configuration from environment variables
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_username or not smtp_password:
        raise HTTPException(status_code=500, detail="SMTP credentials not configured")
    
    try:
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = data.to_email
        msg['Subject'] = data.subject
        
        # Add message body
        msg.attach(MIMEText(data.message, 'plain'))
        
        # Add CSV attachment if included
        if data.includeResults and data.attachment:
            attachment = MIMEApplication(data.attachment.content)
            attachment['Content-Disposition'] = f'attachment; filename="{data.attachment.fileName}"'
            msg.attach(attachment)
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()  # Enable TLS encryption
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
        
        return {"message": "Query shared successfully via email"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")


# Modified delete_query to use the management database
@router.delete("/delete_query/{query_id}")
def delete_query(query_id: int):
    try:
        # Connect to the management database
        conn = psycopg2.connect(
            host="localhost",  # Management DB
            port=5432,
            database="sqleditor",
            user="postgres",
            password="pwd"
        )
        
        cur = conn.cursor()
        
        cur.execute("DELETE FROM saved_queries WHERE id = %s", (query_id,))
        conn.commit()
        
        rows_deleted = cur.rowcount
        cur.close()
        conn.close()
        
        if rows_deleted == 0:
            raise HTTPException(status_code=404, detail="Query not found")
            
        return {"message": "Query deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


