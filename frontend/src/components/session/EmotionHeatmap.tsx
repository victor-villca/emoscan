'use client';
import React, { useMemo } from 'react';
import { TimelineEntry, EnrichedParticipant } from '@/types/sessionTypes';
import { EMOTION_DATA } from '@/lib/constant';

interface TimeSlot {
  start: Date;
  end: Date;
  label: string;
}

// Definimos un tipo para los elementos del desglose emocional
interface EmotionBreakdownItem {
  name: string;
  count: number;
  percentage: string;
  color: string;
}

// Actualizamos HeatmapCell para que incluya la nueva propiedad
interface HeatmapCell {
  intensity: number;
  dominantEmotion: (typeof EMOTION_DATA)[number] | null;
  emotionEvents: TimelineEntry[];
  emotionBreakdown: EmotionBreakdownItem[];
}

interface EmotionHeatmapProps {
  timeline: TimelineEntry[];
  participants: EnrichedParticipant[];
}

const EmotionHeatmap: React.FC<EmotionHeatmapProps> = ({
  timeline,
  participants,
}) => {
  const heatmapData = useMemo(() => {
    if (!timeline.length || !participants.length) {
      return { participants: [], timeSlots: [], matrix: [] };
    }

    // Calcular la duración real de la sesión a partir de los datos del timeline
    const timestamps = timeline.map((entry) =>
      new Date(entry.timestamp).getTime()
    );
    const startTime = Math.min(...timestamps);
    const endTime = Math.max(...timestamps);
    const durationInMinutes = (endTime - startTime) / (1000 * 60);

    // Determinar el intervalo de tiempo ideal basado en la duración total
    let intervalMinutes: number;
    if (durationInMinutes <= 5) {
      intervalMinutes = 0.5; // 30 segundos para sesiones muy cortas
    } else if (durationInMinutes <= 20) {
      intervalMinutes = 1; // 1 minuto para sesiones cortas
    } else if (durationInMinutes <= 60) {
      intervalMinutes = 2; // 2 minutos para sesiones de duración media
    } else {
      intervalMinutes = 5; // 5 minutos para sesiones largas
    }

    // Crear slots de tiempo (X-axis) usando el intervalo dinámico
    const timeSlots: TimeSlot[] = [];
    const slotDuration = intervalMinutes * 60 * 1000;

    for (let time = startTime; time <= endTime; time += slotDuration) {
      const slotStart = new Date(time);
      const slotEnd = new Date(time + slotDuration);
      timeSlots.push({
        start: slotStart,
        end: slotEnd,
        label: slotStart.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }

    // Crear la matriz de datos para el heatmap
    const matrix: HeatmapCell[][] = participants.map((participant) => {
      return timeSlots.map((slot) => {
        // Encontrar todas las emociones detectadas para este participante en este slot de tiempo
        const emotionsInSlot = timeline.filter(
          (entry) =>
            entry.participant_id === participant.id &&
            new Date(entry.timestamp).getTime() >= slot.start.getTime() &&
            new Date(entry.timestamp).getTime() < slot.end.getTime()
        );

        // Nos aseguramos de que las celdas vacías también cumplan con la interfaz
        if (emotionsInSlot.length === 0) {
          return {
            intensity: 0,
            dominantEmotion: null,
            emotionEvents: [],
            emotionBreakdown: [],
          };
        }

        // Encontrar la emoción dominante (la más frecuente) en el slot
        const emotionCounts = emotionsInSlot.reduce(
          (acc, entry) => {
            acc[entry.primary_emotion_id] =
              (acc[entry.primary_emotion_id] || 0) + 1;
            return acc;
          },
          {} as Record<number, number>
        );

        const dominantEmotionId = parseInt(
          Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0][0]
        );
        const dominantEmotion = EMOTION_DATA[dominantEmotionId] || null;

        // Crear el desglose porcentual de todas las emociones detectadas
        const totalEvents = emotionsInSlot.length;
        const emotionBreakdown = Object.entries(emotionCounts)
          .map(([id, count]) => {
            const emotionInfo = EMOTION_DATA[parseInt(id)];
            return {
              name: emotionInfo.name,
              count: count,
              percentage: ((count / totalEvents) * 100).toFixed(0),
              color: emotionInfo.color,
            };
          })
          .sort((a, b) => b.count - a.count); // Ordenar por el más frecuente

        // Normalizar intensidad basada en el intervalo dinámico
        const intensity = totalEvents / (intervalMinutes * 2);

        return {
          intensity,
          dominantEmotion,
          emotionEvents: emotionsInSlot,
          emotionBreakdown,
        };
      });
    });

    return { participants, timeSlots, matrix };
  }, [timeline, participants]);

  const getHeatmapColor = (cell: HeatmapCell) => {
    if (cell.intensity === 0 || !cell.dominantEmotion) return 'bg-gray-100';

    // Convertir el color HEX a RGB para poder aplicar opacidad
    const color = cell.dominantEmotion.color.slice(1);
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const opacity = Math.min(0.2 + cell.intensity * 0.2, 1.0); // La opacidad aumenta con la intensidad

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  if (!timeline.length || !participants.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Mapa de Calor Emocional
        </h3>
        <div className="text-center py-10 text-gray-500">
          No hay suficientes datos de participantes o de tiempo para generar el
          mapa de calor.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Mapa de Calor Emocional
        </h3>
        <p className="text-gray-600 text-sm">
          Visualización de la emoción dominante por participante a lo largo del
          tiempo. La intensidad del color representa una mayor frecuencia de
          detecciones emocionales.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {Object.values(EMOTION_DATA).map((emotion) => (
          <div key={emotion.name} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: emotion.color }}
            />
            <span className="text-xs text-gray-600">{emotion.name}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto overflow-y-visible">
        <div className="inline-block min-w-full">
          <div className="flex">
            <div className="w-32 flex-shrink-0 text-sm font-medium text-gray-700 py-2 sticky left-0 bg-white z-10">
              Participante
            </div>
            {heatmapData.timeSlots.map((slot, index) => (
              <div
                key={index}
                className="w-20 text-center text-xs text-gray-600 py-2 border-l border-gray-200"
              >
                {slot.label}
              </div>
            ))}
          </div>

          {heatmapData.participants.map((participant, pIndex) => (
            <div key={participant.id} className="flex">
              <div className="w-32 flex-shrink-0 text-sm text-gray-800 py-3 pr-4 font-medium sticky left-0 bg-white z-10">
                {participant.name}
              </div>
              {heatmapData.matrix[pIndex].map((cell, tIndex) => (
                <div
                  key={tIndex}
                  className="w-20 h-12 border border-gray-200 relative group cursor-pointer"
                  style={{ backgroundColor: getHeatmapColor(cell) }}
                  onMouseEnter={(e) => {
                    if (cell.intensity > 0) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const tooltip = e.currentTarget.querySelector(
                        '.tooltip'
                      ) as HTMLElement;
                      if (tooltip) {
                        // Mostrar temporalmente para obtener dimensiones
                        tooltip.style.visibility = 'hidden';
                        tooltip.style.opacity = '1';

                        const tooltipRect = tooltip.getBoundingClientRect();

                        // Calcular posición horizontal centrada
                        let left =
                          rect.left + rect.width / 2 - tooltipRect.width / 2;

                        // Ajustar si se sale por la izquierda
                        if (left < 10) left = 10;

                        // Ajustar si se sale por la derecha
                        if (left + tooltipRect.width > window.innerWidth - 10) {
                          left = window.innerWidth - tooltipRect.width - 10;
                        }

                        // Posición vertical (preferiblemente arriba)
                        let top = rect.top - tooltipRect.height - 8;

                        // Si se sale por arriba, mostrar abajo
                        if (top < 10) {
                          top = rect.bottom + 8;
                        }

                        // Aplicar posición y mostrar
                        tooltip.style.left = `${left}px`;
                        tooltip.style.top = `${top}px`;
                        tooltip.style.visibility = 'visible';
                        tooltip.style.opacity = '0';

                        // Permitir que la transición CSS maneje la aparición
                        requestAnimationFrame(() => {
                          tooltip.style.opacity = '1';
                        });
                      }
                    }
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.querySelector(
                      '.tooltip'
                    ) as HTMLElement;
                    if (tooltip) {
                      tooltip.style.opacity = '0';
                    }
                  }}
                >
                  {cell.intensity > 0 && (
                    <div className="tooltip fixed px-3 py-2 bg-gray-900 bg-opacity-95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl opacity-0 transition-all duration-300 z-50 pointer-events-none min-w-max">
                      <div className="font-semibold mb-2 border-b border-gray-600 pb-1 text-center">
                        <div className="text-blue-200">{participant.name}</div>
                        <div className="text-gray-300 text-[10px]">
                          @ {heatmapData.timeSlots[tIndex].label}
                        </div>
                      </div>
                      <div className="space-y-1 max-w-44">
                        {cell.emotionBreakdown.map((emotion, index) => (
                          <div
                            key={emotion.name}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <div
                                className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: emotion.color }}
                              ></div>
                              <span className="text-gray-100 text-[11px]">
                                {emotion.name}
                              </span>
                            </div>
                            <div className="flex items-center ml-3">
                              <span className="font-mono text-white font-medium text-[11px]">
                                {emotion.percentage}%
                              </span>
                              {index === 0 && (
                                <div className="ml-1 text-yellow-400 text-[8px]">
                                  ★
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-1 border-t border-gray-600 text-center">
                        <span className="text-gray-400 text-[10px]">
                          {cell.emotionEvents.length} detección
                          {cell.emotionEvents.length !== 1 ? 'es' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionHeatmap;
