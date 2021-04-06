export const SETTING_FORMAT_DATE = "[SETTING] FORMAT DATE";
export const SETTING_FORMAT_DATE_TIME = "[SETTING] FORMAT DATE TIME";

export function formatDate(format: string) {
  return {
    type: SETTING_FORMAT_DATE,
    payload: format,
  };
}

export function formatDateTime(format: string) {
  return {
    type: SETTING_FORMAT_DATE_TIME,
    payload: format,
  };
}
