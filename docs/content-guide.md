# Thay nội dung và ảnh

## Nguồn dữ liệu

Sửa `src/config/content.js`. Các component đọc nội dung từ file này; không cần sửa SVG hoặc timeline để thay lời chúc.

| Nhóm | Nội dung sửa được |
| --- | --- |
| `recipient` | `name`: tên thật; `nickname`: biệt danh hoặc chuỗi rỗng |
| `sender` | `name`: tên người gửi; `signature`: chữ ký, có thể dùng `\n` |
| `occasion` | Tên dịp, `displayDate: '20.10.2026'`, `shortDate: '20/10'` |
| `page` | Tiêu đề tab/chia sẻ, mô tả, chữ ở header/footer |
| `intro` | Tiêu đề mở đầu tách thành `title`, `titleTail`, `emphasis`; dòng người nhận, lời mở đầu, `openingLabel`, `skipLabel`, `openedMessage` và footnote. Phong thư tự mở khi tải trang. |
| `hero` | Tiêu đề/lời chúc chính, nhãn cuộn tiếp, ảnh tùy chọn |
| `wishSection` | Tiêu đề/mô tả, nhãn card, gợi ý chạm hoa, nhãn nút/count/đơn vị hoa, lời nhắn khi đủ hoa và nhãn đọc thư |
| `wishes` | Năm lời chúc mẫu; mỗi lời có `id`, `title`, `message`, `photo` |
| `letter` | Tiêu đề, mảng đoạn văn, ảnh tùy chọn, nhãn/trạng thái nghe thư; giữ mỗi đoạn là một chuỗi |
| `finale` | Lời kết cạnh bó hoa và nhãn xem lại |
| `audio` | `background`, `narration`: path local hoặc `null` |
| `theme` | `background`, `accent`, `rose`, `leaf`, `gold`: màu `#RRGGBB`; `flower` chọn kiểu hoa lời chúc |
| `isDemo` | `true` khi dùng mẫu; `false` sau khi đã cá nhân hóa |

Màu SVG và UI cùng đọc theme. `rose`, `leaf`, `gold` có thể bỏ để dùng mặc định. `flower: 'stylized'` luân phiên hoa hồng/cúc/tulip; chọn `'rose'`, `'daisy'`, `'tulip'` nếu muốn hoa lời chúc đồng nhất. Màu chữ được chọn để đọc được khi đổi màu nhấn/nền. Xem [design system](./design-system.md).

Mỗi card lời chúc luôn có nút hoa, kể cả khi có ảnh. Nhãn tương tác dùng `wishSection.interactionHint`, `bloomLabel`, `bloomedLabel`, `counterLabel`, `flowerUnit`, `completeMessage`, `nextLabel`. Lời nhắn khi đủ hoa chỉ thêm một câu phụ; người xem luôn có thể đọc thư ngay. Xem [lời chúc và ảnh](./wishes-and-photos.md).

Khu vườn Three.js cũng đọc palette và `theme.flower`; ảnh hero vẫn là HTML, không làm texture 3D. Có ảnh thì vùng trang trí thu gọn. Không cần thêm model hoặc texture để chạy vườn; xem [đồ họa khu vườn](./garden-graphics.md).

Thư có ảnh tùy chọn và nút nghe giọng đọc khi cấu hình file; chữ ký thư/bó hoa cùng dùng `sender.signature`. Nhãn phát/tạm dừng/tiếp tục/nghe lại/thử lại và thông báo sửa trong nhóm `letter`. Xem [thư và phần kết](./letter-and-finale.md) và [mở thư và âm thanh](./interaction-and-audio.md).

## Đổi tên một lần, dùng ở nhiều chỗ

Thay `[Tên em]`, `[Tên bạn]` trong cấu hình. Để `nickname: ''` nếu không dùng biệt danh. Các câu mặc định tự điền tên người nhận và chữ ký bằng token:

| Token | Giá trị |
| --- | --- |
| `{{recipient.name}}` | Tên thật |
| `{{recipient.nickname}}` | Biệt danh, hoặc tên nếu biệt danh trống |
| `{{recipient.displayName}}` | Biệt danh, hoặc tên nếu biệt danh trống |
| `{{sender.name}}` | Tên người gửi |
| `{{occasion.label}}` | Tên dịp |
| `{{occasion.displayDate}}` | Ngày đầy đủ |
| `{{occasion.shortDate}}` | Ngày ngắn |

Ví dụ `title: 'Chúc mừng {{occasion.shortDate}}, {{recipient.displayName}}.'`. Có thể thay cả câu bằng lời nhắn trực tiếp; không bắt buộc dùng token. Token sai hoặc chưa đóng báo lỗi kiểm tra.

Các trường tên/ngày gốc là giá trị trực tiếp, không dùng token để tham chiếu vòng. Nội dung được render bằng text, dấu `<`, `>` hoặc dấu nháy không được hiểu thành HTML.

Khi đặt `isDemo: false`, check/build sẽ từ chối những marker mẫu như `[Tên em]`, `[Tên bạn]`, `[Biệt danh]`, `[Chữ ký]`, `[Mô tả ảnh]` còn sót. Việc thay giọng văn của bức thư vẫn cần bạn đọc lại; công cụ không tự biết câu nào là câu bạn muốn gửi.

`page.title`, `page.description` và màu nền được đưa vào HTML ngay lúc dev/build. Bot chia sẻ có thể đọc chúng mà không cần chạy JavaScript. Nếu sau này cần ảnh preview, thêm ảnh raster và URL HTTPS tuyệt đối sau khi có domain thật; không tự dùng ảnh chân dung cho preview.

## Chuẩn bị ảnh web từ ảnh gốc

1. Giữ ảnh gốc ngoài `public/`, ví dụ `.originals/photos/`. Thư mục `.originals/` đã được ignore Git, không được copy vào bản web.
2. Đặt ảnh JPG, PNG, WebP hoặc AVIF vào đó. Ảnh HEIC nên xuất sang JPG trước.
3. Chạy:

```powershell
npm.cmd run prepare:photos
```

Mặc định công cụ tạo `public/assets/photos/portrait-01.webp`, `portrait-02.webp`… theo thứ tự tên ảnh gốc. Ảnh được sửa hướng EXIF, thu nhỏ để cả hai chiều không vượt 1200 px, không phóng to ảnh nhỏ, chất lượng WebP 82; bản web bỏ metadata. Ảnh gốc giữ nguyên. [Sharp autoOrient](https://sharp.pixelplumbing.com/api-operation/#autoorient), [resize](https://sharp.pixelplumbing.com/api-resize/), [output](https://sharp.pixelplumbing.com/api-output/).

Công cụ in object gồm `src`, `width`, `height`, `alt`, `focalPoint` và kích thước file để copy vào cấu hình. Thay `[Mô tả ảnh]` bằng mô tả thực tế. Kích thước dùng trong cấu hình là của bản web vừa tạo, không còn là kích thước file máy ảnh.

Tùy chỉnh khi cần:

```powershell
npm.cmd run prepare:photos -- --size 960 --quality 80
npm.cmd run prepare:photos -- --format avif
npm.cmd run prepare:photos -- --input .originals/next-batch --start 6
npm.cmd run prepare:photos -- --help
```

Chạy lại với file đích đã tồn tại sẽ báo lỗi trước khi xử lý batch, để giữ ảnh đã có. Với batch mới dùng thư mục ảnh gốc mới và `--start` tiếp theo. Nếu muốn xử lý lại, chọn thư mục đầu ra khác bằng `--output`, xem bản mới rồi thay file bạn chọn.

Giữ mỗi ảnh khoảng 100–250 KB khi có thể; nếu file còn nặng, giảm `size` hoặc `quality` rồi kiểm tra khuôn mặt ở màn hình thật. Không crop trong bước chuyển đổi; crop hiển thị được điều chỉnh riêng bằng `focalPoint`.

## Thêm ảnh cô ấy

1. Dùng ảnh đã tối ưu trong `public/assets/photos/`.
2. Đặt trường `photo` của lời chúc thành:

```js
photo: {
  src: 'assets/photos/portrait-01.webp',
  alt: 'Mô tả ngắn hình ảnh thực tế',
  width: 960,
  height: 1200,
  focalPoint: '50% 35%',
  caption: '',
}
```

3. Dùng kích thước thực tế của file web cho width/height.
4. Xem bản mobile và chỉnh `focalPoint` nếu cần để không cắt khuôn mặt.
5. Để `photo: null` khi không dùng ảnh.

`focalPoint` cần hai phần trăm từ 0 tới 100: `50% 35%` giữ vùng hơi cao hơn tâm ảnh. Khung hiển thị hiện dùng tỷ lệ 4:5; ảnh ngang vẫn dùng được nhưng cần xem crop. Mỗi card tối đa một ảnh; không cần đủ ảnh cho tất cả card.

Ảnh hero, lời chúc và thư đều dùng lazy-loading vì nằm sau intro; khung giữ tỷ lệ trước khi tải. Trình duyệt có thể tải sớm ảnh gần viewport. Ảnh thiếu/lỗi decode trả về hoa SVG trên card, gỡ ảnh và bố cục chân dung trong hero/thư; lời chúc luôn giữ nguyên. Có thể thêm ảnh tương tự ở `hero.photo` và `letter.photo`.

Chân dung cần alt có nghĩa. Chỉ với ảnh thuần trang trí mới dùng `decorative: true, alt: ''`; không đánh dấu chân dung là trang trí chỉ để bỏ mô tả.

## Thêm nhạc

Đặt file vào `public/assets/audio/`, ví dụ cấu hình `background: 'assets/audio/background.mp3'`. Hỗ trợ cấu hình MP3, M4A, OGG, WAV, AAC; MP3 là lựa chọn khởi đầu thuận tiện, cần kiểm tra file thật trên thiết bị nhận.

Nút nhạc chỉ hiện khi có path, nhạc mặc định tắt và chỉ gán nguồn/tải khi nhấn bật. Mở phong thư không bật nhạc. Nhạc lỗi có thông báo ngắn và nút thử lại; chuyển sang tab khác sẽ tạm dừng, quay lại chờ nhấn bật lại.

`narration: 'assets/audio/letter.mp3'` hiện nút nghe trong thư; để `null` nếu không dùng giọng đọc. Nút hỗ trợ phát/tạm dừng/tiếp tục, nghe lại sau khi đọc xong và thử lại khi lỗi. Nghe thư tạm dừng nhạc nền, kết thúc/tạm dừng chỉ khôi phục lựa chọn nhạc đã bật trước đó. “Xem lại từ đầu” dừng và tua giọng đọc. Hiện bản demo không chứa nhạc hoặc giọng đọc thật.

## Thay đổi và kiểm tra

Chạy `npm run dev` để xem ngay. Trước khi deploy, chạy `npm run check`, `npm test`, `npm run build`.

Check và build kiểm tra dữ liệu, file ảnh/audio có tồn tại, có dữ liệu và đúng chữ hoa/thường. Ví dụ `Portrait.webp` khác `portrait.webp` trên Linux hosting dù Windows có thể mở được cả hai. Không khai báo đường dẫn ảnh chưa có: để `photo: null` cho tới khi đặt file vào đúng chỗ.

Đường dẫn phải là `assets/photos/...` hoặc `assets/audio/...`, không có `public/`, URL ngoài hoặc tên repository. Helper sẽ thêm base path của Vercel/GitHub Pages.

Không đặt API key hoặc mật khẩu vào nội dung hoặc biến `VITE_*`; các dữ liệu này được đóng gói trong bản web gửi tới trình duyệt.
