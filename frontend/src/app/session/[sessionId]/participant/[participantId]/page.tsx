'use client';

import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { use } from 'react';
import { differenceInMinutes } from 'date-fns';

import { ParticipantReportData, AggregatedEmotionMetric } from '@/types/sessionTypes';
import EmotionPieChart from '@/components/session/EmotionPieChart';
import ParticipantReportSkeleton from '@/components/session/ParticipantReportSkeleton';
import AnalysisSummary from '@/components/session/AnalysisSummary';

const emotionTypes: Record<number, { name: string; color: string; icon: string }> = {
    1: { name: 'Happy', color: '#34D399', icon: 'ri-emotion-happy-line' },
    2: { name: 'Sadness', color: '#60A5FA', icon: 'ri-emotion-sad-line' },
    3: { name: 'Neutral', color: '#9CA3AF', icon: 'ri-emotion-normal-line' },
    4: { name: 'Angry', color: '#F87171', icon: 'ri-emotion-unhappy-line' },
    5: { name: 'Surprise', color: '#FBBF24', icon: 'ri-emotion-line' },
    6: { name: 'Fear', color: '#818CF8', icon: 'ri-emotion-2-line' },
};

export default function ParticipantReport({ params }: { params: Promise<{ sessionId: string; participantId: string }> }) {
  const { sessionId, participantId } = use(params);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ParticipantReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!participantId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/participant/${participantId}`);
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

  const processedEmotions = useMemo(() => {
    if (!data?.emotionReport?.emotions) return [];
    
    const sessionDuration = differenceInMinutes(new Date(`${data.session.date}T${data.session.end_time}`), new Date(`${data.session.date}T${data.session.start_time}`));
    
    return data.emotionReport.emotions.map(emotion => {
      const type = emotionTypes[emotion.emotion_type_id];
      const percentage = parseFloat(emotion.average_percentage);
      const minutes = Math.round((percentage / 100) * sessionDuration);
      return { ...emotion, ...type, percentage, minutes };
    });
  }, [data]);

  const dominantEmotion = useMemo(() => {
    if (processedEmotions.length === 0) return null;
    return processedEmotions.reduce((max, e) => e.percentage > max.percentage ? e : max);
  }, [processedEmotions]);

  if (loading) return <ParticipantReportSkeleton />;
  if (error || !data) return <div className="text-center py-20 text-red-500">{error || 'No data available.'}</div>;
  
  const { participant, session, emotionReport, transitions } = data;
  const sessionDuration = differenceInMinutes(new Date(`${session.date}T${session.end_time}`), new Date(`${session.date}T${session.start_time}`));

  return (
    <>
      <Head><title>Emotion Report - {participant.name}</title></Head>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Emotion Analysis Report</h1>
            <p className="text-gray-600 mt-1">Session on {new Date(session.date).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href={`/session/${sessionId}`} className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
              <i className="ri-arrow-left-line mr-2"></i>Back to Session
            </Link>
            <button className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition">
              <i className="ri-file-download-line mr-2"></i>Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          { !emotionReport || processedEmotions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No emotion data has been recorded for {participant.name}.</div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 text-center md:text-left">
                <img src={participant.face_snapshot_url || '/placeholder.png'} alt={participant.name} className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0 mb-4 border-4 border-white shadow-lg" />
                <h2 className="text-2xl font-bold text-gray-900">{participant.name}</h2>
                <p className="text-gray-500">Participant ID: {participant.id}</p>
                 <AnalysisSummary participantName={participant.name} emotions={emotionReport.emotions} sessionDuration={sessionDuration} />
              </div>
              <div className="w-full md:w-2/3 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {processedEmotions.map((emotion) => (
                    <div key={emotion.emotion_type_id} className="bg-gray-50 rounded-lg p-4 text-center">
                      <i className={`${emotion.icon} text-4xl`} style={{ color: emotion.color }}></i>
                      <p className="font-bold text-lg mt-2 text-gray-800">{emotion.name}</p>
                      <p className="text-2xl font-semibold text-gray-900">{emotion.percentage}%</p>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {emotionReport && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Emotion Distribution</h3>
              <EmotionPieChart emotions={emotionReport.emotions} />
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-3 font-medium text-gray-600">Participant</td><td className="text-right text-gray-800">{participant.name}</td></tr>
                  <tr className="border-b"><td className="py-3 font-medium text-gray-600">Session Date</td><td className="text-right text-gray-800">{new Date(session.date).toLocaleDateString()}</td></tr>
                  <tr className="border-b"><td className="py-3 font-medium text-gray-600">Session Duration</td><td className="text-right text-gray-800">{sessionDuration} min</td></tr>
                  <tr className="border-b"><td className="py-3 font-medium text-gray-600">Dominant Emotion</td><td className={`text-right font-semibold`} style={{color: dominantEmotion?.color}}>{dominantEmotion?.name || 'N/A'}</td></tr>
                  <tr><td className="py-3 font-medium text-gray-600">Total Metrics</td><td className="text-right text-gray-800">{emotionReport.emotions.length}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {transitions && transitions.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Emotion Transitions</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-2">Time</th>
                                <th className="px-4 py-2">Transition</th>
                                <th className="px-4 py-2">Duration in Previous State</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transitions.map(t => {
                                const from = emotionTypes[t.emotion_from_id];
                                const to = emotionTypes[t.emotion_to_id];
                                if (!from || !to) return null;
                                return (
                                    <tr key={t.id}>
                                        <td className="px-4 py-3">{new Date(t.started_at).toLocaleTimeString()}</td>
                                        <td className="px-4 py-3 flex items-center gap-2">
                                            <span className="font-bold" style={{color: from.color}}>{from.name}</span>
                                            <i className="ri-arrow-right-line text-gray-400"></i>
                                            <span className="font-bold" style={{color: to.color}}>{to.name}</span>
                                        </td>
                                        <td className="px-4 py-3">{t.duration_minutes} minutes</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </>
  );
}