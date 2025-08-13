import { Request, Response } from 'express';
import { io } from '../config/socket';

export const handleStatusUpdate = (req: Request, res: Response): void => {
  const { sessionCode, participants } = req.body;

  if (!sessionCode || !Array.isArray(participants)) {
    res
      .status(400)
      .json({ message: 'Missing sessionCode or participants array.' });
    return;
  }

  io.to(sessionCode).emit('participant_status_update', participants);
  console.log(`📡 Broadcasted status update to room: ${sessionCode}`);

  res.status(200).json({ message: 'Status update received.' });
};
