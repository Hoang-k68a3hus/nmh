# Hệ thống thiết kế — khu vườn bằng giấy

## Hướng hình ảnh

Nền kem ấm, hoa màu hồng, cành sage và giấy có đường viền mảnh. Ảnh đặt trong khung giấy riêng, chữ không đè lên khuôn mặt. Chuyển động dùng để giới thiệu hình trang trí; nội dung luôn hiện và người xem cuộn tự nhiên.

## Typography

| Vai trò | Font / weight | Cách dùng |
| --- | --- | --- |
| Tiêu đề | Cormorant Garamond 500 | H1/H2/H3, kích thước fluid bằng clamp |
| Nhấn/chữ ký | Cormorant Garamond 500 italic | Từ nhấn, người nhận, chữ ký ngắn |
| Nội dung | Be Vietnam Pro 400 | Body 16 px, line-height 1.8 |
| Nhãn/nút | Be Vietnam Pro 600 | Eyebrow và thao tác chính |

Hai family có subset tiếng Việt. Font được import từ package Fontsource 5.3.0 vào `src/main.js`; Vite đưa file font vào build, browser tải từ cùng hosting. CSS dùng `font-display: swap` và unicode-range của package. [Cách đóng gói font](https://fontsource.org/docs/getting-started/install).

Fallback vẫn có Georgia/Segoe UI/Arial. Không dùng font viết tay dài; italic serif chỉ xuất hiện ở đoạn ngắn. Heading không có overflow hidden để tránh cắt dấu tiếng Việt; line-height và padding có khoảng cho dấu trên/dưới.

License được giữ ở `public/assets/fonts/Cormorant-Garamond-LICENSE.txt` và `Be-Vietnam-Pro-LICENSE.txt`, cùng metadata trong package.

Task0_8 dùng `src/styles/fonts.css` với 8 WOFF2 Latin/Vietnamese và unicode-range; không đóng gói WOFF/Cyrillic/Latin-ext chưa dùng. Chrome đã xác minh tiêu đề và đoạn thư có dấu dùng đúng font custom. Xem [tích hợp và hiệu năng](./integration-and-performance.md).

## Màu và theme

| Token gốc | Mặc định | Vai trò |
| --- | --- | --- |
| background | `#FFF8F1` | Nền chính |
| accent | `#883F56` | Nút, dấu thư, nơ, sợi chỉ |
| rose | `#E8A6B5` | Cánh hoa |
| leaf | `#91A68A` | Cành/lá |
| gold | `#E8C98E` | Nhụy và chi tiết sáng |

Sửa trong `content.theme`; SVG dùng CSS variables nên tự đổi màu cùng UI. `theme.js` tạo màu trung gian cho cánh/lá và chọn màu chữ theo nền.

Chữ dùng `--color-accent-ink`, không dùng màu trang trí một cách mặc định. Màu chữ nền chính, giấy và section garden được tính riêng; màu nhấn quá sáng vẫn giữ nguyên ở hoa/nút, còn chữ và nhãn nút chọn màu đọc được. Mục tiêu tương phản cho các cặp chữ là ít nhất 4.5:1.

Mẫu số đo trên browser với palette mặc định:

| Cặp chữ/nền | Tương phản |
| --- | --- |
| Chữ phụ / nền chính | 5.36:1 |
| Màu nhấn dạng chữ / nền chính | 6.90:1 |
| Nhãn nút / nền nút | 7.14:1 |
| Chữ phụ / section garden | 5.10:1 |
| Nội dung thư / giấy | 13.27:1 |

Đường viền và màu nhạt dùng trang trí, không làm nguồn duy nhất để hiểu thao tác.

## Token bố cục và component

`src/styles/tokens.css` định nghĩa font, màu fallback, nhịp spacing, radius, bóng, timing, gutter, độ rộng trang và độ rộng thư.

- Nhịp spacing: 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
- Trang tối đa 1140 px; thư tối đa 860 px và nội dung khoảng 64ch.
- Gutter fluid, mobile 16 px mỗi bên.
- Nút chính ít nhất 48 px cao; các link/nút điều khiển ít nhất 44 px cao.
- Focus ring 3 px, offset 5 px; giữ focus khi thao tác bằng bàn phím.
- Card desktop hai cột, photo card dành thêm độ rộng cho ảnh; dưới 700 px về một cột.
- Khung ảnh có giấy, viền, bóng nhẹ và tỷ lệ 4:5; dữ liệu focalPoint điều khiển crop.
- Hộp thư có texture CSS rất nhẹ; không cần ảnh nền lớn.

## Thư viện SVG

Nguồn: `src/graphics/svg/illustrations.js`.

| Hàm | Hình |
| --- | --- |
| `envelopeMarkup()` | Phong thư, giấy, con dấu hoa và chỉ buộc |
| `flowerMarkup({ variant })` | Rose, daisy hoặc tulip |
| `gardenMarkup()` | Cụm ba loại hoa, lá, quầng sáng |
| `bouquetMarkup()` | Bó hoa, giấy gói và nơ |
| `threadMarkup({ reverse })` | Đường chỉ cong và lá chuyển giữa cảnh |

`theme.flower: 'stylized'` dùng luân phiên ba kiểu trên các lời chúc. Có thể chọn `'rose'`, `'daisy'`, `'tulip'` để thống nhất hoa lời chúc; garden/bouquet vẫn phối ba kiểu.

Group dùng `data-part="stem|petals|leaves|ribbon|seal|flap|card|paper|center|flying-petal"` tùy hình, để điều khiển từng bộ phận. Không dùng ID/clipPath cho bộ SVG hiện tại, nên nhiều instance không trùng ID. Nếu sau này thêm clipPath/gradient, cần ID riêng mỗi instance.

SVG đều trang trí với `aria-hidden="true"`, `focusable="false"`. Tên thao tác thuộc nút HTML, không đưa SVG vào thứ tự Tab. Sợi chỉ nằm trong vùng trang trí riêng, không phủ lên chữ/ảnh và không chứa mốc kỷ niệm.

## Chuyển động

`svg-motion.js` theo dõi vùng nhìn thấy và các SVG fallback mới thêm vào DOM. `motion.css` thực hiện:

- Cành: vẽ stroke bằng `pathLength=1` và dash offset.
- Cánh: mở từ scale nhỏ tới trạng thái hoàn chỉnh.
- Lá: mở nhẹ một lần.
- Chỉ/nơ: vẽ nét trong 1.2–1.7 giây tính cả delay.
- Phong thư: chuyển vào vị trí nhẹ khi xuất hiện. CSS entry dừng trước chuỗi mở thư GSAP của task0_4.

Mỗi instance chạy một lần khi xuất hiện. Không có loop trang trí liên tục. Ẩn tab sẽ pause CSS animation; dispose gỡ observer/listener. SVG mới do ảnh lỗi được đăng ký tự động.

Khi `prefers-reduced-motion` bật, kể cả giữa lúc đang chạy, animation hủy và SVG trở về trạng thái hoàn chỉnh ngay. Không có trạng thái chữ bị ẩn để đợi motion. Thiếu IntersectionObserver cũng dùng hình hoàn chỉnh.

## QA đã thực hiện

Desktop/mobile giả lập 360, 390, 768, 1440 px; font tiếng Việt/italic, focus Tab và Enter, cỡ chữ, vùng chạm, contrast, ID SVG, ảnh/không ảnh, đổi màu SVG, motion hữu hạn và reduced motion giữa animation.

Xem [verification](./verification.md) để biết kiểm tra thực tế và giới hạn. [Mở thư tương tác](./interaction-and-audio.md), [hoa 3D](./garden-graphics.md), [hoa lời chúc có nút chạm](./wishes-and-photos.md) và [thư/bó hoa kết](./letter-and-finale.md) đã có ở task0_4 đến task0_7. SVG tương tác và phần kết do component/scene quản lý; observer trang trí bỏ qua chúng. Thư dùng fade nhẹ riêng, chữ luôn hiện.
