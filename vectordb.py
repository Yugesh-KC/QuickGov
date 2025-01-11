
import os
from dotenv import load_dotenv
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from llama_index.embeddings.fastembed import FastEmbedEmbedding
from llama_index.llms.groq import Groq
from llama_index.core import Settings, VectorStoreIndex, StorageContext
from llama_index.vector_stores.qdrant import QdrantVectorStore
import qdrant_client

# Load environment variables from .env file
load_dotenv()

# Initialize FastEmbedEmbeddings model
embed_model = FastEmbedEmbeddings(model_name="BAAI/bge-base-en-v1.5")

from llama_parse import LlamaParse
llama_parse_api_key=os.environ["LLAMA_PARSE_API_KEY"]
llama_parse_documents = LlamaParse(api_key=llama_parse_api_key, result_type="markdown").load_data(["constitution.pdf","criminal.pdf", "citizenship.pdf"])
embed_model = FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")
groq_api_key = os.environ["GROQ_API_KEY"]
llm1 = Groq(model="Llama3-70b-8192", api_key=groq_api_key)

Settings.llm=llm1
Settings.embed_model=embed_model

# Initialize QdrantClient for vector store
client = qdrant_client.QdrantClient(
    url="https://03d2bc48-6599-4c28-8e7c-3d1847b504f8.us-west-2-0.aws.cloud.qdrant.io:6333", 
    api_key=os.getenv("QDRANT_API_KEY"),
)

# Initialize vector store and storage context
vector_store = QdrantVectorStore(client=client, collection_name="laws")
storage_context = StorageContext.from_defaults(vector_store=vector_store)

# Build index from documents
index = VectorStoreIndex.from_documents(documents=llama_parse_documents, storage_context=storage_context, show_progress=True)
