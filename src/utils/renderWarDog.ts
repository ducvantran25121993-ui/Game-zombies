import { WarDogCompanion } from '../types/game';

interface RenderWarDogParams {
  ctx: CanvasRenderingContext2D;
  dog: WarDogCompanion;
  time: number;
}

export function renderWarDog({ ctx, dog, time }: RenderWarDogParams) {
  const { x, y, angle, level, state, hasCarriedItem, carriedDropType, runCycle, tailAngle, biteAnimation } = dog;

  ctx.save();
  ctx.translate(x, y);

  // 1. SOFT SHADOW
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 10, angle, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fill();
  ctx.restore();

  // Rotate to dog's facing direction
  ctx.rotate(angle);

  // Is Cyber-Hound (Level 3) or Armored (Level 2)
  const isCyber = level >= 3;
  const isArmored = level === 2;

  // 2. PAWS (Running cycle)
  const isMoving = state === 'attack' || state === 'fetch' || (Math.abs(dog.vx) + Math.abs(dog.vy) > 0.3);
  const legCycle = isMoving ? Math.sin(runCycle) : 0;
  const legCycleAlt = isMoving ? Math.cos(runCycle) : 0;

  const pawColor = isCyber ? '#27272a' : isArmored ? '#3f3f46' : '#78350f';

  // Front Left & Right Paws
  ctx.fillStyle = pawColor;
  // Front-left
  ctx.beginPath();
  ctx.ellipse(9 + legCycle * 4, -7, 4, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Front-right
  ctx.beginPath();
  ctx.ellipse(9 - legCycle * 4, 7, 4, 2.5, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Hind Left & Right Paws
  // Hind-left
  ctx.beginPath();
  ctx.ellipse(-10 - legCycleAlt * 3.5, -6, 4.5, 2.8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // Hind-right
  ctx.beginPath();
  ctx.ellipse(-10 + legCycleAlt * 3.5, 6, 4.5, 2.8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Cyber thrusters on paws for Level 3
  if (isCyber && isMoving) {
    ctx.save();
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(-14 - legCycleAlt * 3.5, -6, 2, 0, Math.PI * 2);
    ctx.arc(-14 + legCycleAlt * 3.5, 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. TAIL (Wagging)
  ctx.save();
  ctx.translate(-12, 0);
  ctx.rotate(tailAngle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-6, tailAngle * 4, -12, tailAngle * 7);
  ctx.lineWidth = isCyber ? 3 : 4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = isCyber ? '#06b6d4' : isArmored ? '#52525b' : '#92400e';
  ctx.stroke();
  if (isCyber) {
    // Glowing tip of cyber tail
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(-12, tailAngle * 7, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 4. MAIN TORSO
  const bodyColor = isCyber ? '#18181b' : isArmored ? '#451a03' : '#b45309';
  const backSaddleColor = isCyber ? '#27272a' : isArmored ? '#1c1917' : '#1c1917';

  // Lower body
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark saddle fur or carbon armor on spine
  ctx.fillStyle = backSaddleColor;
  ctx.beginPath();
  ctx.ellipse(-2, 0, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // 5. TACTICAL VEST & ARMOR
  if (isArmored || isCyber || level >= 1) {
    // Vest harness
    ctx.fillStyle = isCyber ? '#09090b' : isArmored ? '#334155' : '#15803d'; // Green vest for L1, Kevlar for L2, Carbon for L3
    ctx.beginPath();
    ctx.roundRect(-4, -5.5, 8, 11, 2);
    ctx.fill();

    // Vest straps & buckle
    ctx.strokeStyle = isCyber ? '#06b6d4' : '#eab308';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-1, -5.5);
    ctx.lineTo(-1, 5.5);
    ctx.moveTo(2, -5.5);
    ctx.lineTo(2, 5.5);
    ctx.stroke();

    // Badge / LED light on vest
    ctx.fillStyle = isCyber ? '#22d3ee' : isArmored ? '#38bdf8' : '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, isCyber ? 1.8 : 1.4, 0, Math.PI * 2);
    ctx.fill();

    if (isCyber) {
      // Glowing circuit lines
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(3, -2);
      ctx.moveTo(-6, 2);
      ctx.lineTo(3, 2);
      ctx.stroke();
    }
  }

  // 6. CANINE HEAD & SNOUT
  ctx.save();
  ctx.translate(10, 0);

  // Ears (Alert pointed ears)
  const earTwitch = Math.sin(time * 0.005) * 0.15;
  const earColor = isCyber ? '#27272a' : '#1c1917';

  // Left Ear
  ctx.fillStyle = earColor;
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(-6, -10 - earTwitch * 4);
  ctx.lineTo(1, -6);
  ctx.closePath();
  ctx.fill();

  // Right Ear
  ctx.beginPath();
  ctx.moveTo(-2, 5);
  ctx.lineTo(-6, 10 + earTwitch * 4);
  ctx.lineTo(1, 6);
  ctx.closePath();
  ctx.fill();

  // Head base
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout (Muzzle)
  const isBiting = biteAnimation > 0.1;
  const muzzleLen = isBiting ? 7.5 : 6;
  const muzzleColor = isCyber ? '#09090b' : '#1c1917';

  ctx.fillStyle = muzzleColor;
  ctx.beginPath();
  ctx.moveTo(3, -3);
  ctx.lineTo(3 + muzzleLen, -1.5);
  ctx.lineTo(3 + muzzleLen, 1.5);
  ctx.lineTo(3, 3);
  ctx.closePath();
  ctx.fill();

  // Black nose tip
  ctx.fillStyle = isCyber ? '#06b6d4' : '#000000';
  ctx.beginPath();
  ctx.arc(3 + muzzleLen, 0, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes / Cyber Visor
  if (isCyber) {
    // LED Cyber Visor
    ctx.fillStyle = '#06b6d4';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 6;
    ctx.fillRect(1, -3, 2, 6);
  } else {
    // Canine amber eyes
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(2, -2.5, 1, 0, Math.PI * 2);
    ctx.arc(2, 2.5, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bite teeth animation
  if (isBiting) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(4, -2);
    ctx.lineTo(6, -0.5);
    ctx.lineTo(5, 0);
    ctx.lineTo(6, 0.5);
    ctx.lineTo(4, 2);
    ctx.fill();

    // Red hit flash on jaws
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 7. CARRIED ITEM IN MOUTH
  if (hasCarriedItem) {
    ctx.save();
    ctx.translate(4 + muzzleLen + 2, 0);
    
    if (carriedDropType === 'exp_gem' || carriedDropType === 'diamond_gem' || !carriedDropType) {
      // EXP Gem
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(4, 0);
      ctx.lineTo(0, 4);
      ctx.lineTo(-4, 0);
      ctx.closePath();
      ctx.fill();
    } else if (carriedDropType === 'coin_bag' || carriedDropType === 'gold_ingot') {
      // Gold Coin
      ctx.fillStyle = '#facc15';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (carriedDropType === 'ammo' || carriedDropType === 'airdrop_crate') {
      // Ammo Box
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-3.5, -3.5, 7, 7);
    } else {
      // Medkit / General
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -2.5, 2, 5);
      ctx.fillRect(-2.5, -1, 5, 2);
    }
    ctx.restore();
  }

  ctx.restore(); // restore from head
  ctx.restore(); // restore from dog rotation

  // 8. OVERHEAD BADGE / STATUS TAG
  ctx.save();
  ctx.translate(x, y - 22);

  // Badge background
  const badgeText = isCyber 
    ? '⚡ CYBER-HOUND' 
    : isArmored 
    ? '🛡️ K-9 THIẾT GIÁP' 
    : '🐕 CHIẾN KHUYỂN K-9';

  const badgeColor = isCyber ? '#06b6d4' : isArmored ? '#a855f7' : '#f59e0b';

  ctx.font = '900 8px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const textMetrics = ctx.measureText(badgeText);
  const bgWidth = textMetrics.width + 10;
  const bgHeight = 12;

  ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = badgeColor;
  ctx.fillText(badgeText, 0, 0);

  // Carried item indicator tag
  if (hasCarriedItem) {
    ctx.translate(0, -11);
    ctx.fillStyle = '#22c55e';
    ctx.font = '800 7px system-ui, sans-serif';
    ctx.fillText('ĐANG THA ĐỒ VỀ!', 0, 0);
  }

  ctx.restore();
}
