import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api';

export const getProductDetails = createAsyncThunk(
  'product/getDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/product/get/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product details'
      );
    }
  }
);

export const getProductReviews = createAsyncThunk(
  'product/getReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/product/reviews/${productId}`
      );
      return response.data.reviews;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews'
      );
    }
  }
);

export const postReview = createAsyncThunk(
  'product/postReview',
  async ({ productId, reviewData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.post(
        `/api/product/review/${productId}`,
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to post review'
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  'product/deleteReview',
  async ({ productId, reviewId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.delete(
        `/api/product/review/${productId}/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      return { productId, reviewId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review'
      );
    }
  }
);

export const getSimilarProducts = createAsyncThunk(
  'product/getSimilar',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Accept either a category string (legacy callers) or an options object,
      // and forward the criteria as query params so results are actually
      // category/subcategory-relevant and exclude the current product.
      const query =
        typeof params === 'string'
          ? { category: params }
          : {
              ...(params.category ? { category: params.category } : {}),
              ...(params.subcategory
                ? { subcategory: params.subcategory }
                : {}),
              ...(params.coloroptions
                ? { coloroptions: params.coloroptions }
                : {}),
              ...(params.exclude ? { exclude: params.exclude } : {}),
            };

      const response = await axiosInstance.get('/api/product/similar', {
        params: query,
      });
      return response.data.similarProducts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch similar products'
      );
    }
  }
);

export const getTrendingProducts = createAsyncThunk(
  'product/getTrending',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/product/trending', {
        params: { limit },
      });
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch trending products'
      );
    }
  }
);

export const getFrequentlyBoughtTogether = createAsyncThunk(
  'product/getFrequentlyBoughtTogether',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/api/product/frequently-bought-together/${productId}`
      );
      return response.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          'Failed to fetch frequently bought together products'
      );
    }
  }
);

const initialState = {
  product: null,
  reviews: [],
  similarProducts: [],
  trendingProducts: [],
  frequentlyBoughtTogether: [],
  loading: false,
  error: null,
  reviewPosting: false,
};

const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState,
  reducers: {
    clearProductErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Product Details
      .addCase(getProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Reviews
      .addCase(getProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Post Review
      .addCase(postReview.pending, (state) => {
        state.reviewPosting = true;
      })
      .addCase(postReview.fulfilled, (state, action) => {
        state.reviewPosting = false;
        state.reviews.push(action.payload.review);
      })
      .addCase(postReview.rejected, (state, action) => {
        state.reviewPosting = false;
        state.error = action.payload;
      })

      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the review from the reviews array
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload.reviewId
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Similar Products
      .addCase(getSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload;
      })
      .addCase(getSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Trending Products
      .addCase(getTrendingProducts.fulfilled, (state, action) => {
        state.trendingProducts = action.payload;
      })

      // Get Frequently Bought Together
      .addCase(getFrequentlyBoughtTogether.fulfilled, (state, action) => {
        state.frequentlyBoughtTogether = action.payload;
      });
  },
});

export const { clearProductErrors } = productDetailsSlice.actions;
export default productDetailsSlice.reducer;
