from fastapi import FastAPI
from app.routes import predict
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="EmoScan Emotion Analysis API",
    description="Detect emotions from face images using a trained deep learning model",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(predict.router, prefix="/api")