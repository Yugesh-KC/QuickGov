from ocr import ocr_from_image
from translate import translate_to_english

def image_to_english(image_path,api_key):
    nepali_text=ocr_from_image(image_path)
    english_text=translate_to_english(nepali_text,api_key)
    return english_text


    