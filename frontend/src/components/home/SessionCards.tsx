import { FC } from 'react';
import SessionCard from './SessionCard';
import { SessionCardsProps } from '@/types/sessionTypes';

const SessionCards: FC<SessionCardsProps> = ({ sessions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
};

export default SessionCards;