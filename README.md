# Vue Sales Manager

Ứng dụng quản lý sản phẩm, tạo đơn hàng nhiều sản phẩm và theo dõi quá trình vận chuyển hàng về Việt Nam. Hệ thống quản lý giá nhập, giá bán, doanh thu, vốn và lợi nhuận ở từng dòng sản phẩm cũng như toàn bộ đơn hàng.

## Công nghệ

- Frontend: Vue 3, Composition API, Vue Router và Vite.
- Backend: Node.js, Express.
- Lưu trữ: file JSON với thao tác ghi nguyên tử và hàng đợi ghi tuần tự.
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
    ├── data/               # products.json và orders.json
    ├── test/               # Kiểm thử API
    └── src/
        ├── controllers/    # Nhận request và trả response
        ├── data/           # Dữ liệu mẫu dùng khi chưa có file JSON
        ├── middleware/     # Xử lý lỗi
        ├── models/         # Trạng thái đơn hàng
        ├── repositories/   # Truy cập dữ liệu JSON
        ├── routes/         # Định nghĩa REST API
        ├── services/       # Validation và nghiệp vụ
        └── utils/          # JSON store và tiện ích lỗi
```

Controller không đọc hoặc ghi file trực tiếp. Repository là lớp duy nhất truy cập dữ liệu, vì vậy có thể thay bằng PostgreSQL hoặc MySQL mà không cần thay đổi route và controller.

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

Backend hỗ trợ:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Frontend hỗ trợ:

```env
VITE_API_URL=http://localhost:3000/api
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

- Dữ liệu nằm trong `backend/data/products.json` và `backend/data/orders.json`.
- Nếu file chưa tồn tại, backend tự tạo từ dữ liệu mẫu trong `backend/src/data/seedData.js`.
- Ghi dữ liệu thông qua file tạm rồi đổi tên để tránh file JSON bị ghi dở.
- Các thao tác thay đổi dữ liệu trong một tiến trình backend được đưa vào hàng đợi để tránh nhiều request ghi đè nhau.

## Hạn chế hiện tại

- Chưa có đăng nhập và phân quyền.
- JSON phù hợp cho một tiến trình backend và quy mô nhỏ; chưa phù hợp với nhiều server cùng ghi dữ liệu.
- Chưa có quản lý tồn kho, thanh toán, hủy đơn hoặc lịch sử từng lần đổi trạng thái.
- Dashboard tổng hợp giá trị của tất cả đơn, bao gồm cả đơn chưa hoàn thành.
- Chưa có phân trang khi số lượng sản phẩm và đơn hàng lớn.
- URL ảnh được lưu trực tiếp; ứng dụng chưa hỗ trợ upload file ảnh.

## Hướng phát triển

- Chuyển repository sang PostgreSQL/MySQL và thêm migration.
- Thêm JWT, tài khoản và phân quyền nhân viên/quản trị.
- Thêm lịch sử trạng thái, hủy/hoàn tiền và quản lý thanh toán.
- Thêm upload ảnh, phân trang, export Excel/PDF và báo cáo nâng cao.
- Bổ sung kiểm thử frontend và kiểm thử end-to-end.
