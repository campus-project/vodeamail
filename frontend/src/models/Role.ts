import { User } from "react-email-editor";

export interface Role {
  id?: string;
  name: string;
  is_special: boolean;
  is_default: boolean;
  users?: User[];
}
