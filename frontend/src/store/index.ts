import createReducer from "./reducers";
import { applyMiddleware, compose, createStore } from "redux";
import thunk from "redux-thunk";

const enhancer = compose(applyMiddleware(thunk));

const store = createStore(createReducer(), enhancer);

export default store;
