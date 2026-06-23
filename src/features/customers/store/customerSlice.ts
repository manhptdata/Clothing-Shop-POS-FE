import { createSlice } from '@reduxjs/toolkit';
import type { Customer } from '../types/customer.types';

interface CustomerState {
  list: Customer[];
  selected: Customer | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
});

export default customerSlice.reducer;
