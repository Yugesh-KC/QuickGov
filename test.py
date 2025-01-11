import qdrant_client

import os

# Initialize QdrantClient for vector store
client = qdrant_client.QdrantClient(
    "https://b28f151a-b950-461a-92ba-8094252908b9.us-east4-0.gcp.cloud.qdrant.io",
    api_key=os.getenv("QDRANT_API_KEY")
)