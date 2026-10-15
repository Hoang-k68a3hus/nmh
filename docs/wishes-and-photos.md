# Lời chúc, ảnh và hoa tương tác

Task0_6 hoàn thiện phần trung tâm với năm lời chúc mặc định. Mỗi card có tiêu đề, lời nhắn, một nút hoa và tối đa một ảnh tùy chọn. Tiêu đề/lời nhắn luôn hiện; người nhận chủ động chạm hoa hoặc cuộn tới thư ngay.

## Nội dung và bố cục

Sửa mảng `wishes` trong `src/config/content.js`:

```js
{
  id: 'joy',
  title: 'Thật nhiều niềm vui',
  message: 'Một lời chúc riêng dành cho em.',
  photo: null,
}
```

ID duy nhất và ổn định điều khiển trạng thái; đổi vị trí card không đổi ID. Số lượng/bộ đếm lấy từ dữ liệu, không cố định bằng số 5 trong component. Nội dung dùng textContent; dấu xuống dòng trong lời nhắn được giữ, tiêu đề dài tự xuống dòng.

- Không ảnh: hoa và chữ ở hai vùng trên desktop; mobile đọc chữ rồi tới nút hoa, không có khung ảnh rỗng.
- Có ảnh: ảnh và chữ ở hai cột desktop, đảo phía ở card chẵn. Trên mobile, ảnh ở trên chữ; nút hoa gọn nằm dưới lời chúc, tách khỏi vùng ảnh.
- DOM giữ thứ tự đọc: card không ảnh đọc lời chúc trước thao tác; card có ảnh đọc ảnh/alt rồi lời chúc và thao tác. Vị trí trang trí trái/phải dùng CSS grid.
- Không đặt chữ lên ảnh, không cố định chiều cao card hoặc tạo carousel. Ảnh giữ tỷ lệ 4:5 trước khi tải, lazy-load và có caption nếu khai báo.

Thêm ảnh theo [hướng dẫn nội dung](./content-guide.md). Ví dụ:

```js
photo: {
  src: 'assets/photos/portrait-01.webp',
  alt: 'Mô tả ngắn ảnh thực tế của cô ấy',
  width: 960,
  height: 1200,
  focalPoint: '50% 35%',
  caption: '',
}
```

Width/height là kích thước file web; focalPoint chỉnh vùng crop trong khung. Khi có ảnh thật, cần xem bản mobile và chỉnh focalPoint để giữ khuôn mặt. Ảnh ngang vẫn dùng được; lời chúc không yêu cầu đủ ảnh cho mọi card.

Nếu ảnh thiếu hoặc decode lỗi, card chuyển sang bố cục không ảnh. Component chuyển chính nút hoa đang có sang vùng minh họa, giữ ID đã nở/bộ đếm; nếu nút đang focus thì khôi phục focus với preventScroll. Không để icon ảnh vỡ hoặc tạo nút hoa thứ hai. Callback ảnh của component đã dispose không sửa card mới.

## Chạm hoa

Nút chứa SVG rose/daisy/tulip theo theme, có nhãn rõ gắn với tiêu đề lời chúc. SVG trang trí là aria-hidden; thao tác dùng button HTML nên Enter, Space và cảm ứng hoạt động như nút thông thường.

Ban đầu hoa là nụ tĩnh. Nhấn một lần vẽ thêm thân, mở lá và xoay/mở cánh trong khoảng 1 giây. Trạng thái SVG là `closed → blooming → open`. Nút đổi thành “Hoa đã nở”, aria-disabled true, giữ focus và vẫn có trong thứ tự Tab. Store bỏ thao tác lặp; aria-disabled được xử lý bằng JavaScript. Tham khảo [MDN aria-disabled](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-disabled).

Bộ đếm “Đã nở 3/5 bông hoa” nằm trong vùng status/aria-live polite. Khi đủ hoa, thêm một lời nhắn phụ ngắn. Link “Đọc lá thư của anh” luôn hoạt động, kể cả khi chưa chạm hoa nào.

Reduced motion mở hoa ngay. Đổi preference giữa hiệu ứng đưa hoa đã chọn về trạng thái cuối. Nếu CSS animation không chạy, deadline 1,15 giây hoàn tất SVG; việc đếm và đọc lời chúc độc lập với hiệu ứng. SVG tương tác có `data-motion-owner="wish"`, được loại khỏi observer motion trang trí để giữ đúng nụ trước thao tác.

Các nhãn nằm trong `wishSection`: `interactionHint`, `bloomLabel`, `bloomedLabel`, `counterLabel`, `flowerUnit`, `completeMessage`, `nextLabel`. Có thể cá nhân hóa các chuỗi như nội dung khác; check/build yêu cầu chúng đầy đủ.

## Trạng thái và xem lại

`src/services/wishes-state.js` giữ Set `openedWishIds`, chỉ nhận ID trong dữ liệu. Snapshot trả Set riêng, tránh code khác vô tình sửa bộ đếm. Có subscribe/unsubscribe và dispose.

`mountWishes()` trả API:

```js
wishExperience.getState(); // openedWishIds, count, total, complete
wishExperience.reset(); // Hủy deadline, hoa về nụ, bộ đếm về 0.
wishExperience.dispose(); // Gỡ listener/preference/subscriber/timer và card cũ.
```

`main.js` giữ instance, gọi reset khi “Xem lại từ đầu” và dispose khi HMR. Mount lại cùng list tự dispose instance trước, kể cả khi URL module dev thay đổi. Nội dung không được lưu vào localStorage.

Xem [báo cáo kiểm tra](./verification.md) cho các trường hợp 0/3/5 ảnh, ảnh lỗi, chữ dài, bàn phím, reduced motion và build root/Pages. Bản demo vẫn chưa có ảnh cô ấy; ảnh QA là hình hoa hình học, đã dọn trước build cuối.
