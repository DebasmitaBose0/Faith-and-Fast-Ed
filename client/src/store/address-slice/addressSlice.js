import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api';

export const userAddress = createAsyncThunk(
  'auth/userAddress',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/api/address/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to fetch address' }
      );
    }
  }
);

export const addUserAddress = createAsyncThunk(
  'address/add',
  async (address, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        '/api/address/create',
        address,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to add address' }
      );
    }
  }
);

export const updateUserAddress = createAsyncThunk(
  'address/update',
  async (address, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put('/api/address/update', address, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Something went wrong' }
      );
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'address/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting address with ID:', id);
      const response = await axiosInstance.delete(`/api/address/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Failed to delete address' }
      );
    }
  }
);

const initialState = {
  address: [],
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address = action.payload;
      })
      .addCase(userAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch address';
      })
      .addCase(addUserAddress.fulfilled, (state, action) => {
        state.address.push(action.payload.data);
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.address = state.address.map((addr) =>
          addr._id === action.payload.data._id ? action.payload.data : addr
        );
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.address = state.address.filter(
          (addr) => addr._id !== action.payload.data._id
        );
      });
  },
});

export default addressSlice.reducer;
