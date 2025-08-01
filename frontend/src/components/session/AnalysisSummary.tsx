import { useMemo } from 'react';
import { AggregatedEmotionMetric } from '@/types/sessionTypes';

const emotionTypes: Record<number, { name: string; color: string }> = {
  1: { name: 'Happy', color: '#34D399' },
  2: { name: 'Sadness', color: '#60A5FA' },
  3: { name: 'Neutral', color: '#9CA3AF' },
  4: { name: 'Angry', color: '#F87171' },
  5: { name: 'Surprise', color: '#FBBF24' },
  6: { name: 'Fear', color: '#818CF8' },
};

interface AnalysisSummaryProps {
  participantName: string;
  emotions: AggregatedEmotionMetric[];
  sessionDuration: number;
}

const AnalysisSummary = ({
  participantName,
  emotions,
  sessionDuration,
}: AnalysisSummaryProps) => {
  const summaryText = useMemo(() => {
    if (!emotions || emotions.length === 0) {
      return `No emotional data was processed for ${participantName} during this session.`;
    }

    const sortedEmotions = [...emotions].sort(
      (a, b) =>
        parseFloat(b.average_percentage) - parseFloat(a.average_percentage)
    );

    const dominant = sortedEmotions[0];
    const dominantType = emotionTypes[dominant.emotion_type_id];

    let text = `Throughout the ${sessionDuration}-minute session, <strong>${participantName}</strong>'s emotional profile was primarily defined by <strong style="color: ${dominantType.color}">${dominantType.name}</strong>, accounting for <strong>${dominant.average_percentage}%</strong> of the analyzed expressions.`;

    if (sortedEmotions.length > 1) {
      const secondary = sortedEmotions[1];
      const secondaryType = emotionTypes[secondary.emotion_type_id];
      text += ` A notable secondary emotion was <strong style="color: ${secondaryType.color}">${secondaryType.name}</strong> at <strong>${secondary.average_percentage}%</strong>.`;
    }

    if (sortedEmotions.length > 2) {
      text += ` Other minor emotions were also detected, contributing to a complex emotional landscape.`;
    }

    return text;
  }, [participantName, emotions, sessionDuration]);

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-2">Analysis Summary</h3>
      <p
        className="text-gray-700 text-sm"
        dangerouslySetInnerHTML={{ __html: summaryText }}
      />
    </div>
  );
};

export default AnalysisSummary;
