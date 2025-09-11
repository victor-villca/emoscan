import { FC } from 'react';

interface SessionCardProps {
  session: {
    id: number;
    name: string;
    date: string;
    start_time: string;
    end_time: string;
    participantCount: number;
    durationMinutes: number;
  };
}

const SessionCard: FC<SessionCardProps> = ({ session }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card bg-white rounded-lg shadow-sm p-5 border border-transparent hover:border-primary">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{session.name}</h2>
          <p className="text-sm text-gray-500">{formatDate(session.date)}</p>
        </div>
        <div className="flex items-center bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
          Finalizado
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-700 my-6">
        <div className="flex items-center">
          <i className="ri-group-line text-gray-400 w-5 text-center mr-2"></i>
          <span>{session.participantCount} Participantes</span>
        </div>
        <div className="flex items-center">
          <i className="ri-time-line text-gray-400 w-5 text-center mr-2"></i>
          <span>{session.durationMinutes} Minutos de duracion</span>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button className="flex items-center text-primary font-medium text-sm">
          Ver Reporte
          <i className="ri-arrow-right-line ml-1"></i>
        </button>
      </div>
    </div>
  );
};

export default SessionCard;
