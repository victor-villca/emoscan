export interface Session {
  id: number;
  user_id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: string;
  actual_start_time?: string | null;
  actual_end_time?: string | null;
}

export interface SessionListItem {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  participantCount: number;
  durationMinutes: number;
}

export interface SessionCardProps {
  session: SessionListItem;
}

export interface SessionCardsProps {
  sessions: SessionListItem[];
}

export interface Participant {
  id: number;
  session_id: number;
  name: string;
  face_snapshot_url: string;
}
export interface EnrichedParticipant extends Participant {
  dominantEmotionId: number | null;
}

export interface EmotionSummary {
  id: number;
  session_id: number;
  happy: string;
  sadness: string;
  neutral: string;
  angry: string;
  surprise: string;
  fear: string;
}

export interface TimelineEntry {
  id: number;
  session_id: number;
  timestamp: string;
  primary_emotion_id: number;
}

export interface EmotionTransition {
  id: number;
  session_id: number;
  emotion_from_id: number;
  emotion_to_id: number;
  started_at: string;
  duration_minutes: number;
}

export interface SessionDetails {
  session: Session;
  participants: EnrichedParticipant[];
  emotionSummary: EmotionSummary;
  timeline: TimelineEntry[];
  transitions: EmotionTransition[];
}

export interface AggregatedEmotionMetric {
  emotion_type_id: number;
  average_percentage: string;
}

export interface ParticipantReportData {
  participant: Participant;
  session: Session;
  emotionReport: {
    id: number;
    participant_id: number;
    emotions: AggregatedEmotionMetric[];
  } | null;
  transitions: EmotionTransition[];
}

export interface Emotion {
  id: number;
  emotion_report_id: number;
  emotion_type_id: number;
  percentage: string;
  detected_at: string;
}
