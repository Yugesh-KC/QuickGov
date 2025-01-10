from PIL import Image
import pytesseract

def ocr_from_image(image_path):
    img = Image.open(image_path)
    
    # Perform OCR on the image using the Nepali language
    text = pytesseract.image_to_string(img, lang='nep')
    
    return text

# Example usage
image_path = 'image.png'
extracted_text = ocr_from_image(image_path)
print(extracted_text)