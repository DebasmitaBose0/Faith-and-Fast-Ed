import axiosInstance from '@/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getInventoryOverview = createAsyncThunk(
  'inventory/getInventoryOverview',
  async (threshold = 5, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/api/inventory/overview', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { threshold },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch inventory overview'
      );
    }
  }
);

export const bulkUpdateStock = createAsyncThunk(
  'inventory/bulkUpdateStock',
  async (updates, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        '/api/inventory/bulk-update',
        { updates },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update stock'
      );
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    summary: null,
    products: [],
    threshold: 5,
    loading: false,
    updating: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInventoryOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.products = action.payload.products;
        state.threshold = action.payload.threshold;
      })
      .addCase(getInventoryOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch inventory overview';
      })
      .addCase(bulkUpdateStock.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(bulkUpdateStock.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(bulkUpdateStock.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update stock';
      });
  },
});

export default inventorySlice.reducer;
