export interface Session {
  id: number;
  user_id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: string;
}
export interface SessionCardProps {
  session: Session;
}

export interface SessionCardsProps {
  sessions: Session[];
}