import React, { useRef, useEffect, useCallback } from 'react';
import { 
  PlayerStats, Weapon, WeaponType, Zombie, Bullet, 
  Particle, Decal, DropItem, ActiveTurret, FloatingText, 
  Obstacle, ActiveBuffs, GameDifficulty, GameMode, PowerUpType,
  MapEnvironmentId, BossHazard, SweepingLaser, TentacleHook, GameViewMode,
  ArenaEventState, EnvironmentalHazardZone, DynamicArenaEventType, TacticalGrenadeType
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
import { ThreeRenderer } from './ThreeRenderer';

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
  viewMode?: GameViewMode;
  onUltimateUsed?: () => void;
  onRadarUpdate?: (zombies: Zombie[], drops: DropItem[]) => void;
  onBossKilled?: () => void;
  onLevelUp?: () => void;
  onArenaEventChange?: (event: ArenaEventState | null) => void;
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
  cameraZoomMode = 'wide',
  viewMode = '2d',
  onUltimateUsed,
  onRadarUpdate,
  onBossKilled,
  onLevelUp,
  onArenaEventChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRendererRef = useRef<ThreeRenderer | null>(null);

  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const onUltimateUsedRef = useRef(onUltimateUsed);
  onUltimateUsedRef.current = onUltimateUsed;

  const onRadarUpdateRef = useRef(onRadarUpdate);
  onRadarUpdateRef.current = onRadarUpdate;

  const onBossKilledRef = useRef(onBossKilled);
  onBossKilledRef.current = onBossKilled;

  const onLevelUpRef = useRef(onLevelUp);
  onLevelUpRef.current = onLevelUp;

  const onArenaEventChangeRef = useRef(onArenaEventChange);
  onArenaEventChangeRef.current = onArenaEventChange;

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
    slowMoTimer: number;
    bossDefeatedBanner: { text: string; subText: string; alpha: number; timer: number; themeColor: string } | null;
    orbitalStrikes: Array<{ x: number; y: number; delay: number; triggered: boolean }>;
    titanEmpPulses: Array<{ delay: number; triggered: boolean }>;
    waveHazard: { id: string; nameVi: string; descVi: string; color: string; bannerTimer: number; nextEventTime: number } | null;
    hazardStrikes: Array<{ id: string; x: number; y: number; radius: number; timer: number; maxTimer: number; type: 'lightning' | 'meteor' | 'spore'; damage: number }>;
    lightningFlashAlpha: number;
    chainLightningTimer: number;
    dynamicEventTimer: number;
    currentArenaEvent: ArenaEventState | null;
    environmentalZones: EnvironmentalHazardZone[];
    vampiricKillCounter: number;
  }>({
    player: { 
      ...player, 
      level: player.level || 1,
      exp: player.exp || 0,
      maxExp: player.maxExp || 100,
      roguelikeSkills: { ...(player.roguelikeSkills || {}) },
      ultimateCharge: player.ultimateCharge || 0 
    },
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
    targetedBossId: null,
    slowMoTimer: 0,
    bossDefeatedBanner: null,
    orbitalStrikes: [],
    titanEmpPulses: [],
    waveHazard: null,
    hazardStrikes: [],
    lightningFlashAlpha: 0,
    chainLightningTimer: 3500,
    dynamicEventTimer: 35000,
    currentArenaEvent: null,
    environmentalZones: [
      { id: 'toxic_1', type: 'toxic_pool', x: 650, y: 700, radius: 130, damage: 35, pulseTimer: 0, color: '#22c55e' },
      { id: 'toxic_2', type: 'toxic_pool', x: 1950, y: 1300, radius: 140, damage: 35, pulseTimer: 0, color: '#22c55e' },
      { id: 'electric_1', type: 'electric_leak', x: 1300, y: 550, radius: 125, damage: 45, pulseTimer: 0, color: '#38bdf8' },
      { id: 'electric_2', type: 'electric_leak', x: 1400, y: 1450, radius: 130, damage: 45, pulseTimer: 0, color: '#38bdf8' }
    ],
    vampiricKillCounter: 0
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
      p.level = player.level || 1;
      p.exp = player.exp || 0;
      p.maxExp = player.maxExp || 100;
      p.roguelikeSkills = { ...(player.roguelikeSkills || {}) };
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
    const currentActive = stateRef.current.activeDrones || [];
    const unlockedConfigs = drones.filter(d => d.unlocked);
    const px = stateRef.current.player?.x ?? player.x;
    const py = stateRef.current.player?.y ?? player.y;

    const updatedActive: ActiveDroneState[] = unlockedConfigs.map((cfg, idx) => {
      const existing = currentActive.find(a => a.id === cfg.id);
      if (existing) {
        return existing;
      }
      const angle = (idx / Math.max(1, unlockedConfigs.length)) * Math.PI * 2;
      return {
        id: cfg.id,
        type: cfg.type,
        x: px + Math.cos(angle) * 55,
        y: py + Math.sin(angle) * 55,
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
  }, [drones]);

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
    threeRendererRef.current?.syncObstacles(state.obstacles);

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
    state.hazardStrikes = [];
    setTotalZombiesInWave(baseCount + state.bossesToSpawn);
    setZombiesRemaining(baseCount + state.bossesToSpawn);

    // Dynamic Wave Environmental Hazards System
    let hazard = null;
    if (waveNum === 2 || waveNum === 7) {
      hazard = {
        id: 'bio_rain',
        nameVi: 'BÃO BÀO TỬ KHÍ ĐỘC BIO-HAZARD',
        descVi: 'Mưa bào tử acid ăn mòn chiến trường, tạo ổ nổ độc tố tiêu diệt quái vật',
        color: '#10b981',
        bannerTimer: 240,
        nextEventTime: performance.now() + 3500
      };
    } else if (waveNum === 3 || waveNum === 8) {
      hazard = {
        id: 'lightning_storm',
        nameVi: 'BÃO SẤM SÉT TỪ TRƯỜNG ĐÔ THỊ',
        descVi: 'Tia sét điện trường định kỳ giáng xuống giật điện thiêu rụi bầy quái vật',
        color: '#38bdf8',
        bannerTimer: 240,
        nextEventTime: performance.now() + 4000
      };
    } else if (waveNum === 4 || waveNum === 9) {
      hazard = {
        id: 'meteor_fire',
        nameVi: 'MƯA NHAM THẠCH & THIÊN THẠCH LỬA',
        descVi: 'Thiên thạch rực lửa rơi xuống tạo hố nổ thiêu rụi mọi zombie lọt vào',
        color: '#f97316',
        bannerTimer: 240,
        nextEventTime: performance.now() + 4200
      };
    } else if (waveNum === 5) {
      hazard = {
        id: 'void_eclipse',
        nameVi: 'NHẬT THỰC HUYẾT NGUYỆT ĐẠI DỊCH',
        descVi: 'Bầu trời đỏ quạch, sấm sét liên hồi báo hiệu chúa tể Boss đột biến!',
        color: '#ef4444',
        bannerTimer: 260,
        nextEventTime: performance.now() + 3000
      };
    } else if (waveNum === 6) {
      hazard = {
        id: 'sandstorm',
        nameVi: 'BÃO CÁT CHIẾN TUYẾN CUỒNG PHONG',
        descVi: 'Cuồng phong cát đỏ kích thích tăng tốc độ di chuyển của chiến binh!',
        color: '#eab308',
        bannerTimer: 240,
        nextEventTime: performance.now() + 4500
      };
    }
    state.waveHazard = hazard;

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
      // Cycle Tactical Grenade Variant (X)
      if (key === 'x') {
        handleCycleGrenade();
      }
      // Deploy Sentry Turret (T)
      if (key === 't') {
        handleDeployTurret();
      }
      // Deploy Electric Trap (Y)
      if (key === 'y') {
        handleDeployTrap();
      }
      // Ultimate Skill (F or U)
      if (key === 'f' || key === 'u') {
        handleUltimate();
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

    const handleTriggerUltimateEvent = () => {
      handleUltimate();
    };

    const handleCycleGrenadeEvent = () => {
      handleCycleGrenade();
    };

    const handleThrowGrenadeEvent = () => {
      handleGrenade();
    };

    const handleDeployTurretEvent = () => {
      handleDeployTurret();
    };

    const handleDeployTrapEvent = () => {
      handleDeployTrap();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('trigger-ultimate', handleTriggerUltimateEvent);
    window.addEventListener('cycle-grenade', handleCycleGrenadeEvent);
    window.addEventListener('throw-grenade', handleThrowGrenadeEvent);
    window.addEventListener('deploy-turret', handleDeployTurretEvent);
    window.addEventListener('deploy-trap', handleDeployTrapEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('trigger-ultimate', handleTriggerUltimateEvent);
      window.removeEventListener('cycle-grenade', handleCycleGrenadeEvent);
      window.removeEventListener('throw-grenade', handleThrowGrenadeEvent);
      window.removeEventListener('deploy-turret', handleDeployTurretEvent);
      window.removeEventListener('deploy-trap', handleDeployTrapEvent);
    };
  }, []);

  const handleUltimate = () => {
    const state = stateRef.current;
    const p = state.player;
    if ((p.ultimateCharge || 0) < 100 || p.isUltimateActive) {
      soundManager.playEmptyClick();
      return;
    }

    p.ultimateCharge = 0;
    p.isUltimateActive = true;
    soundManager.playUltimateActivate();

    const skin = p.warriorSkin || 'commando';

    if (skin === 'commando') {
      // 1. Orbital Airstrike: 12 rockets rain down
      p.ultimateTimer = 3500;
      state.screenShake = 24;
      state.floatingTexts.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 70,
        text: '🚀 BÃO LỬA KHÔNG KÍCH AIRSTRIKE!',
        color: '#ef4444',
        alpha: 1,
        life: 90,
        isCrit: true
      });

      // Schedule 12 strikes around player with delays
      for (let s = 0; s < 12; s++) {
        const offsetAng = Math.random() * Math.PI * 2;
        const offsetDist = 50 + Math.random() * 260;
        state.orbitalStrikes.push({
          x: p.x + Math.cos(offsetAng) * offsetDist,
          y: p.y + Math.sin(offsetAng) * offsetDist,
          delay: 150 + s * 160,
          triggered: false
        });
      }
    } else if (skin === 'ghost') {
      // 2. Chrono Matrix & Ghost Stealth
      p.ultimateTimer = 5000;
      p.invincibleTimer = 3000;
      state.screenShake = 12;
      state.floatingTexts.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 70,
        text: '⏳ MA TRẬN CHRONO: SLOW-MO 80% & 100% CRIT!',
        color: '#10b981',
        alpha: 1,
        life: 100,
        isCrit: true
      });
    } else if (skin === 'cyber') {
      // 3. Titan Overload & Invincible EMP
      p.ultimateTimer = 6000;
      p.invincibleTimer = 6000;
      state.screenShake = 22;
      state.floatingTexts.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 70,
        text: '⚡ QUÁ TẢI CƠ GIÁP: BẤT TỬ & SÓNG XUNG KÍCH EMP!',
        color: '#f59e0b',
        alpha: 1,
        life: 100,
        isCrit: true
      });

      // Schedule 4 massive EMP pulses
      for (let ep = 0; ep < 4; ep++) {
        state.titanEmpPulses.push({
          delay: 200 + ep * 1300,
          triggered: false
        });
      }
    }

    if (onUltimateUsedRef.current) {
      onUltimateUsedRef.current();
    }
  };

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

  const handleCycleGrenade = () => {
    const state = stateRef.current;
    const p = state.player;
    const current = p.selectedGrenadeType || 'frag';
    const next: TacticalGrenadeType = current === 'frag' ? 'cryo' : current === 'cryo' ? 'vortex' : 'frag';
    p.selectedGrenadeType = next;
    setPlayer(prev => ({ ...prev, selectedGrenadeType: next }));
    soundManager.playEmptyClick();

    const title = next === 'frag' 
      ? '💥 LỰU ĐẠN NỔ MẢNH (FRAG) [G]' 
      : next === 'cryo' 
        ? '❄️ LỰU ĐẠN HÀN BĂNG (CRYO) [G]' 
        : '🌀 LỰU ĐẠN LỖ ĐEN (VORTEX) [G]';
    const color = next === 'frag' ? '#f97316' : next === 'cryo' ? '#38bdf8' : '#c084fc';

    state.floatingTexts.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 35,
      text: title,
      color,
      alpha: 1,
      life: 50,
      isCrit: true
    });
  };

  const handleDeployTurret = () => {
    const state = stateRef.current;
    const p = state.player;
    if ((p.turretInventory || 0) <= 0) {
      if (p.gold >= 350) {
        p.gold -= 350;
        setPlayer(prev => ({ ...prev, gold: prev.gold - 350 }));
      } else {
        soundManager.playEmptyClick();
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 30,
          text: '⚠️ CẦN 350 VÀNG ĐỂ ĐẶT THÁP SÚNG [T]!',
          color: '#ef4444',
          alpha: 1,
          life: 45
        });
        return;
      }
    } else {
      p.turretInventory = (p.turretInventory || 1) - 1;
      setPlayer(prev => ({ ...prev, turretInventory: (prev.turretInventory || 1) - 1 }));
    }

    soundManager.playDroneDeploy();
    state.turrets.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y,
      angle: p.angle,
      duration: 35000,
      maxDuration: 35000,
      hp: 300,
      maxHp: 300,
      type: 'sentry',
      range: 480,
      lastShotTime: 0,
      pulseTimer: 0
    });

    state.floatingTexts.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 35,
      text: '🛡️ TRIỂN KHAI THÁP SÚNG TỰ ĐỘNG (SENTRY)!',
      color: '#a855f7',
      alpha: 1,
      life: 50,
      isCrit: true
    });

    window.dispatchEvent(new CustomEvent('achievement-event', { detail: { type: 'deploy_turret' } }));
  };

  const handleDeployTrap = () => {
    const state = stateRef.current;
    const p = state.player;
    if ((p.trapInventory || 0) <= 0) {
      if (p.gold >= 250) {
        p.gold -= 250;
        setPlayer(prev => ({ ...prev, gold: prev.gold - 250 }));
      } else {
        soundManager.playEmptyClick();
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: p.x,
          y: p.y - 30,
          text: '⚠️ CẦN 250 VÀNG ĐỂ ĐẶT BẪY ĐIỆN [Y]!',
          color: '#ef4444',
          alpha: 1,
          life: 45
        });
        return;
      }
    } else {
      p.trapInventory = (p.trapInventory || 1) - 1;
      setPlayer(prev => ({ ...prev, trapInventory: (prev.trapInventory || 1) - 1 }));
    }

    soundManager.playPlasmaShot();
    state.turrets.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y,
      angle: 0,
      duration: 30000,
      maxDuration: 30000,
      hp: 250,
      maxHp: 250,
      type: 'electric_trap',
      range: 220,
      slowRadius: 220,
      lastShotTime: 0,
      pulseTimer: 0
    });

    state.floatingTexts.push({
      id: Math.random().toString(),
      x: p.x,
      y: p.y - 35,
      text: '⚡ KÍCH HOẠT BẪY ĐIỆN TỬ TRƯỜNG CAO THẾ!',
      color: '#38bdf8',
      alpha: 1,
      life: 50,
      isCrit: true
    });

    window.dispatchEvent(new CustomEvent('achievement-event', { detail: { type: 'deploy_turret' } }));
  };

  const handleGrenade = () => {
    const state = stateRef.current;
    const p = state.player;
    if (p.grenadeCount <= 0) {
      soundManager.playEmptyClick();
      state.floatingTexts.push({
        id: Math.random().toString(),
        x: p.x,
        y: p.y - 30,
        text: '⚠️ HẾT LỰU ĐẠN! MUA THÊM TẠI SHOP (B)',
        color: '#ef4444',
        alpha: 1,
        life: 40
      });
      return;
    }

    p.grenadeCount -= 1;
    setPlayer(prev => ({ ...prev, grenadeCount: prev.grenadeCount - 1 }));

    // Create tactical blast at mouse target or ahead of player
    const targetX = p.x + Math.cos(p.angle) * 170;
    const targetY = p.y + Math.sin(p.angle) * 170;

    const gType = p.selectedGrenadeType || 'frag';
    if (gType === 'cryo') {
      triggerCryoBlast(targetX, targetY, 280, 260);
    } else if (gType === 'vortex') {
      triggerVortexBlackHole(targetX, targetY, 340, 320);
    } else {
      triggerExplosion(targetX, targetY, 240, 420);
      // Spawn 12 lethal shrapnel bullets flying outwards
      for (let s = 0; s < 12; s++) {
        const sAng = (s / 12) * Math.PI * 2;
        state.bullets.push({
          id: Math.random().toString(),
          x: targetX,
          y: targetY,
          vx: Math.cos(sAng) * 14,
          vy: Math.sin(sAng) * 14,
          damage: 90,
          pierceLeft: 2,
          rangeLeft: 200,
          radius: 3.5,
          color: '#fbbf24',
          knockback: 4
        });
      }
    }
  };

  const triggerCryoBlast = (x: number, y: number, radius: number, damage: number) => {
    const state = stateRef.current;
    soundManager.playDronePlasma();
    state.screenShake = 16;

    // Cyan frost decal
    state.decals.push({
      x,
      y,
      radius: radius * 0.75,
      color: '#0284c7',
      alpha: 0.85,
      type: 'crater'
    });

    // Cyan Ice shards particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#38bdf8' : '#e0f2fe',
        alpha: 1,
        life: 0,
        maxLife: 35 + Math.random() * 20,
        decay: 0.025,
        shape: 'spark'
      });
    }

    let frozenCount = 0;
    state.zombies.forEach(z => {
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= radius) {
        z.hp -= damage;
        z.frozenTimer = 5000;
        z.speed = Math.max(0.4, z.baseSpeed * 0.2);
        z.hitFlashTimer = 100;
        frozenCount++;
        state.floatingTexts.push({
          id: Math.random().toString(),
          x: z.x,
          y: z.y - 12,
          text: `❄️ -${damage} (ĐÓNG BĂNG 5s)`,
          color: '#38bdf8',
          alpha: 1,
          life: 45,
          isCrit: true
        });
      }
    });

    state.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y: y - 30,
      text: '❄️ VỤ NỔ HÀN BĂNG CRYO!',
      color: '#7dd3fc',
      alpha: 1,
      life: 55,
      isCrit: true
    });

    if (frozenCount > 0) {
      window.dispatchEvent(new CustomEvent('achievement-event', { detail: { type: 'freeze', count: frozenCount } }));
    }
  };

  const triggerVortexBlackHole = (x: number, y: number, radius: number, damage: number) => {
    const state = stateRef.current;
    soundManager.playPlasmaShot();
    state.screenShake = 16;

    // Create vortex hazard in bossHazards
    state.bossHazards.push({
      id: Math.random().toString(),
      x,
      y,
      radius,
      timer: 3500,
      maxTimer: 3500,
      damage,
      type: 'acid_pool'
    });

    // Swirling black hole particles
    for (let i = 0; i < 35; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 6;
      state.particles.push({
        x: x + Math.cos(ang) * (radius * 0.8),
        y: y + Math.sin(ang) * (radius * 0.8),
        vx: -Math.cos(ang) * spd,
        vy: -Math.sin(ang) * spd,
        radius: 3.5,
        color: Math.random() > 0.5 ? '#c084fc' : '#3b82f6',
        alpha: 1,
        life: 0,
        maxLife: 40,
        decay: 0.025,
        shape: 'spark'
      });
    }

    // Pull all nearby zombies violently into the singularity!
    let sucked = 0;
    state.zombies.forEach(z => {
      const dist = Math.hypot(z.x - x, z.y - y);
      if (dist <= radius) {
        const pullAngle = Math.atan2(y - z.y, x - z.x);
        z.x += Math.cos(pullAngle) * 90;
        z.y += Math.sin(pullAngle) * 90;
        z.hp -= Math.round(damage * 0.6);
        z.hitFlashTimer = 80;
        sucked++;
      }
    });

    state.floatingTexts.push({
      id: Math.random().toString(),
      x,
      y: y - 35,
      text: '🌀 LỖ ĐEN VORTEX! HÚT TOÀN BỘ BẦY ĐÀN!',
      color: '#c084fc',
      alpha: 1,
      life: 60,
      isCrit: true
    });

    window.dispatchEvent(new CustomEvent('achievement-event', { detail: { type: 'vortex', count: sucked } }));
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

    // Initialize 3D Three.js WebGL Engine
    if (threeCanvasRef.current && !threeRendererRef.current) {
      try {
        const r3 = new ThreeRenderer(threeCanvasRef.current);
        threeRendererRef.current = r3;
        r3.syncObstacles(stateRef.current.obstacles);
      } catch (err) {
        console.error("Three.js initialization error:", err);
      }
    }

    let animationId: number;

    const resizeCanvas = () => {
      const targetW = Math.max(300, Math.floor(canvas.parentElement?.clientWidth || window.innerWidth || 390));
      const targetH = Math.max(300, Math.floor(canvas.parentElement?.clientHeight || window.innerHeight || 844));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      if (threeRendererRef.current) {
        threeRendererRef.current.resize(targetW, targetH);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    const ro = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let lastShotTime = 0;
    let lastStateSync = 0;
    let lastRadarSync = 0;

    const loop = (currentTime: number) => {
      animationId = requestAnimationFrame(loop);

      try {
        const state = stateRef.current;
        const rawDt = Math.min(100, currentTime - state.lastTime);
        state.lastTime = currentTime;

        let dt = rawDt;
        if (state.slowMoTimer > 0) {
          state.slowMoTimer -= rawDt;
          dt = rawDt * 0.28; // Cinematic Boss Knockout Slow-Motion!
        }

        if (isPausedRef.current || isShopOpenRef.current) return;

      const p = state.player;
      const wep = state.currentWeapon;

      // Periodic Radar Map Sync
      if (currentTime - lastRadarSync > 90) {
        lastRadarSync = currentTime;
        if (onRadarUpdateRef.current) {
          onRadarUpdateRef.current(state.zombies, state.drops);
        }
      }

      // Realtime periodic synchronization of Gold, Score, HP, Armor, Grenades, Ultimate back to React App State
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
            prev.grenadeCount !== p.grenadeCount ||
            Math.floor(prev.ultimateCharge || 0) !== Math.floor(p.ultimateCharge || 0) ||
            prev.isUltimateActive !== p.isUltimateActive
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
              grenadeCount: p.grenadeCount,
              ultimateCharge: p.ultimateCharge || 0,
              isUltimateActive: p.isUltimateActive
            };
          }
          return prev;
        });
      }

      // Passive ultimate trickle charge
      p.ultimateCharge = Math.min(100, (p.ultimateCharge || 0) + (dt / 1000) * 0.5);

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
          const is3D = viewModeRef.current !== '2d';
          if (is3D && threeRendererRef.current) {
            const hit = threeRendererRef.current.getGroundIntersection(state.mousePos.x, state.mousePos.y);
            if (hit) {
              p.angle = Math.atan2(hit.y - p.y, hit.x - p.x);
            } else {
              const screenCenterX = canvas.width / 2;
              const screenCenterY = canvas.height / 2;
              p.angle = Math.atan2(state.mousePos.y - screenCenterY, state.mousePos.x - screenCenterX);
            }
          } else {
            const screenCenterX = canvas.width / 2;
            const screenCenterY = canvas.height / 2;
            p.angle = Math.atan2(state.mousePos.y - screenCenterY, state.mousePos.x - screenCenterX);
          }
        }
      }

      // 3. WEAPON SHOOTING
      const isAutoFiring = Boolean(autoAim && closestZombie && !state.isReloading);
      const isFiring = state.isMouseDown || touchAim.isShooting || isAutoFiring;
      if (isFiring && !state.isReloading) {
        const fireRateMultiplier = (p.roguelikeSkills?.adrenaline_rush || 0) > 0 ? 0.72 : 1.0;
        if (currentTime - lastShotTime >= wep.fireRate * fireRateMultiplier) {
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

            // Realistic Brass Shell Casing Ejection (Authentic gunplay polish)
            const shellSide = p.angle - Math.PI / 2 + (Math.random() - 0.5) * 0.45;
            const shellSpeed = 2.4 + Math.random() * 2.2;
            state.particles.push({
              x: p.x + Math.cos(p.angle) * 8,
              y: p.y + Math.sin(p.angle) * 8,
              vx: Math.cos(shellSide) * shellSpeed - Math.cos(p.angle) * 0.4,
              vy: Math.sin(shellSide) * shellSpeed - Math.sin(p.angle) * 0.4,
              radius: 3,
              color: '#f59e0b',
              alpha: 1,
              life: 0,
              maxLife: 140,
              decay: 0.007,
              shape: 'shell',
              angle: Math.random() * Math.PI * 2,
              vAngle: (Math.random() - 0.5) * 0.35
            });

            // Muzzle Smoke Puff
            if (Math.random() < 0.6) {
              state.particles.push({
                x: muzzleX,
                y: muzzleY,
                vx: Math.cos(p.angle) * 1.2 + (Math.random() - 0.5) * 0.6,
                vy: Math.sin(p.angle) * 1.2 + (Math.random() - 0.5) * 0.6,
                radius: 4,
                color: 'rgba(215, 220, 225, 0.4)',
                alpha: 0.5,
                life: 0,
                maxLife: 18,
                decay: 0.025,
                shape: 'smoke'
              });
            }

            // Bullet pellets
            for (let i = 0; i < wep.bulletCount; i++) {
              const spreadAngle = (Math.random() - 0.5) * wep.spread;
              const finalAngle = p.angle + spreadAngle;
              const vx = Math.cos(finalAngle) * wep.bulletSpeed;
              const vy = Math.sin(finalAngle) * wep.bulletSpeed;

              const isEvo = wep.isEvolved;
              const isFreezeBullet = isEvo && wep.id === 'shotgun';
              const isLightningBullet = isEvo && wep.id === 'minigun';
              const isNapalm = isEvo && wep.id === 'flamethrower';
              const isHealBullet = isEvo && wep.id === 'sniper';
              const isCyberRebound = isEvo && wep.id === 'ak47';
              const isApocalypseRpg = isEvo && wep.id === 'rpg';
              const isQuantumNova = isEvo && wep.id === 'plasma';
              const isExorcistMagnum = isEvo && wep.id === 'pistol';

              state.bullets.push({
                id: Math.random().toString(),
                x: muzzleX,
                y: muzzleY,
                vx,
                vy,
                damage: finalDmg,
                pierceLeft: isHealBullet ? 99 : isCyberRebound ? 3 : wep.pierce,
                rangeLeft: wep.bulletRange * (isCyberRebound ? 1.4 : 1),
                radius: wep.id === 'rpg' || isApocalypseRpg ? 8 : wep.id === 'sniper' ? 5.5 : isQuantumNova ? 7 : 3.5,
                color: wep.bulletColor,
                isExplosive: wep.id === 'rpg' || isApocalypseRpg,
                isPlasma: wep.id === 'plasma' || isQuantumNova,
                isFreezeBullet,
                isLightningBullet,
                isNapalm,
                isHealBullet,
                isCrit: isExorcistMagnum || (Math.random() * 100 < ((p.upgrades.critChanceLevel || 0) * 8 + 10)),
                splitOnDeath: isApocalypseRpg,
                splitCount: 5,
                ricochetLeft: isCyberRebound ? 3 : 0,
                knockback: wep.knockback * (isEvo ? 1.35 : 1)
              });
            }

            // Roguelike Skill: Twin Shot (Bonus parallel bullet)
            if ((p.roguelikeSkills?.twin_shot || 0) > 0) {
              const perpAngle = p.angle + Math.PI / 2;
              const offDist = 12;
              state.bullets.push({
                id: Math.random().toString(),
                x: muzzleX + Math.cos(perpAngle) * offDist,
                y: muzzleY + Math.sin(perpAngle) * offDist,
                vx: Math.cos(p.angle) * wep.bulletSpeed,
                vy: Math.sin(p.angle) * wep.bulletSpeed,
                damage: Math.round(finalDmg * 0.85),
                pierceLeft: wep.pierce,
                rangeLeft: wep.bulletRange,
                radius: 4,
                color: '#facc15',
                isPlasma: true,
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

      // 5. UPDATE TURRETS & ELECTRIC TRAPS
      state.turrets.forEach(turret => {
        turret.duration -= dt;
        turret.pulseTimer = (turret.pulseTimer || 0) + dt;

        if (turret.type === 'electric_trap') {
          // Electric Trap pulses every 550ms
          const trapRadius = turret.slowRadius || turret.range || 220;
          if (turret.pulseTimer > 550) {
            turret.pulseTimer = 0;
            let hitZombies = 0;

            state.zombies.forEach(z => {
              if (z.hp <= 0) return;
              const d = Math.hypot(z.x - turret.x, z.y - turret.y);
              if (d <= trapRadius) {
                hitZombies++;
                z.hp -= 70;
                z.speed = Math.min(z.speed, 0.7); // 65% slow
                z.hitFlashTimer = 80;

                // Electric laser zap from trap to zombie
                state.laserBeams.push({
                  x1: turret.x,
                  y1: turret.y,
                  x2: z.x,
                  y2: z.y,
                  color: '#38bdf8',
                  alpha: 1
                });

                for (let sp = 0; sp < 2; sp++) {
                  state.particles.push({
                    x: z.x,
                    y: z.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    radius: 2.5,
                    color: '#38bdf8',
                    alpha: 1,
                    life: 0,
                    maxLife: 12,
                    decay: 0.08,
                    shape: 'spark'
                  });
                }
              }
            });

            if (hitZombies > 0) {
              soundManager.playPlasmaShot();
            }
          }
        } else {
          // Sentry Turret autonomous targeting
          let nearestZombie: Zombie | null = null;
          let nearestDist = turret.range || 480;

          state.zombies.forEach(z => {
            if (z.hp <= 0) return;
            const d = Math.hypot(z.x - turret.x, z.y - turret.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearestZombie = z;
            }
          });

          if (nearestZombie) {
            const targetAngle = Math.atan2((nearestZombie as Zombie).y - turret.y, (nearestZombie as Zombie).x - turret.x);
            turret.angle = targetAngle;

            if (currentTime - turret.lastShotTime > 150) {
              turret.lastShotTime = currentTime;
              soundManager.playShoot('rifle');

              // Twin rapid heavy armor piercing bullets
              [-4, 4].forEach(offset => {
                const perp = targetAngle + Math.PI / 2;
                const bx = turret.x + Math.cos(targetAngle) * 22 + Math.cos(perp) * offset;
                const by = turret.y + Math.sin(targetAngle) * 22 + Math.sin(perp) * offset;

                state.bullets.push({
                  id: Math.random().toString(),
                  x: bx,
                  y: by,
                  vx: Math.cos(targetAngle) * 17,
                  vy: Math.sin(targetAngle) * 17,
                  damage: 38,
                  pierceLeft: 1,
                  rangeLeft: turret.range,
                  radius: 3.5,
                  color: '#c084fc',
                  knockback: 3
                });
              });
            }
          }
        }
      });
      state.turrets = state.turrets.filter(t => t.duration > 0 && (t.hp === undefined || t.hp > 0));

      // 5.5 UPDATE COMPANION DRONES (Follow formation + autonomous combat AI)
      const unlockedConfigs = (dronesRef.current || []).filter(d => d.unlocked);
      
      // Auto-sync active drones array in game loop if configs changed
      if (unlockedConfigs.length !== state.activeDrones.length || unlockedConfigs.some(cfg => !state.activeDrones.some(a => a.id === cfg.id))) {
        state.activeDrones = unlockedConfigs.map((cfg, idx) => {
          const existing = state.activeDrones.find(a => a.id === cfg.id);
          if (existing) return existing;
          const ang = (idx / Math.max(1, unlockedConfigs.length)) * Math.PI * 2;
          return {
            id: cfg.id,
            type: cfg.type,
            x: p.x + Math.cos(ang) * 55,
            y: p.y + Math.sin(ang) * 55,
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
      }

      const activeDrones = state.activeDrones;
      const droneCount = activeDrones.length;

      activeDrones.forEach((drone, idx) => {
        const config = unlockedConfigs.find(c => c.id === drone.id);
        if (!config) return;

        // Formation offset around player based on count and index
        let formationAngle = p.angle;
        const formationDist = 56;
        if (droneCount === 1) {
          formationAngle += Math.PI * 0.75;
        } else if (droneCount === 2) {
          formationAngle += idx === 0 ? -Math.PI * 0.65 : Math.PI * 0.65;
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

        // Hover bobbing offset to feel floating
        const bobX = Math.cos(currentTime * 0.004 + (drone.hoverOffset || 0)) * 5;
        const bobY = Math.sin(currentTime * 0.005 + (drone.hoverOffset || 0)) * 6;

        const targetX = p.x + Math.cos(formationAngle) * formationDist + bobX;
        const targetY = p.y + Math.sin(formationAngle) * formationDist + bobY;

        // Smooth spring physics follower with high agility
        const dx = targetX - drone.x;
        const dy = targetY - drone.y;
        const distToTarget = Math.hypot(dx, dy);

        if (distToTarget > 350) {
          // If warrior dashed or spawned far, catch up instantly
          drone.x = targetX;
          drone.y = targetY;
          drone.vx = 0;
          drone.vy = 0;
        } else {
          drone.vx = drone.vx * 0.82 + dx * 0.12;
          drone.vy = drone.vy * 0.82 + dy * 0.12;
          drone.x += drone.vx;
          drone.y += drone.vy;
        }

        // Banking tilt when accelerating
        drone.tilt = Math.max(-0.45, Math.min(0.45, drone.vx * 0.06));
        drone.angle = Math.atan2(drone.vy, drone.vx || 0.1);

        // Gold Magnet Scout ability (for Laser Aegis drone pulling dropped loot)
        if (config.type === 'laser') {
          state.drops.forEach(item => {
            const dropDist = Math.hypot(drone.x - item.x, drone.y - item.y);
            if (dropDist < 240) {
              const pullAngle = Math.atan2(p.y - item.y, p.x - item.x);
              item.x += Math.cos(pullAngle) * 6.5;
              item.y += Math.sin(pullAngle) * 6.5;
            }
          });
        }

        // Autonomous Target Acquisition (Support Fire targeting closest threat or focused Boss)
        let bestTarget: Zombie | null = null;
        let bestDist = config.range + (config.level - 1) * 30;

        if (activeTargetedBoss && Math.hypot(activeTargetedBoss.x - drone.x, activeTargetedBoss.y - drone.y) <= bestDist + 80) {
          // If player explicitly locked onto Boss, drones focus fire on Boss
          bestTarget = activeTargetedBoss;
        } else {
          // Find closest living enemy in range to protect player
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

          const actualFireRate = Math.max(85, config.fireRate - (config.level - 1) * 20);
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

      // Update Orbital Strikes (Commando Ultimate Skill)
      for (let os = state.orbitalStrikes.length - 1; os >= 0; os--) {
        const strike = state.orbitalStrikes[os];
        strike.delay -= dt;
        if (strike.delay <= 0) {
          state.screenShake = 16;
          soundManager.playExplosion();
          triggerExplosion(strike.x, strike.y, 220, 480);
          state.decals.push({
            x: strike.x,
            y: strike.y,
            radius: 120,
            color: '#7f1d1d',
            alpha: 0.8,
            type: 'crater'
          });
          state.orbitalStrikes.splice(os, 1);
        }
      }

      // Update Titan EMP Pulses (Cyber Titan Ultimate Skill)
      for (let ep = state.titanEmpPulses.length - 1; ep >= 0; ep--) {
        const pulse = state.titanEmpPulses[ep];
        pulse.delay -= dt;
        if (pulse.delay <= 0) {
          state.screenShake = 16;
          soundManager.playPlasmaShot();
          triggerExplosion(p.x, p.y, 280, 360);
          state.decals.push({
            x: p.x,
            y: p.y,
            radius: 200,
            color: '#fbbf24',
            alpha: 0.8,
            type: 'crater'
          });
          state.titanEmpPulses.splice(ep, 1);
        }
      }

      // Update Environmental Wave Hazards
      if (state.waveHazard) {
        if (state.waveHazard.bannerTimer > 0) {
          state.waveHazard.bannerTimer -= 1;
        }

        // Spawn ambient atmospheric weather particles for the hazard
        if (Math.random() < 0.45) {
          const cam = state.camera;
          const pColor = state.waveHazard.id === 'lightning_storm' ? '#38bdf8' : state.waveHazard.id === 'meteor_fire' ? '#fb923c' : state.waveHazard.id === 'bio_rain' ? '#34d399' : '#f43f5e';
          state.particles.push({
            x: cam.x + (Math.random() - 0.5) * canvas.width * 1.3,
            y: cam.y - canvas.height * 0.7,
            vx: (Math.random() - 0.5) * 3 + (state.waveHazard.id === 'sandstorm' ? 5 : 0),
            vy: 2.5 + Math.random() * 4,
            radius: 1.2 + Math.random() * 2,
            color: pColor,
            alpha: 0.75,
            life: 0,
            maxLife: 90,
            decay: 0.012,
            shape: state.waveHazard.id === 'meteor_fire' ? 'spark' : 'smoke'
          });
        }

        // Trigger dynamic tactical hazard strikes
        if (currentTime >= state.waveHazard.nextEventTime) {
          state.waveHazard.nextEventTime = currentTime + 3500 + Math.random() * 3200;

          const candidates = state.zombies.filter(z => Math.hypot(z.x - p.x, z.y - p.y) < 650);
          const targetX = candidates.length > 0
            ? candidates[Math.floor(Math.random() * candidates.length)].x + (Math.random() - 0.5) * 40
            : p.x + (Math.random() - 0.5) * 420;
          const targetY = candidates.length > 0
            ? candidates[Math.floor(Math.random() * candidates.length)].y + (Math.random() - 0.5) * 40
            : p.y + (Math.random() - 0.5) * 420;

          if (state.waveHazard.id === 'lightning_storm') {
            state.hazardStrikes.push({
              id: Math.random().toString(),
              x: targetX,
              y: targetY,
              radius: 115,
              timer: 750,
              maxTimer: 750,
              type: 'lightning',
              damage: 280
            });
          } else if (state.waveHazard.id === 'meteor_fire') {
            state.hazardStrikes.push({
              id: Math.random().toString(),
              x: targetX,
              y: targetY,
              radius: 135,
              timer: 950,
              maxTimer: 950,
              type: 'meteor',
              damage: 350
            });
          } else {
            state.hazardStrikes.push({
              id: Math.random().toString(),
              x: targetX,
              y: targetY,
              radius: 95,
              timer: 650,
              maxTimer: 650,
              type: 'spore',
              damage: 210
            });
          }
        }
      }

      // Update Environmental Hazard Strikes
      for (let hs = state.hazardStrikes.length - 1; hs >= 0; hs--) {
        const strike = state.hazardStrikes[hs];
        strike.timer -= dt;
        if (strike.timer <= 0) {
          if (strike.type === 'lightning') {
            state.lightningFlashAlpha = 0.55;
            state.screenShake = 16;
            soundManager.playPlasmaShot();
            triggerExplosion(strike.x, strike.y, strike.radius, strike.damage);
            state.decals.push({
              x: strike.x,
              y: strike.y,
              radius: strike.radius * 0.9,
              color: '#0284c7',
              alpha: 0.7,
              type: 'crater'
            });
          } else if (strike.type === 'meteor') {
            state.screenShake = 18;
            soundManager.playExplosion();
            triggerExplosion(strike.x, strike.y, strike.radius, strike.damage);
            state.decals.push({
              x: strike.x,
              y: strike.y,
              radius: strike.radius * 0.95,
              color: '#7c2d12',
              alpha: 0.85,
              type: 'crater'
            });
          } else {
            soundManager.playExplosion();
            triggerExplosion(strike.x, strike.y, strike.radius, strike.damage);
            state.decals.push({
              x: strike.x,
              y: strike.y,
              radius: strike.radius * 0.85,
              color: '#064e3b',
              alpha: 0.75,
              type: 'blood'
            });
          }
          state.hazardStrikes.splice(hs, 1);
        }
      }

      // ==========================================
      // DYNAMIC ARENA EVENTS ENGINE (Sự kiện chiến trường ngẫu nhiên)
      // ==========================================
      state.dynamicEventTimer -= dt;
      if (state.dynamicEventTimer <= 0) {
        state.dynamicEventTimer = 42000 + Math.random() * 15000; // Next event in 42-57s
        const eventTypes: DynamicArenaEventType[] = ['airdrop', 'blackout', 'swarm_alert'];
        const chosenType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        if (chosenType === 'airdrop') {
          soundManager.playAirdrop();
          state.currentArenaEvent = {
            type: 'airdrop',
            titleVi: 'TIẾP TẾ HÀNG KHÔNG!',
            descVi: 'Thùng cứu trợ vũ khí & đạn dược vừa được thả dù xuống gần bạn!',
            timer: 15000,
            color: '#38bdf8'
          };
          // Drop airdrop crate nearby
          const dropX = Math.max(100, Math.min(MAP_SIZE.width - 100, p.x + (Math.random() - 0.5) * 350));
          const dropY = Math.max(100, Math.min(MAP_SIZE.height - 100, p.y + (Math.random() - 0.5) * 350));
          state.drops.push({
            id: Math.random().toString(),
            x: dropX,
            y: dropY,
            type: 'airdrop_crate',
            value: 500,
            radius: 20,
            pulse: 0,
            createdAt: currentTime,
            bounceZ: 60,
            vz: 1.5
          });
          // Parachute flare particles
          for (let f = 0; f < 20; f++) {
            state.particles.push({
              x: dropX + (Math.random() - 0.5) * 40,
              y: dropY + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 2,
              vy: -1 - Math.random() * 2,
              radius: 4,
              color: '#38bdf8',
              alpha: 0.9,
              life: 0,
              maxLife: 60,
              decay: 0.016,
              shape: 'smoke'
            });
          }
        } else if (chosenType === 'blackout') {
          soundManager.playThunder();
          state.currentArenaEvent = {
            type: 'blackout',
            titleVi: 'MẤT ĐIỆN TOÀN KHU VỰC!',
            descVi: 'Toàn bộ lưới điện tê liệt! Tầm nhìn thu hẹp về phạm vi đèn pin!',
            timer: 18000,
            color: '#f59e0b'
          };
          state.screenShake = 14;
        } else if (chosenType === 'swarm_alert') {
          soundManager.playSiren();
          state.currentArenaEvent = {
            type: 'swarm_alert',
            titleVi: 'BÁO ĐỘNG ĐỎ: ĐÀN ZOMBIE ĐỘT KÍCH!',
            descVi: 'Còi báo động vang rền! Một bầy zombie hung tợn đang tràn vào!',
            timer: 16000,
            color: '#ef4444'
          };
          // Spawn extra aggressive runner zombies
          for (let s = 0; s < 7; s++) {
            const spawnAngle = Math.random() * Math.PI * 2;
            const spawnDist = 450 + Math.random() * 150;
            const sx = Math.max(50, Math.min(MAP_SIZE.width - 50, p.x + Math.cos(spawnAngle) * spawnDist));
            const sy = Math.max(50, Math.min(MAP_SIZE.height - 50, p.y + Math.sin(spawnAngle) * spawnDist));
            const tmpl = ZOMBIE_TEMPLATES.runner;
            state.zombies.push({
              id: Math.random().toString(),
              x: sx,
              y: sy,
              type: 'runner',
              hp: tmpl.hp,
              maxHp: tmpl.hp,
              speed: tmpl.speed * 1.15,
              baseSpeed: tmpl.speed * 1.15,
              damage: tmpl.damage,
              radius: tmpl.radius,
              color: tmpl.color,
              scoreValue: tmpl.score,
              goldValue: tmpl.gold,
              angle: 0,
              animationFrame: Math.random() * 10,
              frozenTimer: 0,
              burnTimer: 0,
              poisonTimer: 0,
              attackCooldown: 0
            });
          }
        }

        if (onArenaEventChangeRef.current) {
          onArenaEventChangeRef.current(state.currentArenaEvent);
        }
      }

      // Update active Arena Event countdown
      if (state.currentArenaEvent) {
        state.currentArenaEvent.timer -= dt;
        if (state.currentArenaEvent.timer <= 0) {
          state.currentArenaEvent = null;
          if (onArenaEventChangeRef.current) {
            onArenaEventChangeRef.current(null);
          }
        }
      }

      // ==========================================
      // ENVIRONMENTAL HAZARD ZONES (Khu vực nguy hiểm môi trường)
      // ==========================================
      state.environmentalZones.forEach(zone => {
        zone.pulseTimer = (zone.pulseTimer || 0) + dt;
        
        // Damage zombies walking into toxic pool or electric leak
        state.zombies.forEach(z => {
          if (z.hp <= 0) return;
          const dist = Math.hypot(z.x - zone.x, z.y - zone.y);
          if (dist < zone.radius + z.radius) {
            z.hp -= (zone.damage * dt) / 1000;
            z.hitFlashTimer = 60;
            if (zone.type === 'toxic_pool') {
              z.speed = Math.max(0.6, z.speed * 0.96); // Slow in slime
            }
          }
        });

        // Damage player if walking carelessly into the hazard
        const distToPlayer = Math.hypot(p.x - zone.x, p.y - zone.y);
        if (distToPlayer < zone.radius + p.radius && p.invincibleTimer <= 0) {
          p.hp = Math.max(1, p.hp - (zone.damage * dt * 0.4) / 1000);
          if (Math.random() < 0.1) {
            soundManager.playPlayerHurt();
          }
        }
      });

      // ==========================================
      // ROGUELIKE SKILLS PASSIVES & TIMERS
      // ==========================================
      // 1. Chain Lightning Skill
      if ((p.roguelikeSkills?.chain_lightning || 0) > 0) {
        state.chainLightningTimer -= dt;
        if (state.chainLightningTimer <= 0) {
          state.chainLightningTimer = 3200;
          // Find up to 4 alive zombies within 380px of player
          const nearbyZombies = state.zombies
            .filter(z => z.hp > 0 && Math.hypot(z.x - p.x, z.y - p.y) < 400)
            .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))
            .slice(0, 4);

          if (nearbyZombies.length > 0) {
            soundManager.playThunder();
            let prevX = p.x;
            let prevY = p.y;
            nearbyZombies.forEach(z => {
              state.laserBeams.push({
                x1: prevX,
                y1: prevY,
                x2: z.x,
                y2: z.y,
                color: '#38bdf8',
                alpha: 1.2
              });
              z.hp -= 130;
              z.hitFlashTimer = 120;
              state.floatingTexts.push({
                id: Math.random().toString(),
                x: z.x,
                y: z.y - 20,
                text: '⚡ 130 SÉT ĐÁNH!',
                color: '#38bdf8',
                alpha: 1,
                life: 35,
                isCrit: true
              });
              prevX = z.x;
              prevY = z.y;
            });
          }
        }
      }

      // 2. Frost Aura & Fire Aura
      if ((p.roguelikeSkills?.frost_aura || 0) > 0 || (p.roguelikeSkills?.fire_aura || 0) > 0) {
        const frostLvl = p.roguelikeSkills?.frost_aura || 0;
        const fireLvl = p.roguelikeSkills?.fire_aura || 0;

        state.zombies.forEach(z => {
          if (z.hp <= 0) return;
          const dist = Math.hypot(z.x - p.x, z.y - p.y);
          if (frostLvl > 0 && dist < 190) {
            z.speed = Math.min(z.speed, 1.2); // Chill slowdown
          }
          if (fireLvl > 0 && dist < 170) {
            z.hp -= (45 * dt) / 1000;
            z.hitFlashTimer = 40;
            if (Math.random() < 0.15) {
              state.particles.push({
                x: z.x + (Math.random() - 0.5) * 12,
                y: z.y + (Math.random() - 0.5) * 12,
                vx: (Math.random() - 0.5) * 2,
                vy: -1.5 - Math.random() * 2,
                radius: 3,
                color: '#f97316',
                alpha: 0.9,
                life: 0,
                maxLife: 20,
                decay: 0.05,
                shape: 'spark'
              });
            }
          }
        });
      }

      // Decay Lightning Flash
      if (state.lightningFlashAlpha > 0) {
        state.lightningFlashAlpha = Math.max(0, state.lightningFlashAlpha - dt * 0.0032);
      }

      // Update Ultimate Duration Timer
      if (p.isUltimateActive && p.ultimateTimer) {
        p.ultimateTimer -= dt;
        if (p.ultimateTimer <= 0) {
          p.isUltimateActive = false;
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
                if (obs.isExplosive && obs.hp <= 0 && !obs.exploded) {
                  obs.exploded = true;
                  const blastRad = obs.type === 'vehicle' ? 270 : 220;
                  const blastDmg = obs.type === 'vehicle' ? 500 : 420;
                  soundManager.playBarrelExplode();
                  state.screenShake = 22;
                  triggerExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, blastRad, blastDmg);
                  // Spawn barrel metal debris & fire smoke
                  for (let db = 0; db < 12; db++) {
                    const dbAngle = Math.random() * Math.PI * 2;
                    const dbSpeed = 3 + Math.random() * 6;
                    state.particles.push({
                      x: obs.x + obs.width / 2,
                      y: obs.y + obs.height / 2,
                      vx: Math.cos(dbAngle) * dbSpeed,
                      vy: Math.sin(dbAngle) * dbSpeed,
                      radius: 3.5,
                      color: db % 2 === 0 ? '#ef4444' : '#1c1917',
                      alpha: 1,
                      life: 0,
                      maxLife: 30,
                      decay: 0.033,
                      shape: 'gib',
                      angle: Math.random() * Math.PI * 2,
                      vAngle: (Math.random() - 0.5) * 0.3
                    });
                  }
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

              // Critical hit calculation (100% crit if Ghost Chrono Matrix active)
              const critChance = (p.upgrades.critChanceLevel || 0) * 0.06;
              const isCrit = (p.isUltimateActive && p.warriorSkin === 'ghost') ? true : (Math.random() < critChance);
              let rawDmg = isCrit ? Math.round(b.damage * 2.5) : b.damage;

              // Ultimate Charge accumulation on bullet hit
              const prevCharge = p.ultimateCharge || 0;
              const chargeGain = z.isBoss ? 1.6 : 0.8;
              p.ultimateCharge = Math.min(100, (p.ultimateCharge || 0) + chargeGain);
              if (prevCharge < 100 && p.ultimateCharge >= 100) {
                soundManager.playUltimateReady();
                state.floatingTexts.push({
                  id: Math.random().toString(),
                  x: p.x,
                  y: p.y - 45,
                  text: '⚡ TUYỆT KỸ SẴN SÀNG! [F/U]',
                  color: '#fbbf24',
                  alpha: 1,
                  life: 60,
                  isCrit: true
                });
              }

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
              z.hitFlashTimer = 110; // Combat Juice: Instant visual white/red hit flash
              b.pierceLeft -= 1;

              // Knockback (Bosses barely flinch - 0.05x knockback, regular minions punchy 1.4x knockback)
              const knockAngle = Math.atan2(b.vy, b.vx);
              const knockMult = z.isBoss ? 0.05 : 1.4;
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

              // Roguelike Skill: Ricochet
              if ((p.roguelikeSkills?.ricochet || 0) > 0 && !b.isRicochet) {
                const bounceTarget = state.zombies.find(other => other.id !== z.id && other.hp > 0 && Math.hypot(other.x - z.x, other.y - z.y) < 280);
                if (bounceTarget) {
                  const bAngle = Math.atan2(bounceTarget.y - z.y, bounceTarget.x - z.x);
                  state.bullets.push({
                    id: Math.random().toString(),
                    x: z.x,
                    y: z.y,
                    vx: Math.cos(bAngle) * 15,
                    vy: Math.sin(bAngle) * 15,
                    damage: Math.round(finalDmg * 0.75),
                    pierceLeft: 1,
                    rangeLeft: 300,
                    radius: 4,
                    color: '#38bdf8',
                    knockback: 3,
                    isRicochet: true
                  });
                }
              }

              // Evolved Bullet: Blizzard Freeze
              if (b.isFreezeBullet) {
                z.frozenTimer = 3500;
                z.speed = Math.max(0.4, z.baseSpeed * 0.25);
                window.dispatchEvent(new CustomEvent('achievement-event', { detail: { type: 'freeze', count: 1 } }));
              }

              // Evolved Bullet: Storm Minigun Chain Lightning
              if (b.isLightningBullet) {
                const chainTargets = state.zombies
                  .filter(other => other.id !== z.id && other.hp > 0 && Math.hypot(other.x - z.x, other.y - z.y) < 240)
                  .slice(0, 2);
                chainTargets.forEach(ct => {
                  ct.hp -= Math.round(finalDmg * 0.65);
                  ct.hitFlashTimer = 70;
                  state.laserBeams.push({
                    x1: z.x,
                    y1: z.y,
                    x2: ct.x,
                    y2: ct.y,
                    color: '#c084fc',
                    alpha: 1
                  });
                });
              }

              // Evolved Bullet: Napalm Hellfire
              if (b.isNapalm) {
                z.burnTimer = 4500;
                triggerExplosion(b.x, b.y, 90, Math.round(finalDmg * 0.45));
              }

              // Evolved Bullet: Bloodhunter Sniper Vampiric Leech
              if (b.isHealBullet) {
                p.hp = Math.min(p.maxHp, p.hp + 6);
                setPlayer(prev => ({ ...prev, hp: p.hp }));
              }

              // Evolved Bullet: Cyber Rebound Ricochet
              if (b.ricochetLeft && b.ricochetLeft > 0) {
                b.ricochetLeft -= 1;
                const bounceTarget = state.zombies.find(other => other.id !== z.id && other.hp > 0 && Math.hypot(other.x - z.x, other.y - z.y) < 320);
                if (bounceTarget) {
                  const bAngle = Math.atan2(bounceTarget.y - z.y, bounceTarget.x - z.x);
                  b.vx = Math.cos(bAngle) * 18;
                  b.vy = Math.sin(bAngle) * 18;
                  b.damage = Math.round(b.damage * 0.85);
                }
              }

              // Roguelike Skill: Explosive Rounds (35% chance to detonate upon bullet impact)
              if ((p.roguelikeSkills?.explosive_rounds || 0) > 0 && !b.isExplosive && Math.random() < 0.35) {
                triggerExplosion(b.x, b.y, 130, Math.round(finalDmg * 0.85));
              }

              // Explosive bullet (e.g. RPG)
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
          soundManager.playMeatSquish();

          // Combat Juice: Dismemberment & Gore Gibs (Bones, Flesh Chunks, Organic Spatter)
          const gibCount = z.isBoss ? 16 : 8;
          for (let g = 0; g < gibCount; g++) {
            const gAngle = Math.random() * Math.PI * 2;
            const gSpeed = 2.5 + Math.random() * 5.5;
            const shapeType = g % 3 === 0 ? 'bone' : g % 3 === 1 ? 'gib' : 'flesh';
            state.particles.push({
              x: z.x,
              y: z.y,
              vx: Math.cos(gAngle) * gSpeed,
              vy: Math.sin(gAngle) * gSpeed,
              radius: shapeType === 'bone' ? 3.5 : shapeType === 'gib' ? 4.5 : 3,
              color: shapeType === 'bone' ? '#f8fafc' : '#881337',
              alpha: 1,
              life: 0,
              maxLife: 35,
              decay: 0.028,
              shape: shapeType,
              angle: Math.random() * Math.PI * 2,
              vAngle: (Math.random() - 0.5) * 0.25
            });
          }

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

          // Track Bestiary Kills
          try {
            const rawBestiary = localStorage.getItem('zombie_bestiary_kills_v1');
            const killMap = rawBestiary ? JSON.parse(rawBestiary) : {};
            killMap[z.type] = (killMap[z.type] || 0) + 1;
            localStorage.setItem('zombie_bestiary_kills_v1', JSON.stringify(killMap));
          } catch {
            // ignore
          }

          // Dispatch achievement kill event
          window.dispatchEvent(new CustomEvent('achievement-event', {
            detail: {
              type: 'kill',
              zombieType: z.type,
              isBoss: Boolean(z.isBoss),
              isEnraged: Boolean(z.isEnraged)
            }
          }));

          // Roguelike Skill: Vampiric Leech (Heal 12 HP & 6 Armor every 6 kills)
          if ((p.roguelikeSkills?.vampiric_leech || 0) > 0) {
            state.vampiricKillCounter = (state.vampiricKillCounter || 0) + 1;
            if (state.vampiricKillCounter >= 6) {
              state.vampiricKillCounter = 0;
              p.hp = Math.min(p.maxHp, p.hp + 12);
              p.armor = Math.min(p.maxArmor, p.armor + 6);
              state.floatingTexts.push({
                id: Math.random().toString(),
                x: p.x,
                y: p.y - 30,
                text: '🩸 +12 HP HÚT MÁU!',
                color: '#ef4444',
                alpha: 1,
                life: 45,
                isCrit: true
              });
            }
          }

          // Drop Roguelike EXP Gem
          state.drops.push({
            id: Math.random().toString(),
            x: z.x + (Math.random() - 0.5) * 16,
            y: z.y + (Math.random() - 0.5) * 16,
            type: 'exp_gem',
            value: z.isBoss ? 120 : (z.type === 'tank' ? 40 : 18),
            radius: z.isBoss ? 16 : 10,
            pulse: Math.random() * Math.PI * 2,
            createdAt: currentTime,
            bounceZ: 18 + Math.random() * 12,
            vz: 2.5
          });

          // Ultimate charge on kill
          p.ultimateCharge = Math.min(100, (p.ultimateCharge || 0) + (z.isBoss ? 12 : 2.5));

          const goldGain = Math.round(z.goldValue * p.multiplier);
          const scoreGain = Math.round(z.scoreValue * p.multiplier);

          p.score += scoreGain;

          // MANDATORY GOLD DROP: Spawn physical gold that player must run over to collect
          soundManager.playCoinClink();

          if (z.isBoss) {
            // Screen shake and epic celebration on boss death
            state.screenShake = 24;
            state.slowMoTimer = 1800; // Cinematic Slow-Mo Knockout
            state.bossDefeatedBanner = {
              text: '💥 TRÙM ĐÃ BỊ TIÊU DIỆT! 💥',
              subText: 'CƠN MƯA VÀNG, RƯƠNG TRÙM & KIM CƯƠNG RƠI ĐẦY!',
              alpha: 1,
              timer: 140,
              themeColor: '#facc15'
            };
            if (onBossKilledRef.current) {
              onBossKilledRef.current();
            }

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

          const zSpeed = (p.isUltimateActive && p.warriorSkin === 'ghost') ? (z.speed * 0.22) : z.speed;
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

              // Roguelike Skill: Shockwave Armor (Push back all nearby zombies & damage them when taking hit)
              if ((p.roguelikeSkills?.shockwave_armor || 0) > 0) {
                soundManager.playExplosion();
                state.screenShake = 16;
                state.zombies.forEach(other => {
                  const od = Math.hypot(other.x - p.x, other.y - p.y);
                  if (od < 220 && other.hp > 0) {
                    const pAngle = Math.atan2(other.y - p.y, other.x - p.x);
                    other.x += Math.cos(pAngle) * 90;
                    other.y += Math.sin(pAngle) * 90;
                    other.hp -= 95;
                    other.hitFlashTimer = 110;
                  }
                });
                state.floatingTexts.push({
                  id: Math.random().toString(),
                  x: p.x,
                  y: p.y - 30,
                  text: '💥 SÓNG XUNG KÍCH GIÁP!',
                  color: '#6366f1',
                  alpha: 1,
                  life: 45,
                  isCrit: true
                });
              }

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

          // Trail spark particles when flying towards player
          if ((item.type === 'gold_coin' || item.type === 'gold_ingot' || item.type === 'coin_bag' || item.type === 'exp_gem') && Math.random() < 0.35) {
            state.particles.push({
              x: item.x,
              y: item.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              radius: 1.5,
              color: item.type === 'exp_gem' ? '#38bdf8' : '#fef08a',
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
          if (item.type === 'exp_gem') {
            soundManager.playGoldPickup();
            const expGain = item.value || 18;
            p.exp = (p.exp || 0) + expGain;

            // Check Level Up!
            if (p.exp >= p.maxExp) {
              p.exp -= p.maxExp;
              p.level = (p.level || 1) + 1;
              p.maxExp = Math.round(p.maxExp * 1.35);
              soundManager.playLevelUp();
              state.screenShake = 16;
              // Level up celebratory spark burst
              for (let lp = 0; lp < 20; lp++) {
                const la = (lp / 20) * Math.PI * 2;
                state.particles.push({
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(la) * 4.5,
                  vy: Math.sin(la) * 4.5,
                  radius: 3.5,
                  color: '#38bdf8',
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
                y: p.y - 45,
                text: `⭐ LÊN CẤP ${p.level}! CHỌN KỸ NĂNG MỚI!`,
                color: '#38bdf8',
                alpha: 1,
                life: 65,
                isCrit: true
              });

              if (onLevelUpRef.current) {
                onLevelUpRef.current();
              }
            }

            setPlayer(prev => ({
              ...prev,
              level: p.level,
              exp: p.exp,
              maxExp: p.maxExp
            }));

            state.floatingTexts.push({
              id: Math.random().toString(),
              x: p.x + (Math.random() - 0.5) * 20,
              y: p.y - 20,
              text: `+${expGain} EXP`,
              color: '#38bdf8',
              alpha: 1,
              life: 30,
              isCrit: false
            });
          } else if (item.type === 'airdrop_crate') {
            soundManager.playPowerUp();
            p.gold += 350;
            p.grenadeCount = Math.min(6, (p.grenadeCount || 0) + 2);
            p.armor = Math.min(p.maxArmor, p.armor + 35);
            (Object.values(state.weapons) as Weapon[]).forEach(w => {
              if (w.reserveAmmo !== -1) w.reserveAmmo = w.magSize * 4;
            });
            setPlayer(prev => ({
              ...prev,
              gold: p.gold,
              grenadeCount: p.grenadeCount,
              armor: p.armor
            }));
            setWeapons(prev => ({ ...prev }));
            state.floatingTexts.push({
              id: Math.random().toString(),
              x: p.x,
              y: p.y - 35,
              text: '📦 TIẾP TẾ CHIẾN ĐẤU: +350 VÀNG, ĐẠN DƯỢC & +2 LỰU ĐẠN!',
              color: '#38bdf8',
              alpha: 1,
              life: 70,
              isCrit: true
            });
          } else if (item.type === 'gold_coin' || item.type === 'gold_ingot' || item.type === 'coin_bag' || item.type === 'diamond_gem') {
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
      // 11. RENDERING FRAME (3D WEBGL OR 2D CANVAS)
      // ==========================================
      const is3D = viewModeRef.current !== '2d';

      if (is3D && threeRendererRef.current) {
        // Set camera angle mode
        if (viewModeRef.current === '3d-top') {
          threeRendererRef.current.setCameraView('topdown');
        } else if (viewModeRef.current === '3d-action') {
          threeRendererRef.current.setCameraView('action');
        } else {
          threeRendererRef.current.setCameraView('isometric');
        }

        // Render full 3D scene
        threeRendererRef.current.update(
          {
            player: p,
            currentWeapon: wep,
            zombies: state.zombies,
            bullets: state.bullets,
            particles: state.particles,
            drops: state.drops,
            turrets: state.turrets,
            activeDrones: state.activeDrones,
            laserBeams: state.sweepingLasers,
            bossHazards: state.bossHazards,
            activeBuffs: state.activeBuffs,
            currentMapId: state.currentMapId || 'rooftop',
            screenShake: state.screenShake
          },
          currentTime,
          isFiring && (currentTime - lastShotTime < 75)
        );

        // 2D Overlay Canvas (Transparent UI, floating damage numbers, target brackets)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Projected Zombie HP Bars and Target Lock
        state.zombies.forEach(z => {
          if (z.hp <= 0) return;
          const pos = threeRendererRef.current?.projectToScreen(z.x, z.y, z.isBoss ? 45 : 22);
          if (!pos || pos.x < -60 || pos.x > canvas.width + 60 || pos.y < -60 || pos.y > canvas.height + 60) return;

          // HP Bar
          if (z.hp < z.maxHp) {
            const barW = Math.max(30, (z.radius || 18) * 1.8);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.fillRect(pos.x - barW / 2 - 1, pos.y - 14, barW + 2, 5);
            ctx.fillStyle = '#450a0a';
            ctx.fillRect(pos.x - barW / 2, pos.y - 13, barW, 3);
            ctx.fillStyle = z.isBoss ? '#f59e0b' : '#ef4444';
            ctx.fillRect(pos.x - barW / 2, pos.y - 13, barW * (z.hp / z.maxHp), 3);
          }

          // Target Lock Reticle
          const isTargetedBoss = Boolean(z.isBoss && state.targetedBossId === z.id);
          const isAutoAimTarget = Boolean(state.autoAimTargetId === z.id && autoAimEnabledRef.current);
          if (isTargetedBoss || isAutoAimTarget) {
            ctx.save();
            ctx.strokeStyle = isTargetedBoss ? '#ef4444' : '#10b981';
            ctx.lineWidth = 2;
            ctx.shadowColor = isTargetedBoss ? '#ef4444' : '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, isTargetedBoss ? 28 : 20, 0, Math.PI * 2);
            ctx.stroke();
            if (isTargetedBoss) {
              ctx.font = 'bold 10px monospace';
              ctx.textAlign = 'center';
              ctx.fillStyle = '#ef4444';
              ctx.fillText('🎯 ĐÃ KHÓA BOSS', pos.x, pos.y - 32);
            }
            ctx.restore();
          }
        });

        // Projected Floating Texts (+150 VÀNG, CRIT, etc.)
        state.floatingTexts.forEach(ft => {
          const pos = threeRendererRef.current?.projectToScreen(ft.x, ft.y, 28);
          if (pos) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, ft.alpha));
            ctx.fillStyle = ft.color;
            ctx.font = ft.isCrit ? '900 13px system-ui, sans-serif' : 'bold 11px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = ft.isCrit ? ft.color : '#000000';
            ctx.shadowBlur = ft.isCrit ? 8 : 4;
            ctx.fillText(ft.text, pos.x, pos.y);
            ctx.restore();
          }
        });
      } else {
        // Classic 2D Graphics Engine
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

      // Render Dynamic Environmental Hazard Zones (Toxic Slime Pools & High-Voltage Electric Leaks)
      state.environmentalZones.forEach(zone => {
        ctx.save();
        ctx.translate(zone.x, zone.y);
        const pulse = Math.sin((currentTime * 0.004) + (zone.id === 'toxic_1' ? 0 : 2)) * 0.12;
        const rad = zone.radius * (1 + pulse);

        if (zone.type === 'toxic_pool') {
          // Toxic Slime puddle gradient
          const grad = ctx.createRadialGradient(0, 0, rad * 0.15, 0, 0, rad);
          grad.addColorStop(0, 'rgba(34, 197, 94, 0.65)');
          grad.addColorStop(0.65, 'rgba(21, 128, 61, 0.45)');
          grad.addColorStop(1, 'rgba(22, 101, 52, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Biohazard Symbol
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#86efac';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.fillText('☣', 0, 0);
        } else {
          // Electric Leak puddle gradient
          const grad = ctx.createRadialGradient(0, 0, rad * 0.15, 0, 0, rad);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
          grad.addColorStop(0.65, 'rgba(14, 116, 144, 0.4)');
          grad.addColorStop(1, 'rgba(8, 145, 178, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, rad, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(125, 211, 252, 0.65)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Electric Sparks dancing around
          for (let sp = 0; sp < 4; sp++) {
            const spAng = (currentTime * 0.003) + (sp * Math.PI / 2);
            const spDist = rad * 0.55;
            ctx.fillStyle = '#e0f2fe';
            ctx.beginPath();
            ctx.arc(Math.cos(spAng) * spDist, Math.sin(spAng) * spDist, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Electric Symbol
          ctx.font = 'bold 18px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#7dd3fc';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillText('⚡', 0, 0);
        }
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

        if (pt.shape === 'shell') {
          pt.vx *= 0.94;
          pt.vy *= 0.94;
          if (pt.vAngle && pt.angle !== undefined) pt.angle += pt.vAngle;
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.angle || 0);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-3, -1.5, 6, 3);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-2, -0.7, 4, 1.4);
          ctx.restore();
          continue;
        } else if (pt.shape === 'smoke') {
          pt.radius += 0.15;
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        } else if (pt.shape === 'gib') {
          pt.vx *= 0.92;
          pt.vy *= 0.92;
          if (pt.vAngle && pt.angle !== undefined) pt.angle += pt.vAngle;
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.angle || 0);
          ctx.fillStyle = '#881337'; // Dark rotting flesh
          ctx.beginPath();
          ctx.ellipse(0, 0, pt.radius, pt.radius * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#dc2626'; // Fresh blood core
          ctx.beginPath();
          ctx.arc(0, 0, pt.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        } else if (pt.shape === 'bone') {
          pt.vx *= 0.94;
          pt.vy *= 0.94;
          if (pt.vAngle && pt.angle !== undefined) pt.angle += pt.vAngle;
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.angle || 0);
          ctx.fillStyle = '#f8fafc'; // Ivory bone shard
          ctx.fillRect(-pt.radius, -1.2, pt.radius * 2, 2.4);
          ctx.beginPath();
          ctx.arc(-pt.radius, 0, 2, 0, Math.PI * 2);
          ctx.arc(pt.radius, 0, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        } else if (pt.shape === 'flesh') {
          pt.vx *= 0.93;
          pt.vy *= 0.93;
          ctx.save();
          ctx.globalAlpha = Math.max(0, pt.alpha);
          ctx.fillStyle = '#b91c1c';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
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

      // Render Dynamic Environmental Hazard Strikes (Telegraphing Warning Zones)
      state.hazardStrikes.forEach(strike => {
        ctx.save();
        const progress = 1 - (strike.timer / strike.maxTimer);
        const strokeColor = strike.type === 'lightning' ? '#38bdf8' : strike.type === 'meteor' ? '#f97316' : '#10b981';

        // Outer pulsing ring
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.arc(strike.x, strike.y, strike.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner contracting danger radius
        ctx.fillStyle = strike.type === 'lightning' ? 'rgba(56, 189, 248, 0.22)' : strike.type === 'meteor' ? 'rgba(249, 115, 22, 0.25)' : 'rgba(16, 185, 129, 0.22)';
        ctx.beginPath();
        ctx.arc(strike.x, strike.y, strike.radius * progress, 0, Math.PI * 2);
        ctx.fill();

        // Warning Icon or Symbol in center
        ctx.fillStyle = strokeColor;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(strike.type === 'lightning' ? '⚡' : strike.type === 'meteor' ? '☄️' : '☣️', strike.x, strike.y);
        ctx.restore();
      });

      // ==========================================
      // DYNAMIC ATMOSPHERIC LIGHTING & TACTICAL FLASHLIGHT
      // ==========================================
      ctx.save();
      // Forward Tactical Weapon Flashlight Beam (Cone)
      const flashDist = 380;
      const flashGrad = ctx.createRadialGradient(
        p.x, p.y, 10,
        p.x + Math.cos(p.angle) * (flashDist * 0.6), p.y + Math.sin(p.angle) * (flashDist * 0.6), flashDist
      );
      flashGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      flashGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.14)');
      flashGrad.addColorStop(0.8, 'rgba(254, 240, 138, 0.04)');
      flashGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

      const coneAngle = 0.52; // ~30 degrees each side
      ctx.fillStyle = flashGrad;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, flashDist, p.angle - coneAngle, p.angle + coneAngle);
      ctx.closePath();
      ctx.fill();

      // Soft 360-degree Personal Ambient Lantern Aura
      const lanternGrad = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, 130
      );
      lanternGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      lanternGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.05)');
      lanternGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = lanternGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 130, 0, Math.PI * 2);
      ctx.fill();

      // Laser Sight Line for Commando & Cyber skins
      if (p.warriorSkin === 'cyber' || p.warriorSkin === 'commando') {
        ctx.strokeStyle = p.warriorSkin === 'cyber' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(p.angle) * 22, p.y + Math.sin(p.angle) * 22);
        ctx.lineTo(p.x + Math.cos(p.angle) * 440, p.y + Math.sin(p.angle) * 440);
        ctx.stroke();

        ctx.fillStyle = p.warriorSkin === 'cyber' ? '#38bdf8' : '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(p.angle) * 440, p.y + Math.sin(p.angle) * 440, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      } finally {
        ctx.restore(); // Restore camera transform
      }
      }

      // Full-screen Lightning Flash Overlay
      if (state.lightningFlashAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(224, 242, 254, ${Math.min(0.65, state.lightningFlashAlpha)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Screen-space Chrono Matrix / Ultimate Vignette
      if (p.isUltimateActive) {
        ctx.save();
        const pulse = 0.5 + 0.5 * Math.sin(currentTime / 180);
        const skin = p.warriorSkin || 'commando';
        const glowColor = skin === 'ghost' ? 'rgba(16, 185, 129, ' : skin === 'cyber' ? 'rgba(245, 158, 11, ' : 'rgba(239, 68, 68, ';
        const grad = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.4,
          canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75
        );
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(1, `${glowColor}${0.2 + pulse * 0.15})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Screen-space Dynamic Wave Hazard Emergency Banner
      if (state.waveHazard && state.waveHazard.bannerTimer > 0) {
        ctx.save();
        const hazardAlpha = Math.min(1, state.waveHazard.bannerTimer / 30);
        ctx.globalAlpha = hazardAlpha;
        const bannerY = canvas.height * 0.14;
        ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
        ctx.fillRect(canvas.width * 0.15, bannerY - 18, canvas.width * 0.7, 44);

        // Glowing border
        ctx.strokeStyle = state.waveHazard.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(canvas.width * 0.15, bannerY - 18, canvas.width * 0.7, 44);

        ctx.textAlign = 'center';
        ctx.font = '900 13px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = state.waveHazard.color;
        ctx.shadowColor = state.waveHazard.color;
        ctx.shadowBlur = 8;
        ctx.fillText(`⚠️ ${state.waveHazard.nameVi}`, canvas.width / 2, bannerY);

        ctx.font = 'bold 9.5px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#f3f4f6';
        ctx.shadowBlur = 0;
        ctx.fillText(state.waveHazard.descVi, canvas.width / 2, bannerY + 16);
        ctx.restore();
      }

      // Screen-space Boss Defeated Banner
      if (state.bossDefeatedBanner) {
        state.bossDefeatedBanner.timer -= 1;
        if (state.bossDefeatedBanner.timer <= 0) {
          state.bossDefeatedBanner = null;
        } else {
          ctx.save();
          ctx.textAlign = 'center';
          const bannerY = canvas.height * 0.22;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
          ctx.fillRect(0, bannerY - 32, canvas.width, 68);

          ctx.font = '900 22px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#facc15';
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 12;
          ctx.fillText(state.bossDefeatedBanner.text, canvas.width / 2, bannerY);

          ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.shadowBlur = 4;
          ctx.fillText(state.bossDefeatedBanner.subText, canvas.width / 2, bannerY + 22);
          ctx.restore();
        }
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
      if (threeRendererRef.current) {
        threeRendererRef.current.destroy();
        threeRendererRef.current = null;
      }
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
    const is3D = viewModeRef.current !== '2d';
    let worldX = 0;
    let worldY = 0;
    if (is3D && threeRendererRef.current) {
      const hit = threeRendererRef.current.getGroundIntersection(screenX, screenY);
      if (hit) {
        worldX = hit.x;
        worldY = hit.y;
      } else {
        worldX = (screenX - canvas.width / 2) / zoom + state.camera.x;
        worldY = (screenY - canvas.height / 2) / zoom + state.camera.y;
      }
    } else {
      worldX = (screenX - canvas.width / 2) / zoom + state.camera.x;
      worldY = (screenY - canvas.height / 2) / zoom + state.camera.y;
    }

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
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none bg-neutral-950 touch-none">
      {/* 3D WebGL Canvas */}
      <canvas
        ref={threeCanvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ display: viewMode !== '2d' ? 'block' : 'none' }}
      />

      {/* 2D Canvas: 2D World Renderer in 2D mode, OR transparent UI overlay in 3D mode */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        className="absolute inset-0 w-full h-full block cursor-crosshair select-none touch-none"
      />
    </div>
  );
};
