/**
 * Generate Chrome Web Store cover screenshots for Element Deleter:
 *   docs/publication/screenshots/{LANG}-0.png  — 1280×800
 *
 * Cover = promo-style composition at screenshot size.
 * Scene: fake article page with an ad banner highlighted in delete mode.
 */

import { createCanvas, loadImage } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICON_PATH = path.resolve(__dirname, '../extension/icons/icon-128.png');
const OUT_DIR   = path.resolve(__dirname, '../docs/publication/screenshots');

const LANGS = {
  EN: {
    label:      'Click to delete',
    rtl:        false,
    headline:   'Breaking News: Local Story',
    adTitle:    'Special Offer — Limited Time!',
    adLink:     'Click here to learn more →',
  },
  DE: {
    label:      'Zum Löschen klicken',
    rtl:        false,
    headline:   'Aktuelle Meldung: Lokales Ereignis',
    adTitle:    'Sonderangebot — Nur kurze Zeit!',
    adLink:     'Hier klicken für mehr Infos →',
  },
  ES: {
    label:      'Clic para eliminar',
    rtl:        false,
    headline:   'Noticias: Historia Local',
    adTitle:    '¡Oferta Especial — Tiempo Limitado!',
    adLink:     'Haz clic aquí para saber más →',
  },
  FR: {
    label:      'Cliquer pour supprimer',
    rtl:        false,
    headline:   'Actualités: Événement Local',
    adTitle:    'Offre Spéciale — Durée Limitée !',
    adLink:     'Cliquez ici pour en savoir plus →',
  },
  RU: {
    label:      'Нажмите для удаления',
    rtl:        false,
    headline:   'Срочные новости: Местная история',
    adTitle:    'Акция — Только сегодня!',
    adLink:     'Нажмите, чтобы узнать больше →',
  },
  ZN: {
    label:      '点击删除',
    rtl:        false,
    headline:   '突发新闻：本地事件',
    adTitle:    '特别优惠 — 限时抢购！',
    adLink:     '点击此处了解更多 →',
  },
  AR: {
    label:      'انقر للحذف',
    rtl:        true,
    headline:   'أخبار عاجلة: قصة محلية',
    adTitle:    'عرض خاص — وقت محدود!',
    adLink:     'انقر هنا لمعرفة المزيد →',
  },
};

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

// ── Fake article page with ad banner ──────────────────────────────────────────

function drawArticlePage(ctx, x, y, w, h, bannerSlot, scale = 1, page = {}) {
  const {
    headline = 'Breaking News: Local Story',
    adTitle  = 'Special Offer — Limited Time!',
    adLink   = 'Click here to learn more →',
  } = page;
  const r = 12, s = scale;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 32; ctx.shadowOffsetY = 12;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, x, y, w, h, r); ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, r); ctx.clip();

  const barH = Math.round(36 * s);
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(x, y, w, barH);
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, y + barH); ctx.lineTo(x + w, y + barH); ctx.stroke();

  const urlX = x + Math.round(48 * s), urlW = Math.round(w * 0.58),
        urlH  = Math.round(18 * s),    urlY = y + (barH - urlH) / 2;
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, urlX, urlY, urlW, urlH, 4); ctx.fill();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1;
  roundRect(ctx, urlX, urlY, urlW, urlH, 4); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = `${Math.round(9 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('https://news-site.com/story', urlX + 6, urlY + urlH / 2);

  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#ef4444','#f59e0b','#22c55e'][i];
    ctx.beginPath();
    ctx.arc(x + Math.round((12 + i * 13) * s), y + barH / 2, Math.round(4.5 * s), 0, Math.PI * 2);
    ctx.fill();
  }

  const pad = Math.round(14 * s);
  let curY = y + barH + Math.round(10 * s);

  ctx.fillStyle = '#1e293b';
  ctx.font = `bold ${Math.round(13 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(headline, x + pad, curY);
  curY += Math.round(13 * s) + Math.round(6 * s);

  const lineH = Math.round(8 * s), lineGap = Math.round(5 * s);
  [0.90, 0.82].forEach(lw => {
    ctx.fillStyle = '#cbd5e1';
    roundRect(ctx, x + pad, curY, Math.round((w - pad * 2) * lw), lineH, 3);
    ctx.fill();
    curY += lineH + lineGap;
  });
  curY += Math.round(6 * s);

  // Ad banner
  const bx = x + pad, by = curY;
  const bw = w - pad * 2, bh = bannerSlot.h * s;

  bannerSlot.absX = bx; bannerSlot.absY = by;
  bannerSlot.absW = bw; bannerSlot.absH = bh;

  ctx.fillStyle = '#fef9c3';
  roundRect(ctx, bx, by, bw, bh, 6); ctx.fill();
  ctx.strokeStyle = '#fde68a'; ctx.lineWidth = 1;
  roundRect(ctx, bx, by, bw, bh, 6); ctx.stroke();

  const badgeFs = Math.round(8 * s);
  ctx.fillStyle = '#d97706';
  roundRect(ctx, bx + 5, by + 4, Math.round(18 * s), badgeFs + 4, 3); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = `bold ${badgeFs}px Arial`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('Ad', bx + 5 + Math.round(9 * s), by + 4 + (badgeFs + 4) / 2);

  ctx.fillStyle = '#92400e';
  ctx.font = `bold ${Math.round(10 * s)}px Arial`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(adTitle, bx + Math.round(28 * s), by + Math.round(8 * s));
  ctx.fillStyle = '#d97706'; ctx.font = `${Math.round(8.5 * s)}px Arial`;
  ctx.fillText(adLink, bx + Math.round(28 * s), by + Math.round(8 * s) + Math.round(13 * s));

  curY += bh + Math.round(8 * s);

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

// ── Delete-mode highlight overlay ─────────────────────────────────────────────

function drawDeleteHighlight(ctx, hx, hy, hw, hh, label, fontSize = 12) {
  ctx.save();
  ctx.fillStyle = 'rgba(185,28,28,0.22)';
  roundRect(ctx, hx, hy, hw, hh, 4); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(185,28,28,0.22)'; ctx.lineWidth = 14;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.strokeStyle = 'rgba(185,28,28,0.45)'; ctx.lineWidth = 6;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(185,28,28,0.90)'; ctx.lineWidth = 2;
  roundRect(ctx, hx - 2, hy - 2, hw + 4, hh + 4, 6); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = `600 ${fontSize}px ui-monospace, monospace`;
  const labelW = ctx.measureText(label).width + 12;
  const labelH = fontSize + 8;
  const lx = hx - 1;
  const ly = hy - labelH - 2;

  ctx.fillStyle = 'rgba(185,28,28,0.96)';
  roundRect(ctx, lx, ly, labelW, labelH, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.38)'; ctx.lineWidth = 1;
  roundRect(ctx, lx, ly, labelW, labelH, 4); ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, lx + 6, ly + labelH / 2);
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

// ── Cover: 1280×800 ───────────────────────────────────────────────────────────

async function genCover(iconImg, lang, outPath) {
  const W = 1280, H = 800;
  const BRAND_W = 320, SCENE_X = BRAND_W + 14;

  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');
  drawBackground(ctx, W, H, SCENE_X);

  const iconSz = 140, textGap = 30, fontSize = 30;
  const brandH = iconSz + textGap + fontSize * 2 + 3;
  const brandCY = Math.round((H - brandH) / 2 + iconSz / 2);
  drawBrand(ctx, iconImg, Math.round(BRAND_W / 2), brandCY, iconSz, fontSize, textGap);

  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(SCENE_X - 6, 36); ctx.lineTo(SCENE_X - 6, H - 36); ctx.stroke();

  const sceneW = W - SCENE_X;
  const pageX = SCENE_X + 12, pageY = 32, pageW = sceneW - 22, pageH = H - 64;
  const bannerSlot = { h: 90 };
  drawArticlePage(ctx, pageX, pageY, pageW, pageH, bannerSlot, 1.8, lang);

  drawDeleteHighlight(ctx,
    bannerSlot.absX, bannerSlot.absY,
    bannerSlot.absW, bannerSlot.absH,
    lang.label, 14
  );

  drawCursor(ctx,
    bannerSlot.absX + bannerSlot.absW * 0.62,
    bannerSlot.absY + bannerSlot.absH * 0.50,
    34
  );

  saveRGB(canvas, outPath);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const iconImg = await loadImage(ICON_PATH);

  for (const [code, lang] of Object.entries(LANGS)) {
    console.log(`Generating ${code}-0.png…`);
    await genCover(iconImg, lang, path.join(OUT_DIR, `${code}-0.png`));
  }

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
