import { Provider } from 'react-redux';
import { store } from '@/store';
// TODO: Nếu có react-query hoặc ErrorBoundary thì bọc ở đây

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
