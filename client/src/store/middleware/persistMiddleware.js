import { saveState } from "../../utils/localStorageHelper.js";

// Redux middleware to persist critical state slices automatically
export const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  
  if (action.type.startsWith("auth/")) {
    const authState = store.getState().auth;
    saveState("cachedAuth", {
      isAuthenticated: authState.isAuthenticated,
      user: authState.user
    });
  }

  return result;
};
