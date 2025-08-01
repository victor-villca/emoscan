interface SummaryEmotionCardProps {
  icon: string;
  name: string;
  percentage: number;
  color: string;
}

const colorMap: Record<string, string> = {
  'text-green-500': '#10b981',
  'text-blue-500': '#3b82f6',
  'text-gray-500': '#6b7280',
  'text-red-500': '#ef4444',
  'text-amber-500': '#f59e0b',
  'text-indigo-500': '#6366f1',
};

const SummaryEmotionCard = ({
  icon,
  name,
  percentage,
  color,
}: SummaryEmotionCardProps) => {
  const barColor = colorMap[color] || '#6b7280';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
      <div className="flex items-center text-gray-500 mb-2">
        <i className={`${icon} mr-2`}></i>
        <span className="font-semibold text-sm">{name}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold text-gray-800">
          {percentage.toFixed(1)}%
        </span>
        <div className="w-1/2 bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: barColor,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SummaryEmotionCard;
