import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api';

// Public — checkout reads the UPI ID + QR to show online-payment instructions.
export const getPaymentSettings = createAsyncThunk(
  'paymentSettings/get',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/payment-settings');
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Admin — set/replace UPI ID and/or upload a new QR image (multipart).
export const updatePaymentSettings = createAsyncThunk(
  'paymentSettings/update',
  async ({ upiId, qrCode }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (upiId !== undefined && upiId !== null) {
        formData.append('upiId', upiId);
      }
      if (qrCode) {
        formData.append('qrCode', qrCode);
      }
      const response = await axiosInstance.put(
        '/api/payment-settings/admin/update',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const paymentSettingsSlice = createSlice({
  name: 'paymentSettings',
  initialState: {
    settings: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(getPaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePaymentSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updatePaymentSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paymentSettingsSlice.reducer;
