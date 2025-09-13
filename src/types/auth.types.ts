import { Request } from 'express';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface RequestUser {
  userId: number;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}
