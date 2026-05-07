from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import Ollama

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHROMA_PATH = "chroma_db"

# Embedding model
embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# Load vector DB
vectordb = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embedding_model
)

# Ollama model
llm = Ollama(model="mistral")

class ChatRequest(BaseModel):
    question: str

@app.post("/api/chat")
def chat(req: ChatRequest):

    try:

        # Retrieve relevant chunks
        docs = vectordb.similarity_search(
            req.question,
            k=2
        )

        # Create context
        context = "\n\n".join([
            doc.page_content for doc in docs
        ])

        # Source documents
        sources = list(set([
            doc.metadata.get("source", "Unknown")
            for doc in docs
        ]))

        # Prompt
        prompt = f"""
You are an internal company policy assistant.

Answer ONLY using the provided context.

If the answer is not found, say:
"I don't have that information in the company documents."

Context:
{context}

Question:
{req.question}
"""

        # Generate answer
        answer = llm.invoke(prompt)

        return {
            "answer": answer,
            "sources": sources
        }

    except Exception as e:

        return {
            "error": str(e)
        }