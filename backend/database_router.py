

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import psycopg2
import pymongo
import redshift_connector
import mysql.connector
import uuid
from datetime import datetime
import urllib.parse
import os

# Create a router
router = APIRouter()

# Define the connection models
class ConnectionBase(BaseModel):
    type: str
    name: str
    host: str
    port: int
    database: str
    username: str
    password: str
    connection_string: Optional[str] = None

class ConnectionResponse(BaseModel):
    id: str
    type: str
    name: str
    host: str
    port: int
    database: str
    username: str
    password: str
    lastAccessed: str

# Connection to our management database (sqleditor)
def get_management_db_connection():
    """Get connection to the management database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv("MGMT_DB_HOST", "localhost"),
            port=os.getenv("MGMT_DB_PORT", 5432),
            database=os.getenv("MGMT_DB_NAME", "sqleditor"),
            user=os.getenv("MGMT_DB_USER", "postgres"),
            password=os.getenv("MGMT_DB_PASSWORD", "pwd")
        )
        conn.autocommit = True
        return conn
    except Exception as e:
        print(f"Error connecting to management DB: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to management database: {str(e)}")

def setup_management_db():
    """Create necessary tables if they don't exist"""
    conn = get_management_db_connection()
    cursor = conn.cursor()
    try:
        # Create connections table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS connections (
            id VARCHAR(36) PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            host VARCHAR(255) NOT NULL,
            port INTEGER NOT NULL,
            database_name VARCHAR(100) NOT NULL,
            username VARCHAR(100) NOT NULL,
            password VARCHAR(255) NOT NULL,
            last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """)
        conn.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to setup management database: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# Run setup on import (gracefully handle failures)
try:
    setup_management_db()
    print("✓ Management database connected successfully")
except Exception as e:
    print(f"⚠ Warning: Could not connect to management database: {e}")
    print("  The application will start but database features will not work until PostgreSQL is configured.")

# Dictionary to store active connections
active_connections = {}

@router.post("/connect")
async def connect_to_database(connection: ConnectionBase):
    """Connect to the specified database"""
    conn_id = str(uuid.uuid4())
    
    try:
        if connection.type == "postgres":
            # Connect to PostgreSQL
            # URL-encode the password to handle special characters
            encoded_password = urllib.parse.quote_plus(connection.password)
            conn = psycopg2.connect(
                host=connection.host,
                port=connection.port,
                database=connection.database,
                user=connection.username,
                password=connection.password  # psycopg2 handles special chars internally
            )
            conn.autocommit = True
            
        # elif connection.type == "mongodb":
        #     # Connect to MongoDB
        #     try:
        #         if connection.connection_string:
        #             # Use full connection string if provided
        #             conn = pymongo.MongoClient(connection.connection_string)
        #         elif connection.username and connection.password:
        #             # Use auth if credentials are provided
        #             encoded_password = urllib.parse.quote_plus(connection.password)
        #             conn = pymongo.MongoClient(
        #                 host=connection.host,
        #                 port=connection.port,
        #                 username=connection.username,
        #                 password=encoded_password,
        #                 authSource="admin"  # or the relevant DB
        #             )
        #         else:
        #             # No auth - used for default local MongoDB
        #             conn = pymongo.MongoClient(
        #                 host=connection.host,
        #                 port=connection.port
        #             )

        #         # Test the connection
        #         conn.admin.command('ping')
    
        #     except Exception as mongo_error:
        #         raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(mongo_error)}")

    #     elif connection.type == "mongodb":
    # # Connect to MongoDB
    #         try:
    #     # Simplify connection logic - use just what's needed
    #             if connection.connection_string and connection.connection_string.strip():
    #         # Use connection string directly if provided
    #                 conn = pymongo.MongoClient(connection.connection_string)
    #             else:
    #         # Build connection from individual parameters
    #                 conn = pymongo.MongoClient(
    #                     host=connection.host,
    #                     port=connection.port,
    #             # Only include these if they're provided and not empty
    #                     username=connection.username if connection.username else None,
    #                     password=connection.password if connection.password else None,
    #             # Don't set authSource unless credentials are provided
    #                     authSource="admin" if connection.username and connection.password else None
    #                 )
        
    #     # Verify connection with a simple ping
    #             conn.admin.command('ping')
        
    #         except Exception as mongo_error:
    #             raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(mongo_error)}")
        elif connection.type == "mongodb":
    # Connect to MongoDB
            try:
        # Print debug info to help diagnose the issue
                print(f"MongoDB connection details - Host: '{connection.host}', Connection string: '{connection.connection_string}'")
        
        # Check if we have valid connection parameters
                has_conn_string = connection.connection_string and connection.connection_string.strip()
                has_valid_host = connection.host and connection.host.strip()
        
                if not has_conn_string and not has_valid_host:
            # Try to use default localhost if nothing is provided
                    print("No valid connection parameters provided, attempting localhost connection")
                    conn = pymongo.MongoClient("mongodb://localhost:27017/")
                elif has_conn_string:
            # Use connection string if provided
                    print("Using connection string for MongoDB connection")
                    conn = pymongo.MongoClient(connection.connection_string.strip())
                else:
            # Use host-based connection
                    print(f"Using host-based connection: {connection.host}:{connection.port}")
                    conn_kwargs = {
                            "host": connection.host.strip(),
                             "port": connection.port
                        }
            
            # Add authentication if provided
                    if connection.username and connection.password:
                        conn_kwargs["username"] = connection.username
                        conn_kwargs["password"] = connection.password
                        conn_kwargs["authSource"] = "admin"  # Default auth source
                
                    conn = pymongo.MongoClient(**conn_kwargs)
        
        # Test connection with ping
                conn.admin.command('ping')
        
            except Exception as mongo_error:
                print(f"MongoDB connection error details: {mongo_error}")
                raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(mongo_error)}")

    #     elif connection.type == "mongodb":
    # # Connect to MongoDB
    #         try:
    #     # Debug logging to help identify connection parameters
    #             print(f"MongoDB connection attempt - Details: Host: '{connection.host}', Port: {connection.port}, Connection String: '{connection.connection_string}'")
        
    #     # Handle Atlas connection strings and standard connections
    #             if connection.connection_string and connection.connection_string.strip():
    #         # Use connection string if provided (works for both Atlas and standard MongoDB)
    #                 conn = pymongo.MongoClient(connection.connection_string.strip())
    #         # Extract database name from connection string if available
    #                 if '/' in connection.connection_string:
    #                     db_name = connection.connection_string.split('/')[-1]
    #                     if '?' in db_name:  # Handle query parameters
    #                         db_name = db_name.split('?')[0]
    #             # Test connection with the specific database if possible
    #                     if db_name:
    #                         conn[db_name].command('ping')
    #                     else:
    #                         conn.admin.command('ping')
    #                 else:
    #                     conn.admin.command('ping')
    #             elif connection.host and connection.host.strip():
    #         # Use host-based connection if connection string is not provided
    #                 conn_kwargs = {
    #                     "host": connection.host.strip(),
    #                     "port": connection.port
    #                 }
            
    #         # Add authentication if provided
    #                 if connection.username and connection.password:
    #                     conn_kwargs["username"] = connection.username
    #                     conn_kwargs["password"] = urllib.parse.quote_plus(connection.password)
    #                     conn_kwargs["authSource"] = "admin"  # Default auth source
            
    #                 conn = pymongo.MongoClient(**conn_kwargs)
             
    #         # Test the connection
    #                 conn.admin.command('ping')
    #             else:
    #                 raise ValueError("MongoDB requires either a valid connection_string or host")
        
    #         except Exception as mongo_error:
    #             raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(mongo_error)}")
            
        elif connection.type == "redshift":
            # Connect to Redshift
            conn = redshift_connector.connect(
                host=connection.host,
                port=connection.port,
                database=connection.database,
                user=connection.username,
                password=connection.password  # redshift_connector handles special chars
            )
            conn.autocommit = True
            
        elif connection.type == "mysql":
            # Connect to MySQL
            conn = mysql.connector.connect(
                host=connection.host,
                port=connection.port,
                database=connection.database,
                user=connection.username,
                password=connection.password  # mysql.connector handles special chars
            )
            conn.autocommit = True
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported database type: {connection.type}")

        # Store the active connection
        active_connections[conn_id] = {
            "connection": conn,
            "details": connection.dict()
        }
        print(active_connections)
        # Store connection in PostgreSQL database
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        try:
            # Check if connection with same name and type already exists
            cursor.execute(
                "SELECT id FROM connections WHERE name = %s AND type = %s",
                (connection.name, connection.type)
            )
            existing_conn = cursor.fetchone()
            
            current_time = datetime.now().isoformat()
            
            if existing_conn:
                # Update existing connection
                cursor.execute(
                    """
                    UPDATE connections 
                    SET host = %s, port = %s, database_name = %s, username = %s, 
                    password = %s, last_accessed = %s
                    WHERE id = %s
                    """,
                    (
                        connection.host, connection.port, connection.database,
                        connection.username, connection.password, current_time,
                        existing_conn[0]
                    )
                )
                conn_id = existing_conn[0]
            else:
                # Insert new connection
                print("Inserting new connection")
                cursor.execute(
                    """
                    INSERT INTO connections 
                    (id, type, name, host, port, database_name, username, password, last_accessed)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        conn_id, connection.type, connection.name, connection.host,
                        connection.port, connection.database, connection.username,
                        connection.password, current_time
                    )
                )
            
            mgmt_conn.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save connection: {str(e)}")
        finally:
            cursor.close()
            mgmt_conn.close()
        
        return {"message": f"Successfully connected to {connection.type}", "connection_id": conn_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")

@router.get("/recent-connections", response_model=List[ConnectionResponse])
async def get_recent_connections():
    """Get list of recent database connections"""
    try:
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        cursor.execute(
            """
            SELECT id, type, name, host, port, database_name, username, password, last_accessed
            FROM connections
            ORDER BY last_accessed DESC
            """
        )
        
        connections = []
        for row in cursor.fetchall():
            connections.append({
                "id": row[0],
                "type": row[1],
                "name": row[2],
                "host": row[3],
                "port": row[4],
                "database": row[5],
                "username": row[6],
                "password": row[7],
                "lastAccessed": row[8].isoformat() if isinstance(row[8], datetime) else row[8]
            })
        
        cursor.close()
        mgmt_conn.close()
        
        return connections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve connections: {str(e)}")

@router.post("/disconnect/{connection_id}")
async def disconnect_database(connection_id: str):
    """Disconnect from a database"""
    if connection_id not in active_connections:
        # Check if the connection is in the database but not active
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        cursor.execute("SELECT id FROM connections WHERE id = %s", (connection_id,))
        exists = cursor.fetchone()
        
        cursor.close()
        mgmt_conn.close()
        
        if exists:
            return {"message": "Connection was already disconnected"}
        else:
            raise HTTPException(status_code=404, detail="Connection not found")
    
    try:
        conn_type = active_connections[connection_id]["details"]["type"]
        conn = active_connections[connection_id]["connection"]
        
        # Close the connection based on type
        if conn_type in ["postgres", "redshift", "mysql"]:
            conn.close()
        elif conn_type == "mongodb":
            conn.close()
        
        # Remove from active connections
        del active_connections[connection_id]
        
        # Update last_accessed time in database
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        cursor.execute(
            "UPDATE connections SET last_accessed = %s WHERE id = %s",
            (datetime.now().isoformat(), connection_id)
        )
        
        mgmt_conn.commit()
        cursor.close()
        mgmt_conn.close()
        
        return {"message": f"Successfully disconnected from {conn_type}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to disconnect: {str(e)}")

@router.delete("/delete-connection/{connection_id}")
async def delete_connection(connection_id: str):
    """Delete a connection from the database"""
    try:
        # First check if the connection is active and disconnect if needed
        if connection_id in active_connections:
            conn_type = active_connections[connection_id]["details"]["type"]
            conn = active_connections[connection_id]["connection"]
            
            # Close the connection based on type
            if conn_type in ["postgres", "redshift", "mysql"]:
                conn.close()
            elif conn_type == "mongodb":
                conn.close()
            
            # Remove from active connections
            del active_connections[connection_id]
        
        # Now delete the connection from the management database
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        # Check if connection exists
        cursor.execute("SELECT id FROM connections WHERE id = %s", (connection_id,))
        exists = cursor.fetchone()
        
        if not exists:
            cursor.close()
            mgmt_conn.close()
            raise HTTPException(status_code=404, detail="Connection not found")
        
        # Delete the connection
        cursor.execute("DELETE FROM connections WHERE id = %s", (connection_id,))
        mgmt_conn.commit()
        
        cursor.close()
        mgmt_conn.close()
        
        return {"message": "Connection deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        else:
            raise HTTPException(status_code=500, detail=f"Failed to delete connection: {str(e)}")

@router.get("/test-connection/{connection_id}")
async def test_connection(connection_id: str):
    """Test if a connection is still active"""
    if connection_id not in active_connections:
        return {"status": "disconnected"}
    
    try:
        conn_type = active_connections[connection_id]["details"]["type"]
        conn = active_connections[connection_id]["connection"]
        
        if conn_type == "postgres":
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
        elif conn_type == "mongodb":
            conn.admin.command('ping')
        elif conn_type == "redshift":
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
        elif conn_type == "mysql":
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            cursor.close()
            
        return {"status": "connected"}
    except Exception:
        # If the test fails, remove the connection
        del active_connections[connection_id]
        return {"status": "disconnected"}


@router.get("/last-connection", response_model=ConnectionResponse)
async def get_last_connection():
    """Get the most recent active connection"""
    try:
        mgmt_conn = get_management_db_connection()
        cursor = mgmt_conn.cursor()
        
        cursor.execute("""
            SELECT id, type, name, host, port, database_name, username, password, last_accessed
            FROM connections
            ORDER BY last_accessed DESC
            LIMIT 1
        """)
        
        row = cursor.fetchone()
        cursor.close()
        mgmt_conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="No recent connections found.")
        
        return {
            "id": row[0],
            "type": row[1],
            "name": row[2],
            "host": row[3],
            "port": row[4],
            "database": row[5],
            "username": row[6],
            "password": row[7],
            "lastAccessed": row[8].isoformat() if isinstance(row[8], datetime) else row[8]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve last connection: {str(e)}")

#corrected

# from fastapi import APIRouter, HTTPException, Depends
# from pydantic import BaseModel
# from typing import List, Optional, Dict, Any
# import psycopg2
# import pymongo
# import redshift_connector
# import mysql.connector
# import uuid
# from datetime import datetime
# import urllib.parse
# import os

# # Create a router
# router = APIRouter()

# # Define the connection models
# class ConnectionBase(BaseModel):
#     type: str
#     name: str
#     host: str
#     port: int
#     database: str
#     username: str
#     password: str
#     connection_string: Optional[str] = None

# class ConnectionResponse(BaseModel):
#     id: str
#     type: str
#     name: str
#     host: str
#     port: int
#     database: str
#     username: str
#     password: str
#     lastAccessed: str

# # Connection to our management database (sqleditor)
# def get_management_db_connection():
#     """Get connection to the management database"""
#     try:
#         conn = psycopg2.connect(
#             host=os.getenv("MGMT_DB_HOST", "localhost"),
#             port=os.getenv("MGMT_DB_PORT", 5432),
#             database=os.getenv("MGMT_DB_NAME", "sqleditor"),
#             user=os.getenv("MGMT_DB_USER", "postgres"),
#             password=os.getenv("MGMT_DB_PASSWORD", "user123")
#         )
#         conn.autocommit = True
#         return conn
#     except Exception as e:
#         print(f"Error connecting to management DB: {e}")
#         raise HTTPException(status_code=500, detail=f"Failed to connect to management database: {str(e)}")

# def setup_management_db():
#     """Create necessary tables if they don't exist"""
#     conn = get_management_db_connection()
#     cursor = conn.cursor()
#     try:
#         # Create connections table if it doesn't exist
#         cursor.execute("""
#         CREATE TABLE IF NOT EXISTS connections (
#             id VARCHAR(36) PRIMARY KEY,
#             type VARCHAR(50) NOT NULL,
#             name VARCHAR(100) NOT NULL,
#             host VARCHAR(255) NOT NULL,
#             port INTEGER NOT NULL,
#             database_name VARCHAR(100) NOT NULL,
#             username VARCHAR(100) NOT NULL,
#             password VARCHAR(255) NOT NULL,
#             last_accessed TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
#         )
#         """)
#         conn.commit()
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to setup management database: {str(e)}")
#     finally:
#         cursor.close()
#         conn.close()

# # Run setup on import
# setup_management_db()

# # Dictionary to store active connections
# active_connections = {}

# @router.post("/connect")
# async def connect_to_database(connection: ConnectionBase):
#     """Connect to the specified database"""
#     conn_id = str(uuid.uuid4())
    
#     try:
#         if connection.type == "postgres":
#             # Connect to PostgreSQL
#             # URL-encode the password to handle special characters
#             encoded_password = urllib.parse.quote_plus(connection.password)
#             conn = psycopg2.connect(
#                 host=connection.host,
#                 port=connection.port,
#                 database=connection.database,
#                 user=connection.username,
#                 password=connection.password  # psycopg2 handles special chars internally
#             )
#             conn.autocommit = True
            
#         # elif connection.type == "mongodb":
#         #     # Connect to MongoDB
#         #     encoded_password = urllib.parse.quote_plus(connection.password)
#         #     if connection.connection_string:
#         #         # Ensure connection string has encoded password if it contains one
#         #         conn = pymongo.MongoClient(connection.connection_string)
#         #     else:
#         #         conn = pymongo.MongoClient(
#         #             host=connection.host,
#         #             port=connection.port,
#         #             username=connection.username,
#         #             password=encoded_password
#         #         )
#         #     # Test the connection
#         #     conn.admin.command('ping')

#         elif connection.type == "mongodb":
#     # Connect to MongoDB
#             try:
#                 if connection.connection_string:
#             # Use full connection string if provided
#                     conn = pymongo.MongoClient(connection.connection_string)
#                 elif connection.username and connection.password:
#             # Use auth if credentials are provided
#                     encoded_password = urllib.parse.quote_plus(connection.password)
#                     conn = pymongo.MongoClient(
#                     host=connection.host,
#                     port=connection.port,
#                     username=connection.username,
#                     password=encoded_password,
#                     authSource="admin"  # or the relevant DB
#                     )
#                 else:
#             # No auth - used for default local MongoDB
#                     conn = pymongo.MongoClient(
#                     host=connection.host,
#                     port=connection.port
#                     )

#         # Test the connection
#                     conn.admin.command('ping')
    
#             except Exception as mongo_error:
#                 raise HTTPException(status_code=500, detail=f"MongoDB connection error: {str(mongo_error)}")

            
#         elif connection.type == "redshift":
#             # Connect to Redshift
#             conn = redshift_connector.connect(
#                 host=connection.host,
#                 port=connection.port,
#                 database=connection.database,
#                 user=connection.username,
#                 password=connection.password  # redshift_connector handles special chars
#             )
#             conn.autocommit = True
            
#         elif connection.type == "mysql":
#             # Connect to MySQL
#             conn = mysql.connector.connect(
#                 host=connection.host,
#                 port=connection.port,
#                 database=connection.database,
#                 user=connection.username,
#                 password=connection.password  # mysql.connector handles special chars
#             )
#             conn.autocommit = True
            
#         else:
#             raise HTTPException(status_code=400, detail=f"Unsupported database type: {connection.type}")

#         # Store the active connection
#         active_connections[conn_id] = {
#             "connection": conn,
#             "details": connection.dict()
#         }
#         print(active_connections)
#         # Store connection in PostgreSQL database
#         mgmt_conn = get_management_db_connection()
#         cursor = mgmt_conn.cursor()
        
#         try:
#             # Check if connection with same name and type already exists
#             cursor.execute(
#                 "SELECT id FROM connections WHERE name = %s AND type = %s",
#                 (connection.name, connection.type)
#             )
#             existing_conn = cursor.fetchone()
            
#             current_time = datetime.now().isoformat()
            
#             if existing_conn:
#                 # Update existing connection
#                 cursor.execute(
#                     """
#                     UPDATE connections 
#                     SET host = %s, port = %s, database_name = %s, username = %s, 
#                     password = %s, last_accessed = %s
#                     WHERE id = %s
#                     """,
#                     (
#                         connection.host, connection.port, connection.database,
#                         connection.username, connection.password, current_time,
#                         existing_conn[0]
#                     )
#                 )
#                 conn_id = existing_conn[0]
#             else:
#                 # Insert new connection
#                 print("Inserting new connection")
#                 cursor.execute(
#                     """
#                     INSERT INTO connections 
#                     (id, type, name, host, port, database_name, username, password, last_accessed)
#                     VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
#                     """,
#                     (
#                         conn_id, connection.type, connection.name, connection.host,
#                         connection.port, connection.database, connection.username,
#                         connection.password, current_time
#                     )
#                 )
            
#             mgmt_conn.commit()
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Failed to save connection: {str(e)}")
#         finally:
#             cursor.close()
#             mgmt_conn.close()
        
#         return {"message": f"Successfully connected to {connection.type}", "connection_id": conn_id}
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to connect: {str(e)}")

# @router.get("/recent-connections", response_model=List[ConnectionResponse])
# async def get_recent_connections():
#     """Get list of recent database connections"""
#     try:
#         mgmt_conn = get_management_db_connection()
#         cursor = mgmt_conn.cursor()
        
#         cursor.execute(
#             """
#             SELECT id, type, name, host, port, database_name, username, password, last_accessed
#             FROM connections
#             ORDER BY last_accessed DESC
#             """
#         )
        
#         connections = []
#         for row in cursor.fetchall():
#             connections.append({
#                 "id": row[0],
#                 "type": row[1],
#                 "name": row[2],
#                 "host": row[3],
#                 "port": row[4],
#                 "database": row[5],
#                 "username": row[6],
#                 "password": row[7],
#                 "lastAccessed": row[8].isoformat() if isinstance(row[8], datetime) else row[8]
#             })
        
#         cursor.close()
#         mgmt_conn.close()
        
#         return connections
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to retrieve connections: {str(e)}")

# @router.post("/disconnect/{connection_id}")
# async def disconnect_database(connection_id: str):
#     """Disconnect from a database"""
#     if connection_id not in active_connections:
#         # Check if the connection is in the database but not active
#         mgmt_conn = get_management_db_connection()
#         cursor = mgmt_conn.cursor()
        
#         cursor.execute("SELECT id FROM connections WHERE id = %s", (connection_id,))
#         exists = cursor.fetchone()
        
#         cursor.close()
#         mgmt_conn.close()
        
#         if exists:
#             return {"message": "Connection was already disconnected"}
#         else:
#             raise HTTPException(status_code=404, detail="Connection not found")
    
#     try:
#         conn_type = active_connections[connection_id]["details"]["type"]
#         conn = active_connections[connection_id]["connection"]
        
#         # Close the connection based on type
#         if conn_type in ["postgres", "redshift", "mysql"]:
#             conn.close()
#         elif conn_type == "mongodb":
#             conn.close()
        
#         # Remove from active connections
#         del active_connections[connection_id]
        
#         # Update last_accessed time in database
#         mgmt_conn = get_management_db_connection()
#         cursor = mgmt_conn.cursor()
        
#         cursor.execute(
#             "UPDATE connections SET last_accessed = %s WHERE id = %s",
#             (datetime.now().isoformat(), connection_id)
#         )
        
#         mgmt_conn.commit()
#         cursor.close()
#         mgmt_conn.close()
        
#         return {"message": f"Successfully disconnected from {conn_type}"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to disconnect: {str(e)}")

# @router.get("/test-connection/{connection_id}")
# async def test_connection(connection_id: str):
#     """Test if a connection is still active"""
#     if connection_id not in active_connections:
#         return {"status": "disconnected"}
    
#     try:
#         conn_type = active_connections[connection_id]["details"]["type"]
#         conn = active_connections[connection_id]["connection"]
        
#         if conn_type == "postgres":
#             cursor = conn.cursor()
#             cursor.execute("SELECT 1")
#             cursor.close()
#         elif conn_type == "mongodb":
#             conn.admin.command('ping')
#         elif conn_type == "redshift":
#             cursor = conn.cursor()
#             cursor.execute("SELECT 1")
#             cursor.close()
#         elif conn_type == "mysql":
#             cursor = conn.cursor()
#             cursor.execute("SELECT 1")
#             cursor.close()
            
#         return {"status": "connected"}
#     except Exception:
#         # If the test fails, remove the connection
#         del active_connections[connection_id]
#         return {"status": "disconnected"}


# @router.get("/last-connection", response_model=ConnectionResponse)
# async def get_last_connection():
#     """Get the most recent active connection"""
#     try:
#         mgmt_conn = get_management_db_connection()
#         cursor = mgmt_conn.cursor()
        
#         cursor.execute("""
#             SELECT id, type, name, host, port, database_name, username, password, last_accessed
#             FROM connections
#             ORDER BY last_accessed DESC
#             LIMIT 1
#         """)
        
#         row = cursor.fetchone()
#         cursor.close()
#         mgmt_conn.close()
        
#         if not row:
#             raise HTTPException(status_code=404, detail="No recent connections found.")
        
#         return {
#             "id": row[0],
#             "type": row[1],
#             "name": row[2],
#             "host": row[3],
#             "port": row[4],
#             "database": row[5],
#             "username": row[6],
#             "password": row[7],
#             "lastAccessed": row[8].isoformat() if isinstance(row[8], datetime) else row[8]
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to retrieve last connection: {str(e)}")



