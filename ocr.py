from PIL import Image
import pytesseract

# Set the path to your Tesseract executable (if not in your PATH)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows example

def ocr_from_image(image_path):
    # Open the image file
    img = Image.open(image_path)
    
    # Perform OCR on the image using the Nepali language
    text = pytesseract.image_to_string(img, lang='nep')
    
    return text

# Example usage
image_path = 'image.png'
extracted_text = ocr_from_image(image_path)
print(extracted_text)
