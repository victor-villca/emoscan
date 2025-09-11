import { AggregatedEmotionMetric } from '@/types/sessionTypes';
import {
  EVIDENCE_BASED_KNOWLEDGE,
  EVIDENCE_BASED_PATTERNS,
  SCIENTIFIC_REFERENCES,
  BIBLIOGRAPHY,
  ScientificReference,
} from './evidenceBasedKnowledge';
import { EMOTION_DATA, EMOTION_ID_TO_NAME_MAP } from '@/lib/constant';

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

export interface InterpretationResult {
  enrichedEmotions: InterpretedEmotion[];
  anomalies: Anomaly[];
  narrativeSummary: string;
  scientificSummary: string;
  bibliography: string[];
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

export const interpretEmotions = (
  emotions: AggregatedEmotionMetric[],
  participantName: string
): InterpretationResult => {
  if (!emotions || emotions.length === 0) {
    return {
      enrichedEmotions: [],
      anomalies: [],
      narrativeSummary: `No se procesaron datos para ${participantName}.`,
      scientificSummary:
        'Sin datos suficientes para análisis basado en evidencia.',
      bibliography: [],
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
    bibliography,
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
