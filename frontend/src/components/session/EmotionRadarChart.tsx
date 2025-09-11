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
    color: data.color,
  }));

  const radarData = emotionSchema.map((schemaItem) => {
    const emotionData = emotions.find(
      (e) => e.emotion_type_id === schemaItem.id
    );
    return parseFloat(emotionData?.average_percentage || '0');
  });

  const maxValue = Math.max(...radarData);
  const dominantEmotionIndex = radarData.indexOf(maxValue);
  const dominantEmotion = emotionSchema[dominantEmotionIndex];

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(31, 41, 55, 0.8)',
      backdropFilter: 'blur(4px)',
      borderColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
      textStyle: {
        color: '#FFFFFF',
        fontSize: 13,
      },
      formatter: (params: any) => {
        const values = params.data.value;

        const content = emotionSchema
          .map((emotion, index) => {
            const percentage = values[index];
            const uiInfo = EMOTION_DATA[emotion.id];

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 6px 0;">
              <div style="display: flex; align-items: center;">
                <i class="${uiInfo.icon}" style="color: ${emotion.color}; margin-right: 8px; font-size: 16px;"></i>
                <span style="color: #E5E7EB;">${emotion.name}</span>
              </div>
              <span style="color: ${emotion.color}; font-weight: bold; font-family: monospace; margin-left: 16px;">
                ${percentage.toFixed(1)}%
              </span>
            </div>
          `;
          })
          .join('');

        return `
          <div style="padding: 8px 12px;">
            <div style="font-weight: bold; color: #FFFFFF; margin-bottom: 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 6px;">
              ${params.seriesName}
            </div>
            ${content}
          </div>
        `;
      },
    },
    radar: {
      indicator: emotionSchema.map((item, index) => ({
        name: item.name,
        max: item.max,
        nameGap: 15,
        nameTextStyle: {
          color: index === dominantEmotionIndex ? item.color : '#6B7280',
          fontSize: 14,
          fontWeight: index === dominantEmotionIndex ? '600' : 'normal',
        },
      })),
      radius: '70%',
      center: ['50%', '55%'],
      startAngle: 90,
      splitNumber: 4,
      shape: 'circle',
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      splitLine: { lineStyle: { color: '#F3F4F6' } },
      splitArea: {
        areaStyle: {
          color: ['rgba(251, 251, 251, 0.3)', 'rgba(245, 245, 245, 0.3)'],
        },
      },
    },
    series: [
      {
        name: 'Huella Emocional',
        type: 'radar',
        data: [
          {
            value: radarData,
            name: 'Perfil Emocional',
            areaStyle: {
              color: 'rgba(59, 130, 246, 0.1)',
            },
            lineStyle: {
              color: '#3B82F6',
              width: 2.5,
            },
            itemStyle: {
              color: '#3B82F6',
              borderColor: 'rgba(255, 255, 255, 0.8)',
              borderWidth: 2,
            },
            emphasis: {
              lineStyle: { width: 4 },
              itemStyle: {
                color: '#1D4ED8',
                borderWidth: 3,
              },
            },
          },
        ],
        animationDuration: 1000,
      },
    ],
  };

  return (
    <div className="relative">
      {dominantEmotion && maxValue > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md px-3 py-2 border border-gray-200">
          <div className="flex items-center space-x-2">
            <i
              className={`${EMOTION_DATA[dominantEmotion.id].icon} text-lg`}
              style={{ color: dominantEmotion.color }}
            ></i>
            <div>
              <p className="text-xs text-gray-500">Dominante</p>
              <p
                className="text-sm font-semibold"
                style={{ color: dominantEmotion.color }}
              >
                {dominantEmotion.name}
              </p>
            </div>
          </div>
        </div>
      )}

      <ReactECharts
        option={option}
        style={{ height: '400px' }}
        opts={{ renderer: 'svg' }}
      />
    </div>
  );
};

export default EmotionRadarChart;
