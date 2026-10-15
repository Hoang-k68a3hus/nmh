# Services

`page-state.js`: nguồn chung cho hidden/reduced/pointer/viewport/activeSection; gộp scroll/resize bằng một RAF, subscribe theo trường cần dùng, dispose listener/frame. `main.js` truyền cùng instance cho mọi component. Xem [tích hợp và hiệu năng](../../docs/integration-and-performance.md).

`intro-controller.js`: quản lý `intro → opening → reading`, mỗi lần chỉ một timeline. Có skip, reduced motion, deadline 8 giây để cho phép tải Three.js và chạy timeline, reset và guard cho kết quả async cũ.

`graphics-controller.js`: tải scene khi active, giữ view mới nhất trong lúc chờ, chuyển SVG fallback khi lỗi và dispose kết quả về muộn. Renderer/render loop nằm trong module đồ họa lazy-load. Xem [khu vườn Three.js](../../docs/garden-graphics.md).

`wishes-state.js`: Set ID đã nở, đếm duy nhất, tổng theo dữ liệu, subscribe/snapshot/reset/dispose. Xem [lời chúc và ảnh](../../docs/wishes-and-photos.md).

`audio-manager.js`: một manager chung cho nhạc nền/giọng đọc tùy chọn. Source chưa được gán tới khi người xem yêu cầu phát; event và Promise cập nhật trạng thái thực tế. Nút trong thư dùng `toggleNarration()` và snapshot `ended` cho phát/tạm dừng/tiếp tục/nghe lại. Phát giọng đọc tạm dừng nhạc, chỉ khôi phục lựa chọn nhạc trước đó. Tab ẩn tạm dừng; hiện lại chờ nhấn phát. Replay tua giọng đọc, dùng lại player. Có subscribe/unsubscribe, retry và dispose.

Xem [mở thư và âm thanh](../../docs/interaction-and-audio.md) cho API và hành vi. `asset-loader.js` chỉ cần thêm nếu task0_5 có nhiều asset 3D cần theo dõi; không tải tất cả ảnh trước khi cho đọc trang.
