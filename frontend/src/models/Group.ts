import { Contact } from "./Contact";

export interface Group {
  id?: string;
  name: string;
  description: string | null;
  is_visible: number;
  contacts?: Contact[];
  contact_ids: Contact[];
}
