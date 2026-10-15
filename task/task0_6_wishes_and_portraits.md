# Task0_6 — Lời chúc kèm hình ảnh cô ấy

- Trạng thái: DONE — 14/10/2026; triển khai và QA với dữ liệu thử
- Phụ thuộc: task0_2, task0_3
- Ưu tiên: bắt buộc

## Mục tiêu

Đây là phần nội dung trung tâm: năm lời chúc có thể đi cùng ảnh của cô ấy, trình bày như các trang nhỏ trong khu vườn.

## Nội dung

Tiêu đề gợi ý: “Những điều anh mong dành cho em”.

Mỗi card gồm:

1. Một bông hoa SVG có nút tương tác.
2. Tiêu đề lời chúc.
3. Một đoạn lời chúc ngắn, luôn hiển thị.
4. Một ảnh tùy chọn cùng alt/caption phù hợp.

Đọc lời chúc không cần chạm hoa. Chạm hoa chỉ thêm hiệu ứng nở và cập nhật bộ đếm nhẹ.

## Bố cục

- Mobile: một cột, ảnh phía trên hoặc ngay trước lời chúc; không tạo carousel phải vuốt mới thấy hết nội dung.
- Desktop: ảnh và chữ ở hai cột, có thể đảo phía giữa các card; DOM vẫn giữ thứ tự đọc hợp lý.
- Tối đa một ảnh/card; tỷ lệ khởi điểm 4:5 hoặc 3:4, cho phép điều chỉnh crop bằng `focalPoint`.
- Card không ảnh dùng khoảng trắng và hoa trang trí vừa phải, không để khung rỗng.
- Không ép tất cả card có cùng chiều cao nếu gây cắt chữ.
- Không thêm mốc thời gian, ngày hẹn, địa điểm hay câu chuyện quá khứ chỉ để giải thích ảnh.

## Công việc

- Render từ mảng `wishes`; không hardcode từng card trong timeline.
- Gắn ID ổn định, nút tên rõ như “Cho bông hoa niềm vui nở”.
- Hoa mở bằng thân cây vẽ nét và cánh xoay/mở; chạy một lần rồi giữ trạng thái.
- Cập nhật `openedWishIds`, bộ đếm “Đã nở 3/5 bông hoa” lấy tổng từ dữ liệu.
- Hoàn thành các hoa chỉ hiện lời nhắn phụ ngắn; không mở khóa thư hoặc quà.
- Ảnh có aspect ratio cố định trước khi tải, lazy-load và fallback khi lỗi.
- Bấm nhanh nhiều lần không cộng trùng bộ đếm.
- Reveal theo viewport vẫn có đường hiển thị nội dung nếu observer/animation không hoạt động.
- Khi xem lại từ đầu, reset hoa và bộ đếm.

## Tiêu chí hoàn thành

- [x] Năm lời chúc hiển thị đầy đủ, mỗi lời có thể dùng ảnh riêng.
- [x] Không có ảnh vẫn là bố cục hoàn chỉnh.
- [x] Chữ tách khỏi ảnh; khung giữ tỷ lệ và crop điều chỉnh bằng focalPoint, đã kiểm tra ảnh dọc/ngang thử.
- [x] Nút hoa dùng được bằng bàn phím và có trạng thái truy cập rõ ràng.
- [x] Bộ đếm không tăng trùng và không chặn cuộn tiếp.
- [x] Ảnh lỗi không gây icon ảnh vỡ hoặc mất nội dung.
- [x] Không có giao diện album/timeline kỷ niệm.

Điều kiện kiểm tra crop khuôn mặt với ảnh thật được giữ ở bước cá nhân hóa/nghiệm thu task0_9. Hiện chưa có ảnh cô ấy; task này nghiệm thu khả năng bố trí/crop và fallback bằng ảnh hình học, không xác nhận crop chân dung thực tế.

## Kiểm tra phù hợp

Thử 0 ảnh, 3 ảnh/5 card và ảnh đủ; ảnh dọc/ngang, lời chúc dài, đường dẫn ảnh sai, bấm lặp, bàn phím và reduced motion. Có thể kiểm tra tự động logic đếm duy nhất nếu đã tách thành hàm/state rõ ràng.

## Kết quả triển khai

- `mountWishes` render card từ dữ liệu, ID/heading/nút ổn định. Ảnh và nút hoa cùng tồn tại; không ảnh có vùng hoa đầy đủ, ảnh lỗi chuyển cùng nút sang bố cục minh họa, giữ trạng thái/focus.
- Hoa có `closed/blooming/open`, vẽ thân/mở lá/cánh trong khoảng 1 giây, mở một lần. Component quản lý SVG riêng; motion viewport không tự nở hoa trước thao tác.
- `wishes-state.js` giữ Set ID đã nở, total theo dữ liệu, snapshot độc lập, subscribe/reset/dispose. Bộ đếm/status polite, câu phụ khi đủ hoa, link đọc thư luôn hoạt động.
- Nút native dùng Enter/Space/chạm; aria-disabled sau mở giữ focus và chặn thao tác lặp qua store. Reduced motion mở ngay; đổi preference giữa hiệu ứng hoàn tất; CSS animation không chạy có deadline 1,15 giây.
- Replay reset hoa/Set/bộ đếm và hủy deadline cũ. Mount lại cùng host tự dispose instance cũ, gỡ listener/media/subscriber/timer; lỗi ảnh cũ không sửa card mới.
- Check 46 file và 61/61 test đạt; thêm 5 test cho ID duy nhất, ID không tồn tại, hoàn thành/reset, snapshot và unsubscribe/dispose.
- Chrome dev xác minh 0 ảnh, 3/5 ảnh, đủ ảnh, ảnh dọc/ngang, focalPoint/lazy-load, caption, tiêu đề/lời chúc dài, ảnh thiếu/hỏng decode, giữ focus/state khi fallback và remount. Ba fixture đã dọn khỏi public trước build.
- Build root và `/2010/` đạt. Chrome production hai đường dẫn kiểm tra mở lặp, Enter/Space/Tab/chạm, tên accessibility, replay/reset giữa hiệu ứng, reduced motion, observer/animation/reveal module lỗi và viewport 360/390/768/1440 px. Console/asset errors ngoài dự kiến: 0.

Mobile là giả lập Chrome; screen reader và thiết bị thật tiếp tục ở task0_8/task0_9. Nội dung mẫu và ảnh thật vẫn chờ cá nhân hóa.

Xem [lời chúc và ảnh](../docs/wishes-and-photos.md) và [báo cáo kiểm tra](../docs/verification.md).
