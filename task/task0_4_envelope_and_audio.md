# Task0_4 — Mở phong thư và âm thanh

- Trạng thái: DONE — 14/10/2026
- Phụ thuộc: task0_2, task0_3
- Ưu tiên: bắt buộc; audio là tùy chọn theo asset

## Mục tiêu

Màn hình đầu có cảm giác được gửi riêng, mở nhanh và không phụ thuộc tải xong 3D.

## Nội dung và hành vi

- Hiển thị người nhận, ngày 20.10.2026, lời mở đầu và nút “Mở thư của anh”.
- Dùng SVG phong thư, con dấu hoa, sợi chỉ và một cánh hoa bay lên.
- Click/Enter/Space bắt đầu một timeline duy nhất: dấu tách → nắp mở → cánh hoa đi lên → nội dung hiện.
- Thời gian tổng khoảng 1.5–2 giây. Trong lúc mở có thao tác “Bỏ qua chuyển động”.
- Bấm liên tục không tạo nhiều timeline, listener hoặc audio instance.
- Khi hoàn tất, đưa focus hợp lý tới tiêu đề khu vườn và cho phép cuộn tự nhiên.
- Trạng thái reduced motion chuyển tới nội dung gần như ngay lập tức.
- Khi mở trực tiếp anchor giữa trang, khởi tạo trạng thái đọc, không để overlay intro chặn section.
- Lỗi tải thư viện animation vẫn phải cho phép mở bằng đổi class/trạng thái DOM.

## Âm thanh

- Hiển thị nút “Bật nhạc” riêng khi có asset nhạc. Ban đầu luôn tắt.
- Không tự phát chỉ vì người xem nhấn mở thư.
- Gọi phát từ thao tác của người dùng, xử lý `play()` bị từ chối và cập nhật trạng thái theo event audio.
- Có thể tạm dừng và phát lại; không hiện toast gây gián đoạn trải nghiệm.
- Nếu file lỗi, hiển thị trạng thái ngắn dễ hiểu và tiếp tục đọc trang.
- Xử lý phối hợp nhạc/giọng đọc tại audio manager; các component không tự tạo player riêng.
- Khi tab ẩn, tạm dừng; khi quay lại chờ người xem nhấn phát.

## Đầu ra

Component phong thư, intro timeline, quản lý trạng thái trải nghiệm và audio manager.

## Tiêu chí hoàn thành

- [x] Mở thư bằng chuột, cảm ứng và bàn phím.
- [x] Double click không chạy animation hai lần.
- [x] Bỏ qua chuyển động đưa về đúng trạng thái cuối.
- [x] Nội dung tiếp theo truy cập được dù Three.js tải chậm/lỗi.
- [x] Không có autoplay ngoài lựa chọn người xem.
- [x] Thiếu audio thì không có nút vô tác dụng.
- [x] Focus không bị kẹt ở phần intro đã ẩn.

## Kiểm tra phù hợp

Thử mở nhanh nhiều lần, skip giữa chừng, tải trực tiếp anchor, audio bị chặn và reduced motion. Đây là luồng trạng thái cần kiểm tra hành vi, không chỉ kiểm tra hình ảnh.

## Kết quả triển khai

- `intro-controller.js` quản lý `intro/opening/reading`, một lượt mở, skip/reset/dispose và loại kết quả import cũ. Watchdog 8 giây bao phủ thời gian tải Three.js và chạy timeline, đồng thời tránh kẹt nếu animation lỗi.
- Phong thư tự mở sau sự kiện `load` 3 giây; timeline chạy ở timeScale 0,65 để động tác nắp và thiệp chậm, dễ theo dõi hơn.
- `timelines.js` có timeline 1,72 giây cho dấu/nơ, nắp, tờ giấy và cánh hoa. Component xử lý focus, anchor giữa trang, cuộn vượt intro và khôi phục hình khi xem lại.
- Reduced motion bỏ timeline; đổi preference giữa lượt mở hoàn tất ngay. CSS entry và GSAP không cùng điều khiển phong thư.
- Một audio manager chung hỗ trợ nhạc nền/giọng đọc, gán source sau thao tác phát, trạng thái thực tế, retry, tab ẩn và Promise/event đến muộn. Nút nhạc có thông báo ngắn; không autoplay khi mở thư.
- API giọng đọc đã sẵn sàng; UI nghe thư thuộc task0_7. Demo vẫn để audio `null`, không đóng gói file thử.
- 44/44 test và check 36 file JS/MJS đạt. Build root và `/2010/` đạt; Chrome production không console/asset errors, không tràn ngang.
- Browser đã kiểm tra chuột, Space, chạm giả lập, mở liên tục, skip, replay, bốn anchor, reduced motion giữa chừng, cuộn tới thư và chặn chunk timeline. Mở thư đo được khoảng 1,80–1,85 giây gồm tải chunk trong môi trường thử.
- Audio kiểm tra bằng WAV nội bộ: phát thực tế, nhường nhạc cho giọng đọc, tab thật ẩn/hiện, không tự phát lại, lỗi `play()` và file hỏng. Fixture đã dọn khỏi `public/` trước build.

Three.js chưa được nối vào trang ở task này. Luồng intro và HTML độc lập với đồ họa; kiểm tra lỗi WebGL/tải Three.js sẽ tiếp tục ở task0_5. Cảm ứng là giả lập Chrome; thiết bị thật tiếp tục ở task0_8/task0_9.

Xem [hướng dẫn tương tác](../docs/interaction-and-audio.md) và [báo cáo kiểm tra](../docs/verification.md).
