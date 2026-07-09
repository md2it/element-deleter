/**
 * Generate Chrome Web Store promo tiles for Element Deleter:
 *   docs/publication/promo-small.png    — 440×280
 *   docs/publication/promo-marquee.png  — 1400×560
 *
 * Scene: a fake article page with an ad banner highlighted in delete mode
 * (red outline + fill + label — exact colors from the real app).
 * Small: compact banner. Marquee: large leaderboard banner.
 */

import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICON_PATH = path.resolve(__dirname, '../extension/icons/icon-128.png');
const OUT_DIR   = path.resolve(__dirname, '../docs/publication');

// Brand color (from real app: #b91c1c — red-700)
const BRAND_RED = '#b91c1c';

// ── Background ────────────────────────────────────────────────────────────────

function drawBackground(ctx, W, H, sceneX) {
  const base = ctx.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#0b0f1a');
  base.addColorStop(1, '#131c2e');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const gx = sceneX + (W - sceneX) * 0.5, gy = H * 0.42;
  const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(W, H) * 0.55);
  glow.addColorStop(0,   'rgba(185,28,28,0.12)');
  glow.addColorStop(0.5, 'rgba(185,28,28,0.04)');
  glow.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

// ── Primitives ─────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,   r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r,     r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y,     x + r, y,          r);
  ctx.closePath();
}

// ── Cursor ─────────────────────────────────────────────────────────────────────

function drawCursor(ctx, cx, cy, size = 20, alpha = 1) {
  const s = size / 24;
  const ox = cx - 4 * s, oy = cy - 4 * s;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle   = '#ff6060';
  ctx.strokeStyle = 'rgba(255,140,140,0.55)';
  ctx.lineWidth   = 1.0 * (size / 20);
  ctx.beginPath();
  ctx.moveTo(ox +  4    * s, oy +  4    * s);
  ctx.lineTo(ox + 11.07 * s, oy + 21    * s);
  ctx.lineTo(ox + 13.58 * s, oy + 13.61 * s);
  ctx.lineTo(ox + 21    * s, oy + 11.07 * s);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

// ── Brand zone ─────────────────────────────────────────────────────────────────

function drawBrand(ctx, iconImg, cx, cy, iconSize, nameFontSize, textGap) {
  const cr = iconSize * 0.20;

  const glowLayers = [
    { expand: 22, alpha: 0.04, color: '255,170,170' },
    { expand: 15, alpha: 0.09, color: '255,150,150' },
    { expand:  9, alpha: 0.17, color: '255,140,140' },
    { expand:  4, alpha: 0.28, color: '255,130,130' },
    { expand:  1, alpha: 0.42, color: '255,120,120' },
  ];
  for (const { expand: ex, alpha, color } of glowLayers) {
    ctx.save();
    ctx.fillStyle = `rgba(${color},${alpha})`;
    roundRect(ctx,
      cx - iconSize / 2 - ex, cy - iconSize / 2 - ex,
      iconSize + ex * 2,      iconSize + ex * 2,
      cr + ex * 0.7
    );
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  roundRect(ctx, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize, cr);
  ctx.clip();
  ctx.drawImage(iconImg, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize);
  ctx.restore();

  const textY = cy + iconSize / 2 + textGap;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${nameFontSize}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText('ELEMENT', cx, textY);
  ctx.fillText('DELETER', cx, textY + nameFontSize + 3);
  ctx.restore();
}

// ── Fake article page (light card) with ad banner ─────────────────────────────

/**
 * bannerRect: { x, y, w, h } relative to page card — filled in by caller.
 * Returns absolute coords of banner area.
 */
function drawArticlePage(ctx, x, y, w, h, bannerSlot, scale = 1) {
  const r = 12;
  const s = scale;

  // Card shadow + fill
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 32; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, r); ctx.clip();

  // Browser chrome bar
  const barH = Math.round(36 * s);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x, y, w, barH);
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y + barH); ctx.lineTo(x + w, y + barH); ctx.stroke();

  // URL bar
  const urlX = x + Math.round(48 * s), urlW = Math.round(w * 0.58), urlH = Math.round(18 * s), urlY = y + (barH - urlH) / 2;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, urlX, urlY, urlW, urlH, 4); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  roundRect(ctx, urlX, urlY, urlW, urlH, 4); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = `${Math.round(9 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('https://news-site.com/story', urlX + 6, urlY + urlH / 2);

  // Nav dots
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#ef4444','#f59e0b','#22c55e'][i];
    ctx.beginPath();
    ctx.arc(x + Math.round((12 + i * 13) * s), y + barH / 2, Math.round(4.5 * s), 0, Math.PI * 2);
    ctx.fill();
  }

  const pad = Math.round(14 * s);
  let curY = y + barH + Math.round(10 * s);

  // Page headline
  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${Math.round(13 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Breaking News: Local Story', x + pad, curY);
  curY += Math.round(13 * s) + Math.round(6 * s);

  // Short paragraph
  const lineH = Math.round(8 * s), lineGap = Math.round(5 * s);
  [0.90, 0.82].forEach(lw => {
    ctx.fillStyle = '#cbd5e1';
    roundRect(ctx, x + pad, curY, Math.round((w - pad * 2) * lw), lineH, 3);
    ctx.fill();
    curY += lineH + lineGap;
  });
  curY += Math.round(6 * s);

  // AD BANNER block — position/size driven by bannerSlot
  const bx = x + pad, by = curY;
  const bw = w - pad * 2, bh = bannerSlot.h * s;

  // Store absolute coords for highlight caller
  bannerSlot.absX = bx; bannerSlot.absY = by;
  bannerSlot.absW = bw; bannerSlot.absH = bh;

  // Ad background — slightly warm to read as an ad
  ctx.fillStyle = '#fef9c3'; // light yellow
  roundRect(ctx, bx, by, bw, bh, 6); ctx.fill();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1;
  roundRect(ctx, bx, by, bw, bh, 6); ctx.stroke();

  // "Ad" badge
  const badgeFs = Math.round(8 * s);
  ctx.fillStyle = '#d97706';
  roundRect(ctx, bx + 5, by + 4, Math.round(18 * s), badgeFs + 4, 3); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = `bold ${badgeFs}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Ad', bx + 5 + Math.round(9 * s), by + 4 + (badgeFs + 4) / 2);

  // Ad text lines
  ctx.fillStyle = '#92400e';
  ctx.font = `bold ${Math.round(10 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('Special Offer — Limited Time!', bx + Math.round(28 * s), by + Math.round(8 * s));
  ctx.fillStyle = '#d97706'; ctx.font = `${Math.round(8.5 * s)}px Arial`;
  ctx.fillText('Click here to learn more →', bx + Math.round(28 * s), by + Math.round(8 * s) + Math.round(13 * s));

  curY += bh + Math.round(8 * s);

  // More content below the banner
  [0.78, 0.85, 0.60].forEach(lw => {
    if (curY + lineH < y + h - 10) {
      ctx.fillStyle = '#cbd5e1';
      roundRect(ctx, x + pad, curY, Math.round((w - pad * 2) * lw), lineH, 3);
      ctx.fill();
      curY += lineH + lineGap;
    }
  });

  ctx.restore();
}

// ── Delete-mode highlight overlay (from real app CSS) ─────────────────────────
//
// outline: 2px solid #b91c1c
// background: rgba(185,28,28,0.22)
// glow: pulsing rgba(185,28,28,0.45/.22)
// label bg: rgba(185,28,28,0.96)  white text

function drawDeleteHighlight(ctx, hx, hy, hw, hh, label, fontSize = 10) {
  // Fill overlay
  ctx.save();
  ctx.fillStyle = 'rgba(185,28,28,0.22)';
  roundRect(ctx, hx, hy, hw, hh, 4); ctx.fill();
  ctx.restore();

  // Glow
  ctx.save();
  ctx.strokeStyle = 'rgba(185,28,28,0.22)'; ctx.lineWidth = 12;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.strokeStyle = 'rgba(185,28,28,0.45)'; ctx.lineWidth = 5;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.restore();

  // Outline — 2px solid #b91c1c + outline-offset: 2px
  ctx.save();
  ctx.strokeStyle = 'rgba(185,28,28,0.90)'; ctx.lineWidth = 2;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.restore();

  // Label badge
  ctx.save();
  ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
  const labelW = ctx.measureText(label).width + 10;
  const labelH = fontSize + 6;
  const lx = hx - 1;
  const ly = hy - labelH - 2;

  ctx.fillStyle = 'rgba(185,28,28,0.96)';
  roundRect(ctx, lx, ly, labelW, labelH, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.38)'; ctx.lineWidth = 1;
  roundRect(ctx, lx, ly, labelW, labelH, 4); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, lx + 5, ly + labelH / 2);
  ctx.restore();
}

// ── Save as 24-bit RGB PNG ─────────────────────────────────────────────────────

function saveRGB(canvas, outPath) {
  const rgb  = createCanvas(canvas.width, canvas.height);
  const rctx = rgb.getContext('2d');
  rctx.fillStyle = '#0b0f1a'; rctx.fillRect(0, 0, canvas.width, canvas.height);
  rctx.drawImage(canvas, 0, 0);
  fs.writeFileSync(outPath, rgb.toBuffer('image/png'));
  console.log(`Saved ${outPath}`);
}

// ── Small tile: 440×280 — compact banner ──────────────────────────────────────

async function genSmall(iconImg, outPath) {
  const W = 440, H = 280;
  const BRAND_W = 164, SCENE_X = BRAND_W + 8;

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');
  drawBackground(ctx, W, H, SCENE_X);

  // Brand
  const iconSz = 80, textGap = 24, fontSize = 15;
  const brandH = iconSz + textGap + fontSize * 2 + 3;
  const brandCY = Math.round((H - brandH) / 2 + iconSz / 2);
  drawBrand(ctx, iconImg, Math.round(BRAND_W / 2), brandCY, iconSz, fontSize, textGap);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(SCENE_X - 3, 22); ctx.lineTo(SCENE_X - 3, H - 22); ctx.stroke();

  // Article page — small banner (h=36 at scale 1)
  const sceneW = W - SCENE_X;
  const pageX = SCENE_X + 6, pageY = 18, pageW = sceneW - 10, pageH = H - 36;
  const bannerSlot = { h: 36 };
  drawArticlePage(ctx, pageX, pageY, pageW, pageH, bannerSlot, 0.88);

  // Highlight the banner
  drawDeleteHighlight(ctx,
    bannerSlot.absX, bannerSlot.absY,
    bannerSlot.absW, bannerSlot.absH,
    'Click to delete', 9
  );

  // Cursor over banner
  drawCursor(ctx,
    bannerSlot.absX + bannerSlot.absW * 0.60,
    bannerSlot.absY + bannerSlot.absH * 0.50,
    18
  );

  saveRGB(canvas, outPath);
}

// ── Marquee tile: 1400×560 — large banner ────────────────────────────────────

async function genMarquee(iconImg, outPath) {
  const W = 1400, H = 560;
  const BRAND_W = 340, SCENE_X = BRAND_W + 14;

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');
  drawBackground(ctx, W, H, SCENE_X);

  // Brand
  const iconSz = 130, textGap = 28, fontSize = 28;
  const brandH = iconSz + textGap + fontSize * 2 + 3;
  const brandCY = Math.round((H - brandH) / 2 + iconSz / 2);
  drawBrand(ctx, iconImg, Math.round(BRAND_W / 2), brandCY, iconSz, fontSize, textGap);

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(SCENE_X - 6, 34); ctx.lineTo(SCENE_X - 6, H - 34); ctx.stroke();

  // Article page — large banner (h=80 at scale 1)
  const sceneW = W - SCENE_X;
  const pageX = SCENE_X + 10, pageY = 28, pageW = sceneW - 20, pageH = H - 56;
  const bannerSlot = { h: 80 };
  drawArticlePage(ctx, pageX, pageY, pageW, pageH, bannerSlot, 1.6);

  // Highlight the banner
  drawDeleteHighlight(ctx,
    bannerSlot.absX, bannerSlot.absY,
    bannerSlot.absW, bannerSlot.absH,
    'Click to delete', 14
  );

  // Cursor over banner
  drawCursor(ctx,
    bannerSlot.absX + bannerSlot.absW * 0.62,
    bannerSlot.absY + bannerSlot.absH * 0.50,
    30
  );

  saveRGB(canvas, outPath);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const iconImg = await loadImage(ICON_PATH);
  console.log('Generating promo-small.png (440×280)…');
  await genSmall(iconImg, path.join(OUT_DIR, 'promo-small.png'));
  console.log('Generating promo-marquee.png (1400×560)…');
  await genMarquee(iconImg, path.join(OUT_DIR, 'promo-marquee.png'));
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
