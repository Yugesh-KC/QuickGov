import qdrant_client
import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

load_dotenv()


client = QdrantClient(
    url="https://03d2bc48-6599-4c28-8e7c-3d1847b504f8.us-west-2-0.aws.cloud.qdrant.io:6333", 
    api_key=os.getenv("QDRANT_API_KEY"),
)

client.create_collection(
    collection_name="laws",
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
)
