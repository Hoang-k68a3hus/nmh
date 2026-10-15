# Khu vườn Three.js

Task0_5 tạo cụm 7 bông hoa giấy: hoa hồng, cúc và tulip; cánh có độ dày và mép bo nhẹ, cành cong, lá, ánh sáng mềm và bóng giả. Màu lấy từ cùng `theme` với SVG. Nếu `theme.flower` chọn một loại cụ thể, cả cụm dùng loại đó.

Lời chúc, nút cuộn và ảnh vẫn là HTML. Canvas là trang trí, `aria-hidden`, không nhận focus hay chặn thao tác. Trên mobile, chữ ở trên và hoa ở dưới. `hero.photo` vẫn tùy chọn; có ảnh thì vùng trang trí được thu gọn.

## Tải và vòng đời

- Entry chỉ chứa điều phối nhẹ. `garden.js` và Three.js được import khi vườn hoặc vùng bó hoa vào viewport; màn hình đầu không cần tải đồ họa.
- SVG luôn giữ trong DOM. Chỉ ẩn SVG sau khi frame 3D đầu tiên render thành công; trong lúc tải vẫn hiện SVG.
- Nếu module lỗi, không có WebGL2, render lỗi hoặc mất context, canvas được gỡ và SVG hiện lại. Nội dung tiếp tục đọc được. Reload trang mới thử lại 3D; không lặp yêu cầu lỗi theo từng lần cuộn.
- Một canvas và một renderer được chuyển giữa `#garden-art` và `#bouquet-art`. Không tạo cảnh/renderer thứ hai cho finale.
- Nếu người xem tới finale trong lúc import chưa xong, scene nhận layout/kích thước/preference mới nhất trước frame đầu.
- Ngoài vùng đồ họa hoặc khi tab ẩn, hủy lịch render. Khi trở lại, thời gian animation tiếp tục từ lúc dừng; delta tối đa 50 ms.
- Reduced motion hiện hoa nở hoàn chỉnh, không sway/parallax/hạt sáng. Chỉ render một frame; resize hoặc đổi layout mới render lại.
- “Xem lại từ đầu” reset trạng thái nở, dùng lại renderer. Mount lại cùng host dispose instance cũ. HMR có cleanup; kết quả import về muộn không gắn canvas cũ.

Task0_8 dùng page state chung cho visibility/motion/pointer và chuyển reveal card sang CSS/IntersectionObserver. Không còn ScrollTrigger refresh, đổi preference vẫn giữ vị trí đang đọc. Xem [tích hợp và hiệu năng](./integration-and-performance.md).

ResizeObserver theo dõi khung HTML, camera cập nhật aspect và khoảng cách để giữ cụm hoa trong hình. Drawing buffer theo kích thước khung và DPR đã giới hạn, không đặt kích thước CSS từ renderer. Tham khảo [Three.js responsive](https://threejs.org/manual/pages/responsive.html).

## Quality preset

Preset tự chọn từ viewport, pointer, số core/RAM nếu trình duyệt cung cấp và data saver. Thiếu tín hiệu vẫn chạy với lựa chọn theo viewport/pointer.

| Preset | DPR tối đa | Hạt sáng | Giới hạn FPS |
| --- | --- | --- | --- |
| `low` | 1 | 0 | 24 |
| `mobile` | 1,5 | 8 | 30 |
| `desktop` | 2 | 14 | 45 |

`low` dùng khi data saver bật, RAM ≤ 4 GB hoặc core ≤ 4. `mobile` dùng với viewport ≤ 700 px hoặc pointer coarse, kể cả xoay ngang. Parallax chỉ bật khi có hover và pointer fine; không yêu cầu cảm biến điện thoại.

Có thể ép preset bằng `mountGardenGraphics(content, { quality: 'low' })`. Không có control kỹ thuật này trên giao diện người nhận. FPS thực tế còn phụ thuộc GPU/trình duyệt; xem [báo cáo đo](./verification.md).

Hoa nở theo thời gian render: mỗi bông lệch 0,14 giây, hoàn tất khoảng 2,2 giây rồi chỉ đung đưa rất nhẹ. Hạt sáng ít, nằm sau hoa. Không dùng texture ảnh, shadow map, post-processing hoặc thư viện mới.

## Module và tài nguyên

| Module | Vai trò |
| --- | --- |
| `scene-manager.js` | Host/canvas, observer, preference, pointer, API chuyển layout và cleanup |
| `graphics-controller.js` | Lazy-load, trạng thái idle/loading/ready/fallback, bỏ callback async cũ |
| `garden.js` | Renderer, camera, ánh sáng, 7 hoa, bố cục và render |
| `bouquet-motion.js` | Một lượt hội tụ/buộc bó, pause, reduced motion và reset |
| `bouquet.js` | Hai mảnh giấy gói, vị trí buộc nơ và tài nguyên riêng |
| `flower-factory.js` | 3 geometry, 7 material dùng chung, buffer instance cánh/lá; hoa rose/daisy/tulip và trạng thái nở |
| `particles.js` | Một Points object, geometry/material riêng, số hạt theo preset |
| `render-loop.js` | FPS, delta, pause, frame tĩnh và hủy RAF |
| `quality.js` | Lựa chọn preset |

Factory sở hữu geometry/material và InstancedMesh của hoa; dispose buffer instance trước tài nguyên dùng chung, không dispose geometry trên từng mesh mượn. Scene sở hữu ánh sáng/bóng/hạt/renderer. Dispose gỡ listener, observer, RAF, geometry, material, context và canvas. Không tải texture ảnh ở bản này; renderer có thể có tài nguyên texture nội bộ. Tham khảo [Three.js cleanup](https://threejs.org/manual/pages/cleanup.html) và [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html).

## API cho phần kết

`main.js` giữ instance `graphics`, tạo sau khi mount các component. Các lệnh không tạo renderer mới:

```js
graphics.setLayout('bouquet'); // Chọn bố cục hội tụ; vẫn chỉ render khi host hiện.
graphics.setLayout('garden');
graphics.useVisibleLayout(); // Trở về tự chọn layout theo vùng đang nhìn thấy.
graphics.reset(); // Reset hoa nở và trả về tự chọn layout.
graphics.getDiagnostics(); // Trạng thái/view và số frame/draw call/tài nguyên.
graphics.dispose();
```

Task0_7 đã hoàn thiện chuyển 7 hoa thành bó, hai mảnh giấy gói 3D và nơ SVG chiếu theo camera. Animation chạy một lần khoảng 2,2 giây thời gian render rồi dừng thành hình tĩnh; không sway/hạt/parallax ở phần kết. Cuộn quay lại giữ bó đã hoàn tất; replay reset để lượt mới chạy sau khi rời vùng cuối. Reduced motion hiện bó ngay. SVG giữ vai trò fallback khi tải chậm/3D lỗi. Xem [thư và phần kết](./letter-and-finale.md).
