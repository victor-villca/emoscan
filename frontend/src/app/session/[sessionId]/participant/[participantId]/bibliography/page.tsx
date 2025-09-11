'use client';
import { use } from 'react';
import BibliographyPage from '@/components/session/BibliographyPage';
import Link from 'next/link';

export default function ParticipantBibliographyPage({
  params,
}: {
  params: Promise<{ sessionId: string; participantId: string }>;
}) {
  const { sessionId, participantId } = use(params);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href={`/session/${sessionId}`}
              className="hover:text-blue-600"
            >
              Sesión
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <Link
              href={`/session/${sessionId}/participant/${participantId}`}
              className="hover:text-blue-600"
            >
              Reporte del Participante
            </Link>
            <i className="ri-arrow-right-s-line"></i>
            <span className="text-blue-600 font-medium">
              Bibliografía Científica
            </span>
          </div>
        </div>
      </div>

      <BibliographyPage onClose={() => window.history.back()} />
    </div>
  );
}
