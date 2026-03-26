/**
 * preprocess-images.mjs
 * 对 assets/rabbits/ 里的所有 PNG 做边缘洪泛去背景，
 * 直接覆盖原文件为透明 PNG，浏览器就不需要再跑 canvas 处理了。
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const DIR = './assets/rabbits';
// 只处理品种详情图（-a/-b/-c），hero 主图已是透明 PNG 无需重复处理
// 部分图用原图背景，跳过处理
const SKIP = new Set(['angora-a.png', 'angora-c.png', 'netherland-dwarf-a.png']);
const files = fs.readdirSync(DIR).filter(f =>
  f.endsWith('.png') && /-[abc]\.png$/.test(f) && !SKIP.has(f)
);

for (const file of files) {
  const filePath = path.join(DIR, file);
  process.stdout.write(`处理 ${file}...`);

  const img = sharp(filePath);
  const { width: w, height: h } = await img.metadata();

  // 获取原始 RGBA 像素（sharp 会自动添加 alpha 通道）
  const raw = await img.ensureAlpha().raw().toBuffer();
  const d = new Uint8Array(raw.buffer);

  // 从左上角采样背景色
  let bgR = 0, bgG = 0, bgB = 0;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const i = (y * w + x) * 4;
      bgR += d[i]; bgG += d[i+1]; bgB += d[i+2];
    }
  }
  bgR = bgR / 16; bgG = bgG / 16; bgB = bgB / 16;

  const THRESH = 52;
  const visited = new Uint8Array(w * h);
  const queue = [];

  const dist = (i) => Math.sqrt(
    (d[i] - bgR) ** 2 + (d[i+1] - bgG) ** 2 + (d[i+2] - bgB) ** 2
  );

  const seed = (x, y) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    if (dist(idx * 4) < THRESH) { visited[idx] = 1; queue.push(idx); }
  };

  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

  let qi = 0;
  while (qi < queue.length) {
    const idx = queue[qi++];
    const x = idx % w;
    const dd = dist(idx * 4);
    const half = THRESH * 0.5;
    d[idx * 4 + 3] = Math.min(d[idx * 4 + 3],
      dd < half ? 0 : Math.round(255 * (dd - half) / half));

    for (const ni of [idx - 1, idx + 1, idx - w, idx + w]) {
      if (ni < 0 || ni >= w * h || visited[ni]) continue;
      if (Math.abs((ni % w) - x) > 1) continue;
      if (dist(ni * 4) < THRESH) { visited[ni] = 1; queue.push(ni); }
    }
  }

  await sharp(Buffer.from(d), { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(filePath + '.tmp');

  fs.renameSync(filePath + '.tmp', filePath);
  console.log(' ✓');
}

console.log('\n全部完成，图片已保存为透明 PNG。');
