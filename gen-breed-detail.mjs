/**
 * gen-breed-detail.mjs
 * 为每个品种生成 3 张图，每张展示不同颜色变种和姿态。
 *   <breed>-a.png  3:4  经典色，全身坐姿
 *   <breed>-b.png  1:1  不同颜色变种，放松趴卧/侧面姿态
 *   <breed>-c.png  1:1  第三种颜色，不同角度或特写
 *
 * Usage: GEMINI_KEY=your_key node gen-breed-detail.mjs
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const key = process.env.GEMINI_KEY;
if (!key) { console.error("Set GEMINI_KEY"); process.exit(1); }

const ai = new GoogleGenAI({ apiKey: key });
const OUT = "./assets/rabbits";
fs.mkdirSync(OUT, { recursive: true });

const breeds = [
  {
    slug: "flemish-giant",
    // 三种颜色变种：钢蓝灰 / 沙黄棕 / 黑色
    a: "Photorealistic studio photograph of a Flemish Giant rabbit, full body sitting upright facing camera. Classic steel blue-grey fur, broad head, very long upright ears, notably large muscular body. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of a Flemish Giant rabbit with sandy fawn coloring, lying relaxed in side view showing the impressive full body length. Long body, large upright ears, calm relaxed expression. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of a Flemish Giant rabbit with black fur coloring, sitting and looking sideways. Powerful large build, broad head, long upright ears. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
  },
  {
    slug: "lionhead",
    // 三种颜色变种：金棕 / 纯白 / 黑色
    a: "Photorealistic studio photograph of a Lionhead rabbit, full body sitting upright facing camera. Golden-brown fur with dramatic fluffy golden lion mane surrounding the face. Compact body, small upright ears peeking through mane. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of a Lionhead rabbit with pure white fur and fluffy white woolly mane, lying in a relaxed loaf position. The full white mane is visible. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of a black Lionhead rabbit sitting upright and looking upward. Deep black fur with a dense dark woolly mane framing the face. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
  },
  {
    slug: "holland-lop",
    // 三种颜色变种：奶油橙棕 / 灰白 / 黑白花
    a: "Photorealistic studio photograph of a Holland Lop rabbit, full body sitting upright facing camera. Orange-cream tortoiseshell coloring, very round compact body, wide floppy ears drooping down on both sides, flat round face. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of a Holland Lop rabbit with light grey and white coloring, in a relaxed loaf position, side view. Wide floppy lop ears, very round compact body. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of a Holland Lop rabbit with broken black and white markings, sitting at a 3/4 angle looking toward camera. One floppy ear visible draped to the side. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
  },
  {
    slug: "angora",
    // 白毛用浅奶油背景避免消失；棕色和灰色用纯白
    a: "Photorealistic studio photograph of an English Angora rabbit, full body sitting upright facing camera. Pure white extremely long silky flowing wool completely covers the entire body, face barely visible within the fur mass. SOFT CREAM BACKGROUND (#f5ede0). Soft diffused studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of an English Angora rabbit with rich chocolate brown wool coloring, full body visible. Extremely long dense dark brown wool covers the entire body like a giant fluffy ball. Sitting relaxed, face barely visible. PURE WHITE BACKGROUND. Soft diffused studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of an English Angora rabbit with light silver-grey wool coloring, photographed from slightly above showing the perfectly round cloud-like shape. Long flowing silvery-grey wool in all directions. PURE WHITE BACKGROUND. Soft diffused studio lighting. Animal photography, NOT illustrated, no humans.",
  },
  {
    slug: "harlequin",
    // 三种图案变种：经典橙黑 / 蓝灰配黄 / 巧克力配橙
    a: "Photorealistic studio photograph of a Harlequin rabbit, full body sitting upright facing camera. Classic pattern: left half bright orange, right half solid black, perfect bilateral color split from nose to tail. Alternating orange-black bands on body and legs. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of a Harlequin rabbit sitting sideways to show the full body pattern. Blue-grey and warm fawn-yellow alternating horizontal bands across the body, face split blue-grey and fawn. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of a Harlequin rabbit sitting upright, 3/4 angle. Rich chocolate brown and bright orange alternating pattern, face split with one chocolate side and one orange side. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
  },
  {
    slug: "netherland-dwarf",
    // 三种颜色：蓝灰 / 黑色 / 橙栗，特别强调身体要充满画面
    a: "Photorealistic studio photograph of a Netherland Dwarf rabbit, full body filling most of the frame, sitting upright facing camera. Blue-grey coloring, tiny compact round body, very short stubby upright ears, large round eyes, chubby face. The rabbit is small but should fill the frame. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    b: "Photorealistic studio photograph of a Netherland Dwarf rabbit with pure black shiny fur, filling most of the frame, sitting alert with tiny ears perked up. Very tiny compact round body with disproportionately large bright eyes. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
    c: "Photorealistic studio photograph of a Netherland Dwarf rabbit with warm chestnut-orange fur coloring, filling most of the frame, turning its head to look at camera. Tiny petite round body, very short ears, large curious eyes. PURE WHITE BACKGROUND. Soft studio lighting. Animal photography, NOT illustrated, no humans.",
  },
];

const aspectRatios = { a: "3:4", b: "1:1", c: "1:1" };

console.log(`Generating detail images for ${breeds.length} breeds (3 per breed = 18 total)...\n`);

for (const breed of breeds) {
  for (const variant of ['a', 'b', 'c']) {
    const outPath = path.join(OUT, `${breed.slug}-${variant}.png`);
    if (fs.existsSync(outPath)) {
      console.log(`⏭  ${breed.slug}-${variant}.png  (exists, skipping)`);
      continue;
    }
    process.stdout.write(`⏳  ${breed.slug}-${variant}...`);
    try {
      const res = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: breed[variant],
        config: {
          numberOfImages: 1,
          aspectRatio: aspectRatios[variant],
          outputMimeType: "image/png",
        },
      });
      const imgBytes = res.generatedImages?.[0]?.image?.imageBytes;
      if (imgBytes) {
        const buf = Buffer.from(imgBytes, "base64");
        fs.writeFileSync(outPath, buf);
        console.log(`  ✓  ${Math.round(buf.length / 1024)} KB`);
      } else {
        console.log("  ⚠  no image in response");
      }
    } catch (e) {
      console.log(`  ✗  ${e.message}`);
    }
  }
}

console.log("\nDone! Detail images keep their white backgrounds — no need to preprocess.");
