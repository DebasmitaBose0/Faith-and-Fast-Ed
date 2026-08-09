import axiosInstance from '@/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Step 1 — request a password-reset OTP for the given email.
export const sendResetOtp = createAsyncThunk(
  'updatePassword/sendResetOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/api/user/forgot-password', {
        email,
      });
      return { ...response.data, email };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to send reset OTP.'
      );
    }
  }
);

// Step 2 — verify the OTP the user received by email.
export const verifyResetOtp = createAsyncThunk(
  'updatePassword/verifyResetOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/api/user/verify-otp', {
        email,
        otp,
      });
      return { ...response.data, email };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'OTP verification failed.'
      );
    }
  }
);

// Step 3 — set the new password (requires a verified OTP for this email).
export const updatePassword = createAsyncThunk(
  'updatePassword/reset',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        '/api/user/reset-password',
        userData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Something went wrong.'
      );
    }
  }
);

const initialState = {
  loading: false,
  success: false, // password successfully reset
  error: null,
  message: null,
  otpSent: false, // step 1 complete
  otpVerified: false, // step 2 complete
  email: '',
};

const updatePasswordSlice = createSlice({
  name: 'updatePassword',
  initialState,
  reducers: {
    // Reset the whole recovery flow (call on mount / after completion).
    clearPasswordState: () => ({ ...initialState }),
    // Clear only transient messages without losing flow progress.
    clearPasswordMessages: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Step 1 — send OTP
      .addCase(sendResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(sendResetOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.email = action.payload.email;
        state.message = action.payload.message;
      })
      .addCase(sendResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.otpSent = false;
        state.error = action.payload;
      })
      // Step 2 — verify OTP
      .addCase(verifyResetOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyResetOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.email = action.payload.email;
        state.message = action.payload.message;
      })
      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.loading = false;
        state.otpVerified = false;
        state.error = action.payload;
      })
      // Step 3 — reset password
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message = action.payload?.message || 'Password updated.';
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });
  },
});

export const { clearPasswordState, clearPasswordMessages } =
  updatePasswordSlice.actions;
export default updatePasswordSlice.reducer;
