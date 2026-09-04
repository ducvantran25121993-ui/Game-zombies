import * as THREE from 'three';
import { Zombie, WeaponType } from '../../types/game';

// Reusable standard materials for maximum performance
const commandoMats = {
  skin: new THREE.MeshStandardMaterial({ color: 0xc49a7a, roughness: 0.8 }),
  balaclava: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 }),
  helmet: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6, metalness: 0.3 }),
  nvgHousing: new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5, metalness: 0.7 }),
  nvgLenses: new THREE.MeshBasicMaterial({ color: 0x10b981 }), // glowing night vision emerald green
  vest: new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.85 }),
  pouches: new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.8 }),
  fatigues: new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }),
  gloves: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7 }),
  boots: new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 }),
  kneepads: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.4 }),
  weaponMetal: new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.85, roughness: 0.3 }),
  weaponSight: new THREE.MeshBasicMaterial({ color: 0xef4444 }) // holographic red dot
};

export interface CommandoRig {
  rootGroup: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  weaponGroup: THREE.Group;
  muzzleMarker: THREE.Object3D;
  animate: (isMoving: boolean, animTime: number, isFiring: boolean) => void;
}

/**
 * Builds the high-detail Dark Tactical Commando Operator
 */
export function createCommandoModel(): CommandoRig {
  const rootGroup = new THREE.Group();

  // Pelvis / Hips
  const pelvis = new THREE.Mesh(
    new THREE.BoxGeometry(10, 6, 8),
    commandoMats.fatigues
  );
  pelvis.position.y = 19;
  pelvis.castShadow = true;
  rootGroup.add(pelvis);

  // Torso / Ballistic Vest Group
  const torso = new THREE.Group();
  torso.position.set(0, 3, 0);
  pelvis.add(torso);

  // Heavy Ballistic Chest Rig
  const chestMesh = new THREE.Mesh(
    new THREE.BoxGeometry(13, 14, 9),
    commandoMats.vest
  );
  chestMesh.position.y = 7;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  // Ammo Pouches & Tactical Chest Harness
  const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5, 2.5), commandoMats.pouches);
  pouch1.position.set(-3.5, 4.5, 5.2);
  const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5, 2.5), commandoMats.pouches);
  pouch2.position.set(0.5, 4.5, 5.2);
  const pouch3 = new THREE.Mesh(new THREE.BoxGeometry(3.5, 5, 2.5), commandoMats.pouches);
  pouch3.position.set(4.5, 4.5, 5.2);
  torso.add(pouch1, pouch2, pouch3);

  // Tactical Radio & Antenna on Back
  const radio = new THREE.Mesh(new THREE.BoxGeometry(4, 7, 3), commandoMats.pouches);
  radio.position.set(-4.5, 8, -5.2);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 12), commandoMats.weaponMetal);
  antenna.position.set(-4.5, 16, -5.2);
  torso.add(radio, antenna);

  // Combat Knife on Shoulder Strap
  const knifeHandle = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4, 1.2), commandoMats.balaclava);
  knifeHandle.position.set(4.8, 11, 4.8);
  torso.add(knifeHandle);

  // Head Group
  const head = new THREE.Group();
  head.position.set(0, 15, 0);
  torso.add(head);

  // Balaclava Head Base
  const headBase = new THREE.Mesh(
    new THREE.SphereGeometry(4.2, 16, 16),
    commandoMats.balaclava
  );
  headBase.position.y = 2;
  headBase.castShadow = true;
  head.add(headBase);

  // High-Cut Ballistic Ops-Core FAST Helmet
  const helmet = new THREE.Mesh(
    new THREE.SphereGeometry(4.8, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
    commandoMats.helmet
  );
  helmet.position.y = 2.4;
  helmet.castShadow = true;
  head.add(helmet);

  // Quad-Tube Night Vision Goggles (GPNVG-18)
  const nvgGroup = new THREE.Group();
  nvgGroup.position.set(0, 3.2, 4.5);
  const nvgMount = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 1.8), commandoMats.nvgHousing);
  nvgGroup.add(nvgMount);

  // 4 Quad Tube Lenses glowing green
  for (let i = -1.5; i <= 1.5; i += 1.0) {
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.5, 8), commandoMats.nvgHousing);
    tube.rotateX(Math.PI / 2);
    tube.position.set(i * 1.8, 0, 1.2);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.7, 8), commandoMats.nvgLenses);
    lens.position.set(i * 1.8, 0, 2.5);
    nvgGroup.add(tube, lens);
  }
  head.add(nvgGroup);

  // Headset Ear Cups
  const leftEar = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.8, 8), commandoMats.nvgHousing);
  leftEar.rotateZ(Math.PI / 2);
  leftEar.position.set(-4.5, 2.2, 0);
  const rightEar = leftEar.clone();
  rightEar.position.x = 4.5;
  head.add(leftEar, rightEar);

  // Arm & Weapon Rigs
  const rightArm = new THREE.Group();
  rightArm.position.set(7.5, 13, 0);
  torso.add(rightArm);

  const leftArm = new THREE.Group();
  leftArm.position.set(-7.5, 13, 0);
  torso.add(leftArm);

  // Upper & Lower Arms
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.6, 7, 8), commandoMats.fatigues);
  rightUpperArm.position.y = -3.5;
  rightArm.add(rightUpperArm);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.6, 7, 8), commandoMats.fatigues);
  leftUpperArm.position.y = -3.5;
  leftArm.add(leftUpperArm);

  // Tactical Modular Assault Rifle
  const weaponGroup = new THREE.Group();
  weaponGroup.position.set(0, -6.5, 3.5);
  rightArm.add(weaponGroup);

  // Rifle Receiver
  const rifleBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.8, 18), commandoMats.weaponMetal);
  rifleBody.castShadow = true;
  weaponGroup.add(rifleBody);

  // Barrel & Tactical Suppressor
  const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 8, 8), commandoMats.weaponMetal);
  suppressor.rotateX(Math.PI / 2);
  suppressor.position.set(0, 0.6, 12);
  weaponGroup.add(suppressor);

  // Holographic Optic Sight
  const optic = new THREE.Mesh(new THREE.BoxGeometry(2, 2.4, 4), commandoMats.weaponMetal);
  optic.position.set(0, 3, -1);
  const redDot = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), commandoMats.weaponSight);
  redDot.position.set(0, 3, 1.1);
  weaponGroup.add(optic, redDot);

  // Curved Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 3.5), commandoMats.weaponMetal);
  mag.position.set(0, -3.8, 1);
  mag.rotateX(0.2);
  weaponGroup.add(mag);

  // Foregrip held by Left Hand
  const foregrip = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 4), commandoMats.weaponMetal);
  foregrip.position.set(0, -2.5, 6.5);
  weaponGroup.add(foregrip);

  // Flashlight Housing on Barrel
  const torchMount = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4), commandoMats.weaponMetal);
  torchMount.rotateX(Math.PI / 2);
  torchMount.position.set(1.4, 1.2, 8);
  weaponGroup.add(torchMount);

  // Muzzle Tip Marker for muzzle flash & volumetric cone
  const muzzleMarker = new THREE.Object3D();
  muzzleMarker.position.set(0, 0.6, 16.5);
  weaponGroup.add(muzzleMarker);

  // Leg Rigs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-3.6, -1, 0);
  pelvis.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(3.6, -1, 0);
  pelvis.add(rightLeg);

  // Upper Thighs
  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.8, 9, 8), commandoMats.fatigues);
  leftThigh.position.y = -4.5;
  leftLeg.add(leftThigh);

  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.8, 9, 8), commandoMats.fatigues);
  rightThigh.position.y = -4.5;
  rightLeg.add(rightThigh);

  // Tactical Knee Pads
  const leftKnee = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 2.5), commandoMats.kneepads);
  leftKnee.position.set(0, -8.5, 1.5);
  leftLeg.add(leftKnee);

  const rightKnee = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 2.5), commandoMats.kneepads);
  rightKnee.position.set(0, -8.5, 1.5);
  rightLeg.add(rightKnee);

  // Combat Boots
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(3.6, 8, 6), commandoMats.boots);
  leftBoot.position.set(0, -14, 0.8);
  leftBoot.castShadow = true;
  leftLeg.add(leftBoot);

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(3.6, 8, 6), commandoMats.boots);
  rightBoot.position.set(0, -14, 0.8);
  rightBoot.castShadow = true;
  rightLeg.add(rightBoot);

  // Drop-Leg Pistol Holster on Right Thigh
  const holster = new THREE.Mesh(new THREE.BoxGeometry(2, 5.5, 3.2), commandoMats.boots);
  holster.position.set(2.6, -4, 0);
  rightLeg.add(holster);

  // Animation controller
  const animate = (isMoving: boolean, animTime: number, isFiring: boolean) => {
    if (isMoving) {
      const walkSpeed = animTime * 0.015;
      const legSwing = Math.sin(walkSpeed) * 0.45;
      leftLeg.rotation.x = legSwing;
      rightLeg.rotation.x = -legSwing;

      // Pelvis subtle bob
      pelvis.position.y = 19 + Math.abs(Math.sin(walkSpeed * 2)) * 1.2;
      torso.rotation.y = Math.sin(walkSpeed) * 0.08;
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      pelvis.position.y = 19;
      torso.rotation.y = 0;
    }

    // Weapon Recoil Kickback
    if (isFiring) {
      weaponGroup.position.z = 2.5;
      torso.rotation.x = -0.05;
    } else {
      weaponGroup.position.z = THREE.MathUtils.lerp(weaponGroup.position.z, 3.5, 0.25);
      torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, 0, 0.25);
    }
  };

  return {
    rootGroup,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    weaponGroup,
    muzzleMarker,
    animate
  };
}

/**
 * Zombie Materials (Gory, Rotting Flesh & Glowing Menacing Eyes)
 */
const zombieMats = {
  decayFlesh: new THREE.MeshStandardMaterial({ color: 0x3d4b3b, roughness: 0.95 }),
  toxicFlesh: new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 }),
  tankFlesh: new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.9, metalness: 0.2 }),
  bossFlesh: new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.85 }),
  clothesRagged: new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 }),
  bloodSplatter: new THREE.MeshBasicMaterial({ color: 0x881337 }),
  eyeGlowYellow: new THREE.MeshBasicMaterial({ color: 0xfde047 }),
  eyeGlowRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  toxicPustule: new THREE.MeshBasicMaterial({ color: 0x4ade80 }),
  boneCarapace: new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.7 })
};

export interface ZombieRig {
  rootGroup: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  animate: (time: number, speedMultiplier: number) => void;
}

/**
 * Builds high-fidelity horrific zombie models matching their specific archetype
 */
export function createZombieModel(z: Zombie): ZombieRig {
  const rootGroup = new THREE.Group();
  const isBoss = Boolean(z.isBoss);
  const type = z.type;

  let fleshMat = zombieMats.decayFlesh;
  let eyeMat = zombieMats.eyeGlowRed;
  let scale = 1.0;

  if (isBoss) {
    fleshMat = zombieMats.bossFlesh;
    eyeMat = zombieMats.eyeGlowYellow;
    scale = z.radius > 45 ? 2.4 : 1.9;
  } else if (type === 'tank') {
    fleshMat = zombieMats.tankFlesh;
    scale = 1.45;
  } else if (type === 'spitter') {
    fleshMat = zombieMats.toxicFlesh;
    eyeMat = zombieMats.toxicPustule;
    scale = 1.05;
  } else if (type === 'runner') {
    fleshMat = zombieMats.decayFlesh;
    scale = 0.9;
  }

  rootGroup.scale.set(scale, scale, scale);

  // Pelvis
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 7), zombieMats.clothesRagged);
  pelvis.position.y = 17;
  pelvis.castShadow = true;
  rootGroup.add(pelvis);

  // Hunched Torso (Forward spine lean for zombie posture)
  const torso = new THREE.Group();
  torso.position.set(0, 2.5, 0);
  torso.rotation.x = isBoss ? 0.2 : (type === 'runner' ? 0.45 : 0.25);
  pelvis.add(torso);

  const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(11, 13, 8), fleshMat);
  torsoMesh.position.y = 6.5;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Exposed Bloody Ribs / Torn Flesh on Torso
  const gorePatch = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 8.4), zombieMats.bloodSplatter);
  gorePatch.position.set(0, 6, 0);
  torso.add(gorePatch);

  // Spitter Toxic Pustules (Glowing green sacs)
  if (type === 'spitter') {
    for (let p = 0; p < 4; p++) {
      const pustule = new THREE.Mesh(new THREE.SphereGeometry(2.2 + p * 0.4, 8, 8), zombieMats.toxicPustule);
      pustule.position.set((p % 2 === 0 ? 3.5 : -3.5), 8 + p * 1.2, -4.5);
      torso.add(pustule);
    }
  }

  // Tank Bone Carapace / Spikes
  if (type === 'tank' || isBoss) {
    for (let s = -4; s <= 4; s += 4) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(2, 6, 5), zombieMats.boneCarapace);
      spike.position.set(s, 13, -3);
      spike.rotateX(-0.5);
      torso.add(spike);
    }
  }

  // Head Group
  const head = new THREE.Group();
  head.position.set(0, 13.5, 2.5);
  torso.add(head);

  // Decayed Skull
  const skull = new THREE.Mesh(new THREE.BoxGeometry(6.5, 7, 7), fleshMat);
  skull.position.y = 3.5;
  skull.castShadow = true;
  head.add(skull);

  // Gaping Maw / Open Jaw
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.5, 4.5), zombieMats.bloodSplatter);
  jaw.position.set(0, 1, 3);
  jaw.rotateX(0.3);
  head.add(jaw);

  // Glowing Sunken Eyes
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), eyeMat);
  eyeL.position.set(-2, 4.2, 3.6);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.8, 6, 6), eyeMat);
  eyeR.position.set(2, 4.2, 3.6);
  head.add(eyeL, eyeR);

  // Arms (Reaching out forward menacingly)
  const leftArm = new THREE.Group();
  leftArm.position.set(-6.5, 11, 0);
  leftArm.rotation.x = -1.1; // reached out
  torso.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(6.5, 11, 0);
  rightArm.rotation.x = -1.2;
  torso.add(rightArm);

  const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 11, 6), fleshMat);
  armMeshL.position.y = -5.5;
  armMeshL.castShadow = true;
  leftArm.add(armMeshL);

  const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 11, 6), fleshMat);
  armMeshR.position.y = -5.5;
  armMeshR.castShadow = true;
  rightArm.add(armMeshR);

  // Claws / Hands dripping with blood
  const clawL = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 2), zombieMats.bloodSplatter);
  clawL.position.set(0, -11.5, 0);
  leftArm.add(clawL);

  const clawR = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.5, 2), zombieMats.bloodSplatter);
  clawR.position.set(0, -11.5, 0);
  rightArm.add(clawR);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-3, 0, 0);
  pelvis.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(3, 0, 0);
  pelvis.add(rightLeg);

  const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.4, 15, 6), zombieMats.clothesRagged);
  legMeshL.position.y = -7.5;
  legMeshL.castShadow = true;
  leftLeg.add(legMeshL);

  const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.4, 15, 6), fleshMat);
  legMeshR.position.y = -7.5;
  legMeshR.castShadow = true;
  rightLeg.add(legMeshR);

  // Animation controller
  const animate = (time: number, speedMultiplier: number) => {
    const cycle = time * 0.012 * speedMultiplier;

    if (type === 'runner') {
      // Rapid predatory sprint
      leftLeg.rotation.x = Math.sin(cycle * 2) * 0.85;
      rightLeg.rotation.x = -Math.sin(cycle * 2) * 0.85;
      leftArm.rotation.x = -1.2 + Math.sin(cycle * 2) * 0.4;
      rightArm.rotation.x = -1.2 - Math.sin(cycle * 2) * 0.4;
      head.rotation.y = Math.sin(cycle * 4) * 0.15;
    } else {
      // Shambling zombie limp (asymmetrical, jerky)
      leftLeg.rotation.x = Math.sin(cycle) * 0.45;
      rightLeg.rotation.x = -Math.sin(cycle + 0.5) * 0.35; // limp drag
      pelvis.position.y = 17 + Math.sin(cycle * 2) * 0.8;

      // Arms swing reaching forward
      leftArm.rotation.x = -1.1 + Math.sin(cycle) * 0.2;
      rightArm.rotation.x = -1.2 - Math.cos(cycle) * 0.2;
      head.rotation.z = Math.sin(cycle * 0.8) * 0.12; // tilted head
    }
  };

  return {
    rootGroup,
    torso,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    animate
  };
}
