# Task0_8 — Tích hợp, responsive và hiệu năng

- Trạng thái: DONE
- Phụ thuộc: task0_4, task0_5, task0_6, task0_7
- Ưu tiên: bắt buộc

## Mục tiêu

Nối năm cảnh thành trải nghiệm ổn định, không bị khóa bởi hoạt ảnh hoặc tài nguyên chậm.

## Công việc tích hợp

- Kết nối state manager tối giản với intro, scroll section, wish state và scene manager.
- Đồng bộ trạng thái khi cuộn xuôi/ngược, mở anchor, resize và replay.
- Đảm bảo phần nội dung hiện đúng nếu GSAP, Three.js hoặc một asset thất bại.
- Không dùng renderer loop để cập nhật DOM hoặc trạng thái lời chúc mỗi frame.
- Chỉ một nguồn điều phối visibility và motion preference; gỡ listener khi dispose.
- Nút điều khiển không phủ nội dung, tính cả safe-area trên điện thoại.
- Giữ natural scroll, không khóa body sau intro hoặc skip.

## Responsive và khả năng truy cập

- Kiểm tra 360, 390, 768 và 1440 CSS px; thêm landscape nhỏ.
- Dùng chiều cao viewport phù hợp trình duyệt mobile và tránh nút bị thanh địa chỉ che.
- Kiểm tra zoom 200%, nội dung dài và chữ tiếng Việt.
- Các tương tác chính dùng được bằng Tab, Enter, Space, có focus rõ.
- DOM đọc theo thứ tự câu chuyện dù desktop đảo cột ảnh/chữ.
- Reduced motion có hiệu lực cả khi thay preference trong lúc trang đang mở nếu môi trường hỗ trợ.
- Control âm thanh có nhãn theo trạng thái thực, tránh thông báo aria-live quá thường xuyên.
- Không để hạt sáng hoặc SVG trang trí gây vùng cuộn ngang.

## Hiệu năng

- Lazy-load Three.js và ảnh dưới màn hình đầu; audio tải theo nhu cầu.
- Giữ kích thước khung ảnh, giảm layout shift.
- Giới hạn DPR, số hạt và độ phức tạp geometry; tắt hiệu ứng trước khi giảm chất lượng nội dung.
- Dừng render ở section thư/lời chúc nếu 3D không hiện và khi document ẩn.
- Dùng preset mobile/reduced, chỉ bổ sung tự điều chỉnh chất lượng nếu có số đo chứng minh cần thiết.
- Kiểm tra không có memory/listener tăng sau nhiều lượt replay.
- Đo kích thước build, ảnh và độ mượt theo mục tiêu kiến trúc; ghi số đo thực tế, không coi mục tiêu là kết quả đã đạt.

## Tiêu chí hoàn thành

- [x] Luồng đầu–cuối–xem lại hoàn chỉnh.
- [x] Không tràn ngang hoặc control che lời chúc ở các viewport kiểm tra.
- [x] 3D/audio/ảnh lỗi riêng lẻ không làm mất nội dung chính.
- [x] Render loop dừng khi không cần và tiếp tục đúng khi cần.
- [x] Reduced motion và bàn phím dùng được xuyên suốt.
- [x] Có số liệu build/asset và ghi nhận hiệu năng thực tế.
- [x] Những hạn chế chưa kiểm chứng được ghi lại, không đánh dấu đã pass.

## Kiểm tra phù hợp

Build production rồi kiểm tra trên preview HTTP. Dùng công cụ trình duyệt sẵn có để xem network, console, hiệu năng và accessibility; không cần tạo một bộ unit test cho hiệu ứng trang trí.

## Kết quả — 14/10/2026

- `page-state.js` là nguồn chung cho hidden/reduced/pointer/viewport/activeSection; scroll/resize gộp một RAF, component unsubscribe đúng vòng đời. Intro/hoa/audio giữ state riêng và nối cùng replay.
- Reveal card dùng CSS/IntersectionObserver, GSAP chỉ tải theo nút mở; Three.js lazy theo host. Font giữ unicode-range tiếng Việt và chỉ đóng gói 8 WOFF2 Latin/Vietnamese. Ảnh hero/card/thư đều lazy, có khung giữ tỷ lệ và fallback.
- Cánh/lá InstancedMesh giảm 107 xuống 40 draw calls, giữ số tam giác/hình hoa. Renderer không ghi frame/progress vào DOM mỗi frame; nơ chỉ cập nhật khi đổi giai đoạn/resize. Nhịp RAF giữ FPS preset khi jitter, vẫn clamp delta và không render dồn.
- Header/shell/footer có safe-area; nút skip ở trong luồng trang. Chrome kiểm tra 360/390/768/1440 px và landscape 667×375, reflow/độ nét zoom 200% mô phỏng 720×500/DPR 2, chữ/tên/caption/nhãn dài, 7 ảnh và Tab/Enter/Space đều đạt.
- `npm.cmd run check`: PASS, 51 file JS/MJS; `npm.cmd test`: PASS, 77/77. Build root và `/2010/`, Chrome dev/root/Pages đạt, console/asset errors 0. 3D/GSAP/audio/ảnh lỗi giữ nội dung, reduced motion và tab ẩn đúng.
- Mẫu production tải đầu khoảng 156 kB, chưa tải Three.js/GSAP, FCP 0,49–0,52 giây, CLS khoảng 0,048 khi mô phỏng latency 150 ms, 200 KiB/s và CPU ×4. Sau reset CPU/mạng, mẫu GPU máy tính đo 45 FPS desktop/30 FPS mobile giả lập.
- Sau sáu replay trên mỗi build: một canvas, GPU giữ 7 geometry/1 texture/5 program, listener và số node không tăng; heap sau GC tăng khoảng 39 kB trong mẫu ngắn. Không coi đây là chứng minh không rò rỉ trong mọi phiên/thiết bị.
- Fixture đã dọn, cấu hình vẫn demo/photo/audio null. Safe-area có CSS nhưng Chrome không hỗ trợ API giả lập inset; điện thoại thật/Safari, ảnh/nhạc thật và phiên dài chưa nghiệm thu. Chunk Three.js vẫn có cảnh báo > 500 kB minified, được lazy-load và có fallback.

Xem [tích hợp và hiệu năng](../docs/integration-and-performance.md) và [số đo kiểm tra](../docs/verification.md). Tiếp theo là [task0_9](./task0_9_qa_and_delivery.md).
