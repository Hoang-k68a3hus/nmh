# Trải nghiệm chỉ cuộn

Cập nhật phần kết: đã bỏ các nút tim, nút về đầu trang và dòng hướng dẫn cuối. Bó hoa, lời chúc và chữ ký thành một cụm giữa màn hình, giữ khoảng thở trên dưới khi cuộn đến đáy. Màn hình ngang thấp dùng hai cột để hiện trọn nội dung.

Giấy gói trong `src/graphics/three/bouquet.js` dùng năm lớp đường cong có độ phồng, chân giấy xòe và nếp gấp. Nơ lụa SVG được chiếu về vị trí eo bó hoa từ camera; bản SVG dự phòng cũng có giấy chuyển sắc và nơ cùng kiểu. Dải lụa dày trên nền đã bỏ; các đường cành và hoa nhỏ giữ độ tương phản thấp để không cắt ngang phần chữ. Mã đầy đủ cập nhật và xuất bằng UTF-8 trong `docs/code-page-ket-thuc.md` (`node .qa/export-finale-code.mjs`).

Kiểm tra phần kết hiện tại: `node .qa/scroll-check.mjs http://127.0.0.1:4176/ ./finale-ending-scenarios.mjs` kiểm tra sát đáy trang ở năm kích thước màn hình, bảo đảm không còn nút và bó hoa/chữ ký nằm trọn trong khung nhìn. Kịch bản `finale-upgrade-scenarios.mjs` ghi nhận phiên bản có nút trước đây. Bộ test tài nguyên kiểm tra từng geometry/material được giải phóng đúng một lần cho giấy nhiều lớp.

Thay thế các tương tác mở thư, chạm nở hoa, đi tiếp và xem lại trong luồng cũ. Không chặn wheel/touch, không khóa thanh cuộn, không tự chuyển section. Liên kết bỏ qua nội dung dành cho bàn phím vẫn được giữ.

## Luồng

1. Intro giữ trong khung hình thêm 85svh: mở sáp, lật nắp, nâng thiệp và xoay phong thư trong không gian 3D. Đứng yên thì thiệp đứng yên; không còn delay tự mở.
2. Vườn hoa giữ thêm 65svh: bảy hoa lần lượt nở, camera xoay quanh vườn khoảng 60 độ và tiến gần ở giữa cảnh.
3. Mỗi lời chúc đi vào với phối cảnh, ảnh chân dung dịch chuyển nhẹ và hoa SVG nở. Cuộn ngược thu hoa lại; chữ luôn đọc được.
4. Giấy thư nghiêng rồi về phẳng khi vào vùng đọc.
5. Phần kết giữ thêm 75svh: gom hoa, mở giấy gói, vẽ nơ. Cuộn ngược tháo bó hoa theo cùng tiến độ.

Nền chuyển sắc, cánh hoa ở hai mép và vạch tiến độ chạy xuyên suốt. Các cảnh không dùng timer độc lập.

Bố cục được gom về chiều rộng 1060px: tiêu đề mở đầu tối đa 68px, ảnh chân dung lớn cùng hoa 3D ở phần vườn, các lời chúc không có hộp bao ngoài. Hoa SVG đặt ở góc ảnh; mobile xếp ảnh và chữ theo một cột. Đã xem ảnh chụp ở 1920×865, 1440×900, 390×844 và 360×640; không tràn ngang hoặc ảnh lỗi.

Phần vườn có viền hoa lá quanh ảnh, hoa cỏ ở tiền cảnh và các đường cong/lá trên nền theo mẫu tham chiếu. SVG nằm trong `src/graphics/svg/garden-botanicals.js`, bố cục trong `src/styles/garden-botanicals.css`. Viền đi cùng góc xoay ảnh; hoa nở, cỏ nghiêng và lá dịch chuyển theo `--scene-progress`. Các lớp trang trí nằm ngoài canvas Three.js nên vẫn hiện khi đổi chất lượng hoặc dùng SVG dự phòng. Đã kiểm tra Chrome ở 1920×865, 1024×600, 390×844 và 360×640, gồm cả reduced motion.

## Các điểm chỉnh

| File | Vai trò |
| --- | --- |
| `src/motion/scroll-scenes.js` | Đo vị trí, RAF, làm mượt playhead khoảng 65ms, điều phối các cảnh |
| `src/motion/scroll-progress.js` | Tính tiến độ ghim cảnh và các giai đoạn bó hoa |
| `src/styles/scroll-experience.css` | `--scene-travel`, bố cục sticky, phối cảnh ảnh, mobile và reduced motion |
| `src/motion/timelines.js` | `setProgress()` của phong thư, SVG fallback |
| `src/graphics/svg/envelope3d.js` | Hình học thư, nắp lật ra sau thiệp, góc quay theo cuộn |
| `src/graphics/three/garden.js` | Camera, nở hoa, ghép bó và render khi cần |

Vị trí đo từ section/wrapper chưa transform để tránh sai lệch tự tích lũy khi xoay ảnh. ResizeObserver và font-ready cập nhật kích thước. Với nội dung cao hơn viewport, sticky top âm cho phép đọc hết phần trên trước khi cảnh giữ lại. Reduced motion trở về chiều cao tự nhiên, bỏ ghim và góc xoay.

Âm thanh và các controller tương tác cũ không được mount trong `main.js`; giữ module cũ để tương thích dữ liệu và các test độc lập. Tài liệu task0_4–task0_9 mô tả các mốc triển khai trước đó; tài liệu này mô tả luồng hiện tại.

## Kiểm tra

`npm run check`, `npm test`, `npm run build`. Các test tiến độ mới bao gồm cảnh cao hơn màn hình, tua ngược và cuộn nhảy qua cảnh.

Đã xác minh ngày 15/10/2026: check 54 file, 80/80 test; build root và base `/2010/` thành công. Browser QA đạt trên Chrome headless với khung 1440×1000, 390×844, 360×640 và 844×390; không có lỗi console hoặc asset. Kiểm tra gồm cuộn chuột thực, không tự mở thư khi đứng yên, camera đổi góc theo cuộn, tua ngược bó hoa, reduced motion, anchor và SVG khi tắt WebGL.

Kiểm tra trình duyệt local: `node .qa/scroll-check.mjs http://127.0.0.1:4176/`. Script dùng Chrome headless trên Windows, chụp ảnh vào `.qa/scroll-*.png` và ghi `.qa/scroll-result.json`. Bao gồm cuộn xuôi/ngược, đứng yên, desktop/mobile/landscape, reduced motion, liên kết thẳng tới thư và WebGL fallback. Không thay thế việc thử trên điện thoại thật.

Website vẫn là Vite tĩnh. Vercel/root dùng `npm run build`; GitHub Pages giữ `VITE_BASE_PATH=/ten-repository/` như trước. Bản ZIP trong `release/` là mốc bàn giao cũ, cần build từ source hiện tại để có trải nghiệm mới.

## C?n l?i nh?p cu?n

B? ?? tr? n?i suy 65ms v? transition c?a ?nh v??n. C?nh ho?n th?nh ? 70% qu?ng gi?, 30% c?n l?i d?nh ?? nh?n tr?ng th?i cu?i tr??c khi r?i c?nh. V??n b?t ??u chuy?n ??ng ngay khi ?i v?o khung. Hoa l?i ch?c n? ?? khi t?m ?nh ??n gi?a m?n h?nh; m?c t?nh theo khung ?nh ch?a transform, ?p d?ng c? khi cu?n ng??c ho?c cu?n nh?y.

Ki?m tra m?c m?i: `node .qa/scroll-check.mjs http://127.0.0.1:4176/ ./scroll-timing-scenarios.mjs`. C?c k?ch b?n bloom c? d?ng m?c ??y hoa kh?ng c?n ??i di?n cho nh?p hi?n t?i.

## Hoa và nhánh cây ở các phần tiếp theo

Các lời chúc dùng cùng bảng màu và hình hoa với khu vườn mở đầu, thêm băng giấy, nhánh bao mép ảnh và đường cong nền. Các hàng đổi phía ảnh, màu hoa/băng giấy và hướng đường cong để tạo khác biệt nhẹ. Lá thư có nhánh ở hai góc; phần kết có nhánh hai bên bó hoa.

`src/graphics/svg/story-botanicals.js` lấy vị trí hoa theo chiều dài đường Bézier của cành. `--vine-progress` điều khiển nét cành và từng nụ qua mốc riêng: cành tới đâu hoa mới nở tới đó. Tiến độ dùng chung với hoa lời chúc, hoàn thành khi ảnh tới giữa màn hình; cuộn ngược đảo lại và reduced motion hiển thị đầy đủ. Không dùng timer hoặc tương tác mới. CSS nằm trong `src/styles/story-botanicals.css`; trang trí phần thư/kết được mount trong `src/components/story-botanicals.js`.

Kiểm tra trình duyệt: `node .qa/scroll-check.mjs http://127.0.0.1:4176/ ./story-botanicals-scenarios.mjs`, gồm desktop 1440×900, mobile 390×844 và 360×640, hoa nở tuần tự trên viền và nền, tua ngược, reduced motion và không tràn ngang. Ảnh chụp lưu ở `.qa/story-*.png`.
