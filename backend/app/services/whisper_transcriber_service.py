# backend/app/services/whisper_transcriber.py

#import whisper
from typing import Dict, Any, List

# Load the Whisper model once globally
#model = whisper.load_model("base")  # You can also use "small", "medium", or "large"


def merge_segments_by_token_limit(segments, max_tokens=300) -> List[Dict[str, Any]]:
    merged_chunks = []
    current_chunk = {"start": None, "end": None, "text": "", "token_count": 0}

    for seg in segments:
        token_len = len(seg.get("tokens", []))
        if current_chunk["token_count"] + token_len <= max_tokens:
            if current_chunk["start"] is None:
                current_chunk["start"] = seg["start"]
            current_chunk["end"] = seg["end"]
            current_chunk["text"] += " " + seg["text"]
            current_chunk["token_count"] += token_len
        else:
            # Finalize current chunk
            merged_chunks.append({
                "start": current_chunk["start"],
                "end": current_chunk["end"],
                "text": current_chunk["text"].strip()
            })
            # Start new chunk
            current_chunk = {
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"],
                "token_count": token_len
            }

    if current_chunk["text"]:
        merged_chunks.append({
            "start": current_chunk["start"],
            "end": current_chunk["end"],
            "text": current_chunk["text"].strip()
        })

    return merged_chunks