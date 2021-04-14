import * as actions from "../../actions/vodea";

const lastLocationKey = "auth.last_location";
const lastLocation = localStorage.getItem(lastLocationKey) || null;

// const initialState = {
//   isLogged: true,
//   user: {
//     id: "1",
//     name: "Yudi Hertanto",
//     email: "tanyudi17@gmail.com",
//     photo_url:
//       "https://lh3.googleusercontent.com/ogw/ADGmqu8l_B1dtzjXGKfX6TjRkKDBg4DoU99C2CrNbI_xgg=s83-c-mo",
//   },
// };

const initialState = {
  isLogged: false,
  user: null,
  lastLocation: lastLocation,
};

const auth = function (state = initialState, action: any) {
  switch (action.type) {
    case actions.AUTH_SET_USER:
      return Object.assign(state, {
        ...state,
        isLogged: !!action.payload,
        user: action.payload,
      });
    case actions.AUTH_SET_LAST_LOCATION:
      localStorage.setItem(lastLocationKey, action.payload);
      return Object.assign(state, {
        ...state,
        lastLocation: action.payload,
      });
    default:
      return state;
  }
};

export default auth;
