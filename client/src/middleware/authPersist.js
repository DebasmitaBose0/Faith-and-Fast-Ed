const AUTH_PERSIST_KEY = {
  token: "token",
  user: "user",
  verifyEmail: "verifyEmail",
};

const AUTH_ACTIONS = {
  loginFulfilled: "auth/loginUser/fulfilled",
  logoutFulfilled: "auth/logoutUser/fulfilled",
  updateProfileFulfilled: "auth/updateProfile/fulfilled",
  uploadAvatarFulfilled: "auth/uploadAvatar/fulfilled",
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Quota exceeded or private mode — non-critical
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Private mode — non-critical
  }
};

const authPersistMiddleware = () => (next) => (action) => {
  const result = next(action);

  switch (action.type) {
    case AUTH_ACTIONS.loginFulfilled: {
      const { token, user, verifyEmail } = action.payload;
      if (token) safeWrite(AUTH_PERSIST_KEY.token, token);
      if (user) safeWrite(AUTH_PERSIST_KEY.user, JSON.stringify(user));
      if (verifyEmail !== undefined) safeWrite(AUTH_PERSIST_KEY.verifyEmail, String(verifyEmail));
      break;
    }

    case AUTH_ACTIONS.logoutFulfilled: {
      safeRemove(AUTH_PERSIST_KEY.token);
      safeRemove(AUTH_PERSIST_KEY.user);
      safeRemove(AUTH_PERSIST_KEY.verifyEmail);
      break;
    }

    case AUTH_ACTIONS.updateProfileFulfilled: {
      if (action.payload?.token) {
        safeWrite(AUTH_PERSIST_KEY.token, action.payload.token);
      }
      if (action.payload?.user) {
        safeWrite(AUTH_PERSIST_KEY.user, JSON.stringify(action.payload.user));
      }
      break;
    }

    case AUTH_ACTIONS.uploadAvatarFulfilled: {
      if (action.payload?.avatar) {
        const stored = (() => {
          try {
            return JSON.parse(localStorage.getItem(AUTH_PERSIST_KEY.user) || "null");
          } catch {
            return null;
          }
        })();
        if (stored) {
          safeWrite(AUTH_PERSIST_KEY.user, JSON.stringify({ ...stored, avatar: action.payload.avatar }));
        }
      }
      break;
    }

    default:
      break;
  }

  return result;
};

export default authPersistMiddleware;
