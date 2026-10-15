# Kế hoạch website chúc mừng 20/10

## Mục tiêu

Tạo website tĩnh như một món quà riêng dành cho người yêu, với Three.js, SVG động, lời chúc cá nhân hóa và hình ảnh của cô ấy. Concept: **Một khu vườn chỉ dành cho em**.

Thư mục này là đặc tả và danh sách công việc để triển khai. Task0_1 đến task0_9 đã hoàn thành tại thư mục gốc dự án. Bản bàn giao kỹ thuật là demo chờ cá nhân hóa; nội dung riêng, file thật và URL hosting chưa được chốt.

## Phạm vi đã chốt

- Năm cảnh: phong thư → khu vườn → lời chúc kèm ảnh → thư riêng → bó hoa kết.
- Bỏ hoàn toàn cảnh kỷ niệm, album theo thời gian và câu chuyện các chuyến đi.
- Không có lời mời đi chơi, vé hẹn, địa điểm, đặt lịch hoặc món quà bất ngờ cần mở ở cuối.
- Bó hoa cuối là hình ảnh kết thúc lời chúc, không phải bước mở khóa một phần thưởng.
- Có thể đặt ảnh cô ấy cạnh các lời chúc và trong bức thư. Không yêu cầu ảnh đôi.
- Ưu tiên điện thoại; nội dung vẫn đầy đủ khi tắt nhạc, giảm chuyển động hoặc không chạy được 3D.
- Mọi nội dung được đóng gói cùng web tĩnh; không cần backend, tài khoản hay cơ sở dữ liệu.

## Cách đọc

1. Đọc [kiến trúc](./00_architecture.md) để hiểu ranh giới kỹ thuật, cấu trúc thư mục và hợp đồng dữ liệu.
2. Đọc [workflow](./01_workflow.md) để hiểu mạch trải nghiệm và thứ tự triển khai.
3. Thực hiện các task dưới đây theo phụ thuộc. Chỉ đánh dấu `DONE` sau khi đạt tiêu chí hoàn thành.

| Task | Nội dung | Phụ thuộc | Trạng thái |
| --- | --- | --- | --- |
| [task0_1](./task0_1_project_foundation.md) | Khởi tạo dự án và nền HTML/CSS | Không | DONE |
| [task0_2](./task0_2_content_and_assets.md) | Nội dung, ảnh, cấu hình | task0_1 | DONE |
| [task0_3](./task0_3_design_system_and_svg.md) | Hệ thống thiết kế và SVG | task0_1 | DONE |
| [task0_4](./task0_4_envelope_and_audio.md) | Mở thư và âm thanh | task0_2, task0_3 | DONE |
| [task0_5](./task0_5_three_garden.md) | Vườn hoa Three.js | task0_2, task0_3, task0_4 | DONE |
| [task0_6](./task0_6_wishes_and_portraits.md) | Lời chúc kèm ảnh cô ấy | task0_2, task0_3 | DONE |
| [task0_7](./task0_7_letter_and_finale.md) | Thư riêng và bó hoa kết | task0_5, task0_6 | DONE |
| [task0_8](./task0_8_integration_and_performance.md) | Tích hợp, responsive, tối ưu | task0_4 đến task0_7 | DONE |
| [task0_9](./task0_9_qa_and_delivery.md) | Kiểm thử và bàn giao bản tĩnh | task0_8 | DONE |

## Nội dung cần người dùng cung cấp khi triển khai

- Tên/biệt danh người nhận, người gửi và cách xưng hô.
- Màu và loài hoa yêu thích nếu có.
- Khoảng 3–5 ảnh của cô ấy; ảnh là tùy chọn, không phải điều kiện để dựng web.
- 5 lời chúc, một thư riêng khoảng 180–300 từ, lời kết ngắn.
- Nhạc nền và bản ghi âm nếu muốn sử dụng.

Khi chưa có nội dung thật, dùng dữ liệu mẫu có nhãn rõ trong cấu hình và bản xem trước. Không tự bịa kỷ niệm hoặc thông tin cá nhân. Có thể dựng các bố cục không ảnh trước.

## Cập nhật sau setup — 14/10/2026

- Đã cài Vite 8.3.4, Three.js 0.186.1, GSAP 3.15.0 với npm lockfile.
- Có khung năm section, component tách riêng, cấu hình nội dung mẫu, ảnh tùy chọn và SVG nền.
- Có CI, cấu hình Vercel và workflow Pages tự xử lý base path.
- Đã kiểm tra build root và `/2010/`, browser desktop/mobile và reduced motion.
- Task0_2 đã có cấu hình chung, cá nhân hóa tên, validator, kiểm tra asset, fallback ảnh và công cụ tối ưu WebP/AVIF; nội dung thật vẫn chờ cá nhân hóa ở chế độ demo.
- Task0_3 đã có font tiếng Việt local, bộ token/layout, SVG ba kiểu hoa và motion hữu hạn/reduced motion; đã kiểm tra contrast, focus, responsive và hình có/không ảnh.
- Task0_4 đã có timeline mở thư, skip/replay, focus/anchor, reduced motion, fallback tải lỗi và manager nhạc/giọng đọc chung; kiểm tra trạng thái tự động và Chrome root/Pages đạt.
- Task0_5 đã có 7 hoa Three.js, canvas/renderer dùng chung, quality preset, render lifecycle, reduced motion tĩnh và SVG fallback; build root/Pages và browser đạt.
- Task0_6 đã có card ảnh/không ảnh, nút hoa độc lập, bộ đếm theo ID, replay/reset, reduced motion và fallback ảnh giữ trạng thái/focus; browser dev/root/Pages và 61 test đạt.
- Task0_7 đã có thư giấy, ảnh tùy chọn, nghe/tạm dừng/tiếp tục/nghe lại qua manager chung, chữ ký, ghép 7 hoa/giấy gói/nơ SVG, frame tĩnh sau hoàn tất và replay/fallback. Browser dev/root/Pages và 70 test đạt.
- Task0_8 đã có page state chung, reveal CSS, font WOFF2 theo subset, ảnh lazy, instancing 40 draw calls, nhịp FPS, bỏ cập nhật DOM mỗi frame, safe-area và skip trong luồng trang. Browser dev/root/Pages, landscape/reflow 200% mô phỏng, sáu replay và 77 test đạt; tải đầu khoảng 156 kB trong mẫu production.
- Task0_9 đã kiểm thử final production root/Pages, mở bình thường/skip/bấm lặp/không cần mở hoa, keyboard/AX tree, DPR 3/rotation và fallback. Artifact QA riêng xác minh ảnh/audio native dưới `/2010/`. Có source/static ZIP, manifest/checksum và hướng dẫn bàn giao/deploy; 77 test đạt.
- Còn chờ cá nhân hóa tên/lời nhắn, chọn ảnh/audio nếu dùng, kiểm tra thiết bị thật và triển khai hosting. Đây là việc sau bộ task kỹ thuật; trạng thái demo được giữ rõ.

Xem [bàn giao](../docs/release-guide.md), [hướng dẫn deploy](../docs/deployment.md) và [kết quả kiểm tra](../docs/verification.md). Chưa có URL hosting công khai.

## Quy ước thực hiện

- Dùng `TODO`, `IN_PROGRESS`, `BLOCKED`, `DONE` trong bảng để theo dõi công việc; ghi rõ nguyên nhân nếu bị chặn.
- Mỗi task có đầu ra, cách thực hiện và tiêu chí nghiệm thu. Tên file mã nguồn trong tài liệu là thiết kế dự kiến, chưa phải file có sẵn.
- Nội dung hoặc ảnh thật chưa sẵn sàng chỉ chặn bước chốt nội dung để bàn giao, không chặn phần khung kỹ thuật.
- Chưa bao gồm xuất bản lên một dịch vụ hosting cụ thể. Bàn giao `dist/` và hướng dẫn chạy; lựa chọn hosting được xử lý khi triển khai có yêu cầu.
