# Đồ họa Three.js

`scene-manager.js` đã nối vào `main.js`: một canvas/renderer dùng chung cho vườn và bó hoa kết. Import `garden.js` khi vùng đồ họa hiện; SVG giữ tới frame đầu và hiện lại khi module/WebGL lỗi.

`flower-factory.js` tạo 7 hoa từ geometry/material dùng chung, gom cánh/lá thành InstancedMesh theo vật liệu. `particles.js`, `quality.js`, `render-loop.js` quản lý hạt, DPR/FPS, nhịp RAF, pause và reduced motion. `graphics-controller.js` loại kết quả async cũ và giữ view mới nhất khi tải chậm.

Task0_8 dùng page state chung, bỏ cập nhật DOM mỗi frame; diagnostics đọc qua API. Dispose cả buffer instance trước geometry/material chung. Xem [tích hợp và hiệu năng](../../../docs/integration-and-performance.md).

`bouquet-motion.js` điều phối một lượt hội tụ/buộc bó, pause/reduced motion/reset. `bouquet.js` sở hữu hai geometry/material giấy gói và vị trí buộc nơ chiếu sang SVG overlay; khi hoàn tất vòng render dừng thành hình tĩnh. Cùng renderer được dùng lại khi replay. Dispose gỡ observer/listener/RAF, geometry/material/context/canvas. Nếu thêm texture, module sở hữu texture phải dispose chúng. Xem [hướng dẫn đồ họa](../../../docs/garden-graphics.md) và [phần kết](../../../docs/letter-and-finale.md).
