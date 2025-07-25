from pydantic import BaseModel

class EmotionPrediction(BaseModel):
    emotion: str
    confidence: float
    scores: dict

class Base64ImageRequest(BaseModel):
    image: str