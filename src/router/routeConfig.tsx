import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import AuthLayout from '@/components/layouts/AuthLayout';
import MainLayout from '@/components/layouts/MainLayout/MainLayout';
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// ── Lazy load features ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

// Products
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'));

// Customers
const CustomerListPage = lazy(() => import('@/pages/customers/CustomerListPage'));
const CustomerFormPage = lazy(() => import('@/pages/customers/CustomerFormPage'));
const CustomerGroupListPage = lazy(() => import('@/pages/customers/CustomerGroupListPage'));

// Orders
const OrderListPage = lazy(() => import('@/pages/orders/OrderListPage'));
const OrderCreatePage = lazy(() => import('@/pages/orders/OrderCreatePage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));

// Users
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserFormPage = lazy(() => import('@/pages/users/UserFormPage'));

// ── Route Config ──────────────────────────────────────────────────────────────
export const routes: RouteObject[] = [
  // Public Routes
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
    ],
  },
  // Protected Routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'dashboard', element: <DashboardPage /> },

          // Products (Admin, Kho)
          {
            element: <RoleRoute allowedRoles={['ROLE_ADMIN', 'ROLE_WH']} />,
            children: [
              { path: 'products', element: <ProductListPage /> },
              { path: 'products/new', element: <ProductFormPage /> },
              { path: 'products/:id', element: <ProductDetailPage /> },
              { path: 'products/:id/edit', element: <ProductFormPage /> },
            ]
          },

          // Customers (Admin, Sale, CS)
          {
            element: <RoleRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SALE', 'ROLE_CS']} />,
            children: [
              { path: 'customers', element: <CustomerListPage /> },
              { path: 'customers/new', element: <CustomerFormPage /> },
              { path: 'customers/:id/edit', element: <CustomerFormPage /> },
              { path: 'customers/groups', element: <CustomerGroupListPage /> },
            ]
          },

          // Orders (Admin, Sale)
          {
            element: <RoleRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SALE']} />,
            children: [
              { path: 'orders', element: <OrderListPage /> },
              { path: 'orders/new', element: <OrderCreatePage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
            ]
          },

          // Users (Admin ONLY)
          {
            element: <RoleRoute allowedRoles={['ROLE_ADMIN']} />,
            children: [
              { path: 'users', element: <UserListPage /> },
              { path: 'users/new', element: <UserFormPage /> },
              { path: 'users/:id/edit', element: <UserFormPage /> },
            ]
          }
        ]
      }
    ]
  },
  // Fallback
  { path: '*', element: <DashboardPage /> } // Redirect tạm
];
