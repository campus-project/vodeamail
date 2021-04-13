import { combineReducers } from "redux";
import vodea from "./vodea";
import setting from "./setting";
import campaign from "./campaign";

const createReducer = () =>
  combineReducers({
    vodea,
    setting,
    campaign,
  });

export default createReducer;
