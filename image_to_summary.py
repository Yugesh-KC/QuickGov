from image_to_english import image_to_english
from gemini_for_summarization import summarize_document

def image_to_summary(image_path,api_key,max_length_of_words):
    image_in_english_text = image_to_english(image_path,api_key)
    title,summarized_document = summarize_document(image_in_english_text,api_key,max_length_of_words)
    return title,summarized_document



