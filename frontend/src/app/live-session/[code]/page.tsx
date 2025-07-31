'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

interface EmotionData {
  primary_emotion: string;
  primary_confidence: number;
  participantName: string;
  timestamp: string;
}

const LiveSessionPage = () => {
  const params = useParams();
  const sessionCode = params.code as string;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!sessionCode) return;

    const newSocket = io('http://localhost:4000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected!', newSocket.id);
      newSocket.emit('join_session', sessionCode);
      console.log(`📩 Sent request to join room: ${sessionCode}`);
    });

    newSocket.on('new_emotion_data', (data: EmotionData) => {
      console.log('🔥 New emotion data received:', data);
      setEmotionHistory((prev) => [data, ...prev].slice(0, 10));
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected!');
    });

    return () => {
      console.log('Cleaning up WebSocket connection...');
      newSocket.disconnect();
    };
  }, [sessionCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(String(sessionCode));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Live Session: {sessionCode}
          </h1>
          <p className="text-gray-600 mb-6">
            Share this code with your participants to join the session:
          </p>
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between max-w-md mx-auto">
            <span className="font-mono text-lg text-gray-800">
              {sessionCode}
            </span>
            <button
              onClick={handleCopyCode}
              className={`ml-4 px-3 py-1 text-sm rounded-lg transition-colors ${
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
              className={`w-3 h-3 rounded-full mr-2 ${
                socket?.connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span
              className={`text-sm ${
                socket?.connected ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {socket?.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Real-time Emotion Data
          </h2>

          {emotionHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                Waiting for emotion data from participants...
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Check the developer console for connection logs.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {emotionHistory.map((emotion, index) => (
                <div
                  key={`${emotion.timestamp}-${index}`}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {emotion.participantName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(emotion.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-blue-600">
                          {emotion.primary_emotion}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${emotion.primary_confidence * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {Math.round(emotion.primary_confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;