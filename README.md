# Sapo POS - He Thong Quan Ly Cua Hang Thoi Trang

Du an phan mem quan ly ban hang (POS) Sapo, thiet ke chuyen biet cho cua hang thoi trang va ban le. He thong ap dung kien truc module hoa nham dam bao kha nang mo rong, de dang bao tri va dap ung hieu nang cao.

## 1. Nen Tang Cong Nghe (Tech Stack)

### Frontend
- Core: React 19, TypeScript
- Build Tool: Vite
- Quan ly trang thai (State Management): Redux Toolkit, RTK Query
- Thiet ke giao dien (Styling): Tailwind CSS
- Dieu huong (Routing): React Router DOM v6
- Xu ly Bieu mau (Forms): React Hook Form
- Bieu do (Charts): Recharts
- HTTP Client: Axios

### Backend
- Core: Spring Boot 3.3.6, Java 17
- Co so du lieu: MySQL 8.x
- ORM: Spring Data JPA
- Xac thuc & Phan quyen: Spring Security, OAuth2 Resource Server (JWT), Interceptor (Role-based access)
- Tai lieu API: SpringDoc OpenAPI (Swagger UI)
- Loc du lieu dong: Spring Filter (Turkraft)
- Tien ich: Lombok

## 2. Kien Truc Du An

Cau truc ma nguon tuân thu nghiem ngat nguyen tac Separation of Concerns va mo hinh Domain-driven design.

### Frontend
- src/pages/: Chua cac component gan voi dinh tuyen, duoc chia theo tung module nghiep vu. Voi cac trang co trang thai phuc tap (nhu POS Checkout), du an ap dung mau thiet ke Orchestrator Pattern, tach roi giao dien (UI components) khoi logic nghiep vu thong qua cac custom hooks chuyen biet (useCart, useCheckout,...).
- src/components/: Chua cac component giao dien dung chung toan he thong (Buttons, Modals, Inputs, Tables) duoc xay dung bang Tailwind CSS.
- src/redux/: Cau hinh Redux store goc va cac API slices cua RTK Query. Toan bo du lieu goi tu may chu duoc quan ly doc quyen qua RTK Query.
- src/types/: Chua cac interface TypeScript phan chieu chinh xac cau truc DTO tu backend.

### Backend
- Bao mat nhieu lop: Su dung SecurityFilterChain cho viec xac thuc Token va PermissionInterceptor cho viec phan quyen Route chi tiet dua tren RoleEnum (ADMIN, SALE, CS, WH).
- Cau truc thu muc: To chuc theo Domain (order, product, customer, auth,...) giup dong goi toan bo entity, controller, service, va repository cua tung nghiep vu vao cung mot noi.

## 3. Huong Dan Cai Dat

### Yeu cau he thong
- Node.js >= 18.x
- npm >= 9.x
- Java 17
- MySQL 8.x

### Thiet lap Backend (Spring Boot)
1. Cai dat MySQL va tao database.
2. Cau hinh chuoi ket noi database trong file application.properties hoac application.yml.
3. Chay ung dung qua IDE hoac Maven/Gradle. Backend se chay mac dinh tai cong 8080.

### Thiet lap Frontend (React + Vite)
1. Cai dat cac goi phu thuoc:
   npm install

2. Cau hinh bien moi truong:
   Tao file .env tai thu muc goc va khai bao dia chi Backend API:
   VITE_API_BASE_URL=http://localhost:8080

3. Khoi chay may chu phat trien:
   npm run dev

   Ung dung se chay tai http://localhost:5173. Moi request API goi toi duong dan /api deu duoc tu dong proxy sang VITE_API_BASE_URL.

4. Trien khai ban Production:
   npm run build
   Ma nguon da toi uu se duoc xuat ra thu muc dist/.

## 4. Tinh Nang Cot Loi (Features)

- Ban hang tai quay (POS): Quan ly gio hang, thanh toan tien mat hoac QR Code, luu trang thai hoa don tam (Pending orders).
- Quan ly Khach hang (CRM): Phan hang thanh vien, tinh toan diem tich luy (PointHistory), phan phoi Voucher, va chien dich cham soc khach hang (CareCampaign).
- Quan ly Hang hoa & Kho: Quan ly san pham nhieu bien the (Kich thuoc, Mau sac), nhap kho (Stock Receipt), chuyen kho (Stock Transfer) va luu vet lich su ton kho (Stock Log).
- Quan ly Don hang: Truc xuat lich su giao dich, chi tiet don hang.
- Thong ke & Bao cao: Cung cap so lieu tong quan ve doanh thu, trang thai don hang bang bieu do truc quan.
- Xac thuc & Phan quyen: Dang nhap qua JWT, phan quyen truy cap API va giao dien chat che theo 4 nhom quyen: Nhan vien ban hang (SALE), Cham soc khach hang (CS), Kho (WH) va Quan tri vien (ADMIN).

## 5. Quy Uoc Lap Trinh (Coding Conventions)

- Path Aliases: Bat buoc su dung tien to @/ cho tat ca cac import tro ve thu muc src/ o Frontend. Duong dan tuong doi chi duoc phep dung cho cac file nam cung cap trong mot thu muc nghiep vu.
- Quan ly State: Dung RTK Query cho toan bo du lieu API (Server state). Trang thai UI cuc bo dung React primitives.
- Orchestrator Pattern: Cac man hinh tinh nang lon phai duoc boc tach logic xuong tang custom hooks (hooks/ noi bo) de giu cho tang UI luon sach se va tap trung vao hien thi.
