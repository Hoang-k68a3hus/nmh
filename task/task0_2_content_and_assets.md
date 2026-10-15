# Task0_2 — Nội dung, ảnh và cấu hình

- Trạng thái: DONE
- Phụ thuộc: task0_1
- Ưu tiên: bắt buộc

## Mục tiêu

Đặt toàn bộ nội dung cá nhân hóa vào một file cấu hình, hỗ trợ ảnh cô ấy ở các phần lời chúc mà không cần album kỷ niệm.

## Công việc

- Triển khai schema trong `00_architecture.md` với kiểm tra tối thiểu cho trường bắt buộc, ID trùng và cấu trúc ảnh.
- Chuẩn bị 5 lời chúc mẫu theo chủ đề: niềm vui, tự tin, bình yên, điều em mong muốn, được yêu thương.
- Viết thư mẫu 180–300 từ, tránh bịa sự kiện hoặc hứa điều chưa được người dùng xác nhận.
- Nội dung mẫu phải có nhãn ở chế độ demo; tên/biệt danh dùng placeholder có thể tìm được.
- Dùng chuỗi văn bản thuần; không cho cấu hình nhúng HTML/script.
- Chuẩn bị luồng ảnh `null`, ảnh hợp lệ và ảnh lỗi. Khi chưa có ảnh, dùng hoa SVG, không tự lấy chân dung người lạ làm người nhận.
- Khi nhận ảnh thật, giữ bản gốc riêng, tạo bản web phù hợp, kiểm tra hướng ảnh và vùng crop khuôn mặt.
- Đặt tên asset trung tính, dùng WebP/AVIF nếu pipeline hỗ trợ; chọn độ phân giải theo vùng hiển thị thực tế.
- Ghi kích thước ảnh, alt, focalPoint trong cấu hình. Ảnh trang trí thuần dùng alt rỗng.
- Ảnh đầu màn hình nếu có tải ưu tiên; ảnh lời chúc phía dưới lazy-load. Giữ tỷ lệ khung trước khi tải.
- Nhạc và giọng đọc là tùy chọn; không tải file audio khi người xem chưa cần.
- Viết `docs/content-guide.md`: sửa tên, ngày, lời chúc, thư, ảnh, crop, audio và màu.

## Gợi ý nội dung mẫu

1. “Mong em luôn tìm thấy niềm vui trong những điều nhỏ bé.”
2. “Mong em luôn tự tin với những điều làm nên chính mình.”
3. “Mong những ngày mệt mỏi của em cũng có một chỗ để nghỉ ngơi.”
4. “Mong em có thời gian và can đảm dành cho những điều em yêu thích.”
5. “Mong em luôn cảm thấy mình được lắng nghe và yêu thương.”

Đây là nội dung khởi đầu, cần điều chỉnh theo giọng nói của người gửi trước bàn giao.

## Tiêu chí hoàn thành

- [x] Đổi nội dung qua cấu hình, không phải tìm sửa trong các timeline.
- [x] Có dữ liệu cho năm lời chúc, thư và lời kết.
- [x] Cả cấu hình có ảnh và không ảnh đều render đầy đủ.
- [x] Một ảnh lỗi không làm biến mất card hoặc lời chúc.
- [x] Không có dữ liệu mốc kỷ niệm, địa điểm hẹn hoặc bất ngờ cuối.
- [x] Có hướng dẫn thay ảnh và điều chỉnh crop.
- [x] Nếu chưa có nội dung thật, trạng thái demo vẫn được ghi rõ.

## Kiểm tra phù hợp

Kiểm tra cấu hình thiếu ảnh, ảnh sai đường dẫn và ID trùng. Có thể dùng test nhỏ cho validator nếu nó điều khiển hành vi lỗi; không cần test lặp lại từng câu chữ mẫu.

## Kết quả thực hiện — 14/10/2026

- Nội dung chính, tiêu đề, nhãn section/nút, ngày và metadata dùng chung `src/config/content.js`.
- Token tên/biệt danh/người gửi tự điền qua `prepareContent`, renderer chỉ dùng text.
- Validator báo trường sai, ID trùng, token sai, thông tin ảnh/crop/audio sai; không cho tắt demo khi còn marker mẫu.
- Check và build kiểm tra file ảnh/audio, kể cả chữ hoa/thường để tránh lỗi trên hosting Linux.
- Khi lỗi ảnh lúc đọc, card về hoa SVG; hero/thư gỡ ảnh và giữ toàn bộ lời chúc.
- `npm run prepare:photos` tạo WebP/AVIF, tự sửa hướng, giới hạn kích thước, giữ nguyên bản gốc và không ghi đè file đã có.
- 22 test pass; browser đã kiểm tra 0 ảnh, ảnh xen kẽ/đủ ảnh, ảnh thiếu/hỏng, text có ký tự HTML và audio chưa tải.
- Build root và `/2010/` pass; bản production dưới `/2010/` đã kiểm tra browser desktop/mobile giả lập.

Chưa có tên/ảnh/nhạc thật: bản hiện tại vẫn `isDemo: true`. Phần kỹ thuật của task đã hoàn thành; việc chọn ảnh thật, đọc lại câu chữ và kiểm tra crop thực tế tiếp tục khi người dùng cung cấp nội dung, trước bàn giao cuối.

Xem [hướng dẫn nội dung](../docs/content-guide.md) và [báo cáo kiểm tra](../docs/verification.md).
