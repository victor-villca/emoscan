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
  dynamicNarrative: string; // NUEVO
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
  dynamicNarrative, // NUEVO
  topEmotions,
  anomalies,
  bibliography,
  metadata,
}: AnalysisSummaryProps) => {
  const [showBibliography, setShowBibliography] = useState(false);
  const [showScientificDetails, setShowScientificDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'dynamic'>('dynamic'); // NUEVO: tab activo
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
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'dynamic'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="ri-line-chart-line mr-2"></i>
            Evolución Emocional
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 px-4 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'general'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="ri-book-line mr-2"></i>
            Análisis General
          </button>
        </div>

        {activeTab === 'dynamic' && (
          <div className="p-6">
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <i className="ri-lightbulb-line mr-2"></i>
                Narrativa de Evolución
              </h4>
              <p
                className="text-blue-800 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: dynamicNarrative }}
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p
                className="text-green-900 text-sm"
                dangerouslySetInnerHTML={{ __html: scientificSummary }}
              />
              <div className="mt-3 text-xs text-green-700">
                <span className="font-medium">Marco Teórico:</span>{' '}
                {metadata.primary_theoretical_framework}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
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
        )}

        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">
                  Análisis Emocional General
                </h4>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(
                    metadata.interpretation_confidence
                  )}`}
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
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p
                className="text-blue-900 text-sm"
                dangerouslySetInnerHTML={{ __html: scientificSummary }}
              />
              <div className="mt-2 text-xs text-blue-700">
                <span className="font-medium">Marco Teórico:</span>{' '}
                {metadata.primary_theoretical_framework}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
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
        )}
      </div>

      {anomalies.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 text-base mb-4 flex items-center">
            <i className="ri-alert-line mr-2 text-orange-500"></i>
            Patrones Clínicos Identificados
          </h4>
          <div className="space-y-3">
            {anomalies.map((anomaly, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getSeverityColor(
                  anomaly.severity
                )}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-sm">{anomaly.name}</h5>
                  <span className="text-xs px-3 py-1 rounded-full bg-white bg-opacity-60 font-medium">
                    {anomaly.severity === 'severe'
                      ? 'Severo'
                      : anomaly.severity === 'high'
                        ? 'Alto'
                        : anomaly.severity === 'moderate'
                          ? 'Moderado'
                          : 'Bajo'}
                  </span>
                </div>
                <p className="text-sm mb-2">{anomaly.interpretation}</p>
                <div className="text-xs opacity-85 font-medium">
                  <strong>Base científica:</strong> {anomaly.scientific_basis}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showScientificDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 text-base mb-4 flex items-center">
            <i className="ri-microscope-line mr-2 text-blue-500"></i>
            Fundamento Científico Detallado
          </h4>

          <div className="space-y-5">
            {topEmotions.slice(0, 3).map((emotion) => {
              const details = getEmotionScientificDetails(emotion.name);
              if (!details) return null;

              const emotionConstant = Object.values(EMOTION_DATA).find(
                (e) => e.name === emotion.name
              );

              return (
                <div
                  key={emotion.name}
                  className="border-l-4 pl-4 pb-4"
                  style={{
                    borderLeftColor: emotionConstant?.color || '#3B82F6',
                  }}
                >
                  <h5 className="font-semibold text-sm text-gray-800 mb-2">
                    {emotion.name} - {emotion.scientific_reference.author} (
                    {emotion.scientific_reference.year})
                  </h5>
                  <p className="text-sm text-gray-600 mb-3">
                    {details.definition}
                  </p>

                  {details.clinical_notes.length > 0 && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-3 mb-2">
                      <strong>Notas clínicas:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                        {details.clinical_notes.map((note, idx) => (
                          <li key={idx} className="text-gray-600">
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {details.related_concepts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {details.related_concepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showBibliography && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-800 text-base mb-4 flex items-center">
            <i className="ri-book-open-line mr-2 text-green-500"></i>
            Referencias Utilizadas
          </h4>

          <div className="text-sm text-gray-700 space-y-3 max-h-96 overflow-y-auto">
            {bibliography.slice(0, 8).map((reference, index) => (
              <div
                key={index}
                className="flex items-start gap-3 pb-3 border-b border-gray-100"
              >
                <span className="font-mono text-gray-400 flex-shrink-0 mt-0.5">
                  [{index + 1}]
                </span>
                <span className="text-gray-700">{reference}</span>
              </div>
            ))}
            {bibliography.length > 8 && (
              <div className="pt-3 border-t border-gray-200">
                <Link
                  href={`/session/${params.sessionId}/participant/${params.participantId}/bibliography`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold inline-flex items-center"
                >
                  Ver {bibliography.length - 8} referencias adicionales
                  <i className="ri-arrow-right-line ml-1"></i>
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
