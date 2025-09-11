'use client';
import ReactECharts from 'echarts-for-react';
import { TimelineEntry } from '@/types/sessionTypes';
import { EMOTION_DATA } from '@/lib/constant';

interface EmotionDurationChartProps {
  timeline: TimelineEntry[];
  sessionStartTime: string;
  sessionEndTime: string;
}

const EmotionDurationChart = ({
  timeline,
  sessionStartTime,
  sessionEndTime,
}: EmotionDurationChartProps) => {
  const chartData = timeline.map((entry, index) => {
    const emotion = EMOTION_DATA[entry.primary_emotion_id];
    const startTime = new Date(entry.timestamp).getTime();
    const endTime = timeline[index + 1]
      ? new Date(timeline[index + 1].timestamp).getTime()
      : new Date(sessionEndTime).getTime();

    return {
      name: emotion.name,
      value: [0, startTime, endTime, endTime - startTime],
      itemStyle: {
        color: emotion.color,
      },
    };
  });

  const option = {
    tooltip: {
      formatter: (params: any) => {
        const durationMs = params.value[3];
        const durationSec = Math.round(durationMs / 1000);
        const minutes = Math.floor(durationSec / 60);
        const seconds = durationSec % 60;
        return `${params.marker} ${params.name}: ${minutes}m ${seconds}s`;
      },
    },
    xAxis: {
      type: 'time',
      min: new Date(sessionStartTime).getTime(),
      max: new Date(sessionEndTime).getTime(),
    },
    yAxis: { show: false },
    series: [
      {
        type: 'custom',
        renderItem: (params: any, api: any) => {
          const start = api.coord([api.value(1), 0]);
          const end = api.coord([api.value(2), 0]);
          const height = api.size([0, 1])[1] * 0.6;

          return {
            type: 'rect',
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height,
              r: [5, 5, 5, 5],
            },
            style: api.style(),
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: chartData,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '100px' }} />;
};

export default EmotionDurationChart;
