"""
AI Client Wrapper - Uses NVIDIA API (FREE with high quotas)
"""
import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Configure NVIDIA API (OpenAI-compatible)
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

class AIClient:
    """AI client using NVIDIA API (free)"""
    
    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=NVIDIA_API_KEY
        )
        # Using Llama 3.1 70B - excellent free model
        self.model_id = 'meta/llama-3.1-70b-instruct'
    
    def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = None,
        response_format: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Create a chat completion using NVIDIA API
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model name (optional, uses default if not specified)
            response_format: Optional response format (e.g., {"type": "json_object"})
        
        Returns:
            The response text
        """
        try:
            # Add JSON instruction to the last message if needed
            if response_format and response_format.get('type') == 'json_object':
                if messages and messages[-1]['role'] == 'user':
                    messages[-1]['content'] += "\n\nRespond with valid JSON only, no additional text."
            
            # Call NVIDIA API (OpenAI-compatible)
            response = self.client.chat.completions.create(
                model=model or self.model_id,
                messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            
            result = response.choices[0].message.content
            
            # Clean up result if JSON was requested
            if response_format and response_format.get('type') == 'json_object':
                result = result.strip()
                # Remove markdown code blocks if present
                if result.startswith('```'):
                    start_idx = result.find('\n')
                    if start_idx != -1:
                        end_idx = result.rfind('```')
                        if end_idx != -1:
                            result = result[start_idx + 1:end_idx].strip()
            
            return result
            
        except Exception as e:
            raise Exception(f"NVIDIA API error: {str(e)}")


# Create a singleton instance
ai_client = AIClient()


def get_ai_client() -> AIClient:
    """Get the AI client instance"""
    return ai_client
