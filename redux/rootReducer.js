import { combineReducers } from "redux";

import publicReducer from "./public/reducer";

const rootReducer = (state, action, history) => {
  const allReducers = combineReducers({
    public: publicReducer,
  });

  return allReducers(state, action);
};

export default rootReducer;
