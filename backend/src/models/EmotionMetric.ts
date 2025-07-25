export interface EmotionMetric {
  id: number;
  emotion_report_id: number;
  emotion_type_id: number;
  percentage: number;
  detected_at: Date;
}
