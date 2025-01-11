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
import os
from dotenv import load_dotenv
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
def add_to_history(chat_history, user_message, assistant_response):
    # Append user message and assistant response to history
    chat_history.append(f"User: {user_message}")
    chat_history.append(f"Assistant: {assistant_response}")
    
    # Truncate the history to keep it at a manageable length
    if len(chat_history) > MAX_HISTORY_LENGTH * 2:  # Each message adds 2 entries (User + Assistant)
        chat_history = chat_history[-MAX_HISTORY_LENGTH * 2:]  # Keep only the most recent MAX_HISTORY_LENGTH messages

    return chat_history



def check_context(text, user_query,chat_history):
  
    decision_prompt = PromptTemplate(
    template="""You are an assistant determining whether to retrieve additional context from a database. 
    Carefully analyze the user's question, press release text and the provided chat history to make your decision.

    Respond with:
    - "no" if the question can be answered fully and accurately using the information available in the press release text or the chat history. This includes situations where the user is asking for elaboration, clarification, or explanation of a point already mentioned.
    - "yes" if the  press release or the chat history does not contain sufficient information to accurately answer the user's question. This includes situations where the user's question introduces a new topic, requires factual knowledge not found in the chat history or the press release, or is unrelated to prior discussions.

    Ensure your decision is based only on the question, the provided press release and the  chat history.
    Press Release: {press_release}

    Question: {question}
    Chat History: {chat_history}
    Decision (yes or no):"""
)
    decision_chain = decision_prompt | llm | StrOutputParser()
    decision = decision_chain.invoke({"question": user_query, "chat_history": chat_history, "press_release": text}).strip().lower()
    # print(decision)
    
    return decision == "yes"


def bot(chat_history = []):
    text = get_text()
    # print(type(text))
    # print(text)
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            print("Goodbye!")
            break
        
        # Generate response based on the current user input
        response = llm_output(text,user_input, chat_history)
        
        # Update chat history
        chat_history = add_to_history(chat_history, user_input, response)
        
        # Print or log the chat history
        # print(chat_history)
        
    return chat_history


def llm_output(text, user_query, chat_history):
    decision_to_rag = check_context(text, user_query, chat_history)

    if decision_to_rag:
        generation = iterative_retrieval_and_answer(user_query, chat_history)
        print(f"Assistant: {generation}")
        # Retrieve context from the vector database
        return generation
    else:
        generation_prompt = PromptTemplate(
        template="""You are an assistant designed to answer questions based on previous interactions with the user.
        Use the provided chat history and the press release to understand the context and provide a relevant response. 
        If the chat history or the press release alone doesn’t provide enough information to answer the question accurately, 
        state that you don't know the answer rather than guessing or inventing information. Give a concise answer.
        Press Release:
        {text}

        Chat History:
        {chat_history}

        User's Question:
        {user_query}

        Answer:"""
        )
        rag_chain = generation_prompt | llm | StrOutputParser()
        generation = rag_chain.invoke({"text":text, "user_query": user_query, "chat_history": chat_history})
        print(f"Assistant: {generation}") 
      
        return generation
    
def get_text():
    release = input("Enter the release about which you want to ask: ")

    # Step 2: Create the full path
    base_path = "scraped_images/moha"
    file_name = f"release_{release}.jpg"  # Constructing the filename based on user input
    file_path = os.path.join(base_path, file_name)

    # Step 3: Check if the file exists
    if os.path.exists(file_path):
        print(f"Accessing the file: {file_path}")
        # You can now proceed to use the file (e.g., display, read, or process it)
    else:
        print("File not found. Please check the release name and try again.")

    text = image_to_english(file_path,gemini_api_key)
    return text



if __name__ == "__main__":
   
    
    load_dotenv()
    MAX_HISTORY_LENGTH = 4
    gemini_api_key = os.getenv("GEMINI_API_KEY")
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
    bot()

    