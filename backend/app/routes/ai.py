import json
import os
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()


class ChatMessage(BaseModel):
    role: Literal["assistant", "user"]
    text: str = Field(min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=20)


@router.post("/chat")
def chat(request: ChatRequest):
    """Proxy Gemini requests so the browser never receives the API key."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="Gemini is not configured. Set GEMINI_API_KEY in backend/.env.")

    contents = [{"role": "model" if message.role == "assistant" else "user", "parts": [{"text": message.text}]} for message in request.messages]
    payload = {
        "systemInstruction": {"parts": [{"text": "You are Compass, the concise and helpful AI travel assistant for TravelConnect. Help plan trips, suggest itineraries, budget ideas, and local experiences. Clearly distinguish suggestions from confirmed live information."}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 700},
    }
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    http_request = Request(endpoint, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json", "x-goog-api-key": api_key}, method="POST")
    try:
        with urlopen(http_request, timeout=25) as response:
            data = json.loads(response.read().decode("utf-8"))
        return {"reply": data["candidates"][0]["content"]["parts"][0]["text"]}
    except HTTPError as error:
        raise HTTPException(status_code=502, detail="Gemini could not answer right now.") from error
    except (URLError, KeyError, IndexError, json.JSONDecodeError) as error:
        raise HTTPException(status_code=502, detail="Could not reach Gemini. Please try again.") from error
