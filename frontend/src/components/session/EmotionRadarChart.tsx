'use client';

import ReactECharts from 'echarts-for-react';
import { AggregatedEmotionMetric } from '@/types/sessionTypes';
import { EMOTION_DATA } from '@/lib/constant';

const EmotionRadarChart = ({
  emotions,
}: {
  emotions: AggregatedEmotionMetric[];
}) => {
  const emotionSchema = Object.entries(EMOTION_DATA).map(([id, data]) => ({
    name: data.name,
    max: 100,
    id: parseInt(id),
  }));

  const radarData = emotionSchema.map((schemaItem) => {
    const emotionData = emotions.find(
      (e) => e.emotion_type_id === schemaItem.id
    );
    return parseFloat(emotionData?.average_percentage || '0');
  });

  const option = {
    tooltip: {
      trigger: 'item',
    },
    radar: {
      indicator: emotionSchema.map((item) => ({
        name: item.name,
        max: item.max,
      })),
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
