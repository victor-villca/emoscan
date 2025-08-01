import ReactECharts from 'echarts-for-react';
import { TimelineEntry } from '@/types/sessionTypes';

const emotionTypes: Record<number, { name: string; color: string }> = {
  1: { name: 'Happy', color: '#34D399' },
  2: { name: 'Sadness', color: '#60A5FA' },
  3: { name: 'Neutral', color: '#9CA3AF' },
  4: { name: 'Angry', color: '#F87171' },
  5: { name: 'Surprise', color: '#FBBF24' },
  6: { name: 'Fear', color: '#818CF8' },
};

const EmotionTimelineChart = ({ timeline }: { timeline: TimelineEntry[] }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0].data;
        return `
          Time: ${new Date(data.value[0]).toLocaleTimeString()}<br/>
          Emotion: <strong>${data.emotionName}</strong>
        `;
      }
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    },
    yAxis: {
      type: 'category',
      data: Object.values(emotionTypes).map(e => e.name),
      inverse: true,
    },
    series: [{
      type: 'line',
      symbolSize: 10,
      data: timeline.map(entry => ({
        value: [new Date(entry.timestamp).getTime(), emotionTypes[entry.primary_emotion_id]?.name || 'Unknown'],
        emotionName: emotionTypes[entry.primary_emotion_id]?.name || 'Unknown',
        itemStyle: {
          color: emotionTypes[entry.primary_emotion_id]?.color || '#ccc',
        },
      })),
      lineStyle: {
        color: '#E5E7EB',
        width: 2,
      },
      emphasis: {
        itemStyle: {
          borderColor: 'rgba(0,0,0,0.2)',
          borderWidth: 2,
        }
      }
    }],
    grid: {
      left: '10%',
      right: '5%',
      bottom: '10%',
    },
  };

  return <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />;
};

export default EmotionTimelineChart;