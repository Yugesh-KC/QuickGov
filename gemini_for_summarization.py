import google.generativeai as genai
from typing import Tuple

def summarize_document(document: str, api_key: str, max_length: int = 100) -> Tuple[str, str]:
    """
    Generates a title and summary for a document using Google's Gemini API.
    
    Args:
        document (str): The text content to be summarized
        api_key (str): Your Google API key for Gemini
        max_length (int, optional): Maximum length of the summary in words. Defaults to 100.
    
    Returns:
        Tuple[str, str]: A tuple containing (title, summary) of the input document
        
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
        
        # Create the title prompt
        title_prompt = f"""Generate a concise, engaging title (maximum 10 words) for the following text.
        The title should capture the main theme or topic while mainly foncusing on what the public needs to know.
        
        Text:
        {document}
        """
        
        # Generate the title
        title_response = model.generate_content(title_prompt)
        title = title_response.text.strip()
        
        # Create the summary prompt
        summary_prompt = f"""Please provide a concise summary of the following text in no more than {max_length} words. 
        Focus on the main points and key insights.
        
        Text to summarize:
        {document}
        """
        
        # Generate the summary
        summary_response = model.generate_content(summary_prompt)
        summary = summary_response.text.strip()
        
        return (title, summary)
    
    except Exception as e:
        raise Exception(f"Error generating title and summary: {str(e)}")

# Example usage:
"""
api_key = "your_gemini_api_key_here"
document = '''
Your long document text here...
'''

try:
    title, summary = summarize_document(document, api_key)
    print(f"Title: {title}")
    print(f"\nSummary: {summary}")
except Exception as e:
    print(f"Error: {e}")
"""