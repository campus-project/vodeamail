import { combineReducers } from "redux";
import vodea from "./vodea";
import setting from "./setting";

const createReducer = () =>
  combineReducers({
    vodea,
    setting,
  });

export default createReducer;
