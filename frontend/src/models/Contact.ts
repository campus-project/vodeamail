import { Group } from "./Group";

export interface Contact {
  id?: string;
  email: string;
  name?: string | null;
  mobile_phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  postal_code?: string | null;
  is_subscribed?: boolean;

  groups?: Group[];
  group_ids: Group[];
}
