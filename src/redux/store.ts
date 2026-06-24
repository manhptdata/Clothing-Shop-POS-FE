import { configureStore } from '@reduxjs/toolkit';
// Các reducers sẽ được import từ features/
import authReducer from '@/redux/slice/authSlice';
import productReducer from '@/redux/slice/productSlice';
import customerReducer from '@/redux/slice/customerSlice';
import orderReducer from '@/redux/slice/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    customer: customerReducer,
    order: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
