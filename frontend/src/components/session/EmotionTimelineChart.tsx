import ReactECharts from 'echarts-for-react';
import { TimelineEntry, EnrichedParticipant } from '@/types/sessionTypes';
import { EMOTION_DATA } from '@/lib/constant';

const EmotionTimelineChart = ({ 
  timeline, 
  participants 
}: { 
  timeline: TimelineEntry[]; 
  participants: EnrichedParticipant[];
}) => {
  const participantMap = participants.reduce((acc, participant) => {
    acc[participant.id] = participant.name;
    return acc;
  }, {} as Record<number, string>);
  const processedData = timeline.map((entry, index) => {
    const emotion = EMOTION_DATA[entry.primary_emotion_id];
    const baseY = entry.primary_emotion_id;
    const offset = (index % 3 - 1) * 0.3;
    const yPosition = baseY + offset;
    
    const participantName = participantMap[entry.participant_id] || 'Unknown';
    
    return {
      value: [
        new Date(entry.timestamp).getTime(),
        yPosition
      ],
      emotionId: entry.primary_emotion_id,
      emotionName: emotion?.name || 'Unknown',
      emotionColor: emotion?.color || '#9CA3AF',
      timestamp: entry.timestamp,
      participantName: participantName,
      participantId: entry.participant_id,
      itemStyle: {
        color: emotion?.color || '#9CA3AF',
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 8,
        shadowColor: emotion?.color || '#9CA3AF',
        shadowOffsetY: 2
      }
    };
  });

  const option = {
    backgroundColor: {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 1,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#f8fafc' },
        { offset: 1, color: '#f1f5f9' }
      ]
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b',
        fontSize: 12
      },
      extraCssText: 'backdrop-filter: blur(10px); border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);',
      formatter: (params: any) => {
        const data = params.data;
        const emotion = EMOTION_DATA[data.emotionId];
        
        return `
          <div style="padding: 8px;">
            <div style="display: flex; align-items: center; margin-bottom: 6px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: ${data.emotionColor}; margin-right: 8px;"></div>
              <strong style="color: #1e293b;">${data.emotionName}</strong>
            </div>
            <div style="font-size: 11px; color: #64748b; line-height: 1.4;">
              <div><strong>Tiempo:</strong> ${new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div><strong>Participante:</strong> ${data.participantName}</div>
            </div>
          </div>
        `;
      },
    },
    xAxis: {
      type: 'time',
      axisLabel: {
        formatter: (value: number) =>
          new Date(value).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        color: '#64748b',
        fontSize: 11,
        margin: 8
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
          width: 1
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed',
          width: 1
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0.5,
      max: 6.5,
      interval: 1,
      axisLabel: {
        formatter: (value: number) => {
          const roundedValue = Math.round(value);
          const emotion = EMOTION_DATA[roundedValue];
          return emotion ? emotion.name : '';
        },
        color: '#64748b',
        fontSize: 11,
        rich: {
          emotion: {
            color: '#1e293b',
            fontWeight: 'bold'
          }
        }
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0',
          width: 1
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed',
          width: 1
        }
      }
    },
    series: [
      {
        type: 'line',
        symbolSize: function(value: any, params: any) {
          return Math.max(8, 12 + (params.dataIndex % 3) * 2);
        },
        symbol: 'circle',
        data: processedData,
        lineStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#e2e8f0' },
              { offset: 0.5, color: '#94a3b8' },
              { offset: 1, color: '#e2e8f0' }
            ]
          },
          width: 3,
          cap: 'round',
          join: 'round'
        },
        smooth: 0.3,
        emphasis: {
          focus: 'item',
          scale: true,
          itemStyle: {
            shadowBlur: 15,
            shadowColor: function(params: any) {
              return params.data.emotionColor;
            }
          }
        },
        animation: true,
        animationDuration: 2000,
        animationEasing: 'cubicInOut',
        animationDelay: function (idx: number) {
          return idx * 100;
        }
      }
    ],
    grid: {
      left: '12%',
      right: '5%',
      bottom: '15%',
      top: '5%',
      containLabel: false
    },
    graphic: [
      {
        type: 'group',
        children: Array.from({ length: 15 }, (_, i) => ({
          type: 'circle',
          shape: {
            r: Math.random() * 2 + 1
          },
          style: {
            fill: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, 0.1)`
          },
          position: [
            Math.random() * 600,
            Math.random() * 300
          ],
          animation: {
            duration: 3000 + Math.random() * 2000,
            easing: 'linear',
            loop: true,
            keyframes: [
              {
                percent: 0,
                style: { opacity: 0.1 }
              },
              {
                percent: 50,
                style: { opacity: 0.3 }
              },
              {
                percent: 100,
                style: { opacity: 0.1 }
              }
            ]
          }
        }))
      }
    ]
  };

  return (
    <div className="relative">
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Línea de Tiempo Emocional</h3>
        <p className="text-sm text-gray-600">Evolución de emociones durante la sesión</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
        {Object.values(EMOTION_DATA).map((emotion) => (
          <div key={emotion.name} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: emotion.color }}
            />
            <span className="text-xs font-medium text-gray-700">{emotion.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <ReactECharts 
          option={option} 
          style={{ height: '450px', width: '100%' }}
          opts={{
            renderer: 'svg',
            devicePixelRatio: 2
          }}
        />
      </div>
    </div>
  );
};

export default EmotionTimelineChart;