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
  const borderPad = 1400; // Extra wide background so edge is completely filled

  // =========================================================================
  // 1. EXTENDED SURROUNDINGS (PARALLAX SKYLINE & CITY RUINS BEYOND PERIMETER)
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

    // Communication Antenna Mast with Blinking Red Lights on top of distant buildings
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

    // Perimeter Sidewalk Curb with rubble
    ctx.fillStyle = '#27272a';
    ctx.fillRect(-borderPad, -100, mW + borderPad * 2, 100);
    ctx.fillRect(-borderPad, mH, mW + borderPad * 2, 100);
    ctx.fillRect(-100, -borderPad, 100, mH + borderPad * 2);
    ctx.fillRect(mW, -borderPad, 100, mH + borderPad * 2);

  } else if (mapId === 'bunker') {
    // Underground Bio-lab steel bunker bulkheads
    ctx.fillStyle = '#022c22';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);

    // Heavy reinforced blast door beams
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 18;
    ctx.strokeRect(-50, -50, mW + 100, mH + 100);

  } else {
    // Quarantine Hospital grounds
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-borderPad, -borderPad, mW + borderPad * 2, mH + borderPad * 2);
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

    // Helipad Corner Beacon Lights
    const beaconAlpha = 0.6 + Math.sin(time * 0.005) * 0.4;
    ctx.fillStyle = `rgba(239, 68, 68, ${beaconAlpha})`;
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx - heliRadius + 24, cy - heliRadius + 24, 10, 0, Math.PI * 2);
    ctx.arc(cx + heliRadius - 24, cy - heliRadius + 24, 10, 0, Math.PI * 2);
    ctx.arc(cx - heliRadius + 24, cy + heliRadius - 24, 10, 0, Math.PI * 2);
    ctx.arc(cx + heliRadius - 24, cy + heliRadius - 24, 10, 0, Math.PI * 2);
    ctx.fill();
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

  } else {
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
  ctx.fillStyle = beaconBlink ? '#ef4444' : '#0ea5e9';
  ctx.shadowColor = beaconBlink ? '#ef4444' : '#0ea5e9';
  ctx.shadowBlur = 14;

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

  // Yellow Hazard warning border line
  ctx.save();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 6;
  ctx.setLineDash([16, 16]);
  ctx.strokeRect(12, 12, mW - 24, mH - 24);
  ctx.restore();

  ctx.restore();
};
