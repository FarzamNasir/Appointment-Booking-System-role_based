# backend/app/routes/audio_routes.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from app.services.audio_storage_service import save_audio_to_gridfs, get_audio_from_gridfs
import io

router = APIRouter(prefix="/audio", tags=["Audio"])


@router.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    if not file.filename.endswith((".mp3", ".wav", ".m4a", ".ogg")):
        raise HTTPException(status_code=400, detail="Invalid audio format")

    contents = await file.read()
    file_id = save_audio_to_gridfs(contents, file.filename)
    return {"file_id": file_id}


@router.get("/stream/{file_id}")
async def stream_audio(file_id: str):
    try:
        audio_bytes = get_audio_from_gridfs(file_id)
        return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
    except Exception:
        raise HTTPException(status_code=404, detail="Audio not found")
