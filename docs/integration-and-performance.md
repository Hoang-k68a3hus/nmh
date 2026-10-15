# Tích hợp, responsive và hiệu năng

`main.js` nối năm phần và sở hữu vòng đời chung. Intro, bộ đếm hoa và âm thanh giữ trạng thái riêng; cùng callback replay reset intro/hoa/bó hoa, dừng và tua giọng đọc, giữ lựa chọn nhạc nền. Nội dung HTML luôn sẵn để đọc; Three.js và GSAP chỉ bổ sung đồ họa.

## Tín hiệu trang

`src/services/page-state.js` là nguồn chung cho `hidden`, `reduced`, pointer fine/coarse, viewport và `activeSection`. Một listener `visibilitychange` và một listener trên từng MediaQueryList phân phối thay đổi tới component. Consumer chỉ nhận thay đổi của những trường nó dùng, nên cuộn không khởi tạo lại observer hoặc điều khiển âm thanh.

Cuộn/resize gộp trong một RAF; active section được xác định tại khoảng 35% chiều cao viewport. Trạng thái này phục vụ điều phối/diagnostics, không khóa cuộn, đổi focus hoặc ẩn section. Graphics vẫn theo dõi khung hoa cụ thể bằng IntersectionObserver/ResizeObserver để quyết định render và kích thước canvas.

Ứng dụng tạo `createPageState()` một lần, truyền cho intro, wishes, letter, finale, graphics, audio, SVG và reveal. Khi dùng component độc lập trong dev, helper có fallback riêng; ứng dụng chính vẫn chỉ có một nguồn tín hiệu. Dispose component hủy subscription trước khi main hủy page state; page state gỡ listener và frame chờ.

## Tải tài nguyên

- Entry gồm HTML/CSS, cấu hình, component và điều phối. Màn hình đầu không tải Three.js hoặc GSAP.
- Three.js/scene được import khi garden hoặc bó hoa cần hiển thị; SVG giữ trong lúc chờ hoặc khi module/WebGL lỗi.
- GSAP chỉ được import khi nhấn mở phong thư. Card lời chúc dùng CSS/IntersectionObserver cho reveal ngắn, không còn tải ScrollTrigger.
- Font dùng 8 file WOFF2: Latin và Vietnamese cho Be Vietnam Pro 400/600, Cormorant Garamond 500/italic. `fonts.css` giữ unicode-range để dấu tiếng Việt dùng đúng font. Font/license local, không gọi Google Fonts.
- Ảnh hero, lời chúc và thư đều dưới intro và dùng native lazy-loading. Có width/height và tỷ lệ khung 4:5 trước khi tải; browser có thể chủ động tải ảnh gần viewport. Ảnh lỗi gỡ khung, giữ chữ/nút và trả về bố cục không ảnh.
- Audio không có source/tải/phát trước thao tác bật riêng. Status trùng do event media được gộp, tránh cập nhật lặp vùng thông báo.

Không có backend, API, tracker, service worker hoặc tài nguyên bên ngoài trong bản hiện tại. Đường dẫn asset qua base path; root và build thư mục con được kiểm tra độc lập.

## Render và tài nguyên

Cánh/lá dùng InstancedMesh theo vật liệu trong từng bông, giữ nguyên các transform và trạng thái nở. Factory sở hữu buffer instance, geometry và material; dispose từng loại đúng một lần. Scene vẫn dùng một renderer/canvas cho garden/bouquet. Không tải ảnh chân dung thành texture 3D.

Preset low/mobile/desktop giữ DPR tối đa 1/1,5/2 và FPS 24/30/45. Bộ giới hạn FPS giữ mốc nhịp để jitter RAF không tích lũy làm tụt nhịp; frame trễ dài được bỏ qua, không render dồn. Delta tối đa 50 ms, thời gian dừng khi scene/tab không hiện.

Renderer cập nhật transform GPU trong frame; không ghi bộ đếm frame/progress vào DOM mỗi frame. DOM chỉ nhận ready/layout/quality hoặc chuyển giai đoạn bó hoa. Nơ SVG chiếu theo camera cuối của bó, cập nhật lúc đổi giai đoạn/resize; camera ổn định trước khi buộc nơ. Sau khi ghép bó xong hoặc reduced motion, vòng RAF dừng thành frame tĩnh.

Số frame, tài nguyên và trạng thái animation đọc theo nhu cầu qua API, không hiển thị trên web của người nhận:

```js
graphics.getDiagnostics(); // status/view, scene.frames, memory, programs, bouquet.
```

## Responsive và thao tác

Shell có padding theo `env(safe-area-inset-*)`; viewport khai báo `viewport-fit=cover`. Header/footer dành chỗ cho inset trên/dưới. Nội dung dài xuống dòng, caption không tràn; grid về một cột ở mobile. Intro dùng `svh` cho desktop và chiều cao theo nội dung trên mobile.

Nút bỏ qua ở cùng nhóm nút mở thư, nằm trong luồng trang. Khi mở trên mobile, trang đưa nhóm này vào vùng nhìn thấy; nút không phủ chữ hoặc nằm sau thanh địa chỉ. Anchor đưa focus tới tiêu đề, bàn phím có skip-link, Tab/Enter/Space và outline 3 px. Xem lại đưa focus về nút mở. Không khóa body/natural scroll.

Giảm chuyển động có tác dụng giữa phiên xem: intro hoàn tất, hoa được chọn mở ngay, SVG/reveal/đoạn thư hết animation, 3D hiện frame tĩnh. Không có ScrollTrigger refresh làm đổi vị trí đọc. Tab ẩn dừng 3D/CSS/audio; audio không tự phát lại khi quay về.

## Đo và giới hạn

Kích thước build, tải đầu trang, FCP/layout shift, FPS và mẫu tài nguyên sau sáu replay nằm trong [báo cáo kiểm tra](./verification.md). Mẫu FPS dùng Chrome headless/GPU máy tính, không đại diện điện thoại thật. Zoom 200% được mô phỏng bằng viewport CSS 720×500/DPR 2 cho desktop 1440×1000. Safe area đã triển khai trong CSS; Chrome phiên kiểm tra không hỗ trợ API giả lập inset, cần xem trên thiết bị thật ở task0_9.

Ảnh thử là hình hoa, audio thử là WAV im lặng, được dọn trước build bàn giao. Chưa có file cá nhân hóa để nghiệm thu crop, chất lượng nhạc/giọng đọc hoặc tổng payload ảnh thật. Chunk Three.js vẫn vượt ngưỡng cảnh báo 500 kB minified; được lazy-load và có SVG fallback, không đổi ngưỡng cảnh báo để che số đo.
