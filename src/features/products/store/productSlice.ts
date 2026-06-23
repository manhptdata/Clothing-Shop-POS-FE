import { createSlice } from '@reduxjs/toolkit';
import type { Product } from '../types/product.types';

interface ProductState {
  list: Product[];
  selected: Product | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
});

export default productSlice.reducer;
