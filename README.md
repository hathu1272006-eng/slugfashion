# SlugFashion — MỐC Studio

Ứng dụng xem và tìm kiếm thời trang: Angular 20, Express, MongoDB.
Giao diện mới dùng tông kem/xanh rêu, bố cục tạp chí, bảng có cột IdF và trang chi tiết hai cột.

Mã nguồn ứng dụng ở:
`K244111427_ChiemCaoPhuSlugFashion-main/K244111427_ChiemCaoPhuSlugFashion-main`

## Chạy ứng dụng

Yêu cầu: Node.js 22.12+ hoặc 24, npm, MongoDB đang chạy trên máy.

Mở terminal tại thư mục ứng dụng nêu trên:

```bash
npm ci
npm --prefix my-sever/my-sever-mongodb ci
npm --prefix my-sever/my-sever-mongodb start
```

Giữ terminal backend mở. Mở terminal thứ hai tại cùng thư mục ứng dụng:

```bash
npm start
```

Mở http://localhost:4200. Backend mặc định http://localhost:3002.
Angular development proxy chuyển `/fashions` và các đường dẫn con đến backend.

Biến môi trường tùy chọn cho backend: `PORT`, `MONGODB_URI`, `MONGODB_DATABASE`.
Nếu đổi cổng backend, cập nhật `proxy.conf.json`. Khi triển khai production,
cần cấu hình web server chuyển `/fashions*` đến API và các route giao diện về `index.html`.

## Dữ liệu và IdF

Database mặc định: `FashionData`; collection: `Fashion`.

Mỗi bản ghi gồm:
- `_id`: ObjectId của MongoDB, giữ nguyên.
- `IdF`: số nguyên dương an toàn, không trùng.
- `slug`: tiêu đề không dấu nối bằng dấu gạch ngang, thêm `-IdF`.
- `style`, `fashion_subject`, `fashion_detail`, `fashion_image`.

Ví dụ: `fashion_subject: "Áo khoác nữ"`, `IdF: 12` → `ao-khoac-nu-12`.

Backend tự chuẩn hóa metadata **khi khởi động**, trước khi nhận yêu cầu:
1. Giữ IdF hợp lệ; cấp số lớn hơn IdF lớn nhất cho bản ghi thiếu, sai kiểu hoặc trùng ID.
2. Tạo lại slug theo tiêu đề và IdF.
3. Tạo unique index trên cả IdF và slug.

Quá trình này cập nhật các bản ghi hiện có. Nên sao lưu database trước lần chạy đầu.
Chạy lại không đổi metadata đã đúng; các slug cũ không đúng quy tắc có thể được thay thế.
Nếu sửa tiêu đề hoặc nhập thêm dữ liệu trực tiếp vào MongoDB, khởi động lại backend để chuẩn hóa.
Chạy một tiến trình backend trong lúc chuẩn hóa; đây là ứng dụng đọc dữ liệu, chưa có API thêm/sửa/xóa Fashion.

Ảnh hỗ trợ Base64, data URL ảnh, URL HTTP(S) hoặc đường dẫn `/assets/`.
Giao diện danh sách/chi tiết hiển thị ô thay thế nếu thiếu hoặc lỗi ảnh.
Repo không chứa dữ liệu thật của database và không tự chèn mẫu dữ liệu.

## Luồng slug → chi tiết

1. Chọn slug trong bảng danh sách hoặc kết quả tìm kiếm.
2. Angular mở `/fashion-detail/:slug` và gọi `GET /fashions/slug/:slug`.
3. Backend kiểm tra định dạng, lấy IdF từ đoạn số cuối cùng.
4. Truy vấn MongoDB bằng **cả IdF lẫn slug đầy đủ**.
5. Trả đúng bản ghi; slug sai định dạng trả 400, không tìm thấy trả 404.
6. Angular hủy yêu cầu chi tiết trước nếu người dùng đổi slug để tránh hiển thị dữ liệu cũ.

Hai thiết kế trùng tên vẫn có slug khác nhau nhờ hậu tố IdF.
Slug có tên sai nhưng số cuối trùng một bản ghi sẽ không hiển thị bản ghi đó.

## Các trang

- `/fashion-list`: bảng IdF, ảnh, chủ đề, phong cách, slug; lọc theo phong cách.
- `/fashion-detail`: nhập slug để tra cứu.
- `/fashion-detail/:slug`: ảnh lớn, mô tả, IdF, phong cách và slug.
- `/search-fashion`: tìm theo chủ đề/mô tả bằng Jaccard; chuẩn hóa tiếng Việt không dấu.

Các route bài tập khác trước đây tham chiếu component không có trong repo đã được bỏ khỏi
cấu hình ứng dụng độc lập này. Các file khởi động, module và cấu hình Angular đã được bổ sung.

## Kiểm tra

```bash
npm run build
npm test
```

12 kiểm thử Node.js bao phủ tạo/đọc slug, ID thiếu/trùng/sai kiểu, giới hạn số,
chuẩn hóa lặp lại, sửa slug bị hoán đổi, lỗi kết nối và các API chi tiết.
Các kiểm thử sử dụng collection giả lập, không truy cập MongoDB thật.

Để kiểm tra trình duyệt, chạy `npm start` trong terminal riêng, rồi:

```bash
npx playwright install chromium
npm run test:browser
```

Kiểm tra trình duyệt dùng dữ liệu giả lập: chọn slug, phân biệt hai thiết kế cùng tên,
tải lại URL chi tiết, tra cứu, tìm tiếng Việt không dấu, màn hình nhỏ, trạng thái rỗng/lỗi.
Không sửa dữ liệu MongoDB.

## Phông chữ tiếng Việt

Ứng dụng đóng gói Noto Sans Variable và Noto Serif Variable qua Fontsource (giấy phép OFL-1.1),
gồm bộ ký tự tiếng Việt và kiểu nghiêng thật. Font được phục vụ cùng ứng dụng;
trình duyệt không cần tải font từ Google Fonts hoặc cài font trên máy.
Sau khi cập nhật bản sửa font, chạy lại `npm ci`, `npm start` và tải lại trang bằng Ctrl+F5.

## Khi giảng viên đã có MongoDB và dataset

`localhost` luôn chỉ máy đang chạy backend. Backend trên máy giảng viên dùng MongoDB
của giảng viên, không kết nối đến máy sinh viên. Nếu dataset đã có trong
`FashionData.Fashion` và MongoDB nghe ở `127.0.0.1:27017` thì không cần nhập lại dữ liệu.
Giảng viên chạy backend rồi frontend theo phần hướng dẫn trên; backend tự chuẩn hóa
IdF và slug khi khởi động. Nếu địa chỉ hoặc tên database khác, cấu hình
`MONGODB_URI` / `MONGODB_DATABASE` trước khi chạy backend. Collection mặc định là `Fashion`.
Nộp mã nguồn và README; chỉ cần kèm dataset nếu bên nhận chưa có dữ liệu hoặc yêu cầu riêng.
