import type { Role } from '../../generated/prisma/client.js';

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  roles: Role[];
};