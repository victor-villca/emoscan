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

const emotionMap: Record<
  number,
  { name: string; icon: string; color: string }
> = {
  1: { name: 'Happy', icon: 'ri-emotion-happy-line', color: 'text-green-500' },
  2: { name: 'Sadness', icon: 'ri-emotion-sad-line', color: 'text-blue-500' },
  3: {
    name: 'Neutral',
    icon: 'ri-emotion-normal-line',
    color: 'text-gray-500',
  },
  4: { name: 'Angry', icon: 'ri-emotion-unhappy-line', color: 'text-red-500' },
  5: { name: 'Surprise', icon: 'ri-emotion-line', color: 'text-amber-500' },
  6: { name: 'Fear', icon: 'ri-emotion-2-line', color: 'text-indigo-500' },
};

const apiNameToIdMap: Record<string, number> = {
  happy: 1,
  sadness: 2,
  neutral: 3,
  angry: 4,
  surprise: 5,
  fear: 6,
};

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

      const apiToEmotionMap: Record<string, number> = {
        happy: 1,
        sadness: 2,
        neutral: 3,
        angry: 4,
        surprise: 5,
        fear: 6,
      };

      let maxPercentage = 0;
      let dominantEmotionId: number | null = null;

      Object.entries(summary).forEach(([emotionName, percentage]) => {
        const emotionId = apiToEmotionMap[emotionName.toLowerCase()];
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

      return dominantEmotionId ? emotionMap[dominantEmotionId] : null;
    } catch (error) {
      console.error('Error calculating dominant emotion:', error);
      return null;
    }
  }, [sessionData]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const diff =
      new Date(`1970-01-01T${end}Z`).getTime() -
      new Date(`1970-01-01T${start}Z`).getTime();
    return Math.round(diff / 60000);
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
    return <div className="text-center py-20">Session not found.</div>;
  }

  const { session, participants, emotionSummary, timeline } = sessionData;
  const duration = calculateDuration(session.start_time, session.end_time);

  return (
    <>
      <Head>
        <title>{session.name} | Session Details</title>
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
                <i className="ri-arrow-left-line mr-1"></i>Back to Dashboard
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
                'Generating...'
              ) : (
                <>
                  <i className="ri-download-line mr-2"></i>Export Report
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
                label="Participants"
                value={participants.length}
                color="text-blue-500"
              />
              <StatCard
                icon="ri-time-line"
                label="Duration"
                value={`${duration} min`}
                color="text-purple-500"
              />
              {dominantSessionEmotion && (
                <StatCard
                  icon={dominantSessionEmotion.icon}
                  label="Dominant Emotion"
                  value={dominantSessionEmotion.name}
                  color={dominantSessionEmotion.color}
                />
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Overall Emotion Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(emotionSummary).map(([name, percentage]) => {
                  const emotionId = apiNameToIdMap[name];
                  if (!emotionId) return null;
                  const emotion = emotionMap[emotionId];
                  return (
                    <SummaryEmotionCard
                      key={name}
                      name={emotion.name}
                      icon={emotion.icon}
                      percentage={parseFloat(percentage as string)}
                      color={emotion.color}
                    />
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Session Emotion Timeline
              </h2>
              {timeline && timeline.length > 0 ? (
                <EmotionTimelineChart timeline={timeline} />
              ) : (
                <p className="text-gray-500 text-center py-10">
                  No timeline data available for this session.
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Participants
              </h2>
              {participants.length === 0 ? (
                <p className="text-gray-500 text-center py-10">
                  No participants in this session.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map((participant) => {
                    const dominantEmotion =
                      emotionMap[
                        participant.dominantEmotionId as keyof typeof emotionMap
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
                                className={`text-xs font-semibold inline-flex items-center px-2 py-0.5 rounded-full ${dominantEmotion.color.replace('text-', 'bg-').replace('-500', '-100')} ${dominantEmotion.color}`}
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
