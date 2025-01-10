import google.generativeai as genai

def summarize_document(document: str, api_key: str, max_length: int = 100) -> str:
    """
    Summarizes a document using Google's Gemini API.
    
    Args:
        document (str): The text content to be summarized
        api_key (str): Your Google API key for Gemini
        max_length (int, optional): Maximum length of the summary in words. Defaults to 250.
    
    Returns:
        str: A summary of the input document
        
    Raises:
        ValueError: If the API key is invalid or document is empty
        Exception: For other API-related errors
    """
    if not document.strip():
        raise ValueError("Document cannot be empty")
    
    if not api_key.strip():
        raise ValueError("API key cannot be empty")
    
    try:
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-pro')
        
        # Create the prompt
        prompt = f"""Please provide a concise summary of the following text in no more than {max_length} words. 
        Focus on the main points and key insights.
        
        Text to summarize:
        {document}
        """
        
        # Generate the summary
        response = model.generate_content(prompt)
        
        # Extract and return the summary
        summary = response.text.strip()
        
        return summary
    
    except Exception as e:
        raise Exception(f"Error generating summary: {str(e)}")

# Example usage:
"""
api_key = "your_gemini_api_key_here"
document = '''
Your long document text here...
'''

try:
    summary = summarize_document(document, api_key)
    print(summary)
except Exception as e:
    print(f"Error: {e}")
"""