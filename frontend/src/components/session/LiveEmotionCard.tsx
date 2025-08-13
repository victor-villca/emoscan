'use client';

interface EmotionData {
  primary_emotion: string;
  primary_confidence: number;
  participantName: string;
  timestamp: string;
}

const emotionToEmoji: Record<string, string> = {
  happy: '😄',
  sadness: '😢',
  neutral: '😐',
  angry: '😠',
  surprise: '😮',
  fear: '😨',
  default: '🧠',
};

const emotionToColor: Record<string, string> = {
  happy: 'bg-yellow-400',
  sadness: 'bg-blue-500',
  neutral: 'bg-gray-400',
  angry: 'bg-red-500',
  surprise: 'bg-purple-500',
  fear: 'bg-indigo-600',
  default: 'bg-gray-500',
};
interface ParticipantState {
  name: string;
  status: 'active_with_video' | 'active_no_video' | 'left';
  lastEmotion?: EmotionData;
}

interface LiveEmotionCardProps {
  data: ParticipantState;
}

const LiveEmotionCard = ({ data }: LiveEmotionCardProps) => {
  if (data.status === 'active_no_video') {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center border-2 border-dashed border-gray-300">
        <i className="ri-camera-off-line text-5xl text-gray-400 mb-4"></i>
        <h3 className="font-bold text-lg text-gray-800">{data.name}</h3>
        <p className="text-gray-500">Cámara Apagada</p>
      </div>
    );
  }

  if (data.status === 'left') {
    return (
      <div className="bg-gray-100 rounded-xl shadow-sm p-6 text-center opacity-60">
        <i className="ri-logout-box-r-line text-5xl text-gray-400 mb-4"></i>
        <h3 className="font-bold text-lg text-gray-600">{data.name}</h3>
        <p className="text-gray-500">Abandonó la sesión</p>
      </div>
    );
  }

  if (data.status === 'active_with_video' && !data.lastEmotion) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center animate-pulse">
        <i className="ri-vidicon-line text-5xl text-blue-400 mb-4"></i>
        <h3 className="font-bold text-lg text-gray-800">{data.name}</h3>
        <p className="text-blue-600 font-medium mt-2">Analizando...</p>
      </div>
    );
  }
  const { primary_emotion, primary_confidence, timestamp } = data.lastEmotion!;
  const emoji =
    emotionToEmoji[primary_emotion.toLowerCase()] || emotionToEmoji.default;
  const color =
    emotionToColor[primary_emotion.toLowerCase()] || emotionToColor.default;
  const confidencePercent = Math.round(primary_confidence * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-l-4 border-green-500">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-600">EN VIVO</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">{data.name}</h3>
        <span className="text-5xl">{emoji}</span>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-semibold text-xl capitalize text-gray-700">
            {primary_emotion}
          </span>
          <span className="font-mono text-lg text-gray-600">
            {confidencePercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`${color} h-4 rounded-full`}
            style={{ width: `${confidencePercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LiveEmotionCard;
