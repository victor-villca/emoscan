import { AggregatedEmotionMetric } from '@/types/sessionTypes';
import { CLINICAL_KNOWLEDGE, PATTERNS } from './clinicalKnowledge';

const emotionIdToNameMap: Record<number, string> = {
  1: 'happy', 2: 'sadness', 3: 'neutral', 4: 'angry', 5: 'surprise', 6: 'fear',
};

const emotionUITypes: Record<number, { name: string; icon: string }> = {
  1: { name: 'Happy', icon: 'ri-emotion-happy-line' },
  2: { name: 'Sadness', icon: 'ri-emotion-sad-line' },
  3: { name: 'Neutral', icon: 'ri-emotion-normal-line' },
  4: { name: 'Angry', icon: 'ri-emotion-unhappy-line' },
  5: { name: 'Surprise', icon: 'ri-emotion-line' },
  6: { name: 'Fear', icon: 'ri-emotion-2-line' },
};

export interface InterpretedEmotion {
  name: string;
  icon: string;
  percentage: number;
  intensity: { level: string; color: string; icon: string; interpretation: string };
}
export interface Anomaly {
  type: string;
  interpretation: string;
  clinicalRelevance: string;
}
export interface InterpretationResult {
  enrichedEmotions: InterpretedEmotion[];
  anomalies: Anomaly[];
  narrativeSummary: string;
}

export const interpretEmotions = (emotions: AggregatedEmotionMetric[], participantName: string): InterpretationResult => {
  if (!emotions || emotions.length === 0) {
    return { enrichedEmotions: [], anomalies: [], narrativeSummary: `No se procesaron datos para ${participantName}.` };
  }

  const enrichedEmotions = emotions.map(emotion => {
    const percentage = parseFloat(emotion.average_percentage);
    const emotionNameKey = emotionIdToNameMap[emotion.emotion_type_id];
    const emotionUI = emotionUITypes[emotion.emotion_type_id];
    const knowledge = CLINICAL_KNOWLEDGE[emotionNameKey];

    let intensity = { level: 'Bajo', color: 'gray', icon: 'ri-checkbox-circle-fill', interpretation: 'Presencia normal de la emoción.' };

    if (knowledge) {
      for (const [level, T] of Object.entries(knowledge.thresholds)) {
        if (percentage <= T.max) {
          intensity = { level, ...T };
        }
      }
    }
    
    return { ...emotionUI, percentage, intensity };
  }).sort((a, b) => b.percentage - a.percentage);

  const anomalies = Object.values(PATTERNS)
    .filter(pattern => pattern.condition(enrichedEmotions))
    .map(pattern => ({ type: 'Pattern', ...pattern }));

  const dominant = enrichedEmotions[0];
  let narrativeSummary = `El perfil emocional de <strong>${participantName}</strong> estuvo dominado por <strong>${dominant.name}</strong> (${dominant.percentage.toFixed(1)}%), representando <strong>${dominant.intensity.interpretation.toLowerCase()}</strong>`;
  if (enrichedEmotions.length > 1) {
    const secondary = enrichedEmotions[1];
    narrativeSummary += `. Se observó una presencia notable de <strong>${secondary.name}</strong> (${secondary.percentage.toFixed(1)}%).`;
  }

  return { enrichedEmotions, anomalies, narrativeSummary };
};