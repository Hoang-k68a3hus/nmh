# Motion

`preferences.js`: subscribe reduced motion từ page state chung; fallback native khi dùng component độc lập.

`scroll-scenes.js`: reveal nhẹ card lời chúc bằng CSS/IntersectionObserver, giữ nội dung hiện sẵn. Không còn import GSAP/ScrollTrigger ở entry. Thư dùng fade 350 ms riêng trong component, không trượt tờ giấy. Thay preference không refresh vị trí cuộn; dispose gỡ observer/subscription.

`svg-motion.js`: đăng ký SVG trong viewport, bắt SVG mới do fallback ảnh, chạy CSS motion một lần, hoàn tất ngay khi giảm chuyển động và pause khi tab ẩn. Không quản lý thao tác mở phong thư.

SVG có `data-motion-owner="wish"` do component lời chúc quản lý, không đăng ký vào motion trang trí. Component xử lý nụ/nở, reduced motion và deadline; CSS keyframe nằm trong `motion.css`.

SVG có `data-motion-owner="finale"` do component phần kết/scene manager quản lý. Fallback fade một lần; nơ trên canvas vẽ khi bó hoa vào giai đoạn buộc. Motion trang trí không đăng ký lại hai hình này. Xem [thư và phần kết](../../docs/letter-and-finale.md).

`timelines.js`: timeline mở thư GSAP 1,72 giây, chỉ import khi nhấn mở. Trả về `play()`/`dispose()`; dispose revert context trước khi component đặt hình cuối. Skip, reduced motion, reset và lỗi tải được điều phối bởi `intro-controller.js`. Hoa 3D nở theo thời gian render trong `graphics/three/garden.js`.

Xem [mở thư và âm thanh](../../docs/interaction-and-audio.md) để biết trạng thái, focus và fallback.

Visibility/motion dùng page state chung; xem [tích hợp và hiệu năng](../../docs/integration-and-performance.md).
