# Vue Sales Manager

Ứng dụng quản lý sản phẩm, tạo đơn hàng nhiều sản phẩm và theo dõi quá trình vận chuyển hàng về Việt Nam. Hệ thống quản lý giá nhập, giá bán, doanh thu, vốn và lợi nhuận ở từng dòng sản phẩm cũng như toàn bộ đơn hàng.

## Công nghệ

- Frontend: Vue 3, Composition API, Vue Router và Vite.
- Backend: Node.js, Express.
- Lưu trữ: PostgreSQL cho production/pre-prod, có migration SQL tuần tự.
- Kiểm thử: Vitest và Supertest.

## Chức năng chính

- Dashboard thống kê đơn hàng, sản phẩm, doanh thu, vốn và lợi nhuận từ backend.
- Quản lý sản phẩm: tìm kiếm, lọc nơi mua, thêm, sửa, xóa và xem ảnh.
- Quản lý đơn hàng nhiều sản phẩm: tìm kiếm, lọc trạng thái/ngày, thêm, sửa, xem và xóa.
- Tùy chỉnh số lượng, giá nhập, giá bán và nơi nhập thực tế cho từng sản phẩm trong đơn.
- Theo dõi năm trạng thái vận chuyển, thanh tiến trình và thời điểm hoàn thành.
- Giao diện tiếng Việt, responsive cho desktop và điện thoại.
- Loading, empty state, validation, thông báo thành công/lỗi và xác nhận trước khi xóa.
- Dữ liệu tồn tại sau khi backend khởi động lại.

## Cấu trúc chính

```text
vue-sales-manager/
├── frontend/
│   └── src/
│       ├── components/     # Component dùng chung, sản phẩm và đơn hàng
│       ├── composables/    # Notification dùng chung
│       ├── router/         # Cấu hình Vue Router
│       ├── services/       # Toàn bộ lời gọi REST API
│       ├── utils/          # Định dạng tiền, ngày và trạng thái
│       └── views/          # Dashboard và các trang CRUD
└── backend/
    ├── migrations/         # SQL migrations cho PostgreSQL
    ├── test/               # Kiểm thử API
    └── src/
        ├── controllers/    # Nhận request và trả response
        ├── database/       # Kết nối PostgreSQL và chạy migration
        ├── middleware/     # Xử lý lỗi
        ├── models/         # Trạng thái đơn hàng
        ├── repositories/   # Repository PostgreSQL và fallback JSON cho test/local
        ├── routes/         # Định nghĩa REST API
        ├── scripts/        # Script migrate và import dữ liệu
        ├── services/       # Validation và nghiệp vụ
        └── utils/          # Tiện ích dùng chung
```

Controller không đọc hoặc ghi dữ liệu trực tiếp. Repository là lớp duy nhất truy cập dữ liệu, nên logic route/controller được giữ ổn định khi chạy PostgreSQL hoặc fallback nội bộ cho test.

## Yêu cầu

- Node.js `20.19+` hoặc `22.12+`; khuyến nghị dùng bản LTS hiện hành.
- npm.

## Cài đặt

Tại thư mục project:

```bash
npm install
npm run install:all
```

Có thể sao chép cấu hình mẫu nếu cần đổi cổng hoặc URL:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Để tách môi trường `pre-prod`, có thể tạo file env riêng:

```bash
cp backend/.env.preprod.example backend/.env.preprod
cp frontend/.env.preprod.example frontend/.env.preprod
```

Backend hỗ trợ:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
JWT_SECRET=replace-with-at-least-32-random-characters
```

Frontend hỗ trợ:

```env
VITE_API_URL=http://localhost:3000/api
```

Backend hỗ trợ nạp file env tùy chọn qua `ENV_FILE`. Ví dụ chạy backend hoặc migration bằng cấu hình `pre-prod`:

```bash
ENV_FILE=backend/.env.preprod npm run start --prefix backend
ENV_FILE=backend/.env.preprod npm run migrate --prefix backend
```

## Chạy development

Chạy đồng thời frontend và backend:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Health check: http://localhost:3000/api/health

Chạy riêng backend:

```bash
npm run dev --prefix backend
```

Chạy riêng frontend:

```bash
npm run dev --prefix frontend
```

## Build và test

```bash
npm run build
npm test
```

`npm run build` tạo bản frontend production trong `frontend/dist`. Backend hiện không phục vụ thư mục này; khi triển khai cần host static frontend riêng và cấu hình `VITE_API_URL`/`FRONTEND_URL` tương ứng.

## Admin test và pre-prod

Ứng dụng hiện dùng một tài khoản admin lấy trực tiếp từ biến môi trường, chưa có bảng `users`. Vì vậy cách đơn giản nhất để có admin test là cấu hình riêng cho từng môi trường:

```env
ADMIN_EMAIL=admin-preprod@example.com
ADMIN_PASSWORD=a-strong-preprod-password
JWT_SECRET=a-different-preprod-secret-with-32-plus-characters
```

Với hạ tầng Cloudflare + Neon + Render, flow khuyến nghị:

1. Tạo một database riêng trên Neon cho `pre-prod`, ví dụ `bong_a_paris_preprod`.
2. Điền connection string đó vào `backend/.env.preprod` hoặc biến môi trường của service pre-prod trên Render.
3. Cấu hình `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET` riêng cho pre-prod.
4. Chạy migration vào DB pre-prod trước:

```bash
ENV_FILE=backend/.env.preprod npm run migrate --prefix backend
```

5. Sau khi migration ổn, deploy backend pre-prod trên Render với đúng bộ biến môi trường đó.
6. Cấu hình frontend pre-prod trên Cloudflare trỏ `VITE_API_URL` về backend pre-prod.
7. Khi đã xác nhận ổn, mới chạy migration/deploy cho production.

Lợi ích của flow này là migration luôn được kiểm tra trên một DB Neon tách biệt trước khi chạm vào production.

## Frontend routes

| Đường dẫn | Chức năng |
|---|---|
| `/` | Dashboard |
| `/products` | Danh sách sản phẩm |
| `/products/create` | Thêm sản phẩm |
| `/products/:id/edit` | Sửa sản phẩm |
| `/orders` | Danh sách đơn hàng |
| `/orders/create` | Tạo đơn hàng |
| `/orders/:id` | Chi tiết và cập nhật trạng thái |
| `/orders/:id/edit` | Sửa đơn hàng |

## REST API

Response thành công:

```json
{
  "success": true,
  "message": "Tạo đơn hàng thành công",
  "data": {}
}
```

Response lỗi validation:

```json
{
  "success": false,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "customerName",
      "message": "Tên khách hàng không được để trống"
    }
  ]
}
```

### Product API

| Method | API | Chức năng |
|---|---|---|
| `GET` | `/api/products` | Danh sách sản phẩm |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm |
| `POST` | `/api/products` | Tạo sản phẩm |
| `PUT` | `/api/products/:id` | Cập nhật sản phẩm |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm |

Query danh sách:

```text
GET /api/products?search=tui&purchaseLocation=Taobao
```

### Order API

| Method | API | Chức năng |
|---|---|---|
| `GET` | `/api/orders` | Danh sách đơn hàng |
| `GET` | `/api/orders/:id` | Chi tiết đơn hàng |
| `POST` | `/api/orders` | Tạo đơn hàng |
| `PUT` | `/api/orders/:id` | Cập nhật đơn hàng |
| `PATCH` | `/api/orders/:id/status` | Cập nhật trạng thái |
| `DELETE` | `/api/orders/:id` | Xóa đơn hàng |

Query danh sách:

```text
GET /api/orders?search=nguyen&status=PURCHASED
GET /api/orders?fromDate=2026-01-01&toDate=2026-12-31
```

Cập nhật trạng thái:

```json
{
  "status": "ARRIVED_IN_VIETNAM"
}
```

### Dashboard API

```text
GET /api/dashboard/summary
```

API trả tổng hợp đơn hàng, tài chính, số đơn theo trạng thái, doanh thu/lợi nhuận theo tháng, năm đơn gần nhất và top sản phẩm theo doanh thu.

## Trạng thái đơn hàng

| Giá trị | Hiển thị |
|---|---|
| `PURCHASED` | Đã mua |
| `SHIPPED_TO_VIETNAM` | Đã gửi vận chuyển |
| `ARRIVED_IN_VIETNAM` | Đã đến Việt Nam |
| `OUT_FOR_DELIVERY` | Đang trên đường giao |
| `COMPLETED` | Hoàn thành |

Luồng mặc định:

```text
Đã mua → Đã gửi vận chuyển → Đã đến Việt Nam → Đang trên đường giao → Hoàn thành
```

Khi chuyển sang `COMPLETED`, backend tự đặt `completedAt`. Khi chuyển về trạng thái khác, `completedAt` trở lại `null`.

## Công thức tài chính

Backend luôn tính lại các trường tài chính, không tin tưởng giá trị tổng gửi từ frontend:

```text
lineCost = quantity × purchasePrice
lineRevenue = quantity × salePrice
lineProfit = lineRevenue - lineCost

totalCost = tổng lineCost
totalRevenue = tổng lineRevenue
totalProfit = totalRevenue - totalCost
```

## Lưu trữ dữ liệu

- Dữ liệu chạy trên PostgreSQL qua `DATABASE_URL`.
- Migration nằm trong `backend/migrations/*.sql`.
- Backend tự chạy migration khi khởi động và cũng có thể chạy thủ công bằng `npm run migrate --prefix backend`.
- Repository JSON cũ vẫn còn trong codebase để phục vụ test và fallback nội bộ, nhưng môi trường deploy nên dùng PostgreSQL.

## Hạn chế hiện tại

- Chỉ hỗ trợ một tài khoản admin cấu hình qua biến môi trường.
- Chưa có quản lý tồn kho, thanh toán, hủy đơn hoặc lịch sử từng lần đổi trạng thái.
- Dashboard tổng hợp giá trị của tất cả đơn, bao gồm cả đơn chưa hoàn thành.
- Chưa có phân trang khi số lượng sản phẩm và đơn hàng lớn.
- URL ảnh được lưu trực tiếp; ứng dụng chưa hỗ trợ upload file ảnh.

## Hướng phát triển

- Thêm bảng `users` nếu cần nhiều tài khoản admin/nhân viên thay vì chỉ dùng env.
- Thêm lịch sử trạng thái, hủy/hoàn tiền và quản lý thanh toán.
- Thêm upload ảnh, phân trang, export Excel/PDF và báo cáo nâng cao.
- Bổ sung kiểm thử frontend và kiểm thử end-to-end.
