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
- Docker Desktop, nếu muốn chạy PostgreSQL local bằng Docker Compose.

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

Để chạy PostgreSQL local bằng Docker:

```bash
cp backend/.env.local.example backend/.env.local
npm run db:local:up
npm run migrate:local
```

File `backend/.env.local` dùng PostgreSQL local tại port `5433`, hoàn toàn tách khỏi Neon production và pre-prod.

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

Chạy cả frontend và backend với PostgreSQL local:

```bash
npm run dev:local
```

Tắt PostgreSQL local khi không dùng:

```bash
npm run db:local:down
```

## Build và test

Kiểm tra backend bằng automated tests:

```bash
npm test
```

Build frontend production:

```bash
npm run build
```

Build frontend dùng cấu hình `pre-prod`:

```bash
npm run build:preprod
```

Lệnh này chạy migration vào Neon `pre-prod`, sau đó build frontend bằng `frontend/.env.preprod`. `npm run build` chỉ build frontend production và không chạy migration.

Frontend build nằm trong `frontend/dist`. Backend không phục vụ thư mục này; frontend được deploy riêng trên Cloudflare Workers.

## Chạy và deploy thủ công

Push code lên Git không bắt buộc phải deploy ngay. Có thể tắt auto-deploy trên Render và Cloudflare, sau đó chạy deploy thủ công khi cần.

### Chạy local

Chạy cả backend và frontend:

```bash
npm run dev
```

Chạy backend local với Neon `pre-prod`:

```bash
ENV_FILE=backend/.env.preprod npm run dev --prefix backend
```

Frontend local mặc định gọi `http://localhost:3000/api` theo `frontend/.env`. Khi cần gọi backend pre-prod, đặt `VITE_API_URL` trong file env tương ứng rồi chạy Vite với mode phù hợp.

### Deploy frontend bằng CLI

Đứng tại thư mục root của project và đảm bảo đã đăng nhập Cloudflare:

```bash
npx wrangler login
```

Deploy production:

```bash
npm run build
npx wrangler deploy --config frontend/wrangler.jsonc
```

Deploy `pre-prod`:

```bash
npm run build:preprod
npx wrangler deploy --config frontend/wrangler.jsonc --env preprod
```

Worker production là `bong-a-paris`; Worker `pre-prod` là `bong-a-paris-preprod`, theo cấu hình trong `frontend/wrangler.jsonc`.

Nếu chạy lệnh từ thư mục root, dùng:

```bash
npm run build
npx wrangler deploy --config frontend/wrangler.jsonc
```

### Deploy backend thủ công trên Render

Render thường được điều khiển thuận tiện nhất từ Dashboard:

1. Mở service backend production hoặc `pre-prod`.
2. Vào **Settings** và tắt **Auto-Deploy** nếu không muốn push code là deploy.
3. Khi muốn deploy, chọn **Manual Deploy** → **Deploy latest commit**.
4. Kiểm tra log build/start và endpoint `/api/health`.

Render sẽ chạy `npm ci`, sau đó `npm start`. Backend tự chạy migration khi khởi động bằng `DATABASE_URL` của service đó.

Nếu muốn kích hoạt Render từ CLI, có thể tạo **Deploy Hook** trong Render rồi gọi URL hook:

```bash
curl -X POST "$RENDER_DEPLOY_HOOK_URL"
```

Không commit deploy hook URL vào repository; hãy lưu nó trong biến môi trường local.

### Quy trình release thủ công khuyến nghị

```bash
npm test
npm run build:preprod
```

Sau đó:

1. Deploy backend `pre-prod` thủ công trên Render.
2. Deploy Worker `pre-prod` bằng `npx wrangler deploy --config frontend/wrangler.jsonc --env preprod`.
3. Test login, product, order, dashboard và kiểm tra dữ liệu trong Neon branch `pre-prod`.
4. Khi ổn, deploy production backend trên Render.
5. Deploy Worker production bằng `npx wrangler deploy --config frontend/wrangler.jsonc`.

## Test migration trên database local

Quy trình khuyến nghị trước khi push code:

```bash
npm run db:local:up
npm run migrate:local
npm test
npm run build
```

Sau đó chạy app local:

```bash
npm run dev:local
```

Kiểm tra frontend tại `http://localhost:5173` và backend tại `http://localhost:3000`. Khi thêm migration mới, chạy lại `npm run migrate:local`; migration đã áp dụng sẽ được bỏ qua bởi bảng `schema_migrations`.

`npm run db:local:down` chỉ dừng container và giữ lại dữ liệu trong Docker volume. Không dùng `docker compose down -v` trừ khi muốn xóa toàn bộ database local.

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

| Đường dẫn            | Chức năng                       |
| -------------------- | ------------------------------- |
| `/`                  | Dashboard                       |
| `/products`          | Danh sách sản phẩm              |
| `/products/create`   | Thêm sản phẩm                   |
| `/products/:id/edit` | Sửa sản phẩm                    |
| `/orders`            | Danh sách đơn hàng              |
| `/orders/create`     | Tạo đơn hàng                    |
| `/orders/:id`        | Chi tiết và cập nhật trạng thái |
| `/orders/:id/edit`   | Sửa đơn hàng                    |

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

| Method   | API                 | Chức năng          |
| -------- | ------------------- | ------------------ |
| `GET`    | `/api/products`     | Danh sách sản phẩm |
| `GET`    | `/api/products/:id` | Chi tiết sản phẩm  |
| `POST`   | `/api/products`     | Tạo sản phẩm       |
| `PUT`    | `/api/products/:id` | Cập nhật sản phẩm  |
| `DELETE` | `/api/products/:id` | Xóa sản phẩm       |

Query danh sách:

```text
GET /api/products?search=tui&purchaseLocation=Taobao
```

### Order API

| Method   | API                      | Chức năng           |
| -------- | ------------------------ | ------------------- |
| `GET`    | `/api/orders`            | Danh sách đơn hàng  |
| `GET`    | `/api/orders/:id`        | Chi tiết đơn hàng   |
| `POST`   | `/api/orders`            | Tạo đơn hàng        |
| `PUT`    | `/api/orders/:id`        | Cập nhật đơn hàng   |
| `PATCH`  | `/api/orders/:id/status` | Cập nhật trạng thái |
| `DELETE` | `/api/orders/:id`        | Xóa đơn hàng        |

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

| Giá trị              | Hiển thị             |
| -------------------- | -------------------- |
| `PURCHASED`          | Đã mua               |
| `SHIPPED_TO_VIETNAM` | Đã gửi vận chuyển    |
| `ARRIVED_IN_VIETNAM` | Đã đến Việt Nam      |
| `OUT_FOR_DELIVERY`   | Đang trên đường giao |
| `COMPLETED`          | Hoàn thành           |

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
