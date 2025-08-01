import ReactECharts from 'echarts-for-react';
import { AggregatedEmotionMetric } from '@/types/sessionTypes';

const emotionTypes: Record<number, { name: string; color: string }> = {
  1: { name: 'Happy', color: '#34D399' },
  2: { name: 'Sadness', color: '#60A5FA' },
  3: { name: 'Neutral', color: '#9CA3AF' },
  4: { name: 'Angry', color: '#F87171' },
  5: { name: 'Surprise', color: '#FBBF24' },
  6: { name: 'Fear', color: '#818CF8' },
};

const EmotionPieChart = ({
  emotions,
}: {
  emotions: AggregatedEmotionMetric[];
}) => {
  const pieData = emotions.map((emotion) => ({
    value: parseFloat(emotion.average_percentage),
    name: emotionTypes[emotion.emotion_type_id]?.name || 'Unknown',
    itemStyle: {
      color: emotionTypes[emotion.emotion_type_id]?.color || '#ccc',
    },
  }));

  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
    },
    series: [
      {
        name: 'Emotion Distribution',
        type: 'pie',
        radius: ['50%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: false } },
        data: pieData,
      },
    ],
  };
  return <ReactECharts option={option} style={{ height: '320px' }} />;
};

export default EmotionPieChart;
