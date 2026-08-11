const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure output dir exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

/**
 * TrustMRR-inspired ultra-clean, high-contrast PWA & Favicon SVG generator.
 * Combines an open book geometric silhouette with a vibrant streak flame badge.
 */
const createSvgIcon = (options = { isMaskable: false, isFavicon: false }) => {
  const { isMaskable = false, isFavicon = false } = options;

  const scale = isMaskable ? 0.72 : isFavicon ? 0.92 : 0.86;
  const translate = isMaskable
    ? 'translate(71.68, 71.68)'
    : isFavicon
    ? 'translate(20.48, 20.48)'
    : 'translate(35.84, 35.84)';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <linearGradient id="brandBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="50%" stop-color="#ff5722"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>

    <linearGradient id="pageWhite" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>

    <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  ${
    !isFavicon
      ? isMaskable
        ? `<rect width="512" height="512" fill="#0f172a"/>`
        : `<rect width="512" height="512" rx="120" fill="url(#bgGrad)"/>`
      : ''
  }

  <g transform="${translate} scale(${scale})" filter="url(#badgeShadow)">
    <path d="M 50 370 C 130 330 200 355 256 375 C 312 355 382 330 462 370 V 170 C 382 130 312 155 256 175 C 200 155 130 130 50 170 Z"
          fill="#090d16" opacity="0.4"/>

    <path d="M 56 354 C 130 318 200 342 256 364 V 164 C 200 142 130 118 56 154 Z"
          fill="url(#pageWhite)"/>

    <rect x="96" y="200" width="116" height="12" rx="6" fill="#cbd5e1"/>
    <rect x="96" y="234" width="116" height="12" rx="6" fill="#cbd5e1"/>
    <rect x="96" y="268" width="80" height="12" rx="6" fill="#94a3b8"/>

    <path d="M 456 354 C 382 318 312 342 256 364 V 164 C 312 142 382 118 456 154 Z"
          fill="url(#brandBlue)"/>

    <rect x="300" y="200" width="116" height="12" rx="6" fill="#93c5fd" opacity="0.9"/>
    <rect x="300" y="234" width="116" height="12" rx="6" fill="#93c5fd" opacity="0.9"/>
    <rect x="336" y="268" width="80" height="12" rx="6" fill="#60a5fa" opacity="0.9"/>

    <path d="M 256 164 V 364" stroke="#1d4ed8" stroke-width="8" stroke-linecap="round"/>

    <g transform="translate(256, 170)">
      <path d="M 0 -85 C 32 -35 50 0 50 32 C 50 62 26 84 0 84 C -26 84 -50 62 -50 32 C -50 0 -32 -35 0 -85 Z"
            fill="#0f172a" opacity="0.85"/>

      <path d="M 0 -76 C 26 -30 42 0 42 28 C 42 54 22 74 0 74 C -22 74 -42 54 -42 28 C -42 0 -26 -30 0 -76 Z"
            fill="url(#flameGrad)"/>

      <path d="M 0 -44 C 16 -16 25 0 25 16 C 25 32 14 42 0 42 C -14 42 -25 32 -25 16 C -25 0 -16 -16 0 -44 Z"
            fill="#fef08a"/>
    </g>
  </g>
</svg>`;
};

const createOgImageSvg = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="accentBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#3478f6"/>
    </linearGradient>
    <linearGradient id="flame" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#ogBg)"/>

  <circle cx="1000" cy="150" r="300" fill="#3478f6" opacity="0.12" filter="blur(80px)"/>
  <circle cx="200" cy="500" r="250" fill="#f59e0b" opacity="0.08" filter="blur(80px)"/>

  <!-- Logo Emblem -->
  <g transform="translate(100, 180) scale(0.65)">
    <rect width="240" height="240" rx="52" fill="#1e293b" stroke="#334155" stroke-width="4"/>
    <!-- Book wings -->
    <path d="M 40 180 C 80 160 115 170 120 180 V 70 C 115 60 80 50 40 70 Z" fill="#ffffff"/>
    <path d="M 200 180 C 160 160 125 170 120 180 V 70 C 125 60 160 50 200 70 Z" fill="url(#accentBlue)"/>
    <path d="M 120 70 V 180" stroke="#1d4ed8" stroke-width="4"/>
    <!-- Flame -->
    <path d="M 120 70 C 132 90 140 105 140 120 C 140 135 130 148 120 148 C 110 148 100 135 100 120 C 100 105 108 90 120 70 Z" fill="url(#flame)"/>
  </g>

  <!-- Title & Description -->
  <text x="280" y="240" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="64" fill="#ffffff">BookStreak</text>
  <text x="280" y="300" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="32" fill="#60a5fa">Read every day. Finish more books.</text>
  <text x="280" y="360" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#94a3b8">Privacy-first reading habit tracker · Honest streaks · No ads · No AI</text>

  <!-- Badge Pill -->
  <rect x="280" y="415" width="340" height="48" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
  <text x="310" y="446" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="20" fill="#3478f6">🔒 Private &amp; Open Source Ready</text>
</svg>`;
};

async function generate() {
  console.log('Building TrustMRR-styled BookStreak PWA icons, favicons & OpenGraph social cards...');

  const svgStandard = createSvgIcon({ isMaskable: false, isFavicon: false });
  const svgMaskable = createSvgIcon({ isMaskable: true, isFavicon: false });
  const svgFavicon = createSvgIcon({ isMaskable: false, isFavicon: true });
  const svgOg = createOgImageSvg();

  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgStandard, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgFavicon, 'utf8');

  await sharp(Buffer.from(svgStandard)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(Buffer.from(svgStandard)).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(Buffer.from(svgMaskable)).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512-maskable.png'));
  await sharp(Buffer.from(svgStandard)).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  const faviconBuffer32 = await sharp(Buffer.from(svgFavicon)).resize(32, 32).png().toBuffer();
  const faviconBuffer48 = await sharp(Buffer.from(svgStandard)).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), faviconBuffer32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconBuffer48);

  // Generate OpenGraph (1200x630) and Twitter Card (1200x600) PNGs
  await sharp(Buffer.from(svgOg)).resize(1200, 630).png().toFile(path.join(publicDir, 'og-image.png'));
  await sharp(Buffer.from(svgOg)).resize(1200, 600).png().toFile(path.join(publicDir, 'twitter-image.png'));
  console.log('Generated public/og-image.png and public/twitter-image.png');

  console.log('All icons & social cards successfully generated!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
