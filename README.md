# Clothing Shop POS — Hệ Thống Quản Lý Cửa Hàng Thời Trang (Frontend)

Dự án Frontend cho hệ thống POS cửa hàng thời trang. Dự án được xây dựng dựa trên kiến trúc **Feature-Modules Pattern**, đạt tiêu chuẩn Enterprise, tối ưu cho việc làm việc nhóm, dễ dàng mở rộng, bảo trì và chia nhỏ các chức năng thành các khối độc lập.

---

## Tech Stack

- **Core:** React 19, TypeScript
- **Build Tool:** Vite
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`), React Redux
- **Routing:** React Router DOM v6
- **Network / API:** Axios
- **Styling:** CSS Modules / Vanilla CSS (với CSS Variables)

---

## Kiến Trúc Dự Án (Feature-Modules Pattern)

Kiến trúc chia hệ thống thành các **Domain / Feature** riêng biệt. Thay vì chia theo tầng công nghệ (ví dụ: gộp chung tất cả API vào 1 thư mục, tất cả Components vào 1 thư mục), dự án nhóm code theo **tính năng nghiệp vụ**.

### Ưu điểm:
- Dễ dàng quản lý khi dự án phình to (Scale-ability).
- Developer làm việc trên tính năng nào chỉ cần tập trung vào thư mục của tính năng đó.
- Dễ dàng gỡ bỏ hoặc refactor một tính năng mà không ảnh hưởng tới toàn bộ hệ thống.

### Sơ đồ Cấu Trúc:

```text
src/
├── app/                            # Tầng Bootstrapping của ứng dụng
│   ├── providers/                  # Context/Providers (Redux, Theme, Modal...)
│   ├── router/                     # Định nghĩa routes, Guard (Private/Admin Route)
│   └── App.tsx                     # Root Component
│
├── features/                       # CÁC MODULE NGHIỆP VỤ CHÍNH
│   ├── auth/                       # Module Đăng nhập & Xác thực
│   ├── dashboard/                  # Module Thống kê
│   ├── products/                   # Module Quản lý Sản phẩm
│   ├── customers/                  # Module Quản lý Khách hàng
│   ├── invoices/                   # Module Bán hàng (POS) & Hóa đơn
│   ├── warehouse/                  # Module Quản lý Kho, NCC, Nhập/Trả hàng
│   └── users/                      # Module Quản lý Nhân sự (Admin)
│
├── shared/                         # Tài nguyên DÙNG CHUNG toàn hệ thống
│   ├── api/                        # Cấu hình Axios, Interceptors
│   ├── components/ui/              # Atomic UI Components (Button, Modal, Input...)
│   ├── hooks/                      # Custom hooks chung (useDebounce, usePagination)
│   ├── types/                      # Common TypeScript interfaces
│   └── utils/                      # Constants, Formatters, Validators
│
├── layouts/                        # Tầng Layout tổng thể
│   ├── MainLayout/                 # Layout chính sau đăng nhập (Sidebar, Header)
│   └── AuthLayout/                 # Layout trang đăng nhập
│
├── store/                          # Cấu hình Redux Store gốc
│   ├── index.ts                    # Root Reducer
│   └── hooks.ts                    # Typed Hooks cho Redux
│
├── config/                         # Cấu hình Môi trường
│   └── env.ts                      # Đọc biến môi trường (Type-safe)
│
└── styles/                         # CSS Toàn cục (Reset, Variables)
```

---

## Cấu Trúc Của Một Feature Chuẩn

Khi tạo một tính năng mới (Ví dụ: `products`), bắt buộc tuân theo cấu trúc sau trong thư mục `src/features/[feature-name]`:

```text
products/
├── api/                  # Các hàm gọi API (VD: productApi.ts)
├── components/           # Components UI đặc thù của tính năng này (VD: ProductTable.tsx)
├── hooks/                # Hooks riêng cho nghiệp vụ này (VD: useProductList.ts)
├── pages/                # Các trang chính gắn vào Router (VD: ProductListPage.tsx)
├── store/                # Redux Slices (VD: productSlice.ts)
├── types/                # Types/Interfaces từ Backend (VD: product.types.ts)
└── index.ts              # Public API của feature (Barrel Export)
```

> **Nguyên tắc ngầm định:** Các feature KHÔNG ĐƯỢC import trực tiếp logic nội bộ của nhau. Nếu cần dùng chung, hãy export nó qua file `index.ts` của feature đó, hoặc chuyển phần logic đó xuống `src/shared/`.

---

## Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống
- Node.js >= 18.x
- npm >= 9.x

### 2. Cài đặt dependencies
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc (root) dựa trên `.env.example`:
```bash
cp .env.example .env
```
Nội dung file `.env` (Mặc định trỏ về backend local):
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Khởi chạy môi trường Phát triển (Development)
```bash
npm run dev
```
- App chạy tại: `http://localhost:5173`
- Mọi request gọi bằng Axios đến `/api/*` sẽ được Vite tự động Proxy sang `VITE_API_BASE_URL` để tránh lỗi CORS.

### 5. Build cho Môi trường Production
```bash
npm run build
```
Thư mục sau khi build sẽ nằm ở `dist/`.

---

## Quy Ước Lập Trình (Coding Conventions)

### 1. Path Aliases
Luôn sử dụng `@/` để trỏ về thư mục `src/`. Tránh tuyệt đối Relative imports lồng nhau sâu.
- Sai: `import Button from '../../../../shared/components/ui/Button'`
- Đúng: `import Button from '@/shared/components/ui/Button'`

### 2. Gọi API & Xử lý Token
- **Tự động hóa JWT**: `axiosInstance` (tại `src/shared/api/axiosInstance.ts`) đã được cấu hình tự động lấy Token từ `localStorage` để gắn vào Header.
- **Auto-Refresh Token**: Khi backend trả về lỗi `401 Unauthorized`, `axiosInstance` sẽ tự động gọi API `/auth/refresh` (sử dụng Refresh Token Cookie) để lấy Access Token mới và thực hiện lại Request cũ. Developer không cần phải xử lý tay lỗi 401 ở mỗi hàm.

### 3. Xử lý State với Redux
- Redux chỉ nên dùng cho các Global State (User Login, Giỏ hàng POS, ...).
- Đối với Form Data cục bộ, vui lòng dùng `useState` hoặc các thư viện như `react-hook-form`.

### 4. Định tuyến (Routing) & Lazy Load
- Tất cả Page Components đều được nạp thông qua `React.lazy` tại `src/app/router/routeConfig.tsx`.
- Khi tạo Page mới, hãy khai báo vào `routeConfig.tsx`.
- Sử dụng `<PrivateRoute />` cho các route yêu cầu đăng nhập, và `<AdminRoute />` cho các route chỉ dành cho Quản trị viên.

---

## Danh Sách Chức Năng Hiện Tại (Skeleton)

- [x] **Auth:** Đăng nhập, Đăng xuất, Tự động refresh token.
- [x] **Dashboard:** Báo cáo tổng quan.
- [x] **POS / Invoices:** Giao diện bán hàng (Tạo hóa đơn), Lịch sử hóa đơn.
- [x] **Products:** Quản lý hàng hóa, thuộc tính (Màu, Size), Giá bán.
- [x] **Customers:** Khách hàng, Nhóm khách hàng.
- [x] **Warehouse:** Kho bãi, Nhà cung cấp, Phiếu nhập kho, Phiếu trả hàng.
- [x] **Users:** Quản trị viên quản lý nhân sự.

*Lưu ý: Tất cả các Pages và UI Components hiện đang ở trạng thái Skeleton (Chứa khung và comment TODO) để các Developer tiếp nhận và tiến hành triển khai Logic, UI chi tiết.*
