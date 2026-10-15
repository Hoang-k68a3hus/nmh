import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join, sep } from 'node:path';

export async function withFixture(prefix, run) {
  const root = resolve('.qa/test-fixtures');
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(join(root, `${prefix}-`));
  try { return await run(directory); }
  finally {
    // Kiểm tra đích tuyệt đối trước khi dọn recursive; chỉ xóa fixture do test tạo.
    if (!directory.startsWith(`${root}${sep}`)) throw new Error('Đích dọn fixture nằm ngoài thư mục QA.');
    await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
