import { createSlice } from '@reduxjs/toolkit';
import type { Invoice } from '../types/invoice.types';

interface InvoiceState {
  list: Invoice[];
  selected: Invoice | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
});

export default invoiceSlice.reducer;
