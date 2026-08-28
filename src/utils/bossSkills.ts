import { Zombie, PlayerStats, Bullet, Particle, FloatingText, BossHazard, SweepingLaser, TentacleHook, Obstacle } from '../types/game';
import { BOSS_SKILL_DATABASE } from './constants';
import { soundManager } from './audio';

interface BossSkillContext {
  player: PlayerStats;
  zombies: Zombie[];
  bullets: Bullet[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  bossHazards: BossHazard[];
  sweepingLasers: SweepingLaser[];
  tentacleHooks: TentacleHook[];
  obstacles: Obstacle[];
  screenShake: number;
  wave: number;
}

/**
 * Execute unique boss skills per boss archetype and wave.
 */
export function processBossCombatAI(
  boss: Zombie,
  ctx: BossSkillContext,
  dt: number,
  currentTime: number,
  triggerExplosion: (x: number, y: number, radius: number, damage: number) => void
) {
  const p = ctx.player;
  const distToPlayer = Math.hypot(p.x - boss.x, p.y - boss.y);
  const angleToPlayer = Math.atan2(p.y - boss.y, p.x - boss.x);

  // 1. UPDATE BOSS TIMERS & TEMPORARY SPECIAL STATES
  if (boss.shieldTimer && boss.shieldTimer > 0) {
    boss.shieldTimer -= dt;
    if (boss.shieldTimer <= 0) {
      boss.shieldTimer = 0;
      boss.bossSpecialState = 'idle';
    }
  }

  if (boss.invisibleTimer && boss.invisibleTimer > 0) {
    boss.invisibleTimer -= dt;
    if (boss.invisibleTimer <= 0) {
      boss.invisibleTimer = 0;
      boss.bossSpecialState = 'idle';
      // Reappear right behind the player!
      const blinkDist = 130;
      const blinkAngle = p.angle + Math.PI + (Math.random() - 0.5) * 0.5;
      boss.x = Math.max(80, Math.min(2720, p.x + Math.cos(blinkAngle) * blinkDist));
      boss.y = Math.max(80, Math.min(2720, p.y + Math.sin(blinkAngle) * blinkDist));
      boss.angle = Math.atan2(p.y - boss.y, p.x - boss.x);

      // Shadow burst particles on reappear
      for (let i = 0; i < 20; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        ctx.particles.push({
          x: boss.x,
          y: boss.y,
          vx: Math.cos(pAngle) * spd,
          vy: Math.sin(pAngle) * spd,
          radius: 3 + Math.random() * 4,
          color: '#a855f7',
          alpha: 1,
          life: 0,
          maxLife: 24,
          decay: 0.05,
          shape: 'smoke'
        });
      }

      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '⚡ XUẤT HIỆN TỪ BÓNG TỐI!',
        color: '#c084fc',
        alpha: 1,
        life: 45,
        isCrit: true
      });
      soundManager.playDash();
    }
    return; // Invulnerable/inactive while blinking
  }

  // 2. BOSS CHARGING UPDATE
  if (boss.bossSpecialState === 'charging') {
    boss.attackCooldown = (boss.attackCooldown || 850) - dt;
    // Charge trail particles
    if (Math.random() < 0.65) {
      ctx.particles.push({
        x: boss.x + (Math.random() - 0.5) * boss.radius,
        y: boss.y + (Math.random() - 0.5) * boss.radius,
        vx: -Math.cos(boss.angle) * 3.5 + (Math.random() - 0.5) * 2,
        vy: -Math.sin(boss.angle) * 3.5 + (Math.random() - 0.5) * 2,
        radius: 4,
        color: boss.color || '#ef4444',
        alpha: 0.85,
        life: 0,
        maxLife: 15,
        decay: 0.07,
        shape: 'smoke'
      });
    }

    if (boss.attackCooldown <= 0) {
      boss.bossSpecialState = 'idle';
      boss.speed = boss.baseSpeed;
    }
  }

  // 3. BOSS ATTACK TIMER COUNTDOWN
  boss.bossAttackTimer = (boss.bossAttackTimer || 2600) - dt;
  if (boss.bossAttackTimer > 0) return;

  // Determine attack interval based on wave / enraged state
  const isEnraged = ctx.wave >= 6 || (boss.hp / boss.maxHp) < 0.35;
  boss.bossAttackTimer = isEnraged ? 2000 + Math.random() * 800 : 2700 + Math.random() * 1100;

  const meta = BOSS_SKILL_DATABASE[boss.type] || BOSS_SKILL_DATABASE['boss_mutant'];
  const skillRoll = Math.random();

  // =========================================================================
  // WAVE 1: TRÙM ĐỘT BIẾN HUỶ DIỆT (boss_mutant)
  // Specialty: Seismic Ground Slam, Violent Rush Charge, Triple Acid Mortar
  // =========================================================================
  if (boss.type === 'boss_mutant') {
    if (skillRoll < 0.38) {
      // SKILL 1: SEISMIC GROUND SLAM (Địa Chấn Tàn Phá)
      boss.bossSpecialState = 'slamming';
      ctx.screenShake = 22;
      soundManager.playExplosion();

      // Shockwave ring particles
      for (let i = 0; i < 28; i++) {
        const swAngle = (i / 28) * Math.PI * 2;
        ctx.particles.push({
          x: boss.x,
          y: boss.y,
          vx: Math.cos(swAngle) * 7.5,
          vy: Math.sin(swAngle) * 7.5,
          radius: 4,
          color: '#e11d48',
          alpha: 1,
          life: 0,
          maxLife: 20,
          decay: 0.05,
          shape: 'smoke'
        });
      }

      // If player is close, knock back & damage
      if (distToPlayer < 240) {
        p.hp = Math.max(0, p.hp - Math.round(boss.damage * 0.7));
        soundManager.playPlayerHurt();
        const pKnockAngle = Math.atan2(p.y - boss.y, p.x - boss.x);
        p.x += Math.cos(pKnockAngle) * 45;
        p.y += Math.sin(pKnockAngle) * 45;
      }

      // Spawn 3-4 Toxic Puddles on the battlefield
      const puddleCount = 3 + Math.floor(Math.random() * 2);
      for (let k = 0; k < puddleCount; k++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = 60 + Math.random() * 160;
        ctx.bossHazards.push({
          id: Math.random().toString(),
          type: 'toxic_pool',
          x: boss.x + Math.cos(pAngle) * pDist,
          y: boss.y + Math.sin(pAngle) * pDist,
          radius: 34 + Math.random() * 12,
          timer: 6500,
          maxTimer: 6500,
          damage: 9,
          color: '#22c55e',
          dpsInterval: 450,
          lastDpsTime: 0
        });
      }

      boss.currentSkillName = '💥 ĐỊA CHẤN TÀN PHÁ!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '💥 ĐỊA CHẤN TÀN PHÁ & VŨNG ĐỘC!',
        color: '#f43f5e',
        alpha: 1,
        life: 50,
        isCrit: true
      });
    } else if (skillRoll < 0.72 && distToPlayer > 120 && distToPlayer < 520) {
      // SKILL 2: FURIOUS RUSH CHARGE (Lao Húc Tàn Bạo)
      boss.bossSpecialState = 'charging';
      boss.attackCooldown = 900;
      boss.speed = boss.baseSpeed * 2.8;
      ctx.screenShake = 16;
      boss.currentSkillName = '⚡ LAO HÚC TÀN BẠO!';

      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '⚡ GẦM RÚ LAO HÚC TỐC ĐỘ CAO!',
        color: '#fbbf24',
        alpha: 1,
        life: 45,
        isCrit: true
      });
    } else {
      // SKILL 3: TRIPLE ACID MORTAR (Pháo Axit Tam Hướng)
      [-0.3, 0, 0.3].forEach(offset => {
        const ang = angleToPlayer + offset;
        ctx.bullets.push({
          id: Math.random().toString(),
          x: boss.x + Math.cos(ang) * (boss.radius + 10),
          y: boss.y + Math.sin(ang) * (boss.radius + 10),
          vx: Math.cos(ang) * 7.2,
          vy: Math.sin(ang) * 7.2,
          damage: Math.round(boss.damage * 0.48),
          pierceLeft: 1,
          rangeLeft: 520,
          radius: 7,
          color: '#84cc16',
          knockback: 2,
          isEnemyBullet: true
        });
      });

      boss.currentSkillName = '☣️ PHÁO AXIT TAM HƯỚNG!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '☣️ NÃ PHÁO AXIT TAM HƯỚNG!',
        color: '#84cc16',
        alpha: 1,
        life: 40
      });
    }
  }

  // =========================================================================
  // WAVE 2: CHÚA TỂ HỖN MANG (boss_abomination)
  // Specialty: Shadow Blink, Tentacle Pull, Chaos Splitter Sphere
  // =========================================================================
  else if (boss.type === 'boss_abomination') {
    if (skillRoll < 0.36) {
      // SKILL 1: SHADOW BLINK (Dịch Chuyển Bóng Tối)
      boss.bossSpecialState = 'invisible';
      boss.invisibleTimer = 650; // ms in the shadow realm
      soundManager.playDash();

      // Shadow burst upon vanish
      for (let i = 0; i < 24; i++) {
        const swAngle = Math.random() * Math.PI * 2;
        const spd = 3 + Math.random() * 4;
        ctx.particles.push({
          x: boss.x,
          y: boss.y,
          vx: Math.cos(swAngle) * spd,
          vy: Math.sin(swAngle) * spd,
          radius: 4,
          color: '#a855f7',
          alpha: 1,
          life: 0,
          maxLife: 20,
          decay: 0.06,
          shape: 'smoke'
        });
      }

      boss.currentSkillName = '🌌 DỊCH CHUYỂN BÓNG TỐI!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🌌 DỊCH CHUYỂN BÓNG TỐI...',
        color: '#c084fc',
        alpha: 1,
        life: 40,
        isCrit: true
      });
    } else if (skillRoll < 0.70 && distToPlayer < 500) {
      // SKILL 2: SHADOW TENTACLE PULL (Xúc Tu Hắc Ám Bắt Kéo)
      ctx.tentacleHooks.push({
        id: Math.random().toString(),
        bossId: boss.id,
        startX: boss.x,
        startY: boss.y,
        currentX: boss.x,
        currentY: boss.y,
        targetX: p.x,
        targetY: p.y,
        retracting: false,
        timer: 800,
        color: '#9333ea'
      });

      boss.currentSkillName = '🕸️ XÚC TU HẮC ÁM!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🕸️ XÚC TU HẮC ÁM PHÓNG TỚI!',
        color: '#a855f7',
        alpha: 1,
        life: 45
      });
    } else {
      // SKILL 3: CHAOS SPLITTER SPHERE (Cầu Hỗn Mang Phân Tử)
      ctx.bullets.push({
        id: Math.random().toString(),
        x: boss.x + Math.cos(angleToPlayer) * (boss.radius + 12),
        y: boss.y + Math.sin(angleToPlayer) * (boss.radius + 12),
        vx: Math.cos(angleToPlayer) * 4.5,
        vy: Math.sin(angleToPlayer) * 4.5,
        damage: Math.round(boss.damage * 0.65),
        pierceLeft: 1,
        rangeLeft: 380,
        radius: 12,
        color: '#7e22ce',
        knockback: 3,
        isEnemyBullet: true,
        splitOnDeath: true,
        splitCount: 8
      });

      boss.currentSkillName = '🔮 CẦU HỖN MANG PHÂN TỬ!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🔮 CẦU HỖN MANG PHÂN RÃ!',
        color: '#d8b4fe',
        alpha: 1,
        life: 45,
        isCrit: true
      });
    }
  }

  // =========================================================================
  // WAVE 3: QUÁI VẬT CYBER MECHA (boss_cyber_behemoth)
  // Specialty: Sweeping Laser Death Ray, Homing Swarm Missiles, Shield & EMP
  // =========================================================================
  else if (boss.type === 'boss_cyber_behemoth') {
    if (skillRoll < 0.38) {
      // SKILL 1: SWEEPING LASER DEATH RAY (Tia Quét Laser Tử Thần 70°)
      const sweepSweep = 1.25; // radians (~72 deg)
      const startAng = angleToPlayer - sweepSweep / 2;
      const endAng = angleToPlayer + sweepSweep / 2;

      ctx.sweepingLasers.push({
        id: Math.random().toString(),
        bossId: boss.id,
        x: boss.x,
        y: boss.y,
        currentAngle: startAng,
        startAngle: startAng,
        endAngle: endAng,
        range: 660,
        width: 14,
        state: 'charging',
        timer: 800,
        maxTimer: 800,
        damage: Math.round(boss.damage * 0.4)
      });

      boss.currentSkillName = '🔴 TIA QUÉT LASER TỬ THẦN!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🔴 TỤ NĂNG LƯỢNG QUÉT LASER ĐỎ!',
        color: '#ef4444',
        alpha: 1,
        life: 55,
        isCrit: true
      });
    } else if (skillRoll < 0.72) {
      // SKILL 2: HOMING SWARM MISSILES (Loạt Tên Lửa Tầm Nhiệt)
      for (let m = 0; m < 3; m++) {
        const offsetAng = angleToPlayer + (m - 1) * 0.45;
        ctx.bullets.push({
          id: Math.random().toString(),
          x: boss.x + Math.cos(offsetAng) * (boss.radius + 10),
          y: boss.y + Math.sin(offsetAng) * (boss.radius + 10),
          vx: Math.cos(offsetAng) * 4.8,
          vy: Math.sin(offsetAng) * 4.8,
          damage: Math.round(boss.damage * 0.52),
          pierceLeft: 1,
          rangeLeft: 700,
          radius: 6.5,
          color: '#06b6d4',
          knockback: 2,
          isEnemyBullet: true,
          isHoming: true,
          homingSpeed: 5.6,
          homingTurnRate: 0.038
        });
      }

      boss.currentSkillName = '🚀 LOẠT TÊN LỬA TẦM NHIỆT!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🚀 KHAI HỎA 3 TÊN LỬA TẦM NHIỆT!',
        color: '#06b6d4',
        alpha: 1,
        life: 45
      });
    } else {
      // SKILL 3: OVERCLOCKED ENERGY BARRIER & EMP (Khiên Năng Lượng & EMP)
      boss.bossSpecialState = 'shielded';
      boss.shieldTimer = 4000;
      ctx.screenShake = 14;

      // EMP wave
      for (let i = 0; i < 20; i++) {
        const empAng = (i / 20) * Math.PI * 2;
        ctx.particles.push({
          x: boss.x,
          y: boss.y,
          vx: Math.cos(empAng) * 6,
          vy: Math.sin(empAng) * 6,
          radius: 3,
          color: '#38bdf8',
          alpha: 1,
          life: 0,
          maxLife: 18,
          decay: 0.05,
          shape: 'spark'
        });
      }

      boss.currentSkillName = '🛡️ KHIÊN ĐIỆN TỪ HẤP THỤ!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🛡️ KÍCH HOẠT KHIÊN HẤP THỤ CYAN!',
        color: '#38bdf8',
        alpha: 1,
        life: 50,
        isCrit: true
      });
    }
  }

  // =========================================================================
  // WAVE 4: BẠO CHÚA LỬA ĐỊA NGỤC (boss_inferno_titan)
  // Specialty: Molten Meteor Shower, Spiral Flame Wheel, Molten Footprints
  // =========================================================================
  else if (boss.type === 'boss_inferno_titan') {
    if (skillRoll < 0.40) {
      // SKILL 1: MOLTEN METEOR SHOWER (Mưa Thiên Thạch Dung Nham)
      // Drop 3 meteors near player
      for (let m = 0; m < 3; m++) {
        const offsetDist = 30 + Math.random() * 140;
        const offsetAng = Math.random() * Math.PI * 2;
        ctx.bossHazards.push({
          id: Math.random().toString(),
          type: 'meteor_target',
          x: Math.max(60, Math.min(2740, p.x + Math.cos(offsetAng) * offsetDist)),
          y: Math.max(60, Math.min(2740, p.y + Math.sin(offsetAng) * offsetDist)),
          radius: 55,
          timer: 1250,
          maxTimer: 1250,
          damage: Math.round(boss.damage * 0.9),
          color: '#ea580c'
        });
      }

      boss.currentSkillName = '☄️ MƯA THIÊN THẠCH DUNG NHAM!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '☄️ MƯA THIÊN THẠCH DUNG NHAM RƠI!',
        color: '#f97316',
        alpha: 1,
        life: 55,
        isCrit: true
      });
    } else if (skillRoll < 0.75) {
      // SKILL 2: SPIRAL FLAME WHEEL (Bão Lửa Luân Hồi 12 Hướng)
      ctx.screenShake = 16;
      for (let d = 0; d < 12; d++) {
        const fAng = (d / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.1;
        ctx.bullets.push({
          id: Math.random().toString(),
          x: boss.x + Math.cos(fAng) * (boss.radius + 10),
          y: boss.y + Math.sin(fAng) * (boss.radius + 10),
          vx: Math.cos(fAng) * 6.5,
          vy: Math.sin(fAng) * 6.5,
          damage: Math.round(boss.damage * 0.45),
          pierceLeft: 1,
          rangeLeft: 580,
          radius: 7.5,
          color: '#f97316',
          knockback: 2,
          isEnemyBullet: true
        });
      }

      boss.currentSkillName = '🌀 BÃO LỬA LUÂN HỒI!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🌀 BÃI ĐẠN BÃO LỬA LUÂN HỒI!',
        color: '#f97316',
        alpha: 1,
        life: 45
      });
    } else {
      // SKILL 3: LAVA ERUPTION STOMP (Dậm Dung Nham Rực Cháy)
      for (let k = 0; k < 4; k++) {
        const lAngle = Math.random() * Math.PI * 2;
        const lDist = 50 + Math.random() * 120;
        ctx.bossHazards.push({
          id: Math.random().toString(),
          type: 'lava_pool',
          x: boss.x + Math.cos(lAngle) * lDist,
          y: boss.y + Math.sin(lAngle) * lDist,
          radius: 36,
          timer: 7000,
          maxTimer: 7000,
          damage: 12,
          color: '#ea580c',
          dpsInterval: 400,
          lastDpsTime: 0
        });
      }

      boss.currentSkillName = '🔥 VƯỜN LỬA DUNG NHAM!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🔥 DẬM ĐẤT BÙNG NỔ DUNG NHAM!',
        color: '#ea580c',
        alpha: 1,
        life: 40
      });
    }
  }

  // =========================================================================
  // WAVE 5+: TỬ THẦN HƯ VÔ TỐI THƯỢNG (boss_void_reaper)
  // Specialty: Singularity Black Hole, Void Scythe Waves, Shadow Doppelganger
  // =========================================================================
  else if (boss.type === 'boss_void_reaper') {
    if (skillRoll < 0.36) {
      // SKILL 1: SINGULARITY BLACK HOLE (Hố Đen Trọng Lực Hư Vô)
      // Spawn near player but not directly on top
      const bhOffsetDist = 120 + Math.random() * 100;
      const bhAng = Math.random() * Math.PI * 2;
      ctx.bossHazards.push({
        id: Math.random().toString(),
        type: 'black_hole',
        x: Math.max(100, Math.min(2700, p.x + Math.cos(bhAng) * bhOffsetDist)),
        y: Math.max(100, Math.min(2700, p.y + Math.sin(bhAng) * bhOffsetDist)),
        radius: 40,
        timer: 6000,
        maxTimer: 6000,
        damage: 14,
        color: '#6366f1',
        pullRadius: 360,
        pullForce: 2.2,
        dpsInterval: 350,
        lastDpsTime: 0
      });

      boss.currentSkillName = '🕳️ HỐ ĐEN TRỌNG LỰC HƯ VÔ!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '🕳️ HỐ ĐEN TRỌNG LỰC XUẤT HIỆN!',
        color: '#818cf8',
        alpha: 1,
        life: 55,
        isCrit: true
      });
    } else if (skillRoll < 0.74) {
      // SKILL 2: TRIPLE VOID SCYTHE WAVE (Trảm Kích Hư Vô Tam Đoạn)
      [-0.22, 0, 0.22].forEach(wOffset => {
        const scytheAng = angleToPlayer + wOffset;
        ctx.bullets.push({
          id: Math.random().toString(),
          x: boss.x + Math.cos(scytheAng) * (boss.radius + 15),
          y: boss.y + Math.sin(scytheAng) * (boss.radius + 15),
          vx: Math.cos(scytheAng) * 8.2,
          vy: Math.sin(scytheAng) * 8.2,
          damage: Math.round(boss.damage * 0.65),
          pierceLeft: 3,
          rangeLeft: 680,
          radius: 12,
          color: '#818cf8',
          knockback: 4,
          isEnemyBullet: true,
          isVoidWave: true,
          waveWidth: 60
        });
      });

      boss.currentSkillName = '⚔️ TRẢM KÍCH HƯ VÔ TAM ĐOẠN!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '⚔️ TRẢM KÍCH SÓNG HƯ VÔ TỬ THẦN!',
        color: '#a5b4fc',
        alpha: 1,
        life: 50,
        isCrit: true
      });
    } else if (!boss.hasSpawnedClone && (boss.hp / boss.maxHp) < 0.6) {
      // SKILL 3: SHADOW CLONE (Phân Thân Hư Vô)
      boss.hasSpawnedClone = true;
      const cloneAng = Math.random() * Math.PI * 2;
      ctx.zombies.push({
        id: `clone_${Math.random().toString()}`,
        type: 'boss_void_reaper',
        x: boss.x + Math.cos(cloneAng) * 90,
        y: boss.y + Math.sin(cloneAng) * 90,
        radius: boss.radius * 0.8,
        hp: Math.round(boss.maxHp * 0.28),
        maxHp: Math.round(boss.maxHp * 0.28),
        speed: boss.speed * 1.1,
        baseSpeed: boss.baseSpeed * 1.1,
        damage: Math.round(boss.damage * 0.6),
        scoreValue: 4000,
        goldValue: 800,
        color: '#4338ca',
        angle: 0,
        animationFrame: 0,
        frozenTimer: 0,
        burnTimer: 0,
        poisonTimer: 0,
        attackCooldown: 1500,
        isBoss: true,
        isClone: true,
        bossSpecialState: 'idle',
        bossAttackTimer: 2500
      });

      boss.currentSkillName = '👥 ẢO ẢNH PHÂN THÂN BÓNG MA!';
      ctx.floatingTexts.push({
        id: Math.random().toString(),
        x: boss.x,
        y: boss.y - 35,
        text: '👥 PHÂN TÁCH ẢO ẢNH HƯ VÔ!',
        color: '#818cf8',
        alpha: 1,
        life: 60,
        isCrit: true
      });
    } else {
      // Fallback: 8-way Void Nova Burst
      for (let d = 0; d < 8; d++) {
        const novaAng = (d / 8) * Math.PI * 2;
        ctx.bullets.push({
          id: Math.random().toString(),
          x: boss.x + Math.cos(novaAng) * (boss.radius + 10),
          y: boss.y + Math.sin(novaAng) * (boss.radius + 10),
          vx: Math.cos(novaAng) * 7.5,
          vy: Math.sin(novaAng) * 7.5,
          damage: Math.round(boss.damage * 0.5),
          pierceLeft: 1,
          rangeLeft: 520,
          radius: 7,
          color: '#818cf8',
          knockback: 3,
          isEnemyBullet: true
        });
      }
    }
  }
}

/**
 * Update and apply physics/damage for Boss Hazards (Toxic pools, Lava, Meteors, Black Holes)
 */
export function updateBossHazards(
  ctx: BossSkillContext,
  dt: number,
  currentTime: number,
  triggerExplosion: (x: number, y: number, radius: number, damage: number) => void,
  onPlayerHit: (dmg: number) => void
) {
  const p = ctx.player;

  for (let i = ctx.bossHazards.length - 1; i >= 0; i--) {
    const hz = ctx.bossHazards[i];
    hz.timer -= dt;

    if (hz.timer <= 0) {
      // Meteor Impact
      if (hz.type === 'meteor_target') {
        triggerExplosion(hz.x, hz.y, 180, hz.damage);
        ctx.screenShake = 22;

        // Leave lingering lava pool
        ctx.bossHazards.push({
          id: Math.random().toString(),
          type: 'lava_pool',
          x: hz.x,
          y: hz.y,
          radius: 42,
          timer: 6500,
          maxTimer: 6500,
          damage: 14,
          color: '#ea580c',
          dpsInterval: 400,
          lastDpsTime: 0
        });
      }

      ctx.bossHazards.splice(i, 1);
      continue;
    }

    // A. TOXIC & LAVA POOLS: DPS to Player when standing inside
    if (hz.type === 'toxic_pool' || hz.type === 'lava_pool') {
      const distToPlayer = Math.hypot(p.x - hz.x, p.y - hz.y);
      if (distToPlayer < hz.radius + p.radius) {
        // Slow player slightly
        p.speed = Math.max(1.8, p.speed * 0.95);

        if (currentTime - (hz.lastDpsTime || 0) > (hz.dpsInterval || 400)) {
          hz.lastDpsTime = currentTime;
          onPlayerHit(hz.damage);
        }
      }
    }

    // B. BLACK HOLE: Gravitational pull on Player and bending enemy/player bullets
    if (hz.type === 'black_hole') {
      const distToPlayer = Math.hypot(p.x - hz.x, p.y - hz.y);
      if (distToPlayer < (hz.pullRadius || 360)) {
        const pullFactor = (1 - distToPlayer / (hz.pullRadius || 360)) * (hz.pullForce || 2.2);
        const pullAng = Math.atan2(hz.y - p.y, hz.x - p.x);
        p.x += Math.cos(pullAng) * pullFactor;
        p.y += Math.sin(pullAng) * pullFactor;

        // High damage if trapped in the center event horizon
        if (distToPlayer < hz.radius + p.radius) {
          if (currentTime - (hz.lastDpsTime || 0) > (hz.dpsInterval || 350)) {
            hz.lastDpsTime = currentTime;
            onPlayerHit(hz.damage);
          }
        }
      }

      // Slightly curve bullets towards black hole
      ctx.bullets.forEach(b => {
        const bDist = Math.hypot(hz.x - b.x, hz.y - b.y);
        if (bDist < 200) {
          const bAngle = Math.atan2(hz.y - b.y, hz.x - b.x);
          b.vx += Math.cos(bAngle) * 0.45;
          b.vy += Math.sin(bAngle) * 0.45;
        }
      });
    }
  }
}

/**
 * Update Sweeping Laser Beams (Cyber Mecha Boss)
 */
export function updateSweepingLasers(
  ctx: BossSkillContext,
  dt: number,
  onPlayerHit: (dmg: number) => void
) {
  const p = ctx.player;

  for (let i = ctx.sweepingLasers.length - 1; i >= 0; i--) {
    const laser = ctx.sweepingLasers[i];
    const boss = ctx.zombies.find(z => z.id === laser.bossId);
    if (boss) {
      laser.x = boss.x;
      laser.y = boss.y;
    }

    laser.timer -= dt;

    if (laser.state === 'charging') {
      if (laser.timer <= 0) {
        laser.state = 'firing';
        laser.timer = 1800; // firing duration
        laser.maxTimer = 1800;
        soundManager.playExplosion();
      }
    } else if (laser.state === 'firing') {
      // Sweep angle from startAngle to endAngle
      const progress = 1 - (laser.timer / laser.maxTimer);
      laser.currentAngle = laser.startAngle + (laser.endAngle - laser.startAngle) * progress;

      // Laser line collision with player
      const pAngle = Math.atan2(p.y - laser.y, p.x - laser.x);
      const pDist = Math.hypot(p.x - laser.x, p.y - laser.y);
      let angleDiff = Math.abs(pAngle - laser.currentAngle);
      while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

      if (pDist < laser.range && angleDiff < 0.12) {
        onPlayerHit(laser.damage);
      }

      if (laser.timer <= 0) {
        ctx.sweepingLasers.splice(i, 1);
      }
    }
  }
}

/**
 * Update Tentacle Hooks (Chaotic Abomination Boss)
 */
export function updateTentacleHooks(
  ctx: BossSkillContext,
  dt: number,
  onPlayerHit: (dmg: number) => void
) {
  const p = ctx.player;

  for (let i = ctx.tentacleHooks.length - 1; i >= 0; i--) {
    const hook = ctx.tentacleHooks[i];
    const boss = ctx.zombies.find(z => z.id === hook.bossId);
    if (boss) {
      hook.startX = boss.x;
      hook.startY = boss.y;
    }

    hook.timer -= dt;

    if (!hook.retracting) {
      // Extend toward target
      const hookAngle = Math.atan2(hook.targetY - hook.currentY, hook.targetX - hook.currentX);
      hook.currentX += Math.cos(hookAngle) * 18;
      hook.currentY += Math.sin(hookAngle) * 18;

      // Check hit player
      const distToPlayer = Math.hypot(p.x - hook.currentX, p.y - hook.currentY);
      if (distToPlayer < p.radius + 15) {
        hook.retracting = true;
        onPlayerHit(20);
        // Drag player towards boss
        if (boss) {
          const pullAngle = Math.atan2(boss.y - p.y, boss.x - p.x);
          p.x += Math.cos(pullAngle) * 65;
          p.y += Math.sin(pullAngle) * 65;
        }
      }

      const distToTarget = Math.hypot(hook.targetX - hook.currentX, hook.targetY - hook.currentY);
      if (distToTarget < 20 || hook.timer <= 400) {
        hook.retracting = true;
      }
    } else {
      // Retract toward start
      const retAngle = Math.atan2(hook.startY - hook.currentY, hook.startX - hook.currentX);
      hook.currentX += Math.cos(retAngle) * 22;
      hook.currentY += Math.sin(retAngle) * 22;

      if (Math.hypot(hook.startX - hook.currentX, hook.startY - hook.currentY) < 30 || hook.timer <= 0) {
        ctx.tentacleHooks.splice(i, 1);
      }
    }
  }
}

/**
 * Render all Boss Hazards, Lasers, Hooks on the Canvas.
 */
export function renderBossSpecialEffects(
  ctx: CanvasRenderingContext2D,
  hazards: BossHazard[],
  sweepingLasers: SweepingLaser[],
  tentacleHooks: TentacleHook[],
  time: number
) {
  // 1. RENDER HAZARDS
  hazards.forEach(hz => {
    ctx.save();

    if (hz.type === 'toxic_pool') {
      // Toxic bubbling green sludge
      ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fill();

      // Boiling bubbles
      ctx.fillStyle = '#86efac';
      for (let b = 0; b < 4; b++) {
        const bx = hz.x + Math.sin(time * 0.005 + b * 1.5) * (hz.radius * 0.6);
        const by = hz.y + Math.cos(time * 0.006 + b * 2.1) * (hz.radius * 0.6);
        const bRad = 3 + Math.sin(time * 0.01 + b) * 2;
        ctx.beginPath();
        ctx.arc(bx, by, Math.max(1, bRad), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (hz.type === 'lava_pool') {
      // Molten orange/red magma
      ctx.fillStyle = 'rgba(234, 88, 12, 0.55)';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing magma crust fissures
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hz.x - hz.radius * 0.5, hz.y);
      ctx.lineTo(hz.x + hz.radius * 0.5, hz.y);
      ctx.moveTo(hz.x, hz.y - hz.radius * 0.5);
      ctx.lineTo(hz.x, hz.y + hz.radius * 0.5);
      ctx.stroke();
    } else if (hz.type === 'meteor_target') {
      // Pulsing red danger reticle with collapsing countdown ring
      const progress = hz.timer / hz.maxTimer;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Collapsing inner ring
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, Math.max(1, hz.radius * Math.max(0, progress)), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Center crosshair
      ctx.beginPath();
      ctx.moveTo(hz.x - 12, hz.y);
      ctx.lineTo(hz.x + 12, hz.y);
      ctx.moveTo(hz.x, hz.y - 12);
      ctx.lineTo(hz.x, hz.y + 12);
      ctx.stroke();
    } else if (hz.type === 'black_hole') {
      // Swirling cosmic purple singularity
      const rot = (time * 0.004) % (Math.PI * 2);
      ctx.save();
      ctx.translate(hz.x, hz.y);
      ctx.rotate(rot);

      // Outer accretion disk
      const gradRadius = Math.max(12, (hz.radius || 30) * 1.6);
      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, gradRadius);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.4, '#4338ca');
      grad.addColorStop(0.8, '#818cf8');
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, gradRadius, 0, Math.PI * 2);
      ctx.fill();

      // Spiral arms
      ctx.strokeStyle = '#c7d2fe';
      ctx.lineWidth = 2.5;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, (hz.radius || 30) * (0.5 + s * 0.3)), s * 2, s * 2 + Math.PI);
        ctx.stroke();
      }

      // Event horizon black core
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2, (hz.radius || 30) * 0.45), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  });

  // 2. RENDER SWEEPING LASERS
  sweepingLasers.forEach(laser => {
    ctx.save();
    if (laser.state === 'charging') {
      // Dotted red targeting indicator
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(
        laser.x + Math.cos(laser.currentAngle) * laser.range,
        laser.y + Math.sin(laser.currentAngle) * laser.range
      );
      ctx.stroke();
    } else if (laser.state === 'firing') {
      // Blazing red death ray beam
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = laser.width;
      ctx.shadowColor = '#dc2626';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(laser.x, laser.y);
      ctx.lineTo(
        laser.x + Math.cos(laser.currentAngle) * laser.range,
        laser.y + Math.sin(laser.currentAngle) * laser.range
      );
      ctx.stroke();

      // White inner core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = laser.width * 0.45;
      ctx.stroke();
    }
    ctx.restore();
  });

  // 3. RENDER TENTACLE HOOKS
  tentacleHooks.forEach(hook => {
    ctx.save();
    ctx.strokeStyle = hook.color;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = hook.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(hook.startX, hook.startY);
    ctx.lineTo(hook.currentX, hook.currentY);
    ctx.stroke();

    // Barbed tip
    ctx.fillStyle = '#d8b4fe';
    ctx.beginPath();
    ctx.arc(hook.currentX, hook.currentY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
