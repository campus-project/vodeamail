import * as actions from "../../actions";

const initialState = {
  email_domain: "@vodea.id",
  email_templates: [],
};

const format = function (state = initialState, action: any) {
  switch (action.type) {
    case actions.EMAIL_CAMPAIGN_SET_EMAIL_TEMPLATE:
      return {
        ...state,
        email_templates: action.payload,
      };
    default:
      return state;
  }
};

export default format;
