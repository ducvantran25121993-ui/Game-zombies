import * as THREE from 'three';

/**
 * Volumetric Flashlight Cone
 * Simulates atmospheric dust/fog light scatter from the commando's rifle.
 */
export class VolumetricSpotlight {
  public group: THREE.Group;
  public coneMesh: THREE.Mesh;
  public laserLine: THREE.Line;
  public laserDot: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor(coneLength = 340, coneRadius = 75) {
    this.group = new THREE.Group();

    // 1. Custom Shader Material for soft atmospheric dust scatter
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vDistance;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vDistance = length(position.y); // along cylinder height
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `;

    const fragmentShader = `
      uniform vec3 color;
      uniform float lengthFalloff;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vDistance;

      void main() {
        // Fresnel-like edge softness (more intense when viewing along the beam)
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float edgeSoftness = pow(max(0.0, dot(vNormal, viewDir)), 0.65);

        // Distance falloff from apex to base
        float distFade = clamp(1.0 - (vDistance / lengthFalloff), 0.0, 1.0);
        float alpha = distFade * edgeSoftness * 0.45;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        color: { value: new THREE.Color(0xfef08a) }, // warm tactical flashlight
        lengthFalloff: { value: coneLength }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // Cylinder with radiusTop = 1.5, radiusBottom = coneRadius, height = coneLength
    const coneGeo = new THREE.CylinderGeometry(2, coneRadius, coneLength, 32, 8, true);
    // Move pivot to apex so it projects forward
    coneGeo.translate(0, coneLength / 2, 0);
    // Rotate so Y points along negative Z (forward)
    coneGeo.rotateX(-Math.PI / 2);

    this.coneMesh = new THREE.Mesh(coneGeo, this.material);
    this.group.add(this.coneMesh);

    // 2. Tactical Laser Beam (Thin glowing red line)
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -coneLength * 1.5)
    ]);
    const laserMat = new THREE.LineBasicMaterial({
      color: 0xef4444,
      linewidth: 2,
      transparent: true,
      opacity: 0.8
    });
    this.laserLine = new THREE.Line(laserGeo, laserMat);
    this.group.add(this.laserLine);

    // 3. Laser Contact Dot
    const dotGeo = new THREE.RingGeometry(0.8, 2.2, 16);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    this.laserDot = new THREE.Mesh(dotGeo, dotMat);
    this.laserDot.rotation.x = -Math.PI / 2;
    this.laserDot.position.set(0, 0.5, -coneLength * 1.2);
    this.group.add(this.laserDot);
  }

  public update(originX: number, originY: number, originZ: number, targetX: number, targetZ: number) {
    this.group.position.set(originX, originY, originZ);

    const angle = Math.atan2(targetZ - originZ, targetX - originX);
    // In Three.js, group forward is -Z. We rotate around Y:
    this.group.rotation.y = -angle - Math.PI / 2;

    // Pulse laser dot slightly
    const scale = 1 + Math.sin(Date.now() / 150) * 0.25;
    this.laserDot.scale.set(scale, scale, scale);
  }
}
