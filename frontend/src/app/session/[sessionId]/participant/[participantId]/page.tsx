'use client';
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { use } from 'react';
import { differenceInMinutes } from 'date-fns';

import { ParticipantReportData } from '@/types/sessionTypes';
import {
  interpretEmotions,
  InterpretationResult,
} from '@/services/interpretation.service';
import EmotionRadarChart from '@/components/session/EmotionRadarChart';
import ParticipantReportSkeleton from '@/components/session/ParticipantReportSkeleton';
import AnalysisSummary from '@/components/session/AnalysisSummary';
import AnomaliesSection from '@/components/session/AnomaliesSection';
import EmotionalArcVisualization from '@/components/session/EmotionalArcVisualization';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import EmotionBreakdownCard from '@/components/session/EmotionBreakdownCard';
import { EMOTION_DATA } from '@/lib/constant';

export default function ParticipantReport({
  params,
}: {
  params: Promise<{ sessionId: string; participantId: string }>;
}) {
  const { sessionId, participantId } = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ParticipantReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  useEffect(() => {
    if (!participantId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/participant/${participantId}`
        );
        if (!response.ok) throw new Error('Failed to fetch participant data');
        const reportData = await response.json();
        setData(reportData);
      } catch (err) {
        setError('Error fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [participantId]);

  const interpretationResult = useMemo((): InterpretationResult | null => {
    if (!data?.emotionReport?.emotions) return null;
    return interpretEmotions(
      data.emotionReport.emotions,
      data.participant.name,
      data.timeline,
      data.transitions
    );
  }, [data]);

  const reportFileName = useMemo(() => {
    if (!data) return 'Participant_Report';
    const dateStr = new Date(data.session.date).toISOString().split('T')[0];
    return `Participant_${data.participant.name.replace(' ', '_')}_Session_${data.session.id}_${dateStr}`;
  }, [data]);

  const { isGenerating, generatePDF } = usePDFGenerator({
    fileName: reportFileName,
    elementId: 'participantReportContent',
  });

  const sessionDurationInMinutes = useMemo(() => {
    if (!data?.session) return { minutes: 0, seconds: 0 };

    const { actual_start_time, actual_end_time } = data.session;

    if (actual_start_time && actual_end_time) {
      const start = new Date(actual_start_time);
      const end = new Date(actual_end_time);

      const diffInMs = end.getTime() - start.getTime();
      const diffInMinutes = Math.floor(diffInMs / 60000);
      const diffInSeconds = Math.floor((diffInMs % 60000) / 1000);

      return { minutes: diffInMinutes, seconds: diffInSeconds };
    }

    return { minutes: 0, seconds: 0 };
  }, [data]);

  const processedEmotions = useMemo(() => {
    if (!data?.emotionReport) return [];

    const allEmotionIds = Object.keys(EMOTION_DATA).map(Number);
    const metricsFromApi = data.emotionReport.emotions || [];
    const sessionDuration = differenceInMinutes(
      new Date(`${data.session.date}T${data.session.end_time}`),
      new Date(`${data.session.date}T${data.session.start_time}`)
    );

    return allEmotionIds.map((id) => {
      const emotionInfo = EMOTION_DATA[id];
      const metric = metricsFromApi.find((m) => m.emotion_type_id === id);
      const percentage = parseFloat(metric?.average_percentage || '0.00');
      const minutes = Math.round((percentage / 100) * sessionDuration);

      return {
        emotion_type_id: id,
        name: emotionInfo.name,
        icon: emotionInfo.icon,
        color: emotionInfo.color,
        percentage: percentage,
        minutes: minutes,
      };
    });
  }, [data]);

  const dominantEmotion = useMemo(() => {
    if (processedEmotions.length === 0) return null;
    return processedEmotions.reduce((max, e) =>
      e.percentage > max.percentage ? e : max
    );
  }, [processedEmotions]);

  if (loading) return <ParticipantReportSkeleton />;
  if (error || !data)
    return (
      <div className="text-center py-20 text-red-500">
        {error || 'No data available.'}
      </div>
    );

  const { participant, session, emotionReport, transitions } = data;

  let sessionDurationText = 'N/A';
  if (sessionDurationInMinutes.minutes >= 1) {
    sessionDurationText = `${sessionDurationInMinutes.minutes} min`;
  } else if (sessionDurationInMinutes.seconds > 0) {
    sessionDurationText = `${sessionDurationInMinutes.seconds} s`;
  }
  return (
    <>
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href={`/session/${sessionId}`}
              className="hover:text-blue-600"
            >
              Sesión
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-blue-600 font-medium">
              Reporte del Participante
            </span>
          </div>
        </div>
      </div>
      <Head>
        <title>Reporte - {participant.name}</title>
      </Head>
      <div
        id="participantReportContent"
        className="container mx-auto px-4 py-8 max-w-7xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Informe de análisis de emociones
            </h1>
            <p className="text-gray-600 mt-1">
              Sesión de {new Date(session.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 md:mt-0 w-full sm:w-auto">
            <Link
              href={`/session/${sessionId}`}
              className="flex items-center justify-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Volver a la sesión
            </Link>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  <i className="ri-file-download-line mr-2"></i>
                  Exportar PDF
                </>
              )}
            </button>
          </div>
        </div>

        {interpretationResult && interpretationResult.anomalies.length > 0 && (
          <AnomaliesSection anomalies={interpretationResult.anomalies} />
        )}

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {!emotionReport || emotionReport.emotions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              No se han registrado datos de emociones para {participant.name}.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[600px]">
              <div className="lg:col-span-3 p-8 bg-gradient-to-br from-slate-50/50 to-gray-50/30 ">
                <div className="text-center mb-8">
                  <div className="relative inline-block mb-4">
                    <img
                      src={participant.face_snapshot_url || '/placeholder.png'}
                      alt={participant.name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      ID: {participant.id}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {participant.name}
                  </h2>
                  <p className="text-sm text-gray-500 bg-gray-100 inline-block px-3 py-1 rounded-full">
                    Participante de Sesión
                  </p>
                </div>

                <div className="flex items-center mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-300"></div>
                  <i className="ri-book-open-line text-gray-400 mx-3"></i>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-300"></div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                    <h3 className="text-white font-bold flex items-center">
                      <i className="ri-psychology-line mr-2"></i>
                      Análisis Emocional
                    </h3>
                  </div>

                  {interpretationResult && (
                    <div className="p-6">
                      <AnalysisSummary
                        narrativeSummary={interpretationResult.narrativeSummary}
                        scientificSummary={
                          interpretationResult.scientificSummary
                        }
                        dynamicNarrative={interpretationResult.dynamicNarrative}
                        topEmotions={interpretationResult.enrichedEmotions}
                        anomalies={interpretationResult.anomalies}
                        bibliography={interpretationResult.bibliography}
                        metadata={interpretationResult.metadata}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-xs text-gray-500 mb-1">Duración</div>
                    <div className="font-bold text-gray-900">
                      {sessionDurationText}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                    <div className="text-xs text-gray-500 mb-1">Dominante</div>
                    <div
                      className="font-bold text-sm truncate"
                      style={{ color: dominantEmotion?.color }}
                    >
                      {dominantEmotion?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 p-8 bg-gradient-to-br from-blue-50/30 to-indigo-50/40 border-r border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="w-1 h-8 bg-blue-600 rounded-full mr-4"></div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Huella Emocional
                  </h3>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 mb-8">
                  <EmotionRadarChart emotions={emotionReport.emotions} />
                </div>

                {interpretationResult && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center mb-4">
                      <i className="ri-emotion-line text-blue-600 mr-2 text-lg"></i>
                      <h4 className="font-bold text-gray-800">
                        Emociones Principales
                      </h4>
                    </div>
                    <div className="space-y-4">
                      {interpretationResult.enrichedEmotions
                        .slice(0, 3)
                        .map((emotion) => {
                          const emotionConstant = Object.values(
                            EMOTION_DATA
                          ).find((e) => e.name === emotion.name);

                          return (
                            <div key={emotion.name} className="group">
                              <div className="flex items-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-all duration-200">
                                <i
                                  className={`${emotionConstant?.icon || emotion.icon} mr-3 text-xl`}
                                  style={{
                                    color:
                                      emotionConstant?.color ||
                                      emotion.intensity.color,
                                  }}
                                ></i>

                                <div className="flex-grow">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 font-semibold">
                                      {emotion.name}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setSelectedEmotion(
                                          selectedEmotion === emotion.name
                                            ? null
                                            : emotion.name
                                        )
                                      }
                                      className="opacity-60 hover:opacity-100 transition-opacity"
                                    >
                                      <i className="ri-information-line text-xs text-blue-500 hover:text-blue-700"></i>
                                    </button>
                                  </div>

                                  {selectedEmotion === emotion.name && (
                                    <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-300 rounded-r text-xs text-blue-900">
                                      <div className="mb-2">
                                        <strong>Interpretación:</strong>{' '}
                                        {
                                          emotion.intensity
                                            .clinical_significance
                                        }
                                      </div>
                                      <div>
                                        <strong>Referencia:</strong>{' '}
                                        {emotion.scientific_reference.author} (
                                        {emotion.scientific_reference.year})
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <div
                                    className="flex items-center text-xs font-bold px-2 py-1 rounded-full"
                                    style={{
                                      backgroundColor: `${emotionConstant?.color || emotion.intensity.color}20`,
                                      color:
                                        emotionConstant?.color ||
                                        emotion.intensity.color,
                                    }}
                                  >
                                    <i
                                      className={`${emotion.intensity.icon} mr-1`}
                                    ></i>
                                    <span>{emotion.intensity.level}</span>
                                  </div>
                                  <span className="text-lg font-bold text-gray-800 min-w-[50px] text-right">
                                    {emotion.percentage.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {interpretationResult && interpretationResult.dynamicArc && (
          <div className="mb-8">
            <EmotionalArcVisualization arc={interpretationResult.dynamicArc} />
          </div>
        )}
        {emotionReport && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Detalles de la sesión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">
                  Participante
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {participant.name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">
                  Fecha de la Sesion
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(session.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">
                  Duracion de la Sesion
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {sessionDurationText}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">
                  Emocion Dominante
                </p>
                <p
                  className="text-lg font-semibold"
                  style={{ color: dominantEmotion?.color }}
                >
                  {dominantEmotion?.name || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">Emociones</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Object.keys(EMOTION_DATA).length}
                </p>
              </div>
            </div>
          </div>
        )}

        {emotionReport && processedEmotions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Desglose emocional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedEmotions.map((emotion) => (
                <EmotionBreakdownCard
                  key={emotion.emotion_type_id}
                  emotionTypeId={emotion.emotion_type_id}
                  percentage={emotion.percentage}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
