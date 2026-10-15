# Báo cáo kiểm tra

Ngày: 14/10/2026, múi giờ Asia/Saigon.

## Phạm vi

Đã kiểm tra task0_1 đến task0_9 và bàn giao bản demo kỹ thuật: setup, nội dung/ảnh, thiết kế/SVG, phong thư/âm thanh, Three.js, hoa lời chúc, thư/bó hoa, tích hợp/hiệu năng và QA production. Nội dung cá nhân hóa, thiết bị thật và triển khai hosting còn chờ; không đánh dấu đã kiểm chứng các phần này.

## Môi trường

- Windows, PowerShell.
- Node 22.17.0, npm 10.9.2 (gọi qua `npm.cmd`).
- Dependency cố định: Vite 8.3.4, Three.js 0.186.1, GSAP 3.15.0.

## Kết quả setup task0_1

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd install` | PASS; 17 packages added, audit 0 vulnerabilities tại thời điểm cài |
| `npm.cmd run check` | PASS; 19 file JS/MJS và cấu hình nội dung |
| `npm.cmd test` | PASS; 5 test đường dẫn root/subdirectory và đầu vào sai |
| `npm.cmd run build` | PASS; production root `/` |
| `npm.cmd run build -- --base=/2010/` | PASS; production dưới thư mục con |
| `npm.cmd run dev` | PASS; HTTP 200 tại cổng 5173 |
| `npm.cmd run preview` | PASS; HTTP 200 tại cổng 4173 |
| Preview với `--base=/2010/ --port 4174` | PASS; HTML, favicon và chunk JS/CSS tải đúng |
| Browser root và subdirectory | PASS; Chrome headless, không có console exception hoặc response 4xx |

## Kiểm tra browser và hình ảnh

- Desktop viewport 1440 × 1000, mobile giả lập 390 × 844 và 360 × 800.
- Có đủ `intro`, `garden`, `wishes`, `letter`, `finale` và 5 card lời chúc.
- Không tràn ngang; SVG phong thư/vườn/bó hoa hiển thị.
- Không có file nhạc: nút nhạc được ẩn.
- Demo label hiện đúng; không giả định nội dung đã cá nhân hóa.
- Nút mở thư cuộn tới garden, focus tới `garden-title`.
- Reduced motion cập nhật trạng thái; replay về anchor intro.
- Đã xem screenshot desktop/mobile, vùng lời chúc và bức thư ở mobile; chữ tiếng Việt hiển thị và đọc được.
- Screenshot/QA script nằm trong `.qa/`, đã ignore Git; không phải tài nguyên production.

Kích thước build root ở bước setup: HTML khoảng 4.77 kB, CSS 6.22 kB, JS entry 16.27 kB, chunk GSAP lazy-load 113.13 kB (gzip lần lượt khoảng 1.70, 2.07, 6.13, 44.50 kB). Three.js đã cài nhưng chưa nối vào giao diện nên chưa có trong payload này. Dữ liệu kích thước là output Vite lúc kiểm tra setup.

## Kết quả task0_2 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 28 file JS/MJS, schema và asset references |
| `npm.cmd test` | PASS; 22/22 test |
| `npm.cmd run prepare:photos -- --help` | PASS; CLI và hướng dẫn tham số |
| `npm.cmd run build` | PASS; root hosting trong `dist/` |
| `npm.cmd run build -- --base=/2010/ --outDir .qa/dist-pages` | PASS; build thư mục con tách khỏi artifact root |
| HTML metadata | PASS; title lấy từ cấu hình, không còn marker `__CONTENT_*` |
| Chrome dev root | PASS; các trường hợp ảnh/nội dung ở dưới |
| Chrome production `/2010/` | PASS; desktop và mobile giả lập, console/asset errors 0 |

Test tự động bao phủ: token tên/biệt danh/chữ ký, fallback khi nickname trống, cấu hình sai, ID trùng, token sai, marker demo trong production, schema ảnh/crop/audio, HTML escaping metadata, asset thiếu/rỗng/sai hoa–thường và xử lý ảnh.

Công cụ ảnh được kiểm tra bằng fixture hình màu, không phải chân dung: EXIF orientation được áp dụng; 1600×800 orientation 6 chuyển thành WebP 600×1200; bản gốc giữ nguyên; metadata bản web được bỏ; ảnh nhỏ không phóng to; file đích có sẵn không bị ghi đè; có kiểm tra xuất AVIF.

Browser dùng Chrome headless desktop 1440 px, mobile giả lập 390 và 360 px:

- Không ảnh: đủ lời chúc và thư, dùng SVG.
- Ảnh xen kẽ: ảnh hero/thư và hai card hợp lệ; một card ảnh thiếu về hoa, giữ tiêu đề/lời chúc.
- Đủ ảnh: cả năm card có ảnh; không tràn ngang.
- Ảnh hỏng decode: ảnh hero/thư gỡ; card trở về SVG, không có icon ảnh vỡ.
- Cá nhân hóa bằng dữ liệu QA: đổi tên một lần hiện đúng trong lời chúc, người nhận và chữ ký; bản demo gốc được phục hồi sau kiểm tra.
- Chữ chứa markup HTML được hiển thị nguyên văn, không tạo DOM hoặc chạy handler.
- Hero `loading=eager`, `fetchPriority=high`; ảnh card/thư `loading=lazy`, focalPoint được áp dụng.
- Audio manager chưa gán src và không gửi request trước thao tác phát.
- Đã xem screenshot mobile khi có ảnh thử và mặc định không ảnh.

Hai fixture ảnh browser đã được xóa khỏi `public/` trước build cuối; `dist/assets/photos/` chỉ còn `.gitkeep`. Không đưa ảnh giả/người lạ vào nội dung thật. Các script/screenshot thử nằm trong `.qa/`, đã ignore Git.

Kích thước build root hiện tại: HTML 5.35 kB (gzip 1.82), CSS 6.38 kB (gzip 2.11), entry JS 21.32 kB (gzip 7.84), chunk GSAP 113.13 kB (gzip 44.50). Sharp 0.35.5 là dev dependency để xử lý ảnh local, không nằm trong browser bundle.

## Kết quả task0_3 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 31 file JS/MJS và cấu hình/asset |
| `npm.cmd test` | PASS; 24/24, gồm chọn màu chữ theo theme |
| Build root / `/2010/` | PASS; font, CSS và JS có trong artifact |
| Chrome production root và `/2010/` | PASS; không console/asset errors |
| Viewport 360/390/768/1440 px | PASS; không tràn ngang, body 16 px |
| Nút/link chính và control nhạc | PASS; vùng bấm ít nhất 44×44 px |
| Tab, Shift+Tab, Enter | PASS; focus-visible 3 px, Enter mở tới garden |
| Font tiếng Việt/italic | PASS; font ready, kiểm tra glyph và screenshot |
| Font network | PASS; 12 request WOFF2 local trong phiên QA, 0 request Google Fonts |
| SVG instances | PASS; rose/daisy/tulip, ID trùng 0, trang trí aria-hidden/focusable false |
| Motion viewport | PASS; SVG mới có animation, bó hoa kết thúc không còn animation chạy |
| Reduced motion giữa animation | PASS; animation chạy 0, stroke offset 0, cánh hoa opacity 1 |
| Đổi theme | PASS; đổi rose/accent cập nhật cánh hoa/nơ SVG |
| Có ảnh/không ảnh/ảnh lỗi | PASS; kiểu khung giấy thống nhất, fallback và chữ giữ nguyên |

Tương phản thực tế: chữ phụ nền chính 5.36:1; accent dạng chữ 6.90:1; nhãn nút 7.14:1; chữ phụ garden 5.10:1; lời chúc trên giấy 5.55:1; nội dung thư 13.27:1. Đã xem screenshot desktop/mobile, lời chúc, thư, vườn, bó hoa và card có ảnh thử.

CSS animation hữu hạn: vẽ cành, mở cánh/lá và vẽ nơ. Observer bắt cả SVG fallback mới. CSS pause khi tab ẩn đã được triển khai; kiểm tra tab ẩn trên thiết bị thật tiếp tục ở task0_8.

Hai package font 5.3.0 được giữ trong lockfile, license copy vào public. Payload root hiện tại: HTML 5.54 kB (gzip 1.85), CSS 18.95 kB (gzip 4.36), entry JS 26.16 kB (gzip 9.87), GSAP chunk 113.13 kB (gzip 44.50), cùng các file font. Browser dùng unicode-range để tải subset cần cho trang. Ảnh QA đã dọn trước build cuối.

Tài liệu [design system](./design-system.md) ghi token, font, shape, motion và số đo. Script/screenshot QA vẫn nằm trong `.qa/`, được ignore Git.

## Kết quả task0_4 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 36 file JS/MJS, cấu hình và asset |
| `npm.cmd test` | PASS; 44/44 test |
| Build root và `/2010/` | PASS; artifact root trong `dist/`, Pages trong `.qa/dist-pages/` |
| Chrome production root và Pages | PASS; console/asset errors 0, không tràn ngang |
| Mở thư nhiều lần, skip, replay | PASS; một lượt mở, reset đúng SVG/focus, không callback cũ |
| Space và chạm giả lập | PASS; chuyển `reading`, focus `garden-title` |
| Bốn anchor giữa trang | PASS; `reading`, focus đúng tiêu đề, không intro chặn |
| Reduced motion từ đầu/giữa lượt mở | PASS; không mắc kẹt trong animation |
| Cuộn thẳng tới thư giữa animation | PASS; không kéo lại garden khi callback kết thúc |
| Chặn request chunk timeline | PASS; trạng thái SVG cuối và nội dung vẫn truy cập được |
| Nút bỏ qua mobile | PASS; chiều cao 44 px, trong viewport, không tràn ngang |
| Không audio trong demo | PASS; không player/nút nhạc, mở thư không phát âm thanh |
| WAV phát thực tế và giọng đọc kết thúc | PASS; nhạc tạm dừng, chỉ khôi phục lựa chọn bật trước đó |
| Ẩn/hiện tab Chrome thật | PASS; audio tạm dừng, không tự phát khi quay lại |
| `play()` bị chặn và thử lại | PASS; nhãn/aria-pressed phản ánh lỗi, retry phát được |
| File WAV hỏng | PASS; thông báo ngắn, tiếp tục đọc, không tràn ngang |

Thêm 7 test controller cho mở lặp, reduced motion, skip khi import chưa xong, reset, lỗi/deadline, điều hướng trước callback và dispose. Thêm 13 test audio cho source/autoplay, tái sử dụng player/base path, retry, Promise/event cũ, phối hợp nhạc/giọng đọc, lựa chọn tắt, tab ẩn và dispose.

Timeline dài 1,72 giây; đo từ thao tác đến `reading` trên Chrome production khoảng 1,80–1,85 giây gồm tải chunk. Deadline fallback 2,6 giây. SVG entry dừng trước GSAP; skip và reset revert context trước khi đặt hình cuối/gốc. Không khóa cuộn hoặc trì hoãn HTML vì âm thanh/đồ họa.

Audio QA dùng WAV im lặng nội bộ 1 giây và 0,35 giây; đây là kiểm tra playback, không đánh giá chất lượng nhạc. `NotAllowedError` được giả lập bằng Promise từ chối; file hỏng được Chrome giải mã thực tế. Tab ẩn được thử bằng mở tab Chrome khác rồi trở lại. Sự kiện pause trước ended của media native đã được xử lý; không làm giọng đọc mắc ở paused.

Đã xem ảnh mobile lúc mở thư, sau mở và trạng thái lỗi nhạc. Ba fixture audio được xóa khỏi `public/assets/audio/` trước build cuối; thư mục audio trong artifact chỉ còn `.gitkeep`. Không đổi cấu hình demo sang nguồn QA. Script, kết quả JSON và screenshot nằm trong `.qa/`, được ignore Git.

Payload root: HTML 5,86 kB (gzip 1,94), CSS 20,15 kB (gzip 4,64), entry JS 34,77 kB (gzip 12,81), chunk timeline 0,74 kB (gzip 0,44), GSAP 69,58 kB (gzip 27,29), scroll-scenes 43,07 kB (gzip 17,69), cùng font local. Three.js chưa có trong bundle. Xem [mở thư và âm thanh](./interaction-and-audio.md).

## Kết quả task0_5 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 44 file JS/MJS và cấu hình/asset |
| `npm.cmd test` | PASS; 56/56 test |
| Build root và `/2010/` | PASS; artifact root trong `dist/`, Pages trong `.qa/dist-pages/` |
| Chrome production root và Pages | PASS; console/asset errors 0 |
| Lazy-load ở intro | PASS; không tạo canvas; performance resource entries chưa có chunk garden |
| 7 hoa và HTML | PASS; geometry có render, lời chúc/nút cuộn đọc được |
| Một canvas qua garden/finale/garden | PASS; cùng DOM canvas, đổi layout/kích thước |
| Resize 360/390/768/844/1440 px | PASS; không tràn ngang, drawing buffer đúng tỷ lệ |
| Mobile xoay ngang, DPR máy giả lập 3 | PASS; pointer coarse giữ DPR ≤ 1,5; desktop ≤ 2 |
| Cuộn tới thư/ẩn tab Chrome thật | PASS; frame count không tăng khi paused, hiện lại tiếp tục |
| Reduced motion | PASS; frame tĩnh, hạt 0, parallax false, không tăng frame count |
| Đổi preference sau cuộn qua trigger once | PASS; vị trí cuộn giữ nguyên, garden vẫn hiện |
| Module chậm, tới finale trước khi tải xong | PASS; SVG hiện trong lúc chờ, frame đầu đúng bouquet |
| Chặn chunk module | PASS; SVG fallback, vẫn đọc thư |
| WebGL2 không có / context loss | PASS; canvas gỡ, SVG hiện lại |
| Remount/HMR module URL | PASS trên dev; một owner, không nhân đôi canvas, dispose idempotent |
| Preset low và layout hero có ảnh | PASS trên dev; hạt 0, vùng hoa thu gọn, không tràn ngang |
| Hồi quy task0_4 trên production | PASS; mở thư, skip, replay, Space/touch, anchor, reduced motion và fallback timeline |

Thêm 12 test cho lazy-load/view mới nhất, dispose/import muộn, module/render lỗi, tab/scroll trong lúc tải, replay, render frame tĩnh, giới hạn FPS/delta, preset mobile/low, chia sẻ geometry/material và trạng thái nở ba loại hoa.

Đã xem screenshot desktop/mobile, bố cục bouquet cơ bản và vùng hero có ảnh thử bằng favicon hoa. Ảnh thử chỉ được gán trong DOM/runtime QA, không có chân dung giả, không sửa cấu hình demo và không thêm fixture vào public. Script/JSON/screenshot nằm trong `.qa/`, được ignore Git.

Đo bằng Chrome headless trên Windows, GPU Intel UHD qua ANGLE/D3D11, mỗi mẫu khoảng 1,5 giây: production root 40,5 FPS desktop / 27,8 FPS mobile giả lập; Pages 41,4 / 27,9 FPS. Cảnh mặc định 107 draw calls, 14.600 tam giác; dùng 3 geometry hoa chung, 1 geometry bóng và 1 geometry hạt. Đây là đo sơ bộ trên GPU máy tính, chưa đại diện điện thoại thật hoặc phiên xem dài.

Đã xử lý hai trường hợp vòng đời: ScrollTrigger refresh sau matchMedia không làm mất vị trí đọc; ownership canvas vẫn duy nhất khi Vite thay URL module HMR. Render không chạy khi ngoài vùng/tab ẩn, thời gian không nhảy khi hiện lại, reduced motion chỉ render lại khi cần resize/layout.

Payload root: HTML 5,86 kB (gzip 1,94), CSS 20,88 kB (gzip 4,81), entry JS 39,14 kB (gzip 14,33), scroll-scenes 43,34 kB (gzip 17,77), cùng các chunk timeline/GSAP/font trước đó. Chunk garden chứa Three.js 567,58 kB minified (gzip 144,00), lazy-load khi vùng đồ họa hiện. Vite có cảnh báo chunk > 500 kB; build thành công, chưa chia nhỏ engine chỉ để đổi kích thước file. Tối ưu payload tiếp tục ở task0_8.

Xem [khu vườn Three.js](./garden-graphics.md) cho API và tài nguyên.

## Kết quả task0_6 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 46 file JS/MJS và cấu hình/asset |
| `npm.cmd test` | PASS; 61/61 test |
| Build root và `/2010/` | PASS; fixture đã dọn trước build |
| Chrome production root và Pages | PASS; console/asset errors ngoài dự kiến 0 |
| Chưa chạm hoa | PASS; đủ 5 tiêu đề/lời chúc, link đọc thư dùng được ở 0/5 |
| Bấm một hoa 20 lần | PASS; count vẫn 1/5, một trạng thái mở |
| Enter/Space/Tab và chạm giả lập | PASS; mở đúng hoa, giữ focus, outline ≥ 3 px |
| Accessibility tree | PASS; 5 button có tên riêng gắn tiêu đề; SVG trang trí |
| Trạng thái sau mở | PASS; aria-disabled true, nhãn Hoa đã nở, focus không mất |
| Reduced motion từ đầu/giữa hiệu ứng | PASS; hoa chọn mở ngay, không animation chạy |
| Hoàn thành 5/5 | PASS; hiện câu phụ, nội dung/link đã truy cập được từ đầu |
| Replay và reset khi deadline đang chờ | PASS; 0/5, hoa về nụ, callback cũ không mở lại |
| Observer không có / CSS animation không chạy | PASS; chữ/nút hoạt động, deadline hoàn tất SVG |
| Chặn chunk reveal | PASS; lời chúc đầy đủ, vẫn mở hoa |
| Viewport 360/390/768/1440 px | PASS; không tràn ngang; nút hoa ≥ 44×44 px |
| Dev 3 ảnh/5 card và đủ 5 ảnh | PASS; ảnh + hoa cùng tồn tại, photo/word order đúng ở mobile |
| Ảnh dọc/ngang, focalPoint, caption/lazy | PASS; ratio 4:5, object-position 50% 35%, img loading lazy |
| Tiêu đề/lời chúc dài | PASS; xuống dòng, không cắt chữ hoặc tràn ngang |
| Ảnh thiếu / decode lỗi | PASS; bỏ ảnh vỡ, giữ 5 lời chúc, nút/focus/ID đã nở |
| Remount/dispose giữa hiệu ứng | PASS trên dev; không nhân đôi nút/đếm hoặc nhận deadline cũ |

Thêm 5 test store cho đếm duy nhất theo ID, tổng theo dữ liệu, ID không tồn tại, hoàn thành/reset, snapshot Set không thể sửa state và unsubscribe/dispose. SVG tương tác tách khỏi motion viewport bằng motion owner; observer trang trí kiểm tra constructor là function để đi đường fallback khi không có observer.

Đã xem screenshot không ảnh desktop/mobile, 3 ảnh xen kẽ, đủ ảnh với chữ dài, trạng thái hoàn thành và ảnh lỗi. Fixture là hai hình hoa hình học WebP 720×900 và 1000×600, cùng một file cố ý hỏng; không phải chân dung. Kiểm tra URL thiếu tạo đúng một HTTP 404 cho `qa-task06-missing.webp`, được ghi riêng trong kết quả QA; không bỏ qua lỗi asset khác.

Ba fixture đã xóa khỏi public trước build cuối. Cấu hình demo giữ photo/audio null; `public/assets/photos/`, `dist/assets/photos/` và artifact Pages chỉ còn `.gitkeep`. Không nghiệm thu crop khuôn mặt khi chưa có ảnh cô ấy; sẽ kiểm tra lại ảnh thật lúc cá nhân hóa/bàn giao.

Payload root: HTML 6,37 kB (gzip 2,04), CSS 23,72 kB (gzip 5,26), entry JS 42,68 kB (gzip 15,38). Không thêm dependency, không tăng chunk Three.js/GSAP. Cảnh báo kích thước chunk garden > 500 kB vẫn như task0_5; build thành công. Script/JSON/screenshot ở `.qa/`, được ignore Git.

Xem [lời chúc và ảnh](./wishes-and-photos.md) cho nhãn nội dung, API và xử lý ảnh.

## Kết quả task0_7 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 49 file JS/MJS, cấu hình/asset |
| `npm.cmd test` | PASS; 70/70 test |
| Build root và `/2010/` | PASS; `dist/` và `.qa/dist-pages/`, đã dọn fixture trước build |
| Chrome dev/production root/Pages | PASS; console/asset errors 0 |
| Thư 360/390/768/1440 px | PASS; chữ ≥ 16 px, line-height ≥ 28 px, không tràn ngang |
| Nội dung/chữ ký | PASS; năm đoạn khoảng 190 từ, chữ luôn đọc được, chữ ký thư/finale thống nhất |
| Không có bản ghi | PASS; không có nút nghe hoặc player giọng đọc |
| Có ảnh, ảnh lỗi, thư ngắn/dài | PASS trên dev; ảnh cạnh chữ desktop/trên chữ mobile, lỗi ảnh giữ chữ và trở về một cột |
| Audio theo thao tác | PASS trên dev; 2 player chung, chưa có src/tải/phát trước thao tác |
| Nghe/tạm dừng/tiếp tục/kết thúc/nghe lại | PASS trên dev; nhãn/aria theo media, nhạc nền phối hợp đúng |
| Replay khi đang/không nghe thư | PASS trên dev; tua giọng đọc, giữ lựa chọn nhạc, không gọi play nhạc thêm khi đã phát, cùng 2 player |
| Tab Chrome ẩn/hiện | PASS trên dev; dừng cả hai, trở lại không tự phát |
| Play bị chặn và audio hỏng | PASS trên dev; thông báo cạnh nút, thử lại, bản chữ không mất |
| Tới finale ở 0/5 hoặc trước module tải xong | PASS; SVG/chữ hiện khi chờ, canvas nhận layout mới nhất, bó hoa đầy đủ |
| Ghép bó/giấy/nơ và hoàn tất | PASS; assembling → complete, giấy 3D/nơ SVG hiện đúng lớp, renderState static |
| Cuộn đi rồi quay lại | PASS; một lượt ghép bó, frame count ngừng sau hoàn tất |
| Replay hai lần | PASS; một canvas, lượt ghép mới, focus nút mở, hoa lời chúc reset 0/5 và trạng thái nụ |
| Không WebGL2 / context loss | PASS; canvas gỡ, SVG hiện, chữ/nút dùng được |
| Reduced motion | PASS; bó hoàn chỉnh/frame tĩnh, 0 animation trong phần kết |

Thêm 9 test: bốn trường hợp giọng đọc (toggle, hủy lúc tải, replay không phát nhạc thêm, ended/nghe lại/reset), bốn trường hợp bouquet motion (một lượt/pause, reduced motion, replay chờ rời cảnh, pose hữu hạn) và một trường hợp giấy gói/dispose tài nguyên đúng một lần. Tổng 70 test đạt. Không thêm dependency.

Audio/ảnh được thử bằng response cấu hình dev chỉ trong browser, chạy chính `main.js` và manager/component của ứng dụng; không tạo manager thử thay thế hoặc sửa file cấu hình. Fixture gồm WAV im lặng 1 giây/2,4 giây, một file audio hỏng, hình hoa WebP 720×900 và file ảnh hỏng. Native playback, ended và lỗi decode được kiểm tra; `NotAllowedError` được giả lập. Đây không phải đánh giá giọng đọc/nhạc thật hoặc crop chân dung.

Đã xem screenshot thư có/không ảnh, thư/audio/ảnh lỗi, bó hoa desktop/mobile và SVG fallback. Phát hiện canvas che nơ khi kiểm tra hình; đã đặt lớp nơ trên canvas và kiểm tra lại. Năm fixture đã xóa trước build cuối. `public/assets/photos/`, `public/assets/audio/` và các thư mục tương ứng trong hai artifact chỉ còn `.gitkeep`; demo giữ toàn bộ photo/audio null.

Bó hoa có 107 draw calls và 14.616 tam giác ở trạng thái hoàn tất trong Chrome QA. Thời gian ghép khoảng 2,2 giây theo delta render, rồi frame count giữ nguyên; không chạy hạt/parallax/sway. Chỉ resize/layout mới yêu cầu frame mới. Đây là xác minh vòng đời, không phải nghiệm thu hiệu năng trên điện thoại thật.

Payload root: HTML 6,60 kB (gzip 2,08), CSS 25,84 kB (gzip 5,68), entry JS 47,90 kB (gzip 16,80), chunk garden/Three.js 569,91 kB (gzip 144,90), scroll-scenes 43,33 kB (gzip 17,75). Three.js vẫn lazy-load; cảnh báo chunk > 500 kB còn như trước, build thành công. Tối ưu payload thuộc task0_8. Script/JSON/screenshot ở `.qa/`, được ignore Git.

Xem [thư và phần kết](./letter-and-finale.md) cho cấu hình, API và vòng đời.

## Kết quả task0_8 — 14/10/2026

| Kiểm tra | Kết quả |
| --- | --- |
| `npm.cmd run check` | PASS; 51 file JS/MJS, cấu hình/asset |
| `npm.cmd test` | PASS; 77/77 test |
| Build root và `/2010/` | PASS; fixture đã dọn, font chỉ 8 WOFF2 |
| Chrome dev/root/Pages | PASS; console/asset errors 0 |
| Đầu–cuối–xem lại, anchor, cuộn xuôi/ngược | PASS; focus/state đúng, không khóa body |
| 360/390/768/1440 và 667×375 landscape | PASS; không tràn ngang, control ≥ 44 px và không phủ nội dung |
| Zoom 200% | PASS mô phỏng reflow/độ nét bằng CSS 720×500/DPR 2; chưa kiểm tra zoom thủ công trên thiết bị thật |
| Tab/Enter/Space/skip-link | PASS; đọc thư/xem lại/mở hoa, outline ≥ 3 px |
| Nút skip mobile | PASS; nằm trong luồng trang và trong viewport khi mở |
| Motion/visibility dùng chung | PASS; một MediaQueryList reduced motion có listener trong app, đổi preference giữ scroll |
| Render khi đọc thư/ẩn tab/hiện lại | PASS; frame ngừng rồi tiếp tục đúng, audio không auto-resume |
| Garden sau nở | PASS; MutationObserver ghi 0 thay đổi attribute trong mẫu render 1,6 giây |
| Sáu replay mỗi build | PASS; một canvas, GPU/listener/node giữ nguyên |
| 3D/GSAP chunk lỗi | PASS; SVG và đủ lời chúc/thư, không kẹt opening |
| Hồi quy ảnh/audio trên dev | PASS; 7 ảnh lazy, nội dung/caption/tên/nhãn dài, phát/tạm dừng/nghe lại, tab ẩn, blocked/retry/file hỏng |
| Font dấu tiếng Việt | PASS; Chrome CSS.getPlatformFontsForNode xác nhận Cormorant/Be Vietnam Pro custom cho tiêu đề/đoạn thư |
| Safe-area | Đã triển khai viewport-fit và env inset trong CSS; API giả lập inset không có trong Chrome phiên QA, thiết bị thật còn chờ |

Thêm 7 test: bốn test page state (một nguồn/snapshot, gộp scroll/resize/activeSection, lọc trường, cleanup frame/listener), một test status media lặp, một test batching/dispose instance và một test nhịp RAF với jitter/frame trễ. Không thêm dependency.

Mẫu cold load dùng cache tắt, latency 150 ms, download 200 KiB/s, upload 100 KiB/s và CPU throttle ×4. Transfer gồm HTML và resource tại thời điểm font đã sẵn; FCP đo từ navigation, CLS là tổng layout shift không có recent input trong pha đầu trang. Đây là mẫu cục bộ với điều kiện giả lập, không phải số đo từ hosting/CDN hoặc Core Web Vitals của người nhận.

| Chỉ số | Production root | Production `/2010/` |
| --- | --- | --- |
| Transfer đầu trang | 155.733 byte | 155.747 byte |
| Decoded đầu trang | 206.758 byte | 206.823 byte |
| FCP | 492 ms | 520 ms |
| CLS pha đầu | 0,0474 | 0,0478 |
| Font request | 8 WOFF2 local | 8 WOFF2 local |
| Three.js/GSAP ở intro | Chưa tải | Chưa tải |
| Resource ngoài origin | 0 | 0 |
| FPS desktop | 45,1 | 44,9 |
| FPS mobile giả lập | 29,9 | 29,8 |
| Garden draw calls / tam giác | 40 / 14.600 | 40 / 14.600 |
| Listener trước/sau 6 replay | 111 / 111 | 107 / 107 |
| DOM node trước/sau 6 replay | 3.414 / 3.414 | 3.414 / 3.414 |
| Heap sau GC trước/sau | 8.785.932 / 8.824.888 byte | 7.907.256 / 7.946.060 byte |
| GPU trước/sau | 7 geometry, 1 texture, 5 program; giữ nguyên | Giữ nguyên cùng số tài nguyên |

FPS được lấy trong khoảng 1,6 giây sau khi trả CPU/mạng về bình thường, GPU Intel UHD qua ANGLE/D3D11, giới hạn preset 45/30 FPS. Trước sửa nhịp RAF, dev đo khoảng 27 FPS mobile; sau sửa đo khoảng 30 FPS. Chưa có số đo điện thoại thật hoặc phiên xem dài. Heap tăng khoảng 39 kB sau sáu replay; không phát hiện tăng canvas/listener/node/GPU trong mẫu này, không khẳng định loại trừ mọi rò rỉ.

Instancing giữ nguyên số tam giác/hình hoa, giảm draw call từ 107 xuống 40. Bó hoa hoàn chỉnh 40 draw calls/14.616 tam giác, nơ vẫn nằm trên giấy. Frame/progress chẩn đoán đọc từ API theo yêu cầu, không ghi dataset mỗi frame. Chỉ giai đoạn nơ/kích thước thay đổi mới cập nhật overlay. Buffer instance được dispose trước geometry/material dùng chung.

Payload build root: HTML 6,62 kB (gzip 2,09), CSS 22,81 kB (gzip 5,26), entry JS 49,51 kB (gzip 17,40), GSAP/timeline lazy 70,27 kB (gzip 27,61), Three.js/garden lazy 573,93 kB (gzip 145,98), font WOFF2 tổng khoảng 127,8 kB. Không còn chunk ScrollTrigger hoặc font WOFF/Cyrillic/Latin-ext chưa dùng. Cảnh báo chunk garden > 500 kB vẫn hiện; build thành công.

Đã xem screenshot garden/bó hoa sau instancing, skip trong luồng trang, landscape, reflow 200%, tất cả ảnh với caption dài và thư có ảnh/chữ dài. Fixture WebP/WAV giống task0_7, chỉ dùng để kiểm tra kỹ thuật, đã dọn khỏi public và artifact; config demo/photo/audio null. Script/JSON/screenshot nằm trong `.qa/`, được ignore Git.

Xem [tích hợp và hiệu năng](./integration-and-performance.md) cho nguồn tín hiệu, tải theo nhu cầu và vòng đời.

## Kết quả task0_9 — 14/10/2026

| Kiểm tra cuối | Kết quả / phạm vi |
| --- | --- |
| Check và test | PASS; 51 file JS/MJS, 77/77 test |
| Build root / Pages | PASS; `dist/` base `/`, `.qa/dist-pages/` base `/2010/` |
| Chrome production root / Pages | PASS; đủ 5 section/5 lời chúc, console/asset errors 0 |
| Mở bình thường, bấm mở 15 lần | PASS; một lượt, khoảng 1.900 ms root / 1.891 ms Pages, focus garden-title |
| Skip / đọc tới cuối ở 0/5 / replay | PASS; không khóa nội dung hoặc chờ đủ hoa |
| Chạm một hoa 20 lần | PASS; count vẫn 1/5 |
| Tab/Enter/Space và anchor | PASS; đúng focus, outline và natural scroll |
| Accessibility tree | PASS; 5 flower button có tên, canvas trang trí không là control; chưa chạy screen reader thật |
| Mobile 390×844 → landscape 844×390, DPR 3 | PASS; không tràn ngang, preset giữ DPR ≤ 1,5 |
| Reduced motion/tab ẩn/sáu replay | PASS hồi quy integration; frame dừng, listener/node/GPU giữ nguyên trong mẫu |
| Module GSAP/Three bị chặn | PASS; SVG/chữ giữ nguyên, không kẹt mở thư |
| Context loss/không WebGL2 | PASS; canvas gỡ, SVG và thư/nút dùng được |
| Metadata/demo/scope | PASS; token metadata đã thay, demo hiện rõ, không og:image chân dung, form/kỷ niệm/lời hẹn/quà unlock |
| Ảnh/audio Pages native | PASS trên artifact QA riêng; URL `/2010/assets/...`, preload none/không src trước thao tác, phát/tạm dừng/ended, nhạc phối hợp, cùng 2 player sau replay |
| Hero ảnh hỏng/letter ảnh decode | PASS trên artifact QA; lazy khi vào viewport, lỗi hero gỡ ảnh/has-portrait, chữ vẫn đủ |
| Nội dung và file thật tại task0_9 | Khi đó CHỜ; hiện đã thêm 5 ảnh WebP vào build/package như ghi chú cập nhật bên dưới; tên/audio còn mẫu |
| Source/static ZIP và checksum | Đối chiếu từng file sau giải nén; inventory/SHA-256 trong manifest bàn giao |
| Vercel/Pages workflow | Đã đối chiếu tài liệu/action metadata, pin SHA phiên bản hiện hành; CHƯA chạy trên remote hoặc deploy |

Không sửa source giao diện trong task0_9; bản build cùng nội dung/chunk với task0_8. Kiểm thử final chạy thêm luồng mở bình thường, bấm lặp/skip/đọc tới cuối, AX tree, đổi hướng với DPR 3 và context loss/no-WebGL trên cả hai build. Integration của task0_8 chạy lại trên chính bản build bàn giao: root khoảng 45,1/30,0 FPS desktop/mobile giả lập, Pages 44,7/29,9 FPS; tải đầu vẫn khoảng 156 kB. Mẫu ngắn/CPU-GPU máy tính không đại diện thiết bị thật.

Artifact media QA dùng Vite plugin chỉ thay cấu hình trong quá trình build, publicDir nằm riêng trong `.qa/`: hai WAV im lặng 1 giây/2,4 giây, một WebP hình hoa 720×900 và ảnh cố ý hỏng. Browser phát bằng HTMLAudioElement thật và kiểm tra pathname ảnh/nhạc/voice. Config `src/config/content.js` và public của dự án không bị thay đổi; artifact thử không được đóng gói vào release.

Theo hướng dẫn Vite hiện hành, workflows cập nhật checkout/setup-node v7, configure-pages v6, upload-pages-artifact/deploy-pages v5 và pin SHA commit. Action metadata dùng Node 24 bên trong, build app chọn Node 22. Đã xác minh cấu hình/base_path bằng tài liệu chính thức, chưa có GitHub runner thật. [Vite deploy](https://vite.dev/guide/static-deploy#github-pages), [Actions checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node).

Gói bàn giao gồm source/lockfile/test/CI/docs, static root và static `/2010/`; có checksum SHA-256 và inventory, kiểm tra không chứa `.env`, ảnh gốc, cache, `.qa` hoặc dependency. `dist/`/artifact Pages vẫn chỉ có `.gitkeep` trong photos/audio. Nội dung demo được ghi trong manifest và [hướng dẫn bàn giao](./release-guide.md), không đổi thành “quà đã chốt”.

Đã xem ảnh cuối mobile root/Pages và artifact QA media. Các script/JSON/screenshot kiểm tra nằm trong `.qa/`, được ignore Git. ZIP/manifest nằm trong `release/`, cũng được ignore; source ZIP giữ workflows, `.env.example`, font license và hướng dẫn chạy lại.

## Cập nhật ảnh sau task0_9 — 14/10/2026

- Năm ảnh JPG gốc được giữ riêng trong `.originals/photos/` và không đưa vào static ZIP. Bản web xuất WebP đã sửa hướng ảnh, bỏ metadata, tối đa 1200 px mỗi chiều; tổng 754,056 byte. Gắn 1 ảnh phần mở đầu, 4 ảnh lời chúc; thư và lời chúc thứ năm không có ảnh.
- Build root và Pages `/2010/` chạy lại thành công. Ba ZIP được đóng lại và đối chiếu inventory/SHA-256 từng file sau giải nén; mỗi bản static có đủ năm ảnh WebP.
- Số liệu Chrome, 77 test và 51 file JS/MJS phía trên thuộc lần nghiệm thu task0_9 trước khi thêm ảnh. Không chạy lại browser/test suite trong cập nhật này; chưa xác nhận crop trực quan trên mọi kích thước thiết bị.

## Cập nhật màn hình mở đầu — 14/10/2026

- Phong thư tự mở khi tải trang; đã bỏ nút mở và nhãn demo khỏi màn đầu, cùng header chứa tên/date. Bỏ qua chuyển động vẫn hiện lúc đang mở, replay chạy lại từ đầu. Truy cập thẳng `#garden`, `#wishes`, `#letter` hoặc `#finale` vẫn vào đúng section.
- Build root và Pages `/2010/` đạt. Chưa chạy lại browser/test suite cho thay đổi luồng này; thiết bị thật và trình duyệt trong ứng dụng nhắn tin vẫn chưa kiểm tra.

## Giới hạn

- Chưa deploy Vercel/GitHub Pages thật, chưa chạy workflow trên GitHub; cấu hình và hướng dẫn đã có.
- Mobile là giả lập bằng Chrome headless; chưa thử thiết bị thật, Safari iOS hoặc trình duyệt trong ứng dụng nhắn tin.
- Chưa kiểm tra crop ảnh trên thiết bị người nhận hoặc Safari; chưa có nhạc/giọng đọc thật.
- Đã kiểm tra font/contrast/focus, luồng tích hợp và AX tree; screen reader thật, notch/safe-area và phiên dài chưa có môi trường kiểm chứng, cần thử trước khi gửi link thật.

Các preview server phục vụ kiểm tra sẽ dừng khi bàn giao. Chạy `npm.cmd run dev` để mở lại.

## Kiểm tra thư 3D

- Import timeline đã trỏ đúng đến `src/graphics/svg/envelope3d.js`; trước đó đường dẫn tương đối sai khiến build không phân giải được module.
- SVG fallback và timeline dùng cùng tư thế phong bì đóng ban đầu; trạng thái sau mở xếp lớp thiệp/nắp nhất quán.
- WebGL2 đã được xác minh trên Chrome headless/SwiftShader: canvas xuất hiện trong lúc mở, SVG ẩn bên dưới và canvas 2D giữ nguyên khung cuối sau khi giải phóng WebGL.
- Nắp 3D xoay ra sau tấm thiệp; xác nhận ở khung cuối, chữ trên thiệp không còn bị tam giác nắp che.
- Phong thư chờ sự kiện `load` thêm 3 giây rồi mới tự mở; kiểm tra Chrome xác nhận còn ở `intro` trước mốc chờ và chuyển sang `opening` sau đó.
- Timeline 3D dùng timeScale 0,65, kéo dài từ khoảng 2,34 lên 3,6 giây; fallback SVG cũng chạy chậm tương ứng. Watchdog 8 giây vẫn đủ cho tải chunk và animation.
- `npm.cmd run check`: PASS, 52 file; `npm.cmd test`: PASS, 77/77; build Vercel/root và GitHub Pages `/2010/`: PASS.
- Chrome headless: PASS; tự mở thư, header/nút cũ không còn, reduced motion và replay hoạt động; 0 lỗi console/tài nguyên.
