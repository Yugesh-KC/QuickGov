import os
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_groq import ChatGroq
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.llms.groq import Groq
from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore
import qdrant_client

from image_to_english import image_to_english
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


def generate_related_questions(question):
    """
    Generate related questions from the user's query using the LLM.
    """
   
    related_questions_prompt = PromptTemplate(
        template="""You are an assistant that generates rephrasings and similar variations of the user's question.
        Create 5 variations of the question that use synonyms, alternate phrasing, or very slight expansions. Use synonyms for the keywords too.
        The questions should remain closely related in context and meaning. Avoid introducing unrelated or different topics.Phrase the question in such a way that its answer can be found in different legal documents in Nepal.

        Original Question: {question}
        Similar Questions (one per line):
        1."""
    )

    
    related_questions_chain = related_questions_prompt | llm | StrOutputParser()

    related_questions = related_questions_chain.invoke({"question": question}).strip().split("\n")
  
    # print(related_questions)
    # Filter out unwanted lines
    clean_questions = []
    for line in related_questions:
        line = line.strip()
        # Include only lines that start with a question number or plausible question text
        if line and (line[0].isdigit() or line.startswith("What") or line.startswith("How") or line.startswith("Who")):
            clean_questions.append(line.lstrip("12345. ").strip())  # Remove numbering and extra spaces
    # print(clean_questions)
    
    print(clean_questions)
    return clean_questions

def iterative_retrieval_and_answer(question, chat_history=[]):
    """
    Retrieves context iteratively using related questions and checks if the answer is in the retrieved data.
    """
    # Generate related questions
    related_questions = generate_related_questions(question)
    related_questions.insert(0, question)  # Include the original question as the first query
    print(related_questions)
    disallowed_phrases = [
    "i don’t know", "i don't know", 
    "cannot provide an answer", 
    "does not mention", "does not contain"
]

    for idx, query in enumerate(related_questions):
        print(query)
        if query == None:
            query = ""

        # Retrieve context for the current query
        docs = retriever.retrieve(query+  " infer any info that you can get related to this query")
        
        
        docs= "\n".join([d.text for d in docs])  # Combine document texts
        print("For one DOc---------------------")
        print(docs)



        # Use the retrieved context to attempt generating an answer
        generation_prompt = PromptTemplate(
            template="""You are an assistant answering questions using provided context. 
            Based on the retrieved context below, generate a concise answer to the user's query. If you cannot find the answer  in the retrieved context or if the context doesnot contain the answer, just say that you don't know the answer.Don't invent an answer.Donot say the context doesnot provide the answer. Simply say, you don't know.
            
            Retrieved Context: {context}
            User's Query: {question}
            Answer:"""
        )
        generation_chain = generation_prompt | llm | StrOutputParser()
        generation = generation_chain.invoke({"context": docs, "question": question}).strip()
        print(query)
        print(generation)

        # Check if the answer is satisfactory
        if not any(phrase in generation.lower() for phrase in disallowed_phrases):
            recently_retrieved_info =docs 
            print(recently_retrieved_info)
               # For debugging
            return recently_retrieved_info, generation  

        # Log progress (optional)
        # print(f"Attempt {idx + 1}: No satisfactory answer found.")

        # Stop after 5 attempts
        if idx == 9:
            break

    return "", "Sorry, the context cannot provide a satisfactory answer to your query."
def add_to_history(chat_history, user_message, assistant_response):
    # Append user message and assistant response to history
    chat_history.append(f"User: {user_message}")
    chat_history.append(f"Assistant: {assistant_response}")

    all_history.append(f"User: {user_message}")
    all_history.append(f"Assistant: {assistant_response}")

    
    # Truncate the history to keep it at a manageable length
    if len(chat_history) > MAX_HISTORY_LENGTH * 2:  # Each message adds 2 entries (User + Assistant)
        chat_history = chat_history[-MAX_HISTORY_LENGTH * 2:]  # Keep only the most recent MAX_HISTORY_LENGTH messages

    return chat_history



def check_context(text, user_query,chat_history, recently_retrieved_info):
    print("Retrieved info:", recently_retrieved_info)
    print(text)
   
    decision_prompt = PromptTemplate(
    template="""You are an assistant determining whether to retrieve additional context from a database. 
    Carefully analyze the user's question, press release text, recently retrieved info and the provided chat history to make your decision.
    Respond with:
    - "no" if the question is related to the notice/press release, eg:the dates of the release who released it, etc or  the question can be answered using the information available in the press release text or the chat history or retireved context. This includes situations where the user is asking for elaboration, clarification, or explanation of a point already mentioned.
    - "yes" if the  press release or the chat history does not contain sufficient information to accurately answer the user's question. This includes situations where the user's question introduces a new topic, requires factual knowledge not found in the chat history or the press release, or recently retireved info or is unrelated to prior discussions.
    Ensure your decision is based only on the question, the provided press release and the  chat history.
    Give the original question too.
   
    Press Release: {press_release}
    Question: {question}
    Chat History: {chat_history}
    Recently Retrieved Info : {recently_retrieved_info}
    Decision (yes or no):
    Question: [original question]"""
    
)




    decision_chain = decision_prompt | llm | StrOutputParser()
    response = decision_chain.invoke({"question": user_query, "chat_history": chat_history, "recently_retrieved_info": recently_retrieved_info, "press_release":text}).strip()
    print(response)

    lines = response.split("\n")
    decision = None
    expanded_question = None

    for line in lines:
        if line.startswith("Decision:"):
            decision = line.replace("Decision:", "").strip().lower()
        elif line.startswith("Question:"):
            expanded_question = line.replace("Question:", "").strip()


    print(decision)
    
    
    return decision == "yes", expanded_question

@app.route('/chat', methods=['POST'])
def bot(chat_history = []):
    # print(type(text))
    # print(text)
    recently_retrieved_info = ""
    user_input = request.json.get('message')
    image_path = request.json.get('image') 
    text = get_text(image_path, gemini_api_key) 
        # user_input = input("You: ")
    if user_input.lower() == "exit":
        return jsonify({"response": "Goodbye!"}), 200
        
        # Generate response based on the current user input
    recently_retrieved_info, response = llm_output(text,user_input, chat_history, recently_retrieved_info)
        
        # Update chat history
    chat_history = add_to_history(chat_history, user_input, response)
    return jsonify({"response": response}), 200


        
        # Generate response based on the current user input

        
        # Print or log the chat history
        # print(chat_history)
 


def llm_output(text, user_query, chat_history = [], recently_retrieved_info = ""):
    decision_to_rag, expanded_query = check_context(text, user_query, chat_history, recently_retrieved_info)
    
    if decision_to_rag:
        recently_retrieved_info,generation = iterative_retrieval_and_answer(expanded_query, chat_history)
        print(f"Assistant: {generation}")
        # Retrieve context from the vector database
        return recently_retrieved_info, generation
    
  
        
    else:
            generation_prompt = PromptTemplate(
            template="""You are an assistant designed to answer questions based on previous interactions with the user.
            Use the provided chat history, the recently retrieved info and the press release to understand the context and provide a relevant response. 
            If the chat history or the press release or the recently retrieved info alone doesn’t provide enough information to answer the question accurately, 
            state that you don't know the answer rather than guessing or inventing information. Give a concise answer.
            Press Release:
            {text}

            Chat History:
            {chat_history}

            Recently Retrieved Info:
            {recently_retrieved_info}

            User's Question:
            {user_query}

            Answer:"""
            )
            rag_chain = generation_prompt | llm | StrOutputParser()
            generation = rag_chain.invoke({"text":text, "user_query": user_query, "chat_history": chat_history, "recently_retrieved_info": recently_retrieved_info})
            print(f"Assistant: {generation}") 
      
            return recently_retrieved_info, generation
    
def get_text(image_path, gemini_api_key):
    try:
        # Ensure the image path exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        # Extract text using the image_to_english function
        text = image_to_english(image_path, gemini_api_key)
        
        # Return the extracted text or a placeholder if none is extracted
        return text if text else "No text found in the image."

    except Exception as e:
        # Handle exceptions gracefully and provide feedback
        print(f"An error occurred while processing the image: {e}")
        return ""





if __name__ == "__main__":
   
    
    load_dotenv()
    MAX_HISTORY_LENGTH = 4
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    chat_history = []
    all_history =[]
    embed_model = FastEmbedEmbedding(model_name="BAAI/bge-base-en-v1.5")
    groq_api_key = os.environ["GROQ_API_KEY"]
    llm1 = Groq(model="Llama3-70b-8192", api_key=groq_api_key)
    Settings.llm = llm1
    Settings.embed_model = embed_model
    # Initialize QdrantClient for vector store
    client = qdrant_client.QdrantClient(
        url="https://03d2bc48-6599-4c28-8e7c-3d1847b504f8.us-west-2-0.aws.cloud.qdrant.io:6333", 
        api_key=os.getenv("QDRANT_API_KEY"),
    )
    # Initialize vector store and storage context
    vector_store = QdrantVectorStore(client=client, collection_name="chunk_collection")
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    # Build index from documents
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)
    retriever = index.as_retriever(search_kwargs={"k": 5})
    # Initialize ChatGroq for question answering
    llm = ChatGroq(
        temperature=0,
        model="Llama3-70b-8192",
        api_key=os.getenv("GROQ_API_KEY")
    )
    app.run(debug=True)
