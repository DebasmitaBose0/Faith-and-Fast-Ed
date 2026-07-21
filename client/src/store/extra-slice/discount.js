import axiosInstance from '@/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = '/api/discount';

// Fetch all discounts
export const fetchDiscounts = createAsyncThunk(
  'discount/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/all`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Error fetching discounts'
      );
    }
  }
);

// Create a discount
export const createDiscount = createAsyncThunk(
  'discount/create',
  async (discountData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/create`,
        discountData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Error creating discount'
      );
    }
  }
);

// Update an existing discount
export const updateDiscount = createAsyncThunk(
  'discount/update',
  async ({ discountId, discountData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/update/${discountId}`,
        discountData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Error updating discount'
      );
    }
  }
);

// Apply a discount
export const applyDiscount = createAsyncThunk(
  'discount/apply',
  async (discountData, thunkAPI) => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/apply`,
        discountData
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Error applying discount'
      );
    }
  }
);

// Delete a discount
export const deleteDiscount = createAsyncThunk(
  'discount/delete',
  async (discountId, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/delete/${discountId}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || 'Error deleting discount'
      );
    }
  }
);

const discountSlice = createSlice({
  name: 'discount',
  initialState: {
    discounts: [],
    appliedDiscount: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.successMessage = null;
      state.error = null;
    },
    clearAppliedDiscount: (state) => {
      state.appliedDiscount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.discounts;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.discounts.push(action.payload.discount);
        state.successMessage = action.payload.message;
      })
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const updated = action.payload.discount;
        state.discounts = state.discounts.map((d) =>
          d._id === updated._id ? updated : d
        );
        state.successMessage = action.payload.message;
      })
      .addCase(applyDiscount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyDiscount.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        // Persist the applied discount so Checkout can show savings, compute
        // the final payable amount, and attach coupon info to the order.
        state.appliedDiscount = {
          name: action.payload.discount?.name,
          type: action.payload.discount?.type,
          value: action.payload.discount?.value,
          discountAmount: action.payload.discountAmount,
          newPrice: action.payload.newPrice,
        };
      })
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter(
          (d) => d._id !== action.meta.arg
        );
        state.successMessage = action.payload.message;
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearMessages, clearAppliedDiscount } = discountSlice.actions;
export default discountSlice.reducer;
