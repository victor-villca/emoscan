from fastapi import FastAPI
from app.routes import predict

app = FastAPI(
    title="EmoScan Emotion Analysis API",
    description="Detect emotions from face images using a trained deep learning model",
    version="1.0.0"
)

app.include_router(predict.router, prefix="/api")
