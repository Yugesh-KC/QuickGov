from document_to_english import document_to_english


from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
from gemini_for_summarization import summarize_document
import os

app = FastAPI()

@app.post("/image-to-summary/")
async def document_to_summary(
    file_name: str = Form(...),
    api_key: str = Form(...),
    max_length_of_words: int = Form(...)
):
    print(f"Received file name: {file_name}")
    
    # Check if the file exists
    if not os.path.exists(file_name):
        return JSONResponse(content={"error": "File not found", "file_name": file_name}, status_code=404)
    
 

    document_in_english_text = document_to_english(file_name,api_key)
    title,summarized_document = summarize_document(document_in_english_text,api_key,max_length_of_words)

    # Return the result as JSON
    return JSONResponse(content={"title": title, "summary": summarized_document})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8989)


