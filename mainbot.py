
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
    template="""You are a specialized assistant that creates thoughtful variations of questions while maintaining their core meaning.

    Guidelines for Question Generation:
    1. Create exactly 5 variations focusing on:
    - Using synonyms for key terms
    - Rephrasing the question structure
    - Maintaining the original intent
    - Keeping language clear and accessible

    2. Variation Strategies:
    - Rephrase as "what", "how", "when", "where" questions where appropriate
    - Convert between active and passive voice
    - Add or remove relevant context while keeping core meaning
    - Use different but equivalent terms

    3. Ensure Each Variation:
    - Remains faithful to the original question's intent
    - Uses clear, straightforward language
    - Could be answered with the same information
    - Is grammatically complete and standalone

    4. For Legal/Document Context:
    - Make 2-3 variations specifically searchable in legal documents
    - Include 2-3 variations suited for press releases
    - Keep remaining variations general but relevant

    Original Question: {question}

    Generate variations that maintain the core meaning. Each should be clear enough to stand alone:
    The questions should be of the format:
    The original question followed by exactly 5 numbered variations: 
    ### **Output Format**:  
 
1. 
2. 
3. """
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
    disallowed_phrases = [
    "i don’t know", "i don't know", 
    "cannot provide an answer", 
    "does not mention", "does not contain"
]
    retrieved_gen = []

    for idx, query in enumerate(related_questions):
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
            print("===========RETRIEVED INFO====================")
            
               # For debuggino =
            recently_retrieved_info =docs 
            print(recently_retrieved_info)
            return recently_retrieved_info, generation  

        # Log progress (optional)
        # print(f"Attempt {idx + 1}: No satisfactory answer found.")

        # Stop after 5 attempts
        retrieved_gen.append(generation)
        if idx == 6:
            break
    
    return "" , "Sorry, the context cannot provide a satisfactory answer to your query."

def decide_context_usage(question, chat_history, recently_retrieved_info):
    print("Retrieved info:", recently_retrieved_info)
    """
    Ask the LLM if additional context from the vector database is needed for the given question.
    """
    decision_prompt = PromptTemplate(
    template="""You are an assistant determining if additional context retrieval is needed from a database.

    Assessment Guidelines:

    1. Check if the question is related to Nepal's law, constitution, legal matters, or related to the chat history or about different incidents or news.
   - If unrelated, respond: "Decision: no, Expanded Question: I cannot answer questions unrelated to Nepal's law or legal matters."  

    2. Check if the answer exists in either:
    - The provided chat history
    - The recently retrieved information

    Response Rules:
    - Return "no" ONLY if you find the complete answer in the existing information
    - Return "yes" if:
    - The answer is not found in existing information
    - The question introduces new topics
    - Additional factual information is needed
    - You're unsure if the available information is sufficient

    Question Processing:
    If decision is "yes", handle the question in one of these ways:
     Expand the question only if  it is unclear or incomplete and is absolutely necessary like if it is in the forms like"elaborate," "what is this?", etc. If the question is complete in itself donot try to expand.DO NOT tie unrelated questions to the context provided.
    1. For clear, specific questions:
    - Use the original question as-is
    - Example: "What is the capital of Nepal?"

    3. For context-dependent questions:
    -
    - Expand ONLY if the question is incomplete (e.g., "elaborate", "tell me more", "what about that?")
    - Use chat history and retrieved info to create a complete question
    - Example: 
        Original: "tell me more"
        Expanded: "tell me more about [sth related to the previous convo]"
    - Do this unless absoultely necessary.

    Input Information:
    ---
    Recent Retrieved Info: {recently_retrieved_info}
    Question: {question}
    Chat History: {chat_history}
    ---

    Output Format:
    Decision: [yes/no]
    Expanded Question: [original question OR expanded version if needed]"""
)
    decision_chain = decision_prompt | llm | StrOutputParser()
    response = decision_chain.invoke({"question": question, "chat_history": chat_history, "recently_retrieved_info": recently_retrieved_info}).strip()
    print(response)

    lines = response.split("\n")
    decision = None
    expanded_question = None

    for line in lines:
        if line.startswith("Decision:"):
            decision = line.replace("Decision:", "").strip().lower()
        elif line.startswith("Expanded Question:"):
            expanded_question = line.replace("Expanded Question:", "").strip()


    print(decision)
    
    return decision == "yes", expanded_question


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

def output_llm(question, chat_history=[], recently_retrieved_info = ""):
    retrieved_gen = []
    """
    Processes the question, retrieving context if the LLM decides it's necessary.
    """
    # Ask the LLM whether context retrieval is needed
    use_context, expanded_question = decide_context_usage(question, chat_history,recently_retrieved_info)

    if use_context and expanded_question:
        recently_retrieved_info , generation = iterative_retrieval_and_answer(expanded_question, chat_history)
        print(f"Assistant: {generation}")
        # Retrieve context from the vector database
        return recently_retrieved_info, generation
    
    if expanded_question.startswith("I cannot answer"):
        generation = expanded_question
    else:
        # Use chat history as context
        docs = [f"Chat History: {chat_history}"]
        # context_source = "Chat History"
        
    # Generation prompt template
        generation_prompt = PromptTemplate(
        template="""You are an assistant designed to answer questions based on previous interactions with the user and the retrieved info
        Use the provided chat history and the previous retrieved info to understand the context and provide a relevant response. 
        If the chat history  or the recently retrieved response alone doesn’t provide enough information to answer the question accurately, 
        state that you don't know the answer rather than guessing or inventing information.

        Chat History:
        {context}
        Recently Retrieved Info:
        {recently_retrieved_info}

        User's Question:
        {question}

        Answer:"""
    )

        rag_chain = generation_prompt | llm | StrOutputParser()
        generation = rag_chain.invoke({"context": docs, "question": question, "recently_retrieved_info":recently_retrieved_info})
        print(f"Assistant: {generation}") 
      
    return recently_retrieved_info, generation


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
    all_history = []
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

