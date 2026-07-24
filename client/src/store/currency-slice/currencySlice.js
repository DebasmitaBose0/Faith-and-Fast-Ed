import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api";

export const fetchRates = createAsyncThunk(
  "currency/fetchRates",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/api/currency/rates");
      return data.rates;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch rates");
    }
  }
);

const currencySlice = createSlice({
  name: "currency",
  initialState: {
    selectedCurrency: "INR",
    rates: { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0095 },
    symbols: { INR: "₹", USD: "$", EUR: "€", GBP: "£" },
    loading: false,
    error: null,
  },
  reducers: {
    setCurrency(state, action) {
      state.selectedCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRates.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
      })
      .addCase(fetchRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
