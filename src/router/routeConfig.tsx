import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import AuthLayout from '@/components/layouts/AuthLayout';
import MainLayout from '@/components/layouts/MainLayout/MainLayout';
import PrivateRoute from './PrivateRoute';
import PermissionRoute, { getDefaultRouteForPermissions } from './PermissionRoute';
import { useAppSelector } from '@/redux/hooks';

// Helper component to redirect root / to the default page for user's permissions
function IndexRedirect() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  const userRole = user?.role || '';
  const userPermissions = user?.permissions || [];
  const defaultRoute = getDefaultRouteForPermissions(userPermissions, userRole);
  
  return <Navigate to={defaultRoute} replace />;
}

// ── Lazy load features ────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));

// Products & Suppliers
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const ProductFormPage = lazy(() => import('@/pages/products/ProductFormPage'));
const CategoryListPage = lazy(() => import('@/pages/categories/CategoryListPage'));
const SupplierListPage = lazy(() => import('@/pages/suppliers/SupplierListPage'));

// Warehouse
const ReceiptListPage = lazy(() => import('@/pages/warehouse/ReceiptListPage'));
const ReceiptCreatePage = lazy(() => import('@/pages/warehouse/ReceiptCreatePage'));
const ReceiptUpdatePage = lazy(() => import('@/pages/warehouse/ReceiptUpdatePage'));
const ReceiptDetailPage = lazy(() => import('@/pages/warehouse/ReceiptDetailPage'));
const StockHistoryPage = lazy(() => import('@/pages/warehouse/StockHistoryPage'));

// Customers 
const CustomerCenterPage = lazy(() => import('@/pages/customers/CustomerCenterPage'));
const CustomerListPage = lazy(() => import('@/pages/customers/list/CustomerListPage'));
const CustomerDetailPage = lazy(() => import('@/pages/customers/list/CustomerDetailPage'));
const CustomerFormPage = lazy(() => import('@/pages/customers/list/CustomerFormPage'));
const CustomerEditPage = lazy(() => import('@/pages/customers/list/CustomerEditPage'));
const CustomerGroupListPage = lazy(() => import("@/pages/customers/groups/CustomerGroupListPage"));
const CustomerGroupDetailPage = lazy(() => import("@/pages/customers/groups/CustomerGroupDetailPage"));
const CustomerGroupMembersPage = lazy(() => import("@/pages/customers/groups/CustomerGroupMembersPage"));
const VoucherListPage = lazy(() => import("@/pages/customers/vouchers/VoucherListPage"));
const VoucherHistoryPage = lazy(() => import("@/pages/customers/vouchers/VoucherHistoryPage"));
const CampaignListPage = lazy(() => import("@/pages/customers/care/CampaignListPage"));
const CareHistoryDetailPage = lazy(() => import("@/pages/customers/care/CareHistoryDetailPage"));
const CareLogListPage = lazy(() => import("@/pages/customers/care/CareLogListPage"));
const CareLogDetailPage = lazy(() => import("@/pages/customers/care/CareLogDetailPage"));
const CareLogCreatePage = lazy(() => import("@/pages/customers/care/CareLogCreatePage"));
const CareLogEditPage = lazy(() => import("@/pages/customers/care/CareLogEditPage"));


// Orders
const OrderListPage = lazy(() => import('@/pages/orders/OrderListPage'));
const OrderCreatePage = lazy(() => import('@/pages/orders/OrderCreatePage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
const PaymentLogListPage = lazy(() => import('@/pages/orders/PaymentLogListPage'));

// Users
const UserListPage = lazy(() => import('@/pages/users/UserListPage'));
const UserFormPage = lazy(() => import('@/pages/users/UserFormPage'));
const ShiftHistoryPage = lazy(() => import('@/pages/shifts/ShiftHistoryPage'));
const UserProfilePage = lazy(() => import('@/pages/profile/UserProfilePage'));

// Settings
const RoleSettingsPage = lazy(() => import('@/pages/settings/roles/RoleSettingsPage'));
const SystemSettingsPage = lazy(() => import('@/pages/settings/SystemSettingsPage'));

// Error Pages
const NotFoundPage = lazy(() => import('@/pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/errors/ForbiddenPage'));

// ── Route Config ──────────────────────────────────────────────────────────────
export const routes: RouteObject[] = [
  // Public Routes
  {
    element: <AuthLayout />,
    children: [{ path: "login", element: <LoginPage /> }],
  },
  // Standalone error pages (accessible without auth)
  { path: "/403", element: <ForbiddenPage /> },
  // Protected Routes
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
           // Index redirect
          { index: true, element: <IndexRedirect /> },

          // User Profile (accessible by all authenticated users)
          { path: "profile", element: <UserProfilePage /> },

          // Dashboard (Admin)
          {
            element: <PermissionRoute allowedPermissions={["VIEW_REPORT"]} />,
            children: [
              { path: "dashboard", element: <DashboardPage /> },
            ],
          },

          // Products, Suppliers & Warehouse (Admin, Kho)
          {
            element: <PermissionRoute allowedPermissions={["VIEW_PRODUCT", "VIEW_CATEGORY", "VIEW_RECEIPT", "VIEW_SUPPLIER"]} />,
            children: [
              { path: "products", element: <ProductListPage /> },
              { path: "products/:id", element: <ProductDetailPage /> },
              { path: "products/categories", element: <CategoryListPage /> },
              { path: "suppliers", element: <SupplierListPage /> },
              // Warehouse / Nhập kho
              { path: "warehouse/receipts", element: <ReceiptListPage /> },
              { path: "warehouse/receipts/:id", element: <ReceiptDetailPage /> },
              { path: "warehouse/stock-history", element: <StockHistoryPage /> },
            ],
          },
          // Products management
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_PRODUCT"]} />,
            children: [
              { path: "products/new", element: <ProductFormPage /> },
              { path: "products/:id/edit", element: <ProductFormPage /> },
            ],
          },
          // Warehouse receipts management
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_RECEIPT"]} />,
            children: [
              { path: "warehouse/receipts/new", element: <ReceiptCreatePage /> },
              { path: "warehouse/receipts/:id/edit", element: <ReceiptUpdatePage /> },
            ],
          },

          // Customers - xem danh sách (Sale, CS, Admin)
          {
            element: (
              <PermissionRoute allowedPermissions={["VIEW_CUSTOMER"]} />
            ),
            children: [
              {
                path: "customers",
                children: [
                  { index: true, element: <CustomerCenterPage /> },
                  { path: "list", element: <CustomerListPage /> },
                  { path: ":id", element: <CustomerDetailPage /> },
                  { path: "care/history", element: <CareLogListPage /> },
                  { path: "care/history/:id", element: <CareHistoryDetailPage /> },
                  { path: "care/history/log/:id", element: <CareLogDetailPage /> },
                  { path: "care/create/:customerId", element: <CareLogCreatePage /> },
                  { path: "care/history/log/:id/edit", element: <CareLogEditPage /> },
                ],
              },
            ],
          },
          // Customers creation (Sale, CS, Admin)
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_CUSTOMER", "CREATE_ORDER"]} />,
            children: [
              { path: "customers/new", element: <CustomerFormPage /> },
            ],
          },
          // Customers edit (Admin, CS)
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_CUSTOMER"]} />,
            children: [
              { path: "customers/edit/:id", element: <CustomerEditPage /> },
            ],
          },

          // Customer Groups & Campaigns - chỉ MANAGE_CUSTOMER / VIEW_CAMPAIGN (Admin, CS)
          {
            element: (
              <PermissionRoute allowedPermissions={["MANAGE_CUSTOMER", "VIEW_CAMPAIGN"]} />
            ),
            children: [
              {
                path: "customers",
                children: [
                  { path: "groups", element: <CustomerGroupListPage /> },
                  { path: "groups/vouchers", element: <VoucherListPage /> },
                  { path: "groups/vouchers/history", element: <VoucherHistoryPage /> },
                  { path: "groups/:id", element: <CustomerGroupDetailPage /> },
                  { path: "groups/:id/members", element: <CustomerGroupMembersPage /> },
                  { path: "care/campaigns", element: <CampaignListPage /> },
                ],
              },
            ],
          },

          // Orders List & Details (Admin, Sale, CS with VIEW_ORDER or CREATE_ORDER)
          {
            element: <PermissionRoute allowedPermissions={["VIEW_ORDER", "CREATE_ORDER"]} />,
            children: [
              { path: "orders", element: <OrderListPage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
              { path: "orders/payment-logs", element: <PaymentLogListPage /> },
            ],
          },
          
          // Create Order (Admin, Sale with CREATE_ORDER)
          {
            element: <PermissionRoute allowedPermissions={["CREATE_ORDER"]} />,
            children: [
              { path: "orders/new", element: <OrderCreatePage /> },
            ],
          },

          // Users (Admin ONLY)
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_USER", "VIEW_SHIFT"]} />,
            children: [
              { path: "users", element: <UserListPage /> },
              { path: "users/new", element: <UserFormPage /> },
              { path: "users/:id/edit", element: <UserFormPage /> },
              { path: "shifts/history", element: <ShiftHistoryPage /> },
            ],
          },

          // Settings (Admin & Managers)
          {
            element: <PermissionRoute allowedPermissions={["MANAGE_ROLE"]} />,
            children: [
              { path: "settings/roles", element: <RoleSettingsPage /> },
            ],
          },
          {
            element: <PermissionRoute allowedPermissions={[]} />, // We check ROLE_ADMIN in the component
            children: [
              { path: "settings/general", element: <SystemSettingsPage /> },
            ],
          },
          // Error page for Backend 403 (with layout)
          { path: "restricted", element: <ForbiddenPage /> },
        ],
      },
    ],
  },
  // Fallback: 404 for any unmatched route
  { path: "*", element: <NotFoundPage /> },
];

export { ForbiddenPage };