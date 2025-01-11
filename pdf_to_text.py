import fitz  # PyMuPDF
from PIL import Image
import pytesseract

def pdf_to_text(pdf_path):
    """
    Extracts text from a PDF file by rendering pages to images and performing OCR.

    Args:
        pdf_path (str): Path to the PDF file.

    Returns:
        str: Extracted text from the PDF.
    """
    extracted_text = ""

    try:
        # Open the PDF file
        pdf_document = fitz.open(pdf_path)

        for page_number in range(len(pdf_document)):
            
            # Render the page to an image
            page = pdf_document.load_page(page_number)
            pix = page.get_pixmap()

            # Convert Pixmap to PIL Image
            image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Perform OCR on the image
            text = pytesseract.image_to_string(image,lang='nep')
            extracted_text += f"--- Page {page_number + 1} ---\n{text}\n"

        pdf_document.close()
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""

    return extracted_text

# Example usage:
