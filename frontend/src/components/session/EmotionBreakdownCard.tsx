'use client';
import { EMOTION_DATA } from "@/lib/constant";

interface EmotionBreakdownCardProps {
  emotionTypeId: number;
  percentage: number;
}

const EmotionBreakdownCard = ({ emotionTypeId, percentage }: EmotionBreakdownCardProps) => {
  const emotion = EMOTION_DATA[emotionTypeId];
  if (!emotion) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center mb-3">
        <i className={`${emotion.icon} text-2xl mr-3`} style={{ color: emotion.color }}></i>
        <span className="font-bold text-lg text-gray-800">{emotion.name}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="w-full bg-gray-200 rounded-full h-3 mr-4">
          <div
            className="h-3 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: emotion.color }}
          ></div>
        </div>
        <span className="font-semibold text-gray-900">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default EmotionBreakdownCard;