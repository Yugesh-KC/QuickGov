from ocr import ocr_from_image
from translate import translate_to_english
from pdf_to_text import pdf_to_text

import os

def document_to_english(document_path, api_key):
    """
    Converts a document (image or PDF) to English by performing OCR on the document and then translating it.

    Args:
        document_path (str): Path to the document (PDF or image).
        api_key (str): API key for the translation service.

    Returns:
        str: The translated text in English.
    """

    # Check if the file is a PDF or an image
    _, file_extension = os.path.splitext(document_path)
    
    if file_extension.lower() == '.pdf':
        # If it's a PDF, process it with OCR (assuming ocr_from_image works with PDFs too)
        nepali_text = pdf_to_text(document_path)
    else:
        # Otherwise, process as an image file
        nepali_text = ocr_from_image(document_path)
    
    # Translate the extracted Nepali text to English
    english_text = translate_to_english(nepali_text, api_key)

    return english_text



