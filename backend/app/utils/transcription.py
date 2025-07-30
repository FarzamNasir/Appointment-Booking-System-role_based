# backend/app/utils/transcription.py


from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
import os


async def transcribe_audio_from_gridfs(db, file_id_str):
    fs = AsyncIOMotorGridFSBucket(db)
    file_id = ObjectId(file_id_str)
    grid_out = await fs.open_download_stream(file_id)
    contents = await grid_out.read()

    # Save to a temporary file (Whisper requires a file path)
    temp_path = "temp_audio.mp3"
    with open(temp_path, "wb") as f:
        f.write(contents)

    import whisper
    model = whisper.load_model("base")
    result = model.transcribe("temp_audio.mp3")
    print("Transcription")
    try:
        os.remove(temp_path)
    except OSError:
        pass

    return result
