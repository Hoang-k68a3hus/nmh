# Bàn giao bản tĩnh 20/10

Bản bàn giao vẫn là **demo chờ cá nhân hóa**: tên người nhận `[Tên em]`, người gửi `[Tên bạn]`, lời chúc/thư mẫu và chưa có audio thật. Năm ảnh cô ấy đã được tối ưu thành WebP, dài tối đa 1200 px (khoảng 754 KB tổng cộng), rồi gắn vào phần mở đầu cùng bốn lời chúc; phần thư vẫn dùng bố cục chữ. Luồng và đồ họa đã hoàn thiện. Task kỹ thuật hoàn thành không đồng nghĩa nội dung riêng đã được người gửi chốt.

## Các file bàn giao

| Đầu ra | Dùng để làm gì |
| --- | --- |
| `dist/` | Bản production dùng base `/`, phục vụ bằng static hosting |
| `release/20-10-demo-source.zip` | Source, lockfile, test, cấu hình Vercel/Pages và tài liệu; giải nén rồi sửa nội dung/build |
| `release/20-10-demo-static-root.zip` | Nội dung `dist/`, `index.html` nằm ở gốc archive |
| `release/20-10-demo-static-pages-2010.zip` | Bản kiểm tra base `/2010/`; dùng đúng đường dẫn này hoặc build lại theo tên repository thật |
| `release/manifest.json` và `SHA256SUMS.txt` | Trạng thái demo, vai trò/base path, số file, kích thước và checksum các archive |

Source ZIP giữ `.github/`, `.env.example`, license font và package-lock. Không chứa `node_modules/`, cache, `.qa/`, `.originals/`, `.git/`, `.env` hoặc cấu hình local Vercel. Những archive static chỉ chứa bản web đã build, không sửa trực tiếp JS đã minify để đổi lời chúc.

Các ZIP được tạo từ source/build hiện tại và đối chiếu từng file sau giải nén bằng SHA-256. Bản ảnh/audio thử kỹ thuật không nằm trong các ZIP; chúng chỉ được dùng trong artifact QA riêng.

## Xem nhanh trên máy

Từ source dự án hoặc source ZIP đã giải nén, dùng Node tương thích `^20.19.0 || >=22.12.0` và npm:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở `http://localhost:5173`. Muốn kiểm tra đúng bản production:

```powershell
npm.cmd run check
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

Mở `http://localhost:4173`. Dừng bằng Ctrl+C. Trên macOS/Linux dùng `npm` thay `npm.cmd`. Không mở `index.html` qua `file://`; các module/font cần được phục vụ qua HTTP.

Source ZIP chưa chứa dependency; `npm ci` cài đúng lockfile. Static ZIP không cần Node ở hosting: giải nén để `index.html` và `assets/` cùng nằm trong document root. Vercel/GitHub Actions nên build từ source để tiếp tục chỉnh sửa thuận tiện.

## Cá nhân hóa trước khi gửi cô ấy

1. Sửa `recipient.name`, `recipient.nickname`, `sender.name`, `sender.signature` trong `src/config/content.js`; các token tên/ngày tự điền ở toàn trang.
2. Đọc và sửa năm lời chúc, thư và lời kết theo cách nói của bạn. Mẫu dùng xưng hô anh–em và ngày `20.10.2026`.
3. Nếu dùng ảnh, giữ ảnh gốc trong `.originals/photos/`, chạy `npm.cmd run prepare:photos`, copy object ảnh được in ra vào `hero.photo`, `wishes[].photo` hoặc `letter.photo`. Chỉnh alt/caption/focalPoint sau khi xem mobile. `photo: null` vẫn là bố cục hoàn chỉnh.
4. Nếu dùng nhạc/giọng đọc, đặt file thật trong `public/assets/audio/`, khai báo path `assets/audio/...`. Bản chữ vẫn có sẵn; audio chỉ phát sau thao tác bật.
5. Khi đã chốt tên và nội dung, đổi `isDemo: false`, chạy check/test/build. Validator từ chối marker mẫu còn sót, nhưng bạn vẫn cần đọc lại giọng văn của thư.
6. Build lại sau mọi thay đổi; archive cũ là snapshot và không tự cập nhật.

Xem [hướng dẫn nội dung](./content-guide.md), [thư/giọng đọc](./letter-and-finale.md) và [deploy từng bước](./deployment.md). Ảnh/nhạc là tùy chọn; không cần thêm đủ ảnh mới dùng được web.

## Kiểm tra trước khi gửi link

- Mở URL production bằng cửa sổ chưa đăng nhập và điện thoại sẽ dùng để nhận.
- Đọc đúng tên/ngày/chữ ký, đủ năm lời chúc và thư, nhãn demo đã tắt khi tặng thật.
- Mở bình thường, bỏ qua, cuộn thẳng tới thư/kết và xem lại; không cần mở đủ hoa trước.
- Ảnh đúng người, crop giữ khuôn mặt, không icon vỡ; thử ảnh ở cả dọc/ngang.
- Nếu có audio: bật riêng, nghe/tạm dừng/nghe lại; sang tab khác rồi trở lại vẫn chờ phát lại.
- Thử portrait/landscape, tăng cỡ chữ và reduced motion; nút dùng được bằng bàn phím.
- Thử link trong ứng dụng nhắn tin sẽ gửi. Safari iOS, notch/safe-area và thiết bị thật chưa được kiểm chứng trong môi trường phát triển hiện tại.

Không có cảnh kỷ niệm, lời mời đi chơi, quà bí mật, form phản hồi hoặc điều kiện mở khóa. Preview chia sẻ dùng metadata chữ/favicon hoa, không tự đưa chân dung vào `og:image`.

## Trạng thái kiểm thử và hosting

[Báo cáo kiểm thử](./verification.md) phân biệt kết quả Chrome desktop/mobile giả lập, artifact QA với file thử và phần chưa kiểm chứng. Accessibility tree/bàn phím đã được kiểm tra; chưa có phiên dùng screen reader thật.

Chưa có repository remote, workflow chạy trên GitHub hoặc URL hosting công khai. Bước tiếp theo sau bàn giao là cá nhân hóa và triển khai theo [hướng dẫn hosting](./deployment.md). Không cần backend, API key hoặc database để chạy bản web này.
