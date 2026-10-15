# Một khu vườn chỉ dành cho em

Website tĩnh chúc mừng ngày Phụ nữ Việt Nam 20/10, chuẩn bị cho trải nghiệm SVG + Three.js.

## Trạng thái hiện tại

Đã hoàn thành task0_1 đến task0_9: bộ khung năm phần, nội dung/ảnh tùy chọn, thiết kế/SVG, phong thư/âm thanh, khu vườn Three.js, hoa lời chúc, thư riêng/bó hoa kết, tích hợp/hiệu năng và kiểm thử/bàn giao bản tĩnh. **Bản bàn giao là demo chờ cá nhân hóa**: tên và lời chúc còn là nội dung mẫu; năm ảnh đã được tối ưu và gắn vào web, audio chưa có và chưa có URL hosting công khai.

Trải nghiệm hiện tại điều khiển hoàn toàn bằng cuộn: phong thư mở theo vị trí cuộn, camera đi quanh vườn hoa, ảnh/lời chúc nghiêng theo chiều sâu, hoa nở dần và cuối cùng gom thành bó. Cuộn ngược tua ngược các cảnh. Không còn tự mở thư theo bộ đếm thời gian, tự chuyển trang, nút nở hoa hay nút xem lại. Phím cuộn, thanh cuộn và cảm ứng dùng hành vi gốc của trình duyệt.

Phong thư là một timeline GSAP tạm dừng được cập nhật bằng tiến độ cuộn. Khu vườn và bó hoa dùng chung canvas Three.js với 7 hoa giấy; render khi tiến độ/kích thước thay đổi, dừng khi đứng yên hoặc tab ẩn. Không cần di chuột. WebGL/module lỗi có SVG thay thế. Reduced motion bỏ ghim cảnh và góc nghiêng, hiện nội dung hoàn chỉnh.

Năm card lời chúc có ảnh tùy chọn; ảnh dùng khung 4:5 và điểm crop từ cấu hình. Hoa SVG tự nở theo cuộn, bộ đếm phản ánh vị trí hiện tại. Ảnh lỗi thay bằng hoa và vẫn giữ lời chúc. Chữ không bị ẩn để chờ animation.

Thư có bố cục giấy dễ đọc và ảnh tùy chọn. Phần kết ghép hoa, mở giấy gói 3D nhiều lớp và thắt nơ lụa SVG theo tiến độ cuộn. Bó hoa, lời chúc và chữ ký được căn giữa để hiện trọn khi đến đáy trang; phần kết không có dải nút hoặc hướng dẫn phía dưới. Các module audio cũ còn trong source nhưng không được mount.

`src/motion/scroll-scenes.js` quản lý tiến độ cuộn, đo khung cảnh và cập nhật CSS/3D trong RAF. Cảnh cao hơn màn hình được cuộn qua nội dung trước khi ghim để không che chữ trên điện thoại nằm ngang. Font và ảnh nằm trong bản build, không phụ thuộc CDN.

Xem [thiết kế và kiểm tra trải nghiệm cuộn](./docs/scroll-experience.md). Thư mục `release/` lưu bản đóng gói trước thay đổi này; dùng source hiện tại và build lại `dist/` để triển khai giao diện mới. Điện thoại thật/Safari và trình duyệt nhắn tin còn cần thử trên URL thật.

Luồng: phong thư → vườn hoa → lời chúc kèm ảnh cô ấy → bức thư → bó hoa kết.

## Chạy local

Yêu cầu Node `^20.19.0 || >=22.12.0`. Khuyến nghị Node 22 LTS được cập nhật; máy setup hiện dùng 22.17.0. Dùng npm và lockfile đi kèm.

```sh
npm ci
npm run dev
```

Dev: `http://localhost:5173`. Dừng bằng Ctrl+C.

Trên PowerShell nếu `npm.ps1` bị chặn, dùng `npm.cmd ci`, `npm.cmd run dev` và tương tự cho các lệnh khác. Không cần đổi ExecutionPolicy.

## Kiểm tra và build

```sh
npm run check
npm test
npm run build
npm run preview
```

Build nằm trong `dist/`. Preview: `http://localhost:4173`. Phục vụ bản build qua HTTP; không mở `dist/index.html` bằng `file://`. Production chỉ phục vụ file tĩnh trong `dist/`, không cần Node server chạy thường trực.

## Thư mục chính

```text
.github/workflows/   # CI và deploy GitHub Pages
public/assets/       # photos/, audio/, fonts/, images/
src/config/          # Nội dung riêng, ảnh và màu
src/components/      # Các phần giao diện
src/graphics/        # SVG, hoa Three.js, quality và render lifecycle
src/motion/          # Timeline mở thư, reveal, giảm chuyển động
src/services/        # Trạng thái intro/graphics, quản lý nhạc/giọng đọc
src/styles/          # Token, layout, component
src/utils/           # Asset URL, DOM, kiểm tra nội dung
scripts/             # Kiểm tra cú pháp và cấu hình
tests/               # Dữ liệu, asset, theme, intro, audio, vòng đời 3D, bó hoa và đếm hoa
docs/                # Thay nội dung, deploy, kết quả kiểm tra
task/                # Kiến trúc và các task triển khai
```

## Cá nhân hóa

Sửa `src/config/content.js`. Thay `[Tên em]`, `[Tên bạn]`; những câu dùng `{{recipient.displayName}}`/`{{sender.name}}` tự điền theo cấu hình. Nhãn demo chỉ tắt khi `isDemo: false`; check/build từ chối marker mẫu còn sót ở chế độ này.

Đặt ảnh gốc vào `.originals/photos/`, chạy `npm run prepare:photos` để tạo bản WebP trong `public/assets/photos/`; công cụ giữ ảnh gốc, sửa hướng và in kích thước bản web. Đường dẫn cấu hình dùng `assets/photos/ten-anh.webp`, không có `public/` hay tên repository. `photo: null` tạo bố cục không ảnh; ảnh lỗi trên card quay về hoa SVG.

Đọc [hướng dẫn nội dung](./docs/content-guide.md), [design system](./docs/design-system.md), [mở thư và âm thanh](./docs/interaction-and-audio.md), [khu vườn Three.js](./docs/garden-graphics.md), [lời chúc và ảnh](./docs/wishes-and-photos.md), [thư và bó hoa kết](./docs/letter-and-finale.md), [tích hợp và hiệu năng](./docs/integration-and-performance.md), [kiến trúc](./task/00_architecture.md) và [tiến độ](./task/README.md).

## Deploy miễn phí

Hướng chính: **Vercel Hobby**, phù hợp web quà tặng cá nhân. Import repository GitHub cá nhân, preset Vite, output `dist`; cấu hình đã có trong `vercel.json`.

Hướng thay thế: **GitHub Pages** với repository public trên GitHub Free. Workflow tự dùng đúng base path từ Pages. CI chạy mặc định, deploy Pages chỉ bật khi chọn dùng Pages.

Xem [hướng dẫn từng bước](./docs/deployment.md). Hiện đã chuẩn bị cấu hình, chưa tạo repository remote hoặc xuất bản lên hosting.

Ảnh và lời chúc trong web tĩnh được gửi tới trình duyệt người xem; chỉ thêm ảnh bạn muốn dùng cho món quà. Repository private trên Vercel giúp giữ mã nguồn riêng, website đã public vẫn truy cập được qua link.
