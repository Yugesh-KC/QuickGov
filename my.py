from image_to_english import image_to_english
import os
from dotenv import load_dotenv

load_dotenv()

def images_to_text():
    images = os.listdir("scraped_images\moha")
    image_dir = "scraped_images\moha"
    api_key = os.getenv("GEMINI_API_KEY")
    
    # Open a file in write mode to store the extracted text
    with open("extracted_texts.txt", "w", encoding='utf-8') as file:
        for image in images:
            image_path = os.path.join(image_dir, image)  # Construct full path
            text = "" + image_to_english(image_path, api_key)  # Pass the path to the image
            file.write(text + '\n')  # Write each extracted text into the file, adding a newline
            print("extraction for image done", image )
        
    print("Text extraction and storage complete!")

# Call the function
images_to_text()
