import google.generativeai as genai
from typing import Optional

def translate_to_english(nepali_text: str, api_key: str) -> Optional[str]:
    """
    Translates Nepali text to English using Google's Gemini API.
    
    Args:
        nepali_text (str): The Nepali text to translate
        api_key (str): Your Gemini API key
        
    Returns:
        Optional[str]: The English translation if successful, None if an error occurs
        
    Raises:
        ValueError: If the input text or API key is empty
        Exception: For API-related errors
    """
    try:
        # Input validation
        if not nepali_text or not api_key:
            raise ValueError("Both Nepali text and API key must be provided")
            
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Construct the prompt
        prompt = f"""
        Translate the following Nepali text to English:
        '{nepali_text}'
        Provide only the English translation without any additional text or explanations.
        """
        
        # Generate the translation
        response = model.generate_content(prompt)
        
        # Extract and return the translation
        if response and response.text:
            return response.text.strip()
        return None
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return None

