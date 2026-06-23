import { Suspense } from 'react';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { routes } from './routeConfig';

function PageLoader() {
  return <div style={{ padding: 32 }}>Đang tải...</div>;
}

function RouteElements() {
  const element = useRoutes(routes);
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RouteElements />
    </BrowserRouter>
  );
}
