import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api';

export const getOrderAnalytics = createAsyncThunk(
  'adminAnalytics/getOrderAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const { startDate, endDate, interval } = params;

      const query = {};
      if (startDate) query.startDate = startDate;
      if (endDate) query.endDate = endDate;
      if (interval) query.interval = interval;

      const response = await axiosInstance.get('/api/order/admin/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: query,
        withCredentials: true,
      });
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminAnalyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState: {
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.analytics = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrderAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getOrderAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalytics } = adminAnalyticsSlice.actions;
export default adminAnalyticsSlice.reducer;
