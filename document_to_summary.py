from document_to_english import document_to_english
from gemini_for_summarization import summarize_document

def document_to_summary(image_path,api_key,max_length_of_words):
    
    document_in_english_text = document_to_english(image_path,api_key)
    title,summarized_document = summarize_document(document_in_english_text,api_key,max_length_of_words)
    return title,summarized_document



