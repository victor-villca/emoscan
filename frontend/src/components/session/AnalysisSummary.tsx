'use client';
import { useMemo } from 'react';
import { AggregatedEmotionMetric } from '@/types/sessionTypes';

const emotionTypes: Record<number, { name: string; color: string; icon: string }> = {
  1: { name: 'Happy', color: '#34D399', icon: 'ri-emotion-happy-line' },
  2: { name: 'Sadness', color: '#60A5FA', icon: 'ri-emotion-sad-line' },
  3: { name: 'Neutral', color: '#9CA3AF', icon: 'ri-emotion-normal-line' },
  4: { name: 'Angry', color: '#F87171', icon: 'ri-emotion-unhappy-line' },
  5: { name: 'Surprise', color: '#FBBF24', icon: 'ri-emotion-line' },
  6: { name: 'Fear', color: '#818CF8', icon: 'ri-emotion-2-line' },
};

interface AnalysisSummaryProps {
  participantName: string;
  emotions: AggregatedEmotionMetric[];
}

const AnalysisSummary = ({ participantName, emotions }: AnalysisSummaryProps) => {
  
  const topThreeEmotions = useMemo(() => {
    if (!emotions || emotions.length === 0) return [];
    return [...emotions]
      .sort((a, b) => parseFloat(b.average_percentage) - parseFloat(a.average_percentage))
      .slice(0, 3)
      .map(e => ({ ...e, ...emotionTypes[e.emotion_type_id] }));
  }, [emotions]);

  const narrativeText = useMemo(() => {
    if (topThreeEmotions.length === 0) return `No se procesaron suficientes datos para generar un resumen para ${participantName}.`;
    
    const dominant = topThreeEmotions[0];
    let text = `El perfil emocional de <strong>${participantName}</strong> estuvo dominado principalmente por <strong>${dominant.name}</strong> (promedio de ${dominant.average_percentage}%).`;

    if (topThreeEmotions.length > 1) {
      const secondary = topThreeEmotions[1];
      text += ` Se observó una presencia notable de <strong>${secondary.name}</strong> (${secondary.average_percentage}%).`;
    }
    
    return text;
  }, [participantName, topThreeEmotions]);

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-2">Resumen de Análisis</h3>
      <p className="text-gray-700 text-sm mb-4" dangerouslySetInnerHTML={{ __html: narrativeText }} />
      
      <h4 className="font-semibold text-gray-800 text-sm mb-2">Emociones Principales:</h4>
      <div className="space-y-2">
        {topThreeEmotions.map(emotion => (
          <div key={emotion.emotion_type_id} className="flex items-center">
            <i className={`${emotion.icon} mr-2`} style={{ color: emotion.color }}></i>
            <span className="text-sm text-gray-700 flex-grow">{emotion.name}</span>
            <span className="text-sm font-bold text-gray-800">{emotion.average_percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisSummary;