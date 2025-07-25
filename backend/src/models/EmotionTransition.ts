export interface EmotionTransition {
  id: number;
  session_id: number;
  emotion_from_id: number;
  emotion_to_id: number;
  started_at: Date;
  duration_minutes: number;
}
