'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { InterpretedEmotion, Anomaly } from '@/services/interpretation.service';
import { getEmotionScientificDetails } from '@/services/interpretation.service';
import { EMOTION_DATA } from '@/lib/constant';

interface AnalysisSummaryProps {
  narrativeSummary: string;
  scientificSummary: string;
  topEmotions: InterpretedEmotion[];
  anomalies: Anomaly[];
  bibliography: string[];
  metadata: {
    total_references: number;
    primary_theoretical_framework: string;
    interpretation_confidence: 'high' | 'moderate' | 'low';
  };
}

const AnalysisSummary = ({
  narrativeSummary,
  scientificSummary,
  topEmotions,
  anomalies,
  bibliography,
  metadata,
}: AnalysisSummaryProps) => {
  const [showBibliography, setShowBibliography] = useState(false);
  const [showScientificDetails, setShowScientificDetails] = useState(false);
  const params = useParams();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Análisis Emocional</h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(metadata.interpretation_confidence)}`}
          >
            Confianza:{' '}
            {metadata.interpretation_confidence === 'high'
              ? 'Alta'
              : metadata.interpretation_confidence === 'moderate'
                ? 'Moderada'
                : 'Baja'}
          </div>
        </div>

        <p
          className="text-gray-700 text-sm mb-4"
          dangerouslySetInnerHTML={{ __html: narrativeSummary }}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p
            className="text-blue-900 text-sm"
            dangerouslySetInnerHTML={{ __html: scientificSummary }}
          />
          <div className="mt-2 text-xs text-blue-700">
            <span className="font-medium">Marco Teórico:</span>{' '}
            {metadata.primary_theoretical_framework}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setShowScientificDetails(!showScientificDetails)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
          >
            <i className="ri-information-line mr-1"></i>
            Detalles Científicos
          </button>
          <button
            onClick={() => setShowBibliography(!showBibliography)}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full transition-colors"
          >
            <i className="ri-book-line mr-1"></i>
            Bibliografía ({metadata.total_references})
          </button>
          <Link
            href={`/session/${params.sessionId}/participant/${params.participantId}/bibliography`}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full transition-colors"
          >
            <i className="ri-external-link-line mr-1"></i>
            Ver Bibliografía Completa
          </Link>
        </div>
      </div>

      {anomalies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
            <i className="ri-alert-line mr-2 text-orange-500"></i>
            Patrones Clínicos Identificados
          </h4>
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${getSeverityColor(anomaly.severity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm">{anomaly.name}</h5>
                  <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                    {anomaly.severity === 'severe'
                      ? 'Severo'
                      : anomaly.severity === 'high'
                        ? 'Alto'
                        : anomaly.severity === 'moderate'
                          ? 'Moderado'
                          : 'Bajo'}
                  </span>
                </div>
                <p className="text-xs mb-2">{anomaly.interpretation}</p>
                <div className="text-xs opacity-75">
                  <strong>Base científica:</strong> {anomaly.scientific_basis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScientificDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
            <i className="ri-microscope-line mr-2 text-blue-500"></i>
            Fundamento Científico Detallado
          </h4>

          <div className="space-y-4">
            {topEmotions.slice(0, 2).map((emotion) => {
              const details = getEmotionScientificDetails(emotion.name);
              if (!details) return null;

              const emotionConstant = Object.values(EMOTION_DATA).find(
                (e) => e.name === emotion.name
              );

              return (
                <div
                  key={emotion.name}
                  className="border-l-4 pl-4"
                  style={{
                    borderLeftColor: emotionConstant?.color || '#3B82F6',
                  }}
                >
                  <h5 className="font-medium text-sm text-gray-800 mb-1">
                    {emotion.name} - {emotion.scientific_reference.author} (
                    {emotion.scientific_reference.year})
                  </h5>
                  <p className="text-xs text-gray-600 mb-2">
                    {details.definition}
                  </p>

                  {details.clinical_notes.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <strong>Notas clínicas:</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {details.clinical_notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showBibliography && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 text-sm mb-3 flex items-center">
            <i className="ri-book-open-line mr-2 text-green-500"></i>
            Referencias Utilizadas
          </h4>

          <div className="text-xs text-gray-600 space-y-2 max-h-48 overflow-y-auto">
            {bibliography.slice(0, 5).map((reference, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="font-mono text-gray-400 mt-0.5">
                  [{index + 1}]
                </span>
                <span>{reference}</span>
              </div>
            ))}
            {bibliography.length > 5 && (
              <div className="pt-2 border-t border-gray-200">
                <Link
                  href={`/session/${params.sessionId}/participant/${params.participantId}/bibliography`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  Ver {bibliography.length - 5} referencias adicionales →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisSummary;
