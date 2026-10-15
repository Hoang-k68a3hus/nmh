# Task0_3 — Hệ thống thiết kế và SVG động

- Trạng thái: DONE
- Phụ thuộc: task0_1
- Ưu tiên: bắt buộc

## Mục tiêu

Thống nhất hình ảnh khu vườn bằng giấy dưới ánh nắng chiều, đủ tinh tế để ảnh và lời chúc là điểm chú ý.

## Design tokens

| Token | Giá trị khởi đầu |
| --- | --- |
| Nền | `#FFF8F1` |
| Hồng phấn | `#E8A6B5` |
| Màu nhấn | `#883F56` |
| Xanh lá | `#91A68A` |
| Chữ | `#382B30` |
| Nhịp spacing | 4, 8, 12, 16, 24, 32, 48, 64 px |
| Độ rộng thư | Khoảng 60–68 ký tự mỗi dòng trên desktop |
| Thời gian UI | Khoảng 160–320 ms |
| Thời gian reveal | Khoảng 450–700 ms |

Đây là điểm xuất phát; đo contrast và kiểm tra bố cục trước khi chốt. Hồng phấn dùng trang trí, không mặc định dùng cho chữ nhỏ trên nền sáng.

## Công việc

- Chọn font tiêu đề serif và font nội dung sans-serif có dấu tiếng Việt đầy đủ; font viết tay chỉ dùng ngắn.
- Xác định cỡ chữ bằng `clamp`, body tối thiểu khoảng 16 px trên điện thoại, line-height dễ đọc.
- Tạo button, focus ring, image frame, wish card, paper letter và control nhạc.
- Thiết kế vùng chạm tối thiểu khoảng 44 × 44 CSS px cho các nút.
- Tạo SVG phong thư, con dấu hoa, 2–3 kiểu hoa, lá, sợi chỉ và bó hoa fallback.
- Nhóm SVG theo bộ phận, tránh ID/clipPath trùng khi một hoa xuất hiện nhiều lần.
- Tạo animation thân cây vẽ nét, cánh hoa mở, nơ thắt bằng GSAP hoặc CSS; tách chuyển động trang trí khỏi nội dung.
- Sợi chỉ chỉ kết nối các cảnh về thị giác, không được phủ lên chữ hay trở thành timeline kỷ niệm.
- Đặt `aria-hidden` cho SVG trang trí; SVG thuộc nút có tên truy cập từ nút HTML.
- Tạo stylesheet cho reduced motion và các breakpoint theo bố cục thực tế.

## Tiêu chí hoàn thành

- [x] Màu, spacing và typography đi qua token chung.
- [x] Tiếng Việt không bị mất dấu hoặc cắt dấu ở tiêu đề.
- [x] Có phong thư, hoa lời chúc và bó hoa fallback hoàn chỉnh.
- [x] Bố cục có ảnh/không ảnh cùng phong cách.
- [x] Focus nhìn thấy rõ; nút và chữ đủ tương phản sau kiểm tra.
- [x] Chế độ giảm chuyển động vẫn thể hiện trạng thái hoàn chỉnh.
- [x] SVG lặp lại không xung đột ID.

## Kiểm tra phù hợp

Xem trực quan ở mobile và desktop, bật reduced motion, dùng bàn phím và kiểm tra dấu tiếng Việt. Không viết unit test cho giá trị CSS tĩnh.

## Kết quả thực hiện — 14/10/2026

- Cormorant Garamond 500/italic và Be Vietnam Pro 400/600 được bundle local, có subset tiếng Việt và giữ license.
- Token chung cho màu, chữ, spacing, gutter, radius, shadow và timing; theme áp dụng cho cả UI/SVG, chọn màu chữ đọc được trên các nền.
- Bộ SVG gồm phong thư, con dấu hoa, ba kiểu hoa, vườn, bó hoa/nơ và sợi chỉ; các group có data-part cho task sau.
- SVG chạy CSS animation hữu hạn khi vào viewport; fallback mới được observer đăng ký; reduced motion hiện hình hoàn chỉnh ngay.
- Khung ảnh, card, thư, nút và nhạc đồng bộ; không phủ chữ lên ảnh.
- 24 test pass, check 31 file pass; build root và `/2010/` cùng browser production pass.
- Browser kiểm tra 360/390/768/1440 px, cỡ body 16 px, vùng chạm ít nhất 44 px, focus Tab/Enter, ID SVG không trùng.
- Các cặp chữ được đo trên browser có tương phản từ 5.10:1 trở lên; có test màu nhấn sáng/nền tối.
- Đã xem screenshot mobile/desktop, thư, vườn, bó hoa và card có ảnh thử. Ảnh thử đã dọn khỏi public trước build cuối.

Đây là hệ thống thiết kế và motion trang trí. Chuỗi mở thư tương tác thuộc task0_4; hoa Three.js thuộc task0_5; nút chạm hoa thuộc task0_6.

Xem [design system](../docs/design-system.md) và [verification](../docs/verification.md).
