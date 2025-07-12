from fastapi import APIRouter, File, UploadFile
from app.models.model_loader import EmotionModelLoader
from app.schemas.prediction import EmotionPrediction
from PIL import Image
import numpy as np
import io

router = APIRouter()
model_loader = EmotionModelLoader("models/best_emotion_model.keras", "models/class_labels.pkl")

@router.post("/predict", response_model=EmotionPrediction)
async def predict_emotion(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("L")
    image = image.resize((48, 48))
    image_array = np.array(image) / 255.0
    image_array = image_array.reshape(1, 48, 48, 1)  # ✔️ Correct input shape

    print("Input shape:", image_array.shape)

    emotion, confidence, scores = model_loader.predict(image_array)

    return EmotionPrediction(
        emotion=emotion,
        confidence=confidence,
        scores=scores
    )
