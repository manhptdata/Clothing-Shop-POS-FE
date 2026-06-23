import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { AuthLayout } from '@/layouts/AuthLayout';
import { MainLayout } from '@/layouts/MainLayout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

// ── Lazy load features ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/features/auth').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('@/features/dashboard').then(m => ({ default: m.DashboardPage })));

// Products
const ProductListPage = lazy(() => import('@/features/products').then(m => ({ default: m.ProductListPage })));
const ProductDetailPage = lazy(() => import('@/features/products').then(m => ({ default: m.ProductDetailPage })));
const ProductFormPage = lazy(() => import('@/features/products').then(m => ({ default: m.ProductFormPage })));

// Customers
const CustomerListPage = lazy(() => import('@/features/customers').then(m => ({ default: m.CustomerListPage })));
const CustomerFormPage = lazy(() => import('@/features/customers').then(m => ({ default: m.CustomerFormPage })));
const CustomerGroupListPage = lazy(() => import('@/features/customers').then(m => ({ default: m.CustomerGroupListPage })));

// Invoices
const InvoiceListPage = lazy(() => import('@/features/invoices').then(m => ({ default: m.InvoiceListPage })));
const InvoiceCreatePage = lazy(() => import('@/features/invoices').then(m => ({ default: m.InvoiceCreatePage })));
const InvoiceDetailPage = lazy(() => import('@/features/invoices').then(m => ({ default: m.InvoiceDetailPage })));

// Warehouse
const WarehouseListPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.WarehouseListPage })));
const SupplierListPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.SupplierListPage })));
const StockReceiptListPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.StockReceiptListPage })));
const StockReceiptFormPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.StockReceiptFormPage })));
const ReturnTicketListPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.ReturnTicketListPage })));
const ReturnTicketFormPage = lazy(() => import('@/features/warehouse').then(m => ({ default: m.ReturnTicketFormPage })));

// Users
const UserListPage = lazy(() => import('@/features/users').then(m => ({ default: m.UserListPage })));
const UserFormPage = lazy(() => import('@/features/users').then(m => ({ default: m.UserFormPage })));

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

          // Products
          { path: 'products', element: <ProductListPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },

          // Customers
          { path: 'customers', element: <CustomerListPage /> },
          { path: 'customers/new', element: <CustomerFormPage /> },
          { path: 'customers/:id/edit', element: <CustomerFormPage /> },
          { path: 'customers/groups', element: <CustomerGroupListPage /> },

          // Invoices
          { path: 'invoices', element: <InvoiceListPage /> },
          { path: 'invoices/new', element: <InvoiceCreatePage /> },
          { path: 'invoices/:id', element: <InvoiceDetailPage /> },

          // Warehouse
          { path: 'warehouse/warehouses', element: <WarehouseListPage /> },
          { path: 'warehouse/suppliers', element: <SupplierListPage /> },
          { path: 'warehouse/receipts', element: <StockReceiptListPage /> },
          { path: 'warehouse/receipts/new', element: <StockReceiptFormPage /> },
          { path: 'warehouse/returns', element: <ReturnTicketListPage /> },
          { path: 'warehouse/returns/new', element: <ReturnTicketFormPage /> },

          // Users (ADMIN ONLY)
          {
            element: <AdminRoute />,
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
  { path: '*', element: <DashboardPage /> } // Redirect tạm, TODO: Thêm NotFoundPage
];
