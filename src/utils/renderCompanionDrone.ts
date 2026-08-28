import { CompanionDroneConfig, ActiveDroneState } from '../data/drones';

interface RenderDroneParams {
  ctx: CanvasRenderingContext2D;
  droneState: ActiveDroneState;
  config: CompanionDroneConfig;
  time: number;
}

export function renderCompanionDrone({ ctx, droneState, config, time }: RenderDroneParams) {
  const { x, y, angle, turretAngle, tilt, hoverOffset } = droneState;
  
  // Calculate dynamic hover height & bobbing
  const hoverY = Math.sin(time * 0.005 + hoverOffset) * 5;
  const altitude = 22 + hoverY; // Distance above ground

  ctx.save();

  // ----------------------------------------------------
  // 1. SOFT DYNAMIC DROP SHADOW ON GROUND
  // ----------------------------------------------------
  ctx.save();
  ctx.translate(x, y + altitude);
  ctx.beginPath();
  const shadowScale = Math.max(0.6, 1 - altitude / 60);
  ctx.ellipse(0, 0, 18 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fill();
  ctx.restore();

  // ----------------------------------------------------
  // 2. MAIN HOVERING DRONE CHASSIS
  // ----------------------------------------------------
  ctx.translate(x, y);
  
  // Apply bank tilt and movement rotation
  ctx.rotate(angle * 0.15 + tilt * 0.4);

  // Jet Thruster Particles & Plume Exhaust at the rear
  renderThrusters(ctx, config, time);

  // Outer Forcefield / Shield Ring (if level > 1)
  if (config.level >= 2) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 22 + Math.sin(time * 0.006) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = `${config.glowColor}33`;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -time * 0.02;
    ctx.stroke();
    ctx.restore();
  }

  // Draw Specific Model Chassis
  if (config.type === 'gatling') {
    renderVulcanGatlingChassis(ctx, config, turretAngle, time);
  } else if (config.type === 'plasma') {
    renderPlasmaTitanChassis(ctx, config, turretAngle, time);
  } else if (config.type === 'laser') {
    renderLaserAegisChassis(ctx, config, turretAngle, time);
  } else {
    renderMissileValkyrieChassis(ctx, config, turretAngle, time);
  }

  // Draw Level Badge & Status LED
  renderLevelIndicator(ctx, config);

  ctx.restore();
}

// ----------------------------------------------------
// JET THRUSTER GLOW & EXHAUST
// ----------------------------------------------------
function renderThrusters(ctx: CanvasRenderingContext2D, config: CompanionDroneConfig, time: number) {
  const thrusterOffset = 12;
  const flameLen = 8 + Math.sin(time * 0.03) * 4;

  [-8, 8].forEach(side => {
    ctx.save();
    ctx.translate(side, thrusterOffset);

    // Thruster Nozzle Pod
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -2, 6, 4);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(-3, -2, 6, 4);

    // Jet Flame Plume
    const flameGrad = ctx.createLinearGradient(0, 0, 0, flameLen);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.3, config.glowColor);
    flameGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(-3, 2);
    ctx.lineTo(3, 2);
    ctx.lineTo(0, 2 + flameLen);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });
}

// ----------------------------------------------------
// 1. VULCAN V-100 GATLING CHASSIS (Cyan / Tactical Grey)
// ----------------------------------------------------
function renderVulcanGatlingChassis(
  ctx: CanvasRenderingContext2D, 
  config: CompanionDroneConfig, 
  turretAngle: number,
  time: number
) {
  // Aerodynamic Winglets
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-16, 4);
  ctx.lineTo(-20, 10);
  ctx.lineTo(-12, 12);
  ctx.lineTo(-8, 6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(16, 4);
  ctx.lineTo(20, 10);
  ctx.lineTo(12, 12);
  ctx.lineTo(8, 6);
  ctx.closePath();
  ctx.fill();

  // Main Carbon Fiber Torso
  const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 15);
  bodyGrad.addColorStop(0, '#334155');
  bodyGrad.addColorStop(0.6, '#1e293b');
  bodyGrad.addColorStop(1, '#090d16');

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(-12, -12, 24, 24, 6);
  } else {
    ctx.rect(-12, -12, 24, 24);
  }
  ctx.fill();

  // Cyan Tactical Armor Inset
  ctx.strokeStyle = config.glowColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rotating Turret Gimbal
  ctx.save();
  ctx.rotate(turretAngle);

  // Twin Mini-Gatling Barrels
  const barrelSpin = (time * 0.02) % (Math.PI * 2);
  ctx.fillStyle = '#020617';
  // Left Barrel
  ctx.fillRect(-6, -18, 3.5, 12);
  // Right Barrel
  ctx.fillRect(2.5, -18, 3.5, 12);

  // Barrel Muzzle Rings (Brass / Bronze)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-6, -19, 3.5, 2);
  ctx.fillRect(2.5, -19, 3.5, 2);

  // Center Turret Core Dome
  const turretDome = ctx.createRadialGradient(-2, -2, 1, 0, 0, 8);
  turretDome.addColorStop(0, '#475569');
  turretDome.addColorStop(1, '#0f172a');
  ctx.fillStyle = turretDome;
  ctx.beginPath();
  ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Ocular Cybernetic Eye / Visor
  ctx.fillStyle = config.glowColor;
  ctx.beginPath();
  ctx.arc(0, -3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, -3.5, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------
// 2. PLASMA TITAN P-80 CHASSIS (Purple / Heavy Titanium)
// ----------------------------------------------------
function renderPlasmaTitanChassis(
  ctx: CanvasRenderingContext2D, 
  config: CompanionDroneConfig, 
  turretAngle: number,
  time: number
) {
  // Heavy Shield Plating
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = config.glowColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Orbiting Plasma Ion Rings
  const ringRot = time * 0.004;
  ctx.save();
  ctx.rotate(ringRot);
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 19, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Turret Mount
  ctx.save();
  ctx.rotate(turretAngle);

  // Heavy Plasma Cannon Muzzle
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(-7, -20);
  ctx.lineTo(7, -20);
  ctx.lineTo(5, -6);
  ctx.closePath();
  ctx.fill();

  // Glowing Plasma Chamber Core
  const plasmaCore = ctx.createRadialGradient(0, -12, 1, 0, -12, 6);
  plasmaCore.addColorStop(0, '#ffffff');
  plasmaCore.addColorStop(0.4, '#c084fc');
  plasmaCore.addColorStop(1, '#6b21a8');
  ctx.fillStyle = plasmaCore;
  ctx.beginPath();
  ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Center Reactor Hub
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ----------------------------------------------------
// 3. LASER AEGIS L-90 CHASSIS (Crimson Red / High-Tech Scout)
// ----------------------------------------------------
function renderLaserAegisChassis(
  ctx: CanvasRenderingContext2D, 
  config: CompanionDroneConfig, 
  turretAngle: number,
  time: number
) {
  // Angular Stealth Diamond Wings
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(16, 2);
  ctx.lineTo(8, 14);
  ctx.lineTo(-8, 14);
  ctx.lineTo(-16, 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Rotatable Laser Optics Hub
  ctx.save();
  ctx.rotate(turretAngle);

  // Laser Lens Housing
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-3, -20, 6, 14);

  // High-Energy Focus Ruby Crystal Lens
  const rubyLens = ctx.createRadialGradient(0, -20, 1, 0, -20, 4);
  rubyLens.addColorStop(0, '#ffffff');
  rubyLens.addColorStop(0.5, '#ef4444');
  rubyLens.addColorStop(1, '#7f1d1d');
  ctx.fillStyle = rubyLens;
  ctx.beginPath();
  ctx.arc(0, -20, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Laser Aiming Guide Line (Subtle red targeting laser)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(0, -120);
  ctx.stroke();

  // Center Scout Core
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------
// 4. MISSILE VALKYRIE R-70 CHASSIS (Amber Gold / Heavy Artillery)
// ----------------------------------------------------
function renderMissileValkyrieChassis(
  ctx: CanvasRenderingContext2D, 
  config: CompanionDroneConfig, 
  turretAngle: number,
  time: number
) {
  // Heavy Angular Armor Plating
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(-15, -12);
  ctx.lineTo(15, -12);
  ctx.lineTo(18, 8);
  ctx.lineTo(-18, 8);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Turret Mount
  ctx.save();
  ctx.rotate(turretAngle);

  // 4-Cell Rocket Launcher Pod
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-10, -18, 20, 12);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-10, -18, 20, 12);

  // 4 Rocket Warhead Silos
  [-6, 6].forEach(rx => {
    [-15, -10].forEach(ry => {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // Center Command Module
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ----------------------------------------------------
// LEVEL STARS & ACTIVE STATUS
// ----------------------------------------------------
function renderLevelIndicator(ctx: CanvasRenderingContext2D, config: CompanionDroneConfig) {
  ctx.save();
  ctx.font = 'bold 8px sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const stars = '★'.repeat(config.level);
  ctx.fillText(stars, 0, 14);
  ctx.restore();
}
