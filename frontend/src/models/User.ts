import { Role } from "./Role";

export interface User {
  id?: string;
  name: string;
  email: string;
  role_id: string | Role | null;

  role?: Role;
}
