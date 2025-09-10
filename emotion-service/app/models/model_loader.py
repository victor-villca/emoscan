import tensorflow as tf
import pickle
from app.models.emotion_model import EmotionModel

class EmotionModelLoader:
    def __init__(self, model_path: str, labels_path: str):
        model = tf.keras.models.load_model(model_path, compile=False)
        with open(labels_path, "rb") as f:
            labels = pickle.load(f)
        self.model = EmotionModel(model, labels)

    def predict(self, image_array):
        return self.model.predict(image_array)
