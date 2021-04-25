export const unsubscribeUrl = () => process.env.REACT_APP_UNSUBSCRIBE_URL;

export const profileUrl = (): string =>
  process.env.REACT_APP_PROFILE_URL || "/account/profile?ref=vodeamail";

export const createUserUrl = (): string =>
  process.env.REACT_APP_CREATE_USER_URL || "/people/create?ref=vodeamail";

export const organizationUrl = (): string =>
  process.env.REACT_APP_ORGANIZATION_URL ||
  "/setting/organization?ref=vodeamail";
