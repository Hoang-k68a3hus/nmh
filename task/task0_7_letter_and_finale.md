# Task0_7 — Thư riêng và bó hoa kết

- Trạng thái: DONE
- Phụ thuộc: task0_5, task0_6
- Ưu tiên: bắt buộc; giọng đọc tùy chọn

## Mục tiêu

Kết thúc bằng một bức thư chân thành và hình ảnh bó hoa. Không tạo một bước nhận quà bất ngờ hoặc lời hẹn ngoài đời.

## Bức thư

- Tiêu đề “Có vài điều anh muốn nói với em”.
- Khoảng 180–300 từ trong 4–5 đoạn ngắn, lấy từ cấu hình.
- Mạch nội dung: trân trọng con người cô ấy → lời chúc cho cuộc sống và mong muốn của cô ấy → lời nhắn yêu thương → chữ ký.
- Không tự thêm kỷ niệm, tình tiết quan hệ hoặc lời hứa cụ thể chưa được cung cấp.
- Ảnh tùy chọn đặt cạnh lời mở đầu trên desktop, phía trên/sau một đoạn trên mobile; không dùng ảnh nền phía sau chữ.
- Nền giấy và typography dễ đọc; tắt hoặc giảm mạnh chuyển động trang trí.
- Đoạn văn fade ngắn khi hiện; không bắt chờ hiệu ứng gõ chữ.
- Chữ ký có thể dùng tên render bằng font hoặc nét SVG trang trí, không giả định đã có bản chữ ký tay thật.
- Nếu có giọng đọc, đặt nút phát/tạm dừng; bản chữ luôn có sẵn. Audio manager tạm dừng nhạc nền theo hợp đồng chung.

## Phần kết

- Tiêu đề “Một bó hoa dành cho em”.
- Lời chúc ngắn và chữ ký của người gửi.
- Khi section vào viewport, chuyển các bông hoa về bố cục bó, thêm nơ SVG.
- Chạy animation một lần mỗi lượt xem; cuộn ngược không làm chữ biến mất.
- Nếu 3D không khả dụng, dùng SVG bó hoa có fade nhẹ hoặc hiện ngay.
- Không có nút “Còn một bất ngờ”, vé hẹn, hộp quà, chọn ngày, gửi phản hồi hoặc điều kiện mở khóa.
- Nút duy nhất cần ở phần kết: “Xem lại từ đầu”. Điều khiển âm thanh chung vẫn có thể dùng.
- Tải thiệp không thuộc phạm vi bản đầu.

## Xem lại

- Về đầu trang với kiểu cuộn phù hợp reduced motion.
- Reset phong thư, hoa, bộ đếm và animation kết; không tạo lại toàn bộ renderer/audio player.
- Dừng giọng đọc nếu đang phát; giữ lựa chọn nhạc nền hiện có.
- Chuyển focus tới nút mở thư sau khi intro hiển thị.

## Tiêu chí hoàn thành

- [x] Thư đọc dễ ở 360 px, không cắt dòng hoặc dấu tiếng Việt.
- [x] Thêm/bỏ ảnh thư không cần chỉnh logic animation.
- [x] Giọng đọc, nếu có, không phát chồng nhạc nền ngoài thiết kế.
- [x] Bó hoa hiện ngay cả khi bỏ qua toàn bộ tương tác hoa trước đó.
- [x] Có fallback SVG và reduced motion.
- [x] Không còn thành phần lời hẹn hoặc bất ngờ cuối.
- [x] Xem lại hai lần không nhân đôi listener, canvas hoặc âm thanh.

## Kiểm tra phù hợp

Cuộn nhanh từ intro tới cuối; mở anchor finale; quay lại đọc thư; replay nhiều lần; tắt 3D; thay cấu hình thư ngắn/dài và có/không có ảnh.

## Kết quả — 14/10/2026

- Thư năm đoạn khoảng 190 từ trên nền giấy; chữ luôn hiện, fade nhẹ 350 ms, không trượt tờ giấy. Ảnh tùy chọn bên cạnh trên desktop/phía trên trên mobile; lỗi ảnh gỡ khung và giữ toàn bộ chữ. Chữ ký dùng chung từ cấu hình.
- Nút nghe chỉ hiện khi có `audio.narration`, không tải/phát trước thao tác. Phát/tạm dừng/tiếp tục/kết thúc/nghe lại/retry đã nối manager chung; nhạc nhường cho giọng đọc, tab ẩn không tự phát lại. Replay dừng/tua giọng đọc và giữ lựa chọn nhạc, không tạo thêm player.
- Cùng 7 hoa/canvas/renderer ghép thành bó trong khoảng 2,2 giây thời gian render, thêm hai mảnh giấy gói 3D và nơ SVG chiếu theo camera. Chạy một lần/lượt rồi giữ frame tĩnh; reduced motion hiện ngay. Module tải chậm/không có WebGL2/context mất vẫn hiện SVG và nội dung.
- `npm.cmd run check`: PASS, 49 file JS/MJS; `npm.cmd test`: PASS, 70/70. Build root và `/2010/` thành công. Chrome dev/root/Pages kiểm tra 360/390/768/1440 px, anchor trực tiếp, cuộn lại, replay hai lần, một canvas, reset 0/5 và fallback đều đạt; không console/asset errors.
- Audio thật qua HTMLAudioElement được kiểm tra với WAV im lặng; ảnh là hình hoa thử bố cục. Fixture đã dọn khỏi public và hai artifact trước bàn giao, cấu hình demo vẫn photo/audio null. Chưa kiểm tra crop khuôn mặt, chất lượng bản ghi hoặc điện thoại thật.

Xem [thư và phần kết](../docs/letter-and-finale.md) và [báo cáo kiểm tra](../docs/verification.md). Task tiếp theo là [task0_8](./task0_8_integration_and_performance.md).
