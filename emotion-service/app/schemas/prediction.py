from pydantic import BaseModel

class EmotionPrediction(BaseModel):
    emotion: str
    confidence: float
    scores: dict
