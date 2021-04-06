import { combineReducers } from "redux";
import sidebar from "./sidebar.reducer";
import menu from "./menu.reducer";
import format from "./format.reducer";

const reducers = combineReducers({
  menu,
  sidebar,
  format,
});

export default reducers;
