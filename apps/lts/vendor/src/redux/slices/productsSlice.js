import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// 1. Async Thunk: Fetch Products List (API 9)
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '', category = '', status = '' } = filterParams;
      const params = {};

      if (page) params.page = page;
      if (limit) params.limit = limit;
      if (search && search.trim()) params.search = search.trim();
      if (category && category !== 'All' && category.trim()) params.category = category.trim();
      if (status && status !== 'All' && status.trim()) params.status = status.trim();

      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch products list.';
      return rejectWithValue(message);
    }
  }
);

// 2. Async Thunk: Fetch Single Product By ID (API 10)
export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch product details.';
      return rejectWithValue(message);
    }
  }
);

// 3. Async Thunk: Create Product (API 11)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const payload = {
        sku: productData.sku?.trim(),
        name: productData.name?.trim(),
        category: productData.category?.trim(),
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        originalPrice: Number(productData.originalPrice || productData.price) || 0,
        image: productData.image?.trim() || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'
      };

      const response = await api.post('/products', payload);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to create product.';
      return rejectWithValue(message);
    }
  }
);

// 4. Async Thunk: Update Product (API 12)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const payload = {};
      if (updateData.price !== undefined) payload.price = Number(updateData.price);
      if (updateData.stock !== undefined) payload.stock = Number(updateData.stock);
      if (updateData.name !== undefined) payload.name = updateData.name;
      if (updateData.category !== undefined) payload.category = updateData.category;
      if (updateData.originalPrice !== undefined) payload.originalPrice = Number(updateData.originalPrice);
      if (updateData.image !== undefined) payload.image = updateData.image;

      const response = await api.put(`/products/${id}`, payload);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to update product.';
      return rejectWithValue(message);
    }
  }
);

// 5. Async Thunk: Delete Product (API 13)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/products/${productId}`);
      return {
        id: productId,
        message: response.data?.message || 'Product removed successfully'
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to delete product.';
      return rejectWithValue(message);
    }
  }
);

// 6. Async Thunk: Export Products CSV (API 14)
export const exportProductsCsv = createAsyncThunk(
  'products/exportProductsCsv',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/export-csv', {
        responseType: 'blob'
      });

      let filename = `lts_vendor_products_${new Date().toISOString().slice(0, 10)}.csv`;
      const disposition = response.headers?.['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return { filename };
    } catch (error) {
      let message = 'Failed to export products CSV.';
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          if (json?.message) message = json.message;
        } catch (_) {}
      } else {
        message = error.response?.data?.message || error.message || message;
      }
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  products: [],
  selectedProduct: null,
  pagination: {
    page: 1,
    pages: 1,
    totalProducts: 0
  },
  loading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  exportLoading: false,
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    // 1. fetchProducts
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload?.products) ? action.payload.products : [];
        state.pagination = {
          page: Number(action.payload?.page) || 1,
          pages: Number(action.payload?.pages) || 1,
          totalProducts: Number(action.payload?.totalProducts) || 0
        };
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch products';
      });

    // 2. fetchProductById
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload || 'Failed to fetch product details';
      });

    // 3. createProduct
    builder
      .addCase(createProduct.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createLoading = false;
        if (action.payload && action.payload._id) {
          state.products.unshift(action.payload);
          state.pagination.totalProducts += 1;
        }
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || 'Failed to create product';
      });

    // 4. updateProduct
    builder
      .addCase(updateProduct.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (action.payload && action.payload._id) {
          const index = state.products.findIndex((p) => p._id === action.payload._id);
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...action.payload };
          }
          if (state.selectedProduct && state.selectedProduct._id === action.payload._id) {
            state.selectedProduct = { ...state.selectedProduct, ...action.payload };
          }
        }
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload || 'Failed to update product';
      });

    // 5. deleteProduct
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (action.payload?.id) {
          state.products = state.products.filter((p) => p._id !== action.payload.id);
          if (state.pagination.totalProducts > 0) {
            state.pagination.totalProducts -= 1;
          }
        }
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload || 'Failed to delete product';
      });

    // 6. exportProductsCsv
    builder
      .addCase(exportProductsCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportProductsCsv.fulfilled, (state) => {
        state.exportLoading = false;
        state.error = null;
      })
      .addCase(exportProductsCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload || 'Failed to export products CSV';
      });
  }
});

export const { clearProductError, setSelectedProduct, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
