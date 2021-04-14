import * as actions from "../../actions";

const initialState = {
  date: "DD MMM YYYY",
  datetime: "DD MMM YYYY HH:mm",
};

const format = function (state = initialState, action: any) {
  switch (action.type) {
    case actions.SETTING_FORMAT_DATE:
      return {
        ...state,
        date: action.payload,
      };
    case actions.SETTING_FORMAT_DATE_TIME:
      return {
        ...state,
        datetime: action.payload,
      };
    default:
      return state;
  }
};

export default format;
