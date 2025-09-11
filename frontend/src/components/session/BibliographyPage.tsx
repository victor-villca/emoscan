'use client';
import { useState } from 'react';
import {
  SCIENTIFIC_REFERENCES,
  EVIDENCE_BASED_KNOWLEDGE,
} from '@/services/evidenceBasedKnowledge';

interface BibliographyPageProps {
  onClose?: () => void;
}

const BibliographyPage = ({ onClose }: BibliographyPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'emotions' | 'patterns'
  >('all');
  const [selectedReference, setSelectedReference] = useState<string | null>(
    null
  );

  const getEmotionsByAuthor = (authorName: string) => {
    return Object.entries(EVIDENCE_BASED_KNOWLEDGE)
      .filter(([_, knowledge]) =>
        knowledge.author_reference.author.includes(authorName)
      )
      .map(([key, knowledge]) => ({
        key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        definition: knowledge.definition,
      }));
  };

  const formatReference = (ref: any) => {
    const journal = ref.journal ? `, ${ref.journal}` : '';
    const doi = ref.doi ? `, DOI: ${ref.doi}` : '';
    return `${ref.author} (${ref.year}). ${ref.title}${journal}${doi}`;
  };

  const references = Object.values(SCIENTIFIC_REFERENCES).sort(
    (a, b) => a.year - b.year
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Referencias Científicas
            </h1>
            <p className="text-gray-600 mt-2">
              Fundamento teórico y evidencia científica del sistema de análisis
              emocional
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <i className="ri-close-line mr-2"></i>
              Cerrar
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas las Referencias
            </button>
            <button
              onClick={() => setSelectedCategory('emotions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'emotions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Emociones Básicas
            </button>
            <button
              onClick={() => setSelectedCategory('patterns')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === 'patterns'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Patrones Clínicos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-flask-line mr-2 text-blue-500"></i>
            Metodología Científica
          </h2>
          <div className="prose prose-sm text-gray-700 space-y-3">
            <p>
              El sistema de análisis emocional EmoScan se fundamenta en
              investigación académica revisada por pares, integrando múltiples
              marcos teóricos reconocidos en psicología y neurociencia
              emocional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Marcos Teóricos Principales
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Teoría de Emociones Básicas (Ekman)</li>
                  <li>• Bienestar Subjetivo (Diener)</li>
                  <li>• Regulación Emocional (Gross)</li>
                  <li>• Neurociencia del Miedo (LeDoux)</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  Criterios de Inclusión
                </h4>
                <ul className="text-sm space-y-1">
                  <li>• Publicaciones revisadas por pares</li>
                  <li>• Autores reconocidos internacionalmente</li>
                  <li>• Evidencia empírica sólida</li>
                  <li>• Aplicabilidad clínica demostrada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-book-open-line mr-2 text-green-500"></i>
            Referencias Bibliográficas
          </h2>

          <div className="space-y-4">
            {references.map((ref, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">{ref.title}</h3>
                    <p className="text-blue-600 font-medium">
                      {ref.author} ({ref.year})
                    </p>
                    {ref.journal && (
                      <p className="text-gray-600 text-sm mt-1">
                        <i className="ri-book-line mr-1"></i>
                        {ref.journal}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setSelectedReference(
                        selectedReference === ref.title ? null : ref.title
                      )
                    }
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    <i
                      className={`ri-${selectedReference === ref.title ? 'arrow-up' : 'arrow-down'}-s-line`}
                    ></i>
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-blue-900">
                    <strong>Concepto Clave:</strong> {ref.key_concept}
                  </p>
                </div>

                {selectedReference === ref.title && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Aplicación en EmoScan:
                    </h4>
                    <div className="space-y-2">
                      {getEmotionsByAuthor(ref.author).map((emotion, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium text-gray-800">
                            {emotion.name}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {emotion.definition}
                          </p>
                        </div>
                      ))}

                      {getEmotionsByAuthor(ref.author).length === 0 && (
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600">
                            Esta referencia aporta al marco teórico general del
                            sistema de análisis emocional.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <h5 className="font-medium text-yellow-800 mb-1">
                        Cita Formal:
                      </h5>
                      <p className="text-sm text-yellow-700 font-mono">
                        {formatReference(ref)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-mind-map mr-2 text-purple-500"></i>
            Marcos Teóricos Integrados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <i className="ri-emotion-line mr-2"></i>
                Teoría de Emociones Básicas
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Paul Ekman (1972-2003)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Identifica seis emociones básicas universales con
                    expresiones faciales específicas: felicidad, tristeza, ira,
                    miedo, sorpresa y disgusto.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-blue-800">
                    <strong>Aplicación:</strong> Clasificación primaria de
                    emociones detectadas por el sistema.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                <i className="ri-heart-line mr-2"></i>
                Teoría del Bienestar Subjetivo
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Ed Diener (1984)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Define la felicidad como balance entre afectos positivos y
                    negativos, más evaluaciones cognitivas de satisfacción
                    vital.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-xs text-green-800">
                    <strong>Aplicación:</strong> Interpretación de niveles de
                    felicidad y bienestar general.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                <i className="ri-equalizer-line mr-2"></i>
                Teoría de Regulación Emocional
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    James Gross (1998-2015)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Procesos por los cuales las personas influencian qué
                    emociones tienen, cuándo las tienen y cómo las experimentan.
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-xs text-orange-800">
                    <strong>Aplicación:</strong> Evaluación de capacidades de
                    regulación y patrones disfuncionales.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                <i className="ri-brain-line mr-2"></i>
                Neurociencia Emocional
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800">
                    Joseph LeDoux (2000)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Circuitos neurales del miedo centrados en la amígdala y
                    respuestas automáticas de supervivencia.
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-xs text-purple-800">
                    <strong>Aplicación:</strong> Interpretación de niveles de
                    miedo y respuestas de ansiedad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <i className="ri-shield-check-line mr-2 text-red-500"></i>
            Limitaciones y Consideraciones Éticas
          </h2>

          <div className="prose prose-sm text-gray-700 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Limitaciones del Sistema
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  • Las interpretaciones son orientativas, no diagnósticos
                  clínicos definitivos
                </li>
                <li>
                  • La detección facial puede verse afectada por factores
                  técnicos y ambientales
                </li>
                <li>
                  • Las expresiones emocionales varían entre individuos y
                  culturas
                </li>
                <li>
                  • Los umbrales se basan en literatura general, no validación
                  específica del sistema
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">
                Consideraciones Éticas
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  • La privacidad y confidencialidad de los datos emocionales
                  debe ser protegida
                </li>
                <li>
                  • Los resultados no deben usarse para discriminación o
                  estigmatización
                </li>
                <li>
                  • Se requiere consentimiento informado para el análisis
                  emocional
                </li>
                <li>
                  • La interpretación debe complementar, no reemplazar, el
                  juicio clínico profesional
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                Recomendaciones de Uso
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  • Utilizar como herramienta de apoyo en contextos apropiados
                </li>
                <li>
                  • Combinar con observación clínica y evaluación profesional
                </li>
                <li>
                  • Considerar factores contextuales y culturales en la
                  interpretación
                </li>
                <li>
                  • Mantener actualización continua con literatura científica
                  emergente
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              Sistema de Análisis Emocional EmoScan - Versión basada en
              evidencia científica
            </p>
            <p className="mt-1">
              Para consultas sobre la metodología científica:
              <a
                href="mailto:research@emoscan.com"
                className="text-blue-600 hover:text-blue-800 ml-1"
              >
                research@emoscan.com
              </a>
            </p>
            <p className="mt-2 text-xs">
              Última actualización de referencias:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BibliographyPage;
