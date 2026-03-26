/**
 * gen-peek.mjs
 * Generates 6 rabbit "peeking over ledge" portraits via Imagen 4.
 * Composition: tight head-and-paws crop, shot from slightly below,
 * both front paws reaching downward to the very bottom of the frame.
 * Designed to sit at a page boundary so the rabbits appear to
 * peek over the edge with paws resting on the ledge.
 *
 * Usage:
 *   GEMINI_KEY=your_key node gen-peek.mjs
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const key = process.env.GEMINI_KEY;
if (!key) { console.error("Set GEMINI_KEY"); process.exit(1); }

const ai = new GoogleGenAI({ apiKey: key });
const OUT = "./assets/rabbits";
fs.mkdirSync(OUT, { recursive: true });

// Core composition: head-and-paws close-up, no lower body
const FRAME = [
  "Professional studio photograph.",
  "VERY TIGHT CLOSE-UP: only the rabbit's head, ears, and front paws are visible.",
  "The rabbit is leaning forward slightly, looking directly at the camera.",
  "Both front paws are stretched forward and rest flat at the absolute bottom edge of the image frame.",
  "The rabbit's lower body and hind legs are NOT visible — cut off below the paws.",
  "Shot from a slightly low angle, as if the camera is just below the ledge level.",
  "Pure white background. Even soft studio lighting. Photorealistic, sharp focus.",
  "NOT illustrated. NOT cartoon. Photographic portrait.",
].join(" ");

const breeds = [
  {
    slug: "lionhead",
    prompt: `${FRAME} The rabbit is a Lionhead: compact face surrounded by a dramatic fluffy mane of long golden-brown fur, small upright ears partly hidden by the mane.`,
  },
  {
    slug: "holland-lop",
    prompt: `${FRAME} The rabbit is a Holland Lop: very round flat face, wide floppy ears hanging down on both sides of the head. Warm cream or light tan coloring.`,
  },
  {
    slug: "angora",
    prompt: `${FRAME} The rabbit is an English Angora: the entire head is covered in extremely long silky fluffy wool, making the face barely visible within a huge puff of white fur. Cream-white coloring.`,
  },
  {
    slug: "flemish-giant",
    prompt: `${FRAME} The rabbit is a Flemish Giant: notably large broad head with long upright ears, muscular and clearly larger than other breeds. Steel blue-grey coloring.`,
  },
  {
    slug: "harlequin",
    prompt: `${FRAME} The rabbit is a Harlequin: striking two-tone face split down the center — one half orange, one half black. Alternating patches of orange and black on the body visible above the paws.`,
  },
  {
    slug: "mini-rex",
    prompt: `${FRAME} The rabbit is a Mini Rex: medium upright ears, distinctive very short plush velvety fur texture. Deep chocolate brown coloring.`,
  },
];

console.log(`Generating ${breeds.length} peek-a-boo rabbit portraits...\n`);

for (const breed of breeds) {
  const outPath = path.join(OUT, `${breed.slug}.png`);
  process.stdout.write(`⏳  ${breed.slug}...`);
  try {
    const res = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: breed.prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
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

console.log("\nDone.");
