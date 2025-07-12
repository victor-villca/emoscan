import numpy as np
from typing import Tuple, List

class EmotionModel:
    def __init__(self, model, labels: List[str]):
        self.model = model
        self.labels = labels

    def predict(self, image_array: np.ndarray) -> Tuple[str, float, dict]:
        prediction = self.model.predict(image_array)[0]
        emotion_index = np.argmax(prediction)
        return (
            self.labels[emotion_index],
            float(prediction[emotion_index]),
            {self.labels[i]: float(p) for i, p in enumerate(prediction)}
        )
