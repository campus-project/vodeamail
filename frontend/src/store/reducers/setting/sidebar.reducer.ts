import * as actions from "../../actions/setting";

const sidebarOpenKey = "sidebar.open";
const isOpen = parseFloat(localStorage.getItem(sidebarOpenKey) || "1");

const initialState = {
  anchor: "left",
  isOpen: isNaN(isOpen) ? false : Boolean(isOpen),
  variant: "persistent",
  sidebarOpenKey: sidebarOpenKey,
};

const sidebar = function (state = initialState, action: any) {
  switch (action.type) {
    case actions.SETTING_SIDEBAR_CLOSE:
      return Object.assign(state, {
        isOpen: false,
      });
    case actions.SETTING_SIDEBAR_OPEN:
      return Object.assign(state, {
        isOpen: true,
      });
    case actions.SETTING_SIDEBAR_CHANGE_VARIANT:
      return Object.assign(state, {
        variant: action.payload,
      });
    default:
      return state;
  }
};

export default sidebar;
