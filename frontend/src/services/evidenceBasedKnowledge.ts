export interface ScientificReference {
  author: string;
  title: string;
  year: number;
  journal?: string;
  doi?: string;
  key_concept: string;
}

export interface EmotionKnowledge {
  definition: string;
  author_reference: ScientificReference;
  thresholds: Record<
    string,
    {
      min: number;
      max: number;
      interpretation: string;
      clinical_significance: string;
      color: string;
      icon: string;
    }
  >;
  clinical_notes: string[];
  related_concepts: string[];
}

export interface PatternKnowledge {
  name: string;
  condition: (emotions: any[]) => boolean;
  interpretation: string;
  scientific_basis: string;
  references: ScientificReference[];
  clinical_relevance: string;
}

export const SCIENTIFIC_REFERENCES: Record<string, ScientificReference> = {
  diener_wellbeing: {
    author: 'Ed Diener',
    title: 'Subjective Well-Being',
    year: 1984,
    journal: 'Psychological Bulletin',
    key_concept:
      'Bienestar subjetivo como balance entre afectos positivos y negativos',
  },
  ekman_basic_emotions: {
    author: 'Paul Ekman',
    title: 'An argument for basic emotions',
    year: 1992,
    key_concept:
      'Emociones básicas universales con expresiones faciales específicas',
  },
  ekman_emotions_revealed: {
    author: 'Paul Ekman',
    title: 'Emotions Revealed',
    year: 2003,
    key_concept: 'Tristeza como respuesta adaptativa a pérdida y desapego',
  },
  barrett_constructed: {
    author: 'Lisa Feldman Barrett',
    title: 'How Emotions Are Made',
    year: 2017,
    key_concept: 'Emociones como construcciones culturales y experienciales',
  },
  gross_regulation: {
    author: 'James Gross',
    title: 'Emotion Regulation: Conceptual and Empirical Foundations',
    year: 2015,
    key_concept: 'Regulación emocional y gestión de la intensidad emocional',
  },
  ledoux_fear: {
    author: 'Joseph LeDoux',
    title: 'The Emotional Brain',
    year: 2000,
    key_concept: 'Circuitos neurales del miedo y respuesta a amenazas',
  },
  scherer_appraisal: {
    author: 'Klaus Scherer',
    title: 'What are emotions? And how can they be measured?',
    year: 2005,
    key_concept: 'Sorpresa como respuesta breve a eventos inesperados',
  },
};

export const EVIDENCE_BASED_KNOWLEDGE: Record<string, EmotionKnowledge> = {
  happiness: {
    definition:
      'Estado afectivo positivo que refleja bienestar subjetivo, caracterizado por la prevalencia de emociones positivas sobre negativas y satisfacción con la vida.',
    author_reference: SCIENTIFIC_REFERENCES.diener_wellbeing,
    thresholds: {
      very_high: {
        min: 80,
        max: 100,
        interpretation: 'Nivel muy alto de bienestar subjetivo',
        clinical_significance:
          'Indicador de excelente bienestar emocional según teoría de Diener. Asociado con buena salud mental y funcionamiento social.',
        color: 'green',
        icon: 'ri-emotion-happy-fill',
      },
      high: {
        min: 60,
        max: 79,
        interpretation: 'Alto nivel de bienestar subjetivo',
        clinical_significance:
          'Buen balance entre afectos positivos y negativos. Indicador de adaptación psicológica saludable.',
        color: 'emerald',
        icon: 'ri-emotion-happy-line',
      },
      moderate: {
        min: 30,
        max: 59,
        interpretation: 'Bienestar subjetivo moderado',
        clinical_significance:
          'Nivel promedio de felicidad. Explorar factores que podrían incrementar la satisfacción vital.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      low: {
        min: 0,
        max: 29,
        interpretation: 'Bajo bienestar subjetivo',
        clinical_significance:
          'Predominio de afectos negativos sobre positivos. Podría indicar riesgo de malestar psicológico.',
        color: 'orange',
        icon: 'ri-emotion-normal-line',
      },
    },
    clinical_notes: [
      'Según Diener (1984), la felicidad incluye componentes cognitivos (satisfacción vital) y afectivos (balance emocional).',
      'La persistencia de felicidad >60% se asocia con mejor salud física y longevidad.',
    ],
    related_concepts: [
      'Bienestar subjetivo',
      'Afectos positivos',
      'Satisfacción vital',
    ],
  },

  sadness: {
    definition:
      'Emoción básica caracterizada por dolor emocional, pérdida, desesperanza y retraimiento social. Respuesta adaptativa que puede facilitar el apoyo social.',
    author_reference: SCIENTIFIC_REFERENCES.ekman_emotions_revealed,
    thresholds: {
      severe: {
        min: 70,
        max: 100,
        interpretation: 'Tristeza severa con potencial significado clínico',
        clinical_significance:
          'Según Ekman, niveles prolongados pueden indicar duelo patológico o síntomas depresivos. Requiere evaluación profesional.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        min: 50,
        max: 69,
        interpretation: 'Tristeza elevada que requiere atención',
        clinical_significance:
          'Posible indicador de estado depresivo o duelo. Evaluar duración y contexto según criterios de Ekman.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        min: 25,
        max: 49,
        interpretation: 'Tristeza moderada dentro de rangos adaptativos',
        clinical_significance:
          'Respuesta emocional normal según teoría de emociones básicas. Explorar factores desencadenantes.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      normal: {
        min: 0,
        max: 24,
        interpretation: 'Nivel normal de tristeza',
        clinical_significance:
          'Presencia adaptativa de tristeza como parte del espectro emocional humano normal.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'Ekman (2003) enfatiza que la tristeza facilita la búsqueda de apoyo social como función adaptativa.',
      'La combinación de alta tristeza (>50%) con baja felicidad (<10%) puede sugerir anhedonia.',
    ],
    related_concepts: ['Duelo', 'Depresión', 'Anhedonia', 'Apoyo social'],
  },

  anger: {
    definition:
      'Respuesta emocional a la percepción de injusticia, frustración o amenaza. Su regulación adecuada es crucial para el funcionamiento social.',
    author_reference: SCIENTIFIC_REFERENCES.gross_regulation,
    thresholds: {
      severe: {
        min: 70,
        max: 100,
        interpretation: 'Ira severa con riesgo de desregulación emocional',
        clinical_significance:
          'Según Gross, indica dificultades significativas en regulación emocional. Riesgo de consecuencias interpersonales y sociales.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        min: 45,
        max: 69,
        interpretation: 'Ira elevada que requiere estrategias de regulación',
        clinical_significance:
          'Nivel que sugiere necesidad de desarrollar estrategias de manejo emocional según modelo de Gross.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        min: 20,
        max: 44,
        interpretation: 'Ira moderada dentro de rangos normales',
        clinical_significance:
          'Respuesta emocional adaptativa a estresores. Identificar desencadenantes específicos.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      normal: {
        min: 0,
        max: 19,
        interpretation: 'Nivel normal de frustración',
        clinical_significance:
          'Expresión saludable de frustración o desacuerdo. Indicador de regulación emocional adecuada.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'Gross (2015) señala que la regulación exitosa del enojo predice mejor funcionamiento social.',
      'La ira persistente >45% puede indicar necesidad de intervención en regulación emocional.',
    ],
    related_concepts: [
      'Regulación emocional',
      'Frustración',
      'Injusticia percibida',
      'Control de impulsos',
    ],
  },

  fear: {
    definition:
      'Respuesta emocional a amenaza percibida que activa mecanismos de defensa y supervivencia a través de circuitos neurales específicos.',
    author_reference: SCIENTIFIC_REFERENCES.ledoux_fear,
    thresholds: {
      severe: {
        min: 65,
        max: 100,
        interpretation: 'Miedo severo con posible significado patológico',
        clinical_significance:
          'Según LeDoux, activación excesiva de circuitos de miedo puede indicar trastorno de ansiedad o fobia específica.',
        color: 'red',
        icon: 'ri-alert-fill',
      },
      high: {
        min: 40,
        max: 64,
        interpretation: 'Miedo elevado que requiere evaluación',
        clinical_significance:
          'Respuesta de ansiedad significativa. Evaluar si corresponde a amenaza real o percibida según modelo de LeDoux.',
        color: 'orange',
        icon: 'ri-error-warning-fill',
      },
      moderate: {
        min: 15,
        max: 39,
        interpretation: 'Miedo moderado adaptativo',
        clinical_significance:
          'Activación normal de sistemas de alerta. Respuesta adaptativa a situaciones de incertidumbre.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      normal: {
        min: 0,
        max: 14,
        interpretation: 'Nivel normal de aprensión',
        clinical_significance:
          'Funcionamiento adecuado de sistemas de detección de amenazas según neurociencia del miedo.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'LeDoux (2000) identifica la amígdala como centro clave en el procesamiento del miedo.',
      'Miedo persistente >40% sin amenaza objetiva puede sugerir hiperactivación del sistema de alarma.',
    ],
    related_concepts: [
      'Ansiedad',
      'Fobia',
      'Amígdala',
      'Respuesta de supervivencia',
    ],
  },

  surprise: {
    definition:
      'Emoción breve y automática ante eventos inesperados que facilita la atención y el procesamiento de información nueva.',
    author_reference: SCIENTIFIC_REFERENCES.scherer_appraisal,
    thresholds: {
      very_high: {
        min: 60,
        max: 100,
        interpretation: 'Sorpresa muy elevada o constante',
        clinical_significance:
          'Según Scherer, niveles muy altos pueden indicar dificultades en predicción o adaptación a cambios.',
        color: 'purple',
        icon: 'ri-emotion-2-fill',
      },
      high: {
        min: 30,
        max: 59,
        interpretation: 'Sorpresa elevada',
        clinical_significance:
          'Respuesta adaptativa a novedad. Facilita procesamiento de información inesperada según modelo de Scherer.',
        color: 'blue',
        icon: 'ri-emotion-2-line',
      },
      moderate: {
        min: 10,
        max: 29,
        interpretation: 'Sorpresa moderada y adaptativa',
        clinical_significance:
          'Funcionamiento normal de sistemas de detección de novedad y cambio.',
        color: 'cyan',
        icon: 'ri-information-fill',
      },
      low: {
        min: 0,
        max: 9,
        interpretation: 'Baja sorpresa',
        clinical_significance:
          'Entorno predecible o alta capacidad de anticipación. Indicador de estabilidad contextual.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'Scherer (2005) enfatiza que la sorpresa carece de valencia emocional intrínseca.',
      'La sorpresa facilita la reorientación atencional hacia estímulos relevantes.',
    ],
    related_concepts: [
      'Atención',
      'Novedad',
      'Procesamiento cognitivo',
      'Adaptación',
    ],
  },

  disgust: {
    definition:
      'Emoción básica con función protectora para evitar contaminantes o amenazas, expresada universalmente mediante gestos faciales específicos.',
    author_reference: SCIENTIFIC_REFERENCES.ekman_basic_emotions,
    thresholds: {
      very_high: {
        min: 50,
        max: 100,
        interpretation: 'Disgusto muy elevado',
        clinical_significance:
          'Según Ekman, niveles altos pueden indicar hipersensibilidad a estímulos o posible contaminación percibida.',
        color: 'green',
        icon: 'ri-emotion-unhappy-fill',
      },
      high: {
        min: 25,
        max: 49,
        interpretation: 'Disgusto elevado',
        clinical_significance:
          'Respuesta protectora activa. Evaluar fuentes de aversión según teoría de emociones básicas.',
        color: 'lime',
        icon: 'ri-emotion-unhappy-line',
      },
      moderate: {
        min: 10,
        max: 24,
        interpretation: 'Disgusto moderado y adaptativo',
        clinical_significance:
          'Funcionamiento normal de mecanismos de protección contra amenazas ambientales.',
        color: 'yellow',
        icon: 'ri-information-fill',
      },
      low: {
        min: 0,
        max: 9,
        interpretation: 'Disgusto mínimo',
        clinical_significance:
          'Baja activación de sistemas de aversión. Entorno percibido como seguro y aceptable.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'Ekman (1992) identifica el disgusto como universal con función evolutiva de supervivencia.',
      'La expresión facial del disgusto es reconocible transculturalmente.',
    ],
    related_concepts: [
      'Aversión',
      'Protección',
      'Contaminación',
      'Supervivencia',
    ],
  },

  neutral: {
    definition:
      'Estado de baja activación emocional que puede reflejar calma, equilibrio emocional, o en casos extremos, supresión emocional.',
    author_reference: SCIENTIFIC_REFERENCES.barrett_constructed,
    thresholds: {
      very_high: {
        min: 85,
        max: 100,
        interpretation: 'Neutralidad extrema',
        clinical_significance:
          'Según Barrett, puede indicar supresión emocional o alexitimia. Requiere evaluación de expresión emocional.',
        color: 'red',
        icon: 'ri-emotion-normal-fill',
      },
      high: {
        min: 60,
        max: 84,
        interpretation: 'Alta neutralidad emocional',
        clinical_significance:
          'Estabilidad emocional o posible evitación emocional. Evaluar contexto según teoría construida de emociones.',
        color: 'blue',
        icon: 'ri-emotion-normal-line',
      },
      moderate: {
        min: 30,
        max: 59,
        interpretation: 'Neutralidad equilibrada',
        clinical_significance:
          'Balance emocional saludable. Indicador de regulación emocional efectiva.',
        color: 'green',
        icon: 'ri-information-fill',
      },
      low: {
        min: 0,
        max: 29,
        interpretation: 'Baja neutralidad',
        clinical_significance:
          'Alta reactividad emocional. Activación frecuente de sistemas emocionales específicos.',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
      },
    },
    clinical_notes: [
      'Barrett (2017) sugiere que la neutralidad extrema puede indicar dificultades en construcción emocional.',
      'La neutralidad moderada indica capacidad de regulación emocional efectiva.',
    ],
    related_concepts: [
      'Regulación emocional',
      'Alexitimia',
      'Supresión emocional',
      'Equilibrio',
    ],
  },
};

export const EVIDENCE_BASED_PATTERNS: Record<string, PatternKnowledge> = {
  depression_pattern: {
    name: 'Patrón Depresivo Potencial',
    condition: (emotions: any[]) => {
      const sadness =
        emotions.find((e) => e.name.toLowerCase().includes('tristeza'))
          ?.percentage || 0;
      const happiness =
        emotions.find((e) => e.name.toLowerCase().includes('felicidad'))
          ?.percentage || 0;
      const neutral =
        emotions.find((e) => e.name.toLowerCase().includes('neutral'))
          ?.percentage || 0;

      return sadness > 50 && happiness < 15 && neutral < 30;
    },
    interpretation:
      'Predominio significativo de tristeza con ausencia notable de emociones positivas',
    scientific_basis:
      'Basado en criterios de Ekman (2003) sobre tristeza patológica y teoría de Diener (1984) sobre desequilibrio afectivo',
    references: [
      SCIENTIFIC_REFERENCES.ekman_emotions_revealed,
      SCIENTIFIC_REFERENCES.diener_wellbeing,
    ],
    clinical_relevance:
      'Este patrón puede indicar riesgo de episodio depresivo. La combinación de alta tristeza con baja felicidad sugiere anhedonia según literatura clínica.',
  },

  anxiety_pattern: {
    name: 'Patrón de Ansiedad Elevada',
    condition: (emotions: any[]) => {
      const fear =
        emotions.find((e) => e.name.toLowerCase().includes('miedo'))
          ?.percentage || 0;
      const surprise =
        emotions.find((e) => e.name.toLowerCase().includes('sorpresa'))
          ?.percentage || 0;
      const neutral =
        emotions.find((e) => e.name.toLowerCase().includes('neutral'))
          ?.percentage || 0;

      return fear > 40 && (surprise > 30 || neutral < 20);
    },
    interpretation:
      'Activación persistente de sistemas de alerta y detección de amenazas',
    scientific_basis:
      'Fundamentado en investigación de LeDoux (2000) sobre circuitos de miedo y hiperactivación de la amígdala',
    references: [SCIENTIFIC_REFERENCES.ledoux_fear],
    clinical_relevance:
      'La hiperactivación de sistemas de miedo puede indicar trastorno de ansiedad generalizada o fobia específica según neurociencia emocional.',
  },

  emotional_dysregulation: {
    name: 'Desregulación Emocional Potencial',
    condition: (emotions: any[]) => {
      const anger =
        emotions.find((e) => e.name.toLowerCase().includes('enojo'))
          ?.percentage || 0;
      const fear =
        emotions.find((e) => e.name.toLowerCase().includes('miedo'))
          ?.percentage || 0;
      const sadness =
        emotions.find((e) => e.name.toLowerCase().includes('tristeza'))
          ?.percentage || 0;

      const negativeSum = anger + fear + sadness;
      return negativeSum > 70 && anger > 45;
    },
    interpretation:
      'Dificultades significativas en regulación de emociones negativas',
    scientific_basis:
      'Basado en modelo de regulación emocional de Gross (2015) sobre manejo de intensidad emocional',
    references: [SCIENTIFIC_REFERENCES.gross_regulation],
    clinical_relevance:
      'Indica necesidad de desarrollo de estrategias de regulación emocional según literatura de psicología clínica.',
  },

  emotional_blunting: {
    name: 'Posible Embotamiento Emocional',
    condition: (emotions: any[]) => {
      const neutral =
        emotions.find((e) => e.name.toLowerCase().includes('neutral'))
          ?.percentage || 0;
      const totalEmotional = emotions.reduce(
        (sum, e) =>
          !e.name.toLowerCase().includes('neutral') ? sum + e.percentage : sum,
        0
      );

      return neutral > 80 && totalEmotional < 20;
    },
    interpretation: 'Supresión significativa de la expresión emocional',
    scientific_basis:
      'Relacionado con conceptos de Barrett (2017) sobre construcción emocional y alexitimia',
    references: [SCIENTIFIC_REFERENCES.barrett_constructed],
    clinical_relevance:
      'Puede indicar alexitimia o supresión emocional defensiva que requiere exploración terapéutica.',
  },
};

export const BIBLIOGRAPHY = {
  primary_sources: Object.values(SCIENTIFIC_REFERENCES),

  getFormattedBibliography: () => {
    return Object.values(SCIENTIFIC_REFERENCES)
      .map((ref) => {
        const journal = ref.journal ? `, ${ref.journal}` : '';
        const doi = ref.doi ? `, DOI: ${ref.doi}` : '';
        return `${ref.author} (${ref.year}). ${ref.title}${journal}${doi}`;
      })
      .sort((a, b) => {
        const yearA = parseInt(a.match(/\((\d{4})\)/)?.[1] || '0');
        const yearB = parseInt(b.match(/\((\d{4})\)/)?.[1] || '0');
        return yearA - yearB;
      });
  },

  getReferencesForEmotion: (emotion: string): ScientificReference[] => {
    const emotionKnowledge = EVIDENCE_BASED_KNOWLEDGE[emotion.toLowerCase()];
    if (!emotionKnowledge) return [];

    return [emotionKnowledge.author_reference];
  },

  getReferencesForPattern: (patternName: string): ScientificReference[] => {
    const pattern = Object.values(EVIDENCE_BASED_PATTERNS).find(
      (p) => p.name === patternName
    );
    return pattern?.references || [];
  },
};
