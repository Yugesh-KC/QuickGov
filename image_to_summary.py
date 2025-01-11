from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
from image_to_english import image_to_english
from gemini_for_summarization import summarize_document
import os

app = FastAPI()

@app.post("/image-to-summary/")
async def image_to_summary(
    file_name: str = Form(...),
    api_key: str = Form(...),
    max_length_of_words: int = Form(...)
):
    if not os.path.exists(file_name):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    
    image_in_english_text = image_to_english(file_name, api_key)
    title, summarized_document = summarize_document(image_in_english_text, api_key, max_length_of_words)

    return JSONResponse(content={"title": title, "summary": summarized_document})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8989)
