import * as THREE from 'three';
import { MapEnvironmentId } from '../../types/game';

// Cache generated canvas textures to avoid memory leaks
const textureCache: Map<string, THREE.CanvasTexture> = new Map();

/**
 * Creates high-detail procedural tactical ground texture with wet puddles,
 * hazard stripes, asphalt cracks, and grates based on map environment.
 */
export function getTacticalGroundTexture(mapId: MapEnvironmentId): {
  diffuse: THREE.CanvasTexture;
  roughness: THREE.CanvasTexture;
} {
  const cacheKey = `ground_${mapId}`;
  if (textureCache.has(cacheKey) && textureCache.has(`${cacheKey}_rough`)) {
    return {
      diffuse: textureCache.get(cacheKey)!,
      roughness: textureCache.get(`${cacheKey}_rough`)!
    };
  }

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d')!;

  // Base background tones
  let baseColor = '#0f172a'; // dark slate
  let slabColor = '#1e293b';
  let accentColor = '#eab308'; // hazard yellow
  let bloodTint = false;

  if (mapId === 'bunker') {
    baseColor = '#14171c';
    slabColor = '#1e232a';
    accentColor = '#f97316';
  } else if (mapId === 'hospital') {
    baseColor = '#0d1517';
    slabColor = '#132124';
    accentColor = '#06b6d4';
  } else if (mapId === 'graveyard') {
    baseColor = '#0a100d';
    slabColor = '#121c17';
    accentColor = '#22c55e';
    bloodTint = true;
  } else if (mapId === 'cyber_facility') {
    baseColor = '#090d16';
    slabColor = '#111827';
    accentColor = '#3b82f6';
  } else if (mapId === 'volcanic_core') {
    baseColor = '#1a0b0b';
    slabColor = '#2b1010';
    accentColor = '#ef4444';
  } else if (mapId === 'desert_outpost') {
    baseColor = '#1c1917';
    slabColor = '#292524';
    accentColor = '#eab308';
  }

  // 1. Fill base ground
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);

  roughCtx.fillStyle = '#b0b0b0'; // matte rough default
  roughCtx.fillRect(0, 0, size, size);

  // 2. Concrete Tiles / Pavement Grid
  const tileSize = 128;
  ctx.strokeStyle = slabColor;
  ctx.lineWidth = 3;

  roughCtx.strokeStyle = '#505050';
  roughCtx.lineWidth = 3;

  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    roughCtx.beginPath();
    roughCtx.moveTo(x, 0);
    roughCtx.lineTo(x, size);
    roughCtx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    roughCtx.beginPath();
    roughCtx.moveTo(0, y);
    roughCtx.lineTo(size, y);
    roughCtx.stroke();
  }

  // 3. Subtle noise & asphalt grain
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  // 4. Industrial Drainage Grates
  for (let gx = 128; gx < size; gx += 384) {
    for (let gy = 128; gy < size; gy += 384) {
      ctx.fillStyle = '#05070a';
      ctx.fillRect(gx - 24, gy - 24, 48, 48);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let s = -20; s <= 20; s += 8) {
        ctx.beginPath();
        ctx.moveTo(gx + s, gy - 20);
        ctx.lineTo(gx + s, gy + 20);
        ctx.stroke();
      }
      // Metal grate has lower roughness
      roughCtx.fillStyle = '#303030';
      roughCtx.fillRect(gx - 24, gy - 24, 48, 48);
    }
  }

  // 5. Wet Puddles (Glossy, dark, mirror-like)
  const puddleCenters = [
    { x: 260, y: 310, rx: 75, ry: 45 },
    { x: 740, y: 220, rx: 90, ry: 60 },
    { x: 420, y: 780, rx: 110, ry: 55 },
    { x: 810, y: 810, rx: 80, ry: 50 },
    { x: 150, y: 700, rx: 65, ry: 40 }
  ];

  puddleCenters.forEach(p => {
    // Dark deep water on diffuse
    const grad = ctx.createRadialGradient(p.x, p.y, 5, p.x, p.y, Math.max(p.rx, p.ry));
    grad.addColorStop(0, '#030508');
    grad.addColorStop(0.7, '#070b12');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.rx, p.ry, Math.PI * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Ultra smooth mirror reflection on roughness map (black = 0 roughness = sharp reflection)
    const roughGrad = roughCtx.createRadialGradient(p.x, p.y, 5, p.x, p.y, Math.max(p.rx, p.ry));
    roughGrad.addColorStop(0, '#080808');
    roughGrad.addColorStop(0.75, '#202020');
    roughGrad.addColorStop(1, '#b0b0b0');
    roughCtx.fillStyle = roughGrad;
    roughCtx.beginPath();
    roughCtx.ellipse(p.x, p.y, p.rx, p.ry, Math.PI * 0.15, 0, Math.PI * 2);
    roughCtx.fill();
  });

  // 6. Tactical Hazard Caution Stripes (Yellow / Black or Red / Black)
  ctx.save();
  ctx.fillStyle = accentColor;
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 14;

  const drawHazardStrip = (sx: number, sy: number, w: number, h: number) => {
    ctx.fillRect(sx, sy, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, w, h);
    ctx.clip();
    for (let l = -h; l < w + h; l += 28) {
      ctx.beginPath();
      ctx.moveTo(sx + l, sy);
      ctx.lineTo(sx + l + h, sy + h);
      ctx.stroke();
    }
    ctx.restore();
  };

  drawHazardStrip(64, 48, 256, 20);
  drawHazardStrip(size - 320, size - 68, 256, 20);
  ctx.restore();

  // 7. Blood / Grime Decal Stains
  if (bloodTint) {
    ctx.fillStyle = 'rgba(80, 5, 5, 0.4)';
    ctx.beginPath();
    ctx.arc(512, 512, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  const diffTex = new THREE.CanvasTexture(canvas);
  diffTex.wrapS = THREE.RepeatWrapping;
  diffTex.wrapT = THREE.RepeatWrapping;
  diffTex.repeat.set(6, 6);

  const roughTex = new THREE.CanvasTexture(roughCanvas);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.wrapT = THREE.RepeatWrapping;
  roughTex.repeat.set(6, 6);

  textureCache.set(cacheKey, diffTex);
  textureCache.set(`${cacheKey}_rough`, roughTex);

  return { diffuse: diffTex, roughness: roughTex };
}

/**
 * Procedural Corrugated Metal Container Texture
 */
export function getContainerTexture(colorHex = '#1e3a8a'): THREE.CanvasTexture {
  const cacheKey = `container_${colorHex}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 512, 512);

  // Corrugated vertical ridges with shadow and highlight
  for (let x = 0; x < 512; x += 16) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(x, 0, 6, 512);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(x + 6, 0, 10, 512);
  }

  // Stencil Label
  ctx.save();
  ctx.font = 'bold 36px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.75;
  ctx.fillText('BIO-CORP [SEC-9]', 40, 260);
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#facc15';
  ctx.fillText('⚠ DANGER: HAZARDOUS SPECIMENS', 40, 300);
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}

/**
 * Procedural Soft Glow Particle Texture for Muzzle Flares, Tracers & Sparks
 */
export function getGlowSpriteTexture(): THREE.CanvasTexture {
  const cacheKey = 'glow_sprite';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const rad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  rad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  rad.addColorStop(0.25, 'rgba(254, 215, 170, 0.85)');
  rad.addColorStop(0.6, 'rgba(249, 115, 22, 0.35)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, 64, 64);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set(cacheKey, tex);
  return tex;
}
