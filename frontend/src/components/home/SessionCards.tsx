import { FC } from 'react';
import SessionCard from './SessionCard';
import { SessionCardsProps } from '@/types/sessionTypes';
import Link from 'next/link';

const SessionCards: FC<SessionCardsProps> = ({ sessions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <div key={session.id}>
          <Link href={`/session/${session.id}`}>
            <SessionCard  session={session} />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default SessionCards;