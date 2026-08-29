import React, { useRef, useEffect, useCallback } from 'react';
import { 
  PlayerStats, Weapon, WeaponType, Zombie, Bullet, 
  Particle, Decal, DropItem, ActiveTurret, FloatingText, 
  Obstacle, ActiveBuffs, GameDifficulty, GameMode, PowerUpType,
  MapEnvironmentId, BossHazard, SweepingLaser, TentacleHook
} from '../types/game';
import { MAP_SIZE, ZOMBIE_TEMPLATES, BOSS_SKILL_DATABASE } from '../utils/constants';
import { soundManager } from '../utils/audio';
import { renderWarrior } from '../utils/renderWarrior';
import { renderZombie } from '../utils/renderZombie';
import { renderMapEnvironment } from '../utils/renderMapEnvironment';
import { renderObstacles } from '../utils/renderObstacles';
import { renderDrops } from '../utils/renderDrops';
import { CompanionDroneConfig, ActiveDroneState } from '../data/drones';
import { renderCompanionDrone } from '../utils/renderCompanionDrone';
import { MAP_ENVIRONMENTS } from '../data/maps';
import { 
  processBossCombatAI, 
  updateBossHazards, 
  updateSweepingLasers, 
  updateTentacleHooks, 
  renderBossSpecialEffects 
} from '../utils/bossSkills';

const MAP_SEQUENCE: MapEnvironmentId[] = [
  'rooftop',
  'street',
  'bunker',
  'hospital',
  'graveyard',
  'desert_outpost',
  'cyber_facility',
  'volcanic_core'
];

interface GameCanvasProps {
  player: PlayerStats;
  setPlayer: React.Dispatch<React.SetStateAction<PlayerStats>>;
  currentWeapon: Weapon;
  weapons: Record<string, Weapon>;
  setWeapons: React.Dispatch<React.SetStateAction<Record<string, Weapon>>>;
  drones?: CompanionDroneConfig[];
  wave: number;
  setWave: React.Dispatch<React.SetStateAction<number>>;
  totalZombiesInWave: number;
  setTotalZombiesInWave: React.Dispatch<React.SetStateAction<number>>;
  zombiesRemaining: number;
  setZombiesRemaining: React.Dispatch<React.SetStateAction<number>>;
  bossHp: { current: number; max: number; name: string; badge?: string; currentSkill?: string } | null;
  setBossHp: React.Dispatch<React.SetStateAction<{ current: number; max: number; name: string; badge?: string; currentSkill?: string } | null>>;
  activeBuffs: ActiveBuffs;
  setActiveBuffs: React.Dispatch<React.SetStateAction<ActiveBuffs>>;
  isReloading: boolean;
  setIsReloading: React.Dispatch<React.SetStateAction<boolean>>;
  reloadProgress: number;
  setReloadProgress: React.Dispatch<React.SetStateAction<number>>;
  difficulty: GameDifficulty;
  mode: GameMode;
  selectedMapId?: MapEnvironmentId;
  onMapChange?: (newMapId: MapEnvironmentId) => void;
  isPaused: boolean;
  isShopOpen: boolean;
  onGameOver: () => void;
  // External inputs from VirtualControls
  touchMoveInput: { dx: number; dy: number };
  touchAimInput: { angle: number; isShooting: boolean };
  autoAimEnabled?: boolean;
  cameraZoomMode?: 'wide' | 'ultrawide' | 'normal';
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  player,
  setPlayer,
  currentWeapon,
  weapons,
  setWeapons,
  drones = [],
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
  onMapChange,
  isPaused,
  isShopOpen,
  onGameOver,
  touchMoveInput,
  touchAimInput,
  autoAimEnabled = true,
  cameraZoomMode = 'wide'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronized refs for props to ensure the high-frequency animation loop is never restarted on re-render
  const touchMoveInputRef = useRef(touchMoveInput);
  touchMoveInputRef.current = touchMoveInput;

  const touchAimInputRef = useRef(touchAimInput);
  touchAimInputRef.current = touchAimInput;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const isShopOpenRef = useRef(isShopOpen);
  isShopOpenRef.current = isShopOpen;

  const autoAimEnabledRef = useRef(autoAimEnabled);
  autoAimEnabledRef.current = autoAimEnabled;

  const cameraZoomModeRef = useRef(cameraZoomMode);
  cameraZoomModeRef.current = cameraZoomMode;

  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;

  const dronesRef = useRef(drones);
  dronesRef.current = drones;

  const selectedMapIdRef = useRef(selectedMapId);
  selectedMapIdRef.current = selectedMapId;

  const onMapChangeRef = useRef(onMapChange);
  onMapChangeRef.current = onMapChange;

  // Mutable Game State in Ref to achieve steady 60 FPS without React re-render lag
  const stateRef = useRef<{
    player: PlayerStats;
    currentWeapon: Weapon;
    weapons: Record<string, Weapon>;
    currentMapId: MapEnvironmentId;
    activeDrones: ActiveDroneState[];
    laserBeams: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; alpha: number }>;
    zombies: Zombie[];
    bullets: Bullet[];
    particles: Particle[];
    decals: Decal[];
    drops: DropItem[];
    turrets: ActiveTurret[];
    floatingTexts: FloatingText[];
    obstacles: Obstacle[];
    bossHazards: BossHazard[];
    sweepingLasers: SweepingLaser[];
    tentacleHooks: TentacleHook[];
    activeBuffs: ActiveBuffs;
    isReloading: boolean;
    reloadTimer: number;
    reloadDuration: number;
    wave: number;
    zombiesToSpawn: number;
    bossesToSpawn: number;
    nextBossSpawnTime: number;
    lastSpawnTime: number;
    mousePos: { x: number; y: number };
    isMouseDown: boolean;
    keysDown: Record<string, boolean>;
    camera: { x: number; y: number };
    lastTime: number;
    screenShake: number;
    waveTransitionTimer: number;
    isWaveEnding: boolean;
    autoAimTargetId: string | null;
    targetedBossId: string | null;
  }>({
    player: { ...player },
    currentWeapon: { ...currentWeapon },
    weapons: { ...weapons },
    currentMapId: (selectedMapId as MapEnvironmentId) || 'rooftop',
    activeDrones: [],
    laserBeams: [],
    zombies: [],
    bullets: [],
    particles: [],
    decals: [],
    drops: [],
    turrets: [],
    floatingTexts: [],
    obstacles: [],
    bossHazards: [],
    sweepingLasers: [],
    tentacleHooks: [],
    activeBuffs: { ...activeBuffs },
    isReloading: false,
    reloadTimer: 0,
    reloadDuration: 0,
    wave,
    zombiesToSpawn: 0,
    bossesToSpawn: 0,
    nextBossSpawnTime: 0,
    lastSpawnTime: 0,
    mousePos: { x: 0, y: 0 },
    isMouseDown: false,
    keysDown: {},
    camera: { x: player.x, y: player.y },
    lastTime: performance.now(),
    screenShake: 0,
    waveTransitionTimer: 0,
    isWaveEnding: false,
    autoAimTargetId: null,
    targetedBossId: null
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
      if (player.equipment) {
        p.equipment = { ...player.equipment };
      }
    }
  }, [player.gold, player.hp, player.maxHp, player.armor, player.maxArmor, player.speed, player.grenadeCount, player.upgrades, player.warriorSkin, player.equipment]);

  useEffect(() => {
    stateRef.current.currentWeapon = { ...currentWeapon };
    stateRef.current.weapons = { ...weapons };
  }, [currentWeapon, weapons]);

  useEffect(() => {
    stateRef.current.activeBuffs = { ...activeBuffs };
  }, [activeBuffs]);

  // Sync unlocked Companion Drones
  useEffect(() => {
    if (!drones) return;
    const currentActive = stateRef.current.activeDrones;
    const unlockedConfigs = drones.filter(d => d.unlocked);

    const updatedActive: ActiveDroneState[] = unlockedConfigs.map(cfg => {
      const existing = currentActive.find(a => a.id === cfg.id);
      if (existing) {
        return existing;
      }
      const angle = Math.random() * Math.PI * 2;
      return {
        id: cfg.id,
        type: cfg.type,
        x: player.x + Math.cos(angle) * 45,
        y: player.y + Math.sin(angle) * 45,
        vx: 0,
        vy: 0,
        angle: 0,
        turretAngle: 0,
        tilt: 0,
        hoverOffset: Math.random() * Math.PI * 2,
        lastShotTime: 0,
        targetId: null
      };
    });

    stateRef.current.activeDrones = updatedActive;
  }, [drones, player.x, player.y]);

  // Helper to generate rich dynamic obstacles tailored to each of the 8 unique map environments
  const generateObstaclesForMap = (mapId: MapEnvironmentId): Obstacle[] => {
    const obs: Obstacle[] = [];
    const centerX = MAP_SIZE.width / 2; // 1300
    const centerY = MAP_SIZE.height / 2; // 1000
    const SAFE_SPAWN_RADIUS = 280;

    const isSafeFromCenter = (x: number, y: number, margin = 40) => {
      return Math.hypot(x - centerX, y - centerY) > (SAFE_SPAWN_RADIUS + margin);
    };

    if (mapId === 'street') {
      // 1. Street: Abandoned Police cars, Taxis, Civilian SUVs, Trees, Sandbags & Barrels
      const vehicleConfigs = [
        { variant: 'police', color: '#18181b', x: 380, y: 340, angle: 0.25, width: 92, height: 50, hp: 350 },
        { variant: 'taxi', color: '#eab308', x: 760, y: 460, angle: -0.18, width: 88, height: 48, hp: 300 },
        { variant: 'car', color: '#0f766e', x: 1850, y: 480, angle: 0.12, width: 90, height: 48, hp: 320 },
        { variant: 'car', color: '#be123c', x: 620, y: 1540, angle: 0.35, width: 90, height: 48, hp: 320 },
        { variant: 'car', color: '#334155', x: 1850, y: 1500, angle: -0.28, width: 94, height: 50, hp: 340 }
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

      // Street Trees
      const treeConfigs = [
        { x: 260, y: 220, variant: 'green', size: 70 },
        { x: 540, y: 180, variant: 'dead', size: 58 },
        { x: 1020, y: 220, variant: 'green', size: 72 },
        { x: 1900, y: 200, variant: 'green', size: 66 },
        { x: 280, y: 1620, variant: 'green', size: 72 },
        { x: 760, y: 1660, variant: 'dead', size: 60 },
        { x: 1880, y: 1630, variant: 'green', size: 74 }
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

      // Sandbags, Streetlights & Explosive Barrels
      for (let i = 0; i < 14; i++) {
        const isBarrel = Math.random() > 0.4;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 250 + Math.random() * (MAP_SIZE.width - 500);
          ry = 250 + Math.random() * (MAP_SIZE.height - 500);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `street_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'sandbag',
          hp: isBarrel ? 30 : 250,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'rooftop') {
      // 2. Rooftop: Heavy HVAC units with spinning fans, potted terrace shrubs, crates, explosive tanks
      const hvacUnits = [
        { x: 380, y: 380, w: 76, h: 76 },
        { x: 2180, y: 380, w: 76, h: 76 },
        { x: 380, y: 1560, w: 76, h: 76 },
        { x: 2180, y: 1560, w: 76, h: 76 }
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

      // Potted terrace shrubs & red barrels (keep central helipad circle clear)
      for (let i = 0; i < 16; i++) {
        const isBarrel = i % 2 === 0;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 260 + Math.random() * (MAP_SIZE.width - 520);
          ry = 260 + Math.random() * (MAP_SIZE.height - 520);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `roof_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'tree',
          hp: isBarrel ? 30 : 200,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'bunker') {
      // 3. Bunker: Server racks, toxic biohazard barrels, sandbags
      const serverRacks = [
        { x: 420, y: 330, w: 90, h: 42 },
        { x: 820, y: 330, w: 90, h: 42 },
        { x: 1780, y: 330, w: 90, h: 42 },
        { x: 420, y: 1670, w: 90, h: 42 },
        { x: 820, y: 1670, w: 90, h: 42 },
        { x: 1780, y: 1670, w: 90, h: 42 }
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
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 250 + Math.random() * (MAP_SIZE.width - 500);
          ry = 250 + Math.random() * (MAP_SIZE.height - 500);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `bunker_prop_${i}`,
          x: rx,
          y: ry,
          width: 36,
          height: 36,
          type: 'barrel',
          hp: 30,
          isExplosive: true
        });
      }
    } else if (mapId === 'hospital') {
      // 4. Hospital: Ambulances, Gurneys, Crates, Oxygen Barrels
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
        x: 1820,
        y: 1460,
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
        { x: 840, y: 460 },
        { x: 1760, y: 720 },
        { x: 700, y: 1500 }
      ];
      gurneys.forEach((g, idx) => {
        obs.push({
          id: `gurney_${idx}`,
          x: g.x,
          y: g.y,
          width: 56,
          height: 30,
          type: 'gurney',
          angle: idx * 0.45,
          hp: 180,
          maxHp: 180
        });
      });

      for (let i = 0; i < 14; i++) {
        const isBarrel = Math.random() > 0.4;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 250 + Math.random() * (MAP_SIZE.width - 500);
          ry = 250 + Math.random() * (MAP_SIZE.height - 500);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `hosp_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 48,
          height: isBarrel ? 36 : 48,
          type: isBarrel ? 'barrel' : 'crate',
          hp: isBarrel ? 30 : 250,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'graveyard') {
      // 5. Graveyard: Ancient Headstones, Gothic Crypts, Dead Spooky Trees, Cursed Urns
      const cryptConfigs = [
        { x: 380, y: 360, w: 84, h: 64 },
        { x: 2140, y: 360, w: 84, h: 64 },
        { x: 380, y: 1540, w: 84, h: 64 },
        { x: 2140, y: 1540, w: 84, h: 64 }
      ];
      cryptConfigs.forEach((c, idx) => {
        obs.push({
          id: `crypt_${idx}`,
          x: c.x,
          y: c.y,
          width: c.w,
          height: c.h,
          type: 'crypt',
          hp: 600,
          maxHp: 600
        });
      });

      // Ancient Tombstones
      for (let i = 0; i < 16; i++) {
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 260 + Math.random() * (MAP_SIZE.width - 520);
          ry = 260 + Math.random() * (MAP_SIZE.height - 520);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `tomb_${i}`,
          x: rx,
          y: ry,
          width: 44,
          height: 52,
          type: 'tombstone',
          hp: 240,
          maxHp: 240
        });
      }

      // Spooky dead trees & explosive urns
      for (let i = 0; i < 10; i++) {
        const isBarrel = i % 2 === 0;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 280 + Math.random() * (MAP_SIZE.width - 560);
          ry = 280 + Math.random() * (MAP_SIZE.height - 560);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `grave_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 60,
          height: isBarrel ? 36 : 60,
          type: isBarrel ? 'barrel' : 'tree',
          variant: 'dead',
          hp: isBarrel ? 30 : 350,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'desert_outpost') {
      // 6. Desert Outpost: Satellite Comms Dishes, Saguaro Cacti, Sandbags & Fuel Drums
      const sats = [
        { x: 420, y: 380 },
        { x: 2100, y: 380 },
        { x: 660, y: 1520 }
      ];
      sats.forEach((s, idx) => {
        obs.push({
          id: `sat_${idx}`,
          x: s.x,
          y: s.y,
          width: 70,
          height: 70,
          type: 'satellite',
          hp: 450,
          maxHp: 450
        });
      });

      // Desert Cacti
      for (let i = 0; i < 12; i++) {
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 260 + Math.random() * (MAP_SIZE.width - 520);
          ry = 260 + Math.random() * (MAP_SIZE.height - 520);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `cactus_${i}`,
          x: rx,
          y: ry,
          width: 48,
          height: 64,
          type: 'cactus',
          hp: 180,
          maxHp: 180
        });
      }

      // Sandbags & Fuel Barrels
      for (let i = 0; i < 16; i++) {
        const isBarrel = Math.random() > 0.45;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 250 + Math.random() * (MAP_SIZE.width - 500);
          ry = 250 + Math.random() * (MAP_SIZE.height - 500);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `desert_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 52,
          height: isBarrel ? 36 : 52,
          type: isBarrel ? 'barrel' : 'sandbag',
          hp: isBarrel ? 30 : 300,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'cyber_facility') {
      // 7. Cyber Facility: Quantum Server Racks, Glowing Energy Barrier Pylons, Plasma Barrels
      const cyberServers = [
        { x: 440, y: 350, w: 90, h: 44 },
        { x: 1980, y: 350, w: 90, h: 44 },
        { x: 440, y: 1550, w: 90, h: 44 },
        { x: 1980, y: 1550, w: 90, h: 44 }
      ];
      cyberServers.forEach((cs, idx) => {
        obs.push({
          id: `csrv_${idx}`,
          x: cs.x,
          y: cs.y,
          width: cs.w,
          height: cs.h,
          type: 'server',
          hp: 550,
          maxHp: 550
        });
      });

      // Energy Barrier Pylons
      const barriers = [
        { x: 620, y: 640 },
        { x: 1980, y: 640 },
        { x: 760, y: 1480 },
        { x: 1840, y: 1480 }
      ];
      barriers.forEach((b, idx) => {
        obs.push({
          id: `barrier_${idx}`,
          x: b.x,
          y: b.y,
          width: 50,
          height: 50,
          type: 'barrier',
          hp: 400,
          maxHp: 400
        });
      });

      // Plasma explosive barrels & tech crates
      for (let i = 0; i < 14; i++) {
        const isBarrel = i % 2 === 0;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 260 + Math.random() * (MAP_SIZE.width - 520);
          ry = 260 + Math.random() * (MAP_SIZE.height - 520);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `cyber_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 46,
          height: isBarrel ? 36 : 46,
          type: isBarrel ? 'barrel' : 'crate',
          hp: isBarrel ? 30 : 280,
          isExplosive: isBarrel
        });
      }
    } else if (mapId === 'volcanic_core') {
      // 8. Volcanic Magma Core: Magma obsidian boulders, fiery explosive barrels
      const magmaRocks = [
        { x: 380, y: 360, size: 68 },
        { x: 2140, y: 360, size: 74 },
        { x: 380, y: 1540, size: 70 },
        { x: 2140, y: 1540, size: 76 },
        { x: 760, y: 440, size: 64 },
        { x: 1860, y: 1560, size: 64 }
      ];
      magmaRocks.forEach((mr, idx) => {
        obs.push({
          id: `magma_${idx}`,
          x: mr.x,
          y: mr.y,
          width: mr.size,
          height: mr.size,
          type: 'magma_rock',
          hp: 550,
          maxHp: 550
        });
      });

      for (let i = 0; i < 18; i++) {
        const isBarrel = Math.random() > 0.4;
        let rx = 0;
        let ry = 0;
        let attempts = 0;
        do {
          rx = 260 + Math.random() * (MAP_SIZE.width - 520);
          ry = 260 + Math.random() * (MAP_SIZE.height - 520);
          attempts++;
        } while (!isSafeFromCenter(rx, ry) && attempts < 25);

        obs.push({
          id: `volc_prop_${i}`,
          x: rx,
          y: ry,
          width: isBarrel ? 36 : 56,
          height: isBarrel ? 36 : 56,
          type: isBarrel ? 'barrel' : 'magma_rock',
          hp: isBarrel ? 30 : 400,
          isExplosive: isBarrel
        });
      }
    }

    return obs;
  };

  const startWave = useCallback((waveNum: number) => {
    const state = stateRef.current;
    state.wave = waveNum;
    setWave(waveNum);

    // DYNAMIC MAP ROTATION: Every wave changes the background environment!
    const baseMap = (selectedMapIdRef.current as MapEnvironmentId) || 'rooftop';
    const baseIndex = MAP_SEQUENCE.indexOf(baseMap);
    const safeBaseIndex = baseIndex >= 0 ? baseIndex : 0;
    const currentMapIndex = (safeBaseIndex + waveNum - 1) % MAP_SEQUENCE.length;
    const nextMapId = MAP_SEQUENCE[currentMapIndex];

    state.currentMapId = nextMapId;
    state.obstacles = generateObstaclesForMap(nextMapId);

    // Sync active map back to parent application & HUD
    if (onMapChangeRef.current) {
      onMapChangeRef.current(nextMapId);
    }

    const currentDifficulty = difficultyRef.current;
    const diffMult = currentDifficulty === 'easy' ? 0.8 : currentDifficulty === 'hard' ? 1.35 : currentDifficulty === 'nightmare' ? 1.85 : 1.0;
    // Dramatically increased zombie hordes per wave: Wave 1 = ~40, Wave 2 = ~66, Wave 3 = ~96, Wave 4 = ~127, Wave 5 = ~160+
    const baseCount = Math.floor((18 + waveNum * 16 + Math.floor(Math.pow(waveNum, 1.45) * 6)) * diffMult);
    
    state.zombiesToSpawn = baseCount;
    // Every round adds 1 boss (Wave 1 = 1 boss, Wave 2 = 2 bosses, Wave 3 = 3 bosses, etc.)
    state.bossesToSpawn = waveNum;
    state.nextBossSpawnTime = performance.now() + 1500;
    state.isWaveEnding = false;
    state.bossHazards = [];
    state.sweepingLasers = [];
    state.tentacleHooks = [];
    setTotalZombiesInWave(baseCount + state.bossesToSpawn);
    setZombiesRemaining(baseCount + state.bossesToSpawn);

    // Wave Boss Archetype Announcement
    const archetypeKey = waveNum === 1 ? 'boss_mutant' : waveNum === 2 ? 'boss_abomination' : waveNum === 3 ? 'boss_cyber_behemoth' : waveNum === 4 ? 'boss_inferno_titan' : 'boss_void_reaper';
    const waveMeta = BOSS_SKILL_DATABASE[archetypeKey];
    if (waveMeta) {
      state.floatingTexts.push({
        id: Math.random().toString(),
        x: state.player.x,
        y: state.player.y - 65,
        text: `⚔️ ${waveMeta.titleVi}!`,
        color: waveMeta.themeColor,
        alpha: 1,
        life: 100,
        isCrit: true
      });
    }

    soundManager.playBossAlarm();
  }, [setWave, setTotalZombiesInWave, setZombiesRemaining]);

  // Initialize Game & Start First Wave only on initial component mount
  useEffect(() => {
    const initialMapId = (selectedMapIdRef.current as MapEnvironmentId) || 'rooftop';
    stateRef.current.currentMapId = initialMapId;
    stateRef.current.obstacles = generateObstaclesForMap(initialMapId);
    startWave(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const targetW = Math.max(300, Math.floor(canvas.parentElement?.clientWidth || window.innerWidth || 390));
      const targetH = Math.max(300, Math.floor(canvas.parentElement?.clientHeight || window.innerHeight || 844));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const ro = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let lastShotTime = 0;
    let lastStateSync = 0;

    const loop = (currentTime: number) => {
      animationId = requestAnimationFrame(loop);

      try {
        const state = stateRef.current;
        const dt = Math.min(100, currentTime - state.lastTime);
        state.lastTime = currentTime;

        if (isPausedRef.current || isShopOpenRef.current) return;

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
      const touchMove = touchMoveInputRef.current;
      if (touchMove.dx !== 0 || touchMove.dy !== 0) {
        moveX += touchMove.dx;
        moveY += touchMove.dy;
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

        let nextX = Math.max(p.radius, Math.min(MAP_SIZE.width - p.radius, p.x + nx));
        let nextY = Math.max(p.radius, Math.min(MAP_SIZE.height - p.radius, p.y + ny));

        // Smooth sliding collision with obstacles (Circle vs AABB)
        for (const obs of state.obstacles) {
          if ((obs.hp || 1) <= 0) continue;

          // Test X movement independently to allow smooth sliding
          const clampX_X = Math.max(obs.x, Math.min(obs.x + obs.width, nextX));
          const clampY_X = Math.max(obs.y, Math.min(obs.y + obs.height, p.y));
          const dx_X = nextX - clampX_X;
          const dy_X = p.y - clampY_X;
          if (dx_X * dx_X + dy_X * dy_X < p.radius * p.radius) {
            if (nx > 0) {
              nextX = Math.min(nextX, obs.x - p.radius);
            } else if (nx < 0) {
              nextX = Math.max(nextX, obs.x + obs.width + p.radius);
            } else {
              nextX = p.x;
            }
          }

          // Test Y movement independently to allow smooth sliding
          const clampX_Y = Math.max(obs.x, Math.min(obs.x + obs.width, nextX));
          const clampY_Y = Math.max(obs.y, Math.min(obs.y + obs.height, nextY));
          const dx_Y = nextX - clampX_Y;
          const dy_Y = nextY - clampY_Y;
          if (dx_Y * dx_Y + dy_Y * dy_Y < p.radius * p.radius) {
            if (ny > 0) {
              nextY = Math.min(nextY, obs.y - p.radius);
            } else if (ny < 0) {
              nextY = Math.max(nextY, obs.y + obs.height + p.radius);
            } else {
              nextY = p.y;
            }
          }
        }

        // Apply updated coordinates within map bounds
        p.x = Math.max(p.radius, Math.min(MAP_SIZE.width - p.radius, nextX));
        p.y = Math.max(p.radius, Math.min(MAP_SIZE.height - p.radius, nextY));
      }

      // Continuous unsticking / anti-trapping pass (e.g. from boss knockback / dash)
      for (const obs of state.obstacles) {
        if ((obs.hp || 1) <= 0) continue;
        const clampX = Math.max(obs.x, Math.min(obs.x + obs.width, p.x));
        const clampY = Math.max(obs.y, Math.min(obs.y + obs.height, p.y));
        const dx = p.x - clampX;
        const dy = p.y - clampY;
        const distSq = dx * dx + dy * dy;
        if (distSq < p.radius * p.radius) {
          if (distSq < 0.001) {
            // Center is completely inside box: push out to nearest edge
            const leftDist = Math.abs(p.x - obs.x);
            const rightDist = Math.abs(obs.x + obs.width - p.x);
            const topDist = Math.abs(p.y - obs.y);
            const bottomDist = Math.abs(obs.y + obs.height - p.y);
            const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
            if (minDist === leftDist) p.x = obs.x - p.radius - 1;
            else if (minDist === rightDist) p.x = obs.x + obs.width + p.radius + 1;
            else if (minDist === topDist) p.y = obs.y - p.radius - 1;
            else p.y = obs.y + obs.height + p.radius + 1;
          } else {
            const dist = Math.sqrt(distSq);
            const push = p.radius - dist + 1;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }
        }
      }

      // Player Aim Angle (Smart Auto-Aim assist, Right Touch Stick, or Mouse)
      const autoAim = autoAimEnabledRef.current;
      const touchAim = touchAimInputRef.current;
      
      const livingZombies = state.zombies.filter(z => z.hp > 0);
      const livingMinions = livingZombies.filter(z => !z.isBoss);
      const hasLivingMinions = livingMinions.length > 0;

      // Validate targetedBossId: check if targeted boss is still alive
      const activeTargetedBoss = state.targetedBossId 
        ? livingZombies.find(z => z.id === state.targetedBossId && z.isBoss) 
        : null;
      if (state.targetedBossId && !activeTargetedBoss) {
        state.targetedBossId = null; // Boss died or despawned
      }

      let closestZombie: Zombie | null = null;
      let closestDist = 650;

      if (autoAim) {
        if (activeTargetedBoss) {
          // Rule 1: Boss was clicked / targeted explicitly by the player -> Focus Boss!
          const d = Math.hypot(activeTargetedBoss.x - p.x, activeTargetedBoss.y - p.y);
          if (d < 850) {
            closestZombie = activeTargetedBoss;
            closestDist = d;
          }
        } else if (!hasLivingMinions) {
          // Rule 2: All regular minions/soldiers are dead -> Automatically shoot the Boss!
          for (const z of livingZombies) {
            const d = Math.hypot(z.x - p.x, z.y - p.y);
            if (d < closestDist) {
              closestDist = d;
              closestZombie = z;
            }
          }
        } else {
          // Rule 3: Minions are still alive and Boss has NOT been clicked -> Focus only on regular minions
          for (const z of livingMinions) {
            const d = Math.hypot(z.x - p.x, z.y - p.y);
            if (d < closestDist) {
              closestDist = d;
              closestZombie = z;
            }
          }
        }
      }

      if (touchAim.isShooting || touchAim.angle !== 0) {
        p.angle = touchAim.angle;
        state.autoAimTargetId = null;
      } else if (autoAim && closestZombie) {
        state.autoAimTargetId = closestZombie.id;
        p.angle = Math.atan2(closestZombie.y - p.y, closestZombie.x - p.x);
      } else {
        state.autoAimTargetId = null;
        if (touchMove.dx !== 0 || touchMove.dy !== 0) {
          p.angle = Math.atan2(touchMove.dy, touchMove.dx);
        } else {
          const screenCenterX = canvas.width / 2;
          const screenCenterY = canvas.height / 2;
          p.angle = Math.atan2(state.mousePos.y - screenCenterY, state.mousePos.x - screenCenterX);
        }
      }

      // 3. WEAPON SHOOTING
      const isAutoFiring = Boolean(autoAim && closestZombie && !state.isReloading);
      const isFiring = state.isMouseDown || touchAim.isShooting || isAutoFiring;
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

      // 4. SPAWN BOSS LOGIC (+1 Boss per wave: Wave 1 = 1 boss, Wave 2 = 2 bosses, etc.)
      if (state.bossesToSpawn > 0 && currentTime >= state.nextBossSpawnTime) {
        state.bossesToSpawn -= 1;
        state.nextBossSpawnTime = currentTime + 8500; // Stagger next boss spawn

        // Choose boss type based on current wave progression
        let chosenBossType: keyof typeof ZOMBIE_TEMPLATES = 'boss_mutant';
        if (state.wave === 1) {
          chosenBossType = 'boss_mutant';
        } else if (state.wave === 2) {
          chosenBossType = state.bossesToSpawn === 0 ? 'boss_abomination' : 'boss_mutant';
        } else if (state.wave === 3) {
          chosenBossType = state.bossesToSpawn === 0 ? 'boss_cyber_behemoth' : 'boss_abomination';
        } else if (state.wave === 4) {
          chosenBossType = state.bossesToSpawn === 0 ? 'boss_inferno_titan' : 'boss_cyber_behemoth';
        } else if (state.wave === 5) {
          chosenBossType = state.bossesToSpawn === 0 ? 'boss_void_reaper' : 'boss_inferno_titan';
        } else {
          // Endless / Nightmare with Enraged bosses
          const wPool: (keyof typeof ZOMBIE_TEMPLATES)[] = ['boss_cyber_behemoth', 'boss_inferno_titan', 'boss_void_reaper', 'boss_abomination', 'boss_mutant'];
          chosenBossType = wPool[Math.floor(Math.random() * wPool.length)];
        }

        const template = ZOMBIE_TEMPLATES[chosenBossType];
        const meta = BOSS_SKILL_DATABASE[chosenBossType];
        const spawnSide = Math.floor(Math.random() * 4);
        let spawnX = 0;
        let spawnY = 0;
        if (spawnSide === 0) { spawnX = Math.random() * MAP_SIZE.width; spawnY = 50; }
        else if (spawnSide === 1) { spawnX = MAP_SIZE.width - 50; spawnY = Math.random() * MAP_SIZE.height; }
        else if (spawnSide === 2) { spawnX = Math.random() * MAP_SIZE.width; spawnY = MAP_SIZE.height - 50; }
        else { spawnX = 50; spawnY = Math.random() * MAP_SIZE.height; }

        const isEnraged = state.wave >= 6;
        const currentDiff = difficultyRef.current;
        const hpScale = (1 + (state.wave - 1) * 0.38) * (currentDiff === 'nightmare' ? 1.5 : currentDiff === 'hard' ? 1.25 : 1.0);
        const diffBossSpeedMult = currentDiff === 'nightmare' ? 1.15 : currentDiff === 'hard' ? 1.08 : 1.0;
        const bossSpeedScale = (1 + (state.wave - 1) * 0.04) * diffBossSpeedMult;
        const newBoss: Zombie = {
          id: `boss_${Math.random().toString()}`,
          type: chosenBossType,
          x: spawnX,
          y: spawnY,
          radius: template.radius,
          hp: Math.round(template.hp * hpScale),
          maxHp: Math.round(template.hp * hpScale),
          speed: template.speed * bossSpeedScale,
          baseSpeed: template.speed * bossSpeedScale,
          damage: Math.round(template.damage * (1 + (state.wave - 1) * 0.15)),
          scoreValue: template.score,
          goldValue: template.gold,
          color: template.color,
          angle: 0,
          animationFrame: Math.random() * 100,
          frozenTimer: 0,
          burnTimer: 0,
          poisonTimer: 0,
          attackCooldown: 0,
          isBoss: true,
          bossSpecialState: 'idle',
          bossAttackTimer: 1800 + Math.random() * 1000
        };

        state.zombies.push(newBoss);
        soundManager.playBossAlarm();
        state.screenShake = 18;

        const bossTitle = isEnraged ? `🔥 [CUỒNG NỘ] ${template.nameVi}` : template.nameVi;
        setBossHp({ 
          current: newBoss.hp, 
          max: newBoss.maxHp, 
          name: bossTitle,
          badge: meta?.badge,
          currentSkill: meta?.skills[0].nameVi
        });

        // Floating boss alert
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: spawnX,
          y: spawnY - 30,
          text: `⚠️ ${meta ? meta.titleVi : template.nameVi}!`,
          color: meta ? meta.themeColor : '#f59e0b',
          alpha: 1,
          life: 100,
          isCrit: true
        });
      }

      // 4b. SPAWN REGULAR ZOMBIE LOGIC (Dynamic fast swarms & packs)
      const currentMode = modeRef.current;
      const spawnInterval = Math.max(160, (currentMode === 'endless' ? 300 : 520) - Math.min(320, (state.wave - 1) * 50));
      if (state.zombiesToSpawn > 0 && currentTime - state.lastSpawnTime > spawnInterval) {
        state.lastSpawnTime = currentTime;
        
        // Spawn in swarming packs: Wave 1 = 1-2, Wave 2 = 2, Wave 3+ = 2-3, Wave 5+ = 2-4
        const packSize = Math.min(
          state.zombiesToSpawn,
          state.wave >= 5 ? (Math.random() < 0.6 ? 3 : 4) : state.wave >= 3 ? (Math.random() < 0.5 ? 2 : 3) : state.wave >= 2 ? 2 : 1
        );

        for (let sp = 0; sp < packSize; sp++) {
          state.zombiesToSpawn -= 1;

          // Choose zombie archetype based on wave
          let chosenType: keyof typeof ZOMBIE_TEMPLATES = 'walker';
          const rand = Math.random();

          if (state.wave >= 4 && rand < 0.22) chosenType = 'bomber';
          else if (state.wave >= 3 && rand < 0.28) chosenType = 'spitter';
          else if (state.wave >= 2 && rand < 0.35) chosenType = 'runner';
          else if (state.wave >= 3 && rand < 0.20) chosenType = 'tank';

          const template = ZOMBIE_TEMPLATES[chosenType];

          // Spawn on map perimeter away from player with slight spread
          const spawnSide = Math.floor(Math.random() * 4);
          let spawnX = 0;
          let spawnY = 0;
          const jitter = (Math.random() - 0.5) * 50;
          if (spawnSide === 0) { spawnX = Math.random() * MAP_SIZE.width; spawnY = 50 + jitter; }
          else if (spawnSide === 1) { spawnX = MAP_SIZE.width - 50 + jitter; spawnY = Math.random() * MAP_SIZE.height; }
          else if (spawnSide === 2) { spawnX = Math.random() * MAP_SIZE.width; spawnY = MAP_SIZE.height - 50 + jitter; }
          else { spawnX = 50 + jitter; spawnY = Math.random() * MAP_SIZE.height; }

          const regDiff = difficultyRef.current;
          const hpScale = (1 + (state.wave - 1) * 0.26) * (regDiff === 'nightmare' ? 1.4 : regDiff === 'hard' ? 1.2 : 1.0);
          const diffSpeedMult = regDiff === 'nightmare' ? 1.15 : regDiff === 'hard' ? 1.08 : 1.0;
          const speedScale = Math.min(1.45, (1 + (state.wave - 1) * 0.04) * diffSpeedMult);

          const newZombie: Zombie = {
            id: Math.random().toString(),
            type: chosenType,
            x: Math.max(30, Math.min(MAP_SIZE.width - 30, spawnX)),
            y: Math.max(30, Math.min(MAP_SIZE.height - 30, spawnY)),
            radius: template.radius,
            hp: Math.round(template.hp * hpScale),
            maxHp: Math.round(template.hp * hpScale),
            speed: template.speed * speedScale,
            baseSpeed: template.speed * speedScale,
            damage: Math.round(template.damage * (1 + (state.wave - 1) * 0.12)),
            scoreValue: template.score,
            goldValue: template.gold,
            color: template.color,
            angle: 0,
            animationFrame: Math.random() * 100,
            frozenTimer: 0,
            burnTimer: 0,
            poisonTimer: 0,
            attackCooldown: 1500 + Math.random() * 1500,
            isBoss: false
          };

          state.zombies.push(newZombie);
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

      // 5.5 UPDATE COMPANION DRONES (Follow formation + autonomous combat AI)
      const unlockedConfigs = (drones || []).filter(d => d.unlocked);
      const activeDrones = state.activeDrones;
      const droneCount = activeDrones.length;

      activeDrones.forEach((drone, idx) => {
        const config = unlockedConfigs.find(c => c.id === drone.id);
        if (!config) return;

        // Formation offset around player based on count and index
        let formationAngle = p.angle;
        const formationDist = 54;
        if (droneCount === 1) {
          formationAngle += Math.PI * 0.75;
        } else if (droneCount === 2) {
          formationAngle += idx === 0 ? -Math.PI * 0.7 : Math.PI * 0.7;
        } else if (droneCount === 3) {
          if (idx === 0) formationAngle -= Math.PI * 0.65;
          else if (idx === 1) formationAngle += Math.PI * 0.65;
          else formationAngle += Math.PI;
        } else {
          if (idx === 0) formationAngle -= Math.PI * 0.65;
          else if (idx === 1) formationAngle += Math.PI * 0.65;
          else if (idx === 2) formationAngle -= Math.PI * 0.25;
          else formationAngle += Math.PI;
        }

        const targetX = p.x + Math.cos(formationAngle) * formationDist;
        const targetY = p.y + Math.sin(formationAngle) * formationDist;

        // Smooth spring physics follower with inertia
        const dx = targetX - drone.x;
        const dy = targetY - drone.y;
        drone.vx = drone.vx * 0.84 + dx * 0.08;
        drone.vy = drone.vy * 0.84 + dy * 0.08;
        drone.x += drone.vx;
        drone.y += drone.vy;

        // Banking tilt when accelerating
        drone.tilt = Math.max(-0.4, Math.min(0.4, drone.vx * 0.05));
        drone.angle = Math.atan2(drone.vy, drone.vx);

        // Gold Magnet Scout ability (for Laser Aegis drone pulling dropped loot)
        if (config.type === 'laser') {
          state.drops.forEach(item => {
            const dropDist = Math.hypot(drone.x - item.x, drone.y - item.y);
            if (dropDist < 200) {
              const pullAngle = Math.atan2(p.y - item.y, p.x - item.x);
              item.x += Math.cos(pullAngle) * 5.2;
              item.y += Math.sin(pullAngle) * 5.2;
            }
          });
        }

        // Autonomous Target Acquisition (Respects Boss Target Lock & Minion Clearing Priority)
        let bestTarget: Zombie | null = null;
        let bestDist = config.range;

        if (activeTargetedBoss && Math.hypot(activeTargetedBoss.x - drone.x, activeTargetedBoss.y - drone.y) <= config.range + 80) {
          // If player explicitly locked onto Boss, drones focus fire on Boss
          bestTarget = activeTargetedBoss;
        } else if (hasLivingMinions) {
          // If regular minions are alive, drones prioritize defending player and killing minions
          livingMinions.forEach(z => {
            const distToDrone = Math.hypot(z.x - drone.x, z.y - drone.y);
            if (distToDrone < bestDist) {
              bestDist = distToDrone;
              bestTarget = z;
            }
          });
        } else {
          // When all minions are eliminated, drones target Boss
          livingZombies.forEach(z => {
            const distToDrone = Math.hypot(z.x - drone.x, z.y - drone.y);
            if (distToDrone < bestDist) {
              bestDist = distToDrone;
              bestTarget = z;
            }
          });
        }

        if (bestTarget) {
          const aimAngle = Math.atan2((bestTarget as Zombie).y - drone.y, (bestTarget as Zombie).x - drone.x);
          drone.turretAngle = aimAngle;
          drone.targetId = (bestTarget as Zombie).id;

          const actualFireRate = Math.max(90, config.fireRate - (config.level - 1) * 20);
          const actualDmg = config.damage + (config.level - 1) * 10;

          if (currentTime - drone.lastShotTime >= actualFireRate) {
            drone.lastShotTime = currentTime;

            if (config.type === 'gatling') {
              soundManager.playDroneGatling();
              // Twin rapid energy bullets
              [-4, 4].forEach(offset => {
                const perpAngle = aimAngle + Math.PI / 2;
                const bx = drone.x + Math.cos(aimAngle) * 16 + Math.cos(perpAngle) * offset;
                const by = drone.y + Math.sin(aimAngle) * 16 + Math.sin(perpAngle) * offset;

                state.bullets.push({
                  id: Math.random().toString(),
                  x: bx,
                  y: by,
                  vx: Math.cos(aimAngle) * config.bulletSpeed,
                  vy: Math.sin(aimAngle) * config.bulletSpeed,
                  damage: actualDmg,
                  pierceLeft: 1,
                  rangeLeft: config.range,
                  radius: 3.5,
                  color: config.glowColor,
                  knockback: 2
                });
              });
            } else if (config.type === 'plasma') {
              soundManager.playDronePlasma();
              state.bullets.push({
                id: Math.random().toString(),
                x: drone.x + Math.cos(aimAngle) * 18,
                y: drone.y + Math.sin(aimAngle) * 18,
                vx: Math.cos(aimAngle) * config.bulletSpeed,
                vy: Math.sin(aimAngle) * config.bulletSpeed,
                damage: actualDmg,
                pierceLeft: 2,
                rangeLeft: config.range,
                radius: 6,
                color: config.glowColor,
                isPlasma: true,
                knockback: 5
              });
            } else if (config.type === 'laser') {
              soundManager.playDroneLaser();
              const laserEndDist = Math.min(config.range, Math.hypot((bestTarget as Zombie).x - drone.x, (bestTarget as Zombie).y - drone.y));
              const tx = drone.x + Math.cos(aimAngle) * laserEndDist;
              const ty = drone.y + Math.sin(aimAngle) * laserEndDist;

              state.laserBeams.push({
                x1: drone.x,
                y1: drone.y,
                x2: tx,
                y2: ty,
                color: config.glowColor,
                alpha: 1
              });

              (bestTarget as Zombie).hp -= actualDmg;
              soundManager.playZombieHit();

              for (let sp = 0; sp < 3; sp++) {
                state.particles.push({
                  x: tx,
                  y: ty,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  radius: 2,
                  color: config.glowColor,
                  alpha: 1,
                  life: 0,
                  maxLife: 10,
                  decay: 0.1,
                  shape: 'spark'
                });
              }
            } else if (config.type === 'missile') {
              soundManager.playDroneGatling();
              state.bullets.push({
                id: Math.random().toString(),
                x: drone.x + Math.cos(aimAngle) * 18,
                y: drone.y + Math.sin(aimAngle) * 18,
                vx: Math.cos(aimAngle) * config.bulletSpeed,
                vy: Math.sin(aimAngle) * config.bulletSpeed,
                damage: actualDmg,
                pierceLeft: 1,
                rangeLeft: config.range,
                radius: 5.5,
                color: config.glowColor,
                isExplosive: true,
                knockback: 6
              });
            }
          }
        }
      });

      // Update laser beams decay
      for (let lb = state.laserBeams.length - 1; lb >= 0; lb--) {
        state.laserBeams[lb].alpha -= 0.18;
        if (state.laserBeams[lb].alpha <= 0) {
          state.laserBeams.splice(lb, 1);
        }
      }

      // 6. UPDATE BULLETS
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        const b = state.bullets[i];

        // A. ENEMY HOMING MISSILE GUIDANCE
        if (b.isHoming && b.isEnemyBullet) {
          const desiredAngle = Math.atan2(p.y - b.y, p.x - b.x);
          const currentAngle = Math.atan2(b.vy, b.vx);
          let diff = desiredAngle - currentAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          const turn = Math.max(-0.045, Math.min(0.045, diff));
          const newAngle = currentAngle + turn;
          const speed = b.homingSpeed || 5.2;
          b.vx = Math.cos(newAngle) * speed;
          b.vy = Math.sin(newAngle) * speed;

          if (Math.random() < 0.35) {
            state.particles.push({
              x: b.x,
              y: b.y,
              vx: -Math.cos(newAngle) * 2 + (Math.random() - 0.5),
              vy: -Math.sin(newAngle) * 2 + (Math.random() - 0.5),
              radius: 2.5,
              color: '#06b6d4',
              alpha: 0.8,
              life: 0,
              maxLife: 12,
              decay: 0.08,
              shape: 'smoke'
            });
          }
        }

        b.x += b.vx;
        b.y += b.vy;
        b.rangeLeft -= Math.hypot(b.vx, b.vy);

        // If this is an enemy / boss projectile, check collision with Player
        if (b.isEnemyBullet) {
          const distToPlayer = Math.hypot(b.x - p.x, b.y - p.y);
          if (distToPlayer < p.radius + b.radius) {
            if (p.invincibleTimer <= 0 && state.activeBuffs.shieldTimer <= 0) {
              soundManager.playPlayerHurt();
              state.screenShake = 12;
              p.invincibleTimer = 500; // ms iframe

              // Cap enemy projectile damage to fair ratio (max 22% max HP)
              let dmg = Math.min(Math.round(p.maxHp * 0.22), b.damage);
              if (p.armor > 0) {
                const absorbed = Math.min(p.armor, Math.round(dmg * 0.65));
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

            // Impact particles
            for (let s = 0; s < 5; s++) {
              state.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                radius: 2.5,
                color: b.color,
                alpha: 1,
                life: 0,
                maxLife: 15,
                decay: 0.08,
                shape: 'spark'
              });
            }

            // Split on impact if applicable
            if (b.splitOnDeath) {
              const splitCnt = b.splitCount || 8;
              for (let s = 0; s < splitCnt; s++) {
                const sAng = (s / splitCnt) * Math.PI * 2;
                state.bullets.push({
                  id: Math.random().toString(),
                  x: b.x,
                  y: b.y,
                  vx: Math.cos(sAng) * 6.0,
                  vy: Math.sin(sAng) * 6.0,
                  damage: Math.round(b.damage * 0.5),
                  pierceLeft: 1,
                  rangeLeft: 300,
                  radius: 5,
                  color: '#c084fc',
                  knockback: 2,
                  isEnemyBullet: true
                });
              }
            }

            state.bullets.splice(i, 1);
            continue;
          }
        } else {
          // PLAYER & DRONE BULLETS: Check obstacle collision (Vehicles, Trees, Barrels, Crates)
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

            // If Boss is in Shadow Realm (invisible), passes through without damage
            if (z.isBoss && z.bossSpecialState === 'invisible') {
              continue;
            }

            const dist = Math.hypot(z.x - b.x, z.y - b.y);

            if (dist < z.radius + b.radius) {
              soundManager.playZombieHit();

              // Critical hit calculation
              const critChance = (p.upgrades.critChanceLevel || 0) * 0.06;
              const isCrit = Math.random() < critChance;
              let rawDmg = isCrit ? Math.round(b.damage * 2.5) : b.damage;

              // BOSS TANKINESS & HEAVY ARMOR
              // Bosses possess reinforced carapaces, absorbing 28% of incoming damage ("trâu hơn")
              if (z.isBoss) {
                rawDmg = Math.max(1, Math.round(rawDmg * 0.72));
                // Shield forcefield absorbs an additional 50% damage
                if (z.shieldTimer && z.shieldTimer > 0) {
                  rawDmg = Math.max(1, Math.round(rawDmg * 0.5));
                  for (let sp = 0; sp < 3; sp++) {
                    state.particles.push({
                      x: b.x,
                      y: b.y,
                      vx: (Math.random() - 0.5) * 4,
                      vy: (Math.random() - 0.5) * 4,
                      radius: 2,
                      color: '#38bdf8',
                      alpha: 0.9,
                      life: 0,
                      maxLife: 12,
                      decay: 0.08,
                      shape: 'spark'
                    });
                  }
                }
              }
              const finalDmg = rawDmg;

              z.hp -= finalDmg;
              b.pierceLeft -= 1;

              // Knockback (Bosses barely flinch - 0.05x knockback)
              const knockAngle = Math.atan2(b.vy, b.vx);
              const knockMult = z.isBoss ? 0.05 : 1.0;
              z.x += Math.cos(knockAngle) * (b.knockback * knockMult);
              z.y += Math.sin(knockAngle) * (b.knockback * knockMult);

              // Blood particles
              for (let k = 0; k < 6; k++) {
                state.particles.push({
                  x: b.x,
                  y: b.y,
                  vx: (Math.random() - 0.5) * 6 + b.vx * 0.15,
                  vy: (Math.random() - 0.5) * 6 + b.vy * 0.15,
                  radius: 2 + Math.random() * 3,
                  color: z.isBoss ? '#b91c1c' : '#dc2626',
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
        }

        // Check if bullet expired or reached range limit
        if (b.rangeLeft <= 0 || b.pierceLeft <= 0 || b.x < 0 || b.x > MAP_SIZE.width || b.y < 0 || b.y > MAP_SIZE.height) {
          // Split on death if expired naturally
          if (b.splitOnDeath) {
            const splitCnt = b.splitCount || 8;
            for (let s = 0; s < splitCnt; s++) {
              const sAng = (s / splitCnt) * Math.PI * 2;
              state.bullets.push({
                id: Math.random().toString(),
                x: b.x,
                y: b.y,
                vx: Math.cos(sAng) * 6.0,
                vy: Math.sin(sAng) * 6.0,
                damage: Math.round(b.damage * 0.5),
                pierceLeft: 1,
                rangeLeft: 300,
                radius: 5,
                color: '#c084fc',
                knockback: 2,
                isEnemyBullet: true
              });
            }
          }
          state.bullets.splice(i, 1);
        }
      }

      // 7. UPDATE ZOMBIES
      for (let i = state.zombies.length - 1; i >= 0; i--) {
        const z = state.zombies[i];
        z.animationFrame += 0.075 * Math.max(1.8, z.speed);

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
            // Screen shake and epic celebration on boss death
            state.screenShake = 22;
            soundManager.playExplosion();
            soundManager.playPowerUp();

            state.floatingTexts.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y - 45,
              text: `💥 TIÊU DIỆT TRÙM! RƠI CƠN MƯA VÀNG & RƯƠNG TRÙM!`,
              color: '#facc15',
              alpha: 1,
              life: 90,
              isCrit: true
            });

            // 1. MASSIVE GOLD SHOWER (Coins, Ingots, Sacks, Diamond Gems)
            // 14 bouncing golden coins
            const coinCount = 14;
            const coinVal = Math.max(25, Math.round((goldGain * 0.35) / coinCount));
            for (let c = 0; c < coinCount; c++) {
              const scatterAngle = (c / coinCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
              const scatterSpeed = 2.5 + Math.random() * 4.5;
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
                bounceZ: 30 + Math.random() * 20,
                vz: 3.5 + Math.random() * 2.5
              });
            }

            // 5 Heavy Gold Ingots
            for (let ing = 0; ing < 5; ing++) {
              const ingAngle = (ing / 5) * Math.PI * 2 + Math.random() * 0.4;
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'gold_ingot',
                value: Math.round((goldGain * 0.25) / 5) + 50,
                radius: 14,
                pulse: Math.random() * Math.PI * 2,
                createdAt: currentTime,
                vx: Math.cos(ingAngle) * 3,
                vy: Math.sin(ingAngle) * 3,
                bounceZ: 35 + Math.random() * 15,
                vz: 4.2
              });
            }

            // 2 King's Sacks of Gold
            for (let bg = 0; bg < 2; bg++) {
              const bgAngle = (bg * Math.PI) + (Math.random() - 0.5);
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'coin_bag',
                value: Math.round((goldGain * 0.2) / 2) + 120,
                radius: 16,
                pulse: 0,
                createdAt: currentTime,
                vx: Math.cos(bgAngle) * 2.2,
                vy: Math.sin(bgAngle) * 2.2,
                bounceZ: 40,
                vz: 4.5
              });
            }

            // 2 Sparkling Blue Diamonds (Kim Cương Trùm)
            for (let dm = 0; dm < 2; dm++) {
              const dmAngle = (dm * Math.PI) + Math.PI / 2 + (Math.random() - 0.5);
              state.drops.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y,
                type: 'diamond_gem',
                value: 350 + state.wave * 50,
                radius: 15,
                pulse: Math.random() * Math.PI * 2,
                createdAt: currentTime,
                vx: Math.cos(dmAngle) * 2.8,
                vy: Math.sin(dmAngle) * 2.8,
                bounceZ: 38,
                vz: 4
              });
            }

            // 2. GUARANTEED TACTICAL POWERUPS & BOSS CHEST
            // A. Legendary Boss Chest
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: 'boss_chest',
              value: 0,
              radius: 18,
              pulse: 0,
              createdAt: currentTime,
              vx: 0,
              vy: -1.2,
              bounceZ: 45,
              vz: 5
            });

            // B. Guaranteed Medkit (Hồi máu)
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: 'medkit',
              value: 0,
              radius: 15,
              pulse: 0,
              createdAt: currentTime,
              vx: -2.5,
              vy: 1.5,
              bounceZ: 30,
              vz: 3.5
            });

            // C. Guaranteed Ammo (Đạn dược)
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: 'ammo',
              value: 0,
              radius: 15,
              pulse: 0,
              createdAt: currentTime,
              vx: 2.5,
              vy: 1.5,
              bounceZ: 30,
              vz: 3.5
            });

            // D. Random Super Buff (Nuke, Double Damage, Shield, Turret, Freeze, Speed)
            const superBuffs: PowerUpType[] = ['nuke', 'double_damage', 'shield', 'turret', 'freeze', 'speed_boost'];
            const chosenBuff = superBuffs[Math.floor(Math.random() * superBuffs.length)];
            state.drops.push({
              id: Math.random().toString(),
              x: z.x,
              y: z.y,
              type: chosenBuff,
              value: 0,
              radius: 15,
              pulse: 0,
              createdAt: currentTime,
              vx: 0,
              vy: 2.5,
              bounceZ: 32,
              vz: 3.8
            });

            setBossHp(null);
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

            // Tactical Drop Chance for elites (25%)
            if (Math.random() < 0.25) {
              const types: PowerUpType[] = ['medkit', 'ammo', 'double_damage', 'speed_boost', 'freeze', 'shield', 'turret'];
              const chosenDrop = types[Math.floor(Math.random() * types.length)];
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

            // Normal powerup drop chance (12%)
            if (Math.random() < 0.12) {
              const types: PowerUpType[] = ['medkit', 'ammo', 'double_damage', 'speed_boost', 'freeze', 'shield', 'turret'];
              const chosenDrop = types[Math.floor(Math.random() * types.length)];
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
          }

          // Kamikaze explode
          if (z.type === 'bomber') {
            triggerExplosion(z.x, z.y, 140, z.damage * 2);
          }

          state.zombies.splice(i, 1);
          const remainingZombies = state.zombies.length + state.zombiesToSpawn;
          setZombiesRemaining(prev => prev === remainingZombies ? prev : remainingZombies);
          continue;
        }

        // Movement towards player & Combat AI
        const isFrozen = state.activeBuffs.freezeEnemiesTimer > 0;
        if (!isFrozen) {
          const zAngle = Math.atan2(p.y - z.y, p.x - z.x);
          z.angle = zAngle;
          const distToPlayer = Math.hypot(p.x - z.x, p.y - z.y);

          // ----------------------------------------------------
          // A. SPITTER ACID SPIT ATTACK
          // ----------------------------------------------------
          if (z.type === 'spitter' && distToPlayer < 440 && distToPlayer > 75) {
            z.attackCooldown = (z.attackCooldown || 2200) - dt;
            if (z.attackCooldown <= 0) {
              z.attackCooldown = 2200 + Math.random() * 800;
              state.bullets.push({
                id: Math.random().toString(),
                x: z.x + Math.cos(zAngle) * (z.radius + 6),
                y: z.y + Math.sin(zAngle) * (z.radius + 6),
                vx: Math.cos(zAngle) * 6.2,
                vy: Math.sin(zAngle) * 6.2,
                damage: z.damage,
                pierceLeft: 1,
                rangeLeft: 440,
                radius: 5.5,
                color: '#84cc16',
                knockback: 1,
                isEnemyBullet: true
              });
            }
          }

          // ----------------------------------------------------
          // B. UNIQUE BOSS SKILLS PER WAVE & ENHANCED COMBAT AI
          // ----------------------------------------------------
          if (z.isBoss) {
            processBossCombatAI(
              z,
              {
                player: p,
                zombies: state.zombies,
                bullets: state.bullets,
                particles: state.particles,
                floatingTexts: state.floatingTexts,
                bossHazards: state.bossHazards,
                sweepingLasers: state.sweepingLasers,
                tentacleHooks: state.tentacleHooks,
                obstacles: state.obstacles,
                screenShake: state.screenShake,
                wave: state.wave
              },
              dt,
              currentTime,
              triggerExplosion
            );

            // Sync updated Boss HP and current active skill to HUD only when changed
            const meta = BOSS_SKILL_DATABASE[z.type];
            const bossTitle = ZOMBIE_TEMPLATES[z.type]?.nameVi || 'TRÙM';
            setBossHp(prev => {
              if (
                prev &&
                prev.current === z.hp &&
                prev.max === z.maxHp &&
                prev.name === bossTitle &&
                prev.currentSkill === z.currentSkillName
              ) {
                return prev;
              }
              return { 
                current: z.hp, 
                max: z.maxHp, 
                name: bossTitle,
                badge: meta?.badge,
                currentSkill: z.currentSkillName
              };
            });
          }

          const zSpeed = z.speed;
          z.x += Math.cos(zAngle) * zSpeed;
          z.y += Math.sin(zAngle) * zSpeed;

          // Attack player on contact
          if (distToPlayer < p.radius + z.radius) {
            if (p.invincibleTimer <= 0 && state.activeBuffs.shieldTimer <= 0) {
              soundManager.playPlayerHurt();
              state.screenShake = z.isBoss ? 22 : 12;

              let dmg = 0;
              if (z.isBoss) {
                // Boss Hit: Generous invincibility iframe (1100ms) to prevent multi-hit frame ticking
                p.invincibleTimer = 1100;

                // Push warrior away with elastic knockback to escape boss hitbox
                const knockAngle = Math.atan2(p.y - z.y, p.x - z.x);
                const knockDist = 60;
                p.x = Math.max(p.radius, Math.min(MAP_SIZE.width - p.radius, p.x + Math.cos(knockAngle) * knockDist));
                p.y = Math.max(p.radius, Math.min(MAP_SIZE.height - p.radius, p.y + Math.sin(knockAngle) * knockDist));

                // Balance damage so boss must hit 2 to 3 times from full health to kill warrior
                // Normal boss touch: ~35% of player's max HP (takes 3 direct hits with no armor).
                // Furious charging rush: ~42% of player's max HP (takes 2-3 direct hits).
                const hitRatio = z.bossSpecialState === 'charging' ? 0.42 : 0.35;
                dmg = Math.round(p.maxHp * hitRatio);

                if (p.armor > 0) {
                  const absorbed = Math.min(p.armor, Math.round(dmg * 0.65));
                  p.armor -= absorbed;
                  dmg -= absorbed;
                }
              } else {
                // Regular minion contact
                p.invincibleTimer = 450;
                dmg = z.damage;
                if (p.armor > 0) {
                  const absorbed = Math.min(p.armor, Math.round(dmg * 0.7));
                  p.armor -= absorbed;
                  dmg -= absorbed;
                }
              }

              p.hp -= dmg;

              // Game Over check
              if (p.hp <= 0) {
                p.hp = 0;
                soundManager.stopMusic();
                onGameOverRef.current();
                return;
              }
            }
          }
        }
      }

      // Check Boss cleared
      if (!state.zombies.some(z => z.isBoss)) {
        setBossHp(prev => prev ? null : prev);
      }

      // Helper for player taking damage from boss hazards / lasers / hooks
      const handlePlayerHazardDamage = (dmg: number) => {
        if (p.invincibleTimer <= 0 && state.activeBuffs.shieldTimer <= 0) {
          soundManager.playPlayerHurt();
          state.screenShake = 14;
          p.invincibleTimer = 550;

          // Cap hazard damage to max 22% of max HP per hit
          let actualDmg = Math.min(Math.round(p.maxHp * 0.22), dmg);
          if (p.armor > 0) {
            const absorbed = Math.min(p.armor, Math.round(actualDmg * 0.65));
            p.armor -= absorbed;
            actualDmg -= absorbed;
          }
          p.hp = Math.max(0, p.hp - actualDmg);
          if (p.hp <= 0) {
            p.hp = 0;
            soundManager.stopMusic();
            onGameOverRef.current();
          }
        }
      };

      const bossCtx = {
        player: p,
        zombies: state.zombies,
        bullets: state.bullets,
        particles: state.particles,
        floatingTexts: state.floatingTexts,
        bossHazards: state.bossHazards,
        sweepingLasers: state.sweepingLasers,
        tentacleHooks: state.tentacleHooks,
        obstacles: state.obstacles,
        screenShake: state.screenShake,
        wave: state.wave
      };

      updateBossHazards(bossCtx, dt, currentTime, triggerExplosion, handlePlayerHazardDamage);
      updateSweepingLasers(bossCtx, dt, handlePlayerHazardDamage);
      updateTentacleHooks(bossCtx, dt, handlePlayerHazardDamage);

      // 8. UPDATE DROPS & MAGNET (Smooth Magnetic Suction for effortless mobile play)
      const magnetRange = 135 + (p.upgrades.magnetRadiusLevel || 0) * 55;
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
          if (item.type === 'gold_coin' || item.type === 'gold_ingot' || item.type === 'coin_bag' || item.type === 'diamond_gem') {
            // GOLD & GEM PICKUP
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
            const isDiamond = item.type === 'diamond_gem';
            const sparkleColor = isDiamond ? '#38bdf8' : '#facc15';
            for (let sp = 0; sp < (isDiamond ? 10 : 6); sp++) {
              state.particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                radius: isDiamond ? 3 : 2.5,
                color: sparkleColor,
                alpha: 1,
                life: 0,
                maxLife: 18,
                decay: 0.06,
                shape: 'spark'
              });
            }

            state.floatingTexts.push({
              id: Math.random().toString(),
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y - 25,
              text: isDiamond ? `💎 +${item.value} KIM CƯƠNG VÀNG!` : `+${item.value} VÀNG`,
              color: isDiamond ? '#38bdf8' : '#facc15',
              alpha: 1,
              life: 45,
              isCrit: item.type === 'coin_bag' || item.type === 'gold_ingot' || isDiamond
            });
          } else if (item.type === 'boss_chest') {
            // EPIC BOSS CHEST PICKUP
            soundManager.playPowerUp();
            soundManager.playGoldPickup();

            // Fully restore HP and Armor
            p.hp = p.maxHp;
            p.armor = p.maxArmor;
            p.grenadeCount = Math.min(6, (p.grenadeCount || 0) + 3);
            p.gold += 500;
            p.score += 2500;

            // Refill all reserve ammo
            (Object.values(state.weapons) as Weapon[]).forEach(w => {
              if (w.reserveAmmo !== -1) w.reserveAmmo = w.magSize * 6;
            });

            setPlayer(prev => ({
              ...prev,
              hp: p.hp,
              armor: p.armor,
              grenadeCount: p.grenadeCount,
              gold: p.gold,
              score: p.score
            }));
            setWeapons(prev => ({ ...prev }));

            // Massive colorful victory fireworks
            for (let sp = 0; sp < 16; sp++) {
              const fAngle = (sp / 16) * Math.PI * 2;
              const fSpeed = 3 + Math.random() * 4;
              state.particles.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(fAngle) * fSpeed,
                vy: Math.sin(fAngle) * fSpeed,
                radius: 3.5,
                color: ['#facc15', '#ec4899', '#38bdf8', '#4ade80', '#a855f7'][sp % 5],
                alpha: 1,
                life: 0,
                maxLife: 25,
                decay: 0.04,
                shape: 'spark'
              });
            }

            state.floatingTexts.push({
              id: Math.random().toString(),
              x: p.x,
              y: p.y - 35,
              text: '👑 RƯƠNG TRÙM: HỒI ĐẦY MÁU/GIÁP, +3 LỰU ĐẠN & +500 VÀNG!',
              color: '#facc15',
              alpha: 1,
              life: 80,
              isCrit: true
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

      // 10. WIDE TACTICAL CAMERA TRACKING & OPTIMIZED PERSPECTIVE
      // Wide FOV view on mobile to see surrounding hordes and battlefield clearly
      const currentZoomMode = cameraZoomModeRef.current;
      let baseZoom = canvas.width < 640 ? 0.62 : canvas.width < 1024 ? 0.78 : 0.92;
      if (currentZoomMode === 'ultrawide') baseZoom *= 0.80;
      else if (currentZoomMode === 'normal') baseZoom *= 1.25;
      const zoom = baseZoom;

      const viewHalfW = (canvas.width / 2) / zoom;
      const viewHalfH = (canvas.height / 2) / zoom;
      
      // Dynamic look-ahead lead in aiming direction
      const lookAhead = 25;
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

      if (isNaN(state.camera.x) || !isFinite(state.camera.x)) state.camera.x = p.x || MAP_SIZE.width / 2;
      if (isNaN(state.camera.y) || !isFinite(state.camera.y)) state.camera.y = p.y || MAP_SIZE.height / 2;
      if (isNaN(targetCamX) || !isFinite(targetCamX)) targetCamX = state.camera.x;
      if (isNaN(targetCamY) || !isFinite(targetCamY)) targetCamY = state.camera.y;

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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      try {
        // Apply screen shake
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;

        // Apply Zoom & Camera Transform
        ctx.translate(canvas.width / 2 + shakeX, canvas.height / 2 + shakeY);
        ctx.scale(zoom, zoom);
        ctx.translate(-state.camera.x, -state.camera.y);

        // Render Selected Flexible Map Environment (Rotates dynamically every wave!)
        renderMapEnvironment({
          ctx,
          mapId: state.currentMapId || selectedMapIdRef.current || 'rooftop',
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

      // Render Boss Hazards, Sweeping Lasers, Tentacle Hooks
      renderBossSpecialEffects(
        ctx,
        state.bossHazards,
        state.sweepingLasers,
        state.tentacleHooks,
        currentTime
      );

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

        // Target Lock & Auto-Aim Indicators
        const isTargetedBoss = Boolean(z.isBoss && state.targetedBossId === z.id);
        const isAutoAimTarget = Boolean(state.autoAimTargetId === z.id && autoAimEnabledRef.current);

        if (isTargetedBoss || isAutoAimTarget) {
          ctx.save();
          const isBossLock = isTargetedBoss;
          const reticleColor = isBossLock ? '#ef4444' : z.isBoss ? '#f59e0b' : '#10b981';
          const shadowColor = isBossLock ? '#f87171' : z.isBoss ? '#fbbf24' : '#34d399';
          
          ctx.strokeStyle = reticleColor;
          ctx.lineWidth = isBossLock ? 3 : 2;
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = isBossLock ? 16 : 10;
          const rot = (currentTime / (isBossLock ? 180 : 300));
          const r = z.radius + (isBossLock ? 16 : 10);

          // 4 Rotating Target Brackets
          ctx.beginPath();
          ctx.arc(z.x, z.y, r, rot, rot + Math.PI * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(z.x, z.y, r, rot + Math.PI * 0.5, rot + Math.PI * 0.9);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(z.x, z.y, r, rot + Math.PI, rot + Math.PI * 1.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(z.x, z.y, r, rot + Math.PI * 1.5, rot + Math.PI * 1.9);
          ctx.stroke();

          // Center target crosshair/dot
          ctx.fillStyle = reticleColor;
          ctx.beginPath();
          ctx.arc(z.x, z.y, isBossLock ? 4 : 3, 0, Math.PI * 2);
          ctx.fill();

          if (isBossLock) {
            // "🎯 ĐÃ KHÓA BOSS" text banner over Boss
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ef4444';
            ctx.fillText('🎯 ĐÃ KHÓA BOSS', z.x, z.y - z.radius - 18);
          }
          ctx.restore();
        } else if (z.isBoss && hasLivingMinions && !state.targetedBossId) {
          // Subtle hint that tapping/clicking the boss will lock target
          ctx.save();
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 4;
          const bounce = Math.sin(currentTime / 200) * 3;
          ctx.fillText('🎯 [Chạm/Click để Khóa]', z.x, z.y - z.radius - 18 + bounce);
          ctx.restore();
        }
      });

      // Render Laser Beams
      state.laserBeams.forEach(beam => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, beam.alpha);
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = beam.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
        ctx.restore();
      });

      // Render Bullets
      state.bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.isEnemyBullet ? 14 : 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        if (b.isEnemyBullet) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
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

      // Render Active Companion Drones (Hovering robotic allies flanking warrior)
      state.activeDrones.forEach(droneState => {
        const cfg = (dronesRef.current || []).find(d => d.id === droneState.id);
        if (cfg) {
          renderCompanionDrone({
            ctx,
            droneState,
            config: cfg,
            time: currentTime
          });
        }
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

      } finally {
        ctx.restore(); // Restore camera transform
      }
      } catch (loopError) {
        console.error("Game loop error handled:", loopError);
      }
    };

    const handleToggleBossLock = () => {
      const state = stateRef.current;
      const livingBosses = state.zombies.filter(z => z.isBoss && z.hp > 0);
      if (livingBosses.length === 0) return;
      
      if (state.targetedBossId) {
        state.targetedBossId = null;
        soundManager.playEmptyClick();
      } else {
        const firstBoss = livingBosses[0];
        state.targetedBossId = firstBoss.id;
        soundManager.playPowerUp();
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: firstBoss.x,
          y: firstBoss.y - firstBoss.radius - 24,
          text: '🎯 ĐÃ KHÓA MỤC TIÊU: BOSS!',
          color: '#ef4444',
          alpha: 1,
          life: 55,
          isCrit: true
        });
      }
    };
    window.addEventListener('toggle-boss-lock', handleToggleBossLock);

    animationId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('toggle-boss-lock', handleToggleBossLock);
      ro.disconnect();
    };
  }, []);

  // Helper to check if a screen coordinate clicks on a Boss
  const checkBossTargetAtScreen = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = clientX - rect.left;
    const screenY = clientY - rect.top;

    const currentZoomMode = cameraZoomModeRef.current;
    let baseZoom = canvas.width < 640 ? 0.62 : canvas.width < 1024 ? 0.78 : 0.92;
    if (currentZoomMode === 'ultrawide') baseZoom *= 0.80;
    else if (currentZoomMode === 'normal') baseZoom *= 1.25;
    const zoom = baseZoom;

    const state = stateRef.current;
    const worldX = (screenX - canvas.width / 2) / zoom + state.camera.x;
    const worldY = (screenY - canvas.height / 2) / zoom + state.camera.y;

    // Check if clicked directly on or near a Boss
    const clickedBoss = state.zombies.find(
      z => z.isBoss && z.hp > 0 && Math.hypot(z.x - worldX, z.y - worldY) <= Math.max(z.radius + 45, 65)
    );

    if (clickedBoss) {
      if (state.targetedBossId === clickedBoss.id) {
        // Toggle off lock
        state.targetedBossId = null;
        soundManager.playEmptyClick();
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: clickedBoss.x,
          y: clickedBoss.y - clickedBoss.radius - 20,
          text: '🔓 ĐÃ BỎ KHÓA (ƯU TIÊN DIỆT LÍNH)',
          color: '#38bdf8',
          alpha: 1,
          life: 45
        });
      } else {
        // Lock target onto this Boss
        state.targetedBossId = clickedBoss.id;
        soundManager.playPowerUp();
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: clickedBoss.x,
          y: clickedBoss.y - clickedBoss.radius - 24,
          text: '🎯 ĐÃ KHÓA MỤC TIÊU: BOSS!',
          color: '#ef4444',
          alpha: 1,
          life: 55,
          isCrit: true
        });
      }
    } else {
      // If clicked on a regular minion, clear boss target lock to prioritize minions
      const clickedMinion = state.zombies.find(
        z => !z.isBoss && z.hp > 0 && Math.hypot(z.x - worldX, z.y - worldY) <= z.radius + 20
      );
      if (clickedMinion && state.targetedBossId) {
        state.targetedBossId = null;
      }
    }
  };

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
      checkBossTargetAtScreen(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    stateRef.current.isMouseDown = false;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      checkBossTargetAtScreen(touch.clientX, touch.clientY);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      className="absolute inset-0 w-full h-full block cursor-crosshair select-none bg-neutral-950 touch-none"
    />
  );
};
