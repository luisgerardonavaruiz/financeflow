import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#10b981"/>
  <text x="256" y="340" font-size="280" text-anchor="middle"
    font-family="Arial" font-weight="bold" fill="white">F</text>
</svg>`;

for (const size of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`✓ icon-${size}x${size}.png`);
}

await sharp(Buffer.from(svg))
  .resize(180, 180)
  .png()
  .toFile("public/icons/apple-touch-icon.png");
console.log("✓ apple-touch-icon.png");

await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toFile("public/favicon.ico");
console.log("✓ favicon.ico");
