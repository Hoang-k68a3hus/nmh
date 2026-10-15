# Task0_1 — Khởi tạo dự án và nền HTML/CSS

- Trạng thái: DONE
- Phụ thuộc: không
- Ưu tiên: bắt buộc

## Mục tiêu

Tạo nền website tĩnh chạy được với năm section, có cấu trúc semantic và dễ bổ sung đồ họa.

## Công việc

- Kiểm tra repository và hướng dẫn cục bộ trước khi sửa file; giữ nguyên tài liệu trong `task/`.
- Khởi tạo Vite + JavaScript ES modules, cài Three.js và GSAP; chỉ dùng một package manager và một lockfile.
- Tạo scripts `dev`, `build`, `preview`; ghi yêu cầu Node dựa trên phiên bản Vite thực tế đã chọn.
- Khởi tạo cấu trúc module theo `00_architecture.md`, chỉ tạo file khi có trách nhiệm thực tế.
- Tạo `main` và các section có ID `intro`, `garden`, `wishes`, `letter`, `finale`.
- Thêm `lang="vi"`, viewport, title và mô tả chia sẻ cơ bản; ảnh preview dùng minh họa hoa trung tính.
- Tạo vùng điều khiển nhạc tách biệt; chưa có file audio thì không hiển thị nút.
- Thiết lập base URL cho asset và build để hỗ trợ hosting ở root hoặc thư mục con.
- Thêm `noscript` với lời chúc chung và thông báo ngắn.
- Tạo README gốc với lệnh cài, chạy, build và preview khi mã nguồn được triển khai.

## Đầu ra

`package.json`, lockfile, `index.html`, entry JS, CSS nền và khung năm section.

## Tiêu chí hoàn thành

- [x] Cài dependency và chạy dev thành công trong môi trường thực tế.
- [x] Build và preview thành công.
- [x] Có đủ năm section theo thứ tự, không có section kỷ niệm/lời hẹn.
- [x] Trang có ngôn ngữ tiếng Việt và cấu trúc heading hợp lý.
- [x] Nội dung khung đọc được ở 360 px và desktop, chưa cần Three.js.
- [x] Hướng dẫn chạy ghi đúng các lệnh đã kiểm tra.

## Kiểm tra phù hợp

Chạy build và mở bản preview để kiểm tra khung trang. Chưa cần viết unit test cho markup tĩnh.

Đã kiểm tra ngày 14/10/2026: dev/preview HTTP 200, build root và `/2010/`, Chrome headless desktop 1440 px và mobile 360/390 px. Chi tiết tại [verification](../docs/verification.md).
