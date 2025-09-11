'use client';
import { Anomaly } from '@/services/interpretation.service';

const AnomaliesSection = ({ anomalies }: { anomalies: Anomaly[] }) => {
  if (anomalies.length === 0) {
    return null;
  }
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg shadow-sm mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <i className="ri-alert-fill text-2xl text-amber-500"></i>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-amber-800">
            Puntos de Atención Clínica
          </h3>
          <div className="mt-2 text-sm text-amber-700 space-y-2">
            {anomalies.map((anomaly, index) => (
              <div key={index}>
                <p className="font-bold">{anomaly.interpretation}:</p>
                <p>{anomaly.clinicalRelevance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnomaliesSection;
