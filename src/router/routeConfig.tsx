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
const CustomerCenterPage = lazy(() => import('@/pages/customers/CustomerCenterPage'));
const CustomerListPage = lazy(() => import('@/pages/customers/list/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/pages/customers/list/CustomerDetailPage'));
const CustomerFormPage = lazy(() => import('@/pages/customers/list/CustomerFormPage'));
const CustomerEditPage = lazy(() => import('@/pages/customers/list/CustomerEditPage'));
const CustomerGroupListPage = lazy(() => import("@/pages/customers/groups/CustomerGroupListPage"));
const CustomerGroupDetailPage = lazy(() => import("@/pages/customers/groups/CustomerGroupDetailPage"));
const CustomerGroupMembersPage = lazy(() => import("@/pages/customers/groups/CustomerGroupMembersPage"));


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
    children: [{ path: "login", element: <LoginPage /> }],
  },
  // Protected Routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
<<<<<<< Updated upstream
          // Dashboard (Admin, Sale)
          {
            element: <RoleRoute allowedRoles={['ROLE_ADMIN', 'ROLE_SALE']} />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'dashboard', element: <DashboardPage /> },
            ]
          },
=======
          { index: true, element: <DashboardPage /> },
          { path: "dashboard", element: <DashboardPage /> },
>>>>>>> Stashed changes

          // Products (Admin, Kho)
          {
            element: <RoleRoute allowedRoles={["ROLE_ADMIN", "ROLE_WH"]} />,
            children: [
              { path: "products", element: <ProductListPage /> },
              { path: "products/new", element: <ProductFormPage /> },
              { path: "products/:id", element: <ProductDetailPage /> },
              { path: "products/:id/edit", element: <ProductFormPage /> },
            ],
          },

          // Customers (Admin, Sale, CS)
          {
            element: (
              <RoleRoute
                allowedRoles={["ROLE_ADMIN", "ROLE_SALE", "ROLE_CS"]}
              />
            ),
            children: [
              {
                path: "customers",
                children: [
                  { index: true, element: <CustomerCenterPage /> },
                  { path: "list", element: <CustomerListPage /> },
                  { path: "new", element: <CustomerFormPage /> },
                  { path: ":id", element: <CustomerDetailPage /> },
                  { path: "edit/:id", element: <CustomerEditPage /> },
                  { path: "groups", element: <CustomerGroupListPage /> },
                  { path: "groups/:id", element: <CustomerGroupDetailPage /> },
                  {
                    path: "groups/:id/members", element: <CustomerGroupMembersPage />,
                  },
                ],
              },
            ],
          },

          // Orders (Admin, Sale)
          {
            element: <RoleRoute allowedRoles={["ROLE_ADMIN", "ROLE_SALE"]} />,
            children: [
              { path: "orders", element: <OrderListPage /> },
              { path: "orders/new", element: <OrderCreatePage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
            ],
          },

          // Users (Admin ONLY)
          {
            element: <RoleRoute allowedRoles={["ROLE_ADMIN"]} />,
            children: [
              { path: "users", element: <UserListPage /> },
              { path: "users/new", element: <UserFormPage /> },
              { path: "users/:id/edit", element: <UserFormPage /> },
            ],
          },
        ],
      },
    ],
  },
  // Fallback
  { path: "*", element: <DashboardPage /> },
];