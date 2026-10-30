export type Role =
  | 'LEARNER'
  | 'CONTRIBUTOR'
  | 'REVIEWER'
  | 'ADMINISTRATOR';

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  roles: Role[];
};

export type LoginResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
};