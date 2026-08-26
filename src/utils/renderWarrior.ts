import { PlayerStats, Weapon, ActiveBuffs, Obstacle, Zombie } from '../types/game';
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

  // Find Warrior Skin Config
  const warriorSkinId = p.warriorSkin || 'commando';
  const warriorConfig = WARRIOR_CLASSES.find(w => w.id === warriorSkinId) || WARRIOR_CLASSES[0];

  // 1. DASH GHOSTING TRAILS
  if (p.isDashing) {
    const ghostColor = warriorConfig.accentColor;
    for (let i = 1; i <= 3; i++) {
      ctx.save();
      ctx.rotate(p.angle);
      ctx.fillStyle = ghostColor;
      ctx.globalAlpha = 0.35 / i;
      ctx.beginPath();
      ctx.arc(-i * 14, 0, p.radius * (1 - i * 0.1), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 2. 2.5D PERSPECTIVE DIRECTIONAL GROUND DROP SHADOW
  // Realistic slanted oval shadow positioned at feet elevation
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.beginPath();
  ctx.ellipse(4, 7, p.radius * 1.25, p.radius * 0.82, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. FLASHLIGHT VOLUMETRIC CONE LIGHT
  ctx.save();
  ctx.rotate(p.angle);

  const flashlightRange = wep.id === 'sniper' ? 540 : 440;
  const flashlightWidth = wep.id === 'sniper' ? 0.30 : 0.46;

  const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, flashlightRange);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.40)');
  grad.addColorStop(0.3, 'rgba(254, 240, 138, 0.22)');
  grad.addColorStop(0.7, 'rgba(254, 240, 138, 0.07)');
  grad.addColorStop(1, 'rgba(254, 240, 138, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.arc(12, 0, flashlightRange, -flashlightWidth, flashlightWidth);
  ctx.closePath();
  ctx.fill();

  // Floating dust motes in the flashlight beam
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 4; i++) {
    const speckDist = 60 + ((time * 0.05 + i * 85) % (flashlightRange - 70));
    const speckOffset = Math.sin(time * 0.003 + i * 2) * (speckDist * 0.15);
    ctx.beginPath();
    ctx.arc(speckDist, speckOffset, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. TACTICAL LASER SIGHT
  ctx.save();
  ctx.rotate(p.angle);
  const laserColor = warriorConfig.laserColor;
  let laserDist = 650;

  const pCos = Math.cos(p.angle);
  const pSin = Math.sin(p.angle);
  const gunMuzzleX = p.x + pCos * 24;
  const gunMuzzleY = p.y + pSin * 24;

  // Check zombies in laser path
  for (const z of zombies) {
    const toZx = z.x - gunMuzzleX;
    const toZy = z.y - gunMuzzleY;
    const dot = toZx * pCos + toZy * pSin;
    if (dot > 0 && dot < laserDist) {
      const perpDist = Math.abs(toZx * -pSin + toZy * pCos);
      if (perpDist < z.radius) {
        laserDist = Math.max(12, dot - z.radius * 0.6);
      }
    }
  }

  // Check obstacles in laser path
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
        laserDist = Math.max(12, dot - obs.width / 3);
      }
    }
  }

  // Draw laser beam line
  ctx.strokeStyle = laserColor;
  ctx.globalAlpha = 0.65;
  ctx.lineWidth = 1.2;
  ctx.setLineDash([9, 4]);
  ctx.beginPath();
  ctx.moveTo(24, 3);
  ctx.lineTo(laserDist, 3);
  ctx.stroke();
  ctx.setLineDash([]);

  // Laser target dot with glow
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = laserColor;
  ctx.shadowColor = laserColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(laserDist, 3, 2.8 + Math.sin(time * 0.01) * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  // 5. 2.5D PERSPECTIVE WARRIOR RENDERING (ROTATED TO PLAYER ANGLE)
  ctx.save();
  ctx.rotate(p.angle);

  const walkCycle = p.walkFrame || 0;
  const stride = Math.sin(walkCycle) * 8;
  const bobbing = Math.abs(Math.cos(walkCycle)) * 1.5;

  // 5.1 2.5D TACTICAL COMBAT BOOTS & LEGS
  ctx.fillStyle = '#0f172a'; // Deep boot black
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;

  // Left Leg / Boot (animated stride)
  ctx.beginPath();
  ctx.roundRect 
    ? ctx.roundRect(-6 + stride, -14, 13, 7, 3) 
    : ctx.rect(-6 + stride, -14, 13, 7);
  ctx.fill();
  ctx.stroke();

  // Right Leg / Boot (opposite stride)
  ctx.beginPath();
  ctx.roundRect 
    ? ctx.roundRect(-6 - stride, 7, 13, 7, 3) 
    : ctx.rect(-6 - stride, 7, 13, 7);
  ctx.fill();
  ctx.stroke();

  // Knee Armor Pads with accent highlight
  ctx.fillStyle = warriorConfig.primaryColor;
  ctx.fillRect(-1 + stride, -13, 4, 5);
  ctx.fillRect(-1 - stride, 8, 4, 5);

  // 5.2 TACTICAL MILITARY ASSAULT BACKPACK & RADIO ANTENNA
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-18, -10, 9, 20, 4) : ctx.rect(-18, -10, 9, 20);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Radio antenna on backpack
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-15, -7);
  ctx.lineTo(-26, -12);
  ctx.stroke();

  // Antenna tip LED
  ctx.fillStyle = warriorConfig.accentColor;
  ctx.shadowColor = warriorConfig.accentColor;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(-26, -12, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 5.3 MAIN 2.5D TACTICAL COMBAT BODY & KEVLAR PLATE CARRIER
  // Under-suit Base
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ballistic Plate Carrier Vest with 3D Bevel Edge
  ctx.fillStyle = warriorConfig.primaryColor;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-9, -11, 18, 22, 5) : ctx.rect(-9, -11, 18, 22);
  ctx.fill();
  ctx.strokeStyle = warriorConfig.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Chest Armor Plate with Molle Webbing Straps
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-5, -8, 12, 16);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-4, -4); ctx.lineTo(6, -4);
  ctx.moveTo(-4, 0);  ctx.lineTo(6, 0);
  ctx.moveTo(-4, 4);  ctx.lineTo(6, 4);
  ctx.stroke();

  // Ammo Mag Pouches on Vest
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(3, -7, 4.5, 4);
  ctx.fillRect(3, -2, 4.5, 4);
  ctx.fillRect(3, 3, 4.5, 4);

  // Tactical Combat Knife Sheath (Diagonal)
  ctx.save();
  ctx.translate(-3, -7);
  ctx.rotate(-0.4);
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 3.5, 9);
  ctx.fillStyle = '#94a3b8'; // Metal hilt
  ctx.fillRect(-0.5, -2.5, 4.5, 2.5);
  ctx.restore();

  // Heavy Shoulder Pauldrons (Left & Right)
  ctx.fillStyle = warriorConfig.primaryColor;
  ctx.beginPath();
  ctx.arc(-2, -13, 5.5, 0, Math.PI * 2);
  ctx.arc(-2, 13, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = warriorConfig.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rank Insignia Chevron on Left Shoulder
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-3, -15); ctx.lineTo(0, -13); ctx.lineTo(-3, -11);
  ctx.stroke();

  // 5.4 HIGH-DETAIL WEAPON ARMS & GUN MODEL
  renderDetailedWeapon(ctx, wep, isFiring, time);

  // 5.5 2.5D TACTICAL OPS-CORE HELMET & HUD VISOR
  // Helmet Base Dome with Perspective Depth
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, -bobbing * 0.5, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Helmet NVG Mount Bracket on Front
  ctx.fillStyle = '#475569';
  ctx.fillRect(7, -3.5 - bobbing * 0.5, 3.5, 7);

  // Tactical Headset Ear-muffs & Boom Mic
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-2, -11.5 - bobbing * 0.5, 5.5, 3.5);
  ctx.fillRect(-2, 8 - bobbing * 0.5, 5.5, 3.5);

  // Boom Mic Wire & Glowing Tip
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(2, -10 - bobbing * 0.5);
  ctx.lineTo(8, -6 - bobbing * 0.5);
  ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(8, -6 - bobbing * 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // GLOWING TACTICAL HUD VISOR / GOGGLES (2.5D Curved Front Visor)
  const visorColor = warriorConfig.visorColor;
  ctx.save();
  ctx.fillStyle = visorColor;
  ctx.shadowColor = visorColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(5, -bobbing * 0.5, 7.5, -0.75, 0.75);
  ctx.lineWidth = 3;
  ctx.strokeStyle = visorColor;
  ctx.stroke();

  // Visor Specular Glass Glint
  ctx.fillStyle = '#ffffff';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(9.5, -2.5 - bobbing * 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore(); // End player angle rotation

  // 6. ACTIVE FORCEFIELD ENERGY SHIELD
  if (activeBuffs.shieldTimer > 0) {
    ctx.save();
    const shieldAngle = time * 0.002;
    ctx.rotate(shieldAngle);

    // Glowing Hexagonal Energy Barrier
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#818cf8';
    ctx.shadowBlur = 14;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const hx = Math.cos(a) * (p.radius + 12);
      const hy = Math.sin(a) * (p.radius + 12);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();

    // Pulsing inner shield ring
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 9 + Math.sin(time * 0.008) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // 7. INVINCIBILITY / DAMAGE HIT FLASH
  if (p.invincibleTimer > 0 && Math.floor(time / 80) % 2 === 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
};

/**
 * High-detail weapon graphics rendering per weapon type
 */
const renderDetailedWeapon = (
  ctx: CanvasRenderingContext2D,
  wep: Weapon,
  isFiring: boolean,
  time: number
) => {
  ctx.save();

  const rightHandColor = '#334155'; // Tactical glove

  switch (wep.id) {
    case 'pistol': {
      // Glock-19 Tactical Pistol
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -5, 8, 4); // Left arm
      ctx.fillRect(4, 1, 8, 4);  // Right arm

      // Matte Black Slide & Ejection Port
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, -2, 14, 4);
      ctx.fillStyle = '#475569';
      ctx.fillRect(14, -2, 3, 2);

      // Under-barrel laser module
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, 2, 5, 2);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(21, 3, 1, 0, Math.PI * 2);
      ctx.fill();

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(11, -3, 3, 0, Math.PI * 2);
      ctx.arc(11, 3, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'shotgun': {
      // Remington 870 Tactical Shotgun
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -9, 14, 4.5);
      ctx.fillRect(0, 4, 10, 4.5);

      // Dual Heavy Barrel
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, -1.5, 25, 3);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 1.5, 21, 2.5);

      // Ribbed Walnut Pump
      ctx.fillStyle = '#78350f';
      ctx.fillRect(16, -2, 6, 4);

      // Red Shotgun Shells in Side-Saddle
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(9, -4, 2, 2);
      ctx.fillRect(12, -4, 2, 2);
      ctx.fillRect(15, -4, 2, 2);

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(19, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(8, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ak47': {
      // AK-47 Assault Rifle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -9, 15, 4);
      ctx.fillRect(0, 4, 9, 4);

      // Wooden Handguard
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(14, -2, 8, 4);

      // Black Steel Receiver & Long Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -2, 9, 4);
      ctx.fillStyle = '#475569';
      ctx.fillRect(22, -1, 12, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(34, -1.5, 3, 3);

      // Curved Banana Magazine
      ctx.fillStyle = '#1e293b';
      ctx.save();
      ctx.translate(13, 2);
      ctx.rotate(0.35);
      ctx.fillRect(0, 0, 4, 8);
      ctx.restore();

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(17, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(7, 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sniper': {
      // Barrett .50 Cal Sniper Rifle
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -10, 16, 4);
      ctx.fillRect(-2, 4, 10, 4);

      // Heavy Fluted Steel Barrel
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -2.5, 38, 5);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(44, -4, 7, 8);

      // Optical Scope with Lens Glint
      ctx.fillStyle = '#334155';
      ctx.fillRect(10, -5, 14, 3.5);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(24, -3.5, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(18, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(6, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'minigun': {
      // M134 6-Barrel Vulcan Minigun
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -10, 15, 5);
      ctx.fillRect(-2, 5, 15, 5);

      // Motor Body
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, -5, 12, 10);

      // Rotating Barrels
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(16, -4, 20, 8);

      // Clamp Rings
      ctx.fillStyle = '#64748b';
      ctx.fillRect(24, -4.5, 2.5, 9);
      ctx.fillRect(34, -4.5, 2.5, 9);

      // Golden Bullet Belt
      ctx.fillStyle = '#facc15';
      for (let b = 0; b < 4; b++) {
        ctx.fillRect(4 - b * 3, 5 + b * 2, 2.5, 3.5);
      }

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(14, -5, 4, 0, Math.PI * 2);
      ctx.arc(14, 5, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rpg': {
      // RPG-7 Rocket Launcher
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, -9, 14, 4);
      ctx.fillRect(-2, 5, 12, 4);

      // Launch Tube
      ctx.fillStyle = '#365314';
      ctx.fillRect(-4, -3, 30, 6);
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(8, -3.5, 10, 7);

      // Rocket Warhead
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.moveTo(26, -5);
      ctx.lineTo(36, 0);
      ctx.lineTo(26, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(36, -0.75, 4, 1.5);

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(14, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(6, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'plasma': {
      // Plasma Disintegrator
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, -9, 14, 4);
      ctx.fillRect(0, 4, 10, 4);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(6, -3, 24, 6);

      // Glowing Electromagnetic Coils
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.fillRect(14, -3.5, 4, 7);
      ctx.fillRect(22, -3.5, 4, 7);

      // Energy Core
      const corePulse = 2 + Math.sin(time * 0.015) * 1.2;
      ctx.fillStyle = '#67e8f9';
      ctx.beginPath();
      ctx.arc(10, 0, corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Gloves
      ctx.fillStyle = rightHandColor;
      ctx.beginPath();
      ctx.arc(16, -4, 3.5, 0, Math.PI * 2);
      ctx.arc(8, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    default: {
      ctx.fillStyle = wep.color;
      ctx.fillRect(10, -3, 16, 6);
      break;
    }
  }

  // Dynamic Muzzle Flash when Firing
  if (isFiring) {
    const muzzleOffset = wep.id === 'sniper' ? 51 : wep.id === 'rpg' ? 42 : wep.id === 'ak47' ? 38 : 26;
    ctx.save();
    ctx.translate(muzzleOffset, 0);

    ctx.fillStyle = wep.id === 'plasma' ? '#22d3ee' : '#f97316';
    ctx.shadowColor = wep.id === 'plasma' ? '#67e8f9' : '#fbbf24';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const r = i % 2 === 0 ? 13 : 5;
      const mx = Math.cos(a) * r;
      const my = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(mx, my);
      else ctx.lineTo(mx, my);
    }
    ctx.closePath();
    ctx.fill();

    // Hot White Center
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
};
