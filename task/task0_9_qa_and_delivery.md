# Task0_9 — Kiểm thử và bàn giao

- Trạng thái: DONE
- Phụ thuộc: task0_8
- Ưu tiên: bắt buộc

## Mục tiêu

Bàn giao mã nguồn và bản build tĩnh đã kiểm tra, có hướng dẫn cá nhân hóa rõ ràng. Không tự coi bản demo là món quà đã hoàn thiện nội dung.

## Ma trận kiểm tra

| Tình huống | Kết quả cần đạt |
| --- | --- |
| Lần mở bình thường | Phong thư → vườn → lời chúc/ảnh → thư → bó hoa |
| Bỏ qua intro | Nội dung hiện, không còn overlay/scroll lock |
| Bấm mở nhiều lần | Một timeline và một lần chuyển trạng thái |
| Không chạm bông hoa nào | Vẫn đọc hết thư và phần kết |
| Chạm hoa nhiều lần | Đếm đúng số hoa duy nhất |
| Ảnh trống hoặc lỗi | Card đẹp và lời chúc nguyên vẹn |
| Lời chúc/biệt danh dài | Không cắt chữ, không tràn màn hình |
| Nhạc vắng mặt hoặc lỗi | Nội dung dùng bình thường, control đúng trạng thái |
| Phát giọng đọc | Nhạc nền tạm dừng đúng, không tự bật nếu trước đó tắt |
| 3D không khả dụng | SVG thay thế ở vườn và kết |
| Reduced motion | Không có chuyển động camera/hạt sáng liên tục |
| Cuộn rất nhanh/anchor | Nội dung và cảnh hiện đúng vị trí |
| Đổi hướng điện thoại | Bố cục và camera cập nhật đúng |
| Tab ẩn rồi hiện | Không nhảy thời gian animation, audio chờ phát lại |
| Xem lại nhiều lần | Không nhân canvas, listener hoặc player |
| Hosting dưới thư mục con | JS, CSS, ảnh và audio tìm đúng URL |

## Kiểm tra nội dung cuối

- Không có cảnh kỷ niệm, timeline ảnh, vé hẹn, lời rủ đi đâu hoặc phần mở quà bất ngờ.
- Ảnh đúng người, đúng crop, không có ảnh mẫu ngẫu nhiên được dùng thay.
- Tên, cách xưng hô, ngày 20.10.2026 và chữ ký thống nhất.
- Lời chúc/thiệp không chứa placeholder hoặc nội dung demo ngoài ý muốn.
- Nếu chưa có dữ liệu thật: ghi rõ “bản demo chờ cá nhân hóa”; chưa đánh dấu hoàn thành nội dung.
- Preview chia sẻ mặc định dùng hoa, không tự đưa chân dung riêng vào metadata.

## Kiểm tra kỹ thuật

- Chạy build production thành công và kiểm tra chính build đó bằng preview HTTP.
- Console không có lỗi chưa xử lý trong luồng chính; kiểm tra network không còn asset 404.
- Kiểm tra ít nhất một trình duyệt desktop và một môi trường mobile có thể tiếp cận; ghi rõ thiết bị thật hay giả lập.
- Nếu có thể, kiểm tra trình duyệt trong ứng dụng nhắn tin dùng để gửi link; nếu chưa có, ghi là chưa kiểm chứng.
- Kiểm tra đường dẫn root và base path thư mục con nếu bàn giao hỗ trợ cả hai.
- Với test tự động, ưu tiên smoke test luồng mở thư, đọc tới cuối và replay. Không tạo snapshot dễ vỡ cho vị trí cánh hoa.

## Tài liệu bàn giao

Tạo/cập nhật:

- `README.md`: yêu cầu môi trường, cài dependency, dev/build/preview.
- `docs/content-guide.md`: thay tên, lời chúc, ảnh, crop, audio, màu và ảnh preview.
- `docs/verification.md`: ngày kiểm tra, môi trường, lệnh đã chạy, case pass/fail, giới hạn và nội dung còn thiếu.
- `dist/`: artifact build tĩnh, không sửa thủ công.

Xuất bản lên hosting là công việc tiếp theo khi có yêu cầu và đích triển khai rõ. Không cần backend để phục vụ build này.

## Definition of Done

- [x] Đạt tiêu chí của task0_1 đến task0_8.
- [x] Build và luồng đọc quà được kiểm tra thực tế.
- [x] Nội dung thật được chốt hoặc trạng thái demo được ghi trung thực.
- [x] Có hướng dẫn thay ảnh/lời chúc và chạy bản build.
- [x] Báo cáo kiểm thử phân biệt rõ đã kiểm tra, chưa kiểm tra và lỗi còn lại.
- [x] Cập nhật bảng trạng thái trong `task/README.md` theo kết quả thực tế.

## Kết quả — 14/10/2026

- Check 51 file JS/MJS, 77/77 test và build root/`/2010/` đạt. Chrome headless kiểm tra bản production mới: mở bình thường khoảng 1,9 giây, bấm mở 15 lần, skip, đọc hết ở 0/5, đếm hoa duy nhất, anchor/keyboard, sáu replay, mobile/landscape/DPR 3, reduced motion, tab ẩn và WebGL fallback đều đạt. Console/asset errors 0.
- AX tree có năm button hoa mang tên riêng; canvas trang trí không được đọc như control. Đây không thay thế phiên dùng screen reader thật.
- Artifact QA riêng có WAV im lặng/ảnh hoa kiểm tra phát/tạm dừng/ended/nghe lại, nhạc nhường cho giọng đọc, replay dùng lại hai player và URL ảnh/audio dưới `/2010/`. Không sửa config/public và không đưa fixture vào bản bàn giao.
- Đối chiếu tài liệu hosting chính thức; cập nhật/pin SHA các GitHub Action hiện hành. Chưa chạy workflow trên GitHub hoặc deploy thật.
- Có source ZIP, static root ZIP, static Pages `/2010/` ZIP, manifest/checksum, tài liệu cá nhân hóa và deploy. Gói nguồn không chứa dependency/cache/ảnh gốc/.env/QA; gói static từ build đã kiểm tra.
- **Nội dung chưa chốt:** vẫn `isDemo: true`, `[Tên em]`/`[Tên bạn]`, lời chúc/thư mẫu và audio null. Đã thêm năm ảnh WebP đã tối ưu vào phần mở đầu và bốn lời chúc; chưa cá nhân hóa tên hoặc thu âm.
- Điện thoại thật/Safari/trình duyệt nhắn tin, notch/safe-area, chất lượng crop/bản ghi thật và phiên dài chưa kiểm chứng. Chunk Three.js vẫn cảnh báo > 500 kB minified, được lazy-load; không có lỗi kỹ thuật chưa xử lý trong các luồng đã thử.

Xem [hướng dẫn bàn giao](../docs/release-guide.md), [báo cáo kiểm thử](../docs/verification.md) và [deploy](../docs/deployment.md). Bộ task0_1 đến task0_9 hoàn thành về kỹ thuật; bước sau là cá nhân hóa và triển khai theo đích thật.
