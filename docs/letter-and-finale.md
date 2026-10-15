# Thư riêng và bó hoa kết

Task0_7 hoàn thiện hai phần cuối của trải nghiệm: thư trên nền giấy, ảnh cô ấy tùy chọn, nút nghe giọng đọc khi có file và bó hoa từ chính 7 bông hoa của khu vườn. Người xem có thể mở trực tiếp `#letter` hoặc `#finale` ngay cả khi chưa chạm hoa lời chúc.

## Nội dung thư

Sửa nhóm `letter` trong `src/config/content.js`. `paragraphs` là mảng chuỗi; mỗi phần tử tạo một đoạn HTML bằng `textContent`. Mẫu hiện có năm đoạn, khoảng 190 từ, không thêm kỷ niệm hoặc lời hẹn chưa được cung cấp. Chữ ký thư và phần kết cùng lấy từ `sender.signature`, hỗ trợ xuống dòng bằng `\n` và token tên người gửi.

Chữ nội dung tối thiểu 16 px, line-height 1,9; khung giấy giới hạn độ dài dòng. Đoạn văn có fade 350 ms từ opacity 0,88 đến 1 khi vào vùng nhìn thấy; chữ luôn sẵn để đọc. Không có gõ chữ, trượt cả tờ giấy hoặc chờ hiệu ứng mới đọc được. Reduced motion/không có IntersectionObserver giữ chữ hiện ngay; cuộn ngược không ẩn chữ.

`letter.photo: null` dùng bố cục chỉ có chữ. Thêm object ảnh giống ảnh lời chúc để đặt ảnh cạnh lời mở đầu trên desktop và phía trên các đoạn văn trên mobile. Ảnh là HTML có alt/caption, lazy-loading, khung 4:5 và `focalPoint`; không nằm sau chữ. Ảnh lỗi được gỡ, phần chữ trở về một cột. Xem [hướng dẫn thêm ảnh](./content-guide.md).

## Nghe giọng đọc

Đặt bản ghi thật vào `public/assets/audio/`, rồi sửa:

```js
audio: {
  background: null, // Hoặc đường dẫn nhạc nền đã chuẩn bị.
  narration: 'assets/audio/letter.mp3',
}
```

Nếu `narration: null`, thư không hiện nút nghe và manager không tạo player giọng đọc. Nếu có đường dẫn, nút xuất hiện nhưng chưa gán source/tải/phát cho tới thao tác nhấn của người xem. Bản chữ luôn giữ nguyên. Check/build xác minh đường dẫn/file; định dạng và chất lượng bản ghi cần kiểm tra bằng file thật trên thiết bị nhận.

| Trạng thái | Trường nhãn trong `letter` |
| --- | --- |
| Chưa phát | `listenLabel` |
| Đang tải; nhấn để hủy | `loadingLabel` |
| Đang phát; nhấn để tạm dừng | `pauseLabel` |
| Đã tạm dừng; nhấn để tiếp tục | `resumeLabel` |
| Đã đọc xong; nhấn để nghe lại | `listenAgainLabel` |
| Lỗi; nhấn để thử lại | `retryLabel` |

Thông báo dùng `blockedMessage`, `errorMessage`, `finishedMessage`, hiển thị gần nút và có vùng trạng thái polite. `aria-pressed` phản ánh đang phát, `aria-busy` phản ánh đang tải. Nút native dùng được bằng bàn phím, không tự di chuyển focus khi trạng thái đổi.

Component thư nhận manager chung từ `main.js` và gọi `audio.toggleNarration()` trực tiếp trong handler. Không tạo player thứ hai. Nghe thư tạm dừng nhạc nền; tạm dừng/kết thúc/lỗi chỉ khôi phục lựa chọn nhạc đã bật trước đó khi tab còn hiện. Tab ẩn dừng cả hai; hiện lại cần nhấn phát. “Xem lại từ đầu” dừng và tua giọng đọc, giữ lựa chọn nhạc nền, dùng lại hai player. Xem [hợp đồng âm thanh](./interaction-and-audio.md).

## Bó hoa

`bouquet-motion.js` quản lý `idle → assembling → tying → complete`. Khi vùng bó hoa hiện, 7 bông hoa chuyển từ vị trí vườn sang bố cục bó; hai mảnh giấy gói 3D xuất hiện, nơ SVG được vẽ trên giấy. Một lượt dài khoảng 2,2 giây thời gian render; delta được giới hạn 50 ms, tạm dừng ngoài vùng nhìn thấy/tab ẩn. Không có sway, hạt sáng hoặc pointer parallax ở phần kết.

Nơ được chiếu từ vị trí buộc trên giấy qua camera sang tọa độ CSS của host, giữ đúng chỗ khi resize. Lớp nơ nằm trên canvas, không nhận pointer/focus. Hoa, giấy và nơ cùng đọc palette theme. Giấy sở hữu hai geometry và hai material riêng; factory hoa vẫn chia sẻ tài nguyên giữa bảy bông.

Sau khi ghép bó hoàn tất, renderer chuyển sang frame tĩnh và hủy vòng RAF. Resize/đổi layout có thể render lại để cập nhật hình. Cuộn đi rồi quay lại giữ bó đã hoàn tất; mỗi lượt xem chỉ chạy một lần. “Xem lại từ đầu” reset hoa, bộ đếm và animation kết, chờ rời vùng cuối trước khi cho chạy lượt mới; cùng canvas/renderer được dùng lại.

SVG bó hoa luôn có trong DOM và hiện trong lúc chờ module. Không có WebGL2, module/render lỗi hoặc mất context sẽ gỡ canvas và hiện SVG. Fallback có fade ngắn một lần; reduced motion hiện trạng thái cuối ngay, không animation. Chữ, chữ ký và nút xem lại là HTML nên không phụ thuộc 3D.

Phần kết chỉ có lời chúc, chữ ký và nút “Xem lại từ đầu”. Không có điều kiện đủ hoa, lời hẹn, quà bí mật hoặc bước mở khóa.

## Vòng đời và kiểm tra

`mountLetter()` và `mountFinale()` trả API `dispose()`; finale thêm `reset()` và `getState()`. Mỗi host giữ một owner qua `Symbol.for`, mount lại gỡ observer/listener/subscription/timer cũ. `main.js` nối reset cùng intro, lời chúc, audio và graphics; dispose theo thứ tự ngược để component ngừng nghe trước khi manager bị hủy.

Chrome đã kiểm tra 360/390/768/1440 px, thư có/không ảnh, ảnh/audio hỏng, giọng đọc phát/tạm dừng/tiếp tục/kết thúc/nghe lại, tab ẩn, replay hai lần và giữ một canvas. Production root và `/2010/` được kiểm tra riêng. Kết quả và giới hạn thiết bị/file thật ở [báo cáo kiểm tra](./verification.md).
