'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import LiveEmotionCard from '@/components/session/LiveEmotionCard';

interface EmotionData {
  primary_emotion: string;
  primary_confidence: number;
  participantName: string;
  timestamp: string;
}

const LiveSessionPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionCode = params.code as string;
  const [socket, setSocket] = useState<Socket | null>(null);

  const [participants, setParticipants] = useState<Map<string, EmotionData>>(
    new Map()
  );

  const [copySuccess, setCopySuccess] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [sessionData, setSessionData] = useState<{ id: number } | null>(null);

  useEffect(() => {
    if (!sessionCode) return;

    const fetchSessionId = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/code/${sessionCode}`
        );
        const data = await res.json();
        if (data.id) {
          setSessionData(data);
        }
      } catch (e) {
        console.error('Failed to fetch session ID');
      }
    };
    fetchSessionId();

    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_session', sessionCode);
    });

    newSocket.on('new_emotion_data', (data: EmotionData) => {
      console.log('🔥 New emotion data received for:', data.participantName);
      setParticipants((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.set(data.participantName, data);
        return newMap;
      });
    });

    newSocket.on('session_finished', (data: { sessionId: number }) => {
      console.log('✅ Session finished event received! Redirecting...');
      router.push(`/session/${data.sessionId}`);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected!');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [sessionCode, router]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(sessionCode));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleFinishSession = async () => {
    if (!sessionData?.id) {
      alert('Session ID not found. Cannot finish session.');
      return;
    }

    setIsFinishing(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sessions/${sessionData.id}/finish`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to finish the session.');
      }

      router.push(`/session/${sessionData.id}`);
    } catch (error) {
      console.error(error);
      alert('There was an error finishing the session. Please try again.');
    } finally {
      setIsFinishing(false);
    }
  };

  const participantArray = Array.from(participants.values());

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Live Session
          </h1>
          <p className="text-gray-600 mb-6">
            Share this code with your participants to join the session:
          </p>
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 flex items-center justify-between max-w-sm mx-auto">
            <span className="font-mono text-2xl text-gray-800 tracking-widest">
              {sessionCode}
            </span>
            <button
              onClick={handleCopyCode}
              className={`ml-4 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                copySuccess
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 transition-colors ${socket?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></div>
            <span
              className={`text-sm font-medium ${socket?.connected ? 'text-green-600' : 'text-red-600'}`}
            >
              {socket?.connected ? 'Live' : 'Disconnected'}
            </span>
          </div>

          <div className="mt-8 border-t pt-6">
            <button
              onClick={handleFinishSession}
              disabled={isFinishing || !sessionData}
              className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              {isFinishing ? 'Finalizing...' : 'Finish Session & View Report'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Participant Emotions
          </h2>

          {participantArray.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-500">
                Waiting for participants to send data...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {participantArray.map((data) => (
                <LiveEmotionCard key={data.participantName} data={data} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;
