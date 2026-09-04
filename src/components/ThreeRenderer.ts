import * as THREE from 'three';
import { 
  PlayerStats, Weapon, Zombie, Bullet, Particle, 
  DropItem, ActiveTurret, Obstacle, ActiveBuffs, 
  MapEnvironmentId, BossHazard, SweepingLaser, TentacleHook 
} from '../types/game';
import { MAP_SIZE } from '../utils/constants';
import { ActiveDroneState, CompanionDroneConfig } from '../data/drones';

export type CameraViewMode = 'isometric' | 'topdown' | 'action';

export class ThreeRenderer {
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public raycaster: THREE.Raycaster;
  public groundPlane: THREE.Plane;

  public cameraMode: CameraViewMode = 'isometric';
  public width: number = 800;
  public height: number = 600;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private playerFlashlight: THREE.SpotLight;
  private playerFlashlightTarget: THREE.Object3D;
  private muzzleFlashLight: THREE.PointLight;

  // Environment & Ground
  private groundMesh: THREE.Mesh;
  private helipadGroup: THREE.Group;
  private backgroundCityGroup: THREE.Group;
  private boundaryGroup: THREE.Group;
  private obstaclesGroup: THREE.Group;

  // Player & Companions
  private playerGroup: THREE.Group;
  private playerBody: THREE.Mesh;
  private playerHead: THREE.Mesh;
  private playerVisor: THREE.Mesh;
  private playerArmor: THREE.Mesh;
  private playerLeftLeg: THREE.Mesh;
  private playerRightLeg: THREE.Mesh;
  private playerLeftArm: THREE.Mesh;
  private playerRightArm: THREE.Mesh;
  private playerWeaponGroup: THREE.Group;
  private playerShieldMesh: THREE.Mesh;
  private dronesMap: Map<string, THREE.Group> = new Map();

  // Entities Maps
  private zombiesMap: Map<string, THREE.Group> = new Map();
  private bulletsMap: Map<string, THREE.Mesh> = new Map();
  private dropsMap: Map<string, THREE.Group> = new Map();
  private turretsMap: Map<string, THREE.Group> = new Map();
  private bossHazardsMap: Map<string, THREE.Mesh> = new Map();
  private lasersGroup: THREE.Group;

  // Particle System
  private particleGeo: THREE.BufferGeometry;
  private particleMat: THREE.PointsMaterial;
  private particlePoints: THREE.Points;
  private particlePositions: Float32Array;
  private particleColors: Float32Array;
  private max3DParticles = 600;

  // Current map tracking
  private currentMapId: MapEnvironmentId = 'rooftop';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.clientWidth || window.innerWidth;
    this.height = canvas.clientHeight || window.innerHeight;

    // 1. WebGL Renderer
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
    this.renderer.toneMappingExposure = 1.15;

    // 2. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#030712');
    this.scene.fog = new THREE.FogExp2('#030712', 0.0012);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 4000);
    this.setCameraView('isometric');

    // 4. Raycaster & Ground Math Plane
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // 5. Lights
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    this.dirLight.position.set(400, 700, 300);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 50;
    this.dirLight.shadow.camera.far = 1600;
    const d = 500;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    // Tactical Flashlight attached to player
    this.playerFlashlightTarget = new THREE.Object3D();
    this.scene.add(this.playerFlashlightTarget);

    this.playerFlashlight = new THREE.SpotLight(0xfff7ed, 3.5, 420, Math.PI * 0.22, 0.45, 1.2);
    this.playerFlashlight.castShadow = true;
    this.playerFlashlight.shadow.mapSize.width = 1024;
    this.playerFlashlight.shadow.mapSize.height = 1024;
    this.playerFlashlight.target = this.playerFlashlightTarget;
    this.scene.add(this.playerFlashlight);

    // Muzzle flash point light
    this.muzzleFlashLight = new THREE.PointLight(0xf59e0b, 0, 120);
    this.scene.add(this.muzzleFlashLight);

    // 6. Ground & Environment
    const groundGeo = new THREE.PlaneGeometry(MAP_SIZE.width, MAP_SIZE.height, 48, 48);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.2
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.position.set(MAP_SIZE.width / 2, -0.5, MAP_SIZE.height / 2);
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    this.helipadGroup = new THREE.Group();
    this.build3DHelipad();
    this.scene.add(this.helipadGroup);

    this.backgroundCityGroup = new THREE.Group();
    this.buildCitySkyline();
    this.scene.add(this.backgroundCityGroup);

    this.boundaryGroup = new THREE.Group();
    this.buildPerimeterBarriers();
    this.scene.add(this.boundaryGroup);

    this.obstaclesGroup = new THREE.Group();
    this.scene.add(this.obstaclesGroup);

    // 7. Player 3D Mesh
    this.playerGroup = new THREE.Group();
    const { body, head, visor, armor, leftLeg, rightLeg, leftArm, rightArm, weaponGroup, shield } = this.buildPlayerModel();
    this.playerBody = body;
    this.playerHead = head;
    this.playerVisor = visor;
    this.playerArmor = armor;
    this.playerLeftLeg = leftLeg;
    this.playerRightLeg = rightLeg;
    this.playerLeftArm = leftArm;
    this.playerRightArm = rightArm;
    this.playerWeaponGroup = weaponGroup;
    this.playerShieldMesh = shield;
    this.scene.add(this.playerGroup);

    // 8. Laser Beams Group
    this.lasersGroup = new THREE.Group();
    this.scene.add(this.lasersGroup);

    // 9. Particle Points System
    this.particlePositions = new Float32Array(this.max3DParticles * 3);
    this.particleColors = new Float32Array(this.max3DParticles * 3);
    this.particleGeo = new THREE.BufferGeometry();
    this.particleGeo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
    this.particleGeo.setAttribute('color', new THREE.BufferAttribute(this.particleColors, 3));
    this.particleMat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.particlePoints = new THREE.Points(this.particleGeo, this.particleMat);
    this.scene.add(this.particlePoints);
  }

  // --- CAMERA MODES ---
  public setCameraView(mode: CameraViewMode) {
    this.cameraMode = mode;
  }

  // --- 3D ENVIRONMENT BUILDERS ---
  private build3DHelipad() {
    const cx = MAP_SIZE.width / 2;
    const cz = MAP_SIZE.height / 2;

    // Helipad elevated concrete foundation
    const padGeo = new THREE.CylinderGeometry(150, 154, 4, 36);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.75,
      metalness: 0.25
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(cx, 1.5, cz);
    padMesh.receiveShadow = true;
    this.helipadGroup.add(padMesh);

    // Outer Yellow Ring
    const ringGeo = new THREE.RingGeometry(130, 138, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x854d0e,
      roughness: 0.5,
      metalness: 0.3
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(cx, 3.6, cz);
    ringMesh.receiveShadow = true;
    this.helipadGroup.add(ringMesh);

    // Inner Dashed Ring
    const innerRingGeo = new THREE.RingGeometry(86, 92, 32);
    innerRingGeo.rotateX(-Math.PI / 2);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.5
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRingMesh.position.set(cx, 3.65, cz);
    this.helipadGroup.add(innerRingMesh);

    // Letter 'H' in center of Helipad
    const hMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0x713f12,
      roughness: 0.4
    });
    // Left bar
    const barLeft = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 70), hMat);
    barLeft.position.set(cx - 24, 3.7, cz);
    this.helipadGroup.add(barLeft);
    // Right bar
    const barRight = new THREE.Mesh(new THREE.BoxGeometry(10, 2, 70), hMat);
    barRight.position.set(cx + 24, 3.7, cz);
    this.helipadGroup.add(barRight);
    // Center bar
    const barMid = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 12), hMat);
    barMid.position.set(cx, 3.7, cz);
    this.helipadGroup.add(barMid);

    // 4 Perimeter Helipad Warning Beacon Lights
    const beaconLightColors = [0xef4444, 0xef4444, 0xef4444, 0xef4444];
    const beaconAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    beaconAngles.forEach((angle, idx) => {
      const bx = cx + Math.cos(angle) * 145;
      const bz = cz + Math.sin(angle) * 145;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 })
      );
      pole.position.set(bx, 6, bz);
      pole.castShadow = true;
      this.helipadGroup.add(pole);

      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(2.5, 12, 12),
        new THREE.MeshStandardMaterial({
          color: beaconLightColors[idx],
          emissive: beaconLightColors[idx],
          emissiveIntensity: 1.2
        })
      );
      lamp.position.set(bx, 13, bz);
      this.helipadGroup.add(lamp);
    });
  }

  private buildCitySkyline() {
    // Distant 3D skyscrapers silhouette around the rooftop
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.9,
      metalness: 0.1
    });
    const windowMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const count = 36;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 1450 + Math.random() * 350;
      const bx = MAP_SIZE.width / 2 + Math.cos(angle) * dist;
      const bz = MAP_SIZE.height / 2 + Math.sin(angle) * dist;
      const bW = 120 + Math.random() * 160;
      const bD = 120 + Math.random() * 160;
      const bH = 300 + Math.random() * 650;

      const tower = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), buildingMat);
      tower.position.set(bx, bH / 2 - 200, bz);
      this.backgroundCityGroup.add(tower);

      // Add a red aircraft beacon atop tall buildings
      if (bH > 600) {
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(3, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        beacon.position.set(bx, bH - 195, bz);
        this.backgroundCityGroup.add(beacon);
      }
    }
  }

  private buildPerimeterBarriers() {
    // Industrial safety guardrails along the map borders
    const fenceMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.4,
      roughness: 0.4
    });

    const w = MAP_SIZE.width;
    const h = MAP_SIZE.height;
    const segments = 24;

    // Top & Bottom Rails
    for (let i = 0; i < segments; i++) {
      const x = (i / segments) * w + (w / segments) / 2;
      // Top
      const postTop = new THREE.Mesh(new THREE.BoxGeometry(4, 26, 4), fenceMat);
      postTop.position.set(x, 13, 20);
      postTop.castShadow = true;
      this.boundaryGroup.add(postTop);

      const railTop = new THREE.Mesh(new THREE.BoxGeometry(w / segments, 4, 3), railMat);
      railTop.position.set(x, 22, 20);
      this.boundaryGroup.add(railTop);

      // Bottom
      const postBot = new THREE.Mesh(new THREE.BoxGeometry(4, 26, 4), fenceMat);
      postBot.position.set(x, 13, h - 20);
      postBot.castShadow = true;
      this.boundaryGroup.add(postBot);

      const railBot = new THREE.Mesh(new THREE.BoxGeometry(w / segments, 4, 3), railMat);
      railBot.position.set(x, 22, h - 20);
      this.boundaryGroup.add(railBot);
    }
  }

  // --- PLAYER 3D MODEL BUILDER ---
  private buildPlayerModel() {
    // Humanoid tactical soldier
    // Body / Torso
    const bodyGeo = new THREE.CylinderGeometry(7, 6, 16, 12);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.4
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 18;
    body.castShadow = true;
    this.playerGroup.add(body);

    // Armor Vest
    const armorGeo = new THREE.BoxGeometry(16, 13, 11);
    const armorMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.6
    });
    const armor = new THREE.Mesh(armorGeo, armorMat);
    armor.position.y = 19;
    armor.castShadow = true;
    this.playerGroup.add(armor);

    // Head with Tactical Helmet
    const headGeo = new THREE.SphereGeometry(5.2, 14, 14);
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7
    });
    const head = new THREE.Mesh(headGeo, helmetMat);
    head.position.y = 29;
    head.castShadow = true;
    this.playerGroup.add(head);

    // Visor / NVG Goggles (Glowing Cyan / Green)
    const visorGeo = new THREE.BoxGeometry(7.2, 2.8, 3.8);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.5,
      roughness: 0.1
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 29.5, 4.2);
    this.playerGroup.add(visor);

    // Legs
    const legGeo = new THREE.CylinderGeometry(2.4, 2.2, 13, 10);
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7
    });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-4.5, 6.5, 0);
    leftLeg.castShadow = true;
    this.playerGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(4.5, 6.5, 0);
    rightLeg.castShadow = true;
    this.playerGroup.add(rightLeg);

    // Arms
    const armGeo = new THREE.CylinderGeometry(2.2, 2.0, 12, 10);
    const armMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6
    });
    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-9, 18, 4);
    leftArm.rotation.x = Math.PI / 3;
    leftArm.castShadow = true;
    this.playerGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(9, 18, 4);
    rightArm.rotation.x = Math.PI / 3;
    rightArm.castShadow = true;
    this.playerGroup.add(rightArm);

    // 3D Weapon Group (Attached in hands)
    const weaponGroup = new THREE.Group();
    weaponGroup.position.set(3, 17, 12);
    const gunBody = new THREE.Mesh(
      new THREE.BoxGeometry(4, 5, 20),
      new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.85, roughness: 0.2 })
    );
    gunBody.castShadow = true;
    weaponGroup.add(gunBody);

    const gunBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.9, roughness: 0.1 })
    );
    gunBarrel.rotation.x = Math.PI / 2;
    gunBarrel.position.set(0, 1, 14);
    gunBarrel.castShadow = true;
    weaponGroup.add(gunBarrel);

    // Tactical Laser Sight emitter line
    const laserLineGeo = new THREE.CylinderGeometry(0.3, 0.3, 300, 6);
    laserLineGeo.rotateX(Math.PI / 2);
    const laserLineMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.65
    });
    const laserLine = new THREE.Mesh(laserLineGeo, laserLineMat);
    laserLine.position.set(0, 1, 160);
    weaponGroup.add(laserLine);

    this.playerGroup.add(weaponGroup);

    // Energy Shield Dome (Active when shield buff is on)
    const shieldGeo = new THREE.SphereGeometry(22, 24, 24);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0,
      wireframe: true
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.y = 18;
    this.playerGroup.add(shield);

    return { body, head, visor, armor, leftLeg, rightLeg, leftArm, rightArm, weaponGroup, shield };
  }

  // --- ZOMBIE 3D MODEL BUILDER ---
  private getOrCreateZombieGroup(z: Zombie): THREE.Group {
    let grp = this.zombiesMap.get(z.id);
    if (grp) return grp;

    grp = new THREE.Group();
    const isBoss = Boolean(z.isBoss);
    const scale = isBoss ? (z.radius > 45 ? 2.6 : 2.0) : (z.type === 'tank' ? 1.4 : z.type === 'runner' ? 0.9 : 1.1);

    const skinColor = isBoss ? 0x7f1d1d : z.type === 'spitter' ? 0x15803d : z.type === 'tank' ? 0x374151 : 0x166534;
    const eyeColor = isBoss ? 0xfacc15 : z.type === 'spitter' ? 0x4ade80 : 0xef4444;

    // Torso / Hunched spine
    const torsoGeo = new THREE.CylinderGeometry(6 * scale, 5 * scale, 15 * scale, 10);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.8,
      metalness: 0.1
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 16 * scale;
    torso.rotation.x = Math.PI * 0.15; // Hunched posture
    torso.castShadow = true;
    grp.add(torso);

    // Head
    const headGeo = new THREE.SphereGeometry(4.8 * scale, 12, 12);
    const headMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: 0.75
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 26 * scale, 4 * scale);
    head.castShadow = true;
    grp.add(head);

    // Glowing Menacing Eyes
    const eyeGeo = new THREE.SphereGeometry(1.1 * scale, 6, 6);
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-1.8 * scale, 26.5 * scale, 8 * scale);
    grp.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(1.8 * scale, 26.5 * scale, 8 * scale);
    grp.add(rightEye);

    // Flailing Claws / Outstretched Arms
    const armGeo = new THREE.CylinderGeometry(1.8 * scale, 1.5 * scale, 13 * scale, 8);
    const armMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });

    const leftArm = new THREE.Mesh(armGeo, armMat);
    leftArm.position.set(-8 * scale, 18 * scale, 7 * scale);
    leftArm.rotation.x = Math.PI * 0.45;
    leftArm.rotation.z = Math.PI * 0.1;
    leftArm.castShadow = true;
    grp.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, armMat);
    rightArm.position.set(8 * scale, 18 * scale, 7 * scale);
    rightArm.rotation.x = Math.PI * 0.45;
    rightArm.rotation.z = -Math.PI * 0.1;
    rightArm.castShadow = true;
    grp.add(rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(2.0 * scale, 1.8 * scale, 12 * scale, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const leftLeg = new THREE.Mesh(legGeo, legMat);
    leftLeg.position.set(-3.5 * scale, 6 * scale, 0);
    leftLeg.castShadow = true;
    grp.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, legMat);
    rightLeg.position.set(3.5 * scale, 6 * scale, 0);
    rightLeg.castShadow = true;
    grp.add(rightLeg);

    // Boss Spikes & Core
    if (isBoss) {
      const spikeMat = new THREE.MeshStandardMaterial({
        color: 0x991b1b,
        emissive: 0xef4444,
        emissiveIntensity: 0.6,
        roughness: 0.4
      });
      for (let s = 0; s < 4; s++) {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(2.5 * scale, 14 * scale, 6), spikeMat);
        spike.position.set((s % 2 === 0 ? -1 : 1) * 9 * scale, 22 * scale + (s > 1 ? 6 : 0), -4 * scale);
        spike.rotation.x = -Math.PI * 0.35;
        spike.rotation.z = (s % 2 === 0 ? -1 : 1) * 0.4;
        grp.add(spike);
      }
    }

    this.scene.add(grp);
    this.zombiesMap.set(z.id, grp);
    return grp;
  }

  // --- DROP ITEMS 3D BUILDER ---
  private getOrCreateDropGroup(d: DropItem): THREE.Group {
    let grp = this.dropsMap.get(d.id);
    if (grp) return grp;

    grp = new THREE.Group();
    if (d.type === 'gold_coin') {
      // Golden Coin
      const coin = new THREE.Mesh(
        new THREE.CylinderGeometry(5, 5, 1.5, 16),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0x854d0e,
          metalness: 0.9,
          roughness: 0.15
        })
      );
      coin.rotation.x = Math.PI / 2;
      grp.add(coin);
    } else if (d.type === 'gold_ingot') {
      // Gold Ingot
      const ingot = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 6),
        new THREE.MeshStandardMaterial({
          color: 0xfde047,
          emissive: 0xa16207,
          metalness: 0.95,
          roughness: 0.1
        })
      );
      grp.add(ingot);
    } else if (d.type === 'diamond_gem') {
      // Sparkling Blue Diamond
      const gem = new THREE.Mesh(
        new THREE.OctahedronGeometry(6, 0),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 1.2,
          metalness: 0.2,
          roughness: 0.1
        })
      );
      grp.add(gem);
    } else if (d.type === 'boss_chest') {
      // Epic Golden Boss Chest
      const chestBase = new THREE.Mesh(
        new THREE.BoxGeometry(14, 8, 10),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5, metalness: 0.4 })
      );
      chestBase.position.y = 4;
      grp.add(chestBase);

      const chestLid = new THREE.Mesh(
        new THREE.CylinderGeometry(5.2, 5.2, 14, 16, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xb45309, metalness: 0.8, roughness: 0.2 })
      );
      chestLid.rotation.z = Math.PI / 2;
      chestLid.position.y = 8;
      grp.add(chestLid);
    } else if (d.type === 'medkit') {
      // Medkit Box with Red Cross
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(9, 7, 5),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 })
      );
      box.position.y = 3.5;
      grp.add(box);
      const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(5, 1.5, 5.2),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      crossH.position.y = 3.5;
      grp.add(crossH);
      const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 5, 5.2),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      crossV.position.y = 3.5;
      grp.add(crossV);
    } else {
      // Ammo Box
      const ammo = new THREE.Mesh(
        new THREE.BoxGeometry(8, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0x15803d, metalness: 0.6, roughness: 0.4 })
      );
      ammo.position.y = 3;
      grp.add(ammo);
    }

    this.scene.add(grp);
    this.dropsMap.set(d.id, grp);
    return grp;
  }

  // --- COMPANION DRONES 3D BUILDER ---
  private getOrCreateDroneGroup(id: string, colorHex: string): THREE.Group {
    let grp = this.dronesMap.get(id);
    if (grp) return grp;

    grp = new THREE.Group();
    // Drone central orb
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(4.5, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 })
    );
    grp.add(orb);

    // Glowing Ring
    const col = parseInt(colorHex.replace('#', '0x')) || 0x38bdf8;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(6.5, 0.9, 8, 20),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2;
    grp.add(ring);

    this.scene.add(grp);
    this.dronesMap.set(id, grp);
    return grp;
  }

  // --- OBSTACLES BUILDER ---
  public syncObstacles(obstacles: Obstacle[]) {
    // Clear and build 3D obstacles
    while (this.obstaclesGroup.children.length > 0) {
      const obj = this.obstaclesGroup.children[0];
      this.obstaclesGroup.remove(obj);
    }

    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.6,
      metalness: 0.4
    });
    const sandbagMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.95
    });
    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.5,
      metalness: 0.5
    });

    obstacles.forEach(obs => {
      let mesh: THREE.Mesh;
      if (obs.type === 'crate' || obs.type === 'vehicle' || obs.type === 'server' || obs.type === 'barrier') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 36, obs.height), containerMat);
        mesh.position.set(obs.x + obs.width / 2, 18, obs.y + obs.height / 2);
      } else if (obs.type === 'sandbag') {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 16, obs.height), sandbagMat);
        mesh.position.set(obs.x + obs.width / 2, 8, obs.y + obs.height / 2);
      } else if (obs.type === 'barrel') {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(obs.width / 2, obs.width / 2, 24, 14), barrelMat);
        mesh.position.set(obs.x + obs.width / 2, 12, obs.y + obs.height / 2);
      } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(obs.width, 24, obs.height), containerMat);
        mesh.position.set(obs.x + obs.width / 2, 12, obs.y + obs.height / 2);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.obstaclesGroup.add(mesh);
    });
  }

  // --- MAP ENVIRONMENT THEME UPDATE ---
  public setMapEnvironment(mapId: MapEnvironmentId) {
    if (this.currentMapId === mapId) return;
    this.currentMapId = mapId;

    if (mapId === 'street') {
      this.scene.background = new THREE.Color('#0a0a0a');
      this.scene.fog = new THREE.FogExp2('#0a0a0a', 0.0014);
      this.ambientLight.color.set(0xf59e0b);
      this.ambientLight.intensity = 0.35;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(0x18181b);
    } else if (mapId === 'bunker') {
      this.scene.background = new THREE.Color('#022c22');
      this.scene.fog = new THREE.FogExp2('#022c22', 0.0015);
      this.ambientLight.color.set(0x10b981);
      this.ambientLight.intensity = 0.4;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(0x064e3b);
    } else if (mapId === 'hospital') {
      this.scene.background = new THREE.Color('#1a0505');
      this.scene.fog = new THREE.FogExp2('#1a0505', 0.0016);
      this.ambientLight.color.set(0xef4444);
      this.ambientLight.intensity = 0.4;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(0x2d0606);
    } else {
      // Rooftop (Default)
      this.scene.background = new THREE.Color('#030712');
      this.scene.fog = new THREE.FogExp2('#030712', 0.0012);
      this.ambientLight.color.set(0x38bdf8);
      this.ambientLight.intensity = 0.45;
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.set(0x111827);
    }
  }

  // --- RAYCASTING SCREEN -> 3D GROUND PLANE ---
  public getGroundIntersection(screenX: number, screenY: number): { x: number; y: number } | null {
    const rect = this.canvas.getBoundingClientRect();
    const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -(((screenY - rect.top) / rect.height) * 2 - 1);

    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const target = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(this.groundPlane, target);
    if (hit) {
      return { x: target.x, y: target.z };
    }
    return null;
  }

  // --- MAIN 3D RENDER LOOP ---
  public update(
    gameState: {
      player: PlayerStats;
      currentWeapon: Weapon;
      zombies: Zombie[];
      bullets: Bullet[];
      particles: Particle[];
      drops: DropItem[];
      turrets?: ActiveTurret[];
      activeDrones?: ActiveDroneState[];
      laserBeams?: Array<any>;
      bossHazards?: BossHazard[];
      activeBuffs: ActiveBuffs;
      currentMapId: MapEnvironmentId;
      screenShake: number;
    },
    currentTime: number,
    isFiring: boolean
  ) {
    const { player: p, currentWeapon: wep } = gameState;

    // 1. Update Map Theme
    this.setMapEnvironment(gameState.currentMapId);

    // 2. Update Player 3D Position & Rotation
    this.playerGroup.position.set(p.x, 0, p.y);
    this.playerGroup.rotation.y = -p.angle;

    // Tactical Flashlight update
    this.playerFlashlight.position.set(p.x, 22, p.y);
    const targetDist = 200;
    this.playerFlashlightTarget.position.set(
      p.x + Math.cos(p.angle) * targetDist,
      5,
      p.y + Math.sin(p.angle) * targetDist
    );

    // Directional shadow-casting light tracks player
    this.dirLight.position.set(p.x + 350, 650, p.y + 250);
    this.dirLight.target.position.set(p.x, 0, p.y);
    this.dirLight.target.updateMatrixWorld();

    // Player walking leg animation
    const isMoving = p.speed > 0.5 && (Math.abs(p.walkFrame || 0) > 0.05);
    const legSwing = Math.sin((p.walkFrame || 0) * 1.5) * 0.45;
    this.playerLeftLeg.rotation.x = legSwing;
    this.playerRightLeg.rotation.x = -legSwing;

    // Player shield visual
    const shieldActive = gameState.activeBuffs.shieldTimer > 0;
    const shieldMat = this.playerShieldMesh.material as THREE.MeshStandardMaterial;
    shieldMat.opacity = shieldActive ? 0.45 + Math.sin(currentTime / 120) * 0.15 : 0;
    if (shieldActive) {
      this.playerShieldMesh.rotation.y += 0.04;
    }

    // Muzzle flash
    if (isFiring) {
      this.muzzleFlashLight.intensity = 4.5;
      this.muzzleFlashLight.position.set(
        p.x + Math.cos(p.angle) * 35,
        18,
        p.y + Math.sin(p.angle) * 35
      );
    } else {
      this.muzzleFlashLight.intensity = Math.max(0, this.muzzleFlashLight.intensity - 0.5);
    }

    // 3. Update Camera smoothly tracking player
    const shakeOffset = gameState.screenShake > 0 ? (Math.random() - 0.5) * gameState.screenShake * 1.5 : 0;
    if (this.cameraMode === 'isometric') {
      // 50° Angled Cinematic Isometric View
      const camDistZ = 340;
      const camHeight = 380;
      this.camera.position.set(p.x + shakeOffset, camHeight, p.y + camDistZ);
      this.camera.lookAt(p.x, 15, p.y);
    } else if (this.cameraMode === 'topdown') {
      // Steep Tactical Top-down
      this.camera.position.set(p.x + shakeOffset, 550, p.y + 80);
      this.camera.lookAt(p.x, 0, p.y);
    } else {
      // Action Over-the-Shoulder / Close Cam
      const camDistZ = 220;
      const camHeight = 240;
      this.camera.position.set(p.x + shakeOffset, camHeight, p.y + camDistZ);
      this.camera.lookAt(p.x, 18, p.y - 20);
    }

    // 4. Update Companion Drones
    const activeDroneIds = new Set<string>();
    gameState.activeDrones.forEach(d => {
      activeDroneIds.add(d.id);
      const droneGrp = this.getOrCreateDroneGroup(d.id, '#38bdf8');
      const hoverBob = Math.sin((currentTime / 220) + (d.hoverOffset || 0)) * 4;
      droneGrp.position.set(d.x, 26 + hoverBob, d.y);
      droneGrp.rotation.y += 0.05;
    });
    // Remove inactive drones
    for (const [id, grp] of this.dronesMap.entries()) {
      if (!activeDroneIds.has(id)) {
        this.scene.remove(grp);
        this.dronesMap.delete(id);
      }
    }

    // 5. Update Zombies & Bosses
    const activeZombieIds = new Set<string>();
    gameState.zombies.forEach(z => {
      activeZombieIds.add(z.id);
      const zGrp = this.getOrCreateZombieGroup(z);
      zGrp.position.set(z.x, 0, z.y);
      zGrp.rotation.y = -z.angle;

      // Zombie walking shamble / bobbing animation
      const shambleBob = Math.sin(currentTime * 0.008 + (z.x * 0.05)) * 2.2;
      zGrp.position.y = Math.max(0, shambleBob);

      // Boss aura pulse
      if (z.isBoss) {
        zGrp.rotation.y += Math.sin(currentTime * 0.005) * 0.02;
      }
    });
    // Remove dead zombies
    for (const [id, grp] of this.zombiesMap.entries()) {
      if (!activeZombieIds.has(id)) {
        this.scene.remove(grp);
        this.zombiesMap.delete(id);
      }
    }

    // 6. Update Bullets
    const activeBulletIds = new Set<string>();
    gameState.bullets.forEach((b, idx) => {
      const bId = `b_${idx}`;
      activeBulletIds.add(bId);
      let bMesh = this.bulletsMap.get(bId);
      if (!bMesh) {
        const bulletColor = parseInt(b.color.replace('#', '0x')) || 0xfacc15;
        bMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(b.radius * 0.9, b.radius * 0.9, b.radius * 5, 8),
          new THREE.MeshBasicMaterial({ color: bulletColor })
        );
        bMesh.rotation.x = Math.PI / 2;
        this.scene.add(bMesh);
        this.bulletsMap.set(bId, bMesh);
      }
      bMesh.position.set(b.x, 16, b.y);
      const bulletAngle = Math.atan2(b.vy, b.vx);
      bMesh.rotation.z = -bulletAngle + Math.PI / 2;
    });
    for (const [id, mesh] of this.bulletsMap.entries()) {
      if (!activeBulletIds.has(id)) {
        this.scene.remove(mesh);
        this.bulletsMap.delete(id);
      }
    }

    // 7. Update Drops
    const activeDropIds = new Set<string>();
    gameState.drops.forEach(d => {
      activeDropIds.add(d.id);
      const dGrp = this.getOrCreateDropGroup(d);
      const bounce = (d.bounceZ || 0) * 0.5;
      const hover = Math.sin(currentTime * 0.005 + (d.pulse || 0)) * 3;
      dGrp.position.set(d.x, 4 + bounce + hover, d.y);
      dGrp.rotation.y += 0.04;
    });
    for (const [id, grp] of this.dropsMap.entries()) {
      if (!activeDropIds.has(id)) {
        this.scene.remove(grp);
        this.dropsMap.delete(id);
      }
    }

    // 8. Update 3D Particles
    const pCount = Math.min(gameState.particles.length, this.max3DParticles);
    for (let i = 0; i < pCount; i++) {
      const pt = gameState.particles[i];
      this.particlePositions[i * 3] = pt.x;
      this.particlePositions[i * 3 + 1] = 10 + (pt.radius || 2);
      this.particlePositions[i * 3 + 2] = pt.y;

      const c = new THREE.Color(pt.color);
      this.particleColors[i * 3] = c.r;
      this.particleColors[i * 3 + 1] = c.g;
      this.particleColors[i * 3 + 2] = c.b;
    }
    // Zero out remaining points
    for (let i = pCount; i < this.max3DParticles; i++) {
      this.particlePositions[i * 3 + 1] = -1000;
    }
    this.particleGeo.attributes.position.needsUpdate = true;
    this.particleGeo.attributes.color.needsUpdate = true;

    // 9. Render the 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  // --- SCREEN PROJECTION ---
  public projectToScreen(worldX: number, worldY: number, heightY: number = 0): { x: number; y: number } {
    const v = new THREE.Vector3(worldX, heightY, worldY);
    v.project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * this.width,
      y: (-(v.y * 0.5) + 0.5) * this.height
    };
  }

  // --- RESIZE ---
  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  // --- CLEANUP ---
  public destroy() {
    this.renderer.dispose();
  }
}
