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

const LiveEmotionCard = ({ data }: { data: EmotionData }) => {
  const emoji =
    emotionToEmoji[data.primary_emotion.toLowerCase()] ||
    emotionToEmoji.default;
  const color =
    emotionToColor[data.primary_emotion.toLowerCase()] ||
    emotionToColor.default;
  const confidencePercent = Math.round(data.primary_confidence * 100);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          {data.participantName}
        </h3>
        <span className="text-5xl">{emoji}</span>
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-semibold text-xl capitalize text-gray-700">
            {data.primary_emotion}
          </span>
          <span className="font-mono text-lg text-gray-600">
            {confidencePercent}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`${color} h-4 rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${confidencePercent}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-gray-400 mt-2">
          Last update: {new Date(data.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default LiveEmotionCard;
