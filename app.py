from flask import Flask, request, jsonify
from mainbot import output_llm, add_to_history  # Import your chatbot functions
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()  # Load environment variables

# Initialize chat history globally
chat_history = []

@app.route('/chat', methods=['POST'])
def chat():
    global chat_history
    user_input = request.json.get('message')  # Get the message from the request
    
    if user_input.lower() == "exit":
        return jsonify({"response": "Goodbye!"}), 200
    
    # Generate response using the existing chatbot logic
    response = output_llm(user_input, chat_history)
    
    # Update chat history
    chat_history = add_to_history(chat_history, user_input, response)
    
    return jsonify({"response": response}), 200

if __name__ == '__main__':
    app.run(debug=True)
