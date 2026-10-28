const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcons() {
  const svgPath = path.resolve(__dirname, '../public/icons/logo.svg');
  const publicDir = path.resolve(__dirname, '../public');

  if (!fs.existsSync(svgPath)) {
    console.error('Source SVG not found at', svgPath);
    return;
  }

  // Copy icon.svg to public/
  fs.copyFileSync(svgPath, path.join(publicDir, 'icon.svg'));

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. Apple Touch Icon 180x180 (with subtle background padding for iOS)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. Maskable 512x512: central 80% circle with safe-zone margin (15% padding) on dark background
  const innerSize = Math.round(512 * 0.72); // ~368px
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();
  
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 18, g: 18, b: 18, alpha: 1 } // #121212 brand background
    }
  })
    .composite([
      {
        input: innerBuffer,
        gravity: 'centre'
      }
    ])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
