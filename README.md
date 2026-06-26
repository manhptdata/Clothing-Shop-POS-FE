# Sapo POS - Hệ Thống Quản Lý Cửa Hàng Thời Trang

Dự án phần mềm quản lý bán hàng (POS) Sapo, thiết kế chuyên biệt cho cửa hàng thời trang và bán lẻ. Hệ thống áp dụng kiến trúc module hóa nhằm đảm bảo khả năng mở rộng, dễ dàng bảo trì và đáp ứng hiệu năng cao.

## 1. Nền Tảng Công Nghệ (Tech Stack)

### Frontend
- Core: React 19, TypeScript
- Build Tool: Vite
- Quản lý trạng thái (State Management): Redux Toolkit, RTK Query
- Thiết kế giao diện (Styling): Tailwind CSS
- Điều hướng (Routing): React Router DOM v6
- Xử lý Biểu mẫu (Forms): React Hook Form
- Biểu đồ (Charts): Recharts
- HTTP Client: Axios

### Backend
- Core: Spring Boot 3.3.6, Java 17
- Cơ sở dữ liệu: MySQL
- ORM: Spring Data JPA
- Xác thực & Phân quyền: Spring Security, OAuth2 Resource Server (JWT)
- Tài liệu API: SpringDoc OpenAPI (Swagger UI)
- Lọc dữ liệu động: Spring Filter (Turkraft)
- Tiện ích: Lombok

## 2. Kiến Trúc Dự Án (Frontend)

Cấu trúc mã nguồn tuân thủ nghiêm ngặt nguyên tắc Separation of Concerns và mô hình Domain-driven design.

- src/pages/: Chứa các component gắn với định tuyến, được chia theo từng module nghiệp vụ. Với các trang có trạng thái phức tạp (như POS Checkout), dự án áp dụng mẫu thiết kế Orchestrator Pattern, tách rời giao diện (UI components) khỏi logic nghiệp vụ thông qua các custom hooks chuyên biệt.
- src/components/: Chứa các component giao diện dùng chung toàn hệ thống (Buttons, Modals, Inputs, Tables) được xây dựng bằng Tailwind CSS.
- src/redux/: Cấu hình Redux store gốc và các API slices của RTK Query. Toàn bộ dữ liệu gọi từ máy chủ (Server state) được quản lý độc quyền qua RTK Query.
- src/types/: Chứa các interface TypeScript phản chiếu chính xác cấu trúc DTO từ backend.
- src/hooks/: Các hooks tiện ích dùng chung toàn cục (ví dụ: useDebounce).

## 3. Hướng Dẫn Cài Đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- npm >= 9.x
- Java 17 (Dành cho Backend)
- MySQL 8.x

### Thiết lập Frontend
1. Cài đặt các gói phụ thuộc:
npm install

2. Cấu hình biến môi trường:
Tạo file .env tại thư mục gốc và khai báo địa chỉ Backend API:
VITE_API_BASE_URL=http://localhost:8080

3. Khởi chạy máy chủ phát triển:
npm run dev

Ứng dụng sẽ chạy tại http://localhost:5173. 
Lưu ý: Mọi request API gọi tới đường dẫn /api đều tự động được proxy sang VITE_API_BASE_URL để tránh lỗi CORS khi code ở local.

4. Triển khai bản Production:
npm run build
Mã nguồn đã tối ưu sẽ được xuất ra thư mục dist/.

## 4. Tính Năng Cốt Lõi

- Bán hàng tại quầy (POS): Quản lý giỏ hàng, lưu trạng thái hóa đơn tạm (Pending orders) và điều phối logic trạng thái phức tạp.
- Quản lý Khách hàng (CRM): Quản lý hạng thành viên, tính toán điểm tích lũy và điều kiện áp dụng Voucher giảm giá.
- Thanh toán & Chốt đơn: Xử lý quy trình thanh toán tiền mặt (tự tính tiền thừa) và hỗ trợ giao diện thanh toán qua mã QR chuyển khoản.
- Quản lý Hàng hóa: Truy vết biến thể sản phẩm theo phân loại (màu sắc, kích thước) và đồng bộ tồn kho.
- Quản lý Đơn hàng: Truy xuất lịch sử giao dịch, cập nhật trạng thái đơn.
- Thống kê & Báo cáo: Cung cấp số liệu tổng quan trực quan thông qua biểu đồ Recharts.
- Xác thực & Phân quyền: Đăng nhập qua JWT tích hợp cơ chế phân quyền đường dẫn (Private/Admin Routes).

## 5. Quy Ước Lập Trình (Coding Conventions)

- Path Aliases: Bắt buộc sử dụng tiền tố @/ cho tất cả các import trỏ về thư mục src/. Đường dẫn tương đối (relative paths) chỉ được phép dùng cho các file nằm cùng cấp trong một thư mục nghiệp vụ.
- Quy tắc Quản lý State: Dùng RTK Query cho toàn bộ dữ liệu gọi từ API (Server state). Trạng thái giao diện cục bộ và biểu mẫu phải dùng React primitives (useState, useReducer) hoặc các custom hooks chuyên biệt.
- Quản lý Độ Phức Tạp: Các màn hình chức năng lớn bắt buộc phải được tái cấu trúc theo Orchestrator Pattern, trích xuất toàn bộ quy tắc nghiệp vụ sang thư mục hooks/ nội bộ của tính năng đó.
