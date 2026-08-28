import { MapEnvironmentId } from '../types/game';

interface RenderMapParams {
  ctx: CanvasRenderingContext2D;
  mapId: MapEnvironmentId;
  mapSize: { width: number; height: number };
  canvasWidth: number;
  canvasHeight: number;
  camera: { x: number; y: number };
  time: number;
}

export const renderMapEnvironment = ({
  ctx,
  mapId,
  mapSize,
  canvasWidth,
  canvasHeight,
  camera,
  time
}: RenderMapParams) => {
  const { width: mW, height: mH } = mapSize;
  const borderPad = 1400; // Extra wide background for boundless edge rendering

  // =========================================================================
  // 1. EXTENDED SURROUNDINGS & PARALLAX BEYOND PERIMETER
  // =========================================================================
  if (mapId === 'rooftop') {
    // Night City Rooftop Panorama
    const skyGrad = ctx.createLinearGradient(0, -borderPad, 0, mH + borderPad);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.5, '#0f172a');
    skyGrad.addColorStop(1, '#020617');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Distant City Skyline Silhouettes with Glowing Windows
    ctx.save();
    const buildingStep = 160;
    for (let bx = -borderPad; bx < mW + borderPad; bx += buildingStep) {
      const bHeight = 140 + ((Math.sin(bx * 0.04) + 1) * 80);
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(bx, -160 - bHeight, buildingStep - 12, bHeight);

      // Glowing skyscraper office windows
      ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
      for (let wy = -160 - bHeight + 15; wy < -170; wy += 22) {
        if ((bx + wy) % 7 === 0) {
          ctx.fillRect(bx + 12, wy, 8, 12);
          ctx.fillRect(bx + 32, wy, 8, 12);
          ctx.fillRect(bx + 52, wy, 8, 12);
        }
      }

      // Bottom Skyline
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(bx, mH + 80, buildingStep - 12, bHeight);
      for (let wy = mH + 95; wy < mH + 80 + bHeight; wy += 22) {
        if ((bx + wy) % 5 === 0) {
          ctx.fillRect(bx + 16, wy, 8, 12);
          ctx.fillRect(bx + 38, wy, 8, 12);
        }
      }
    }

    // Communication Antenna Mast with Blinking Red Lights
    const blinkAviation = Math.floor(time * 0.003) % 2 === 0;
    if (blinkAviation) {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      for (let bx = -borderPad + 60; bx < mW + borderPad; bx += 400) {
        ctx.beginPath();
        ctx.arc(bx, -380, 4, 0, Math.PI * 2);
        ctx.arc(bx, mH + 380, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
    ctx.restore();

  } else if (mapId === 'street') {
    // City Warzone Ruins
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Distant burned concrete building ruins
    ctx.fillStyle = '#18181b';
    for (let bx = -borderPad; bx < mW + borderPad; bx += 220) {
      const h = 180 + ((Math.cos(bx * 0.03) + 1) * 90);
      ctx.fillRect(bx, -120 - h, 200, h);
      ctx.fillRect(bx, mH + 120, 200, h);
    }

  } else if (mapId === 'bunker') {
    // Underground Bio-lab steel bunker bulkheads
    ctx.fillStyle = '#022c22';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Heavy reinforced blast door beams
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 18;
    ctx.strokeRect(-50, -50, mW + 100, mH + 100);

  } else if (mapId === 'hospital') {
    // Quarantine Hospital grounds
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

  } else if (mapId === 'graveyard') {
    // Cursed Dark Forest & Ancient Fog
    const forestGrad = ctx.createRadialGradient(mW / 2, mH / 2, 400, mW / 2, mH / 2, mW);
    forestGrad.addColorStop(0, '#0c0714');
    forestGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = forestGrad;
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Distant Spooky Dead Tree Silhouettes
    ctx.fillStyle = '#140c24';
    for (let tx = -borderPad; tx < mW + borderPad; tx += 180) {
      const treeH = 120 + ((Math.sin(tx * 0.05) + 1) * 60);
      ctx.beginPath();
      ctx.moveTo(tx, -80);
      ctx.lineTo(tx + 20, -80 - treeH);
      ctx.lineTo(tx + 40, -80);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx, mH + 80);
      ctx.lineTo(tx + 20, mH + 80 + treeH);
      ctx.lineTo(tx + 40, mH + 80);
      ctx.fill();
    }

  } else if (mapId === 'desert_outpost') {
    // Scorched Desert Dunes & Sandstorm Atmosphere
    const sandGrad = ctx.createLinearGradient(0, -borderPad, mW, mH + borderPad);
    sandGrad.addColorStop(0, '#451a03');
    sandGrad.addColorStop(0.5, '#78350f');
    sandGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Sand dune ridges in the background
    ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
    for (let dx = -borderPad; dx < mW + borderPad; dx += 300) {
      ctx.beginPath();
      ctx.arc(dx, -120, 220, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(dx, mH + 120, 220, Math.PI, Math.PI * 2);
      ctx.fill();
    }

  } else if (mapId === 'cyber_facility') {
    // Cyberpunk Quantum Core Darkness & Neon Matrix
    ctx.fillStyle = '#020617';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Ambient Neon Cyan Wireframe Grid beyond borders
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.lineWidth = 1.5;
    for (let gx = -borderPad; gx < mW + borderPad; gx += 120) {
      ctx.beginPath();
      ctx.moveTo(gx, -borderPad);
      ctx.lineTo(gx, mH + borderPad);
      ctx.stroke();
    }
    for (let gy = -borderPad; gy < mH + borderPad; gy += 120) {
      ctx.beginPath();
      ctx.moveTo(-borderPad, gy);
      ctx.lineTo(mW + borderPad, gy);
      ctx.stroke();
    }

  } else if (mapId === 'volcanic_core') {
    // Fiery Magma Pit & Molten Core
    const lavaGrad = ctx.createRadialGradient(mW / 2, mH / 2, 200, mW / 2, mH / 2, mW + 400);
    lavaGrad.addColorStop(0, '#450a0a');
    lavaGrad.addColorStop(0.5, '#1c1917');
    lavaGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Burning lava pools in distance
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    for (let lx = -borderPad + 100; lx < mW + borderPad; lx += 450) {
      ctx.beginPath();
      ctx.ellipse(lx, -140, 160, 50, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(lx, mH + 140, 160, 50, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // =========================================================================
  // 2. MAIN BATTLEFIELD PLAYABLE INTERIOR FLOOR
  // =========================================================================
  ctx.save();

  if (mapId === 'rooftop') {
    // Concrete industrial rooftop
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, mW, mH);

    // Concrete Slab Tile Grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    const slabSize = 120;
    for (let x = 0; x < mW; x += slabSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mH);
      ctx.stroke();
    }
    for (let y = 0; y < mH; y += slabSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mW, y);
      ctx.stroke();
    }

    // HELIPAD IN THE CENTER
    const cx = mW / 2;
    const cy = mH / 2;
    const heliRadius = 260;

    // Helipad outer yellow circle
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, heliRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Helipad dashed inner ring
    ctx.save();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.setLineDash([22, 16]);
    ctx.beginPath();
    ctx.arc(cx, cy, heliRadius - 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Helipad giant "H"
    ctx.fillStyle = '#eab308';
    ctx.font = '900 180px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', cx, cy);

    // Helipad Corner Beacon Lights (Individual paths to prevent cross-fill hourglass glitch)
    const beaconAlpha = 0.7 + Math.sin(time * 0.005) * 0.3;
    ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    const beacons = [
      { x: cx - heliRadius + 24, y: cy - heliRadius + 24 },
      { x: cx + heliRadius - 24, y: cy - heliRadius + 24 },
      { x: cx - heliRadius + 24, y: cy + heliRadius - 24 },
      { x: cx + heliRadius - 24, y: cy + heliRadius - 24 }
    ];
    beacons.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fill();
      // Bright center LED
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
    });
    ctx.shadowBlur = 0;

  } else if (mapId === 'street') {
    // Dark Asphalt Urban Road
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, mW, mH);

    // Asphalt Texture Grid & Cracks
    ctx.strokeStyle = '#262626';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < mW; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mH);
      ctx.stroke();
    }

    // Road Edge Curbs (Sidewalk Border)
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(0, 0, mW, 35);
    ctx.fillRect(0, mH - 35, mW, 35);
    ctx.fillRect(0, 0, 35, mH);
    ctx.fillRect(mW - 35, 0, 35, mH);

    // Center Double Yellow Highway Lines
    const midY = mH / 2;
    ctx.save();
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 6;
    ctx.setLineDash([45, 25]);
    ctx.beginPath();
    ctx.moveTo(35, midY - 14);
    ctx.lineTo(mW - 35, midY - 14);
    ctx.moveTo(35, midY + 14);
    ctx.lineTo(mW - 35, midY + 14);
    ctx.stroke();
    ctx.restore();

    // Pedestrian Crosswalks (White Zebra Stripes)
    for (let wx of [mW * 0.22, mW * 0.5, mW * 0.78]) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let sy = 55; sy < mH - 55; sy += 38) {
        ctx.fillRect(wx - 24, sy, 48, 20);
      }
    }

    // Manhole Covers with Steam
    const manholes = [
      { x: mW * 0.35, y: mH * 0.3 },
      { x: mW * 0.65, y: mH * 0.7 }
    ];
    manholes.forEach((mh) => {
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(mh.x, mh.y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DRAIN', mh.x, mh.y);
    });

  } else if (mapId === 'bunker') {
    // Metallic Bio-Lab Floor
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, mW, mH);

    // Steel Grate Floor Grid
    ctx.strokeStyle = '#022c22';
    ctx.lineWidth = 2;
    for (let x = 0; x < mW; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, mH);
      ctx.stroke();
    }
    for (let y = 0; y < mH; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mW, y);
      ctx.stroke();
    }

    // Central Giant Biohazard Crest
    const cx = mW / 2;
    const cy = mH / 2;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.18)';
    ctx.beginPath();
    ctx.arc(cx, cy, 190, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 140px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('☣️', cx, cy);

    // Fluorescent Toxic Slime Conduit Lines
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.moveTo(80, mH * 0.2);
    ctx.lineTo(mW - 80, mH * 0.2);
    ctx.moveTo(80, mH * 0.8);
    ctx.lineTo(mW - 80, mH * 0.8);
    ctx.stroke();
    ctx.restore();

  } else if (mapId === 'hospital') {
    // Quarantine Hospital Floor
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, mW, mH);

    // Bloodstained Ceramic Tiles
    const tileSize = 60;
    for (let x = 0; x < mW; x += tileSize) {
      for (let y = 0; y < mH; y += tileSize) {
        if ((x / tileSize + y / tileSize) % 2 === 0) {
          ctx.fillStyle = '#292524';
          ctx.fillRect(x, y, tileSize, tileSize);
        }
      }
    }

    // Quarantine Zone Red Cross Center
    const cx = mW / 2;
    const cy = mH / 2;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fillRect(cx - 150, cy - 150, 300, 300);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(cx - 24, cy - 110, 48, 220);
    ctx.fillRect(cx - 110, cy - 24, 220, 48);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BIO-QUARANTINE ZONE', cx, cy + 135);

  } else if (mapId === 'graveyard') {
    // 5. HAUNTED GRAVEYARD & ANCIENT NECROPOLIS
    ctx.fillStyle = '#0f0a1c';
    ctx.fillRect(0, 0, mW, mH);

    // Cracked Ancient Stone Pathways
    ctx.strokeStyle = '#27173e';
    ctx.lineWidth = 3;
    const stoneStep = 140;
    for (let x = 0; x < mW; x += stoneStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(x) * 30, mH);
      ctx.stroke();
    }
    for (let y = 0; y < mH; y += stoneStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(mW, y + Math.cos(y) * 30);
      ctx.stroke();
    }

    // Central Mystic Cursed Pentagram / Runic Summoning Circle
    const cx = mW / 2;
    const cy = mH / 2;
    const runeRadius = 240;

    // Glowing Purple Phantom Aura
    const runeAura = ctx.createRadialGradient(cx, cy, 20, cx, cy, runeRadius);
    runeAura.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    runeAura.addColorStop(0.7, 'rgba(126, 34, 206, 0.12)');
    runeAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = runeAura;
    ctx.beginPath();
    ctx.arc(cx, cy, runeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Runic Outer Circles
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, runeRadius * 0.9, 0, Math.PI * 2);
    ctx.arc(cx, cy, runeRadius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // Runic 5-Point Star
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.0008);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const rx = Math.cos(angle) * (runeRadius * 0.72);
      const ry = Math.sin(angle) * (runeRadius * 0.72);
      if (i === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();

    // Skull sigil in center
    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💀', 0, 0);
    ctx.restore();

    // Floating purple will-o'-wisps (Ma trơi ma quái)
    for (let w = 0; w < 12; w++) {
      const wx = (w * 220 + Math.sin(time * 0.002 + w) * 80 + mW) % mW;
      const wy = (w * 180 + Math.cos(time * 0.003 + w) * 60 + mH) % mH;
      ctx.fillStyle = 'rgba(192, 132, 252, 0.6)';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(wx, wy, 4 + Math.sin(time * 0.005 + w) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

  } else if (mapId === 'desert_outpost') {
    // 6. SCORCHED DESERT MILITARY OUTPOST
    ctx.fillStyle = '#713f12';
    ctx.fillRect(0, 0, mW, mH);

    // Sand dune wave lines with wind texture
    ctx.strokeStyle = '#854d0e';
    ctx.lineWidth = 4;
    for (let y = 40; y < mH; y += 75) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < mW; x += 100) {
        ctx.quadraticCurveTo(x + 50, y + Math.sin(x * 0.02 + y * 0.01) * 20, x + 100, y);
      }
      ctx.stroke();
    }

    // Military Outpost Stencil & Landing Ring
    const cx = mW / 2;
    const cy = mH / 2;
    const landingRad = 250;

    // Rusty Steel Base Plates
    ctx.fillStyle = '#3f3f46';
    ctx.beginPath();
    ctx.arc(cx, cy, landingRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Stencil text
    ctx.fillStyle = '#fde047';
    ctx.font = '900 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OUTPOST 51 // MILITARY DEFENSE ZONE', cx, cy - 70);
    ctx.font = 'bold 16px monospace';
    ctx.fillText('RESTRICTED ACCESS • SURVIVORS ONLY', cx, cy + 85);

    // Outer military crosshairs
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - landingRad - 30, cy);
    ctx.lineTo(cx - landingRad + 30, cy);
    ctx.moveTo(cx + landingRad - 30, cy);
    ctx.lineTo(cx + landingRad + 30, cy);
    ctx.moveTo(cx, cy - landingRad - 30);
    ctx.lineTo(cx, cy - landingRad + 30);
    ctx.moveTo(cx, cy + landingRad - 30);
    ctx.lineTo(cx, cy + landingRad + 30);
    ctx.stroke();

  } else if (mapId === 'cyber_facility') {
    // 7. CYBERPUNK QUANTUM FACILITY
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, mW, mH);

    // Futuristic Hexagon Matrix Floor Pattern
    const hexR = 40;
    const hexH = Math.sqrt(3) * hexR;
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 1;
    for (let y = 0; y < mH + hexH; y += hexH) {
      for (let x = 0; x < mW + hexR * 3; x += hexR * 3) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const hx = x + hexR * Math.cos(angle);
          const hy = y + hexR * Math.sin(angle);
          if (i === 0) ctx.moveTo(hx, hy);
          else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Glowing Neon Circuit Bus Tracks
    const circuitFlow = (time * 0.05) % 80;
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.setLineDash([30, 20]);
    ctx.lineDashOffset = -circuitFlow;
    ctx.beginPath();
    ctx.moveTo(100, 100); ctx.lineTo(mW / 2, mH / 2);
    ctx.moveTo(mW - 100, 100); ctx.lineTo(mW / 2, mH / 2);
    ctx.moveTo(100, mH - 100); ctx.lineTo(mW / 2, mH / 2);
    ctx.moveTo(mW - 100, mH - 100); ctx.lineTo(mW / 2, mH / 2);
    ctx.stroke();
    ctx.restore();

    // Central Spinning Quantum Reactor Core
    const cx = mW / 2;
    const cy = mH / 2;
    const qRad = 220;

    // Glowing Cyan Core Halo
    const coreGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, qRad);
    coreGlow.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
    coreGlow.addColorStop(0.6, 'rgba(14, 116, 144, 0.2)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, qRad, 0, Math.PI * 2);
    ctx.fill();

    // Rotating Energy Rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.002);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, qRad * 0.7, 0, Math.PI * 1.6);
    ctx.stroke();
    ctx.rotate(-time * 0.004);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, qRad * 0.5, 0, Math.PI * 1.4);
    ctx.stroke();

    // Quantum Symbol in center
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, 0);
    ctx.restore();

  } else if (mapId === 'volcanic_core') {
    // 8. INFERNAL VOLCANIC MAGMA CHAMBER
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, mW, mH);

    // Obsidian Rock Cracks
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 4;
    for (let x = 0; x < mW; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + Math.sin(x * 0.03) * 60, mH);
      ctx.stroke();
    }

    // Glowing Molten Lava Fissures & Rivers across map
    const pulseHeat = 0.7 + Math.sin(time * 0.004) * 0.3;
    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${pulseHeat})`;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 24;
    ctx.lineWidth = 14;
    
    // Cross Lava Streams
    ctx.beginPath();
    ctx.moveTo(60, mH * 0.35);
    ctx.bezierCurveTo(mW * 0.3, mH * 0.4, mW * 0.7, mH * 0.25, mW - 60, mH * 0.35);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, mH * 0.65);
    ctx.bezierCurveTo(mW * 0.4, mH * 0.6, mW * 0.6, mH * 0.75, mW - 60, mH * 0.65);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Central Fiery Magma Pool
    const cx = mW / 2;
    const cy = mH / 2;
    const lavaRad = 240;

    const lavaCore = ctx.createRadialGradient(cx, cy, 20, cx, cy, lavaRad);
    lavaCore.addColorStop(0, '#fef08a');
    lavaCore.addColorStop(0.3, '#f97316');
    lavaCore.addColorStop(0.7, '#dc2626');
    lavaCore.addColorStop(1, 'rgba(69, 10, 10, 0)');
    ctx.fillStyle = lavaCore;
    ctx.beginPath();
    ctx.arc(cx, cy, lavaRad, 0, Math.PI * 2);
    ctx.fill();

    // Floating ember spark particles
    for (let eb = 0; eb < 16; eb++) {
      const ex = (eb * 170 + Math.sin(time * 0.003 + eb) * 90 + mW) % mW;
      const ey = (mH - (time * 0.08 + eb * 130) % mH);
      ctx.fillStyle = eb % 2 === 0 ? '#facc15' : '#ef4444';
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.5 + Math.sin(eb + time * 0.005) * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ctx.restore();

  // =========================================================================
  // 3. MAP PERIMETER BORDER FRAME & HAZARD WARNING STRIPES
  // =========================================================================
  ctx.save();
  const borderThickness = 24;

  ctx.lineWidth = borderThickness;
  ctx.strokeStyle = '#18181b';
  ctx.strokeRect(-borderThickness / 2, -borderThickness / 2, mW + borderThickness, mH + borderThickness);

  // Corner fortified towers
  const cornerRadius = 36;
  ctx.fillStyle = '#3f3f46';
  ctx.fillRect(-cornerRadius / 2, -cornerRadius / 2, cornerRadius, cornerRadius);
  ctx.fillRect(mW - cornerRadius / 2, -cornerRadius / 2, cornerRadius, cornerRadius);
  ctx.fillRect(-cornerRadius / 2, mH - cornerRadius / 2, cornerRadius, cornerRadius);
  ctx.fillRect(mW - cornerRadius / 2, mH - cornerRadius / 2, cornerRadius, cornerRadius);

  // Warning flashing beacons
  const beaconBlink = Math.sin(time * 0.008) > 0;
  let beaconColor = '#ef4444';
  if (mapId === 'cyber_facility') beaconColor = '#06b6d4';
  else if (mapId === 'graveyard') beaconColor = '#a855f7';
  else if (mapId === 'desert_outpost') beaconColor = '#eab308';
  else if (mapId === 'volcanic_core') beaconColor = '#f97316';
  else if (mapId === 'bunker') beaconColor = '#10b981';

  ctx.fillStyle = beaconBlink ? beaconColor : '#334155';
  ctx.shadowColor = beaconBlink ? beaconColor : 'transparent';
  ctx.shadowBlur = beaconBlink ? 14 : 0;

  for (let px = 200; px < mW; px += 350) {
    ctx.beginPath();
    ctx.arc(px, 0, 6, 0, Math.PI * 2);
    ctx.arc(px, mH, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let py = 200; py < mH; py += 350) {
    ctx.beginPath();
    ctx.arc(0, py, 6, 0, Math.PI * 2);
    ctx.arc(mW, py, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Hazard warning border line
  ctx.save();
  ctx.strokeStyle = '#eab308';
  if (mapId === 'cyber_facility') ctx.strokeStyle = '#06b6d4';
  else if (mapId === 'graveyard') ctx.strokeStyle = '#a855f7';
  else if (mapId === 'volcanic_core') ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 6;
  ctx.setLineDash([16, 16]);
  ctx.strokeRect(12, 12, mW - 24, mH - 24);
  ctx.restore();

  ctx.restore();
};
