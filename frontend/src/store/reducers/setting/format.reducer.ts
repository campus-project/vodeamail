import * as actions from "../../actions/setting";

const initialState = {
  date: "DD MMM YYYY",
  datetime: "MMM DD YYYY HH:mm",
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
