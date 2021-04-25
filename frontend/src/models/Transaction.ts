import { Permission } from "./Permission";

export interface Transaction {
  id?: string;
  name: string;

  permissions?: Permission[];
}
