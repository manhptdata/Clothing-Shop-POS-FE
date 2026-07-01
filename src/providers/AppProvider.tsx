import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { Toaster } from 'react-hot-toast';
import NotificationProvider from './NotificationProvider';

interface AppProviderProps {
  children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <Provider store={store}>
      <Toaster 
        position="top-center"
        containerClassName="no-print"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
        }} 
      />
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </Provider>
  );
}
