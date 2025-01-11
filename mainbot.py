
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
        Create 15 variations of the question that use synonyms, alternate phrasing, or very slight expansions. Use synonyms for the keywords too.
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
    
    # print(clean_questions)
    return clean_questions



def iterative_retrieval_and_answer(question, chat_history=[]):
    """
    Retrieves context iteratively using related questions and checks if the answer is in the retrieved data.
    """
    # Generate related questions
    related_questions = generate_related_questions(question)
    related_questions.insert(0, question)  # Include the original question as the first query
    disallowed_phrases = [
    "i don’t know", "i don't know", 
    "cannot provide an answer", 
    "does not mention", "does not contain"
]

    for idx, query in enumerate(related_questions):
        # Retrieve context for the current query
        docs = retriever.retrieve(query+  " infer any info that you can get related to this query")
        
        
        docs= "\n".join([d.text for d in docs])  # Combine document texts
        # print("For one DOc---------------------")
        # print(docs)



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
        # print(query)
        # print(generation)

        # Check if the answer is satisfactory
        if not any(phrase in generation.lower() for phrase in disallowed_phrases):
               # For debugging
            return generation  

        # Log progress (optional)
        # print(f"Attempt {idx + 1}: No satisfactory answer found.")

        # Stop after 5 attempts
        if idx == 16:
            break

    return "The context cannot provide a satisfactory answer to the query."

def decide_context_usage(question, chat_history):
    """
    Ask the LLM if additional context from the vector database is needed for the given question.
    """
    decision_prompt = PromptTemplate(
    template="""You are an assistant determining whether to retrieve additional context from a database. 
    Carefully analyze the user's question and the provided chat history to make your decision.

    Respond with:
    - "no" if the question can be answered fully and accurately using the information available in the chat history. This includes situations where the user is asking for elaboration, clarification, or explanation of a point already mentioned.
    - "yes" if the chat history does not contain sufficient information to accurately answer the user's question. This includes situations where the user's question introduces a new topic, requires factual knowledge not found in the chat history, or is unrelated to prior discussions.

    Ensure your decision is based only on the question and the provided chat history.

    Question: {question}
    Chat History: {chat_history}
    Decision (yes or no):"""
)
    decision_chain = decision_prompt | llm | StrOutputParser()
    decision = decision_chain.invoke({"question": question, "chat_history": chat_history}).strip().lower()
    # print(decision)
    
    return decision == "yes"


def add_to_history(chat_history, user_message, assistant_response):
    # Append user message and assistant response to history
    chat_history.append(f"User: {user_message}")
    chat_history.append(f"Assistant: {assistant_response}")
    
    # Truncate the history to keep it at a manageable length
    if len(chat_history) > MAX_HISTORY_LENGTH * 2:  # Each message adds 2 entries (User + Assistant)
        chat_history = chat_history[-MAX_HISTORY_LENGTH * 2:]  # Keep only the most recent MAX_HISTORY_LENGTH messages

    return chat_history

def output_llm(question, chat_history=[]):
    """
    Processes the question, retrieving context if the LLM decides it's necessary.
    """
    # Ask the LLM whether context retrieval is needed
    use_context = decide_context_usage(question, chat_history)

    if use_context:
        generation = iterative_retrieval_and_answer(question, chat_history)
        print(f"Assistant: {generation}")
        # Retrieve context from the vector database
        return generation
    else:
        # Use chat history as context
        docs = [f"Chat History: {chat_history}"]
        # context_source = "Chat History"
        

    # Generation prompt template
        generation_prompt = PromptTemplate(
        template="""You are an assistant designed to answer questions based on previous interactions with the user.
        Use the provided chat history to understand the context and provide a relevant response. 
        If the chat history alone doesn’t provide enough information to answer the question accurately, 
        state that you don't know the answer rather than guessing or inventing information.

        Chat History:
        {context}

        User's Question:
        {question}

        Answer:"""
    )

        rag_chain = generation_prompt | llm | StrOutputParser()
        generation = rag_chain.invoke({"context": docs, "question": question})
        print(f"Assistant: {generation}") 
      
        return generation


@app.route('/chat', methods=['POST'])
def chatbot(chat_history = []):
    user_input = request.json.get('message')  # Get the message from the request
        # user_input = input("You: ")
    if user_input.lower() == "exit":
        return jsonify({"response": "Goodbye!"}), 200
        
        # Generate response based on the current user input
    response = output_llm(user_input, chat_history)
        
        # Update chat history
    chat_history = add_to_history(chat_history, user_input, response)  
    return jsonify({"response": response}), 200

# Main logic remains the same
if __name__ == "__main__":
    MAX_HISTORY_LENGTH = 4
    load_dotenv()
    chat_history = []
    embed_model = FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")
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
    vector_store = QdrantVectorStore(client=client, collection_name="newcollection")
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

