import os
from dotenv import load_dotenv
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from openai import OpenAI

# ==== Load environment variables ====
load_dotenv()
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

# ==== Initialize embedding function ====
embedding_function = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# ==== Load Chroma Vector Store ====
VECTOR_DB_DIR = os.path.abspath("vector_db")
vectorstore = Chroma(
    persist_directory=VECTOR_DB_DIR,
    embedding_function=embedding_function
)

# ==== Azure OpenAI Client Setup ====
client = OpenAI(
    api_key=AZURE_API_KEY,
    base_url=AZURE_ENDPOINT,
    default_query={"api-version": "preview"},
)


# ==== Vector Store Retrieval Function ====
def retrieve_relevant_chunks(query: str, appointment_id: str, top_k: int = 3) -> list[str]:
    results = vectorstore.similarity_search(
        query,
        k=top_k,
        filter={"appointment_id": appointment_id}
    )
    return [doc.page_content for doc in results]


# ==== Summarize Key Points Function ====
def summarize_key_points(docs: list[str], max_chunks: int = 5) -> str:
    context = "\n\n".join(docs[:max_chunks])

    prompt = f"""
You are a professional assistant summarizing a medical consultation between a doctor and a patient.

Extract and organize the *key points* under the following headings:
- Symptoms
- Duration
- Triggers or Causes
- Emotional or Psychological Responses
- Doctor's Observations or Conclusions (if available)

Be concise and factual. Use bullet points under each heading. Do not include any extra explanation. Do not invent information.

Start the response with:  
*Here are the key points from the appointment:*  

Then list the extracted points under each section accordingly.

Transcript:
{context}
""".strip()

    response = client.chat.completions.create(
        model="gpt-4o-mini-01",
        messages=[
            {
                "role": "system",
                "content": "You are a professional assistant trained to summarize doctor-patient consultations into clearly grouped bullet points under proper medical categories."
            },
            {"role": "user", "content": prompt}
        ]
    )

    summary = response.choices[0].message.content.strip()
    return summary
