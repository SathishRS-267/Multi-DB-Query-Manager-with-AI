from fastapi import APIRouter, WebSocket, HTTPException, Depends, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
import json
import uuid
from ai_client import get_ai_client
import os
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import pymongo
from pymongo import MongoClient
import urllib.parse
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration & Initialization
# ---------------------------------------------------------------------------
ai_client = get_ai_client()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

MGMT_DB_HOST = os.getenv("MGMT_DB_HOST", "localhost")
MGMT_DB_PORT = os.getenv("MGMT_DB_PORT", "5432")
MGMT_DB_NAME = os.getenv("MGMT_DB_NAME", "multi-db-query-manager")
MGMT_DB_USER = os.getenv("MGMT_DB_USER", "postgres")
MGMT_DB_PASSWORD = os.getenv("MGMT_DB_PASSWORD", "")

SQLALCHEMY_DATABASE_URL = f"postgresql://{MGMT_DB_USER}:{MGMT_DB_PASSWORD}@{MGMT_DB_HOST}:{MGMT_DB_PORT}/{MGMT_DB_NAME}"

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.warning(f"Could not create database engine: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

# ---------------------------------------------------------------------------
# ORM Models
# ---------------------------------------------------------------------------
class ChatHistory(Base):
    __tablename__ = "chat_histories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, default="New Chat")
    user_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_histories.id"))
    message_type = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

try:
    if engine is not None:
        Base.metadata.create_all(bind=engine)
        print("✓ Chat tables created successfully")
    else:
        print("⚠ Skipping chat table creation (no database connection)")
except Exception as e:
    print(f"⚠ Warning: Could not create chat tables: {e}")

def get_db():
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------------------------------------------------
# Runtime State
# ---------------------------------------------------------------------------
db_connections: Dict[str, Any] = {}
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

manager = ConnectionManager()

# ---------------------------------------------------------------------------
# Shared Helpers
# ---------------------------------------------------------------------------
TABLE_CSS = """<style>
.table-container { overflow-x: auto; margin: 1rem 0; }
.query-results { border-collapse: collapse; width: 100%; font-family: sans-serif; }
.query-results th, .query-results td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.query-results tr:nth-child(even) { background-color: #f2f2f2; }
.query-results th { padding-top: 12px; padding-bottom: 12px; background-color: #4CAF50; color: white; }
</style>"""


def _build_response(content: str, chat_id: int = None) -> dict:
    """Build a standard bot response dict."""
    resp = {"type": "bot", "content": content, "timestamp": datetime.now().isoformat()}
    if chat_id is not None:
        resp["chat_id"] = chat_id
    return resp


def _build_schema_text(schema_info: dict) -> str:
    """Format schema info into a prompt-friendly string."""
    parts = []
    tables = schema_info.get('tables', schema_info.get('collections', []))
    if tables:
        parts.append(f"Tables/Collections: {', '.join(tables)}")
    if 'columns' in schema_info:
        parts.append("\nTable details:")
        for table, columns in schema_info['columns'].items():
            parts.append(f"- {table}: {', '.join(f'{c[0]} ({c[1]})' for c in columns)}")
    return "\n".join(parts)


def _close_db_connection(client_id: str):
    """Close and clean up a client's database connection."""
    if client_id not in db_connections:
        return
    try:
        dbms = connection_details[client_id]['dbms'].lower()
        if dbms in ('postgresql', 'mysql', 'sqlserver', 'redshift'):
            db_connections[client_id].dispose()
        elif dbms == 'mongodb':
            db_connections[client_id].close()
        del db_connections[client_id]
        del connection_details[client_id]
        logger.info(f"Database connection for client {client_id} closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")


def _extract_code_from_markdown(text: str) -> str:
    """Strip markdown code fences and language identifiers."""
    if "```" in text:
        parts = text.split("```")
        if len(parts) >= 3:
            text = parts[1].strip()
            if text.lower().startswith(('sql', 'python', 'javascript', 'mongo')):
                text = text.split("\n", 1)[-1].strip()
    return text


# ---------------------------------------------------------------------------
# Database Connection Management
# ---------------------------------------------------------------------------
def get_last_connection():
    """Retrieve the most recently accessed connection profile."""
    if engine is None:
        return None
    try:
        with engine.connect() as conn:
            result = conn.execute(text(
                "SELECT id, type, name, host, port, database_name, username, password "
                "FROM connections ORDER BY last_accessed DESC LIMIT 1"
            ))
            row = result.mappings().fetchone()
            return dict(row) if row else None
    except Exception as e:
        logger.error(f"Failed to get last connection: {e}")
        return None


async def create_db_connection(connection_info):
    """Create a SQLAlchemy engine or MongoDB client from connection details."""
    try:
        if not connection_info:
            return None, None

        db_type = connection_info['type'].lower()
        host = connection_info['host']
        port = connection_info['port']
        db_name = connection_info['database_name']
        user = connection_info['username']
        password = connection_info['password']

        base_details = {
            'host': host, 'port': port, 'database': db_name,
            'username': user, 'password': password,
        }

        if db_type == 'postgres':
            conn_str = f"postgresql://{user}:{password}@{host}:{port}/{db_name}"
            eng = create_engine(conn_str)
            with eng.connect() as c:
                c.execute(text("SELECT 1")).fetchone()
            return eng, {**base_details, 'dbms': 'postgresql'}

        elif db_type == 'mysql':
            escaped_pw = urllib.parse.quote_plus(password)
            conn_str = f"mysql+pymysql://{user}:{escaped_pw}@{host}:{port}/{db_name}"
            eng = create_engine(conn_str)
            with eng.connect() as c:
                c.execute(text("SELECT 1")).fetchone()
            return eng, {**base_details, 'dbms': 'mysql'}

        elif db_type == 'mongodb':
            if user and password:
                conn_str = f"mongodb://{user}:{password}@{host}:{port}/{db_name}"
            else:
                conn_str = f"mongodb://{host}:{port}/{db_name}"
            client = MongoClient(conn_str)
            client.admin.command('ping')
            return client, {**base_details, 'dbms': 'mongodb'}

        else:
            return None, None

    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        return None, None


# ---------------------------------------------------------------------------
# Schema Introspection
# ---------------------------------------------------------------------------
async def get_database_schema(client_id: str) -> dict:
    """Get database schema information to help with query generation."""
    if client_id not in db_connections:
        return {}
    try:
        connection = db_connections[client_id]
        dbms = connection_details[client_id]['dbms'].lower()
        schema_info = {}

        if dbms in ('postgresql', 'mysql'):
            with connection.connect() as conn:
                if dbms == 'postgresql':
                    result = conn.execute(text(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                    ))
                else:
                    db_name = connection_details[client_id]['database']
                    result = conn.execute(text(
                        f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{db_name}'"
                    ))
                tables = [row[0] for row in result]
                schema_info['tables'] = tables

                schema_info['columns'] = {}
                for table in tables:
                    result = conn.execute(text(
                        f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'"
                    ))
                    schema_info['columns'][table] = [(row[0], row[1]) for row in result]

        elif dbms == 'mongodb':
            database = connection_details[client_id]['database']
            db = connection[database]
            collections = db.list_collection_names()
            schema_info['tables'] = collections
            schema_info['columns'] = {}
            for coll_name in collections:
                sample = list(db[coll_name].find().limit(1))
                if sample:
                    doc = sample[0]
                    schema_info['columns'][coll_name] = [(k, type(v).__name__) for k, v in doc.items()]

        return schema_info
    except Exception as e:
        logger.error(f"Error getting database schema: {e}")
        return {}


# ---------------------------------------------------------------------------
# Result Formatting
# ---------------------------------------------------------------------------
async def format_table_results(columns, rows) -> str:
    """Format query results as a styled HTML table."""
    html = "<table class='query-results'>\n  <thead>\n    <tr>\n"
    for col in columns:
        html += f"      <th>{col}</th>\n"
    html += "    </tr>\n  </thead>\n  <tbody>\n"
    for row in rows:
        html += "    <tr>\n"
        for cell in row:
            html += f"      <td>{cell}</td>\n"
        html += "    </tr>\n"
    html += "  </tbody>\n</table>\n"
    return f"<div class=\"table-container\">\n{TABLE_CSS}\n{html}\n</div>"


async def _format_mongo_result(result) -> str:
    """Format any MongoDB result into a displayable string."""
    if hasattr(result, '__iter__') and not isinstance(result, (dict, str, bytes, list)):
        result = list(result)

    if isinstance(result, list) and result and all(isinstance(x, str) for x in result):
        html = await format_table_results(["Value"], [[x] for x in result])
        return f"Query results:\n\n{html}"

    if isinstance(result, list) and result and all(isinstance(x, dict) for x in result):
        docs = result[:100]
        keys = list(dict.fromkeys(k for doc in docs for k in doc.keys()))
        rows = [[str(doc.get(k, "")) for k in keys] for doc in docs]
        html = await format_table_results(keys, rows)
        return f"Query results:\n\n{html}"

    if isinstance(result, list) and not result:
        return "Query executed successfully. No results returned."

    if isinstance(result, dict):
        html = await format_table_results(list(result.keys()), [[str(v) for v in result.values()]])
        return f"Query results:\n\n{html}"

    if isinstance(result, str):
        return result

    return f"Query executed successfully: {result}"


# ---------------------------------------------------------------------------
# Query Execution
# ---------------------------------------------------------------------------
async def execute_database_query(client_id: str, query: str) -> str:
    """Execute database query and return results as formatted HTML."""
    if client_id not in db_connections:
        return "Error: Not connected to any database. Please wait while I attempt to connect."
    try:
        connection = db_connections[client_id]
        dbms = connection_details[client_id]['dbms'].lower()

        # --- SQL databases ---
        if dbms in ('postgresql', 'mysql'):
            with connection.connect() as conn:
                # Split multi-statement SQL and execute sequentially
                statements = [s.strip() for s in query.split(';') if s.strip()]
                last_result = "Query executed successfully."
                
                for stmt in statements:
                    res = conn.execute(text(stmt))
                    if res.returns_rows:
                        columns = list(res.keys())
                        rows = res.fetchall()
                        if rows:
                            html = await format_table_results(columns, rows)
                            last_result = f"Query results:\n\n{html}"
                        else:
                            last_result = "Query executed successfully. No results returned."
                    else:
                        last_result = f"Query executed successfully. Rows affected: {res.rowcount}"
                
                conn.commit()
                return last_result

        # --- MongoDB ---
        elif dbms == 'mongodb':
            database = connection_details[client_id]['database']
            mongo_db = connection[database]
            query_str = _extract_code_from_markdown(query.strip())

            # Special commands
            if query_str.lower() in ("show collections", "show tables", "list collections"):
                names = mongo_db.list_collection_names()
                if not names:
                    return "No collections found in this database."
                html = await format_table_results(["Collection Name"], [[n] for n in sorted(names)])
                return f"Query results:\n\n{html}"

            # Structured JSON operation
            parsed_op = None
            try:
                parsed_op = json.loads(query_str)
            except json.JSONDecodeError:
                pass

            if parsed_op:
                if isinstance(parsed_op, list):
                    last_result = "Query executed successfully."
                    for op_item in parsed_op:
                        if isinstance(op_item, dict) and "operation" in op_item:
                            last_result = await _execute_mongo_structured(mongo_db, op_item)
                    return last_result
                elif isinstance(parsed_op, dict) and "operation" in parsed_op:
                    return await _execute_mongo_structured(mongo_db, parsed_op)

            # Fallback: treat as shell-like shorthand
            query_str = query_str.replace("getCollectionInfos()", "list_collection_names()") \
                                 .replace("getCollectionNames()", "list_collection_names()")
            if "list_collection_names" in query_str:
                names = mongo_db.list_collection_names()
                html = await format_table_results(["Collection Name"], [[n] for n in sorted(names)])
                return f"Query results:\n\n{html}"

            return f"Error: Could not interpret MongoDB query. Please use natural language or a valid JSON operation."

        return f"Unsupported database type: {dbms}"

    except Exception as e:
        logger.error(f"Error executing query: {e}")
        return f"Error executing query: {str(e)}"


async def _execute_mongo_structured(mongo_db, op: dict) -> str:
    """Execute a structured MongoDB operation from a JSON spec."""
    collection_name = op.get("collection", "")
    operation = op.get("operation", "").lower()

    if not collection_name and operation != "list_collections":
        return "Error: No collection specified."

    try:
        if operation == "list_collections":
            names = mongo_db.list_collection_names()
            html = await format_table_results(["Collection Name"], [[n] for n in sorted(names)])
            return f"Query results:\n\n{html}"

        collection = mongo_db[collection_name]

        if operation == "find":
            query_filter = op.get("query", op.get("filter", {}))
            projection = op.get("projection", None)
            sort = op.get("sort", None)
            limit = op.get("limit", 100)
            cursor = collection.find(query_filter, projection)
            if sort:
                cursor = cursor.sort(list(sort.items()) if isinstance(sort, dict) else sort)
            docs = list(cursor.limit(limit))
            return await _format_mongo_result(docs)

        elif operation == "aggregate":
            docs = list(collection.aggregate(op.get("pipeline", [])))
            return await _format_mongo_result(docs)

        elif operation == "count":
            count = collection.count_documents(op.get("query", op.get("filter", {})))
            return f"Count: **{count}** documents"

        elif operation == "distinct":
            values = collection.distinct(
                op.get("field", op.get("key", "")),
                op.get("query", op.get("filter", {}))
            )
            return await _format_mongo_result(values)

        elif operation == "insert_many":
            documents = op.get("documents", op.get("docs", []))
            if not documents:
                return "Error: No documents to insert."
            res = collection.insert_many(documents)
            count = len(res.inserted_ids)
            docs = list(collection.find().limit(100))
            table_result = await _format_mongo_result(docs)
            return f"Successfully inserted {count} documents.\n\n{table_result}"

        elif operation == "insert_one":
            collection.insert_one(op.get("document", op.get("doc", {})))
            return "Document inserted successfully."

        elif operation == "update_many":
            res = collection.update_many(
                op.get("query", op.get("filter", {})),
                op.get("update", {})
            )
            return f"Matched {res.matched_count}, modified {res.modified_count} documents."

        elif operation == "delete_many":
            res = collection.delete_many(op.get("query", op.get("filter", {})))
            return f"Deleted {res.deleted_count} documents."

        return f"Unsupported MongoDB operation: {operation}"

    except Exception as e:
        logger.error(f"Structured Mongo operation error: {e}")
        return f"Error executing query: {str(e)}"


# ---------------------------------------------------------------------------
# Connection Helpers
# ---------------------------------------------------------------------------
async def connect_to_last_database(client_id: str) -> str:
    """Connect to the last used database and return status message."""
    connection_info = get_last_connection()
    if not connection_info:
        return "No recent database connection found. Please connect to a database first."

    connection, details = await create_db_connection(connection_info)
    if connection and details:
        db_connections[client_id] = connection
        connection_details[client_id] = details
        return f"Connected to {details['dbms']} database at {details['host']}:{details['port']}/{details['database']}"
    return "Failed to connect to the last used database. Please try connecting manually."


# ---------------------------------------------------------------------------
# Chat Persistence
# ---------------------------------------------------------------------------
async def save_chat_message(client_id: str, chat_id: int, message_type: str, content: str, db: Session):
    """Save a chat message to the database."""
    try:
        db.add(ChatMessage(chat_id=chat_id, message_type=message_type, content=content, timestamp=datetime.now()))
        db.commit()
        return True
    except Exception as e:
        logger.error(f"Error saving chat message: {e}")
        db.rollback()
        return False


async def create_chat_history(client_id: str, name: str, db: Session) -> int:
    """Create a new chat history and return its ID."""
    try:
        new_chat = ChatHistory(name=name, user_id=client_id, created_at=datetime.now(), updated_at=datetime.now())
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat.id
    except Exception as e:
        logger.error(f"Error creating chat history: {e}")
        db.rollback()
        return None


async def send_chat_via_email(recipient_email: str, sender_name: str, chat_id: int, db: Session) -> bool:
    """Send chat content via email."""
    try:
        chat = db.query(ChatHistory).filter(ChatHistory.id == chat_id).first()
        if not chat:
            return False
        messages = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id).order_by(ChatMessage.timestamp).all()
        if not messages:
            return False

        body = f"<h2>SQL Chat Shared by {sender_name}</h2><h3>Chat: {chat.name}</h3>"
        body += "<div style='max-width: 800px; margin: 0 auto;'>"
        for m in messages:
            role = "You" if m.message_type == "user" else "Assistant"
            bg = "#e1f5fe" if m.message_type == "user" else "#f5f5f5"
            body += f"<div style='background-color:{bg};padding:10px;border-radius:8px;margin-bottom:10px;'><strong>{role}:</strong><br/>{m.content}</div>"
        body += "</div>"

        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = recipient_email
        msg['Subject'] = f"SQL Chat: {chat.name} - Shared by {sender_name}"
        msg.attach(MIMEText(body, 'html'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


# ---------------------------------------------------------------------------
# AI Message Processing
# ---------------------------------------------------------------------------
async def process_user_message(client_id: str, message: dict, db: Session, chat_id: int = None) -> dict:
    """Process user message and generate a response using AI."""
    content = message.get('content', '')

    if not chat_id:
        chat_name = f"Database Chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
        chat_id = await create_chat_history(client_id, chat_name, db)

    await save_chat_message(client_id, chat_id, "user", content, db)

    # Auto-connect if needed
    if client_id not in db_connections:
        connect_msg = await connect_to_last_database(client_id)
        if "Failed" in connect_msg or "No recent" in connect_msg:
            await save_chat_message(client_id, chat_id, "bot", connect_msg, db)
            return _build_response(connect_msg, chat_id)
        logger.info(f"Auto-connected to database for client {client_id}")

    # Handle disconnect command
    if 'disconnect' in content.lower() and ('database' in content.lower() or 'connection' in content.lower()):
        if client_id in db_connections:
            try:
                _close_db_connection(client_id)
                resp = "Database connection closed successfully."
            except Exception as e:
                resp = f"Error disconnecting from database: {str(e)}"
            await save_chat_message(client_id, chat_id, "bot", resp, db)
            return _build_response(resp, chat_id)

    schema_info = await get_database_schema(client_id)
    dbms_type = connection_details.get(client_id, {}).get('dbms', 'postgresql').lower()
    schema_text = _build_schema_text(schema_info)

    # Direct SQL detection
    content_clean = content.strip()
    content_lower = content_clean.lower()
    conversational_words = ['all the', 'from the', 'collections', 'collection', 'data from',
                            'show me', 'list all', 'how many', 'what is', 'what are', 'table from', 'show all']
    is_conversational = any(w in content_lower for w in conversational_words)
    direct_keywords = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'show tables', 'show databases', 'describe']
    is_direct = not is_conversational and (content_lower.endswith(';') or any(content_lower.startswith(kw) for kw in direct_keywords))

    if is_direct:
        result = await execute_database_query(client_id, content_clean)
        lang = "python" if dbms_type == "mongodb" else "sql"
        resp = f"I'll run this query for you:\n```{lang}\n{content_clean}\n```\n\n{result}"
        await save_chat_message(client_id, chat_id, "bot", resp, db)
        return _build_response(resp, chat_id)

    # AI intent classification
    db_name = connection_details.get(client_id, {}).get('database', '')
    classify_prompt = (
        f"You are a helpful database assistant. The user is connected to a {dbms_type} database named '{db_name}'.\n\n"
        f"Database structure:\n{schema_text}\n\n"
        "Determine if the user's message is an EXECUTABLE database query/action request "
        "(e.g. fetching records, inserting documents, updating data, listing tables). "
        "If the user is asking for an EXPLANATION, DESCRIPTION, or GENERAL CONVERSATIONAL TEXT ANSWER "
        "(e.g. 'explain the schema', 'what is this database about'), set 'is_query': false. "
        "Respond with JSON including 'is_query' (boolean) and 'explanation' (string)."
    )

    response = ai_client.chat_completion(
        messages=[{"role": "system", "content": classify_prompt}, {"role": "user", "content": content}],
        response_format={"type": "json_object"}
    )
    try:
        analysis = json.loads(response)
    except Exception:
        analysis = {"is_query": True}

    # --- Generate & execute query ---
    if analysis.get('is_query', False):

        if dbms_type == 'mongodb':
            collections_csv = ', '.join(schema_info.get('tables', []))
            mongo_prompt = f"""You are an expert MongoDB engineer. Convert the user's natural language request into a STRUCTURED JSON operation.

Database Name: {db_name}
Collections: {collections_csv}

You MUST respond with ONLY a single valid JSON object (NOT an array). Use this schema:
{{
  "collection": "collection_name",
  "operation": "find|aggregate|count|distinct|insert_many|insert_one|update_many|delete_many|list_collections",
  "query": {{}},
  "projection": {{}},
  "sort": {{}},
  "limit": 100,
  "pipeline": [],
  "field": "",
  "documents": [],
  "document": {{}},
  "update": {{}}
}}

IMPORTANT RULES:
- ALWAYS return a single JSON object, NEVER a JSON array.
- For "insert and then show all data" requests: use operation "insert_many". The system will automatically display all documents after insertion.
- For "add N records" requests: generate N realistic sample documents matching the existing collection schema.

Examples:
- "show all data from users_activity" → {{"collection": "users_activity", "operation": "find", "query": {{}}}}
- "show collections" → {{"operation": "list_collections"}}
- "add 10 records to users_activity" → {{"collection": "users_activity", "operation": "insert_many", "documents": [...]}}

Respond with ONLY the JSON object, nothing else."""

            response = ai_client.chat_completion(
                messages=[{"role": "system", "content": mongo_prompt}, {"role": "user", "content": content}],
                response_format={"type": "json_object"}
            )
            query = response.strip()
            result = await execute_database_query(client_id, query)
            try:
                display_query = json.dumps(json.loads(query), indent=2)
            except Exception:
                display_query = query
            resp = f"I'll run this query for you:\n```json\n{display_query}\n```\n\n{result}"

        else:
            sql_prompt = f"""You are an expert database engineer. Convert the user's natural language request into a single valid SQL query for a {dbms_type} database.

Database Name: {db_name}
{schema_text}

RULES:
- For MySQL: use SHOW TABLES, DESCRIBE table_name, SELECT * FROM table_name, etc.
- For PostgreSQL: use SELECT table_name FROM information_schema.tables WHERE table_schema = 'public', etc.
- You CAN use multiple statements separated by semicolons. E.g. INSERT ...; SELECT * FROM table_name;
- For INSERT: do NOT specify auto-increment / serial primary key columns (like 'id'). Let the database assign them automatically.
- Return ONLY the raw SQL. No explanation, no markdown code fences."""

            response = ai_client.chat_completion(
                messages=[{"role": "system", "content": sql_prompt}, {"role": "user", "content": content}]
            )
            query = _extract_code_from_markdown(response.strip())
            result = await execute_database_query(client_id, query)
            resp = f"I'll run this query for you:\n```sql\n{query}\n```\n\n{result}"

        await save_chat_message(client_id, chat_id, "bot", resp, db)
        return _build_response(resp, chat_id)

    # --- Conversational / explanation response ---
    system_msg = "You are a helpful database assistant that can answer questions about database content. "
    if client_id in db_connections:
        det = connection_details[client_id]
        system_msg += f"The user is connected to a {det['dbms']} database at {det['host']}:{det['port']}/{det['database']}. "
        system_msg += "If they ask about content, structure, or schema, suggest a relevant query.\n\n"
        system_msg += f"Database structure:\n{schema_text}"
    else:
        system_msg += "The user is not currently connected to any database."

    response = ai_client.chat_completion(
        messages=[{"role": "system", "content": system_msg}, {"role": "user", "content": content}]
    )
    return _build_response(response)


# ---------------------------------------------------------------------------
# WebSocket Endpoint
# ---------------------------------------------------------------------------
@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    logger.info(f"WebSocket connection attempt from client {client_id}")

    try:
        await websocket.accept()
        logger.info(f"WebSocket connection accepted for client {client_id}")
        await manager.connect(websocket, client_id)
        db = SessionLocal()

        try:
            connect_message = await connect_to_last_database(client_id)
            welcome = "Connected to the database chat assistant. "
            if "Connected to" in connect_message:
                welcome += f"{connect_message}. How can I help you today?"
            else:
                welcome += "How can I help you today? (Note: You are not currently connected to a database)"
            await websocket.send_text(json.dumps(_build_response(welcome)))

            while True:
                try:
                    data = await websocket.receive_text()
                    logger.info(f"Received message from client {client_id}")
                    message = json.loads(data)
                    msg_type = message.get('type')

                    if msg_type == 'request_history':
                        chats = db.query(ChatHistory).filter(ChatHistory.user_id == client_id).order_by(ChatHistory.updated_at.desc()).all()
                        await websocket.send_text(json.dumps({
                            "type": "history",
                            "chats": [{"id": str(c.id), "name": c.name, "date": c.updated_at.strftime("%b %d, %Y %H:%M")} for c in chats]
                        }))

                    elif msg_type == 'load_chat':
                        cid = message.get('chat_id')
                        if cid:
                            chat = db.query(ChatHistory).filter(ChatHistory.id == cid).first()
                            if chat:
                                chat.updated_at = datetime.now()
                                db.commit()
                                msgs = db.query(ChatMessage).filter(ChatMessage.chat_id == cid).order_by(ChatMessage.timestamp).all()
                                await websocket.send_text(json.dumps({
                                    "type": "load_chat",
                                    "messages": [{"id": i+1, "type": m.message_type, "content": m.content, "timestamp": m.timestamp.isoformat()} for i, m in enumerate(msgs)],
                                    "connection_id": None
                                }))

                    elif msg_type == 'delete_chat':
                        cid = message.get('chat_id')
                        if cid:
                            db.query(ChatMessage).filter(ChatMessage.chat_id == cid).delete()
                            db.query(ChatHistory).filter(ChatHistory.id == cid).delete()
                            db.commit()

                    elif msg_type == 'share_chat':
                        cid = message.get('chat_id')
                        if cid:
                            share_url = f"http://localhost:8080/shared-chat/{uuid.uuid4()}"
                            await websocket.send_text(json.dumps({"type": "share_link", "url": share_url}))

                    elif msg_type == 'save_chat':
                        if message.get('messages'):
                            user_msgs = [m.get('content', '') for m in message['messages'] if m.get('type') == 'user']
                            chat_name = (user_msgs[0][:30] + "...") if user_msgs and len(user_msgs[0]) > 30 else (user_msgs[0] if user_msgs else f"Database Chat - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
                            new_chat_id = await create_chat_history(client_id, chat_name, db)
                            for m in message['messages']:
                                if m.get('type') in ('user', 'bot') and m.get('content'):
                                    await save_chat_message(client_id, new_chat_id, m['type'], m['content'], db)
                            await websocket.send_text(json.dumps({"type": "chat_saved", "chat_id": new_chat_id}))

                    elif msg_type == 'share_email':
                        recipient = message.get('recipient_email')
                        cid = message.get('chat_id')
                        if recipient and cid:
                            success = await send_chat_via_email(recipient, message.get('sender_name', ''), cid, db)
                            await websocket.send_text(json.dumps({"type": "email_share_result", "success": success}))

                    else:
                        response = await process_user_message(client_id, message, db, message.get('chat_id'))
                        await websocket.send_text(json.dumps(response))

                except WebSocketDisconnect:
                    logger.info(f"Client {client_id} disconnected")
                    break
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    await websocket.send_text(json.dumps(_build_response(f"An error occurred: {str(e)}")))
        finally:
            db.close()

    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected during handshake")
    except Exception as e:
        logger.error(f"Error in WebSocket connection: {e}")
    finally:
        manager.disconnect(client_id)
        _close_db_connection(client_id)
