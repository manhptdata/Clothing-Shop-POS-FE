import { configureStore } from '@reduxjs/toolkit';
// Các reducers sẽ được import từ features/
import authReducer from '@/features/auth/store/authSlice';
import productReducer from '@/features/products/store/productSlice';
import customerReducer from '@/features/customers/store/customerSlice';
import invoiceReducer from '@/features/invoices/store/invoiceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    customer: customerReducer,
    invoice: invoiceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
