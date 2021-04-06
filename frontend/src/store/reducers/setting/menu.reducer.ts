import * as actions from "../../actions/setting";

const initialState = {
  items: [
    {
      label: "sidebar:menu.dashboard",
      href: "/apps/dashboard",
      icon: "vicon-dashboard",
      permissions: "any",
      children: [],
    },
    {
      label: "sidebar:menu.campaign",
      href: "/apps/campaign",
      icon: "vicon-megaphone",
      permissions: "any",
      children: [],
    },
    {
      label: "sidebar:menu.audience",
      href: "/apps/audience",
      icon: "vicon-people",
      otherUrls: [
        "/apps/audience/contact/create",
        "/apps/audience/contact/:slug/update",
        "/apps/audience/group/create",
        "/apps/audience/group/:slug/update",
      ],
    },
    {
      label: "sidebar:menu.analytic",
      href: "/apps/analytic",
      icon: "vicon-graph",
      permissions: "any",
      children: [],
    },
    {
      label: "sidebar:menu.preference",
      href: "/apps/preference",
      icon: "vicon-adjust",
      permissions: "any",
      otherUrls: [
        "/apps/preference/organization",
        "/apps/preference/role",
        "/apps/preference/role/create",
        "/apps/preference/role/:slug/update",
        "/apps/preference/gate-setting",
        "/apps/preference/gate-setting/create",
        "/apps/preference/gate-setting/:slug/update",
        "/apps/preference/team",
        "/apps/preference/team/create",
        "/apps/preference/team/:slug/update",
      ],
      children: [],
    },
  ],
  preferences: [
    {
      icon: "vicon-business",
      title: "pages:preference.setting.organization.title",
      description: "pages:preference.setting.organization.description",
      href: "/apps/preference/organization",
    },
    {
      icon: "vicon-people",
      title: "pages:preference.setting.role.title",
      description: "pages:preference.setting.role.description",
      href: "/apps/preference/role",
    },
    {
      icon: "vicon-key",
      title: "pages:preference.setting.privilege.title",
      description: "pages:preference.setting.privilege.description",
      href: "/apps/preference/gate-setting",
    },
  ],
};

const menu = function (state = initialState, action: any) {
  switch (action.type) {
    case actions.SETTING_MENU_INIT:
      return {
        ...state,
      };
    case actions.SETTING_PREFERENCE_INIT:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default menu;
