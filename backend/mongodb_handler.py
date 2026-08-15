from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import pymongo
import json
import ast
import bson
from bson.objectid import ObjectId
from bson.json_util import dumps, loads
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=openai_api_key)

mongo_router = APIRouter(prefix="/mongo", tags=["mongodb"])

# MongoDB connection management
def get_last_mongo_connection():
    """Get the last accessed MongoDB connection from the management database"""
    import psycopg2
    import psycopg2.extras
    
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
            WHERE type = 'mongodb'
            ORDER BY last_accessed DESC 
            LIMIT 1
        """)
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get MongoDB connection: {str(e)}")

def get_mongo_client():
    """Get a MongoDB client from the last connection info"""
    last_conn = get_last_mongo_connection()
    
    if not last_conn:
        raise HTTPException(status_code=404, detail="No MongoDB connection found")
    
    try:
        # Create MongoDB connection string
        conn_string = f"mongodb://{last_conn['username']}:{last_conn['password']}@{last_conn['host']}:{last_conn['port']}/"
        
        # Connect to MongoDB
        client = pymongo.MongoClient(conn_string)
        
        # Test connection
        client.admin.command('ping')
        
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect to MongoDB: {str(e)}")

# Pydantic models for MongoDB operations
class MongoExecuteRequest(BaseModel):
    database: str
    collection: str
    operation: str
    query: str
    options: Optional[str] = "{}"

class MongoSaveQuery(BaseModel):
    name: str
    description: str
    query: str
    type: str = "mongo"
    mongoContext: Dict[str, Any]

# Function to parse MongoDB query string to Python objects
def parse_query_string(query_string):
    """Convert a query string to a Python dict/list, handling ObjectId"""
    if not query_string or query_string.strip() == "":
        return {}
    
    # Replace ObjectId(...) with actual ObjectId objects
    def transform_objectid(match_obj):
        object_id = match_obj.group(1)
        return f'ObjectId("{object_id}")'
    
    import re
    query_string = re.sub(r'ObjectId\("([0-9a-f]{24})"\)', r'ObjectId("\1")', query_string)
    
    try:
        # First try with json.loads for valid JSON
        return json.loads(query_string)
    except json.JSONDecodeError:
        try:
            # If that fails, try using ast.literal_eval for Python syntax
            return ast.literal_eval(query_string)
        except (SyntaxError, ValueError):
            # If both fail, just return the string for operations like distinct
            if not query_string.startswith('{') and not query_string.startswith('['):
                return query_string
            raise HTTPException(status_code=400, detail="Invalid MongoDB query format")

@mongo_router.post("/execute")
async def execute_mongo_query(data: MongoExecuteRequest):
    """Execute a MongoDB query with the provided parameters"""
    try:
        mongo_client = get_mongo_client()
        db = mongo_client[data.database]
        collection = db[data.collection]
        
        # Parse the query and options strings to Python objects
        query = parse_query_string(data.query)
        options = parse_query_string(data.options)
        
        result = []
        
        # Execute the corresponding MongoDB operation
        if data.operation == "find":
            cursor = collection.find(query, **options)
            for doc in cursor:
                result.append(loads(dumps(doc)))
                
        elif data.operation == "findOne":
            doc = collection.find_one(query, **options)
            if doc:
                result.append(loads(dumps(doc)))
                
        elif data.operation == "count":
            count = collection.count_documents(query)
            result.append({"count": count})
            
        elif data.operation == "distinct":
            # For distinct, query is the field name
            distinct_values = collection.distinct(query)
            for value in distinct_values:
                result.append({"value": loads(dumps(value))})
                
        elif data.operation == "aggregate":
            if not isinstance(query, list):
                raise HTTPException(status_code=400, detail="Aggregation pipeline must be an array")
            
            cursor = collection.aggregate(query)
            for doc in cursor:
                result.append(loads(dumps(doc)))
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported operation: {data.operation}")
        
        return {"result": result}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@mongo_router.post("/validate")
async def validate_mongo_query(data: MongoExecuteRequest):
    """Validate and analyze a MongoDB query using OpenAI"""
    query = data.query
    operation = data.operation
    
    # Create a prompt for OpenAI that requests analysis of the MongoDB query
    prompt = f"""
    Analyze the following MongoDB {operation} query:
    
    ```javascript
    {query}
    ```
    
    Operation: {operation}
    Database: {data.database}
    Collection: {data.collection}
    
    Provide a comprehensive analysis including:
    1. A description of what the query does
    2. Optimization suggestions
    3. Potential issues or risks
    4. Index recommendations if applicable
    
    Format your response in markdown with clear sections.
    """
    
    try:
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": "You are an expert MongoDB database analyst that provides clear, concise insights about MongoDB queries."},
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
        ## Query Analysis

        **Description:** This appears to be a MongoDB {operation} operation on the {data.collection} collection.
        
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

@mongo_router.get("/databases")
async def get_mongo_databases():
    """Get list of available MongoDB databases"""
    try:
        mongo_client = get_mongo_client()
        database_names = mongo_client.list_database_names()
        # Filter out system databases
        user_databases = [db for db in database_names if db not in ["admin", "local", "config"]]
        return user_databases
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@mongo_router.get("/collections")
async def get_mongo_collections(db: str):
    """Get list of collections in the specified database"""
    try:
        mongo_client = get_mongo_client()
        database = mongo_client[db]
        collection_names = database.list_collection_names()
        return collection_names
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Save MongoDB query implementation can be added to the existing save_query endpoint
# by modifying it to handle the 'mongoContext' field