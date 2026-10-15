# Đưa website lên hosting miễn phí

Đã đối chiếu tài liệu chính thức ngày 14/10/2026. Source/build được bàn giao dưới trạng thái demo; xem [hướng dẫn bàn giao](./release-guide.md) trước khi dùng để tặng thật.

## Lựa chọn

| Nền tảng | Khi dùng | URL mặc định |
| --- | --- | --- |
| Vercel Hobby | Dự án cá nhân, có thể giữ source trong repo private cá nhân | `ten-project.vercel.app` |
| GitHub Pages | Source public, muốn deploy bằng GitHub Actions | `username.github.io/ten-repository/` |

Vercel Hobby là gói miễn phí cho mục đích cá nhân, phi thương mại và có giới hạn sử dụng. GitHub Pages khả dụng với repo public trên GitHub Free. Không cần mua domain; có thể dùng subdomain được cấp. [Vercel Hobby](https://vercel.com/docs/plans/hobby), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## 1. Chuẩn bị repository

Tạo repository trên GitHub cá nhân, đặt branch chính là `main`. Với Vercel có thể chọn private; với Pages trên gói GitHub Free chọn public.

Nếu thư mục chưa là Git repository, thực hiện từ thư mục gốc dự án:

```sh
git init -b main
git add .
git commit -m "Set up static 20 October website"
```

Thêm remote bằng URL repository thật của bạn rồi push:

```sh
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

`.gitignore` đã loại `node_modules`, `dist`, `release`, cache npm, `.env`, dữ liệu local Vercel và thư mục kiểm tra local. Giữ `package-lock.json` trong Git. Giải nén source ZIP nếu cần lấy bộ file bàn giao; không push ZIP static thay cho source.

## 2. Vercel — hướng chính

1. Đăng nhập Vercel bằng GitHub, dùng Hobby.
2. Chọn Add New → Project và import repository cá nhân.
3. Root Directory: thư mục chứa `package.json` (gốc repository nếu push dự án này).
4. Framework Preset: Vite. Node: 22.x được cập nhật.
5. Cấu hình có sẵn trong `vercel.json`:
   - Install: `npm ci`.
   - Build: `npm run check && npm test && npm run build`.
   - Output: `dist`.
6. Base mặc định là `/`; không đặt biến từ cấu hình GitHub Pages vào Vercel.
7. Nhấn Deploy, mở URL production dạng `https://ten-project.vercel.app`.
8. Kiểm tra URL production trong cửa sổ chưa đăng nhập để chắc người nhận mở được. Nếu có bật Deployment Protection cho production, chỉnh phạm vi bảo vệ để URL món quà truy cập công khai.

Các lần push tiếp theo lên branch production sẽ tạo bản mới. Không cần chạy `npm run preview` trên Vercel hoặc viết API/server cho dự án này. [Vite trên Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## 3. GitHub Pages — hướng thay thế

1. Push lên repo public với branch `main`.
2. Repository Settings → Pages → Build and deployment → Source: GitHub Actions.
3. Actions → Deploy to GitHub Pages → Run workflow → chọn `main`.
4. Đợi build/deploy thành công rồi mở URL trong output/environment `github-pages`.
5. Để tự deploy mỗi lần push, Settings → Secrets and variables → Actions → Variables → New repository variable:
   - Name: `DEPLOY_GITHUB_PAGES`.
   - Value: `true`.

Workflow nằm tại `.github/workflows/deploy-pages.yml`. `actions/configure-pages` cung cấp base path cho build, nên repository mới có tên khác cũng không cần sửa đường dẫn ảnh thủ công. Custom domain/user site cũng dùng base từ cấu hình Pages.

Task0_9 cập nhật các Action theo ví dụ hiện hành của Vite và cố định SHA commit: checkout/setup-node v7, configure-pages v6, upload-pages-artifact/deploy-pages v5. Runtime nội bộ của Action dùng Node 24; bản build ứng dụng vẫn chọn Node 22 trong workflow. Cấu hình/metadata action đã đối chiếu, chưa có lần chạy trên GitHub thật. [Ví dụ workflow chính thức](https://vite.dev/guide/static-deploy#github-pages), [checkout](https://github.com/actions/checkout), [setup-node](https://github.com/actions/setup-node).

Workflow CI `.github/workflows/ci.yml` kiểm tra build trên push/PR, độc lập với việc deploy. Nếu chỉ dùng Vercel, giữ biến deploy Pages chưa thiết lập để job Pages được bỏ qua.

Build Vite cần bước GitHub Actions; không chọn deploy trực tiếp thư mục source vì source chưa phải bản production. [Hướng dẫn Vite](https://vite.dev/guide/static-deploy#github-pages).

## 4. Kiểm tra base path local

Build Vercel/root:

```sh
npm run build
npm run preview
```

Build tương tự GitHub Pages với repository tên `2010`:

```sh
npm run build -- --base=/2010/
```

Trên PowerShell, để preview dùng cùng base:

```powershell
$env:VITE_BASE_PATH = '/2010/'
npm.cmd run preview
# Sau khi dừng preview bằng Ctrl+C:
Remove-Item Env:VITE_BASE_PATH
```

Mở `http://localhost:4173/2010/`. Sau khi thử, chạy lại `npm run build` với môi trường mặc định để `dist/` trở về bản root.

Có thể copy `.env.example` thành `.env` để lưu base local. Khi chuyển nền tảng, kiểm tra lại biến này; không cần `.env` cho deploy mặc định lên Vercel.

## 5. Kiểm tra sau deploy

- Mở URL trên điện thoại và cửa sổ chưa đăng nhập.
- Ảnh, favicon, CSS và JavaScript tải đúng, không có 404.
- Mở thư cuộn tới lời chúc; đủ năm section và nút xem lại.
- Nếu có nhạc, nút bật/tắt hoạt động sau thao tác của người xem.
- Tên/ảnh/lời chúc đã thay xong, `isDemo: false` khi tặng thật.

Các bước tài khoản, tạo remote và deploy chưa được thực hiện. Source, hai base path, hướng dẫn và bản static đã sẵn để triển khai. ZIP Pages bàn giao dùng `/2010/`; với tên repository khác hãy dùng workflow tự lấy base hoặc build lại, không đổi tên thư mục rồi giữ nguyên bundle.
