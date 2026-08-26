import React, { useRef, useEffect, useCallback } from 'react';
import { 
  PlayerStats, Weapon, WeaponType, Zombie, Bullet, 
  Particle, Decal, DropItem, ActiveTurret, FloatingText, 
  Obstacle, ActiveBuffs, GameDifficulty, GameMode, PowerUpType,
  MapEnvironmentId
} from '../types/game';
import { MAP_SIZE, ZOMBIE_TEMPLATES } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { renderWarrior } from '../utils/renderWarrior';
import { renderZombie } from '../utils/renderZombie';
import { renderMapEnvironment } from '../utils/renderMapEnvironment';
import { renderObstacles } from '../utils/renderObstacles';
import { renderDrops } from '../utils/renderDrops';

interface GameCanvasProps {
  player: PlayerStats;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerStats>>;
  currentWeapon: Weapon;
  weapons: Record<string, Weapon>;
  setWeapons: React.Dispatch<React.SetStateAction<Record<string, Weapon>>>;
  wave: number;
  setWave: React.Dispatch<React.SetStateAction<number>>;
  totalZombiesInWave: number;
  setTotalZombiesInWave: React.Dispatch<React.SetStateAction<number>>;
  zombiesRemaining: number;
  setZombiesRemaining: React.Dispatch<React.SetStateAction<number>>;
  bossHp: { current: number; max: number; name: string } | null;
  setBossHp: React.Dispatch<React.SetStateAction<{ current: number; max: number; name: string } | null>>;
  activeBuffs: ActiveBuffs;
  setActiveBuffs: React.Dispatch<React.SetStateAction<ActiveBuffs>>;
  isReloading: boolean;
  setIsReloading: React.Dispatch<React.SetStateAction<boolean>>;
  reloadProgress: number;
  setReloadProgress: React.Dispatch<React.SetStateAction<number>>;
  difficulty: GameDifficulty;
  mode: GameMode;
  selectedMapId?: MapEnvironmentId;
  isPaused: boolean;
  isShopOpen: boolean;
  onGameOver: () => void;
  // External inputs from VirtualControls
  touchMoveInput: { dx: number; dy: number };
  touchAimInput: { angle: number; isShooting: boolean };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  setPlayer,
  currentWeapon,
  weapons,
  setWeapons,
  wave,
  setWave,
  totalZombiesInWave,
  setTotalZombiesInWave,
  zombiesRemaining,
  setZombiesRemaining,
  bossHp,
  setBossHp,
  activeBuffs,
  setActiveBuffs,
  isReloading,
  setIsReloading,
  reloadProgress,
  setReloadProgress,
  difficulty,
  mode,
  selectedMapId = 'rooftop',
  isPaused,
  isShopOpen,
  onGameOver,
  touchMoveInput,
  touchAimInput
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game State in Ref to achieve steady 60 FPS without React re-render lag
  const stateRef = useRef<{
    player: PlayerStats;
    currentWeapon: Weapon;
    weapons: Record<string, Weapon>;
    zombies: Zombie[];
    bullets: Bullet[];
    particles: Particle[];
    decals: Decal[];
    drops: DropItem[];
    turrets: ActiveTurret[];
    floatingTexts: FloatingText[];
    obstacles: Obstacle[];
    activeBuffs: ActiveBuffs;
    isReloading: boolean;
    reloadTimer: number;
    reloadDuration: number;
    wave: number;
    zombiesToSpawn: number;
    lastSpawnTime: number;
    mousePos: { x: number; y: number };
    isMouseDown: boolean;
    keysDown: Record<string, boolean>;
    camera: { x: number; y: number };
    lastTime: number;
    screenShake: number;
    waveTransitionTimer: number;
    isWaveEnding: boolean;
  }>({
    player: { ...player },
    currentWeapon: { ...currentWeapon },
    weapons: { ...weapons },
    zombies: [],
    bullets: [],
    particles: [],
    decals: [],
    drops: [],
    turrets: [],
    floatingTexts: [],
    obstacles: [],
    activeBuffs: { ...activeBuffs },
    isReloading: false,
    reloadTimer: 0,
    reloadDuration: 0,
    wave,
    zombiesToSpawn: 0,
    lastSpawnTime: 0,
    mousePos: { x: 0, y: 0 },
    isMouseDown: false,
    keysDown: {},
    camera: { x: player.x, y: player.y },
    lastTime: performance.now(),
    screenShake: 0,
    waveTransitionTimer: 0,
    isWaveEnding: false
  });

  // Sync props to stateRef when weapons/player change from Shop or UI
  useEffect(() => {
    const p = stateRef.current.player;
    if (p) {
      p.gold = player.gold;
      p.hp = player.hp;
      p.maxHp = player.maxHp;
      p.armor = player.armor;
      p.maxArmor = player.maxArmor;
      p.speed = player.speed;
      p.grenadeCount = player.grenadeCount;
      p.upgrades = { ...player.upgrades };
      p.warriorSkin = player.warriorSkin;
    }
  }, [player.gold, player.hp, player.maxHp, player.armor, player.maxArmor, player.speed, player.grenadeCount, player.upgrades, player.warriorSkin]);

  useEffect(() => {
    stateRef.current.currentWeapon = { ...currentWeapon };
    stateRef.current.weapons = { ...weapons };
  }, [currentWeapon, weapons]);

  useEffect(() => {
    stateRef.current.activeBuffs = { ...activeBuffs };
  }, [activeBuffs]);

  // Initialize Map-Specific Obstacles, Vehicles, Trees & Barrels
  useEffect(() => {
    const obs: Obstacle[] = [];
    const mapId = (selectedMapId as MapEnvironmentId) || 'rooftop';

    if (mapId === 'street') {
      // 1. Abandoned Vehicles (Police cars, Taxis, Civilian SUVs)
      const vehicleConfigs = [
        { variant: 'police', color: '#18181b', x: 380, y: 340, angle: 0.25, width: 92, height: 50, hp: 350 },
        { variant: 'taxi', color: '#eab308', x: 860, y: 560, angle: -0.18, width: 88, height: 48, hp: 300 },
        { variant: 'car', color: '#0f766e', x: 1250, y: 380, angle: 0.12, width: 90, height: 48, hp: 320 },
        { variant: 'car', color: '#be123c', x: 620, y: 940, angle: 0.35, width: 90, height: 48, hp: 320 },
        { variant: 'car', color: '#334155', x: 1450, y: 900, angle: -0.28, width: 94, height: 50, hp: 340 }
      ];
      vehicleConfigs.forEach((vc, idx) => {
        obs.push({
          id: `veh_${idx}`,
          x: vc.x,
          y: vc.y,
          width: vc.width,
          height: vc.height,
          type: 'vehicle',
          variant: vc.variant,
          color: vc.color,
          angle: vc.angle,
          hp: vc.hp,
          maxHp: vc.hp,
          isExplosive: true
        });
      });

      // 2. Street Trees (Lush green foliage & dead apocalyptic trees)
      const treeConfigs = [
        { x: 260, y: 220, variant: 'green', size: 70 },
        { x: 540, y: 180, variant: 'dead', size: 58 },
        { x: 1020, y: 220, variant: 'green', size: 72 },
        { x: 1400, y: 200, variant: 'green', size: 66 },
        { x: 280, y: 1120, variant: 'green', size: 72 },
        { x: 760, y: 1160, variant: 'dead', size: 60 },
        { x: 1180, y: 1130, variant: 'green', size: 74 },
        { x: 1580, y: 1100, variant: 'green', size: 68 }
      ];
      treeConfigs.forEach((tc, idx) => {
        obs.push({
          id: `tree_${idx}`,
          x: tc.x,
          y: tc.y,
          width: tc.size,
          height: tc.size,
          type: 'tree',
          variant: tc.variant,
          hp: 400,
          maxHp: 400
        });
      });

      // 3. Sandbags, Streetlights & Explosive Barrels
      for (let i = 0; i < 14; i++) {
        const isBarrel = Math.random() > 0.4;
        obs.push({
          id: `street_prop_${i}`,
          x: 250 + Math.random() * (MAP_SIZE.width - 500),
          y: 250 + Math.random() * (MAP_SIZE.height - 500),
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'sandbag',
          hp: isBarrel ? 30 : 250,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'rooftop') {
      // Rooftop: Heavy HVAC units with spinning fans, potted trees, crates, explosive tanks
      const hvacUnits = [
        { x: 340, y: 340, w: 76, h: 76 },
        { x: 1380, y: 340, w: 76, h: 76 },
        { x: 340, y: 960, w: 76, h: 76 },
        { x: 1380, y: 960, w: 76, h: 76 }
      ];
      hvacUnits.forEach((h, idx) => {
        obs.push({
          id: `hvac_${idx}`,
          x: h.x,
          y: h.y,
          width: h.w,
          height: h.h,
          type: 'hvac',
          hp: 500,
          maxHp: 500
        });
      });

      // Potted terrace shrubs & red barrels
      for (let i = 0; i < 18; i++) {
        const isBarrel = i % 2 === 0;
        obs.push({
          id: `roof_prop_${i}`,
          x: 260 + Math.random() * (MAP_SIZE.width - 520),
          y: 260 + Math.random() * (MAP_SIZE.height - 520),
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'tree',
          hp: isBarrel ? 30 : 200,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'bunker') {
      // Bunker: Server racks, toxic barrels, sandbag bastions
      const serverRacks = [
        { x: 420, y: 330, w: 90, h: 42 },
        { x: 720, y: 330, w: 90, h: 42 },
        { x: 1120, y: 330, w: 90, h: 42 },
        { x: 420, y: 970, w: 90, h: 42 },
        { x: 720, y: 970, w: 90, h: 42 },
        { x: 1120, y: 970, w: 90, h: 42 }
      ];
      serverRacks.forEach((sr, idx) => {
        obs.push({
          id: `srv_${idx}`,
          x: sr.x,
          y: sr.y,
          width: sr.w,
          height: sr.h,
          type: 'server',
          hp: 450,
          maxHp: 450
        });
      });

      for (let i = 0; i < 16; i++) {
        obs.push({
          id: `bunker_prop_${i}`,
          x: 250 + Math.random() * (MAP_SIZE.width - 500),
          y: 250 + Math.random() * (MAP_SIZE.height - 500),
          width: 36,
          height: 36,
          type: 'barrel',
          hp: 30,
          isExplosive: true
        });
      }
    } else {
      // Hospital: Ambulances, Gurneys, Crates, Oxygen Barrels
      obs.push({
        id: 'amb_1',
        x: 400,
        y: 420,
        width: 96,
        height: 52,
        type: 'vehicle',
        variant: 'ambulance',
        color: '#f8fafc',
        angle: 0.15,
        hp: 400,
        maxHp: 400,
        isExplosive: true
      });
      obs.push({
        id: 'amb_2',
        x: 1320,
        y: 860,
        width: 96,
        height: 52,
        type: 'vehicle',
        variant: 'ambulance',
        color: '#f8fafc',
        angle: -0.25,
        hp: 400,
        maxHp: 400,
        isExplosive: true
      });

      const gurneys = [
        { x: 560, y: 360 },
        { x: 940, y: 460 },
        { x: 1160, y: 720 },
        { x: 700, y: 900 }
      ];
      gurneys.forEach((g, idx) => {
        obs.push({
          id: `gurney_${idx}`,
          x: g.x,
          y: g.y,
          width: 56,
          height: 30,
          type: 'gurney',
          angle: (idx * 0.45),
          hp: 180,
          maxHp: 180
        });
      });

      for (let i = 0; i < 14; i++) {
        const isBarrel = Math.random() > 0.4;
        obs.push({
          id: `hosp_prop_${i}`,
          x: 250 + Math.random() * (MAP_SIZE.width - 500),
          y: 250 + Math.random() * (MAP_SIZE.height - 500),
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'crate',
          hp: isBarrel ? 30 : 250,
          isExplosive: isBarrel
        });
      }
    }

    stateRef.current.obstacles = obs;
    startWave(1);
  }, [selectedMapId]);

  const startWave = (waveNum: number) => {
    const state = stateRef.current;
    state.wave = waveNum;
    setWave(waveNum);

    const diffMult = difficulty === 'easy' ? 0.7 : difficulty === 'hard' ? 1.3 : difficulty === 'nightmare' ? 1.8 : 1.0;
    const baseCount = Math.floor((12 + waveNum * 6) * diffMult);
    
    state.zombiesToSpawn = baseCount;
    state.isWaveEnding = false;
    setTotalZombiesInWave(baseCount);
    setZombiesRemaining(baseCount);

    if (waveNum % 5 === 0) {
      soundManager.playBossAlarm();
    }
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      stateRef.current.keysDown[key] = true;

      // Reload
      if (key === 'r') {
        handleReload();
      }
      // Dash
      if (key === ' ' || key === 'space') {
        handleDash();
      }
      // Grenade
      if (key === 'g' || key === 'e') {
        handleGrenade();
      }
      // Weapon switch 1-7
      if (['1', '2', '3', '4', '5', '6', '7'].includes(key)) {
        const weaponKeys = Object.keys(stateRef.current.weapons) as WeaponType[];
        const idx = parseInt(key) - 1;
        if (idx < weaponKeys.length) {
          const targetWep = stateRef.current.weapons[weaponKeys[idx]];
          if (targetWep && targetWep.unlocked) {
            stateRef.current.currentWeapon = { ...targetWep };
            setWeapons(prev => ({ ...prev }));
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keysDown[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleReload = () => {
    const state = stateRef.current;
    const wep = state.currentWeapon;
    if (state.isReloading || wep.currentMag >= wep.magSize || wep.reserveAmmo === 0) return;

    soundManager.playReload();
    state.isReloading = true;
    setIsReloading(true);

    const reloadPerkMult = 1 - (state.player.upgrades.reloadLevel || 0) * 0.12;
    state.reloadDuration = wep.reloadTime * reloadPerkMult;
    state.reloadTimer = state.reloadDuration;
  };

  const handleDash = () => {
    const state = stateRef.current;
    const p = state.player;
    if (p.stamina < 30 || p.isDashing) return;

    soundManager.playDash();
    p.stamina -= 35;
    p.isDashing = true;
    p.dashTimer = 180; // ms
    p.invincibleTimer = 220;
  };

  const handleGrenade = () => {
    const state = stateRef.current;
    const p = state.player;
    if (p.grenadeCount <= 0) return;

    p.grenadeCount -= 1;
    setPlayer(prev => ({ ...prev, grenadeCount: prev.grenadeCount - 1 }));

    // Create huge area explosion at mouse target or ahead of player
    const targetX = p.x + Math.cos(p.angle) * 160;
    const targetY = p.y + Math.sin(p.angle) * 160;

    triggerExplosion(targetX, targetY, 220, 380);
  };

  const triggerExplosion = (x: number, y: number, radius: number, damage: number) => {
    const state = stateRef.current;
    soundManager.playExplosion();
    state.screenShake = 18;

    // Add crater decal
    state.decals.push({
      x,
      y,
      radius: radius * 0.6,
      color: '#1c1917',
      alpha: 0.8,
      type: 'crater'
    });

    // Spawn blast particles
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 6,
        color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
        alpha: 1,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        decay: 0.03,
        shape: 'fire'
      });
    }

    // Damage all zombies in radius
    state.zombies.forEach(z => {
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= radius) {
        const falloff = 1 - (dist / radius) * 0.5;
        const dealtDamage = Math.round(damage * falloff);
        z.hp -= dealtDamage;
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: z.x,
          y: z.y - 10,
          text: `-${dealtDamage}`,
          color: '#fbbf24',
          alpha: 1,
          life: 40,
          isCrit: true
        });

        // Knockback
        const kAngle = Math.atan2(z.y - y, z.x - x);
        z.x += Math.cos(kAngle) * 25;
        z.y += Math.sin(kAngle) * 25;
      }
    });

    // Explode nearby red barrels
    state.obstacles.forEach(obs => {
      if (obs.isExplosive && (obs.hp || 0) > 0) {
        const dist = Math.hypot(obs.x + obs.width / 2 - x, obs.y + obs.height / 2 - y);
        if (dist <= radius) {
          obs.hp = 0;
        }
      }
    });
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let lastShotTime = 0;
    let lastStateSync = 0;

    const loop = (currentTime: number) => {
      animationId = requestAnimationFrame(loop);

      const state = stateRef.current;
      const dt = Math.min(100, currentTime - state.lastTime);
      state.lastTime = currentTime;

      if (isPaused || isShopOpen) return;

      const p = state.player;
      const wep = state.currentWeapon;

      // Realtime periodic synchronization of Gold, Score, HP, Armor, Grenades back to React App State
      if (currentTime - lastStateSync > 60) {
        lastStateSync = currentTime;
        setPlayer(prev => {
          if (
            prev.gold !== p.gold ||
            prev.hp !== p.hp ||
            prev.armor !== p.armor ||
            prev.score !== p.score ||
            prev.kills !== p.kills ||
            prev.headshots !== p.headshots ||
            prev.combo !== p.combo ||
            prev.multiplier !== p.multiplier ||
            prev.grenadeCount !== p.grenadeCount
          ) {
            return {
              ...prev,
              gold: p.gold,
              hp: p.hp,
              armor: p.armor,
              score: p.score,
              kills: p.kills,
              headshots: p.headshots,
              combo: p.combo,
              multiplier: p.multiplier,
              grenadeCount: p.grenadeCount
            };
          }
          return prev;
        });
      }

      // 1. RECOVERY & TIMERS
      p.stamina = Math.min(p.maxStamina, p.stamina + 0.35);
      if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
      if (p.dashTimer > 0) p.dashTimer -= dt;
      else p.isDashing = false;

      // Active Buff Timers
      if (state.activeBuffs.doubleDamageTimer > 0) state.activeBuffs.doubleDamageTimer -= dt;
      if (state.activeBuffs.speedBoostTimer > 0) state.activeBuffs.speedBoostTimer -= dt;
      if (state.activeBuffs.freezeEnemiesTimer > 0) state.activeBuffs.freezeEnemiesTimer -= dt;
      if (state.activeBuffs.shieldTimer > 0) state.activeBuffs.shieldTimer -= dt;

      // Combo Decay
      if (p.comboTimer > 0) {
        p.comboTimer -= dt;
        if (p.comboTimer <= 0) {
          p.combo = 0;
          p.multiplier = 1;
        }
      }

      // Reloading Logic
      if (state.isReloading) {
        state.reloadTimer -= dt;
        const progress = 1 - Math.max(0, state.reloadTimer / state.reloadDuration);
        setReloadProgress(progress);

        if (state.reloadTimer <= 0) {
          state.isReloading = false;
          setIsReloading(false);
          setReloadProgress(0);

          const needed = wep.magSize - wep.currentMag;
          if (wep.reserveAmmo === -1) {
            wep.currentMag = wep.magSize;
          } else {
            const refill = Math.min(needed, wep.reserveAmmo);
            wep.currentMag += refill;
            wep.reserveAmmo -= refill;
          }
        }
      }

      // 2. PLAYER MOVEMENT (Keyboard + Touch)
      let moveX = 0;
      let moveY = 0;

      if (state.keysDown['w'] || state.keysDown['arrowup']) moveY -= 1;
      if (state.keysDown['s'] || state.keysDown['arrowdown']) moveY += 1;
      if (state.keysDown['a'] || state.keysDown['arrowleft']) moveX -= 1;
      if (state.keysDown['d'] || state.keysDown['arrowright']) moveX += 1;

      // Add touch input
      if (touchMoveInput.dx !== 0 || touchMoveInput.dy !== 0) {
        moveX += touchMoveInput.dx;
        moveY += touchMoveInput.dy;
      }

      const moveDist = Math.hypot(moveX, moveY);
      let currentSpeed = p.speed;
      if (state.activeBuffs.speedBoostTimer > 0) currentSpeed *= 1.45;
      if (p.isDashing) currentSpeed *= 2.6;

      if (moveDist > 0) {
        p.walkFrame = (p.walkFrame || 0) + 0.24;
        const nx = (moveX / moveDist) * currentSpeed;
        const ny = (moveY / moveDist) * currentSpeed;

        // Subtle footstep dust
        if (Math.random() < 0.2) {
          state.particles.push({
            x: p.x + (Math.random() - 0.5) * 8,
            y: p.y + (Math.random() - 0.5) * 8,
            vx: -nx * 0.2 + (Math.random() - 0.5) * 0.5,
            vy: -ny * 0.2 + (Math.random() - 0.5) * 0.5,
            radius: 2 + Math.random() * 2,
            color: '#64748b',
            alpha: 0.45,
            life: 0,
            maxLife: 16,
            decay: 0.03,
            shape: 'smoke'
          });
        }

        const nextX = Math.max(p.radius, Math.min(MAP_SIZE.width - p.radius, p.x + nx));
        const nextY = Math.max(p.radius, Math.min(MAP_SIZE.height - p.radius, p.y + ny));

        // Obstacle collision
        let canMoveX = true;
        let canMoveY = true;
        state.obstacles.forEach(obs => {
          if ((obs.hp || 1) > 0) {
            if (nextX + p.radius > obs.x && nextX - p.radius < obs.x + obs.width &&
                p.y + p.radius > obs.y && p.y - p.radius < obs.y + obs.height) {
              canMoveX = false;
            }
            if (p.x + p.radius > obs.x && p.x - p.radius < obs.x + obs.width &&
                nextY + p.radius > obs.y && nextY - p.radius < obs.y + obs.height) {
              canMoveY = false;
            }
          }
        });

        if (canMoveX) p.x = nextX;
        if (canMoveY) p.y = nextY;
      }

      // Player Aim Angle (Mouse or Right Touch Stick)
      if (touchAimInput.isShooting || touchAimInput.angle !== 0) {
        p.angle = touchAimInput.angle;
      } else {
        const screenCenterX = canvas.width / 2;
        const screenCenterY = canvas.height / 2;
        p.angle = Math.atan2(state.mousePos.y - screenCenterY, state.mousePos.x - screenCenterX);
      }

      // 3. WEAPON SHOOTING
      const isFiring = state.isMouseDown || touchAimInput.isShooting;
      if (isFiring && !state.isReloading) {
        if (currentTime - lastShotTime >= wep.fireRate) {
          if (wep.currentMag > 0) {
            wep.currentMag -= 1;
            lastShotTime = currentTime;

            soundManager.playShoot(wep.soundType);
            state.screenShake = wep.id === 'shotgun' ? 6 : wep.id === 'rpg' ? 10 : 2;

            // Damage multiplier perk + double damage buff
            const dmgPerkMult = 1 + (p.upgrades.bulletDamageLevel || 0) * 0.10;
            const buffMult = state.activeBuffs.doubleDamageTimer > 0 ? 2 : 1;
            const finalDmg = Math.round(wep.damage * dmgPerkMult * buffMult);

            // Muzzle flash particle
            const muzzleDist = p.radius + 18;
            const muzzleX = p.x + Math.cos(p.angle) * muzzleDist;
            const muzzleY = p.y + Math.sin(p.angle) * muzzleDist;

            state.particles.push({
              x: muzzleX,
              y: muzzleY,
              vx: 0,
              vy: 0,
              radius: 10,
              color: wep.bulletColor,
              alpha: 1,
              life: 0,
              maxLife: 4,
              decay: 0.25,
              shape: 'spark'
            });

            // Bullet pellets
            for (let i = 0; i < wep.bulletCount; i++) {
              const spreadAngle = (Math.random() - 0.5) * wep.spread;
              const finalAngle = p.angle + spreadAngle;
              const vx = Math.cos(finalAngle) * wep.bulletSpeed;
              const vy = Math.sin(finalAngle) * wep.bulletSpeed;

              state.bullets.push({
                id: Math.random().toString(),
                x: muzzleX,
                y: muzzleY,
                vx,
                vy,
                damage: finalDmg,
                pierceLeft: wep.pierce,
                rangeLeft: wep.bulletRange,
                radius: wep.id === 'rpg' ? 7 : wep.id === 'sniper' ? 5 : 3.5,
                color: wep.bulletColor,
                isExplosive: wep.id === 'rpg',
                isPlasma: wep.id === 'plasma',
                knockback: wep.knockback
              });
            }

            // Auto reload when empty
            if (wep.currentMag === 0) {
              handleReload();
            }
          } else {
            soundManager.playEmptyClick();
            lastShotTime = currentTime + 250;
            handleReload();
          }
        }
      }

      // 4. SPAWN ZOMBIE LOGIC
      if (state.zombiesToSpawn > 0 && currentTime - state.lastSpawnTime > (mode === 'endless' ? 450 : 850)) {
        state.lastSpawnTime = currentTime;
        state.zombiesToSpawn -= 1;

        // Choose zombie archetype based on wave
        let chosenType: keyof typeof ZOMBIE_TEMPLATES = 'walker';
        const rand = Math.random();

        if (state.wave >= 10 && rand < 0.08) chosenType = 'boss_abomination';
        else if (state.wave >= 5 && state.zombiesToSpawn === 0 && !state.zombies.some(z => z.isBoss)) chosenType = 'boss_mutant';
        else if (state.wave >= 4 && rand < 0.22) chosenType = 'bomber';
        else if (state.wave >= 3 && rand < 0.28) chosenType = 'spitter';
        else if (state.wave >= 2 && rand < 0.35) chosenType = 'runner';
        else if (state.wave >= 3 && rand < 0.20) chosenType = 'tank';

        const template = ZOMBIE_TEMPLATES[chosenType];
        const isBoss = chosenType.startsWith('boss');

        // Spawn on map perimeter away from player
        const spawnSide = Math.floor(Math.random() * 4);
        let spawnX = 0;
        let spawnY = 0;
        if (spawnSide === 0) { spawnX = Math.random() * MAP_SIZE.width; spawnY = 50; }
        else if (spawnSide === 1) { spawnX = MAP_SIZE.width - 50; spawnY = Math.random() * MAP_SIZE.height; }
        else if (spawnSide === 2) { spawnX = Math.random() * MAP_SIZE.width; spawnY = MAP_SIZE.height - 50; }
        else { spawnX = 50; spawnY = Math.random() * MAP_SIZE.height; }

        const hpScale = 1 + (state.wave - 1) * 0.18;
        const newZombie: Zombie = {
          id: Math.random().toString(),
          type: chosenType,
          x: spawnX,
          y: spawnY,
          radius: template.radius,
          hp: Math.round(template.hp * hpScale),
          maxHp: Math.round(template.hp * hpScale),
          speed: template.speed,
          baseSpeed: template.speed,
          damage: template.damage,
          scoreValue: template.score,
          goldValue: template.gold,
          color: template.color,
          angle: 0,
          animationFrame: Math.random() * 100,
          frozenTimer: 0,
          burnTimer: 0,
          poisonTimer: 0,
          attackCooldown: 0,
          isBoss,
          bossSpecialState: isBoss ? 'idle' : undefined,
          bossAttackTimer: isBoss ? 3000 : undefined
        };

        state.zombies.push(newZombie);

        if (isBoss) {
          setBossHp({ current: newZombie.hp, max: newZombie.maxHp, name: template.nameVi });
        }
      }

      // 5. UPDATE TURRETS
      state.turrets.forEach(turret => {
        turret.duration -= dt;
        // Find nearest zombie
        let nearestZombie: Zombie | null = null;
        let nearestDist = turret.range;

        state.zombies.forEach(z => {
          const d = Math.hypot(z.x - turret.x, z.y - turret.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearestZombie = z;
          }
        });

        if (nearestZombie && currentTime - turret.lastShotTime > 140) {
          turret.lastShotTime = currentTime;
          const targetAngle = Math.atan2((nearestZombie as Zombie).y - turret.y, (nearestZombie as Zombie).x - turret.x);
          turret.angle = targetAngle;

          soundManager.playShoot('rifle');
          state.bullets.push({
            id: Math.random().toString(),
            x: turret.x + Math.cos(targetAngle) * 20,
            y: turret.y + Math.sin(targetAngle) * 20,
            vx: Math.cos(targetAngle) * 16,
            vy: Math.sin(targetAngle) * 16,
            damage: 30,
            pierceLeft: 1,
            rangeLeft: turret.range,
            radius: 3,
            color: '#a855f7',
            knockback: 3
          });
        }
      });
      state.turrets = state.turrets.filter(t => t.duration > 0);

      // 6. UPDATE BULLETS
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];
        b.x += b.vx;
        b.y += b.vy;
        b.rangeLeft -= Math.hypot(b.vx, b.vy);

        // Check obstacle collision (Vehicles, Trees, Barrels, Crates)
        state.obstacles.forEach(obs => {
          if ((obs.hp || 0) > 0) {
            if (b.x > obs.x && b.x < obs.x + obs.width && b.y > obs.y && b.y < obs.y + obs.height) {
              obs.hp = (obs.hp || 0) - b.damage;
              if (obs.isExplosive && obs.hp <= 0) {
                const blastRad = obs.type === 'vehicle' ? 260 : 200;
                const blastDmg = obs.type === 'vehicle' ? 450 : 350;
                triggerExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, blastRad, blastDmg);
              }
              // Impact sparks
              for (let s = 0; s < 3; s++) {
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  radius: 2,
                  color: '#facc15',
                  alpha: 1,
                  life: 0,
                  maxLife: 15,
                  decay: 0.07,
                  shape: 'spark'
                });
              }
              b.pierceLeft = 0;
            }
          }
        });

        // Check zombie hit
        for (let j = state.zombies.length - 1; j >= 0; j--) {
          const z = state.zombies[j];
          const dist = Math.hypot(z.x - b.x, z.y - b.y);

          if (dist < z.radius + b.radius) {
            soundManager.playZombieHit();

            // Critical hit calculation
            const critChance = (p.upgrades.critChanceLevel || 0) * 0.06;
            const isCrit = Math.random() < critChance;
            const finalDmg = isCrit ? Math.round(b.damage * 2.5) : b.damage;

            z.hp -= finalDmg;
            b.pierceLeft -= 1;

            // Knockback
            const knockAngle = Math.atan2(b.vy, b.vx);
            z.x += Math.cos(knockAngle) * (z.isBoss ? b.knockback * 0.2 : b.knockback);
            z.y += Math.sin(knockAngle) * (z.isBoss ? b.knockback * 0.2 : b.knockback);

            // Blood particles
            for (let k = 0; k < 6; k++) {
              state.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 6 + b.vx * 0.15,
                vy: (Math.random() - 0.5) * 6 + b.vy * 0.15,
                radius: 2 + Math.random() * 3,
                color: '#dc2626',
                alpha: 1,
                life: 0,
                maxLife: 20,
                decay: 0.05,
                shape: 'blood'
              });
            }

            // Floating combat text
            state.floatingTexts.push({
              id: Math.random().toString(),
              x: z.x + (Math.random() - 0.5) * 20,
              y: z.y - 15,
              text: isCrit ? `CRIT ${finalDmg}!` : `${finalDmg}`,
              color: isCrit ? '#f59e0b' : '#ffffff',
              alpha: 1,
              life: 30,
              isCrit
            });

            // Explosive bullet
            if (b.isExplosive) {
              triggerExplosion(b.x, b.y, 160, b.damage);
              b.pierceLeft = 0;
            }

            if (b.pierceLeft <= 0) break;
          }
        }

        if (b.rangeLeft <= 0 || b.pierceLeft <= 0 || b.x < 0 || b.x > MAP_SIZE.width || b.y < 0 || b.y > MAP_SIZE.height) {
          state.bullets.splice(i, 1);
        }
      }

      // 7. UPDATE ZOMBIES
      for (let i = state.zombies.length - 1; i >= 0; i--) {
        const z = state.zombies[i];
        z.animationFrame += 0.2;

        // Death check
        if (z.hp <= 0) {
          soundManager.playZombieHit();

          // Blood puddle decal
          state.decals.push({
            x: z.x,
            y: z.y,
            radius: z.radius * 1.5,
            color: '#7f1d1d',
            alpha: 0.75,
            type: 'blood'
          });

          // Gold & Score rewards
          p.kills += 1;
          p.combo += 1;
          p.comboTimer = 3500; // ms
          p.multiplier = 1 + Math.min(3, p.combo * 0.1);

          const goldGain = Math.round(z.goldValue * p.multiplier);
          const scoreGain = Math.round(z.scoreValue * p.multiplier);

          p.score += scoreGain;

          // MANDATORY GOLD DROP: Spawn physical gold that player must run over to collect
          soundManager.playCoinClink();

          if (z.isBoss) {
            // Boss spawns massive scatter of gold coins + ingots + coin bag!
            const coinCount = 6;
            const coinVal = Math.max(15, Math.round((goldGain * 0.4) / coinCount));
            for (let c = 0; c < coinCount; c++) {
              const scatterAngle = (c / coinCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
              const scatterSpeed = 2 + Math.random() * 3.5;
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'gold_coin',
                value: coinVal,
                radius: 12,
                pulse: Math.random() * Math.PI * 2,
                createdAt: currentTime,
                vx: Math.cos(scatterAngle) * scatterSpeed,
                vy: Math.sin(scatterAngle) * scatterSpeed,
                bounceZ: 25 + Math.random() * 15,
                vz: 3 + Math.random() * 2
              });
            }
            // 2 heavy gold ingots
            for (let ing = 0; ing < 2; ing++) {
              const ingAngle = Math.random() * Math.PI * 2;
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'gold_ingot',
                value: Math.round(goldGain * 0.2),
                radius: 14,
                pulse: Math.random() * Math.PI * 2,
                createdAt: currentTime,
                vx: Math.cos(ingAngle) * 2.5,
                vy: Math.sin(ingAngle) * 2.5,
                bounceZ: 30,
                vz: 4
              });
            }
            // 1 huge sack of gold
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: 'coin_bag',
              value: Math.round(goldGain * 0.2),
              radius: 16,
              pulse: 0,
              createdAt: currentTime,
              vx: 0,
              vy: 0,
              bounceZ: 35,
              vz: 4.5
            });
          } else if (z.type === 'tank' || z.type === 'spitter' || z.type === 'bomber') {
            // Elites / Tanks drop a heavy gold ingot or 2 gold coins
            if (goldGain >= 30) {
              const halfGold = Math.round(goldGain / 2);
              for (let c = 0; c < 2; c++) {
                const angle = (Math.random() - 0.5) * Math.PI * 2;
                const spd = 1.5 + Math.random() * 2;
                state.drops.push({
                  id: Math.random().toString(),
                  x: z.x,
                  y: z.y,
                  type: 'gold_coin',
                  value: halfGold,
                  radius: 12,
                  pulse: Math.random() * Math.PI * 2,
                  createdAt: currentTime,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  bounceZ: 20 + Math.random() * 10,
                  vz: 3
                });
              }
            } else {
              const angle = Math.random() * Math.PI * 2;
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'gold_ingot',
                value: goldGain,
                radius: 13,
                pulse: Math.random() * Math.PI * 2,
                createdAt: currentTime,
                vx: Math.cos(angle) * 1.5,
                vy: Math.sin(angle) * 1.5,
                bounceZ: 20,
                vz: 3
              });
            }
          } else {
            // Standard Walkers / Runners drop a gleaming gold coin!
            const popAngle = Math.random() * Math.PI * 2;
            const popSpeed = 1.2 + Math.random() * 2;
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: 'gold_coin',
              value: Math.max(5, goldGain),
              radius: 11,
              pulse: Math.random() * Math.PI * 2,
              createdAt: currentTime,
              vx: Math.cos(popAngle) * popSpeed,
              vy: Math.sin(popAngle) * popSpeed,
              bounceZ: 18 + Math.random() * 8,
              vz: 2.8
            });
          }

          // Bonus Tactical Powerups chance (18% or boss guaranteed nuke)
          const dropRoll = Math.random();
          if (dropRoll < 0.18 || z.isBoss) {
            const types: PowerUpType[] = ['medkit', 'ammo', 'double_damage', 'speed_boost', 'freeze', 'shield', 'turret'];
            const chosenDrop = z.isBoss ? 'nuke' : types[Math.floor(Math.random() * types.length)];
            const pAngle = Math.random() * Math.PI * 2;
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: chosenDrop,
              value: 0,
              radius: 15,
              pulse: 0,
              createdAt: currentTime,
              vx: Math.cos(pAngle) * 2,
              vy: Math.sin(pAngle) * 2,
              bounceZ: 24,
              vz: 3.5
            });
          }

          // Kamikaze explode
          if (z.type === 'bomber') {
            triggerExplosion(z.x, z.y, 140, z.damage * 2);
          }

          state.zombies.splice(i, 1);
          setZombiesRemaining(state.zombies.length + state.zombiesToSpawn);
          continue;
        }

        // Update Boss HP bar
        if (z.isBoss) {
          setBossHp({ current: z.hp, max: z.maxHp, name: ZOMBIE_TEMPLATES[z.type].nameVi });
        }

        // Movement towards player
        const isFrozen = state.activeBuffs.freezeEnemiesTimer > 0;
        if (!isFrozen) {
          const zAngle = Math.atan2(p.y - z.y, p.x - z.x);
          z.angle = zAngle;

          const zSpeed = z.speed;
          z.x += Math.cos(zAngle) * zSpeed;
          z.y += Math.sin(zAngle) * zSpeed;

          // Attack player on contact
          const distToPlayer = Math.hypot(p.x - z.x, p.y - z.y);
          if (distToPlayer < p.radius + z.radius) {
            if (p.invincibleTimer <= 0 && state.activeBuffs.shieldTimer <= 0) {
              soundManager.playPlayerHurt();
              state.screenShake = 12;
              p.invincibleTimer = 450; // ms iframe

              let dmg = z.damage;
              if (p.armor > 0) {
                const absorbed = Math.min(p.armor, dmg * 0.7);
                p.armor -= absorbed;
                dmg -= absorbed;
              }
              p.hp -= dmg;

              // Game Over check
              if (p.hp <= 0) {
                p.hp = 0;
                soundManager.stopMusic();
                onGameOver();
                return;
              }
            }
          }
        }
      }

      // Check Boss cleared
      if (!state.zombies.some(z => z.isBoss) && bossHp) {
        setBossHp(null);
      }

      // 8. UPDATE DROPS & MAGNET (Player runs over to pick up gold and items)
      const magnetRange = 75 + (p.upgrades.magnetRadiusLevel || 0) * 45;
      for (let i = state.drops.length - 1; i >= 0; i--) {
        const item = state.drops[i];
        item.pulse += 0.08;

        // Apply physical pop velocity and bounce
        if (item.vx !== undefined && item.vy !== undefined) {
          item.x += item.vx;
          item.y += item.vy;
          item.vx *= 0.88;
          item.vy *= 0.88;
          // Clamp within map bounds
          item.x = Math.max(40, Math.min(MAP_SIZE.width - 40, item.x));
          item.y = Math.max(40, Math.min(MAP_SIZE.height - 40, item.y));
        }

        if (item.bounceZ !== undefined && item.vz !== undefined) {
          item.bounceZ += item.vz;
          item.vz -= 0.28; // gravity
          if (item.bounceZ <= 0) {
            item.bounceZ = 0;
            item.vz = 0;
          }
        }

        const dist = Math.hypot(p.x - item.x, p.y - item.y);

        // Magnet suction towards player
        if (dist < magnetRange) {
          const suckAngle = Math.atan2(p.y - item.y, p.x - item.x);
          const pullSpeed = Math.min(16, 7 + (magnetRange - dist) * 0.12);
          item.x += Math.cos(suckAngle) * pullSpeed;
          item.y += Math.sin(suckAngle) * pullSpeed;

          // Golden trail spark particles when flying towards player
          if ((item.type === 'gold_coin' || item.type === 'gold_ingot' || item.type === 'coin_bag') && Math.random() < 0.35) {
            state.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: 1.5,
              color: '#fef08a',
              alpha: 0.9,
              life: 0,
              maxLife: 10,
              decay: 0.1,
              shape: 'spark'
            });
          }
        }

        // Pickup item when player touches it
        if (dist < p.radius + item.radius) {
          if (item.type === 'gold_coin' || item.type === 'gold_ingot' || item.type === 'coin_bag') {
            // GOLD PICKUP
            soundManager.playGoldPickup();
            p.gold += item.value;
            p.score += item.value * 2;

            // Immediately update React App state
            setPlayer(prev => ({
              ...prev,
              gold: p.gold,
              score: p.score
            }));

            // Sparkle particles burst
            for (let sp = 0; sp < 6; sp++) {
              state.particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
                radius: 2.5,
                color: '#facc15',
                alpha: 1,
                life: 0,
                maxLife: 16,
                decay: 0.06,
                shape: 'spark'
              });
            }

            state.floatingTexts.push({
              id: Math.random().toString(),
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y - 25,
              text: `+${item.value} VÀNG`,
              color: '#facc15',
              alpha: 1,
              life: 38,
              isCrit: item.type === 'coin_bag' || item.type === 'gold_ingot'
            });
          } else {
            // TACTICAL POWERUPS
            soundManager.playPowerUp();

            if (item.type === 'medkit') {
              p.hp = Math.min(p.maxHp, p.hp + 50);
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '+50 HP!', color: '#4ade80', alpha: 1, life: 40 });
            } else if (item.type === 'ammo') {
              (Object.values(state.weapons) as Weapon[]).forEach(w => {
                if (w.reserveAmmo !== -1) w.reserveAmmo += w.magSize * 2;
              });
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '+ĐẠN DƯỢC!', color: '#38bdf8', alpha: 1, life: 40 });
            } else if (item.type === 'nuke') {
              state.zombies.forEach(z => { z.hp = 0; });
              triggerExplosion(p.x, p.y, 600, 9999);
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 30, text: '☢️ BOM HẠT NHÂN QUÉT SẠCH!', color: '#f59e0b', alpha: 1, life: 60, isCrit: true });
            } else if (item.type === 'double_damage') {
              state.activeBuffs.doubleDamageTimer = 10000;
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '🔥 SÁT THƯƠNG X2!', color: '#ef4444', alpha: 1, life: 40 });
            } else if (item.type === 'speed_boost') {
              state.activeBuffs.speedBoostTimer = 10000;
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '⚡ TĂNG TỐC ĐỘ!', color: '#eab308', alpha: 1, life: 40 });
            } else if (item.type === 'freeze') {
              state.activeBuffs.freezeEnemiesTimer = 6000;
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '❄️ ĐÓNG BĂNG ZOMBIE!', color: '#38bdf8', alpha: 1, life: 40 });
            } else if (item.type === 'shield') {
              state.activeBuffs.shieldTimer = 8000;
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '🛡️ BẢO VỆ TUYỆT ĐỐI!', color: '#818cf8', alpha: 1, life: 40 });
            } else if (item.type === 'turret') {
              state.turrets.push({
                id: Math.random().toString(),
                x: p.x + 30,
                y: p.y + 30,
                hp: 200,
                maxHp: 200,
                angle: 0,
                lastShotTime: 0,
                duration: 30000,
                range: 450
              });
              state.floatingTexts.push({ id: Math.random().toString(), x: p.x, y: p.y - 20, text: '🤖 TRIỆU HỒI PHÁO TỰ ĐỘNG!', color: '#10b981', alpha: 1, life: 40 });
            }
          }

          state.drops.splice(i, 1);
        }
      }

      // 9. CHECK WAVE COMPLETION
      if (state.zombies.length === 0 && state.zombiesToSpawn === 0 && !state.isWaveEnding) {
        state.isWaveEnding = true;
        state.waveTransitionTimer = 2500; // 2.5s breather
      }

      if (state.isWaveEnding) {
        state.waveTransitionTimer -= dt;
        if (state.waveTransitionTimer <= 0) {
          startWave(state.wave + 1);
        }
      }

      // 10. CAMERA CLOSE-UP TRACKING & SMOOTH PERSPECTIVE
      // Dynamic Zoom for clear hero & weapon rendering across mobile, tablet, and desktop
      const zoom = canvas.width < 640 ? 1.50 : canvas.width < 1024 ? 1.40 : 1.30;
      const viewHalfW = (canvas.width / 2) / zoom;
      const viewHalfH = (canvas.height / 2) / zoom;
      
      // Dynamic look-ahead lead in aiming direction
      const lookAhead = 35;
      let targetCamX = p.x + Math.cos(p.angle) * lookAhead;
      let targetCamY = p.y + Math.sin(p.angle) * lookAhead;
      
      // Clamp camera within map bounds
      if (canvas.width / zoom < MAP_SIZE.width) {
        targetCamX = Math.max(viewHalfW, Math.min(MAP_SIZE.width - viewHalfW, targetCamX));
      } else {
        targetCamX = MAP_SIZE.width / 2;
      }
      if (canvas.height / zoom < MAP_SIZE.height) {
        targetCamY = Math.max(viewHalfH, Math.min(MAP_SIZE.height - viewHalfH, targetCamY));
      } else {
        targetCamY = MAP_SIZE.height / 2;
      }

      state.camera.x += (targetCamX - state.camera.x) * 0.14;
      state.camera.y += (targetCamY - state.camera.y) * 0.14;

      // Screen shake decay
      if (state.screenShake > 0) {
        state.screenShake *= 0.88;
        if (state.screenShake < 0.1) state.screenShake = 0;
      }

      // ==========================================
      // 11. RENDERING FRAME (CANVAS GRAPHICS)
      // ==========================================
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply screen shake
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;

      // Apply Zoom & Camera Transform
      ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
      ctx.scale(zoom, zoom);
      ctx.translate(-state.camera.x, -state.camera.y);

      // Render Selected Flexible Map Environment (Helipad Rooftop, City Street, Biohazard Bunker, Hospital)
      renderMapEnvironment({
        ctx,
        mapId: (selectedMapId as MapEnvironmentId) || 'rooftop',
        mapSize: MAP_SIZE,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        camera: state.camera,
        time: currentTime
      });

      // Render Decals (Blood / Blast marks)
      state.decals.forEach(decal => {
        ctx.save();
        ctx.globalAlpha = decal.alpha;
        ctx.fillStyle = decal.color;
        ctx.beginPath();
        ctx.arc(decal.x, decal.y, decal.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Detailed Environmental Obstacles (Vehicles, Trees, Streetlights, HVAC, Servers, Barrels)
      renderObstacles({
        ctx,
        obstacles: state.obstacles,
        time: currentTime
      });

      // Render Sentry Turrets
      state.turrets.forEach(turret => {
        ctx.save();
        ctx.translate(turret.x, turret.y);
        ctx.rotate(turret.angle);

        // Turret Base
        ctx.fillStyle = '#6b21a8';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();

        // Turret Barrels
        ctx.fillStyle = '#d8b4fe';
        ctx.fillRect(0, -4, 22, 8);
        ctx.restore();
      });

      // Render Dropped Gold Coins, Ingots, Sacks and Power-Up Crates (3D Rotating Coins, Dynamic Ground Shadows, Glow)
      renderDrops({
        ctx,
        drops: state.drops,
        time: currentTime
      });

      // Render Horrifying Grotesque Zombies (Decaying flesh, gory wounds, glowing demonic eyes, claw reach)
      state.zombies.forEach(z => {
        const isFrozen = state.activeBuffs.freezeEnemiesTimer > 0;
        renderZombie({
          ctx,
          zombie: z,
          time: currentTime,
          isFrozen
        });

        // HP bar above zombie
        if (z.hp < z.maxHp) {
          const barW = Math.max(28, z.radius * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(z.x - barW / 2 - 1, z.y - z.radius - 12, barW + 2, 6);
          ctx.fillStyle = '#450a0a';
          ctx.fillRect(z.x - barW / 2, z.y - z.radius - 11, barW, 4);
          ctx.fillStyle = z.isBoss ? '#f59e0b' : '#ef4444';
          ctx.fillRect(z.x - barW / 2, z.y - z.radius - 11, barW * (z.hp / z.maxHp), 4);
        }
      });

      // Render Bullets
      state.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Ultra-Realistic Tactical Warrior (High-tech combat armor, NVG visor, custom weapons & laser sight)
      renderWarrior({
        ctx,
        player: p,
        weapon: wep,
        activeBuffs: state.activeBuffs,
        time: currentTime,
        isFiring: isFiring && (currentTime - lastShotTime < 70),
        obstacles: state.obstacles,
        zombies: state.zombies
      });

      // Render Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const pt = state.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 1;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0 || pt.life >= pt.maxLife) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Floating Combat Text
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 0.8;
        ft.life -= 1;
        ft.alpha = ft.life / 30;

        if (ft.life <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = ft.isCrit ? 'bold 16px monospace' : 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Restore camera transform
    };

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [difficulty, mode, selectedMapId, isPaused, isShopOpen, onGameOver, touchMoveInput, touchAimInput]);

  // Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    stateRef.current.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stateRef.current.isMouseDown = true;
    }
  };

  const handleMouseUp = () => {
    stateRef.current.isMouseDown = false;
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="w-full h-full block cursor-crosshair select-none bg-neutral-950 touch-none"
    />
  );
};
