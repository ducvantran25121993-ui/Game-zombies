import { Zombie } from '../types/game';

interface RenderZombieParams {
  ctx: CanvasRenderingContext2D;
  zombie: Zombie;
  time: number;
  isFrozen: boolean;
}

export const renderZombie = ({ ctx, zombie: z, time, isFrozen }: RenderZombieParams) => {
  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.rotate(z.angle);

  const r = z.radius;
  const isBoss = Boolean(z.isBoss);
  const anim = z.animationFrame || 0;
  const hpRatio = Math.max(0, Math.min(1, z.hp / z.maxHp));
  const isWounded = hpRatio < 0.6;

  // 1. ZOMBIE CONTACT SHADOW (Soft organic floor shadow)
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  ctx.ellipse(2, 4, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. ACID / SLIME TRAIL FOR SPITTER & BOSS
  if (z.type === 'spitter' || z.type === 'boss_abomination') {
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.beginPath();
    ctx.arc(-r * 0.8, (Math.sin(time * 0.01) * r * 0.3), r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 3. TERROR AURA FOR BOSSES
  if (isBoss) {
    ctx.save();
    const pulse = Math.sin(time * 0.005) * 6;
    const auraColor = z.color || '#dc2626';
    const auraGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r + 24 + pulse);
    auraGrad.addColorStop(0, 'rgba(220, 38, 38, 0.28)');
    auraGrad.addColorStop(0.5, 'rgba(153, 27, 27, 0.15)');
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r + 24 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // RUSH CHARGE FLAMES / SPEED STREAKS
    if (z.bossSpecialState === 'charging') {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 15;
      for (let s = 0; s < 5; s++) {
        const streakY = (s - 2) * (r * 0.35);
        ctx.beginPath();
        ctx.moveTo(-r * 1.5, streakY);
        ctx.lineTo(-r * 0.6, streakY);
        ctx.stroke();
      }
    }

    // SHIELD BUBBLE (Cyber Mecha Barrier)
    if (z.shieldTimer && z.shieldTimer > 0) {
      const shieldPulse = Math.sin(time * 0.01) * 3;
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, r + 14 + shieldPulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // MULTI-PHASE ENRAGED PHASE 2 AURA (Crimson Fire & Demonic Spikes)
    if (z.isEnraged) {
      const enragePulse = Math.sin(time * 0.014) * 6;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(0, 0, r + 20 + enragePulse, 0, Math.PI * 2);
      ctx.stroke();

      // Pulsing demonic rune spikes orbiting the enraged boss
      for (let s = 0; s < 6; s++) {
        const spikeAng = (s / 6) * Math.PI * 2 + time * 0.004;
        const sx = Math.cos(spikeAng) * (r + 20 + enragePulse);
        const sy = Math.sin(spikeAng) * (r + 20 + enragePulse);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // CLONE DISTORTION
    if (z.isClone) {
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // Handle Stealth / Shadow Blink
  if (z.bossSpecialState === 'invisible') {
    ctx.globalAlpha = 0.15;
  }

  // 4. MAIN TORSO & FLESH RENDERING ACCORDING TO TYPE
  ctx.save();

  // Base rotten skin colors
  let fleshColor = '#3f4f44';      // Rotting sickly olive green
  let torsoClothColor = '#1f2937'; // Ripped civilian navy/dark shirt
  let bloodGoreColor = '#7f1d1d';   // Dark oxidized crimson blood
  let eyeGlowColor = '#ef4444';     // Malevolent red eye glow

  if (z.type === 'runner') {
    fleshColor = '#573030';        // Bloodied lean muscle
    torsoClothColor = '#292524';
    eyeGlowColor = '#ff2b2b';
  } else if (z.type === 'tank') {
    fleshColor = '#2d3748';        // Hardened calloused grey skin
    torsoClothColor = '#172554';   // Prisoner / Heavy worker jumpsuit remnants
    eyeGlowColor = '#fbbf24';      // Frenzied amber
  } else if (z.type === 'spitter') {
    fleshColor = '#2e4c38';        // Bile green
    torsoClothColor = '#064e3b';
    eyeGlowColor = '#4ade80';      // Toxic neon green
  } else if (z.type === 'bomber') {
    fleshColor = '#582c20';        // Feverish burnt orange
    torsoClothColor = '#3b1c11';
    eyeGlowColor = '#fb923c';
  } else if (z.type === 'boss_mutant') {
    fleshColor = '#381616';        // Bio-engineered nightmare crimson flesh
    torsoClothColor = '#0f172a';
    eyeGlowColor = '#ef4444';
  } else if (z.type === 'boss_abomination') {
    fleshColor = '#2e1065';        // Void purple decay
    torsoClothColor = '#022c22';
    eyeGlowColor = '#a855f7';
  } else if (z.type === 'boss_cyber_behemoth') {
    fleshColor = '#082f49';        // Cybernetic steel titanium
    torsoClothColor = '#0f172a';
    eyeGlowColor = '#06b6d4';      // High voltage cyan
  } else if (z.type === 'boss_inferno_titan') {
    fleshColor = '#431407';        // Burning molten charcoal & magma
    torsoClothColor = '#1c1917';
    eyeGlowColor = '#f97316';      // Inferno blaze
  } else if (z.type === 'boss_void_reaper') {
    fleshColor = '#1e1b4b';        // Cosmic dark matter
    torsoClothColor = '#09090b';
    eyeGlowColor = '#818cf8';      // Void purple
  }

  if (isFrozen) {
    fleshColor = '#38bdf8';
    torsoClothColor = '#0284c7';
    eyeGlowColor = '#e0f2fe';
  }

  // --- DRAW TORSO BODY (Detailed Oval with Rotten contours) ---
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.95, r * 0.85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // RIPPED CLOTHING SHREDS ON TORSO
  ctx.fillStyle = torsoClothColor;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, -r * 0.6);
  ctx.lineTo(r * 0.3, -r * 0.7);
  ctx.lineTo(r * 0.1, r * 0.6);
  ctx.lineTo(-r * 0.6, r * 0.7);
  ctx.closePath();
  ctx.fill();

  // EXPOSED BLOOD & GORE WOUNDS (Scars & Ripped Flesh)
  ctx.fillStyle = bloodGoreColor;
  ctx.beginPath();
  ctx.arc(-r * 0.2, -r * 0.3, r * 0.35, 0, Math.PI * 2);
  ctx.arc(r * 0.1, r * 0.25, r * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // EXPOSED RIBCAGE / BONES (For wounded or tough zombies)
  if (isWounded || z.type === 'tank' || isBoss) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.15);
    ctx.lineTo(-r * 0.05, -r * 0.25);
    ctx.moveTo(-r * 0.35, 0);
    ctx.lineTo(-r * 0.05, -0.05);
    ctx.moveTo(-r * 0.35, r * 0.15);
    ctx.lineTo(-r * 0.05, r * 0.1);
    ctx.stroke();
  }

  // SPECIAL MUTATION ORGANS:
  // Bomber: Bloated glowing explosive belly
  if (z.type === 'bomber') {
    const pulse = Math.sin(time * 0.02) * (r * 0.1);
    const bombGrad = ctx.createRadialGradient(-r * 0.1, 0, 2, -r * 0.1, 0, r * 0.7 + pulse);
    bombGrad.addColorStop(0, '#fef08a');
    bombGrad.addColorStop(0.4, '#f97316');
    bombGrad.addColorStop(0.8, '#dc2626');
    bombGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bombGrad;
    ctx.beginPath();
    ctx.arc(-r * 0.1, 0, r * 0.7 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Veins over explosive core
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.4);
    ctx.lineTo(-r * 0.1, 0);
    ctx.lineTo(-r * 0.4, r * 0.3);
    ctx.stroke();
  }

  // Spitter: Acid Sac on Back / Neck
  if (z.type === 'spitter') {
    const bubble = Math.sin(time * 0.015) * 3;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.2, r * 0.4 + bubble, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(-r * 0.35, -r * 0.25, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tank: Massive Bone Armor Plating & Shoulder Spikes
  if (z.type === 'tank' || isBoss) {
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    // Shoulder pauldrons
    ctx.arc(0, -r * 0.85, r * 0.45, 0, Math.PI * 2);
    ctx.arc(0, r * 0.85, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bone Spikes protruding
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, -r * 0.9);
    ctx.lineTo(-r * 0.6, -r * 1.2);
    ctx.lineTo(-r * 0.05, -r * 0.8);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-r * 0.2, r * 0.9);
    ctx.lineTo(-r * 0.6, r * 1.2);
    ctx.lineTo(-r * 0.05, r * 0.8);
    ctx.fill();
  }

  // 5. SHAMBLING CLAW ARMS (Reaching forward menacingly)
  const armSway = Math.sin(anim * 1.5) * (r * 0.3);
  const leftClawExtend = r * 0.85 + (z.type === 'runner' ? r * 0.4 : 0);
  const rightClawExtend = r * 0.85 - (z.type === 'runner' ? r * 0.1 : 0);

  // Left Arm
  ctx.save();
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.ellipse(r * 0.45, -r * 0.7 + armSway, r * 0.55, r * 0.25, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left Hand & Razor Claws
  ctx.fillStyle = bloodGoreColor;
  ctx.beginPath();
  ctx.arc(leftClawExtend, -r * 0.7 + armSway * 1.2, r * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Left Sharp Claws
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftClawExtend, -r * 0.85 + armSway);
  ctx.lineTo(leftClawExtend + r * 0.35, -r * 0.9 + armSway);
  ctx.moveTo(leftClawExtend + 2, -r * 0.7 + armSway);
  ctx.lineTo(leftClawExtend + r * 0.4, -r * 0.7 + armSway);
  ctx.moveTo(leftClawExtend, -r * 0.55 + armSway);
  ctx.lineTo(leftClawExtend + r * 0.35, -r * 0.5 + armSway);
  ctx.stroke();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.ellipse(r * 0.45, r * 0.7 - armSway, r * 0.55, r * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Hand & Razor Claws
  ctx.fillStyle = bloodGoreColor;
  ctx.beginPath();
  ctx.arc(rightClawExtend, r * 0.7 - armSway * 1.2, r * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Right Sharp Claws
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightClawExtend, r * 0.55 - armSway);
  ctx.lineTo(rightClawExtend + r * 0.35, r * 0.5 - armSway);
  ctx.moveTo(rightClawExtend + 2, r * 0.7 - armSway);
  ctx.lineTo(rightClawExtend + r * 0.4, r * 0.7 - armSway);
  ctx.moveTo(rightClawExtend, r * 0.85 - armSway);
  ctx.lineTo(rightClawExtend + r * 0.35, r * 0.9 - armSway);
  ctx.stroke();
  ctx.restore();

  // 6. ZOMBIE HEAD & HORRIFYING CRANIAL DETAILS
  const headRadius = r * 0.58;
  const headX = r * 0.28;
  const headY = 0;

  // Head base
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Rotten hair tufts / scalp tear
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(headX - headRadius * 0.4, headY - headRadius * 0.3, headRadius * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Exposed Cranial Flesh / Brain Wound
  ctx.fillStyle = bloodGoreColor;
  ctx.beginPath();
  ctx.arc(headX - headRadius * 0.2, headY - headRadius * 0.35, headRadius * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 7. GAPING BLOODY MOUTH & ROTTEN TEETH
  ctx.fillStyle = '#450a0a';
  ctx.beginPath();
  ctx.ellipse(headX + headRadius * 0.5, headY, headRadius * 0.42, headRadius * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sharp jagged rotten teeth
  ctx.fillStyle = '#fef08a';
  for (let t = -2; t <= 2; t++) {
    ctx.beginPath();
    ctx.moveTo(headX + headRadius * 0.35, headY + t * 3.5);
    ctx.lineTo(headX + headRadius * 0.65, headY + t * 3.5);
    ctx.lineTo(headX + headRadius * 0.45, headY + t * 3.5 + 2);
    ctx.fill();
  }

  // Dripping blood / saliva from mouth
  ctx.fillStyle = z.type === 'spitter' ? '#22c55e' : '#dc2626';
  ctx.beginPath();
  ctx.arc(headX + headRadius * 0.85, headY + (Math.sin(time * 0.01) * 2), 2, 0, Math.PI * 2);
  ctx.fill();

  // 8. GLOWING DEMONIC / INFECTED EYES (Piercing gaze in the dark)
  const eyeOffsetX = headX + headRadius * 0.35;
  const eyeSpreadY = headRadius * 0.42;

  // Eye sockets
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(eyeOffsetX, -eyeSpreadY, 4, 0, Math.PI * 2);
  ctx.arc(eyeOffsetX, eyeSpreadY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Glowing Irises & Eye Flare
  ctx.fillStyle = eyeGlowColor;
  ctx.shadowColor = eyeGlowColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(eyeOffsetX + 1, -eyeSpreadY, 2.5, 0, Math.PI * 2);
  ctx.arc(eyeOffsetX + 1, eyeSpreadY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Pupil Slits
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeOffsetX + 1.5, -eyeSpreadY, 1, 0, Math.PI * 2);
  ctx.arc(eyeOffsetX + 1.5, eyeSpreadY, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Extra Boss Eyes (Horrific Eldritch Mutation)
  if (isBoss) {
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(headX, -eyeSpreadY * 1.6, 2.5, 0, Math.PI * 2);
    ctx.arc(headX, eyeSpreadY * 1.6, 2.5, 0, Math.PI * 2);
    ctx.arc(headX - headRadius * 0.3, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 9. FROZEN ICE CRYSTAL OVERLAY
  if (isFrozen || (z.frozenTimer && z.frozenTimer > 0)) {
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ice crystals
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(0, r * 0.7);
    ctx.moveTo(-r * 0.5, -r * 0.5);
    ctx.lineTo(r * 0.5, r * 0.5);
    ctx.moveTo(r * 0.5, -r * 0.5);
    ctx.lineTo(-r * 0.5, r * 0.5);
    ctx.stroke();
    ctx.restore();
  }

  // 10. IMPACT HIT FLASH (Combat Juice: Brilliant arcade white flash on projectile impact)
  if (z.hitFlashTimer && z.hitFlashTimer > 0) {
    const flashAlpha = Math.min(1, z.hitFlashTimer / 80);
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${0.75 * flashAlpha})`;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore(); // Restore body transformation
  ctx.restore(); // Restore global translation & rotation
};
