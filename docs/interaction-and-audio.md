# Mở phong thư và âm thanh

Task0_4 bổ sung tương tác trên nền HTML luôn đọc được. Người xem có thể cuộn thẳng tới lời chúc; không có overlay khóa trang và không cần chờ Three.js.

## Mở thư

`src/services/intro-controller.js` điều phối ba trạng thái:

| Trạng thái | Giao diện và thao tác |
| --- | --- |
| `intro` | Phong thư đóng; nút mở sẵn sàng |
| `opening` | Dấu hoa tách, nắp mở, tờ giấy đi lên, cánh hoa bay; hiện nút bỏ qua |
| `reading` | Phong thư đã mở; nút đổi thành “Đọc lời chúc” |

Khi tải trang bình thường, phong thư chờ sự kiện `load` rồi thêm 3 giây mới tự mở. Timeline 3D chạy chậm hơn (timeScale 0,65, khoảng 3,6 giây); fallback SVG cũng được làm chậm tương ứng. Timeline được import khi bắt đầu mở. Watchdog 8 giây hoặc lỗi tải sẽ đưa tới trạng thái SVG cuối để không kẹt.

- Nhấn liên tục trong `opening` chỉ giữ một lượt mở.
- “Bỏ qua chuyển động” hủy lượt đang chạy và hiện trạng thái cuối ngay. Nút nằm trong nhóm mở thư; trên mobile, nhóm được đưa vào vùng nhìn thấy, không phủ lên nội dung.
- Reduced motion từ đầu không tải timeline mở thư. Nếu bật giữa chừng, controller hoàn tất ngay.
- Mở xong đưa focus tới `garden-title`, rồi cuộn tới khu vườn. Điều khiển bàn phím có thể chuyển focus sang nút bỏ qua khi animation bắt đầu.
- Link `#garden`, `#wishes`, `#letter`, `#finale` khởi tạo `reading`, cuộn và focus đúng tiêu đề. Người xem cuộn vượt intro giữa animation thì lượt mở kết thúc mà không kéo lại khu vườn.
- “Xem lại từ đầu” hủy timeline/timer cũ, khôi phục SVG, cập nhật `#intro` và đưa focus về nút mở. Kết quả import cũ không được sửa lượt mới.

`src/components/envelope.js` quản lý DOM/focus; controller chỉ quản lý trạng thái và vòng đời. Callback `onReplay` trong `main.js` dừng và tua giọng đọc; lựa chọn nhạc nền được giữ.

Các nhãn sửa ở nhóm `intro` trong `src/config/content.js`: `openingLabel`, `skipLabel`, `openedMessage`. Phong thư tự chạy khi tải trang; người xem có thể bỏ qua chuyển động. `openedMessage` được đọc qua vùng trạng thái `aria-live`, không thêm đoạn chữ phủ lên hình.

CSS entry của phong thư dừng trước khi timeline mở quản lý cùng bộ phận SVG. Timeline có `dispose()` để revert GSAP context; component đặt hình cuối hoặc khôi phục hình gốc sau đó.

## Nhạc tùy chọn

Đặt file thật vào `public/assets/audio/`, rồi sửa:

```js
audio: {
  background: 'assets/audio/background.mp3',
  narration: null,
}
```

Đường dẫn không chứa `public/` hoặc tên repository. `assetUrl()` tự thêm base path khi build cho Pages. Check/build yêu cầu file tồn tại, có dữ liệu và đúng chữ hoa–thường. Kiểm tra định dạng thực tế trên thiết bị người nhận; kiểm tra build không giải mã nội dung âm thanh.

Nếu `background: null`, không có nút nhạc. Nếu có file, nút xuất hiện ở header; ban đầu không gán `src`, `preload='none'`, `autoplay=false`. Nhạc chỉ tải/phát khi người xem nhấn bật riêng. Mở thư không bật nhạc. Nhạc nền lặp với volume 0,25.

| Trạng thái | Nhãn nút |
| --- | --- |
| `off` | Bật nhạc |
| `loading` | Dừng tải nhạc |
| `playing` | Tắt nhạc |
| `paused` | Bật lại nhạc |
| `error` | Thử bật nhạc |

`aria-pressed` chỉ đúng khi đang phát; `aria-busy` đúng trong lúc chờ. Nếu trình duyệt chặn, thông báo “Chạm lại để thử bật nhạc nhé.” Nếu file lỗi, thông báo “Nhạc chưa mở được. Em vẫn có thể đọc tiếp nhé.” Nút giữ khả năng thử lại; retry file gọi `load()` rồi thử phát. Không có toast.

Khi tab ẩn, nhạc và giọng đọc đang chạy đều tạm dừng. Trở lại tab không tự phát; cần thao tác bật lại. Promise và event media đến muộn không được ghi đè lựa chọn tắt hoặc lượt phát mới.

## Dùng chung manager với giọng đọc

`main.js` tạo một `createAudioManager(content.audio)` và truyền cho các component. Manager chỉ tạo player cho channel đã cấu hình, tối đa một player nhạc và một player giọng đọc. Các component dùng `subscribe()` để hiển thị cùng trạng thái; không tạo player riêng.

```js
const unsubscribe = audio.subscribe(({ background, narration }) => {
  // Đồng bộ nút theo status, error và available của từng channel.
});

// Gọi trực tiếp trong handler thao tác của người xem:
void audio.toggleBackground();
void audio.toggleNarration(); // Nút thư: phát, tạm dừng hoặc tiếp tục.
void audio.playNarration();
void audio.pauseNarration();
void audio.stopNarration(); // Dừng và tua về đầu.

// Cleanup khi component/app bị hủy:
unsubscribe();
audio.dispose();
```

Phát giọng đọc tạm dừng nhạc. Khi giọng đọc kết thúc/tạm dừng/lỗi, chỉ khôi phục nhạc đã được người xem bật trước đó và tab vẫn hiện. Nếu người xem bỏ nhạc trong lúc nghe thư, hoặc tab đã ẩn, không khôi phục. Khi nhạc đang nhường cho giọng đọc, nút đổi thành “Bỏ nhạc nền” để hủy lựa chọn khôi phục.

Task0_7 đã nối nút nghe thư vào cùng manager. Nút chỉ hiện khi có file giọng đọc; nhãn thay đổi theo off/loading/playing/paused/error và `ended`. Kết thúc hiện “Nghe lại lá thư”; nhấn phát tua về đầu. Lỗi có thông báo cạnh nút và cho thử lại; chữ không bị ẩn. Replay dừng/tua giọng đọc, giữ lựa chọn nhạc và không gọi `play()` thêm khi nhạc đã đang phát. Xem [thư và phần kết](./letter-and-finale.md) để thay nhãn.

Bản demo hiện để cả hai đường dẫn `null`; không đóng gói file âm thanh thử.

Xem [báo cáo kiểm tra](./verification.md) và [hướng dẫn nội dung](./content-guide.md).
