interface EmotionKnowledge {
  thresholds: Record<
    string,
    { max: number; interpretation: string; color: string; icon: string }
  >;
  clinicalNotes: string[];
}

export const CLINICAL_KNOWLEDGE: Record<string, EmotionKnowledge> = {
  sadness: {
    thresholds: {
      severe: {
        max: 100,
        interpretation:
          'Nivel severo que sugiere una angustia significativa. Requiere atención clínica prioritaria.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        max: 70,
        interpretation:
          'Nivel alto, indicativo de un posible estado depresivo o de duelo.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        max: 50,
        interpretation:
          'Tristeza moderada. Explorar el contexto y los factores desencadenantes.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      low: {
        max: 100,
        interpretation: 'Presencia normal de tristeza.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinicalNotes: [
      'La persistencia de tristeza por encima del 50% puede ser un indicador de síntomas depresivos.',
      'Observar si la tristeza se combina con una baja expresión de felicidad, lo que podría sugerir anhedonia.',
    ],
  },
  angry: {
    thresholds: {
      severe: {
        max: 100,
        interpretation:
          'Nivel severo que indica un riesgo de desregulación emocional.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        max: 60,
        interpretation:
          'Nivel alto que sugiere dificultades en la gestión de la ira.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        max: 40,
        interpretation:
          'Ira moderada. Identificar los posibles factores estresantes.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      low: {
        max: 100,
        interpretation: 'Expresión normal de frustración o enfado.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinicalNotes: [],
  },
  fear: {
    thresholds: {
      severe: {
        max: 100,
        interpretation:
          'Nivel severo de miedo, posible indicador de un trastorno de ansiedad.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        max: 60,
        interpretation:
          'Nivel alto que sugiere una respuesta de ansiedad significativa.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        max: 40,
        interpretation:
          'Ansiedad moderada. Explorar pensamientos y situaciones asociadas.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      low: {
        max: 100,
        interpretation: 'Nivel normal de aprensión o miedo.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinicalNotes: [],
  },
  neutral: {
    thresholds: {
      high: {
        max: 100,
        interpretation:
          'Neutralidad predominante. Puede indicar calma, pero si es extrema (>85%), podría sugerir supresión emocional o alexitimia.',
        color: 'gray',
        icon: 'ri-information-fill',
      },
    },
    clinicalNotes: [],
  },
};

export const PATTERNS = {
  high_negative_low_positive: {
    condition: (emotions: any[]) => {
      const negativeSum = emotions
        .filter((e) =>
          ['Tristeza', 'Enojo', 'Miedo', 'Disgusto'].includes(e.name)
        )
        .reduce((sum, e) => sum + e.percentage, 0);
      const positiveSum = emotions
        .filter((e) => e.name === 'Felicidad')
        .reduce((sum, e) => sum + e.percentage, 0);
      return negativeSum > 60 && positiveSum < 10;
    },
    interpretation: 'Patrón de Alta Activación Negativa',
    clinicalRelevance:
      'Este patrón, donde las emociones negativas (tristeza, ira, miedo) predominan significativamente sobre las positivas, puede ser un indicador de un posible trastorno del estado de ánimo. Se recomienda una exploración más profunda.',
  },
};
