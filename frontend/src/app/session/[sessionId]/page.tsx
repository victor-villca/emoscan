"use client"
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { SessionDetails } from '@/types/sessionTypes';
import EmotionCard from '@/components/session/EmotionCard';
import { use } from "react";

const SessionDetailsPage = ({ params }: { params: Promise<{ sessionId: string }> }) => {
  const { sessionId } = use(params);

  const [sessionData, setSessionData] = useState<SessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/${sessionId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch session details. Status: ${response.status}`);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Head>
        <title>{sessionData ? `${sessionData.session.name} | Session Details` : 'Session Details'}</title>
        <meta name="description" content="Session details and participant information" />
      </Head>
      
      <div className="min-h-screen bg-[#F8F9FA]">
        
        <main className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Link href="/" className="flex items-center text-primary font-medium">
              <div className="w-5 h-5 flex items-center justify-center mr-1">
                <i className="ri-arrow-left-line"></i>
              </div>
              Back Home
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading session details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="w-10 h-10 flex items-center justify-center text-red-500 mx-auto mb-2">
                <i className="ri-error-warning-line ri-2x"></i>
              </div>
              <p className="text-red-600">{error}</p>
              <button 
                className="mt-4 bg-red-100 text-red-600 px-4 py-2 rounded-md"
              >
                Try Again
              </button>
            </div>
          ) : sessionData ? (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{sessionData.session.name}</h1>
                    <p className="text-gray-500 mt-1">
                      {formatDate(sessionData.session.date)} • {formatTime(sessionData.session.start_time)} - {formatTime(sessionData.session.end_time)}
                    </p>
                  </div>
                  <button className="btn-primary text-white font-medium px-6 py-3 rounded-button mt-4 md:mt-0 whitespace-nowrap flex items-center">
                    <div className="w-5 h-5 flex items-center justify-center mr-2">
                      <i className="ri-download-line"></i>
                    </div>
                    Export Report
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Emotion Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <EmotionCard 
                    label="Happiness" 
                    percentage={parseFloat(sessionData.emotionSummary.happy)} 
                    color="bg-green-500" 
                  />
                  <EmotionCard 
                    label="Sadness" 
                    percentage={parseFloat(sessionData.emotionSummary.sadness)} 
                    color="bg-blue-500" 
                  />
                  <EmotionCard 
                    label="Neutral" 
                    percentage={parseFloat(sessionData.emotionSummary.neutral)} 
                    color="bg-gray-400" 
                  />
                  <EmotionCard 
                    label="Anger" 
                    percentage={parseFloat(sessionData.emotionSummary.angry)} 
                    color="bg-red-500" 
                  />
                  <EmotionCard 
                    label="Surprise" 
                    percentage={parseFloat(sessionData.emotionSummary.surprise)} 
                    color="bg-yellow-500" 
                  />
                  <EmotionCard 
                    label="Fear" 
                    percentage={parseFloat(sessionData.emotionSummary.fear)} 
                    color="bg-purple-500" 
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Participants</h2>
                {sessionData.participants.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No participants in this session</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessionData.participants.map(participant => (
                      
                      <Link href={`/session/${sessionId}/participant/${participant.id}`} key={participant.id}>
                        <div  className="card bg-white rounded-lg border border-gray-100 p-4 flex items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-3">
                          {participant.face_snapshot_url ? (
                            <img 
                              src={participant.face_snapshot_url} 
                              alt={participant.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/48';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <i className="ri-user-line ri-lg"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">{participant.name}</h3>
                          <p className="text-xs text-gray-500">ID: {participant.id}</p>
                        </div>
                      </div>

                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600">Session not found</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};
export default SessionDetailsPage;
