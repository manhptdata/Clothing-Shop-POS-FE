import { createSlice } from '@reduxjs/toolkit';
import type { Order } from '@/types/order.types';

interface OrderState {
  list: Order[];
  selected: Order | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {},
});

export default orderSlice.reducer;
