import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/superadmin/dashboard/cascade-data');
      const categories = response.data?.categories;
      const subcategories = response.data?.subcategories;
      if (!Array.isArray(categories) || !Array.isArray(subcategories)) {
        return rejectWithValue('The category service returned invalid category data.');
      }
      return { categories, subcategories };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch categories.';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  categories: [],
  subcategories: [],
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.subcategories = action.payload.subcategories;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories.';
      });
  },
});

export default categorySlice.reducer;
