import { PlayerStats, Weapon, ActiveBuffs, Obstacle, Zombie, EquipmentSlotId } from '../types/game';
import { WARRIOR_CLASSES } from '../data/warriors';

interface RenderWarriorParams {
  ctx: CanvasRenderingContext2D;
  player: PlayerStats;
  weapon: Weapon;
  activeBuffs: ActiveBuffs;
  time: number;
  isFiring: boolean;
  obstacles: Obstacle[];
  zombies: Zombie[];
}

/**
 * Utility to draw rounded rectangles safely across all browser canvas contexts
 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number = 3
) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}

export const renderWarrior = ({
  ctx,
  player: p,
  weapon: wep,
  activeBuffs,
  time,
  isFiring,
  obstacles,
  zombies
}: RenderWarriorParams) => {
  ctx.save();
  ctx.translate(p.x, p.y);

  // Find Warrior Skin Config & Equipment
  const warriorSkinId = p.warriorSkin || 'commando';
  const warriorConfig = WARRIOR_CLASSES.find(w => w.id === warriorSkinId) || WARRIOR_CLASSES[0];
  const eq = (p.equipment || {}) as Record<EquipmentSlotId, number>;
  const armorTier = eq.armor || 0;
  const helmetTier = eq.helmet || 0;
  const bootsTier = eq.boots || 0;
  const backpackTier = eq.backpack || 0;
  const glovesTier = eq.gloves || 0;
  const visorTier = eq.visor || 0;

  // 1. DASH GHOSTING TRAILS
  if (p.isDashing) {
    const ghostColor = warriorConfig.accentColor;
    for (let i = 1; i <= 3; i++) {
      ctx.save();
      ctx.rotate(p.angle);
      ctx.fillStyle = ghostColor;
      ctx.globalAlpha = 0.40 / i;
      ctx.beginPath();
      ctx.arc(-i * 16, 0, p.radius * (1 - i * 0.12), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 2. AAA REALISTIC DIRECTIONAL AMBIENT OCCLUSION & DROP SHADOW
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.ellipse(3, 8, p.radius * 1.35, p.radius * 0.92, 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Core dense shadow right under center of mass
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(1, 3, p.radius * 0.95, p.radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. FLASHLIGHT VOLUMETRIC CONE LIGHT WITH MULTI-LAYER GLOW
  ctx.save();
  ctx.rotate(p.angle);

  const flashlightRange = wep.id === 'sniper' ? 580 : 480;
  const flashlightWidth = wep.id === 'sniper' ? 0.28 : 0.44;

  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, flashlightRange);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
  grad.addColorStop(0.2, 'rgba(254, 240, 138, 0.28)');
  grad.addColorStop(0.6, 'rgba(254, 240, 138, 0.08)');
  grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.arc(14, 0, flashlightRange, -flashlightWidth, flashlightWidth);
  ctx.closePath();
  ctx.fill();

  // Volumetric atmospheric light motes in flashlight beam
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  for (let i = 0; i < 5; i++) {
    const speckDist = 50 + ((time * 0.06 + i * 95) % (flashlightRange - 60));
    const speckOffset = Math.sin(time * 0.003 + i * 2.1) * (speckDist * 0.14);
    ctx.beginPath();
    ctx.arc(speckDist, speckOffset, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. PRECISION TACTICAL LASER SIGHT & TARGET INTERSECTION
  ctx.save();
  ctx.rotate(p.angle);
  const laserColor = warriorConfig.laserColor;
  let laserDist = 680;

  const pCos = Math.cos(p.angle);
  const pSin = Math.sin(p.angle);
  const gunMuzzleX = p.x + pCos * 26;
  const gunMuzzleY = p.y + pSin * 26;

  // Detect zombies in laser line
  let hitZombie = false;
  for (const z of zombies) {
    if (z.hp <= 0) continue;
    const toZx = z.x - gunMuzzleX;
    const toZy = z.y - gunMuzzleY;
    const dot = toZx * pCos + toZy * pSin;
    if (dot > 0 && dot < laserDist) {
      const perpDist = Math.abs(toZx * -pSin + toZy * pCos);
      if (perpDist < z.radius) {
        laserDist = Math.max(14, dot - z.radius * 0.6);
        hitZombie = true;
      }
    }
  }

  // Detect obstacles in laser line
  for (const obs of obstacles) {
    if ((obs.hp || 1) <= 0) continue;
    const obsCenterX = obs.x + obs.width / 2;
    const obsCenterY = obs.y + obs.height / 2;
    const toObsX = obsCenterX - gunMuzzleX;
    const toObsY = obsCenterY - gunMuzzleY;
    const dot = toObsX * pCos + toObsY * pSin;
    if (dot > 0 && dot < laserDist) {
      const perpDist = Math.abs(toObsX * -pSin + toObsY * pCos);
      if (perpDist < (obs.width + obs.height) / 4) {
        laserDist = Math.max(14, dot - obs.width / 3);
      }
    }
  }

  // Laser beam line (tactical dashed with solid laser core)
  ctx.strokeStyle = laserColor;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.0;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(24, 3);
  ctx.lineTo(laserDist, 3);
  ctx.stroke();
  ctx.setLineDash([]);

  // Laser target dot with glow & target hit ripple
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = laserColor;
  ctx.shadowColor = laserColor;
  ctx.shadowBlur = hitZombie ? 16 : 9;
  ctx.beginPath();
  ctx.arc(laserDist, 3, hitZombie ? 3.8 : 2.6, 0, Math.PI * 2);
  ctx.fill();

  if (hitZombie) {
    // Pulse target ring
    const ringR = 4 + (Math.sin(time * 0.02) + 1) * 3;
    ctx.strokeStyle = laserColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(laserDist, 3, ringR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();

  // 5. 2.5D PERSPECTIVE WARRIOR RENDERING (ROTATED TO PLAYER AIM ANGLE)
  ctx.save();
  ctx.rotate(p.angle);

  const walkCycle = p.walkFrame || 0;
  const isMoving = Math.abs(Math.sin(walkCycle)) > 0.05;
  const stride = Math.sin(walkCycle) * 9;
  const bobbing = Math.abs(Math.cos(walkCycle)) * 1.8;
  const idleBreathing = Math.sin(time * 0.003) * 0.8;

  // 5.1 COMBAT BOOTS & ARTICULATED LEGS
  // Left Leg / Combat Boot
  ctx.fillStyle = '#090d16'; // Deep tactical black
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;

  drawRoundRect(ctx, -7 + stride, -15, 14, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // Left boot toe cap & tread grooves
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(4 + stride, -14.5, 3, 7);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6 + stride, -14, 2, 6);
  ctx.fillRect(-2 + stride, -14, 2, 6);

  // Right Leg / Combat Boot (opposite stride phase)
  ctx.fillStyle = '#090d16';
  drawRoundRect(ctx, -7 - stride, 7, 14, 8, 3.5);
  ctx.fill();
  ctx.stroke();

  // Right boot toe cap & tread grooves
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(4 - stride, 7.5, 3, 7);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6 - stride, 8, 2, 6);
  ctx.fillRect(-2 - stride, 8, 2, 6);

  // High-Tech Knee Armor Pads (articulated with class-specific accent plates)
  ctx.fillStyle = warriorConfig.primaryColor;
  drawRoundRect(ctx, -1 + stride, -14, 5.5, 6, 1.5);
  ctx.fill();
  drawRoundRect(ctx, -1 - stride, 8, 5.5, 6, 1.5);
  ctx.fill();

  // Boots Equipment Upgrade Thrusters / Kinetic Plates
  if (bootsTier > 0) {
    ctx.fillStyle = bootsTier >= 3 ? '#818cf8' : '#38bdf8';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 6;
    ctx.fillRect(-7 + stride, -13, 2, 4);
    ctx.fillRect(-7 - stride, 9, 2, 4);
    ctx.shadowBlur = 0;
  }

  // 5.2 THIGH HOLSTER (RIGHT) & COMBAT KNIFE SHEATH (LEFT)
  // Tactical Holster on Right Thigh with Sidearm
  ctx.fillStyle = '#1e293b';
  drawRoundRect(ctx, -5 - stride * 0.4, 14, 9, 5, 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a'; // Pistol grip peeking out
  ctx.fillRect(-7 - stride * 0.4, 15, 3, 3);

  // Combat Knife Sheath on Left Thigh
  ctx.fillStyle = '#1e293b';
  drawRoundRect(ctx, -4 + stride * 0.4, -19, 8, 4.5, 2);
  ctx.fill();
  ctx.fillStyle = '#94a3b8'; // Metal hilt pommel
  ctx.fillRect(-6 + stride * 0.4, -18, 2.5, 2.5);

  // 5.3 ASSAULT BACKPACK, POWER PACK & TACTICAL COMMS SUITE
  ctx.save();
  const backpackW = 10 + (backpackTier >= 2 ? 3 : 0);
  const backpackH = 22 + (backpackTier >= 2 ? 4 : 0);

  ctx.fillStyle = '#182234';
  drawRoundRect(ctx, -19 - (backpackTier >= 2 ? 3 : 0), -backpackH / 2, backpackW, backpackH, 4.5);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Backpack Molle straps & buckles
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-17, -8, 2, 16);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(-16, -6, 1.5, 3);
  ctx.fillRect(-16, 3, 1.5, 3);

  // Radio Whip Antenna / Cyber Exoskeleton Power Conduits
  if (warriorSkinId === 'cyber' || backpackTier >= 3) {
    // Glowing Cyber Power Cell with pulsing heat sinks
    const cellPulse = 0.7 + Math.sin(time * 0.008) * 0.3;
    ctx.fillStyle = warriorConfig.accentColor;
    ctx.shadowColor = warriorConfig.accentColor;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = cellPulse;
    ctx.fillRect(-21, -5, 3, 10);
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  } else {
    // Long flexible military whip antenna
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-16, -7);
    ctx.lineTo(-28, -13);
    ctx.stroke();

    // Antenna status beacon LED (blinking military data link)
    const isLedOn = Math.floor(time / 450) % 2 === 0;
    ctx.fillStyle = isLedOn ? warriorConfig.accentColor : '#0f172a';
    ctx.shadowColor = warriorConfig.accentColor;
    ctx.shadowBlur = isLedOn ? 8 : 0;
    ctx.beginPath();
    ctx.arc(-28, -13, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // 5.4 MAIN TORSO: UNDER-SUIT & TACTICAL BALLISTIC PLATE CARRIER
  // Base Under-suit (Dark Charcoal Nomex)
  ctx.fillStyle = '#0b1120';
  ctx.beginPath();
  ctx.arc(0, 0, 16.5, 0, Math.PI * 2);
  ctx.fill();

  // Ballistic Plate Carrier Vest (Heavy 3D Layered Look)
  ctx.fillStyle = warriorConfig.primaryColor;
  drawRoundRect(ctx, -10, -12, 20, 24, 6);
  ctx.fill();
  ctx.strokeStyle = warriorConfig.accentColor;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // High-Grade Ceramic Chest Strike-Face Plate with Laser-Cut MOLLE Webbing
  ctx.fillStyle = '#1e293b';
  drawRoundRect(ctx, -6, -9, 13, 18, 3.5);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // MOLLE Grid Slots
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5, -5); ctx.lineTo(6, -5);
  ctx.moveTo(-5, -1); ctx.lineTo(6, -1);
  ctx.moveTo(-5, 3);  ctx.lineTo(6, 3);
  ctx.moveTo(-5, 7);  ctx.lineTo(6, 7);
  ctx.stroke();

  // 3 STANAG Rifle Magazine Pouches with Brass 5.56 Ammo Tips
  for (let m = 0; m < 3; m++) {
    const magY = -7 + m * 5.5;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(4, magY, 5, 4);
    // Brass bullet tip peeking out
    ctx.fillStyle = '#eab308';
    ctx.fillRect(7.5, magY + 1, 1.8, 2);
  }

  // Tactical Radio (PRC-152) & Push-to-Talk (PTT) Unit on Left Chest
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-8, -10, 4, 7);
  ctx.fillStyle = '#38bdf8'; // Radio display LCD
  ctx.fillRect(-7.5, -9, 3, 2.5);
  ctx.strokeStyle = '#1e293b'; // Coiled comms cable
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6, -6.5);
  ctx.lineTo(-3, -bobbing * 0.5 - 5);
  ctx.stroke();

  // Custom Faction / Class Chest Insignia
  ctx.save();
  if (warriorSkinId === 'ghost') {
    // Ghost Skull Icon
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(0, -3, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1.5, -1.2, 3, 2);
  } else if (warriorSkinId === 'cyber') {
    // Vanguard Titan Heavy Hexagon
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let h = 0; h < 6; h++) {
      const ha = (h * Math.PI) / 3;
      const hx = Math.cos(ha) * 3;
      const hy = Math.sin(ha) * 3;
      if (h === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  } else {
    // Commando Special Forces Gold Star
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Armor Tier Visual Plating Upgrades
  if (armorTier >= 2) {
    ctx.strokeStyle = armorTier >= 3 ? '#a855f7' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 6;
    ctx.strokeRect(-9, -11, 18, 22);
    ctx.shadowBlur = 0;
  }

  // Heavy Shoulder Pauldrons / Bicep Guards (Left & Right)
  ctx.fillStyle = warriorConfig.primaryColor;
  ctx.beginPath();
  ctx.arc(-3, -14, 6, 0, Math.PI * 2);
  ctx.arc(-3, 14, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = warriorConfig.accentColor;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Rank Chevrons on Left Shoulder
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-5, -16); ctx.lineTo(-2, -14); ctx.lineTo(-5, -12);
  ctx.moveTo(-3, -16); ctx.lineTo(0, -14); ctx.lineTo(-3, -12);
  ctx.stroke();

  // 5.5 HIGH-DETAIL WEAPON ARMS & DYNAMIC GUN RENDERING
  renderDetailedWeapon(ctx, wep, isFiring, time, warriorConfig, glovesTier);

  // 5.6 ELITE TACTICAL OPS-CORE HELMET, NVG & HOLOGRAPHIC HUD VISOR
  ctx.save();
  const helmetY = -bobbing * 0.5 + idleBreathing;

  // Ballistic FAST Helmet Dome (Realistic Curvature)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, helmetY, 10.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Helmet NVG Shroud & Wilcox Aluminum Mount on Forehead
  ctx.fillStyle = '#475569';
  ctx.fillRect(7.5, helmetY - 4, 4, 8);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(9, helmetY - 2.5, 2, 5);

  // Tactical Headset Ear-muffs (Peltor ComTac IV)
  ctx.fillStyle = '#090d16';
  drawRoundRect(ctx, -3, helmetY - 12.5, 6, 4, 1.5);
  ctx.fill();
  drawRoundRect(ctx, -3, helmetY + 8.5, 6, 4, 1.5);
  ctx.fill();

  // Flexible Headset Boom Microphone & Comms Light
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(1, helmetY - 11);
  ctx.lineTo(8.5, helmetY - 6.5);
  ctx.stroke();
  ctx.fillStyle = warriorConfig.accentColor;
  ctx.beginPath();
  ctx.arc(8.5, helmetY - 6.5, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // SPECIALIZED VISOR / NIGHT VISION GOGGLES (NVG) PER CLASS:
  if (warriorSkinId === 'ghost') {
    // PANORAMIC QUAD-NVG (GPNVG-18) - 4 Glowing Emerald Optical Tubes
    ctx.fillStyle = '#090d16';
    ctx.fillRect(8.5, helmetY - 7, 3.5, 14);

    const nvgGlow = '#10b981';
    ctx.fillStyle = nvgGlow;
    ctx.shadowColor = nvgGlow;
    ctx.shadowBlur = 10;
    for (let tube = 0; tube < 4; tube++) {
      const ty = helmetY - 5.5 + tube * 3.6;
      ctx.beginPath();
      ctx.arc(12, ty, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  } else if (warriorSkinId === 'cyber') {
    // TITAN HEAVY BALLISTIC BLAST MASK WITH GOLDEN HOLO VISOR
    ctx.fillStyle = '#d97706';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(5.5, helmetY, 8.5, -0.85, 0.85);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#fbbf24';
    ctx.stroke();

    // Hologram Scan Line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(9, helmetY - 4);
    ctx.lineTo(12, helmetY);
    ctx.lineTo(9, helmetY + 4);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else {
    // COMMANDO TACTICAL CURVED HUD VISOR
    const visorColor = warriorConfig.visorColor;
    ctx.fillStyle = visorColor;
    ctx.shadowColor = visorColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(5.5, helmetY, 8.2, -0.78, 0.78);
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = visorColor;
    ctx.stroke();

    // Visor Glass Specular Glint & Tactical Reticle
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(10.5, helmetY - 3, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Visor Equipment Tier Upgrade Hologram Reticle
  if (visorTier >= 2) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(14, helmetY, 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore(); // End helmet rendering

  ctx.restore(); // End player angle rotation

  // 6. ACTIVE FORCEFIELD ENERGY SHIELD
  if (activeBuffs.shieldTimer > 0) {
    ctx.save();
    const shieldAngle = time * 0.0025;
    ctx.rotate(shieldAngle);

    // Glowing Hexagonal Energy Barrier
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 16;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = Math.cos(a) * (p.radius + 13);
      const hy = Math.sin(a) * (p.radius + 13);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Pulsing inner shield ring with rotating energy nodes
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 10 + Math.sin(time * 0.008) * 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // 7. INVINCIBILITY / DAMAGE HIT FLASH
  if (p.invincibleTimer > 0 && Math.floor(time / 75) % 2 === 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

/**
 * Hyper-detailed firearm model rendering per weapon type
 * Features realistic gun anatomy, recoil kickback, dual-hand tactical grip, and wrist HUD PDA
 */
const renderDetailedWeapon = (
  ctx: CanvasRenderingContext2D,
  wep: Weapon,
  isFiring: boolean,
  time: number,
  warriorConfig: any,
  glovesTier: number
) => {
  ctx.save();

  const gloveColor = glovesTier >= 3 ? '#1e293b' : '#334155';
  const knuckleColor = glovesTier >= 2 ? warriorConfig.accentColor : '#475569';
  const recoilOffset = isFiring ? -3.5 : 0;

  ctx.translate(recoilOffset, 0);

  // Digital Wrist PDA / Smartwatch on Right Arm (showing animated mini vital waveform)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(2, 4, 6, 6);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(3.5, 5.5, 3, 3);

  switch (wep.id) {
    case 'pistol': {
      // Glock 19X / Tactical Combat Pistol
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -6, 9, 4.5); // Left arm
      ctx.fillRect(4, 1.5, 9, 4.5); // Right arm

      // Slide & Frame
      ctx.fillStyle = '#1e293b';
      drawRoundRect(ctx, 11, -2.5, 15, 5, 1.5);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Slide serrations & ejection port
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(13, -2.5, 4, 2);
      ctx.fillStyle = '#475569';
      ctx.fillRect(19, -2, 3, 1.5);

      // Micro Red-Dot Reflex Sight
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(14, -4.5, 4, 2.5);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(16, -3.5, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Under-barrel Tactical Light
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(18, 2.5, 6, 2.2);

      // Tactical Gloves
      renderHands(ctx, 12, -3.5, 12, 3.5, gloveColor, knuckleColor);
      break;
    }

    case 'shotgun': {
      // Benelli M4 Tactical Shotgun
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -10, 16, 5);
      ctx.fillRect(0, 4, 11, 5);

      // Heavy Twin Barrel & Magazine Tube
      ctx.fillStyle = '#334155';
      ctx.fillRect(9, -2, 27, 4);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(9, 1.5, 23, 3);

      // Ribbed Textured Pump Handle
      ctx.fillStyle = '#78350f';
      drawRoundRect(ctx, 17, -2.5, 7, 5, 1.5);
      ctx.fill();

      // Top Picatinny Rail
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, -3.5, 12, 1.8);

      // Side-Saddle Red 12-Gauge Shells
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(10, -5, 2.2, 2.2);
      ctx.fillRect(13, -5, 2.2, 2.2);
      ctx.fillRect(16, -5, 2.2, 2.2);

      // Gloves
      renderHands(ctx, 20, -4, 9, 4, gloveColor, knuckleColor);
      break;
    }

    case 'ak47': {
      // Customized Spetsnaz Alpha Tactical AK
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -10, 17, 4.5);
      ctx.fillRect(0, 4, 10, 4.5);

      // Russian Bakelite / Wood Handguard
      ctx.fillStyle = '#9a3412';
      drawRoundRect(ctx, 15, -2.5, 9, 5, 1.5);
      ctx.fill();

      // Black Steel Receiver & Long Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(7, -2.5, 10, 5);
      ctx.fillStyle = '#334155';
      ctx.fillRect(24, -1.2, 14, 2.4);

      // Railed Gas Tube & Holographic Sight
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(11, -5, 6, 3);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(14, -3.5, 1, 0, Math.PI * 2);
      ctx.fill();

      // Curved Banana 30-round Mag
      ctx.fillStyle = '#1e293b';
      ctx.save();
      ctx.translate(14, 2.5);
      ctx.rotate(0.38);
      ctx.fillRect(0, 0, 4.5, 9);
      ctx.restore();

      // Gloves
      renderHands(ctx, 18, -4.5, 8, 3.5, gloveColor, knuckleColor);
      break;
    }

    case 'sniper': {
      // Barrett .50 BMG Heavy Anti-Material Sniper Rifle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -11, 18, 4.5);
      ctx.fillRect(-2, 4, 11, 4.5);

      // Heavy Fluted Match Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(7, -3, 40, 6);
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, -2, 22, 4);

      // Massive Dual-Baffle Chevron Muzzle Brake
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(47, -4.5, 8, 9);

      // Folded Forward Heavy Bipod
      ctx.fillStyle = '#475569';
      ctx.fillRect(36, -4, 2, 8);

      // Long-Range High-Power Optical Scope
      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, 11, -6, 16, 4.5, 1.5);
      ctx.fill();
      // Green coated lens glint
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(27, -4, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Gloves
      renderHands(ctx, 19, -4.5, 7, 4, gloveColor, knuckleColor);
      break;
    }

    case 'minigun': {
      // M134 6-Barrel Vulcan Rotary Minigun
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -11, 16, 5.5);
      ctx.fillRect(-2, 5, 16, 5.5);

      // Heavy Motor Core
      ctx.fillStyle = '#1e293b';
      drawRoundRect(ctx, 5, -5.5, 13, 11, 3);
      ctx.fill();

      // 6 Rotating Heavy Barrels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(18, -4.5, 22, 9);

      // Barrel Clamp Retaining Rings
      ctx.fillStyle = '#64748b';
      ctx.fillRect(26, -5, 3, 10);
      ctx.fillRect(37, -5, 3, 10);

      // Linked Brass Ammunition Belt
      ctx.fillStyle = '#facc15';
      for (let b = 0; b < 5; b++) {
        ctx.fillRect(5 - b * 3, 6 + b * 2, 2.5, 4);
      }

      // Gloves (Dual Spade Grips)
      renderHands(ctx, 15, -5.5, 15, 5.5, gloveColor, knuckleColor);
      break;
    }

    case 'rpg': {
      // RPG-7 Rocket Propelled Grenade Launcher
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -10, 15, 4.5);
      ctx.fillRect(-3, 5, 13, 4.5);

      // Launch Tube with Wood Heat Shields
      ctx.fillStyle = '#365314'; // Olive drab
      ctx.fillRect(-5, -3.5, 32, 7);
      ctx.fillStyle = '#9a3412'; // Wood heat guard
      ctx.fillRect(9, -4, 11, 8);

      // Optical PGO-7V Scope
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, -6.5, 7, 3);

      // PG-7VL Tandem Shaped-Charge Warhead
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.moveTo(27, -6);
      ctx.lineTo(38, 0);
      ctx.lineTo(27, 6);
      ctx.closePath();
      ctx.fill();
      // Arming yellow stripe
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(38, -1, 4.5, 2);

      // Gloves
      renderHands(ctx, 15, -4.5, 7, 4.5, gloveColor, knuckleColor);
      break;
    }

    case 'plasma': {
      // Quantum Arc-Cannon / Plasma Disintegrator
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -10, 15, 4.5);
      ctx.fillRect(0, 4, 11, 4.5);

      ctx.fillStyle = '#0f172a';
      drawRoundRect(ctx, 7, -3.5, 26, 7, 2);
      ctx.fill();

      // Glowing Cyan Plasma Coils with pulse animation
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 12;
      ctx.fillRect(15, -4.2, 4.5, 8.4);
      ctx.fillRect(24, -4.2, 4.5, 8.4);

      // Pulsing Dark Matter Fusion Core
      const corePulse = 2.2 + Math.sin(time * 0.016) * 1.3;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(11, 0, corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gloves
      renderHands(ctx, 17, -4.5, 9, 4.5, gloveColor, knuckleColor);
      break;
    }

    default: {
      ctx.fillStyle = wep.color;
      ctx.fillRect(10, -3, 16, 6);
      break;
    }
  }

  // DYNAMIC MUZZLE FLASH & SPARK CORE WHEN FIRING
  if (isFiring) {
    const muzzleOffset = wep.id === 'sniper' ? 55 : wep.id === 'rpg' ? 44 : wep.id === 'ak47' ? 40 : 28;
    ctx.save();
    ctx.translate(muzzleOffset, 0);

    const isPlasma = wep.id === 'plasma';
    ctx.fillStyle = isPlasma ? '#22d3ee' : '#f97316';
    ctx.shadowColor = isPlasma ? '#67e8f9' : '#fbbf24';
    ctx.shadowBlur = 18;

    // 8-Point Star Muzzle Flash Burst
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 15 : 6;
      const mx = Math.cos(a) * r;
      const my = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.closePath();
    ctx.fill();

    // Hot Incandescent White Center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
};

/**
 * Helper to draw tactical combat gloves with reinforced carbon knuckle plates
 */
const renderHands = (
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  rx: number,
  ry: number,
  gloveColor: string,
  knuckleColor: string
) => {
  // Left Hand (Foregrip / Support)
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.arc(lx, ly, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = knuckleColor;
  ctx.fillRect(lx - 1, ly - 1.5, 2, 3);

  // Right Hand (Trigger)
  ctx.fillStyle = gloveColor;
  ctx.beginPath();
  ctx.arc(rx, ry, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = knuckleColor;
  ctx.fillRect(rx - 1, ry - 1.5, 2, 3);
};
