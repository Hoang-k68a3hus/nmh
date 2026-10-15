# Kiến trúc website

## 1. Định hướng

Website một trang, kể chuyện bằng cuộn dọc tự nhiên. Thời gian xem dự kiến 3–5 phút, người nhận chủ động quyết định tốc độ. Không chia route, không cần đăng nhập, không gọi API để lấy nội dung.

Ba lớp hiển thị:

1. **HTML:** lời chúc, ảnh, thư, nút và điều khiển; là nguồn nội dung chính.
2. **SVG/CSS:** phong thư, hoa minh họa, sợi chỉ, chữ ký, trang trí và hình dự phòng.
3. **Three.js:** khu vườn và bó hoa cuối; dùng chung một canvas và renderer.

Hiệu ứng nâng cao được bổ sung trên nền nội dung có thể đọc được. Lỗi tải 3D hoặc âm thanh không được làm mất lời chúc.

## 2. Công nghệ đề xuất

| Thành phần | Lựa chọn | Vai trò |
| --- | --- | --- |
| Build | Vite | Dev server, module, build tài nguyên tĩnh |
| Ngôn ngữ | JavaScript ES modules | Quy mô nhỏ, cấu trúc rõ |
| Đồ họa | Three.js | Hoa 3D, camera, hạt sáng |
| Animation | GSAP + CSS/IntersectionObserver | Timeline mở phong thư tải theo thao tác; reveal nhẹ bằng CSS |
| UI | HTML + CSS | Nội dung và responsive |
| Hình vector | SVG nội tuyến | Điều khiển từng nhóm cánh/lá/nét |
| Âm thanh | HTMLAudioElement | Nhạc nền và giọng đọc tùy chọn |

Không cần React, thư viện smooth-scroll, engine vật lý hoặc thư viện UI lớn cho phạm vi này. Khi khởi tạo, chọn phiên bản thư viện tương thích và ghi cố định trong lockfile; không giả định một phiên bản cụ thể từ tài liệu này.

Tài liệu tham khảo: [Three.js scene](https://threejs.org/manual/pages/creating-a-scene.html), [responsive](https://threejs.org/manual/pages/responsive.html), [shadow cost](https://threejs.org/manual/pages/shadows.html), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## 3. Cấu trúc mã nguồn dự kiến

```text
index.html
package.json
package-lock.json              # Nếu dùng npm; chỉ giữ một loại lockfile
vite.config.js
public/
  assets/
    photos/                   # Ảnh đã tối ưu và đặt tên trung tính
    audio/                    # Tùy chọn
    fonts/                    # Font có hỗ trợ tiếng Việt
    images/                   # Poster/fallback nếu cần
src/
  main.js                     # Khởi tạo, kết nối module
  config/
    content.js                # Tên, lời chúc, ảnh, thư, audio, theme
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    motion.css
    fonts.css                 # WOFF2 Latin/Vietnamese và unicode-range
  components/
    envelope.js
    wishes.js
    letter.js
    finale.js
    audio-controls.js
  graphics/
    svg/                      # Các hàm/template vector do dự án kiểm soát
    three/
      scene-manager.js
      flower-factory.js
      garden.js
      bouquet.js
      bouquet-motion.js
      particles.js
  motion/
    timelines.js
    scroll-scenes.js
    preferences.js
  services/
    page-state.js             # Visibility, motion, pointer, viewport, activeSection
    intro-controller.js
    graphics-controller.js
    wishes-state.js
    audio-manager.js
    asset-loader.js
  utils/
    assets.js                 # Xử lý URL có base path
    content-validation.js
docs/
  content-guide.md
  verification.md
dist/                         # Đầu ra build, không sửa tay
task/                         # Bộ tài liệu hiện tại
```

Có thể gộp module nếu quá nhỏ; giữ ranh giới nội dung, đồ họa và điều phối rõ ràng. Không tạo abstraction chỉ để đạt sơ đồ thư mục.

## 4. Hợp đồng cấu hình nội dung

Một nguồn dữ liệu duy nhất trong `src/config/content.js`. Mẫu sau là rút gọn để minh họa nhóm dữ liệu; file nguồn có đầy đủ các nhãn và trường bắt buộc:

```js
export const content = {
  isDemo: true,
  occasion: { label: 'Ngày Phụ nữ Việt Nam', displayDate: '20.10.2026', shortDate: '20/10' },
  recipient: { name: '[Tên em]', nickname: '' },
  sender: { name: '[Tên bạn]', signature: 'Thương em,\n{{sender.name}}' },
  page: {
    title: 'Một khu vườn dành cho {{recipient.displayName}} · {{occasion.shortDate}}',
    description: 'Một món quà nhỏ ngày {{occasion.shortDate}}.',
    brand: 'dành riêng cho em', footer: 'Một món quà nhỏ, một tình yêu lớn.',
  },
  theme: { background: '#FFF8F1', accent: '#883F56', rose: '#E8A6B5', leaf: '#91A68A', gold: '#E8C98E', flower: 'stylized' },
  intro: { title: 'Một khu vườn', titleTail: 'chỉ dành cho', emphasis: 'em.', button: 'Mở thư của anh' },
  hero: {
    title: 'Chúc mừng {{occasion.shortDate}}, {{recipient.displayName}}.',
    message: 'Mong hôm nay em nhận được thật nhiều dịu dàng.',
    photo: null,
  },
  wishSection: { title: 'Những điều anh', emphasis: 'mong dành cho em.' },
  wishes: [
    {
      id: 'joy',
      title: 'Mong em luôn có thật nhiều niềm vui',
      message: 'Mong những điều nhỏ bé mỗi ngày cũng khiến em mỉm cười.',
      photo: null,
    },
    // Bản hoàn chỉnh dự kiến có 5 lời chúc.
  ],
  letter: { title: 'Có vài điều anh muốn nói với em', paragraphs: [], photo: null },
  finale: { title: 'Một bó hoa dành cho em', message: 'Thương em, hôm nay và những ngày sau.' },
  audio: { background: null, narration: null },
};
```

Mỗi `photo` là `null` hoặc object:

```js
{
  src: 'assets/photos/portrait-01.webp',
  alt: 'Mô tả ngắn ảnh thực tế',
  width: 960,
  height: 1200,
  focalPoint: '50% 35%',
  caption: '',
}
```

Quy tắc dữ liệu:

- `id` lời chúc duy nhất, ổn định; không dùng thứ tự mảng làm định danh trạng thái.
- Nội dung văn bản được đưa vào DOM bằng `textContent` hoặc API tương đương, không ghép thành HTML tùy ý.
- `photo: null` tạo bố cục không ảnh hoàn chỉnh. Ảnh lỗi tải cũng chuyển sang bố cục này.
- `focalPoint` điều khiển `object-position`; tỷ lệ ảnh hero, card và thư có thể khác nhau.
- `width` và `height` là kích thước file ảnh web sau tối ưu; bản máy ảnh giữ ngoài `public/`.
- Đường dẫn asset được giải quyết qua base URL của build; tránh hardcode `/assets/...` khiến hỏng khi host dưới thư mục con.
- `isDemo` hiển thị nhãn nội dung mẫu ở bản xem trước; task bàn giao phải kiểm tra đã thay nội dung mẫu.
- Không có trường `memories`, `timeline`, `dateInvitation`, `giftUnlock` hoặc form trả lời.

Sau task0_2, `prepareContent` kiểm tra schema và thay token tên/ngày bằng chuỗi; component render bằng `textContent`. Nickname trống dùng tên người nhận. Marker mẫu còn sót làm check/build lỗi khi `isDemo: false`.

Vite đưa `page.title`, `page.description`, màu theme vào HTML trong dev/build; không cần bot chạy JavaScript để có metadata. Check và build kiểm tra file ảnh/audio có dữ liệu, đúng tên/chữ hoa–thường. Dev cho phép xem fallback khi file ảnh đang thiếu.

`npm run prepare:photos` dùng Sharp ở môi trường phát triển để tạo WebP/AVIF, sửa EXIF orientation, thu nhỏ, giữ ảnh gốc và in kích thước file web. Sharp không được đưa vào bundle browser. Xem [hướng dẫn nội dung](../docs/content-guide.md) để dùng các trường đầy đủ và lệnh xử lý ảnh.

## 5. Mô hình trạng thái

```text
experience: intro | opening | reading
activeSection: intro | garden | wishes | letter | finale
graphics: idle | loading | ready | fallback
motion: full | reduced
audio: unavailable | off | loading | playing | paused | error
openedWishIds: Set<string>
```

- Các trạng thái độc lập: âm thanh hoặc Three.js lỗi không làm `experience` đứng ở `opening`.
- Sau thao tác mở thư, chuyển sang nội dung ngay theo timeline ngắn; nếu người xem bỏ qua, timeline về trạng thái cuối và chuyển sang `reading`.
- `activeSection` cập nhật theo vùng nhìn thấy, cho phép cuộn ngược và mở trực tiếp anchor.
- `openedWishIds` chỉ dùng cho hoa trang trí và bộ đếm. Không khóa thư hoặc phần kết.
- Mặc định mỗi lần tải trang bắt đầu lại; không cần lưu trạng thái cá nhân vào localStorage.

Sau task0_4, `intro-controller.js` quản lý experience độc lập với DOM, hủy timeline và loại kết quả async cũ khi skip/reset. Timeline mở thư dài 1,72 giây, deadline 2,6 giây; lỗi tải vẫn hoàn tất bằng SVG. Component phong thư xử lý focus, anchor và cuộn tự do. Xem [mở thư và âm thanh](../docs/interaction-and-audio.md).

Sau task0_6, `wishes-state.js` giữ Set openedWishIds và total theo dữ liệu. Component lời chúc điều khiển SVG riêng, count/live status, ảnh/fallback và focus; lời chúc luôn hiện, không phụ thuộc thao tác hoa. Replay reset Set/timer/hình nụ. Xem [lời chúc và ảnh](../docs/wishes-and-photos.md).

Sau task0_8, `page-state.js` phân phối một nguồn visibility/reduced motion/pointer/viewport/activeSection cho các component. Scroll/resize gộp trong một RAF; consumer chỉ nhận các trường cần dùng. Main nối reset của intro/hoa/bó hoa/audio và dispose subscription trước khi hủy nguồn chung. Không tạo một store thứ hai cho trạng thái hoa hoặc âm thanh. Xem [tích hợp và hiệu năng](../docs/integration-and-performance.md).

## 6. Scene manager và vòng đời đồ họa

- Dùng một canvas, một renderer; garden và bouquet là các nhóm đối tượng hoặc bố cục trong cùng scene.
- Tải Three.js qua dynamic import sau khi giao diện mở đầu đã sẵn sàng. SVG fallback hiện trong thời gian chờ.
- Canvas là lớp trang trí `aria-hidden="true"`, mặc định `pointer-events: none`.
- Không đưa tương tác thiết yếu vào raycasting. Các hoa có lời chúc là nút HTML/SVG trong DOM.
- Canvas không bắt buộc sticky/pin toàn trang; thay nền theo section và chỉ hiển thị khi garden hoặc finale cần đồ họa.
- Bật render loop khi cảnh 3D đang hiện; tạm dừng khi tab ẩn hoặc không ở vùng cần 3D. Khi hiện lại, giới hạn delta time để tránh nhảy hoạt ảnh.
- Resize theo vùng hiển thị, cập nhật camera aspect và drawing buffer; giới hạn DPR ở preset thích hợp.
- Hủy observer, event listener, GSAP context/timeline và tài nguyên GPU khi dispose hoặc khởi tạo lại trong dev.
- Nếu khởi tạo WebGL hoặc tải module thất bại, giữ SVG fallback. Nếu mất context, chuyển về fallback; phục hồi là cải tiến tùy chọn.

`mountGardenGraphics` quản lý một canvas chuyển giữa garden và bouquet. Module `garden.js` lazy-load khi host hiện, chỉ ẩn SVG sau frame render đầu tiên. Controller giữ view mới nhất khi import chậm; context loss/render lỗi dispose scene và trở về SVG. Quality giới hạn DPR/FPS/hạt; reduced motion chỉ render frame tĩnh. Task0_7 đã có ghép bó/giấy/nơ; task0_8 gom cánh/lá bằng InstancedMesh, bỏ cập nhật DOM mỗi frame và giữ nhịp FPS khi RAF có jitter. Xem [đồ họa khu vườn](../docs/garden-graphics.md).

## 7. Chiến lược motion và SVG

- Một timeline quản lý mở phong thư, một timeline quản lý hoa nở; tránh nhiều tween cùng sửa một thuộc tính.
- SVG có group `petals`, `stem`, `leaves`, `ribbon`; ID và clipPath có tiền tố riêng mỗi instance.
- Tự vẽ nét bằng stroke dash; không phụ thuộc plugin bổ sung chỉ để có hiệu ứng này.
- Cuộn gốc của trình duyệt; không scroll hijacking. Ưu tiên reveal khi đi vào viewport, ít pinning.
- Với `prefers-reduced-motion`, tắt parallax, hạt sáng và camera chuyển động; hiện trạng thái cuối hoặc fade ngắn.
- Tắt JavaScript vẫn thấy lời chúc chung và lời giải thích ngắn trong `noscript`; khi JavaScript hoạt động nhưng 3D hỏng phải đọc đủ toàn bộ nội dung.

Sau task0_3, bộ SVG dùng CSS variables cho palette và `data-part` cho từng bộ phận; không cần ID/clipPath. `svg-motion.js` theo dõi viewport và SVG mới do fallback ảnh, chạy motion CSS một lần. Tắt motion giữa animation đưa về trạng thái hoàn chỉnh. Đọc [design system](../docs/design-system.md) cho token, font và hợp đồng selector chi tiết.

Typography dùng Cormorant Garamond 500/italic và Be Vietnam Pro 400/600 từ package Fontsource, được Vite bundle cùng web. Task0_8 đóng gói 8 WOFF2 Latin/Vietnamese với unicode-range, giữ font/license local. License nằm trong `public/assets/fonts/`. `theme.js` tạo màu chữ riêng cho nền chính/giấy/garden và nhãn nút; màu hoa giữ theo cấu hình.

## 8. Âm thanh

- Mặc định tắt. Gọi phát nhạc từ thao tác bật nhạc rõ ràng của người dùng, xử lý Promise bị từ chối.
- Không gộp nút mở thư với đồng ý bật nhạc.
- Nếu thiếu file nhạc, ẩn điều khiển tương ứng.
- Nếu phát giọng đọc, tạm dừng nhạc nền; chỉ khôi phục nếu trước đó người xem đã bật nhạc.
- Tab ẩn thì tạm dừng; khi quay lại giữ tạm dừng cho tới khi người xem chủ động phát lại.
- Nút hiển thị đúng trạng thái thực tế; không báo đang phát khi trình duyệt chặn.

`main.js` tạo một audio manager dùng chung; mỗi channel đã cấu hình có một player, chưa gán source trước thao tác phát. Manager có `subscribe()`, các lệnh nhạc/giọng đọc và guard cho Promise/event cũ. Task0_7 đã nối nút nghe thư; task0_8 dùng visibility chung và gộp status lặp để không cập nhật lại vùng thông báo. Bản demo không có audio thật.

## 9. Hiệu năng và dữ liệu cá nhân

Ngân sách khởi đầu, cần đo khi triển khai:

| Hạng mục | Mục tiêu |
| --- | --- |
| Tài nguyên màn hình đầu | Khoảng dưới 1 MB truyền tải, chưa gồm audio tải theo yêu cầu |
| Ảnh mỗi card | Khoảng 100–250 KB tùy độ chi tiết |
| Tổng ảnh | Cố gắng dưới 2 MB với 3–5 ảnh |
| Hoạt ảnh trên điện thoại thử nghiệm | Hướng tới ít nhất 30 fps ổn định |
| DPR | Khởi điểm tối đa 1.5 trên mobile, 2 trên desktop; điều chỉnh theo đo đạc |
| Hạt sáng | Ít, có preset giảm và tắt hoàn toàn |

Không mặc định bật bloom, nhiều shadow map hoặc texture lớn. Ưu tiên vật liệu đơn giản, tái sử dụng geometry/material và bóng giả.

Ảnh được đóng gói trong web tĩnh có thể được tải bởi người truy cập link. Không coi link khó đoán hoặc mật khẩu JavaScript là bảo vệ ảnh. Chỉ đưa các ảnh người dùng chọn cho món quà; metadata chia sẻ mặc định dùng hình hoa, không tự dùng chân dung làm ảnh preview.

## 10. Đầu ra

- Mã nguồn có cấu hình nội dung dễ sửa.
- Build `dist/` chạy trên static hosting, không có runtime server.
- Hướng dẫn thay ảnh/lời chúc, lệnh dev/build/preview và cấu hình base path.
- Báo cáo các kiểm tra thực tế, thiết bị/trình duyệt đã thử và giới hạn còn lại.
