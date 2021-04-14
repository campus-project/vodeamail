export const SETTING_MENU_INIT = "[SETTING] MENU INIT";
export const SETTING_PREFERENCE_INIT = "[SETTING] PREFERENCE INIT";

export function initMenu(permissions: string[] = []) {
  return {
    type: SETTING_MENU_INIT,
    payload: permissions,
  };
}

export function initPreference(permissions: string[] = []) {
  return {
    type: SETTING_PREFERENCE_INIT,
    payload: permissions,
  };
}
