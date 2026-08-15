

from fastapi import APIRouter, WebSocket, HTTPException, Depends, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import json
import uuid
import asyncio
import openai
import os
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import sqlalchemy
from sqlalchemy import create_engine, text, Table, Column, Integer, String, MetaData, JSON, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pymongo import MongoClient
import re
import psycopg2
import psycopg2.extras
import pymysql
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

load_dotenv()  # load environment variables from .env

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "sqlwizard123@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "eavt frhm iqxg pvnw")

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter()

# Initialize database for chat history
MGMT_DB_HOST = os.getenv("MGMT_DB_HOST", "localhost")
MGMT_DB_PORT = os.getenv("MGMT_DB_PORT", "5432")
MGMT_DB_NAME = os.getenv("MGMT_DB_NAME", "sqleditor")
MGMT_DB_USER = os.getenv("MGMT_DB_USER", "postgres")
MGMT_DB_PASSWORD = os.getenv("MGMT_DB_PASSWORD", "pwd")

SQLALCHEMY_DATABASE_URL = f"postgresql://{MGMT_DB_USER}:{MGMT_DB_PASSWORD}@{MGMT_DB_HOST}:{MGMT_DB_PORT}/{MGMT_DB_NAME}"
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning(f"Could not create database engine: {e}")
    engine = None
    SessionLocal = None
    
Base = declarative_base()

# Database models
class ChatHistory(Base):
    __tablename__ = "chat_histories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="New Chat")
    user_id = Column(String, index=True)  # To identify which user owns this chat
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_histories.id"))
    message_type = Column(String)  # 'user' or 'bot'
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables (with error handling)
try:
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        print("✓ Chat tables created successfully")
    else:
        print("⚠ Skipping chat table creation (no database connection)")
except Exception as e:
    print(f"⚠ Warning: Could not create chat tables: {e}")
    print("  Chat features will not work until PostgreSQL is configured.")

# Get DB session
def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Store active connections
active_connections: Dict[str, WebSocket] = {}
# Store database connections
db_connections: Dict[str, Any] = {}
# Store connection details
connection_details: Dict[str, Dict] = {}

class Message(BaseModel):
    id: int
    type: str
    content: str
    timestamp: str

class EmailShare(BaseModel):
    chat_id: int
    recipient_email: str
    sender_name: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        self.active_connections[client_id] = websocket
        logger.info(f"Added client {client_id} to connection manager")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Removed client {client_id} from connection manager")

    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))
            logger.info(f"Sent message to client {client_id}")

manager = ConnectionManager()

def get_last_connection():
    try:
        conn = psycopg2.connect(
            host=MGMT_DB_HOST,
            port=int(MGMT_DB_PORT),
            database=MGMT_DB_NAME,
            user=MGMT_DB_USER,
            password=MGMT_DB_PASSWORD
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
        logger.error(f"Failed to get last connection: {str(e)}")
        return None

# Function to create a SQLAlchemy engine or MongoDB client from connection details
async def create_db_connection(connection_info):
    try:
        if not connection_info:
            return None, "No recent connection found"
        
        db_type = connection_info['type'].lower()
        
        if db_type == 'postgres':
            connection_string = f"postgresql://{connection_info['username']}:{connection_info['password']}@{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}"
            engine = create_engine(connection_string)
            # Test connection
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            
            details = {
                'host': connection_info['host'],
                'port': connection_info['port'],
                'database': connection_info['database_name'],
                'username': connection_info['username'],
                'password': connection_info['password'],
                'dbms': 'postgresql'
            }
            
            return engine, details
            
        elif db_type == 'mysql':
            # Create connection using PyMySQL directly first to debug connection issues
            try:
                # Debug info
                logger.info(f"MySQL connection parameters: host={connection_info['host']}, port={connection_info['port']}, user={connection_info['username']}, db={connection_info['database_name']}")
                
                # Escape special characters in password
                import urllib.parse
                escaped_password = urllib.parse.quote_plus(connection_info['password'])
                
                # Create the connection string with proper escaping
                connection_string = f"mysql+pymysql://{connection_info['username']}:{escaped_password}@{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}"
                logger.info(f"Attempting MySQL connection with string: {connection_string.replace(escaped_password, '********')}")
                
                engine = create_engine(connection_string)
                # Test connection
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT 1"))
                    result.fetchone()
                
                details = {
                    'host': connection_info['host'],
                    'port': connection_info['port'],
                    'database': connection_info['database_name'],
                    'username': connection_info['username'],
                    'password': connection_info['password'],
                    'dbms': 'mysql'
                }
                
                return engine, details
            except Exception as e:
                # Alternative direct connection attempt
                logger.error(f"SQLAlchemy connection failed: {e}, trying direct PyMySQL connection")
                conn = pymysql.connect(
                    host=connection_info['host'],
                    port=int(connection_info['port']),
                    user=connection_info['username'],
                    password=connection_info['password'],
                    database=connection_info['database_name']
                )
                conn.ping()  # Test connection
                
                # If direct connection works, retry SQLAlchemy with simpler approach
                conn.close()
                
                # Try SQLAlchemy with simpler approach
                engine = create_engine(
                    f"mysql+pymysql://{connection_info['username']}:{escaped_password}@{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}",
                    connect_args={"charset": "utf8mb4"}
                )
                
                # Test connection
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT 1"))
                    result.fetchone()
                
                details = {
                    'host': connection_info['host'],
                    'port': connection_info['port'],
                    'database': connection_info['database_name'],
                    'username': connection_info['username'],
                    'password': connection_info['password'],
                    'dbms': 'mysql'
                }
                
                return engine, details
            
        elif db_type in ['sqlserver', 'mssql']:
            connection_string = f"mssql+pyodbc://{connection_info['username']}:{connection_info['password']}@{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}?driver=ODBC+Driver+17+for+SQL+Server"
            engine = create_engine(connection_string)
            # Test connection
            with engine.connect() as conn:
                result = conn.execute(text("SELECT 1"))
                result.fetchone()
            
            details = {
                'host': connection_info['host'],
                'port': connection_info['port'],
                'database': connection_info['database_name'],
                'username': connection_info['username'],
                'password': connection_info['password'],
                'dbms': 'sqlserver'
            }
            
            return engine, details
            
        elif db_type == 'mongodb':
            
            connection_string = f"mongodb://{connection_info['username']}:{connection_info['password']}@{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}" if connection_info['username'] and connection_info['password'] else f"mongodb://{connection_info['host']}:{connection_info['port']}/{connection_info['database_name']}"
            client = MongoClient(connection_string)
            # Test connection
            client.admin.command('ping')
            
            details = {
                'host': connection_info['host'],
                'port': connection_info['port'],
                'database': connection_info['database_name'],
                'username': connection_info['username'],
                'password': connection_info['password'],
                'dbms': 'mongodb'
            }
            
            return client, details
            
        else:
            return None, f"Unsupported database type: {db_type}"
            
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None, None

async def get_database_schema(client_id: str) -> dict:
    """Get database schema information to help with query generation"""
    if client_id not in db_connections:
        return {}
    
    try:
        connection = db_connections[client_id]
        dbms = connection_details[client_id]['dbms'].lower()
        schema_info = {}
        
        # For SQL-based databases
        if dbms in ['postgresql', 'mysql', 'sqlserver', 'redshift']:
            with connection.connect() as conn:
                # Get list of tables
                if dbms == 'postgresql':
                    result = conn.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                    """))
                elif dbms == 'mysql':
                    result = conn.execute(text(f"""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = '{connection_details[client_id]['database']}'
                    """))
                elif dbms in ['sqlserver', 'redshift']:
                    result = conn.execute(text("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'dbo'
                    """))
                
                tables = [row[0] for row in result]
                schema_info['tables'] = tables
                
                # Get column information for each table
                schema_info['columns'] = {}
                for table in tables:
                    if dbms in ['postgresql', 'mysql', 'redshift']:
                        result = conn.execute(text(f"""
                            SELECT column_name, data_type 
                            FROM information_schema.columns 
                            WHERE table_name = '{table}'
                        """))
                    elif dbms == 'sqlserver':
                        result = conn.execute(text(f"""
                            SELECT column_name, data_type 
                            FROM information_schema.columns 
                            WHERE table_name = '{table}' AND table_schema = 'dbo'
                        """))
                    
                    schema_info['columns'][table] = [(row[0], row[1]) for row in result]
        
        # For MongoDB
        elif dbms == 'mongodb':
            database = connection_details[client_id]['database']
            db = connection[database]
            
            # Get collections
            collections = db.list_collection_names()
            schema_info['collections'] = collections
            
            # Sample documents from each collection for schema inference
            schema_info['sample_docs'] = {}
            for collection in collections:
                sample = list(db[collection].find().limit(1))
                if sample:
                    schema_info['sample_docs'][collection] = sample[0]
        
        return schema_info
    
    except Exception as e:
        logger.error(f"Error getting database schema: {e}")
        return {}

async def format_table_results(columns, rows):
    """Format query results as a nicely formatted HTML table"""
    
    # Create HTML table
    html_table = "<table class='query-results'>\n"
    
    # Add header row
    html_table += "  <thead>\n    <tr>\n"
    for col in columns:
        html_table += f"      <th>{col}</th>\n"
    html_table += "    </tr>\n  </thead>\n"
    
    # Add data rows
    html_table += "  <tbody>\n"
    for row in rows:
        html_table += "    <tr>\n"
        for cell in row:
            html_table += f"      <td>{cell}</td>\n"
        html_table += "    </tr>\n"
    html_table += "  </tbody>\n</table>\n"
    
    # Add CSS styling
    html_table = f"""
<div class="table-container">
  <style>
    .table-container {{
      overflow-x: auto;
      margin: 1rem 0;
    }}
    .query-results {{
      border-collapse: collapse;
      width: 100%;
      font-family: sans-serif;
    }}
    .query-results th, .query-results td {{
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }}
    .query-results tr:nth-child(even) {{
      background-color: #f2f2f2;
    }}
    .query-results th {{
      padding-top: 12px;
      padding-bottom: 12px;
      background-color: #4CAF50;
      color: white;
    }}
  </style>
  {html_table}
</div>
"""
    
    return html_table

async def execute_database_query(client_id: str, query: str) -> str:
    """Execute database query and return results as a formatted HTML table or markdown"""
    if client_id not in db_connections:
        return "Error: Not connected to any database. Please wait while I attempt to connect."
    
    try:
        connection = db_connections[client_id]
        dbms = connection_details[client_id]['dbms'].lower()
        
        # For SQL-based databases
        if dbms in ['postgresql', 'mysql', 'sqlserver', 'redshift']:
            with connection.connect() as conn:
                result = conn.execute(text(query))
                
                if query.strip().lower().startswith(('select', 'show', 'describe')):
                    # Format result as table
                    columns = result.keys()
                    rows = result.fetchall()
                    
                    if not rows:
                        return "Query executed successfully. No results returned."
                    
                    # Create HTML table
                    html_table = await format_table_results(columns, rows)
                    return f"Query results:\n\n{html_table}"
                else:
                    return f"Query executed successfully. Rows affected: {result.rowcount}"
        
        # For MongoDB
        elif dbms == 'mongodb':
            database = connection_details[client_id]['database']
            db = connection[database]
            
            # Use GPT to interpret the query
            response = openai_client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": "Convert the following natural language MongoDB query to a Python code that uses PyMongo. Return only the code without any explanation."},
                    {"role": "user", "content": f"Query: {query}\nConvert this to PyMongo code that should give me the result object."}
                ]
            )
            
            mongo_code = response.choices[0].message.content.strip()
            
            # Extract the code block if present
            if "```python" in mongo_code:
                mongo_code = mongo_code.split("```python")[1].split("```")[0].strip()
            elif "```" in mongo_code:
                mongo_code = mongo_code.split("```")[1].split("```")[0].strip()
            
            # Execute the code with local variables
            local_vars = {"db": db}
            exec(f"result = {mongo_code}", globals(), local_vars)
            
            result = local_vars.get("result")
            
            if isinstance(result, list) or hasattr(result, 'to_list'):
                # Convert cursor to list if needed
                if hasattr(result, 'to_list'):
                    # Check if to_list is a coroutine
                    if asyncio.iscoroutinefunction(result.to_list):
                        result_list = await result.to_list(length=100)  # Limit to 100 docs
                    else:
                        result_list = result.to_list(length=100)
                else:
                    result_list = result[:100]  # Limit to 100 docs
                
                # Format as HTML table
                if not result_list:
                    return "Query executed successfully. No results returned."
                
                # Get all keys
                all_keys = set()
                for doc in result_list:
                    all_keys.update(doc.keys())
                
                # Create HTML table
                columns = list(all_keys)
                rows = []
                for doc in result_list:
                    row = []
                    for key in all_keys:
                        row.append(str(doc.get(key, "")))
                    rows.append(row)
                
                html_table = await format_table_results(columns, rows)
                return f"Query results:\n\n{html_table}"
            else:
                return f"Query executed successfully: {result}"
        
        else:
            return f"Unsupported database type for queries: {dbms}"
    
    except Exception as e:
        logger.error(f"Error executing query: {e}")
        return f"Error executing query: {str(e)}"

async def connect_to_last_database(client_id: str) -> str:
    """Connect to the last used database and return status message"""
    # Get the last connection info
    connection_info = get_last_connection()
    
    if not connection_info:
        return "No recent database connection found. Please connect to a database first."
    
    # Try to connect
    connection, details = await create_db_connection(connection_info)
    
    if connection and details:
        # Store the connection
        db_connections[client_id] = connection
        connection_details[client_id] = details
        
        return f"Connected to {details['dbms']} database at {details['host']}:{details['port']}/{details['database']}"
    else:
        return "Failed to connect to the last used database. Please try connecting manually."

# New function to save chat message to database
async def save_chat_message(client_id: str, chat_id: int, message_type: str, content: str, db: Session):
    """Save a chat message to the database"""
    try:
        # Create new message
        new_message = ChatMessage(
            chat_id=chat_id,
            message_type=message_type,
            content=content,
            timestamp=datetime.now()
        )
        db.add(new_message)
        db.commit()
        
        return True
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        db.rollback()
        return False

# New function to create a chat history
async def create_chat_history(client_id: str, name: str, db: Session) -> int:
    """Create a new chat history and return its ID"""
    try:
        # Create new chat history
        new_chat = ChatHistory(
            name=name,
            user_id=client_id,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        
        return new_chat.id
    except Exception as e:
        logger.error(f"Error creating chat history: {e}")
        db.rollback()
        return None

# Function to send email with chat content
async def send_chat_via_email(recipient_email: str, sender_name: str, chat_id: int, db: Session) -> bool:
    """Send chat content via email"""
    try:
        # Get chat history and messages
        chat = db.query(ChatHistory).filter(ChatHistory.id == chat_id).first()
        if not chat:
            return False
        
        messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.timestamp).all()
        if not messages:
            return False
        
        # Format the email content
        email_content = f"<h2>SQL Chat Shared by {sender_name}</h2>"
        email_content += f"<h3>Chat: {chat.name}</h3>"
        email_content += "<div style='max-width: 800px; margin: 0 auto;'>"
        
        for msg in messages:
            role = "You" if msg.message_type == "user" else "Assistant"
            style = "background-color: #e1f5fe; padding: 10px; border-radius: 8px; margin-bottom: 10px;" if msg.message_type == "user" else "background-color: #f5f5f5; padding: 10px; border-radius: 8px; margin-bottom: 10px;"
            email_content += f"<div style='{style}'><strong>{role}:</strong><br/>{msg.content}</div>"
        
        email_content += "</div>"
        
        # Create email message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = f"SQL Chat: {chat.name} - Shared by {sender_name}"
        
        msg.attach(MIMEText(email_content, 'html'))
        
        # Send the email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
            
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False

async def process_user_message(client_id: str, message: dict, db: Session, chat_id: int = None) -> dict:
    """Process user message and generate a response using OpenAI"""
    content = message.get('content', '')
    
    # Check if chat_id exists, if not, create a new chat history
    if not chat_id:
        chat_name = f"Database Chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        chat_id = await create_chat_history(client_id, chat_name, db)
    
    # Save the user message to the database
    await save_chat_message(client_id, chat_id, "user", content, db)
    
    # Check if client is connected to a database, if not, try to connect
    if client_id not in db_connections:
        connect_message = await connect_to_last_database(client_id)
        
        # If connection failed, inform the user
        if "Failed" in connect_message or "No recent" in connect_message:
            # Save bot message to database
            response_content = connect_message
            await save_chat_message(client_id, chat_id, "bot", response_content, db)
            
            return {
                "type": "bot",
                "content": response_content,
                "timestamp": datetime.now().isoformat(),
                "chat_id": chat_id
            }
        
        # If connected successfully, continue processing the message
        logger.info(f"Auto-connected to database for client {client_id}")
    
    # Check for special commands
    
    # Check if this is a disconnect request
    if 'disconnect' in content.lower() and ('database' in content.lower() or 'connection' in content.lower()):
        if client_id in db_connections:
            try:
                # Close connection based on database type
                if connection_details[client_id]['dbms'].lower() in ['postgresql', 'mysql', 'sqlserver', 'redshift']:
                    db_connections[client_id].dispose()
                elif connection_details[client_id]['dbms'].lower() == 'mongodb':
                    db_connections[client_id].close()
                
                # Remove from storage
                del db_connections[client_id]
                del connection_details[client_id]
                
                response_content = "Database connection closed successfully."
                await save_chat_message(client_id, chat_id, "bot", response_content, db)
                
                return {
                    "type": "bot",
                    "content": response_content,
                    "timestamp": datetime.now().isoformat(),
                    "chat_id": chat_id
                }
            except Exception as e:
                logger.error(f"Error disconnecting: {e}")
                
                response_content = f"Error disconnecting from database: {str(e)}"
                await save_chat_message(client_id, chat_id, "bot", response_content, db)
                
                return {
                    "type": "bot",
                    "content": response_content,
                    "timestamp": datetime.now().isoformat(),
                    "chat_id": chat_id
                }
    
    # Get database schema to help with query generation
    schema_info = await get_database_schema(client_id)
    
    # Direct SQL detection - if the message starts with typical SQL keywords, treat it as a direct SQL query
    direct_sql_keywords = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'show', 'describe']
    if any(content.strip().lower().startswith(keyword) for keyword in direct_sql_keywords):
        # Execute the query directly
        result = await execute_database_query(client_id, content)
        
        response_content = f"I'll run this query for you:\n```sql\n{content}\n```\n\n{result}"
        await save_chat_message(client_id, chat_id, "bot", response_content, db)
        
        return {
            "type": "bot",
            "content": response_content,
            "timestamp": datetime.now().isoformat(),
            "chat_id": chat_id
        }
    
    # Check if this is a database query using GPT
    system_prompt = f"""You are a helpful database assistant. The user has connected to a {connection_details[client_id]['dbms']} database.
    
Database structure:
Tables: {', '.join(schema_info.get('tables', []))}
"""

    # Add column details for each table
    if 'columns' in schema_info:
        system_prompt += "\nTable details:\n"
        for table, columns in schema_info.get('columns', {}).items():
            system_prompt += f"- {table}: {', '.join([f'{col[0]} ({col[1]})' for col in columns])}\n"
    
    system_prompt += "\nDetermine if the user's message is a database query request. If it is, identify the SQL or database operation needed. Respond with JSON including 'is_query' (boolean) and 'explanation' (string)."
    
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": content}
        ],
        response_format={"type": "json_object"}
    )
    
    analysis = json.loads(response.choices[0].message.content)
    
    # If this appears to be a query request
    if analysis.get('is_query', False):
        # Generate the database query using schema info
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": f"""You are a database expert. Convert the following request into a valid {connection_details[client_id]['dbms']} query.
                
Database structure:
Tables: {', '.join(schema_info.get('tables', []))}

Table details:
{
    ''.join([f"- {table}: {', '.join([f'{col[0]} ({col[1]})' for col in columns])}\n" for table, columns in schema_info.get('columns', {}).items()])
}

Return only the query without any explanation. Be precise with table and column names."""},
                {"role": "user", "content": content}
            ]
        )
        
        query = response.choices[0].message.content.strip()
        
        # Extract the query if it's in a code block
        if "```" in query:
            query = query.split("```")[1].split("```")[0].strip()
            # Remove SQL or other language identifier if present
            if query.lower().startswith(('sql', 'mongodb')):
                query = query.split("\n", 1)[1]
        
        # Execute the query
        result = await execute_database_query(client_id, query)
        
        # Return both the query and the result
        response_content = f"I'll run this query for you:\nsql\n{query}\n\n\n{result}"
        await save_chat_message(client_id, chat_id, "bot", response_content, db)
        
        return {
            "type": "bot",
            "content": response_content,
            "timestamp": datetime.now().isoformat(),
            "chat_id": chat_id
        }
    
    # For all other messages, use GPT to generate a response
    system_message = "You are a helpful database assistant that can answer questions about database content. "
    
    if client_id in db_connections:
        #system_message += f"The user is currently connected to a {connection_details[client_id]['dbms']} database at {connection_details[client_id]['

        system_message += f"The user is currently connected to a {connection_details[client_id]['dbms']} database at {connection_details[client_id]['host']}:{connection_details[client_id]['port']}/{connection_details[client_id]['database']}. "
        system_message += "If they ask a question about the database content, structure, or schema, suggest a relevant query I could run for them."
        
        # Add schema information
        if schema_info:
            system_message += f"\n\nDatabase structure:\nTables: {', '.join(schema_info.get('tables', []))}\n"
            if 'columns' in schema_info:
                system_message += "\nTable details:\n"
                for table, columns in schema_info.get('columns', {}).items():
                    system_message += f"- {table}: {', '.join([f'{col[0]} ({col[1]})' for col in columns])}\n"
    else:
        system_message += "The user is not currently connected to any database. I'll try to connect to their last used database first."
    
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": content}
        ]
    )
    
    return {
        "type": "bot",
        "content": response.choices[0].message.content,
        "timestamp": datetime.now().isoformat()
    }

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    logger.info(f"WebSocket connection attempt from client {client_id}")
    
    try:
        # Accept the connection
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for client {client_id}")
        
        # Add to connection manager
        await manager.connect(websocket, client_id)
        
        # Create a database session
        db = SessionLocal()
        
        try:
            # Attempt to connect to the last used database
            connect_message = await connect_to_last_database(client_id)
            
            # Send initial welcome message
            welcome_message = "Connected to the database chat assistant. "
            if "Connected to" in connect_message:
                welcome_message += f"{connect_message}. How can I help you today?"
            else:
                welcome_message += "How can I help you today? (Note: You are not currently connected to a database)"
                
            await websocket.send_text(json.dumps({
                "type": "bot",
                "content": welcome_message,
                "timestamp": datetime.now().isoformat()
            }))
            
            # Keep the connection open and listen for messages
            while True:
                try:
                    # Wait for a message from the client
                    data = await websocket.receive_text()
                    logger.info(f"Received message from client {client_id}")
                    
                    # Parse the message
                    message = json.loads(data)
                    
                    # Handle different message types
                    if message.get('type') == 'request_history':
                        # Fetch chat history for this client
                        chat_histories = db.query(ChatHistory).filter(ChatHistory.user_id == client_id).order_by(ChatHistory.updated_at.desc()).all()
                        
                        # Format the history for the frontend
                        history_data = []
                        for chat in chat_histories:
                            history_data.append({
                                "id": str(chat.id),
                                "name": chat.name,
                                "date": chat.updated_at.strftime("%b %d, %Y %H:%M")
                            })
                        
                        # Send the history back to the client
                        await websocket.send_text(json.dumps({
                            "type": "history",
                            "chats": history_data
                        }))
                    
                    elif message.get('type') == 'load_chat':
                        chat_id = message.get('chat_id')
                        if chat_id:
                            # Get the chat and its messages
                            chat = db.query(ChatHistory).filter(ChatHistory.id == chat_id).first()
                            if chat:
                                # Update the chat's last accessed time
                                chat.updated_at = datetime.now()
                                db.commit()
                                
                                # Get the messages for this chat
                                messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.timestamp).all()
                                
                                # Format messages for the frontend
                                formatted_messages = []
                                for i, msg in enumerate(messages):
                                    formatted_messages.append({
                                        "id": i + 1,
                                        "type": msg.message_type,
                                        "content": msg.content,
                                        "timestamp": msg.timestamp.isoformat()
                                    })
                                
                                # Send the chat data to the client
                                await websocket.send_text(json.dumps({
                                    "type": "load_chat",
                                    "messages": formatted_messages,
                                    "connection_id": None  # You would need to store this with the chat
                                }))
                    
                    elif message.get('type') == 'delete_chat':
                        chat_id = message.get('chat_id')
                        if chat_id:
                            # Delete the chat's messages first
                            db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).delete()
                            
                            # Then delete the chat itself
                            db.query(ChatHistory).filter(ChatHistory.id == chat_id).delete()
                            db.commit()
                            
                            # No need to send a response, the frontend already updates itself
                    
                    elif message.get('type') == 'share_chat':
                        chat_id = message.get('chat_id')
                        if chat_id:
                            # Generate a unique shareable link
                            share_token = str(uuid.uuid4())
                            
                            # In a real implementation, you'd store this token in the database
                            # and associate it with the chat_id
                            
                            # Generate a share URL (you'll need to implement the share endpoint separately)
                            share_url = f"http://localhost:8080/shared-chat/{share_token}"
                            
                            # Send the share URL back to the client
                            await websocket.send_text(json.dumps({
                                "type": "share_link",
                                "url": share_url
                            }))
                    
                    elif message.get('type') == 'save_chat':
                        # Save the current conversation as a new chat
                        if message.get('messages') and len(message.get('messages', [])) > 0:
                            # Create a new chat history with a meaningful name
                            # Extract name from the first few messages
                            messages_content = [msg.get('content', '') for msg in message.get('messages', []) if msg.get('type') == 'user']
                            if messages_content:
                                # Use the first user message as the chat name, truncated
                                chat_name = messages_content[0][:30] + "..." if len(messages_content[0]) > 30 else messages_content[0]
                            else:
                                chat_name = f"Database Chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
                            
                            # Create the chat history
                            chat_id = await create_chat_history(client_id, chat_name, db)
                            
                            # Save all messages
                            for msg in message.get('messages', []):
                                if msg.get('type') in ['user', 'bot'] and msg.get('content'):
                                    await save_chat_message(client_id, chat_id, msg.get('type'), msg.get('content'), db)
                            
                            # Return the new chat ID
                            await websocket.send_text(json.dumps({
                                "type": "chat_saved",
                                "chat_id": chat_id
                            }))
                    
                    elif message.get('type') == 'share_email':
                        # Share via email
                        recipient_email = message.get('recipient_email')
                        sender_name = message.get('sender_name')
                        chat_id = message.get('chat_id')
                        
                        if recipient_email and chat_id:
                            success = await send_chat_via_email(recipient_email, sender_name, chat_id, db)
                            
                            await websocket.send_text(json.dumps({
                                "type": "email_share_result",
                                "success": success
                            }))
                    
                    else:
                        # Default case: process as a regular user message
                        chat_id = message.get('chat_id')
                        response = await process_user_message(client_id, message, db, chat_id)
                        
                        # Send the response
                        await websocket.send_text(json.dumps(response))
                    
                except WebSocketDisconnect:
                    logger.info(f"Client {client_id} disconnected")
                    break
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    # Send error message to client
                    await websocket.send_text(json.dumps({
                        "type": "bot",
                        "content": f"An error occurred: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    }))
        finally:
            # Make sure to close the database session
            db.close()
    
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected during handshake")
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    
    finally:
        # Clean up resources and disconnect from connection manager
        manager.disconnect(client_id)
        
        # Close database connection if exists
        if client_id in db_connections:
            try:
                # Close database connection based on type
                if connection_details[client_id]['dbms'].lower() in ['postgresql', 'mysql', 'sqlserver', 'redshift']:
                    db_connections[client_id].dispose()
                elif connection_details[client_id]['dbms'].lower() == 'mongodb':
                    db_connections[client_id].close()
                
                del db_connections[client_id]
                del connection_details[client_id]
                logger.info(f"Database connection for client {client_id} closed")
            except Exception as e:
                logger.error(f"Error closing database connection: {e}")


