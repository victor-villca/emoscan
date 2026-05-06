'use client';
import { DynamicArc } from '@/services/interpretation.service';
import { EMOTION_DATA } from '@/lib/constant';

interface EmotionalArcVisualizationProps {
  arc: DynamicArc;
}

export default function EmotionalArcVisualization({
  arc,
}: EmotionalArcVisualizationProps) {
  const { phases, transitions } = arc;

  if (phases.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Progresión de Emociones
        </h3>
        <p className="text-gray-500 text-sm">
          No hay datos disponibles para mostrar la evolución emocional.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
        <h3 className="text-white font-bold text-lg flex items-center">
          <i className="ri-line-chart-line mr-3"></i>
          Progresión de Emociones y Cambios Detectados
        </h3>
        <p className="text-blue-100 text-sm mt-1">
          {phases.length} fases · {transitions.length} transiciones
        </p>
      </div>

      {/* Explicación general */}
      <div className="bg-blue-50 border-b border-blue-100 p-4">
        <p className="text-sm text-blue-900">
          <i className="ri-information-line mr-1"></i>
          <strong>¿Qué muestra este gráfico?</strong> La evolución emocional del participante dividida en 3 momentos: inicio, medio y final de la sesión. 
          Los porcentajes indican qué tanto tiempo estuvo en cada emoción durante esa fase.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Sección de Fases */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
            <i className="ri-flow-chart mr-2 text-blue-600"></i>
            Evolución por Fases
          </h4>
          <p className="text-xs text-gray-600 mb-4">
            Cada fase representa aproximadamente un tercio de la sesión. La emoción dominante es la que más tiempo estuvo presente.
          </p>

          <div className="space-y-3">
            {phases.map((phase, idx) => {
              const emotionColor =
                EMOTION_DATA[phase.dominantEmotion.id]?.color;
              const emotionIcon = EMOTION_DATA[phase.dominantEmotion.id]?.icon;
              const phaseLabel =
                phase.phase === 'inicio'
                  ? '🟢 Inicio'
                  : phase.phase === 'medio'
                    ? '🟡 Medio'
                    : '🔴 Final';

              return (
                <div key={idx}>
                  {/* Conectador entre fases */}
                  {idx < phases.length - 1 && (
                    <div className="flex justify-center mb-2">
                      <i className="ri-arrow-down-line text-gray-300 text-lg"></i>
                    </div>
                  )}

                  {/* Card de fase */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg border-2 border-gray-200 p-4">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      {/* Icono */}
                      <div className="col-span-2">
                        <div className="text-xs font-bold text-gray-500 mb-2">
                          {phaseLabel}
                        </div>
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md"
                          style={{ backgroundColor: emotionColor + '30' }}
                        >
                          <i className={emotionIcon}></i>
                        </div>
                      </div>

                      {/* Información principal */}
                      <div className="col-span-7">
                        <h5 className="font-bold text-gray-900 mb-1">
                          {phase.dominantEmotion.name}
                        </h5>
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-semibold">
                            {phase.dominantEmotion.percentage.toFixed(0)}%
                          </span>{' '}
                          de esta fase
                        </div>

                        {/* Barra de progreso */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${phase.dominantEmotion.percentage}%`,
                              backgroundColor: emotionColor,
                            }}
                          />
                        </div>

                        {/* Emociones secundarias */}
                        {phase.secondaryEmotions.length > 0 && (
                          <>
                            <div className="text-xs text-gray-500 mb-1">
                              También se detectaron:
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {phase.secondaryEmotions.map((secondary) => (
                                <span
                                  key={secondary.id}
                                  className="inline-flex items-center gap-1 text-xs bg-white px-2 py-1 rounded-full border border-gray-200"
                                >
                                  <i
                                    className={
                                      EMOTION_DATA[secondary.id]?.icon
                                    }
                                    style={{
                                      color: EMOTION_DATA[secondary.id]?.color,
                                    }}
                                  ></i>
                                  {secondary.percentage.toFixed(0)}%
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Duración */}
                      <div className="col-span-3 text-right">
                        <div className="text-xs text-gray-500 mb-1">
                          Duración
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {phase.duration_seconds}s
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-200 pt-6"></div>

        {/* Sección de Transiciones */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
            <i className="ri-share-forward-line mr-2 text-green-600"></i>
            Cambios Emocionales Detectados ({transitions.length})
          </h4>
          <p className="text-xs text-gray-600 mb-4">
            Cada cambio representa un momento en que la emoción del participante transitó de una a otra. 
            La frecuencia indica cuántas veces ocurrió ese cambio específico.
          </p>

          {transitions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <i className="ri-emotion-normal-line text-3xl mb-2 opacity-30 block"></i>
              <p className="text-sm font-medium">
                No se registraron cambios emocionales significativos
              </p>
              <p className="text-xs text-gray-500 mt-1">
                El participante mantuvo una emoción estable durante toda la sesión
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transitions.map((trans, idx) => {
                const fromColor = EMOTION_DATA[trans.from_emotion_id]?.color;
                const fromIcon = EMOTION_DATA[trans.from_emotion_id]?.icon;
                const toColor = EMOTION_DATA[trans.to_emotion_id]?.color;
                const toIcon = EMOTION_DATA[trans.to_emotion_id]?.icon;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-green-300 transition-all"
                  >
                    {/* From → To */}
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                      {/* From */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: fromColor + '40' }}
                        >
                          <i
                            className={fromIcon}
                            style={{ fontSize: '12px' }}
                          ></i>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 truncate">
                          {trans.from_emotion_name}
                        </span>
                      </div>

                      {/* Arrow */}
                      <i className="ri-arrow-right-line text-gray-400 text-sm flex-shrink-0"></i>

                      {/* To */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: toColor + '40' }}
                        >
                          <i
                            className={toIcon}
                            style={{ fontSize: '12px' }}
                          ></i>
                        </div>
                        <span className="text-xs font-semibold text-gray-700 truncate">
                          {trans.to_emotion_name}
                        </span>
                      </div>
                    </div>

                    {/* Frequency badges */}
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {trans.frequency}x
                      </div>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {trans.percentage_of_total.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Nota explicativa sobre qué significan los cambios */}
          {transitions.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-900">
                <i className="ri-lightbulb-line mr-1"></i>
                Los cambios frecuentes pueden indicar respuestas emocionales dinámicas. 
                Los cambios entre emociones opuestas (ej: felicidad ↔ tristeza) merecen mayor atención clínica.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}