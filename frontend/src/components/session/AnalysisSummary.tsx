'use client';
import { InterpretedEmotion } from '@/services/interpretation.service';

interface AnalysisSummaryProps {
  narrativeSummary: string;
  topEmotions: InterpretedEmotion[];
}

const AnalysisSummary = ({ narrativeSummary, topEmotions }: AnalysisSummaryProps) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-900 mb-2">Resumen de Análisis</h3>
      <p className="text-gray-700 text-sm mb-4" dangerouslySetInnerHTML={{ __html: narrativeSummary }} />
      
      <h4 className="font-semibold text-gray-800 text-sm mb-3">Emociones Principales:</h4>
      <div className="space-y-3">
        {topEmotions.slice(0, 3).map(emotion => (
          <div key={emotion.name} className="flex items-center">
            <i className={`${emotion.icon} mr-3 text-lg text-${emotion.intensity.color}-500`}></i>
            <span className="text-sm text-gray-700 flex-grow font-medium">{emotion.name}</span>
            <div className={`flex items-center text-xs font-bold text-${emotion.intensity.color}-600`}>
              <i className={`${emotion.intensity.icon} mr-1`}></i>
              <span>{emotion.intensity.level}</span>
            </div>
            <span className="text-sm font-bold text-gray-800 w-16 text-right">{emotion.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisSummary;