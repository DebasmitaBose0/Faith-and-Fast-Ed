import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:5000",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const correlationId =
      (typeof window !== "undefined" && window.crypto?.randomUUID?.()) ||
      "c-" + Math.random().toString(36).substring(2, 15);
    config.headers["X-Correlation-Id"] = correlationId;
    config.headers["X-Request-Id"] = correlationId;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    // If the response follows the standardized backend success structure
    if (response.data && response.data.success === true && response.data.hasOwnProperty("data")) {
      const originalData = response.data.data;
      const originalMeta = response.data.meta;

      // Maintain backward compatibility with the existing slices:
      // If `data` is an object, mix its properties into response.data
      if (originalData && typeof originalData === "object" && !Array.isArray(originalData)) {
        response.data = {
          ...response.data,
          ...originalData,
        };
      }

      // If there is metadata (like totalCount/totalNoPage/message), mix it in too
      if (originalMeta && typeof originalMeta === "object") {
        response.data = {
          ...response.data,
          ...originalMeta,
        };
      }
      
      // Also keep response.data.data so slices explicitly requesting it work perfectly
      response.data.data = originalData;
    }
    return response;
  },
  (error) => {
    // If the response follows the standardized backend error structure
    if (error.response?.data?.error) {
      const errPayload = error.response.data.error;
      // Map error.message and error.code to root response.data for backward compatibility
      error.response.data.message = errPayload.message;
      error.response.data.code = errPayload.code;
    }

    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const code = error.response?.data?.code || "";

    // Treat any 401 that signals an expired or invalid session as a logout
    // trigger, rather than matching one exact server message. Clearing
    // storage and doing a full redirect guarantees the Redux auth state is
    // re-initialised (initialState re-reads the now-cleared token), so the
    // user is logged out safely and consistently.
    const isSessionExpired =
      status === 401 &&
      (code === "AUTH_TOKEN_EXPIRED" ||
        code === "AUTH_INVALID_TOKEN" ||
        /token expired/i.test(message) ||
        /login again/i.test(message) ||
        /jwt expired/i.test(message));

    if (isSessionExpired) {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if the user was actually in a logged-in state, to avoid
      // bouncing guests whose requests happened to 401.
      if (hadToken && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
