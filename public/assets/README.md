# Tài nguyên món quà

- `photos/`: chỉ ảnh đã chọn và tối ưu để xuất bản; cấu hình dùng `assets/photos/...`.
- `audio/`: nhạc nền/giọng đọc tùy chọn; không tải khi chưa nhấn phát.
- `fonts/`: license của Cormorant Garamond và Be Vietnam Pro; file font được import từ package và Vite đưa vào build.
- `images/`: hình trang trí và favicon; không đặt chân dung người nhận làm preview mặc định.

Ảnh gốc đặt ở `.originals/photos/` ngoài `public/`, đã được ignore Git. Chạy `npm run prepare:photos` sau khi có ảnh. Công cụ in cấu hình width/height mới; sửa alt và focalPoint trước khi dùng.

Vite copy toàn bộ `public/` vào build. Không lưu bản gốc hoặc file riêng không định xuất bản trong thư mục này.
