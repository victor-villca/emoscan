export interface Session {
  id: number;
  user_id: number;
  code: string;
  name: string;
  date: string;
  status?: string;
  start_time: string;
  end_time: string;
  created_at: Date;
  actual_start_time?: Date | null;
  actual_end_time?: Date | null;
}
