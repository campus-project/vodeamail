export const AUTH_SET_USER = "[AUTH] SET USER";
export const AUTH_SET_LAST_LOCATION = "[AUTH] SET LAST LOCATION";

export const setUser = (payload: any) => {
  return {
    type: AUTH_SET_USER,
    payload,
  };
};

export const setLastLocation = (payload: any) => {
  return {
    type: AUTH_SET_LAST_LOCATION,
    payload,
  };
};

export const logout = () => {
  return {
    type: AUTH_SET_USER,
    payload: null,
  };
};
