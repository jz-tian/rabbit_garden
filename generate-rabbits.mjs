/**
 * generate-rabbits.mjs
 * Generates 10 realistic rabbit breed portraits via Gemini.
 *
 * Usage:
 *   export GEMINI_KEY=your_api_key_here
 *   node generate-rabbits.mjs
 *
 * Output: assets/rabbits/<slug>.png
 * Replace SVG placeholders in index.html with:
 *   <img class="photo" src="assets/rabbits/<slug>.png" alt="<Breed>">
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const key = process.env.GEMINI_KEY;
if (!key) {
  console.error("❌  Set GEMINI_KEY first:  export GEMINI_KEY=your_key");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });
const OUT = "./assets/rabbits";
fs.mkdirSync(OUT, { recursive: true });

// Prompt prefix: consistent studio-portrait framing for every breed
const FRAME = [
  "Professional studio portrait photograph of a rabbit.",
  "Centered composition, front-facing, head and upper body clearly visible.",
  "Both front paws resting flat at the very bottom edge of the frame.",
  "Soft even studio lighting, pure white background.",
  "High quality, sharp focus, natural fur detail.",
  "NOT illustrated. NOT cartoon. Photographic.",
].join(" ");

const breeds = [
  {
    slug: "lionhead",
    prompt: `${FRAME} The rabbit is a Lionhead breed: compact body, distinctive fluffy mane of long fur surrounding the face and head like a lion's mane, upright ears, small round face peeking from the mane. Tawny golden-brown coloring.`,
  },
  {
    slug: "holland-lop",
    prompt: `${FRAME} The rabbit is a Holland Lop breed: very round compact body, distinctively wide floppy ears that droop down on both sides of the face, flat face, stocky build. Cream or tan coloring.`,
  },
  {
    slug: "dutch-dwarf",
    prompt: `${FRAME} The rabbit is a Dutch Dwarf (Netherland Dwarf) breed: tiny compact round body, very short upright ears, large round head relative to body, chubby face. Grey body with white belly and face.`,
  },
  {
    slug: "angora",
    prompt: `${FRAME} The rabbit is an English Angora breed: entire body covered in extremely long, silky, fluffy wool fur that nearly obscures its face and body shape, making it appear as a large round ball of soft white fluff, small ears hidden in fur. Cream/white coloring.`,
  },
  {
    slug: "flemish-giant",
    prompt: `${FRAME} The rabbit is a Flemish Giant breed: notably large body with a broad head, long upright ears, muscular build noticeably bigger than typical rabbits. Steel blue-grey or sandy coloring.`,
  },
  {
    slug: "mini-rex",
    prompt: `${FRAME} The rabbit is a Mini Rex breed: compact medium body, medium upright ears, distinctive very short, plush velvet-like fur with a dense velvety texture. Deep chocolate brown coloring.`,
  },
  {
    slug: "dutch",
    prompt: `${FRAME} The rabbit is a Dutch breed: classic two-tone markings with solid black front half (face, ears, shoulders) and pure white rear half, with a characteristic white blaze (stripe) running from nose up the forehead. Compact body.`,
  },
  {
    slug: "harlequin",
    prompt: `${FRAME} The rabbit is a Harlequin breed: striking two-tone pattern dividing the body into alternating patches of orange and black, with the split running down the center of the face — one side orange, other side black. Unique checkerboard-like pattern.`,
  },
  {
    slug: "polish",
    prompt: `${FRAME} The rabbit is a Polish breed: very small compact body, short upright ears, round head, short nose. Pure white with distinctive red/ruby-red eyes (albino). Smallest of all rabbit breeds.`,
  },
  {
    slug: "american-fuzzy-lop",
    prompt: `${FRAME} The rabbit is an American Fuzzy Lop breed: small compact body, wide floppy drooping ears on both sides, distinctive flat face, entire body covered with long fluffy woolly fur (like Angora but with lop ears). Orange tortoiseshell coloring.`,
  },
];

console.log(`Generating ${breeds.length} rabbit portraits...\n`);

for (const breed of breeds) {
  const outPath = path.join(OUT, `${breed.slug}.png`);
  if (fs.existsSync(outPath)) {
    console.log(`⏭  ${breed.slug}.png  (already exists, skipping)`);
    continue;
  }

  process.stdout.write(`⏳  ${breed.slug}...`);
  try {
    const res = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: breed.prompt,
      config: { responseModalities: ["TEXT", "IMAGE"] },
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    let saved = false;
    for (const p of parts) {
      if (p.inlineData?.mimeType?.startsWith("image/")) {
        const buf = Buffer.from(p.inlineData.data, "base64");
        fs.writeFileSync(outPath, buf);
        console.log(`  ✓  ${Math.round(buf.length / 1024)} KB`);
        saved = true;
        break;
      }
    }
    if (!saved) console.log("  ⚠  no image in response");
  } catch (e) {
    console.log(`  ✗  ${e.message}`);
  }
}

console.log("\nDone! Images saved to ./assets/rabbits/");
console.log("\nTo use in index.html, replace each SVG placeholder:");
console.log("  <svg class=\"bunny-svg\">...</svg>");
console.log("  →  <img class=\"photo\" src=\"assets/rabbits/<slug>.png\" alt=\"<Breed>\">");
