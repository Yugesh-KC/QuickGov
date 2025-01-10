from googletrans import Translator

def translate_to_english_googletrans(nepali_text: str) -> str:
    """
    Translates Nepali text to English using the googletrans library.
    
    Args:
        nepali_text (str): The text in Nepali to translate.
    
    Returns:
        str: Translated text in English.
    """
    try:
        translator = Translator()
        # Translate text from Nepali (ne) to English (en)
        translation = translator.translate(nepali_text, src='ne', dest='en')
        return translation.text
    except Exception as e:
        return f"Error: {e}"

