from PIL import Image
import pytesseract

def ocr_from_image(image_path):
    img = Image.open(image_path)
    
    # Perform OCR on the image using the Nepali language
    text = pytesseract.image_to_string(img, lang='nep')
    
    return text

