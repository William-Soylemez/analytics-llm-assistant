// ABOUTME: Express type extensions for adding user property to requests
// ABOUTME: Allows TypeScript to recognize req.user in authenticated routes

import { User } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};