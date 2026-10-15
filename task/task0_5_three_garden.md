# Task0_5 — Khu vườn Three.js

- Trạng thái: DONE — 14/10/2026
- Phụ thuộc: task0_2, task0_3, task0_4
- Ưu tiên: bắt buộc, có SVG dự phòng

## Mục tiêu

Tạo cảnh nổi bật đầu tiên với 5–7 bông hoa cách điệu, ánh sáng mềm và chuyển động chậm. Giữ lời chúc chính đọc được ở mọi thiết bị.

## Bố cục

- Mobile: tiêu đề và lời chúc ở trên; vườn hoa ở dưới, không bị control nhạc che.
- Nếu hero có ảnh, dùng ảnh trong một khung HTML gọn; giảm chiều cao/cường độ trang trí để không chen lấn.
- Desktop: chia vùng chữ và cụm hoa; ảnh tùy chọn là một phần của bố cục HTML, không đưa thành texture bắt buộc.
- Có hướng dẫn cuộn tiếp nhẹ; không ép người xem khám phá bằng thao tác 3D.

## Công việc

- Tạo scene manager quản lý canvas, camera, renderer, resize và dispose.
- Tạo flower factory từ geometry đơn giản; tái sử dụng geometry/material giữa các bông khi phù hợp.
- Giữ hình khối giấy mềm, có độ dày vừa đủ; màu phù hợp token thiết kế.
- Dùng ánh sáng đơn giản và bóng giả, chưa thêm post-processing.
- Timeline hoa nở lần lượt; sau nở chỉ đung đưa nhỏ, tránh chuyển động toàn màn hình liên tục.
- Thêm ít hạt sáng sau cụm hoa; cho phép tắt bằng quality preset.
- Pointer parallax chỉ áp dụng thiết bị có pointer phù hợp và không giảm chuyển động; không yêu cầu quyền cảm biến điện thoại.
- Tải module đồ họa riêng, hiện SVG garden trong lúc chờ hoặc khi lỗi.
- Render chỉ khi tab hiện và vườn/bó hoa đang cần hiển thị; nội dung DOM không phụ thuộc render loop.
- Cung cấp API chuyển bố cục sang bouquet cho task0_7; không tạo renderer thứ hai.
- Nếu người xem tới finale trước khi tải xong, khởi tạo đúng bố cục finale khi module sẵn sàng.

## Tiêu chí hoàn thành

- [x] Có cụm hoa 3D và lời chúc HTML dễ đọc.
- [x] Một canvas/renderer duy nhất cho đồ họa chính.
- [x] Đổi kích thước, xoay màn hình không làm méo cảnh hoặc tràn ngang.
- [x] SVG fallback xuất hiện khi module hoặc WebGL lỗi.
- [x] Không cần đợi 3D để đọc lời chúc hoặc cuộn tới thư.
- [x] Cuộn ra khỏi vùng và ẩn tab dừng render phù hợp.
- [x] Reduced motion không có camera parallax hoặc hạt sáng liên tục.
- [x] Có đường dispose và không nhân đôi canvas khi khởi tạo lại.

## Kiểm tra phù hợp

Kiểm tra trên ít nhất một thiết bị/trình duyệt mobile có thể tiếp cận, mô phỏng lỗi module/WebGL và đo sơ bộ hiệu năng. Ghi rõ nếu chỉ mới kiểm tra bằng viewport giả lập.

## Kết quả triển khai

- 7 hoa giấy rose/daisy/tulip, cành cong, lá và cánh bo mép có độ dày. Factory chia sẻ 3 geometry và 7 material, palette lấy từ theme. Ánh sáng mềm, bóng giả và Points hạt sáng; không dùng model/texture/post-processing.
- Hoa nở lệch nhau 0,14 giây, hoàn tất khoảng 2,2 giây theo thời gian render; sau đó chỉ sway nhẹ. Parallax dùng pointer fine/hover; điện thoại không yêu cầu cảm biến.
- Một canvas/renderer chuyển giữa vườn và bouquet cơ bản, có API `setLayout`, `useVisibleLayout`, `reset`, `dispose`. Animation giấy/nơ/phần kết đầy đủ vẫn thuộc task0_7.
- Lazy module giữ SVG tới frame đầu. Controller giữ layout/size/preference mới nhất, xử lý người xem tới finale trước import. Lỗi import/WebGL/render/context loss về SVG, giữ toàn bộ lời chúc.
- Render loop hủy RAF ngoài vùng/tab ẩn; reduced motion render một frame tĩnh. Quality low/mobile/desktop giới hạn DPR 1/1,5/2 và số hạt 0/8/14; pointer coarse giữ preset mobile khi xoay ngang.
- Dispose gỡ observer/listener/RAF và tài nguyên GPU. Host giữ một owner qua các URL module HMR, mount lại tự dispose instance trước.
- Đã sửa giữ vị trí cuộn quanh ScrollTrigger matchMedia refresh khi reduced motion đổi sau các trigger `once` đã dọn.
- Check 44 file và 56/56 test đạt. Build root và `/2010/` đạt; Chrome production hai đường dẫn không console/asset errors.
- Chrome đã kiểm tra viewport 360/390/768/844/1440 px, xoay ngang, DPR 3 giới hạn đúng, một canvas, dừng/hiện lại khi cuộn và tab thật, reduced motion tĩnh, lỗi module/WebGL và context loss. Dev xác minh remount/dispose và ảnh hero bằng icon hoa thử bố cục tại runtime; không thêm asset thật hoặc đổi cấu hình demo.
- Cảnh đo 107 draw calls, 14.600 tam giác. Trên Intel UHD/Chrome headless local: khoảng 40,5–41,4 FPS desktop và 27,8–27,9 FPS mobile giả lập; đây chưa phải số đo điện thoại thật.

Mobile hiện chỉ được giả lập trong Chrome; chưa nghiệm thu GPU điện thoại, Safari iOS hoặc trình duyệt nhắn tin. Kiểm tra thiết bị thật và tối ưu tiếp tục ở task0_8/task0_9.

Xem [đồ họa khu vườn](../docs/garden-graphics.md) và [báo cáo kiểm tra](../docs/verification.md).
