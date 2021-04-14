export const SETTING_SIDEBAR_OPEN = "[SETTING] SIDEBAR OPEN";
export const SETTING_SIDEBAR_CLOSE = "[SETTING] SIDEBAR CLOSE";
export const SETTING_SIDEBAR_CHANGE_VARIANT =
  "[SETTING] SIDEBAR CHANGE VARIANT";

export const setSidebarOpen = () => {
  return {
    type: SETTING_SIDEBAR_OPEN,
    payload: true,
  };
};

export const setSidebarClose = () => {
  return {
    type: SETTING_SIDEBAR_CLOSE,
    payload: false,
  };
};

export const changeSidebarVariant = (
  payload: "permanent" | "persistent" | "temporary"
) => {
  return {
    type: SETTING_SIDEBAR_CHANGE_VARIANT,
    payload,
  };
};
