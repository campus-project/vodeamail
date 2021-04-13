import { combineReducers } from "redux";
import emailCampaign from "./email-campaign.reducer";

const reducers = combineReducers({
  email_campaign: emailCampaign,
});

export default reducers;
