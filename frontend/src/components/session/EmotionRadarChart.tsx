'use client';

import ReactECharts from 'echarts-for-react';
import { AggregatedEmotionMetric } from '@/types/sessionTypes';

const emotionSchema = [
  { name: 'Happy', max: 100, id: 1 },
  { name: 'Sadness', max: 100, id: 2 },
  { name: 'Neutral', max: 100, id: 3 },
  { name: 'Angry', max: 100, id: 4 },
  { name: 'Surprise', max: 100, id: 5 },
  { name: 'Fear', max: 100, id: 6 },
];

const EmotionRadarChart = ({ emotions }: { emotions: AggregatedEmotionMetric[] }) => {
  const radarData = emotionSchema.map(schemaItem => {
    const emotionData = emotions.find(e => e.emotion_type_id === schemaItem.id);
    return parseFloat(emotionData?.average_percentage || '0');
  });

  const option = {
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: emotionSchema.map(item => ({ name: item.name, max: item.max })),
      radius: '70%',
      name: {
        textStyle: {
          color: '#374151',
          fontSize: 14,
        },
      },
    },
    series: [
      {
        name: 'Perfil Emocional',
        type: 'radar',
        data: [
          {
            value: radarData,
            name: 'Promedio de Emociones',
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.4)',
            },
            lineStyle: {
              color: 'rgba(59, 130, 246, 0.8)',
            },
            itemStyle: {
              color: '#3B82F6',
            },
          },
        ],
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '400px' }} />;
};

export default EmotionRadarChart;