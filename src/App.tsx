import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlayerStats, Weapon, WeaponType, GameDifficulty, 
  GameMode, ActiveBuffs, MapEnvironmentId 
} from './types/game';
import { INITIAL_WEAPONS, MAP_SIZE, UPGRADES_CONFIG } from './utils/constants';
import { soundManager } from './utils/audio';
import { WARRIOR_CLASSES } from './data/warriors';
import { INITIAL_DRONES, CompanionDroneConfig } from './data/drones';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { ShopModal } from './components/ShopModal';
import { VirtualControls } from './components/VirtualControls';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { StartScreen } from './components/StartScreen';

export const App: React.FC = () => {
  // Screen States
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [isPaused, setIsPaused] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Difficulty & Mode & Warrior & Map Environment
  const [difficulty, setDifficulty] = useState<GameDifficulty>('normal');
  const [mode, setMode] = useState<GameMode>('survival');
  const [selectedWarriorId, setSelectedWarriorId] = useState<string>('commando');
  const [selectedMapId, setSelectedMapId] = useState<MapEnvironmentId>('rooftop');

  // Player State
  const [player, setPlayer] = useState<PlayerStats>({
    x: MAP_SIZE.width / 2,
    y: MAP_SIZE.height / 2,
    radius: 18,
    hp: 100,
    maxHp: 100,
    armor: 50,
    maxArmor: 50,
    speed: 3.6,
    angle: 0,
    stamina: 100,
    maxStamina: 100,
    isDashing: false,
    dashCooldown: 0,
    dashTimer: 0,
    grenadeCount: 3,
    gold: 150,
    score: 0,
    kills: 0,
    headshots: 0,
    combo: 0,
    comboTimer: 0,
    multiplier: 1,
    invincibleTimer: 0,
    warriorSkin: 'commando',
    walkFrame: 0,
    upgrades: {
      maxHpLevel: 0,
      armorLevel: 0,
      speedLevel: 0,
      reloadLevel: 0,
      critChanceLevel: 0,
      magnetRadiusLevel: 0,
      bulletDamageLevel: 0
    }
  });

  // Weapons Arsenal State
  const [weapons, setWeapons] = useState<Record<string, Weapon>>({ ...INITIAL_WEAPONS });
  const [currentWeaponId, setCurrentWeaponId] = useState<WeaponType>('pistol');

  // Companion Drones State
  const [drones, setDrones] = useState<CompanionDroneConfig[]>(INITIAL_DRONES);

  // Wave & Boss State
  const [wave, setWave] = useState(1);
  const [totalZombiesInWave, setTotalZombiesInWave] = useState(12);
  const [zombiesRemaining, setZombiesRemaining] = useState(12);
  const [bossHp, setBossHp] = useState<{ current: number; max: number; name: string; badge?: string; currentSkill?: string } | null>(null);

  // Active Power-Up Buffs
  const [activeBuffs, setActiveBuffs] = useState<ActiveBuffs>({
    doubleDamageTimer: 0,
    speedBoostTimer: 0,
    freezeEnemiesTimer: 0,
    shieldTimer: 0
  });

  // Reloading state
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);

  // Auto-Aim Assist (Default on for mobile convenience)
  const [autoAimEnabled, setAutoAimEnabled] = useState(true);

  // Tactical Camera Zoom (Default 'wide' for maximum visibility on mobile)
  const [cameraZoomMode, setCameraZoomMode] = useState<'wide' | 'ultrawide' | 'normal'>('wide');

  const handleToggleCameraZoom = () => {
    setCameraZoomMode(prev => {
      if (prev === 'wide') return 'ultrawide';
      if (prev === 'ultrawide') return 'normal';
      return 'wide';
    });
  };

  // Touch Virtual Inputs
  const [touchMoveInput, setTouchMoveInput] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [touchAimInput, setTouchAimInput] = useState<{ angle: number; isShooting: boolean }>({ angle: 0, isShooting: false });

  // Real Mobile Safari / Chrome Viewport Height Tracking
  useEffect(() => {
    const updateAppHeight = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };
    updateAppHeight();
    window.addEventListener('resize', updateAppHeight);
    window.addEventListener('orientationchange', updateAppHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateAppHeight);
      window.visualViewport.addEventListener('scroll', updateAppHeight);
    }
    return () => {
      window.removeEventListener('resize', updateAppHeight);
      window.removeEventListener('orientationchange', updateAppHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateAppHeight);
        window.visualViewport.removeEventListener('scroll', updateAppHeight);
      }
    };
  }, []);

  // Lock body scroll ONLY during active combat gameplay; allow free scrolling in lobby/menus
  useEffect(() => {
    if (gameState === 'playing') {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      document.documentElement.classList.add('game-playing');
      document.body.classList.add('game-playing');
    } else {
      document.documentElement.classList.remove('game-playing');
      document.body.classList.remove('game-playing');
    }
    return () => {
      document.documentElement.classList.remove('game-playing');
      document.body.classList.remove('game-playing');
    };
  }, [gameState]);

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
  }, []);

  const handleMapChange = useCallback((newMapId: MapEnvironmentId) => {
    setSelectedMapId(newMapId);
  }, []);

  // Start new game
  const handleStartGame = (
    chosenDiff: GameDifficulty, 
    chosenMode: GameMode, 
    chosenWarriorId?: string,
    chosenMapId?: MapEnvironmentId
  ) => {
    setDifficulty(chosenDiff);
    setMode(chosenMode);
    const warriorId = chosenWarriorId || selectedWarriorId || 'commando';
    setSelectedWarriorId(warriorId);
    if (chosenMapId) {
      setSelectedMapId(chosenMapId);
    }

    const warriorConfig = WARRIOR_CLASSES.find(w => w.id === warriorId) || WARRIOR_CLASSES[0];
    const initialHp = Math.round(100 * warriorConfig.perks.hpMultiplier);
    const initialArmor = Math.round(50 * warriorConfig.perks.armorMultiplier);
    const initialSpeed = Number((3.6 * warriorConfig.perks.speedMultiplier).toFixed(2));

    // Reset Player with warrior stats
    setPlayer({
      x: MAP_SIZE.width / 2,
      y: MAP_SIZE.height / 2,
      radius: 18,
      hp: initialHp,
      maxHp: initialHp,
      armor: initialArmor,
      maxArmor: initialArmor,
      speed: initialSpeed,
      angle: 0,
      stamina: 100,
      maxStamina: 100,
      isDashing: false,
      dashCooldown: 0,
      dashTimer: 0,
      grenadeCount: 3,
      gold: chosenDiff === 'easy' ? 300 : 150,
      score: 0,
      kills: 0,
      headshots: 0,
      combo: 0,
      comboTimer: 0,
      multiplier: 1,
      invincibleTimer: 0,
      warriorSkin: warriorId,
      walkFrame: 0,
      upgrades: {
        maxHpLevel: 0,
        armorLevel: 0,
        speedLevel: 0,
        reloadLevel: 0,
        critChanceLevel: 0,
        magnetRadiusLevel: 0,
        bulletDamageLevel: 0
      }
    });

    // Reset Weapons
    const freshWeapons = JSON.parse(JSON.stringify(INITIAL_WEAPONS));
    setWeapons(freshWeapons);
    setCurrentWeaponId('pistol');

    // Reset Companion Drones (Must be purchased in armory shop with gold)
    setDrones(INITIAL_DRONES.map(d => ({ ...d, unlocked: false, level: 1 })));

    setWave(1);
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setGameState('playing');
    setIsPaused(false);
    setIsShopOpen(false);
  };

  // Keyboard shortcut listeners (Shop, Pause, Weapons)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const key = e.key.toLowerCase();
      // Shop Toggle (B)
      if (key === 'b') {
        setIsShopOpen(prev => !prev);
      }
      // Pause (ESC or P)
      if (key === 'escape' || key === 'p') {
        if (isShopOpen) {
          setIsShopOpen(false);
        } else {
          setIsPaused(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [gameState, isShopOpen]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundManager.setMuted(nextMute);
  };

  // Weapon Next / Prev Cycle
  const handleNextWeapon = () => {
    const unlockedWeapons = (Object.values(weapons) as Weapon[]).filter(w => w.unlocked);
    const currentIndex = unlockedWeapons.findIndex(w => w.id === currentWeaponId);
    const nextIndex = (currentIndex + 1) % unlockedWeapons.length;
    setCurrentWeaponId(unlockedWeapons[nextIndex].id);
  };

  const handlePrevWeapon = () => {
    const unlockedWeapons = (Object.values(weapons) as Weapon[]).filter(w => w.unlocked);
    const currentIndex = unlockedWeapons.findIndex(w => w.id === currentWeaponId);
    const prevIndex = (currentIndex - 1 + unlockedWeapons.length) % unlockedWeapons.length;
    setCurrentWeaponId(unlockedWeapons[prevIndex].id);
  };

  // Shop Purchases
  const handleBuyWeapon = (weaponId: WeaponType) => {
    const target = weapons[weaponId];
    if (!target || player.gold < target.cost || target.unlocked) return;

    soundManager.playPowerUp();
    setPlayer(prev => ({ ...prev, gold: prev.gold - target.cost }));
    setWeapons(prev => ({
      ...prev,
      [weaponId]: {
        ...prev[weaponId],
        unlocked: true
      }
    }));
    setCurrentWeaponId(weaponId);
  };

  const handleUpgradeWeapon = (weaponId: WeaponType) => {
    const target = weapons[weaponId];
    if (!target) return;
    const upgradeCost = Math.round(target.cost * 0.6 * target.level) + 120;
    if (player.gold < upgradeCost) return;

    soundManager.playPowerUp();
    setPlayer(prev => ({ ...prev, gold: prev.gold - upgradeCost }));
    setWeapons(prev => ({
      ...prev,
      [weaponId]: {
        ...prev[weaponId],
        level: prev[weaponId].level + 1,
        damage: Math.round(prev[weaponId].damage * 1.15)
      }
    }));
  };

  const handleBuyAmmo = (weaponId: WeaponType) => {
    const target = weapons[weaponId];
    if (!target || target.reserveAmmo === -1) return;
    const ammoCost = Math.round(target.cost * 0.15) + 30;
    if (player.gold < ammoCost) return;

    soundManager.playReload();
    setPlayer(prev => ({ ...prev, gold: prev.gold - ammoCost }));
    setWeapons(prev => ({
      ...prev,
      [weaponId]: {
        ...prev[weaponId],
        reserveAmmo: prev[weaponId].reserveAmmo + prev[weaponId].magSize * 2
      }
    }));
  };

  const handleBuyPerk = (perkId: string) => {
    const config = UPGRADES_CONFIG.find(u => u.id === perkId);
    if (!config) return;
    const currentLevel = (player.upgrades as Record<string, number>)[perkId] || 0;
    const cost = Math.round(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    if (player.gold < cost || currentLevel >= config.maxLevel) return;

    soundManager.playPowerUp();
    setPlayer(prev => {
      const nextUpgrades = { ...prev.upgrades, [perkId]: currentLevel + 1 };
      let newMaxHp = prev.maxHp;
      let newHp = prev.hp;
      let newMaxArmor = prev.maxArmor;
      let newArmor = prev.armor;
      let newSpeed = prev.speed;

      if (perkId === 'maxHpLevel') {
        newMaxHp += 25;
        newHp = newMaxHp;
      } else if (perkId === 'armorLevel') {
        newMaxArmor += 20;
        newArmor = newMaxArmor;
      } else if (perkId === 'speedLevel') {
        newSpeed *= 1.08;
      }

      return {
        ...prev,
        gold: prev.gold - cost,
        maxHp: newMaxHp,
        hp: newHp,
        maxArmor: newMaxArmor,
        armor: newArmor,
        speed: newSpeed,
        upgrades: nextUpgrades
      };
    });
  };

  const handleBuySupply = (type: 'heal' | 'armor' | 'grenade' | 'turret') => {
    if (type === 'heal' && player.gold >= 100 && player.hp < player.maxHp) {
      soundManager.playPowerUp();
      setPlayer(prev => ({ ...prev, gold: prev.gold - 100, hp: Math.min(prev.maxHp, prev.hp + 50) }));
    } else if (type === 'armor' && player.gold >= 120 && player.armor < player.maxArmor) {
      soundManager.playPowerUp();
      setPlayer(prev => ({ ...prev, gold: prev.gold - 120, armor: prev.maxArmor }));
    } else if (type === 'grenade' && player.gold >= 180) {
      soundManager.playPowerUp();
      setPlayer(prev => ({ ...prev, gold: prev.gold - 180, grenadeCount: prev.grenadeCount + 3 }));
    } else if (type === 'turret' && player.gold >= 350) {
      soundManager.playPowerUp();
      setPlayer(prev => ({ ...prev, gold: prev.gold - 350 }));
    }
  };

  const handleUnlockDrone = (droneId: string) => {
    const target = drones.find(d => d.id === droneId);
    if (!target || target.unlocked || player.gold < target.cost) return;

    soundManager.playDroneDeploy();
    setPlayer(prev => ({ ...prev, gold: prev.gold - target.cost }));
    setDrones(prev => prev.map(d => d.id === droneId ? { ...d, unlocked: true } : d));
  };

  const handleUpgradeDrone = (droneId: string) => {
    const target = drones.find(d => d.id === droneId);
    if (!target || !target.unlocked || target.level >= target.maxLevel) return;

    const cost = Math.round(target.cost * 0.7 * Math.pow(1.5, target.level));
    if (player.gold < cost) return;

    soundManager.playPowerUp();
    setPlayer(prev => ({ ...prev, gold: prev.gold - cost }));
    setDrones(prev => prev.map(d => {
      if (d.id === droneId) {
        const nextLevel = d.level + 1;
        return {
          ...d,
          level: nextLevel,
          damage: d.damage + 10,
          fireRate: Math.max(90, d.fireRate - 25),
          range: d.range + 35
        };
      }
      return d;
    }));
  };

  const handleQuickUpgradeAll = () => {
    let curGold = player.gold;
    if (curGold < 50) return;

    let upgradedAny = false;
    const nextUpgrades = { ...player.upgrades };
    const nextWeapons = { ...weapons };
    let nextDrones = [...drones];

    // 1. Upgrade unlocked weapons
    for (const key of Object.keys(nextWeapons) as WeaponType[]) {
      const wep = nextWeapons[key];
      if (wep.unlocked && wep.level < 10) {
        const upCost = Math.round(wep.cost * 0.6 * wep.level) + 120;
        if (curGold >= upCost) {
          curGold -= upCost;
          wep.level += 1;
          wep.damage = Math.round(wep.damage * 1.25);
          wep.magSize = Math.round(wep.magSize * 1.15);
          wep.fireRate = Math.max(40, Math.round(wep.fireRate * 0.92));
          upgradedAny = true;
        }
      }
    }

    // 2. Upgrade passive perks
    for (const perk of UPGRADES_CONFIG) {
      const curLvl = (nextUpgrades as any)[`${perk.id}Level`] || (nextUpgrades as any)[perk.id] || 0;
      if (curLvl < perk.maxLevel) {
        const cost = Math.round(perk.baseCost * Math.pow(perk.costMultiplier, curLvl));
        if (curGold >= cost) {
          curGold -= cost;
          (nextUpgrades as any)[perk.id] = curLvl + 1;
          (nextUpgrades as any)[`${perk.id}Level`] = curLvl + 1;
          upgradedAny = true;
        }
      }
    }

    // 3. Upgrade active companion drones
    nextDrones = nextDrones.map(d => {
      if (d.unlocked && d.level < d.maxLevel) {
        const cost = Math.round(d.cost * 0.7 * Math.pow(1.5, d.level));
        if (curGold >= cost) {
          curGold -= cost;
          upgradedAny = true;
          return {
            ...d,
            level: d.level + 1,
            damage: d.damage + 10,
            fireRate: Math.max(90, d.fireRate - 25),
            range: d.range + 35
          };
        }
      }
      return d;
    });

    if (upgradedAny) {
      soundManager.playPowerUp();
      setPlayer(prev => ({
        ...prev,
        gold: curGold,
        upgrades: nextUpgrades,
        maxHp: 100 + ((nextUpgrades.maxHpLevel || 0) * 25),
        maxArmor: 50 + ((nextUpgrades.armorLevel || 0) * 20),
        speed: 3.6 + ((nextUpgrades.speedLevel || 0) * 0.35)
      }));
      setWeapons(nextWeapons);
      setDrones(nextDrones);
    }
  };

  return (
    <main className={gameState === 'playing' ? 'fixed inset-0 w-full h-full max-h-[var(--app-height,100dvh)] overflow-hidden select-none touch-none z-10' : 'relative w-full min-h-screen bg-neutral-950 overflow-x-hidden touch-pan-y'}>
      
      {/* 1. START SCREEN */}
      {gameState === 'start' && (
        <StartScreen
          onStartGame={handleStartGame}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          selectedWarriorId={selectedWarriorId}
          onSelectWarrior={(id) => {
            setSelectedWarriorId(id);
            setPlayer(p => ({ ...p, warriorSkin: id }));
          }}
          selectedMapId={selectedMapId}
          onSelectMap={(id) => setSelectedMapId(id)}
        />
      )}

      {/* 2. PLAYING CANVAS & HUD */}
      {gameState === 'playing' && (
        <>
          <GameCanvas
            player={player}
            setPlayer={setPlayer}
            currentWeapon={weapons[currentWeaponId] || weapons.pistol}
            weapons={weapons}
            setWeapons={setWeapons}
            drones={drones}
            wave={wave}
            setWave={setWave}
            totalZombiesInWave={totalZombiesInWave}
            setTotalZombiesInWave={setTotalZombiesInWave}
            zombiesRemaining={zombiesRemaining}
            setZombiesRemaining={setZombiesRemaining}
            bossHp={bossHp}
            setBossHp={setBossHp}
            activeBuffs={activeBuffs}
            setActiveBuffs={setActiveBuffs}
            isReloading={isReloading}
            setIsReloading={setIsReloading}
            reloadProgress={reloadProgress}
            setReloadProgress={setReloadProgress}
            difficulty={difficulty}
            mode={mode}
            selectedMapId={selectedMapId}
            onMapChange={handleMapChange}
            isPaused={isPaused}
            isShopOpen={isShopOpen}
            onGameOver={handleGameOver}
            touchMoveInput={touchMoveInput}
            touchAimInput={touchAimInput}
            autoAimEnabled={autoAimEnabled}
            cameraZoomMode={cameraZoomMode}
          />

          {/* Top & Bottom HUD Display */}
          <HUD
            player={player}
            weapons={weapons}
            currentWeapon={weapons[currentWeaponId] || weapons.pistol}
            currentWeaponId={currentWeaponId}
            wave={wave}
            totalZombiesInWave={totalZombiesInWave}
            zombiesRemaining={zombiesRemaining}
            bossHp={bossHp}
            activeBuffs={activeBuffs}
            currentMapId={selectedMapId}
            isReloading={isReloading}
            reloadProgress={reloadProgress}
            onOpenShop={() => setIsShopOpen(true)}
            onPause={() => setIsPaused(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onSelectWeapon={(id) => setCurrentWeaponId(id)}
            cameraZoomMode={cameraZoomMode}
            onToggleCameraZoom={handleToggleCameraZoom}
            autoAimEnabled={autoAimEnabled}
            onToggleAutoAim={() => setAutoAimEnabled(prev => !prev)}
            onThrowGrenade={() => {
              if (player.grenadeCount > 0) {
                // Triggered through simulated key or direct state
                const event = new KeyboardEvent('keydown', { key: 'g' });
                window.dispatchEvent(event);
              }
            }}
          />

          {/* Virtual Dual Sticks for Mobile / Tablet */}
          <VirtualControls
            onMove={(dx, dy) => setTouchMoveInput({ dx, dy })}
            onAim={(angle, isShooting) => setTouchAimInput({ angle, isShooting })}
            onDash={() => {
              const event = new KeyboardEvent('keydown', { key: ' ' });
              window.dispatchEvent(event);
            }}
            onReload={() => {
              const event = new KeyboardEvent('keydown', { key: 'r' });
              window.dispatchEvent(event);
            }}
            onThrowGrenade={() => {
              const event = new KeyboardEvent('keydown', { key: 'g' });
              window.dispatchEvent(event);
            }}
            onNextWeapon={handleNextWeapon}
            onPrevWeapon={handlePrevWeapon}
            onSelectWeapon={(id) => setCurrentWeaponId(id)}
            weapons={weapons}
            currentWeaponId={currentWeaponId}
            grenadesLeft={player.grenadeCount}
            onOpenShop={() => setIsShopOpen(true)}
            canAffordShop={(Object.values(weapons) as Weapon[]).some(w => (!w.unlocked && player.gold >= w.cost) || (w.unlocked && player.gold >= Math.round(w.cost * 0.6 * w.level) + 120))}
            autoAimEnabled={autoAimEnabled}
            onToggleAutoAim={() => setAutoAimEnabled(prev => !prev)}
            isReloading={isReloading}
            reloadProgress={reloadProgress}
            playerStamina={player.stamina}
            maxStamina={player.maxStamina}
          />

          {/* Shop / Armory Modal */}
          <ShopModal
            player={player}
            weapons={weapons}
            currentWeaponId={currentWeaponId}
            isOpen={isShopOpen}
            onClose={() => setIsShopOpen(false)}
            onBuyWeapon={handleBuyWeapon}
            onUpgradeWeapon={handleUpgradeWeapon}
            onBuyAmmo={handleBuyAmmo}
            onBuyPerk={handleBuyPerk}
            onBuySupply={handleBuySupply}
            drones={drones}
            onUnlockDrone={handleUnlockDrone}
            onUpgradeDrone={handleUpgradeDrone}
            onQuickUpgradeAll={handleQuickUpgradeAll}
            onSelectWarriorSkin={(id) => {
              setSelectedWarriorId(id);
              setPlayer(p => ({ ...p, warriorSkin: id }));
            }}
          />

          {/* Pause Modal */}
          <PauseModal
            isOpen={isPaused}
            onResume={() => setIsPaused(false)}
            onRestart={() => handleStartGame(difficulty, mode)}
            onGoHome={() => {
              setIsPaused(false);
              setGameState('start');
            }}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        </>
      )}

      {/* 3. GAME OVER MODAL */}
      {gameState === 'gameover' && (
        <GameOverModal
          score={player.score}
          kills={player.kills}
          wave={wave}
          goldEarned={player.gold}
          difficulty={difficulty}
          warriorSkin={player.warriorSkin}
          onRestart={() => handleStartGame(difficulty, mode)}
          onGoHome={() => setGameState('start')}
        />
      )}

    </main>
  );
};

export default App;
