export interface Session {
  id: number;
  user_id: number;
  code: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: Date;
}
