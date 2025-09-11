'use client';
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SessionDetails } from '@/types/sessionTypes';
import { usePDFGenerator } from '@/hooks/usePDFGenerator';
import { use } from 'react';
import StatCard from '@/components/session/StatCard';
import EmotionTimelineChart from '@/components/session/EmotionTimelineChart';
import SummaryEmotionCard from '@/components/session/SummaryEmotionCard';
import { differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { EMOTION_DATA, API_NAME_TO_ID_MAP } from '@/lib/constant';
import EmotionHeatmap from '@/components/session/EmotionHeatmap';

const SessionDetailsPage = ({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) => {
  const { sessionId } = use(params);

  const [sessionData, setSessionData] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/${sessionId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch session details. Status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log(data);
        setSessionData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Failed to load session details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const getDynamicDurationText = (session: SessionDetails['session']) => {
    if (session.actual_start_time && session.actual_end_time) {
      const start = new Date(session.actual_start_time);
      const end = new Date(session.actual_end_time);
      const duration = differenceInMinutes(end, start);
      return duration < 1 ? '< 1 min' : `${duration} min`;
    }
    if (session.actual_start_time) {
      return `Live for ${formatDistanceToNow(new Date(session.actual_start_time))}`;
    }
    return 'Not Started';
  };

  const reportFileName = useMemo(() => {
    if (!sessionData) return 'Session_Report';
    const dateStr = new Date(sessionData.session.date)
      .toISOString()
      .split('T')[0];
    return `Session_${sessionData.session.name.replace(' ', '_')}_${dateStr}`;
  }, [sessionData]);

  const { isGenerating, generatePDF } = usePDFGenerator({
    fileName: reportFileName,
    elementId: 'sessionReportContent',
  });

  const dominantSessionEmotion = useMemo(() => {
    if (!sessionData?.emotionSummary) return null;

    try {
      const summary = sessionData.emotionSummary;

      let maxPercentage = 0;
      let dominantEmotionId: number | null = null;

      Object.entries(summary).forEach(([emotionName, percentage]) => {
        const emotionId = API_NAME_TO_ID_MAP[emotionName.toLowerCase()];
        const percentageValue = parseFloat(percentage as string);

        if (
          emotionId &&
          !isNaN(percentageValue) &&
          percentageValue > maxPercentage
        ) {
          maxPercentage = percentageValue;
          dominantEmotionId = emotionId;
        }
      });

      return dominantEmotionId ? EMOTION_DATA[dominantEmotionId] : null;
    } catch (error) {
      console.error('Error calculating dominant emotion:', error);
      return null;
    }
  }, [sessionData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] container mx-auto px-4 py-6 animate-pulse">
        <div className="h-6 w-1/4 bg-gray-200 rounded mb-8"></div>
        <div className="h-20 bg-gray-200 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="bg-gray-200 rounded-lg h-96"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!sessionData) {
    return <div className="text-center py-20">Sesion no encontrada.</div>;
  }

  const { session, participants, emotionSummary, timeline } = sessionData;
  const durationText = getDynamicDurationText(session);

  return (
    <>
      <Head>
        <title>{session.name} | Detalles de la Sesion</title>
      </Head>
      <div className="min-h-screen bg-[#F8F9FA]">
        <main
          id="sessionReportContent"
          className="container mx-auto px-4 py-6 bg-white"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <Link
                href="/"
                className="flex items-center text-primary font-medium mb-4 text-sm"
              >
                <i className="ri-arrow-left-line mr-1"></i>Volver al Panel
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">
                {session.name}
              </h1>
              <p className="text-gray-500 mt-1">
                {formatDate(session.date)} • {formatTime(session.start_time)} -{' '}
                {formatTime(session.end_time)}
              </p>
            </div>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="btn-primary ont-medium items-center self-start md:self-center  bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 cursor-pointer disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                'Generando...'
              ) : (
                <>
                  {' '}
                  <i className="ri-download-line mr-2"></i>Exportar Reporte{' '}
                </>
              )}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard
                icon="ri-group-line"
                label="Participantes"
                value={participants.length}
                color="text-blue-500"
              />
              <StatCard
                icon="ri-time-line"
                label="Duración del análisis"
                value={`${durationText}`}
                color="text-purple-500"
              />
              {dominantSessionEmotion && (
                <StatCard
                  icon={dominantSessionEmotion.icon}
                  label="Emoción Dominante"
                  value={dominantSessionEmotion.name}
                  color={dominantSessionEmotion.color}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Resumen General de Emociones
              </h2>
              {emotionSummary ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(emotionSummary).map(([name, percentage]) => {
                    const emotionId = API_NAME_TO_ID_MAP[name];
                    if (!emotionId) return null;
                    const emotion = EMOTION_DATA[emotionId];
                    return (
                      <SummaryEmotionCard
                        key={name}
                        name={emotion.name}
                        icon={emotion.icon}
                        percentage={parseFloat(percentage as string)}
                        color={emotion.textColor}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <p>
                    No se procesaron datos de emociones durante esta sesión.
                  </p>
                  <p className="text-sm mt-1">
                    El resumen estará disponible una vez que los participantes
                    comiencen a compartir su video.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Línea de Tiempo Emocional de la Sesión
              </h2>
              {timeline && timeline.length > 0 ? (
                <EmotionTimelineChart
                  timeline={timeline}
                  participants={participants}
                />
              ) : (
                <p className="text-gray-500 text-center py-10">
                  No hay datos de línea de tiempo disponibles para esta sesión.
                </p>
              )}
            </div>

            {/* --- INICIO DEL NUEVO GRÁFICO --- */}
            <div className="mb-6">
              <EmotionHeatmap timeline={timeline} participants={participants} />
            </div>
            {/* --- FIN DEL NUEVO GRÁFICO --- */}

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Participantes
              </h2>
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No hay participantes en esta sesión.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map((participant) => {
                    const dominantEmotion =
                      EMOTION_DATA[
                        participant.dominantEmotionId as keyof typeof EMOTION_DATA
                      ];
                    return (
                      <Link
                        href={`/session/${sessionId}/participant/${participant.id}`}
                        key={participant.id}
                        className="block card p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-lg"
                      >
                        <div className="flex items-center">
                          <img
                            src={
                              participant.face_snapshot_url ||
                              '/placeholder.png'
                            }
                            alt={participant.name}
                            className="w-12 h-12 rounded-full object-cover mr-4"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800">
                              {participant.name}
                            </h3>
                            {dominantEmotion && (
                              <div
                                className={`text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full ${dominantEmotion.bgColor} ${dominantEmotion.textColor}`} // Usar bgColor y textColor
                              >
                                <i
                                  className={`${dominantEmotion.icon} mr-1`}
                                ></i>
                                {dominantEmotion.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default SessionDetailsPage;
