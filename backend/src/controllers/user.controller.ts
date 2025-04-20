import { Request, Response } from 'express';
import * as UserService from '../services/user.service';

export async function handleRegister(req: Request, res: Response) {
  try {
    const user = await UserService.registerUser(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error' });
  }
}
