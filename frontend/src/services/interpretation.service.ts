import {
  AggregatedEmotionMetric,
  TimelineEntry,
  EmotionTransition,
} from '@/types/sessionTypes';
import {
  EVIDENCE_BASED_KNOWLEDGE,
  EVIDENCE_BASED_PATTERNS,
  SCIENTIFIC_REFERENCES,
  BIBLIOGRAPHY,
  ScientificReference,
} from './evidenceBasedKnowledge';
import { EMOTION_DATA } from '@/lib/constant';
import { differenceInSeconds } from 'date-fns';

export interface InterpretedEmotion {
  name: string;
  icon: string;
  percentage: number;
  intensity: {
    level: string;
    color: string;
    icon: string;
    interpretation: string;
    clinical_significance: string;
    scientific_basis: string;
  };
  scientific_reference: ScientificReference;
}

export interface Anomaly {
  type: string;
  name: string;
  interpretation: string;
  scientific_basis: string;
  clinical_relevance: string;
  references: ScientificReference[];
  severity: 'low' | 'moderate' | 'high' | 'severe';
}

export interface EmotionPhase {
  phase: 'inicio' | 'medio' | 'final';
  dominantEmotion: {
    id: number;
    name: string;
    percentage: number;
  };
  secondaryEmotions: Array<{
    id: number;
    name: string;
    percentage: number;
  }>;
  duration_seconds: number;
  startTime: Date;
  endTime: Date;
}

export interface TransitionFrequency {
  from_emotion_id: number;
  to_emotion_id: number;
  from_emotion_name: string;
  to_emotion_name: string;
  frequency: number;
  percentage_of_total: number;
}

export interface EmotionalStability {
  total_transitions: number;
  stability_score: number;
  average_emotion_duration_seconds: number;
  most_common_transition: {
    from: string;
    to: string;
    frequency: number;
  } | null;
  emotional_pattern: 'estable' | 'fluctuante' | 'progresivo' | 'regresivo';
}

export interface DynamicArc {
  phases: EmotionPhase[];
  transitions: TransitionFrequency[];
  stability: EmotionalStability;
  progression: string;
}

export interface InterpretationResult {
  enrichedEmotions: InterpretedEmotion[];
  anomalies: Anomaly[];
  narrativeSummary: string;
  scientificSummary: string;
  dynamicNarrative: string;
  bibliography: string[];
  dynamicArc: DynamicArc;
  metadata: {
    total_references: number;
    primary_theoretical_framework: string;
    interpretation_confidence: 'high' | 'moderate' | 'low';
  };
}

const EMOTION_MAPPING: Record<number, string> = {
  1: 'happiness',
  2: 'sadness',
  3: 'neutral',
  4: 'anger',
  5: 'surprise',
  6: 'fear',
  7: 'disgust',
};

const calculatePhases = (
  timeline: TimelineEntry[],
  transitions: EmotionTransition[]
): EmotionPhase[] => {
  if (!timeline || timeline.length === 0) return [];

  const sortedTimeline = [...timeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstTime = new Date(sortedTimeline[0].timestamp);
  const lastTime = new Date(
    sortedTimeline[sortedTimeline.length - 1].timestamp
  );
  const totalDurationSeconds = differenceInSeconds(lastTime, firstTime);

  const thirdDuration = totalDurationSeconds / 3;

  const phases: EmotionPhase[] = [];

  for (let phaseIdx = 0; phaseIdx < 3; phaseIdx++) {
    const isFirst = phaseIdx === 0;
    const isLast = phaseIdx === 2;

    const phaseStart = new Date(
      firstTime.getTime() + phaseIdx * thirdDuration * 1000
    );
    const phaseEnd = isLast
      ? lastTime
      : new Date(firstTime.getTime() + (phaseIdx + 1) * thirdDuration * 1000);

    const phaseEntries = sortedTimeline.filter((entry) => {
      const entryTime = new Date(entry.timestamp);
      return entryTime >= phaseStart && entryTime <= phaseEnd;
    });

    if (phaseEntries.length === 0) continue;

    const emotionCounts: Record<number, number> = {};
    phaseEntries.forEach((entry) => {
      emotionCounts[entry.primary_emotion_id] =
        (emotionCounts[entry.primary_emotion_id] || 0) + 1;
    });

    const emotionPercentages = Object.entries(emotionCounts).map(
      ([emotionId, count]) => ({
        id: parseInt(emotionId),
        count,
        percentage: (count / phaseEntries.length) * 100,
      })
    );

    emotionPercentages.sort((a, b) => b.percentage - a.percentage);

    const dominant = emotionPercentages[0];
    const secondary = emotionPercentages.slice(1);

    phases.push({
      phase: phaseIdx === 0 ? 'inicio' : phaseIdx === 1 ? 'medio' : 'final',
      dominantEmotion: {
        id: dominant.id,
        name: EMOTION_DATA[dominant.id]?.name || 'Desconocida',
        percentage: dominant.percentage,
      },
      secondaryEmotions: secondary.slice(0, 2).map((e) => ({
        id: e.id,
        name: EMOTION_DATA[e.id]?.name || 'Desconocida',
        percentage: e.percentage,
      })),
      duration_seconds: differenceInSeconds(phaseEnd, phaseStart),
      startTime: phaseStart,
      endTime: phaseEnd,
    });
  }

  return phases;
};

const analyzeTransitions = (
  transitions: EmotionTransition[]
): {
  frequencies: TransitionFrequency[];
  mostCommon: TransitionFrequency | null;
} => {
  if (!transitions || transitions.length === 0) {
    return { frequencies: [], mostCommon: null };
  }

  const transitionMap: Record<string, TransitionFrequency> = {};

  transitions.forEach((t) => {
    const key = `${t.emotion_from_id}->${t.emotion_to_id}`;
    if (!transitionMap[key]) {
      transitionMap[key] = {
        from_emotion_id: t.emotion_from_id,
        to_emotion_id: t.emotion_to_id,
        from_emotion_name:
          EMOTION_DATA[t.emotion_from_id]?.name || 'Desconocida',
        to_emotion_name: EMOTION_DATA[t.emotion_to_id]?.name || 'Desconocida',
        frequency: 0,
        percentage_of_total: 0,
      };
    }
    transitionMap[key].frequency += 1;
  });

  const frequencies = Object.values(transitionMap);
  frequencies.forEach((f) => {
    f.percentage_of_total = (f.frequency / transitions.length) * 100;
  });

  frequencies.sort((a, b) => b.frequency - a.frequency);

  return {
    frequencies,
    mostCommon: frequencies[0] || null,
  };
};

const calculateStability = (
  transitions: EmotionTransition[],
  timeline: TimelineEntry[],
  analysisResult: {
    frequencies: TransitionFrequency[];
    mostCommon: TransitionFrequency | null;
  }
): EmotionalStability => {
  const totalTransitions = transitions.length;

  let totalDuration = 0;
  transitions.forEach((t) => {
    totalDuration += t.duration_seconds || 0;
  });

  const avgDuration =
    totalTransitions > 0 ? totalDuration / totalTransitions : 0;

  const maxPossibleTransitions = timeline.length - 1;
  const stabilityScore = Math.max(
    0,
    100 - (totalTransitions / maxPossibleTransitions) * 100
  );

  let emotionalPattern: 'estable' | 'fluctuante' | 'progresivo' | 'regresivo' =
    'estable';

  if (totalTransitions > (timeline.length - 1) * 0.5) {
    emotionalPattern = 'fluctuante';
  }

  if (analysisResult.frequencies.length > 0) {
    const happinessIncrease = analysisResult.frequencies.filter(
      (f) => f.to_emotion_id === 1
    ).length;

    if (happinessIncrease > totalTransitions * 0.3) {
      emotionalPattern = 'progresivo';
    }

    const sadnessIncrease = analysisResult.frequencies.filter(
      (f) => f.to_emotion_id === 2
    ).length;

    if (sadnessIncrease > totalTransitions * 0.3) {
      emotionalPattern = 'regresivo';
    }
  }

  return {
    total_transitions: totalTransitions,
    stability_score: stabilityScore,
    average_emotion_duration_seconds: avgDuration,
    most_common_transition: analysisResult.mostCommon
      ? {
          from: analysisResult.mostCommon.from_emotion_name,
          to: analysisResult.mostCommon.to_emotion_name,
          frequency: analysisResult.mostCommon.frequency,
        }
      : null,
    emotional_pattern: emotionalPattern,
  };
};

const generateDynamicNarrative = (
  arc: DynamicArc,
  participantName: string
): string => {
  const { phases, stability } = arc;

  if (phases.length === 0) {
    return `No se tienen datos suficientes de evolución emocional para ${participantName}.`;
  }

  let narrative = `<strong>${participantName}</strong> mostró un patrón emocional <strong>${stability.emotional_pattern}</strong> a lo largo de la sesión. `;

  if (phases[0]) {
    narrative += `Durante el <strong>inicio</strong>, estuvo dominado por <strong>${phases[0].dominantEmotion.name}</strong> (${phases[0].dominantEmotion.percentage.toFixed(0)}%). `;
  }

  if (phases[1]) {
    const change =
      phases[1].dominantEmotion.id !== phases[0]?.dominantEmotion.id
        ? `cambió a <strong>${phases[1].dominantEmotion.name}</strong>`
        : `continuó con <strong>${phases[1].dominantEmotion.name}</strong>`;
    narrative += `En la <strong>parte media</strong>, ${change} (${phases[1].dominantEmotion.percentage.toFixed(0)}%). `;
  }

  if (phases[2]) {
    narrative += `Hacia el <strong>final</strong>, la emoción dominante fue <strong>${phases[2].dominantEmotion.name}</strong> (${phases[2].dominantEmotion.percentage.toFixed(0)}%). `;
  }

  if (stability.total_transitions > 0) {
    narrative += `Se registraron <strong>${stability.total_transitions} cambios emocionales</strong> durante la sesión, `;

    if (stability.most_common_transition) {
      narrative += `siendo la transición más frecuente de <strong>${stability.most_common_transition.from}</strong> a <strong>${stability.most_common_transition.to}</strong> (${stability.most_common_transition.frequency} veces). `;
    }

    if (stability.stability_score > 70) {
      narrative += `indicando <strong>emociones relativamente estables</strong> durante la sesión.`;
    } else if (stability.stability_score > 40) {
      narrative += `mostrando <strong>fluctuaciones moderadas</strong> pero controladas.`;
    } else {
      narrative += `evidenciando <strong>cambios emocionales frecuentes y rápidos</strong>.`;
    }
  } else {
    narrative += `Mantuvo una emoción estable sin cambios significativos.`;
  }

  return narrative;
};

export const interpretEmotions = (
  emotions: AggregatedEmotionMetric[],
  participantName: string,
  timeline?: TimelineEntry[],
  transitions?: EmotionTransition[]
): InterpretationResult => {
  if (!emotions || emotions.length === 0) {
    return {
      enrichedEmotions: [],
      anomalies: [],
      narrativeSummary: `No se procesaron datos para ${participantName}.`,
      scientificSummary:
        'Sin datos suficientes para análisis basado en evidencia.',
      dynamicNarrative: `No se tienen datos de evolución emocional.`,
      bibliography: [],
      dynamicArc: {
        phases: [],
        transitions: [],
        stability: {
          total_transitions: 0,
          stability_score: 0,
          average_emotion_duration_seconds: 0,
          most_common_transition: null,
          emotional_pattern: 'estable',
        },
        progression: 'sin datos',
      },
      metadata: {
        total_references: 0,
        primary_theoretical_framework: 'N/A',
        interpretation_confidence: 'low',
      },
    };
  }

  const enrichedEmotions = emotions
    .map((emotion) => {
      const percentage = parseFloat(emotion.average_percentage);
      const emotionUI = EMOTION_DATA[emotion.emotion_type_id];
      const scientificKey = EMOTION_MAPPING[emotion.emotion_type_id];
      const knowledge = EVIDENCE_BASED_KNOWLEDGE[scientificKey];

      if (!knowledge || !emotionUI) {
        return null;
      }

      let intensity = {
        level: 'Normal',
        color: 'gray',
        icon: 'ri-checkbox-circle-fill',
        interpretation: 'Nivel dentro de rangos normativos',
        clinical_significance: 'Sin significado clínico aparente',
        scientific_basis: 'Basado en literatura científica revisada',
      };

      for (const [level, threshold] of Object.entries(knowledge.thresholds)) {
        if (percentage >= threshold.min && percentage <= threshold.max) {
          intensity = {
            level: level.charAt(0).toUpperCase() + level.slice(1),
            color: threshold.color,
            icon: threshold.icon,
            interpretation: threshold.interpretation,
            clinical_significance: threshold.clinical_significance,
            scientific_basis: `Basado en ${knowledge.author_reference.author} (${knowledge.author_reference.year})`,
          };
          break;
        }
      }

      return {
        name: emotionUI.name,
        icon: emotionUI.icon,
        percentage,
        intensity,
        scientific_reference: knowledge.author_reference,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.percentage - a!.percentage) as InterpretedEmotion[];

  const anomalies = Object.values(EVIDENCE_BASED_PATTERNS)
    .filter((pattern) => pattern.condition(enrichedEmotions))
    .map((pattern) => {
      let severity: 'low' | 'moderate' | 'high' | 'severe' = 'moderate';

      if (
        pattern.name.includes('Depresivo') ||
        pattern.name.includes('Desregulación')
      ) {
        severity = 'severe';
      } else if (pattern.name.includes('Ansiedad')) {
        severity = 'high';
      } else if (pattern.name.includes('Embotamiento')) {
        severity = 'moderate';
      }

      return {
        type: 'Patrón Clínico',
        name: pattern.name,
        interpretation: pattern.interpretation,
        scientific_basis: pattern.scientific_basis,
        clinical_relevance: pattern.clinical_relevance,
        references: pattern.references,
        severity,
      };
    });

  let dynamicArc: DynamicArc = {
    phases: [],
    transitions: [],
    stability: {
      total_transitions: 0,
      stability_score: 0,
      average_emotion_duration_seconds: 0,
      most_common_transition: null,
      emotional_pattern: 'estable',
    },
    progression: 'sin datos',
  };

  let dynamicNarrative =
    'Sin datos de evolución emocional disponibles para esta sesión.';

  if (
    timeline &&
    transitions &&
    timeline.length > 0 &&
    transitions.length >= 0
  ) {
    const phases = calculatePhases(timeline, transitions);
    const transitionAnalysis = analyzeTransitions(transitions);
    const stability = calculateStability(
      transitions,
      timeline,
      transitionAnalysis
    );

    dynamicArc = {
      phases,
      transitions: transitionAnalysis.frequencies,
      stability,
      progression:
        stability.emotional_pattern === 'progresivo'
          ? 'mejoró'
          : stability.emotional_pattern === 'regresivo'
            ? 'empeoró'
            : stability.emotional_pattern === 'fluctuante'
              ? 'fluctuó'
              : 'se mantuvo estable',
    };

    dynamicNarrative = generateDynamicNarrative(dynamicArc, participantName);
  }

  const dominant = enrichedEmotions[0];
  const secondary = enrichedEmotions[1];

  let narrativeSummary = `El perfil emocional de <strong>${participantName}</strong> estuvo dominado por <strong>${dominant.name}</strong> (${dominant.percentage.toFixed(1)}%), `;
  narrativeSummary += `${dominant.intensity.interpretation.toLowerCase()}`;

  if (secondary && secondary.percentage > 10) {
    narrativeSummary += `. Se observó una presencia notable de <strong>${secondary.name}</strong> (${secondary.percentage.toFixed(1)}%), `;
    narrativeSummary += `${secondary.intensity.interpretation.toLowerCase()}`;
  }
  narrativeSummary += '.';

  const dominantKey = Object.keys(EMOTION_MAPPING).find(
    (key) => EMOTION_DATA[parseInt(key)]?.name === dominant.name
  );
  const dominantScientificKey = dominantKey
    ? EMOTION_MAPPING[parseInt(dominantKey)]
    : 'happiness';
  const dominantKnowledge = EVIDENCE_BASED_KNOWLEDGE[dominantScientificKey];

  let scientificSummary = `<strong>Base Científica:</strong> La interpretación se fundamenta principalmente en `;
  scientificSummary += `${dominant.scientific_reference.author} (${dominant.scientific_reference.year}), quien define `;
  scientificSummary += `${dominant.name.toLowerCase()} como: "${dominantKnowledge?.definition || 'Emoción básica con significado adaptativo'}". `;

  if (anomalies.length > 0) {
    scientificSummary += `Los patrones identificados se basan en literatura clínica especializada.`;
  }

  const usedReferences = new Set<string>();

  enrichedEmotions.slice(0, 3).forEach((emotion) => {
    const refKey = `${emotion.scientific_reference.author}_${emotion.scientific_reference.year}`;
    usedReferences.add(refKey);
  });

  anomalies.forEach((anomaly) => {
    anomaly.references.forEach((ref) => {
      const refKey = `${ref.author}_${ref.year}`;
      usedReferences.add(refKey);
    });
  });

  const bibliography = Array.from(usedReferences)
    .map((refKey) => {
      const [author, year] = refKey.split('_');
      const ref = Object.values(SCIENTIFIC_REFERENCES).find(
        (r) => r.author.includes(author) && r.year.toString() === year
      );
      if (!ref) return '';

      const journal = ref.journal ? `, ${ref.journal}` : '';
      const doi = ref.doi ? `, DOI: ${ref.doi}` : '';
      return `${ref.author} (${ref.year}). ${ref.title}${journal}${doi}`;
    })
    .filter(Boolean)
    .sort();

  const primaryFramework = dominant.scientific_reference.author.includes(
    'Ekman'
  )
    ? 'Teoría de Emociones Básicas (Ekman)'
    : dominant.scientific_reference.author.includes('Diener')
      ? 'Teoría del Bienestar Subjetivo (Diener)'
      : dominant.scientific_reference.author.includes('Barrett')
        ? 'Teoría de Emociones Construidas (Barrett)'
        : 'Marco Teórico Multidisciplinar';

  const interpretationConfidence: 'high' | 'moderate' | 'low' =
    enrichedEmotions.length >= 3 && bibliography.length >= 2
      ? 'high'
      : enrichedEmotions.length >= 2
        ? 'moderate'
        : 'low';

  return {
    enrichedEmotions,
    anomalies,
    narrativeSummary,
    scientificSummary,
    dynamicNarrative,
    bibliography,
    dynamicArc,
    metadata: {
      total_references: bibliography.length,
      primary_theoretical_framework: primaryFramework,
      interpretation_confidence: interpretationConfidence,
    },
  };
};

export const getEmotionScientificDetails = (emotionName: string) => {
  const scientificKey = Object.entries(EMOTION_MAPPING).find(([_, key]) =>
    Object.values(EMOTION_DATA).some(
      (emotion) => emotion.name === emotionName && EVIDENCE_BASED_KNOWLEDGE[key]
    )
  )?.[1];

  if (!scientificKey) return null;

  const knowledge = EVIDENCE_BASED_KNOWLEDGE[scientificKey];
  return {
    definition: knowledge.definition,
    author: knowledge.author_reference,
    clinical_notes: knowledge.clinical_notes,
    related_concepts: knowledge.related_concepts,
  };
};

export const getAllScientificReferences = () => {
  return BIBLIOGRAPHY.getFormattedBibliography();
};

export const getPatternScientificBasis = (patternName: string) => {
  const pattern = Object.values(EVIDENCE_BASED_PATTERNS).find(
    (p) => p.name === patternName
  );
  if (!pattern) return null;

  return {
    scientific_basis: pattern.scientific_basis,
    references: pattern.references,
    clinical_relevance: pattern.clinical_relevance,
  };
};
