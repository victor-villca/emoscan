'use client';

import { useParams } from 'next/navigation';

const LiveSessionPage = () => {
  const { code } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Live Session Created
        </h1>
        <p className="text-gray-600 mb-6">
          Share this code with your participants to join the session:
        </p>
        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
          <span className="font-mono text-lg text-gray-800">{code}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(code));
            }}
            className="ml-4 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionPage;