import os
from app.database import db
from sentence_transformers import SentenceTransformer
from langchain.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings

# ✅ Embedding setup
embedding_model_name = "all-MiniLM-L6-v2"
embedding_function = HuggingFaceEmbeddings(model_name=embedding_model_name)

VECTOR_DB_DIR = os.path.join(os.getcwd(), "vector_db")

# ✅ Async function for building vector store
async def build_vector_store_from_appointment(appointment_id: str) -> bool:
    try:
        print(f"🚀 Starting vector store build for appointment: {appointment_id}", flush=True)

        # Step 1: Fetch consultation note from DB
        print("📥 Fetching consultation note from DB...", flush=True)
        doc = await db.consultation_notes.find_one({
            "appointment_id": appointment_id,
            "transcript": {"$exists": True}
        })

        print("🔍 Raw fetched document:", doc, flush=True)

        if not doc:
            print(f"❌ No document found for appointment_id={appointment_id}.", flush=True)
            return False

        transcript_data = doc.get("transcript")

        # ✅ Fix: transcript is a list, not a dict with 'segments'
        if not isinstance(transcript_data, list):
            print("❌ Transcript is not in expected list format.", flush=True)
            return False

        print(f"✅ Found {len(transcript_data)} transcript segments.", flush=True)

        # Step 2: Prepare texts and metadata
        texts = [seg.get("text", "") for seg in transcript_data]
        metadatas = [
            {
                "appointment_id": appointment_id,
                "start": seg.get("start", 0),
                "end": seg.get("end", 0)
            } for seg in transcript_data
        ]

        # Step 3: Load vector store and insert
        print(f"📦 Initializing Chroma at: {VECTOR_DB_DIR}", flush=True)
        vectorstore = Chroma(
            persist_directory=VECTOR_DB_DIR,
            embedding_function=embedding_function
        )

        print("➕ Adding documents to vector store...", flush=True)
        vectorstore.add_texts(texts=texts, metadatas=metadatas)

        vectorstore.persist()
        print(f"✅ Vector store persisted to: {VECTOR_DB_DIR}", flush=True)
        return True

    except Exception as e:
        print(f"❌ Exception during vector store build: {e}", flush=True)
        return False