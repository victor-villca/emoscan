from fastapi import APIRouter, File, UploadFile
from app.models.model_loader import EmotionModelLoader
from app.schemas.prediction import EmotionPrediction, Base64ImageRequest
from PIL import Image
import numpy as np
import io
import base64
import re

router = APIRouter()
model_loader = EmotionModelLoader("models/best_emotion_model.keras", "models/class_labels.pkl")

def decode_base64_image(base64_string: str) -> Image.Image:
    try:
        base64_data = re.sub("^data:image/.+;base64,", "", base64_string)
        image_data = base64.b64decode(base64_data)
        image = Image.open(io.BytesIO(image_data)).convert("L")
        return image
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image")

@router.post("/model")
async def predict_from_base64(payload: Base64ImageRequest):
    image = decode_base64_image(payload.image)
    image = image.resize((48, 48))
    image_array = np.array(image) / 255.0
    image_array = image_array.reshape(1, 48, 48, 1)

    emotion, confidence, scores = model_loader.predict(image_array)

    return {
        "primary_emotion": emotion,
        "primary_confidence": confidence,
        "confidences": scores
    }

@router.post("/predict", response_model=EmotionPrediction)
async def predict_emotion(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("L")
    image = image.resize((48, 48))
    image_array = np.array(image) / 255.0
    image_array = image_array.reshape(1, 48, 48, 1)

    print("Input shape:", image_array.shape)

    emotion, confidence, scores = model_loader.predict(image_array)

    return EmotionPrediction(
        emotion=emotion,
        confidence=confidence,
        scores=scores
    )
