import { DropItem } from '../types/game';

interface RenderDropsParams {
  ctx: CanvasRenderingContext2D;
  drops: DropItem[];
  time: number;
}

export function renderDrops({ ctx, drops, time }: RenderDropsParams) {
  drops.forEach(item => {
    ctx.save();

    // Calculate vertical hover / bounce offset
    const bounceOffset = item.bounceZ ? -item.bounceZ : Math.sin(item.pulse) * 4 - 3;
    const itemX = item.x;
    const itemY = item.y;

    // 1. Realistic Soft Drop Shadow on the ground
    const shadowScale = item.bounceZ ? Math.max(0.4, 1 - item.bounceZ / 60) : (1 + Math.sin(item.pulse) * 0.15);
    const shadowAlpha = item.bounceZ ? Math.max(0.15, 0.45 - item.bounceZ / 100) : 0.35;
    
    ctx.save();
    ctx.translate(itemX, itemY + 6);
    ctx.beginPath();
    ctx.ellipse(0, 0, item.radius * 0.95 * shadowScale, item.radius * 0.45 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();

    // 2. Translate to hovering item position
    ctx.translate(itemX, itemY + bounceOffset);

    if (item.type === 'gold_coin') {
      renderGoldCoin(ctx, item, time);
    } else if (item.type === 'gold_ingot') {
      renderGoldIngot(ctx, item, time);
    } else if (item.type === 'coin_bag') {
      renderGoldCoinBag(ctx, item, time);
    } else if (item.type === 'diamond_gem') {
      renderDiamondGem(ctx, item, time);
    } else if (item.type === 'boss_chest') {
      renderBossChest(ctx, item, time);
    } else {
      renderTacticalPowerUp(ctx, item, time);
    }

    ctx.restore();
  });
}

// ----------------------------------------------------
// 1. RENDER 2.5D SHINING GOLD COIN (Rotating 3D coin)
// ----------------------------------------------------
function renderGoldCoin(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const rotationPhase = (time * 0.0035 + (item.pulse * 0.5)) % (Math.PI * 2);
  const cosRot = Math.cos(rotationPhase);
  const coinWidth = Math.max(2.5, Math.abs(cosRot) * item.radius);
  const coinHeight = item.radius * 1.05;

  // Outer Golden Light Flare / Halo
  const haloGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, item.radius * 1.8);
  haloGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
  haloGrad.addColorStop(0.5, 'rgba(234, 179, 8, 0.15)');
  haloGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(0, 0, item.radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  // 3D Coin Edge / Thickness (when angled)
  if (Math.abs(cosRot) < 0.95) {
    const edgeOffset = cosRot >= 0 ? -2.5 : 2.5;
    ctx.fillStyle = '#b45309'; // Dark bronze/gold edge
    ctx.beginPath();
    ctx.ellipse(edgeOffset, 0, coinWidth, coinHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Connecting edge quad
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.rect(Math.min(0, edgeOffset), -coinHeight, Math.abs(edgeOffset), coinHeight * 2);
    ctx.fill();
  }

  // Front Coin Face
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, coinWidth, coinHeight, 0, 0, Math.PI * 2);

  // Metallic Golden Gradient
  const coinGrad = ctx.createLinearGradient(-coinWidth, -coinHeight, coinWidth, coinHeight);
  coinGrad.addColorStop(0, '#fef08a'); // Highlight
  coinGrad.addColorStop(0.3, '#facc15'); // Rich gold
  coinGrad.addColorStop(0.7, '#eab308'); // Warm amber gold
  coinGrad.addColorStop(1, '#ca8a04'); // Deep gold
  ctx.fillStyle = coinGrad;
  ctx.fill();

  // Coin Border Ring
  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner Embossed Star or Skull Icon if face is visible enough
  if (Math.abs(cosRot) > 0.4) {
    ctx.fillStyle = '#854d0e';
    ctx.font = `bold ${Math.round(item.radius * 0.9)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    // Sparkle sheen across coin face
    const glintProgress = (time * 0.003 + item.pulse) % 2;
    if (glintProgress < 0.8) {
      const glintX = -coinWidth + glintProgress * (coinWidth * 2.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(glintX, -coinHeight * 0.7);
      ctx.lineTo(glintX + 4, coinHeight * 0.7);
      ctx.stroke();
    }
  }

  ctx.restore();

  // Orbiting Golden Sparkles
  for (let s = 0; s < 2; s++) {
    const sAngle = time * 0.004 + (s * Math.PI) + item.pulse;
    const sDist = item.radius * 1.3 + Math.sin(time * 0.005 + s) * 3;
    const sx = Math.cos(sAngle) * sDist;
    const sy = Math.sin(sAngle) * (sDist * 0.6);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ----------------------------------------------------
// 2. RENDER 2.5D HEAVY GOLD INGOT / BAR
// ----------------------------------------------------
function renderGoldIngot(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const w = item.radius * 1.5;
  const h = item.radius * 0.9;
  const depth = 6;

  // Gold Glow
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, item.radius * 2);
  glow.addColorStop(0, 'rgba(250, 204, 21, 0.5)');
  glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, item.radius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Bottom / Side Bevels
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(w / 2 - 3, h / 2 + depth);
  ctx.lineTo(-w / 2 + 3, h / 2 + depth);
  ctx.closePath();
  ctx.fill();

  // Main Top Trapezoid Face
  ctx.save();
  const ingotGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
  ingotGrad.addColorStop(0, '#fef08a');
  ingotGrad.addColorStop(0.35, '#facc15');
  ingotGrad.addColorStop(0.8, '#eab308');
  ingotGrad.addColorStop(1, '#a16207');

  ctx.fillStyle = ingotGrad;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + 3, -h / 2);
  ctx.lineTo(w / 2 - 3, -h / 2);
  ctx.lineTo(w / 2, h / 2);
  ctx.lineTo(-w / 2, h / 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#fef9c3';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Ingot Stamp: 999.9 GOLD
  ctx.fillStyle = '#713f12';
  ctx.font = 'bold 8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('999.9', 0, 0);

  ctx.restore();
}

// ----------------------------------------------------
// 3. RENDER HEAVY GOLD COIN BAG (Sack of Gold)
// ----------------------------------------------------
function renderGoldCoinBag(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const r = item.radius * 1.1;

  // Golden Glow
  const glow = ctx.createRadialGradient(0, 0, 6, 0, 0, r * 2.2);
  glow.addColorStop(0, 'rgba(250, 204, 21, 0.6)');
  glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Leather Pouch Body
  const bagGrad = ctx.createRadialGradient(-3, -3, 2, 0, 2, r * 1.2);
  bagGrad.addColorStop(0, '#d97706');
  bagGrad.addColorStop(0.5, '#b45309');
  bagGrad.addColorStop(1, '#78350f');

  ctx.fillStyle = bagGrad;
  ctx.beginPath();
  ctx.arc(0, 4, r * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Bag Tied Neck & Ruffle
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.moveTo(-r * 0.45, -r * 0.5);
  ctx.lineTo(r * 0.45, -r * 0.5);
  ctx.lineTo(r * 0.65, -r * 0.9);
  ctx.lineTo(-r * 0.65, -r * 0.9);
  ctx.closePath();
  ctx.fill();

  // Golden Rope Tie
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.5, r * 0.4, 2.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Gold Dollar / Currency Badge
  ctx.fillStyle = '#fef08a';
  ctx.font = `bold ${Math.round(r * 0.75)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 0, 4);
}

// ----------------------------------------------------
// 4. RENDER TACTICAL POWER-UP CRATES & VIALS
// ----------------------------------------------------
function renderTacticalPowerUp(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const r = item.radius;

  // Aura Ring
  const auraColor = item.type === 'medkit' ? '#4ade80' : 
                    item.type === 'nuke' ? '#f59e0b' : 
                    item.type === 'double_damage' ? '#ef4444' : 
                    item.type === 'freeze' ? '#38bdf8' : 
                    item.type === 'shield' ? '#818cf8' : 
                    item.type === 'speed_boost' ? '#eab308' : 
                    item.type === 'turret' ? '#10b981' : '#38bdf8';

  // Pulsing Ring
  ctx.beginPath();
  ctx.arc(0, 0, r + 6 + Math.sin(time * 0.006 + item.pulse) * 2, 0, Math.PI * 2);
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dark Tactical Capsule
  const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, r);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Icon Display
  ctx.font = `${Math.round(r * 1.1)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let icon = '📦';
  if (item.type === 'medkit') icon = '❤️';
  else if (item.type === 'ammo') icon = '📦';
  else if (item.type === 'nuke') icon = '☢️';
  else if (item.type === 'double_damage') icon = '🔥';
  else if (item.type === 'speed_boost') icon = '⚡';
  else if (item.type === 'freeze') icon = '❄️';
  else if (item.type === 'shield') icon = '🛡️';
  else if (item.type === 'turret') icon = '🤖';

  ctx.fillText(icon, 0, 1);
}

// ----------------------------------------------------
// 5. RENDER SHINING DIAMOND / BOSS GEM
// ----------------------------------------------------
function renderDiamondGem(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const r = item.radius * 1.1;

  // Blue / Cyan Diamond Halo
  const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 2.2);
  halo.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
  halo.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
  halo.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Diamond Octagon / Faceted Prism
  ctx.save();
  ctx.rotate(Math.sin(time * 0.003 + item.pulse) * 0.15);

  // Diamond Polygon
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.9, -r * 0.2);
  ctx.lineTo(0, r * 1.1);
  ctx.lineTo(-r * 0.9, -r * 0.2);
  ctx.closePath();

  const gemGrad = ctx.createLinearGradient(-r, -r, r, r);
  gemGrad.addColorStop(0, '#e0f2fe');
  gemGrad.addColorStop(0.3, '#38bdf8');
  gemGrad.addColorStop(0.7, '#0284c7');
  gemGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = gemGrad;
  ctx.fill();

  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Internal facets
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(0, r * 1.1);
  ctx.moveTo(-r * 0.9, -r * 0.2);
  ctx.lineTo(r * 0.9, -r * 0.2);
  ctx.moveTo(-r * 0.5, -r * 0.6);
  ctx.lineTo(r * 0.5, -r * 0.6);
  ctx.stroke();

  // Sparkle glint
  const glint = (Math.sin(time * 0.006 + item.pulse) + 1) / 2;
  ctx.fillStyle = `rgba(255, 255, 255, ${glint})`;
  ctx.beginPath();
  ctx.arc(0, -r * 0.3, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------
// 6. RENDER LEGENDARY BOSS LOOT CHEST
// ----------------------------------------------------
function renderBossChest(ctx: CanvasRenderingContext2D, item: DropItem, time: number) {
  const w = item.radius * 2;
  const h = item.radius * 1.5;

  // Golden / Amber Epic Aura
  const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, item.radius * 2.5);
  aura.addColorStop(0, 'rgba(245, 158, 11, 0.65)');
  aura.addColorStop(0.6, 'rgba(217, 119, 6, 0.2)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, item.radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Chest Base Body (Reinforced Dark Wood & Gold Inlay)
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 4);
  ctx.fill();

  // Metallic Gold Corner Braces
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Chest Lid Line
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-w / 2, -h * 0.1);
  ctx.lineTo(w / 2, -h * 0.1);
  ctx.stroke();

  // Golden Lock Plate with Ruby Gem
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Floating Crown / Star above chest
  const bob = Math.sin(time * 0.005) * 3;
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👑', 0, -h / 2 - 8 + bob);
}
