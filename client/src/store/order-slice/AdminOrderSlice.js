import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api';

export const getAllOrders = createAsyncThunk(
  'adminOrders/getAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/api/order/get/admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async (
    { orderId, orderStatus, trackingId, notes, deliveryDate },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        `/api/order/admin/update/${orderId}`,
        { orderStatus, trackingId, notes, deliveryDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'adminOrders/deleteOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/order/admin/delete/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return orderId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getSingleOrder = createAsyncThunk(
  'adminOrders/getSingleOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/api/order/get/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteAllOrders = createAsyncThunk(
  'adminOrders/deleteAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.delete(
        '/api/order/admin/delete-all',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'adminOrders/verifyPayment',
  async ({ orderId, action, rejectionReason }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        `/api/order/admin/verify-payment/${orderId}`,
        { action, rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState: {
    orders: [],
    singleOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearSingleOrder: (state) => {
      state.singleOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;

        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSingleOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSingleOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.singleOrder = action.payload;
      })
      .addCase(getSingleOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteAllOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteAllOrders.fulfilled, (state) => {
        state.loading = false;
        state.orders = [];
      })
      .addCase(deleteAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete all orders';
      });
  },
});

export const { clearSingleOrder } = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
