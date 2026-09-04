import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { 
  PlayerStats, Weapon, Zombie, Bullet, Particle, 
  DropItem, ActiveTurret, Obstacle, ActiveBuffs, 
  MapEnvironmentId, BossHazard, SweepingLaser, TentacleHook 
} from '../types/game';
import { MAP_SIZE } from '../utils/constants';
import { ActiveDroneState } from '../data/drones';

import { getTacticalGroundTexture, getContainerTexture, getGlowSpriteTexture } from './three/tacticalTextures';
import { VolumetricSpotlight } from './three/volumetricLight';
import { createCommandoModel, createZombieModel, CommandoRig, ZombieRig } from './three/tacticalModels';

export type CameraViewMode = 'isometric' | 'topdown' | 'action';

export class ThreeRenderer {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public raycaster: THREE.Raycaster;
  public groundPlane: THREE.Plane;

  // Post-Processing
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;

  public cameraMode: CameraViewMode = 'isometric';
  public width: number = 800;
  public height: number = 600;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private moonLight: THREE.DirectionalLight;
  private flashlight: THREE.SpotLight;
  private flashlightTarget: THREE.Object3D;
  private volumetricLight: VolumetricSpotlight;
  private muzzleFlashLight: THREE.PointLight;
  private emergencyBeaconLight: THREE.PointLight;
  private emergencyBeaconMesh: THREE.Mesh;

  // Environment & Ground
  private groundMesh: THREE.Mesh;
  private groundMaterial: THREE.MeshStandardMaterial;
  private obstaclesGroup: THREE.Group;
  private cityBackdropGroup: THREE.Group;
  private rainPoints: THREE.Points | null = null;
  private rainGeo: THREE.BufferGeometry | null = null;

  // Player & Rig
  private commandoRig: CommandoRig;
  private lastPlayerPos = { x: 0, y: 0 };
  private playerShieldMesh: THREE.Mesh;

  // Entities & Animations
  private zombiesMap: Map<string, ZombieRig> = new Map();
  private bulletsMap: Map<string, THREE.Mesh> = new Map();
  private dropsMap: Map<string, THREE.Group> = new Map();
  private turretsMap: Map<string, THREE.Group> = new Map();
  private dronesMap: Map<string, THREE.Group> = new Map();
  private bossHazardsMap: Map<string, THREE.Mesh> = new Map();
  private lasersGroup: THREE.Group;

  // Spent Brass Cartridge Casings
  private casingMeshes: THREE.Mesh[] = [];
  private nextCasingIdx = 0;

  // Particle System
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private particlePoints: THREE.Points;
  private particlePositions: Float32Array;
  private particleColors: Float32Array;
  private max3DParticles = 800;

  // Active Map
  private currentMapId: MapEnvironmentId = 'rooftop';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.clientWidth || window.innerWidth;
    this.height = canvas.clientHeight || window.innerHeight;

    // 1. WebGL Renderer with High-Performance Settings
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 2. Scene with Dark Grim Atmosphere & Distance Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030712');
    this.scene.fog = new THREE.FogExp2('#030712', 0.00095);

    // 3. Perspective Camera
    this.camera = new THREE.PerspectiveCamera(48, this.width / this.height, 1, 5000);
    this.setCameraView('isometric');

    // 4. Post-Processing Pipeline (Bloom & Tone Mapping)
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Unreal Bloom: Soft glow for muzzle flashes, glowing red eyes, acid, tracers
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.65, // strength
      0.35, // radius
      0.82  // threshold (only bright highlights bloom)
    );
    this.composer.addPass(this.bloomPass);

    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);

    // 5. Raycaster for precise 3D aiming
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // 6. Lights
    // Dark Slate Tactical Ambient
    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.42);
    this.scene.add(this.ambientLight);

    // High-angle Moonlight with Dramatic Soft Shadows
    this.moonLight = new THREE.DirectionalLight(0x94a3b8, 0.95);
    this.moonLight.position.set(380, 850, 260);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.width = 2048;
    this.moonLight.shadow.mapSize.height = 2048;
    this.moonLight.shadow.camera.near = 50;
    this.moonLight.shadow.camera.far = 1800;
    const d = 550;
    this.moonLight.shadow.camera.left = -d;
    this.moonLight.shadow.camera.right = d;
    this.moonLight.shadow.camera.top = d;
    this.moonLight.shadow.camera.bottom = -d;
    this.moonLight.shadow.bias = -0.0004;
    this.scene.add(this.moonLight);

    // Commando's Spotlight (Flashlight)
    this.flashlightTarget = new THREE.Object3D();
    this.scene.add(this.flashlightTarget);

    this.flashlight = new THREE.SpotLight(0xffedd5, 4.5, 450, Math.PI * 0.22, 0.45, 1.3);
    this.flashlight.castShadow = true;
    this.flashlight.shadow.mapSize.width = 1024;
    this.flashlight.shadow.mapSize.height = 1024;
    this.flashlight.shadow.bias = -0.0003;
    this.flashlight.target = this.flashlightTarget;
    this.scene.add(this.flashlight);

    // Volumetric Atmospheric Light Shaft & Laser Line
    this.volumetricLight = new VolumetricSpotlight(360, 80);
    this.scene.add(this.volumetricLight.group);

    // Muzzle flash point light
    this.muzzleFlashLight = new THREE.PointLight(0xf59e0b, 0, 160);
    this.scene.add(this.muzzleFlashLight);

    // Emergency Red Beacon Light (pulsing warning atmosphere)
    this.emergencyBeaconLight = new THREE.PointLight(0xef4444, 1.8, 220);
    this.emergencyBeaconLight.position.set(MAP_SIZE.width / 2, 28, MAP_SIZE.height / 2);
    this.scene.add(this.emergencyBeaconLight);

    const beaconGeo = new THREE.CylinderGeometry(1.5, 2.5, 5, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    this.emergencyBeaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    this.emergencyBeaconMesh.position.copy(this.emergencyBeaconLight.position);
    this.scene.add(this.emergencyBeaconMesh);

    // 7. Tactical Ground (PBR with Wet Puddles & Roughness Map)
    const { diffuse, roughness } = getTacticalGroundTexture('rooftop');
    this.groundMaterial = new THREE.MeshStandardMaterial({
      map: diffuse,
      roughnessMap: roughness,
      metalness: 0.15,
      roughness: 0.8
    });

    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE.width, MAP_SIZE.height, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);
    this.groundMesh = new THREE.Mesh(groundGeo, this.groundMaterial);
    this.groundMesh.position.set(MAP_SIZE.width / 2, -0.2, MAP_SIZE.height / 2);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // 8. Obstacles & Environment Backdrops
    this.obstaclesGroup = new THREE.Group();
    this.scene.add(this.obstaclesGroup);

    this.cityBackdropGroup = new THREE.Group();
    this.buildCitySkyline();
    this.scene.add(this.cityBackdropGroup);

    // 9. Commando Model Rig
    this.commandoRig = createCommandoModel();
    this.scene.add(this.commandoRig.rootGroup);

    // Holographic Energy Shield
    const shieldGeo = new THREE.SphereGeometry(24, 24, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    this.playerShieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.playerShieldMesh.visible = false;
    this.scene.add(this.playerShieldMesh);

    // 10. Atmospheric 3D Rain Streaks
    this.initAtmosphericWeather();

    // 11. Spent Brass Casings Pool
    const casingGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.5, 6);
    casingGeo.rotateZ(Math.PI / 2);
    const casingMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 30; i++) {
      const casing = new THREE.Mesh(casingGeo, casingMat);
      casing.visible = false;
      this.scene.add(casing);
      this.casingMeshes.push(casing);
    }

    // 12. Lasers Group
    this.lasersGroup = new THREE.Group();
    this.scene.add(this.lasersGroup);

    // 13. Particles
    this.particlePositions = new Float32Array(this.max3DParticles * 3);
    this.particleColors = new Float32Array(this.max3DParticles * 3);
    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));

    this.particleMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      map: getGlowSpriteTexture(),
      depthWrite: false
    });
    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  /**
   * Initializes atmospheric 3D rain streaks falling across the battlefield
   */
  private initAtmosphericWeather() {
    const rainCount = 600;
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPositions[i * 3] = (Math.random() - 0.5) * 800;
      rainPositions[i * 3 + 1] = Math.random() * 300;
      rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 800;
    }
    this.rainGeo = new THREE.BufferGeometry();
    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 2.2,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.rainPoints = new THREE.Points(this.rainGeo, rainMat);
    this.scene.add(this.rainPoints);
  }

  /**
   * Builds atmospheric city silhouettes in the background
   */
  private buildCitySkyline() {
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let i = 0; i < 28; i++) {
      const bw = 70 + Math.random() * 90;
      const bh = 140 + Math.random() * 260;
      const bd = 70 + Math.random() * 90;
      const bGeo = new THREE.BoxGeometry(bw, bh, bd);
      const bMesh = new THREE.Mesh(bGeo, buildingMat);

      const angle = (i / 28) * Math.PI * 2;
      const dist = 1400 + Math.random() * 300;
      bMesh.position.set(
        MAP_SIZE.width / 2 + Math.cos(angle) * dist,
        bh / 2 - 80,
        MAP_SIZE.height / 2 + Math.sin(angle) * dist
      );
      this.cityBackdropGroup.add(bMesh);

      // Random glowing windows on skyline
      if (Math.random() > 0.4) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(12, 18), windowMat);
        win.position.set(bMesh.position.x, bMesh.position.y + 30, bMesh.position.z + bd / 2 + 1);
        this.cityBackdropGroup.add(win);
      }
    }
  }

  /**
   * Sets the camera perspective mode
   */
  public setCameraView(mode: CameraViewMode) {
    this.cameraMode = mode;
    if (mode === 'isometric') {
      this.camera.fov = 46;
    } else if (mode === 'topdown') {
      this.camera.fov = 52;
    } else if (mode === 'action') {
      this.camera.fov = 58;
    }
    this.camera.updateProjectionMatrix();
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Raycasts screen coordinates onto the 3D ground plane
   */
  public getGroundIntersection(screenX: number, screenY: number): { x: number; y: number } | null {
    const ndcX = (screenX / this.width) * 2 - 1;
    const ndcY = -(screenY / this.height) * 2 + 1;

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const target = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, target);
    if (hit) {
      return { x: target.x, y: target.z };
    }
    return null;
  }

  /**
   * Projects 3D world coordinates to 2D screen pixels for HUD, HP bars, Floating damage numbers
   */
  public projectToScreen(worldX: number, worldY: number, heightOffset = 0): { x: number; y: number } | null {
    const v = new THREE.Vector3(worldX, heightOffset, worldY);
    v.project(this.camera);
    if (v.z > 1) return null; // Behind camera
    return {
      x: ((v.x + 1) * this.width) / 2,
      y: ((-v.y + 1) * this.height) / 2
    };
  }

  /**
   * Synchronizes 3D Obstacles on map change
   */
  public syncObstacles(obstacles: Obstacle[]) {
    while (this.obstaclesGroup.children.length > 0) {
      this.obstaclesGroup.remove(this.obstaclesGroup.children[0]);
    }

    const containerTex = getContainerTexture('#1e3a8a');
    const containerMat = new THREE.MeshStandardMaterial({
      map: containerTex,
      roughness: 0.6,
      metalness: 0.5
    });

    const sandbagMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.95 });
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.5 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });

    obstacles.forEach(obs => {
      let mesh: THREE.Mesh;
      if (obs.type === 'crate' || obs.type === 'vehicle' || obs.type === 'server' || obs.type === 'barrier') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 36, obs.height), containerMat);
        mesh.position.set(obs.x + obs.width / 2, 18, obs.y + obs.height / 2);
      } else if (obs.type === 'sandbag') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 14, obs.height), sandbagMat);
        mesh.position.set(obs.x + obs.width / 2, 7, obs.y + obs.height / 2);
      } else if (obs.type === 'barrel') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(obs.width / 2, obs.width / 2, 26, 12), barrelMat);
        mesh.position.set(obs.x + obs.width / 2, 13, obs.y + obs.height / 2);
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 24, obs.height), concreteMat);
        mesh.position.set(obs.x + obs.width / 2, 12, obs.y + obs.height / 2);
      }

      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.obstaclesGroup.add(mesh);
    });
  }

  /**
   * Ejects a spent brass bullet casing from the rifle
   */
  private ejectBrassCasing(x: number, y: number, z: number, angle: number) {
    const casing = this.casingMeshes[this.nextCasingIdx];
    this.nextCasingIdx = (this.nextCasingIdx + 1) % this.casingMeshes.length;

    casing.visible = true;
    casing.position.set(
      x - Math.sin(angle) * 3,
      y + 1,
      z + Math.cos(angle) * 3
    );
    casing.rotation.y = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    casing.rotation.x = (Math.random() - 0.5) * 0.5;
  }

  /**
   * Main Render Loop Update
   */
  public update(
    gameState: {
      player: PlayerStats;
      currentWeapon: Weapon;
      zombies: Zombie[];
      bullets: Bullet[];
      particles: Particle[];
      drops: DropItem[];
      turrets: ActiveTurret[];
      activeDrones: ActiveDroneState[];
      laserBeams: SweepingLaser[];
      bossHazards: BossHazard[];
      activeBuffs: ActiveBuffs;
      currentMapId: MapEnvironmentId;
      screenShake: number;
    },
    currentTime: number,
    isFiring = false
  ) {
    const p = gameState.player;

    // Check Map Change
    if (gameState.currentMapId !== this.currentMapId) {
      this.currentMapId = gameState.currentMapId;
      const { diffuse, roughness } = getTacticalGroundTexture(this.currentMapId);
      this.groundMaterial.map = diffuse;
      this.groundMaterial.roughnessMap = roughness;
      this.groundMaterial.needsUpdate = true;
    }

    // 1. Commando Movement & Aim
    const isMoving = Math.hypot(p.x - this.lastPlayerPos.x, p.y - this.lastPlayerPos.y) > 0.4;
    this.lastPlayerPos = { x: p.x, y: p.y };

    this.commandoRig.rootGroup.position.set(p.x, 0, p.y);
    this.commandoRig.rootGroup.rotation.y = -p.angle + Math.PI / 2;
    this.commandoRig.animate(isMoving, currentTime, isFiring);

    // Shield mesh
    if (gameState.activeBuffs.shieldTimer > 0) {
      this.playerShieldMesh.visible = true;
      this.playerShieldMesh.position.set(p.x, 18, p.y);
      this.playerShieldMesh.rotation.y += 0.03;
      this.playerShieldMesh.rotation.x += 0.01;
    } else {
      this.playerShieldMesh.visible = false;
    }

    // 2. Tactical Flashlight & Volumetric Shaft
    const aimTargetX = p.x + Math.cos(p.angle) * 360;
    const aimTargetZ = p.y + Math.sin(p.angle) * 360;

    this.flashlight.position.set(p.x, 22, p.y);
    this.flashlightTarget.position.set(aimTargetX, 0, aimTargetZ);

    this.volumetricLight.update(p.x, 20, p.y, aimTargetX, aimTargetZ);

    // Muzzle Flash
    if (isFiring) {
      this.muzzleFlashLight.position.set(
        p.x + Math.cos(p.angle) * 16,
        20,
        p.y + Math.sin(p.angle) * 16
      );
      this.muzzleFlashLight.intensity = 4.8;
      this.ejectBrassCasing(p.x, 20, p.y, p.angle);
    } else {
      this.muzzleFlashLight.intensity = THREE.MathUtils.lerp(this.muzzleFlashLight.intensity, 0, 0.4);
    }

    // Emergency Red Beacon pulse
    const beaconPulse = Math.sin(currentTime * 0.005);
    this.emergencyBeaconLight.intensity = 1.2 + beaconPulse * 0.8;
    this.emergencyBeaconMesh.rotation.y += 0.08;

    // 3. Camera Rigging & Tracking
    const shakeX = (Math.random() - 0.5) * (gameState.screenShake || 0) * 1.5;
    const shakeZ = (Math.random() - 0.5) * (gameState.screenShake || 0) * 1.5;

    if (this.cameraMode === 'isometric') {
      // Classic Diablo IV / Alien Shooter isometric diagonal angle
      const camDist = 320;
      const camHeight = 380;
      this.camera.position.set(
        p.x + shakeX,
        camHeight,
        p.y + camDist + shakeZ
      );
      this.camera.lookAt(p.x, 15, p.y);
    } else if (this.cameraMode === 'topdown') {
      // High tactical top-down
      this.camera.position.set(p.x + shakeX, 520, p.y + shakeZ + 0.1);
      this.camera.lookAt(p.x, 0, p.y);
    } else {
      // Action Chase Camera behind the soldier's shoulder
      const backDist = 180;
      const backX = p.x - Math.cos(p.angle) * backDist + shakeX;
      const backZ = p.y - Math.sin(p.angle) * backDist + shakeZ;
      this.camera.position.set(backX, 120, backZ);
      this.camera.lookAt(p.x + Math.cos(p.angle) * 120, 20, p.y + Math.sin(p.angle) * 120);
    }

    // Moon Light follows player for consistent soft shadows
    this.moonLight.position.set(p.x + 350, 750, p.y + 250);
    this.moonLight.target.position.set(p.x, 0, p.y);
    this.moonLight.target.updateMatrixWorld();

    // 4. Update Atmospheric Rain
    if (this.rainPoints && this.rainGeo) {
      const rainPos = this.rainGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < rainPos.length / 3; i++) {
        rainPos[i * 3 + 1] -= 8.5; // fall speed
        if (rainPos[i * 3 + 1] < 0) {
          rainPos[i * 3 + 1] = 250;
          rainPos[i * 3] = p.x + (Math.random() - 0.5) * 600;
          rainPos[i * 3 + 2] = p.y + (Math.random() - 0.5) * 600;
        }
      }
      this.rainGeo.attributes.position.needsUpdate = true;
    }

    // 5. Update Zombies
    const currentZombieIds = new Set<string>();
    gameState.zombies.forEach(z => {
      currentZombieIds.add(z.id);
      let rig = this.zombiesMap.get(z.id);
      if (!rig) {
        rig = createZombieModel(z);
        this.scene.add(rig.rootGroup);
        this.zombiesMap.set(z.id, rig);
      }

      rig.rootGroup.position.set(z.x, 0, z.y);
      rig.rootGroup.rotation.y = -z.angle + Math.PI / 2;

      const speedMultiplier = z.type === 'runner' ? 1.6 : z.type === 'tank' ? 0.7 : 1.0;
      rig.animate(currentTime, speedMultiplier);
    });

    // Remove dead zombies
    this.zombiesMap.forEach((rig, id) => {
      if (!currentZombieIds.has(id)) {
        this.scene.remove(rig.rootGroup);
        this.zombiesMap.delete(id);
      }
    });

    // 6. Update Bullets (Glowing 3D Tracers)
    const currentBulletIds = new Set<string>();
    gameState.bullets.forEach(b => {
      currentBulletIds.add(b.id);
      const bulletAngle = Math.atan2(b.vy, b.vx);
      let mesh = this.bulletsMap.get(b.id);
      if (!mesh) {
        const tracerGeo = new THREE.CylinderGeometry(0.8, 0.8, 12, 6);
        tracerGeo.rotateX(Math.PI / 2);
        const bulletColor = b.isPlasma ? 0x38bdf8 : (b.color ? new THREE.Color(b.color).getHex() : 0xfacc15);
        const tracerMat = new THREE.MeshBasicMaterial({ color: bulletColor });
        mesh = new THREE.Mesh(tracerGeo, tracerMat);
        this.scene.add(mesh);
        this.bulletsMap.set(b.id, mesh);
      }

      mesh.position.set(b.x, 16, b.y);
      mesh.rotation.y = -bulletAngle - Math.PI / 2;
    });

    this.bulletsMap.forEach((mesh, id) => {
      if (!currentBulletIds.has(id)) {
        this.scene.remove(mesh);
        this.bulletsMap.delete(id);
      }
    });

    // 7. Update Particles
    let pIdx = 0;
    const limit = Math.min(gameState.particles.length, this.max3DParticles);
    for (let i = 0; i < limit; i++) {
      const pt = gameState.particles[i];
      if (pt.alpha <= 0) continue;

      this.particlePositions[pIdx * 3] = pt.x;
      this.particlePositions[pIdx * 3 + 1] = Math.max(1, 15 + Math.sin(pt.life || 0) * 6);
      this.particlePositions[pIdx * 3 + 2] = pt.y;

      const c = new THREE.Color(pt.color || '#f59e0b');
      this.particleColors[pIdx * 3] = c.r * pt.alpha;
      this.particleColors[pIdx * 3 + 1] = c.g * pt.alpha;
      this.particleColors[pIdx * 3 + 2] = c.b * pt.alpha;

      pIdx++;
    }

    // Clear remaining slots
    for (let i = pIdx; i < this.max3DParticles; i++) {
      this.particlePositions[i * 3 + 1] = -999;
    }
    this.particleGeo.attributes.position.needsUpdate = true;
    this.particleGeo.attributes.color.needsUpdate = true;

    // 8. Update Drone Companions
    const activeDroneIds = new Set<string>();
    gameState.activeDrones.forEach(d => {
      activeDroneIds.add(d.id);
      let drone = this.dronesMap.get(d.id);
      if (!drone) {
        drone = this.buildDroneModel();
        this.scene.add(drone);
        this.dronesMap.set(d.id, drone);
      }
      const hoverBob = Math.sin(currentTime * 0.006 + (d.hoverOffset || 0)) * 3;
      drone.position.set(d.x, 26 + hoverBob, d.y);
      drone.rotation.y += 0.04;
    });

    this.dronesMap.forEach((drone, id) => {
      if (!activeDroneIds.has(id)) {
        this.scene.remove(drone);
        this.dronesMap.delete(id);
      }
    });

    // 9. Post-Processed Render (with UnrealBloom)
    this.composer.render();
  }

  /**
   * Builds high-tech Companion Drone model
   */
  private buildDroneModel(): THREE.Group {
    const grp = new THREE.Group();
    const coreGeo = new THREE.SphereGeometry(3.5, 12, 12);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    grp.add(core);

    const eyeGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(0, 0, 3);
    grp.add(eye);

    // Quad rotors
    for (let r = 0; r < 4; r++) {
      const angle = (r / 4) * Math.PI * 2;
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 7), coreMat);
      arm.rotateZ(Math.PI / 2);
      arm.position.set(Math.cos(angle) * 4.5, 0, Math.sin(angle) * 4.5);
      arm.rotation.y = angle;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2, 0.3, 6, 12), eyeMat);
      ring.position.set(Math.cos(angle) * 7.5, 0, Math.sin(angle) * 7.5);
      ring.rotateX(Math.PI / 2);
      grp.add(arm, ring);
    }
    return grp;
  }

  public destroy() {
    this.scene.clear();
    this.renderer.dispose();
  }
}
