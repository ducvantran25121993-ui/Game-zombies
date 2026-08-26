import { Obstacle } from '../types/game';

interface RenderObstaclesParams {
  ctx: CanvasRenderingContext2D;
  obstacles: Obstacle[];
  time: number;
}

export const renderObstacles = ({ ctx, obstacles, time }: RenderObstaclesParams) => {
  obstacles.forEach((obs) => {
    if ((obs.hp || 1) <= 0) return;

    ctx.save();
    const cx = obs.x + obs.width / 2;
    const cy = obs.y + obs.height / 2;
    const rot = obs.angle || 0;

    // 1. DIRECTIONAL GROUND DROP SHADOW (2.5D Isometric Slanted Shadow)
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    if (obs.type === 'tree') {
      ctx.ellipse(cx + 8, cy + 10, obs.width * 0.58, obs.height * 0.42, 0.2, 0, Math.PI * 2);
    } else if (obs.type === 'barrel') {
      ctx.ellipse(cx + 4, cy + 6, obs.width * 0.55, obs.height * 0.4, 0, 0, Math.PI * 2);
    } else {
      ctx.translate(cx + 6, cy + 8);
      ctx.rotate(rot);
      ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
    }
    ctx.fill();
    ctx.restore();

    ctx.translate(cx, cy);
    if (rot !== 0) ctx.rotate(rot);

    const w = obs.width;
    const h = obs.height;
    const halfW = w / 2;
    const halfH = h / 2;

    // 2. RENDER BY SPECIFIC PROP TYPE
    switch (obs.type) {
      // ---------------------------------------------------------------------
      // A. VEHICLES (XE CỘ - XE CẢNH SÁT, XE TAXI, XE SUV DÂN DỤNG, XE CẤP CỨU)
      // ---------------------------------------------------------------------
      case 'vehicle': {
        const variant = obs.variant || 'car';
        const bodyColor = obs.color || (variant === 'police' ? '#18181b' : variant === 'taxi' ? '#eab308' : variant === 'ambulance' ? '#f8fafc' : '#334155');

        // Tires / Wheels (4 corners)
        ctx.fillStyle = '#09090b';
        const wheelW = 10;
        const wheelH = 18;
        // Front wheels
        ctx.fillRect(-halfW + 4, -halfH - 2, wheelW, wheelH);
        ctx.fillRect(halfW - 14, -halfH - 2, wheelW, wheelH);
        // Rear wheels
        ctx.fillRect(-halfW + 4, halfH - 16, wheelW, wheelH);
        ctx.fillRect(halfW - 14, halfH - 16, wheelW, wheelH);

        // Main Car Body Chasis
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(-halfW + 4, -halfH, w - 8, h, 8)
          : ctx.rect(-halfW + 4, -halfH, w - 8, h);
        ctx.fill();
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Front & Rear Bumpers
        ctx.fillStyle = '#27272a';
        ctx.fillRect(-halfW + 6, -halfH, w - 12, 6);
        ctx.fillRect(-halfW + 6, halfH - 6, w - 12, 6);

        // Headlights (Front)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-halfW + 7, -halfH + 1, 8, 4);
        ctx.fillRect(halfW - 15, -halfH + 1, 8, 4);

        // Taillights (Rear)
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-halfW + 7, halfH - 5, 8, 4);
        ctx.fillRect(halfW - 15, halfH - 5, 8, 4);

        // Car Roof & Windshields (2.5D Angled Cabin)
        // Dark Tinted Glass Windshield & Rear window
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect
          ? ctx.roundRect(-halfW + 10, -halfH + 14, w - 20, h - 28, 4)
          : ctx.rect(-halfW + 10, -halfH + 14, w - 20, h - 28);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Metal Roof Cap
        ctx.fillStyle = bodyColor;
        ctx.fillRect(-halfW + 14, -halfH + 24, w - 28, h - 48);

        // Special Liveries
        if (variant === 'police') {
          // White roof with POLICE text
          ctx.fillStyle = '#f4f4f5';
          ctx.fillRect(-halfW + 14, -halfH + 24, w - 28, h - 48);
          ctx.fillStyle = '#09090b';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('POLICE', 0, 2);

          // Broken Emergency Flashing Lightbar on Roof
          const flash = Math.floor(time * 0.006) % 2 === 0;
          ctx.fillStyle = flash ? '#3b82f6' : '#ef4444';
          ctx.shadowColor = flash ? '#60a5fa' : '#f87171';
          ctx.shadowBlur = 8;
          ctx.fillRect(-12, -4, 24, 7);
          ctx.shadowBlur = 0;
        } else if (variant === 'taxi') {
          // TAXI sign on roof
          ctx.fillStyle = '#18181b';
          ctx.fillRect(-10, -3, 20, 6);
          ctx.fillStyle = '#fef08a';
          ctx.font = 'bold 7px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('TAXI', 0, 2);
        } else if (variant === 'ambulance') {
          // Red Cross on Ambulance Roof
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-3, -10, 6, 20);
          ctx.fillRect(-10, -3, 20, 6);

          // Red emergency beacon
          const ambFlash = Math.sin(time * 0.008) > 0;
          ctx.fillStyle = ambFlash ? '#ef4444' : '#991b1b';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = ambFlash ? 10 : 0;
          ctx.beginPath();
          ctx.arc(0, -18, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Cracked Windshield Lines (Apocalypse Battle Damage)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-6, -halfH + 18);
        ctx.lineTo(2, -halfH + 23);
        ctx.lineTo(-1, -halfH + 28);
        ctx.stroke();

        // Smoke / Fire if burning or low HP
        if (obs.isBurning || (obs.hp || 100) < (obs.maxHp || 250) * 0.4) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.beginPath();
          ctx.arc(0, -halfH + 6, 6 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // ---------------------------------------------------------------------
      // B. TREES & VEGETATION (CÂY CỐI ĐÔ THỊ, CÂY KHÔ TÀN KHỐC, BỒN CÂY)
      // ---------------------------------------------------------------------
      case 'tree': {
        const isDead = obs.variant === 'dead';
        const treeRad = w / 2;

        if (isDead) {
          // Dead apocalypse tree with dark twisted branches
          ctx.strokeStyle = '#292524';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#1c1917';
          ctx.fill();
          ctx.stroke();

          // Spreading dead branches
          ctx.lineWidth = 3;
          for (let b = 0; b < 6; b++) {
            const bAngle = (b * Math.PI) / 3 + 0.2;
            const bLen = treeRad * 0.85;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(bAngle) * bLen, Math.sin(bAngle) * bLen);
            ctx.stroke();
          }
        } else {
          // Lush Green Street Tree with layered 2.5D foliage canopies
          // Base trunk root
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          // Outer Dark Green Leaf Layer
          ctx.fillStyle = '#14532d';
          ctx.beginPath();
          ctx.arc(0, 0, treeRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#052e16';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Mid Green Foliage Puffs
          ctx.fillStyle = '#15803d';
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 + Math.sin(time * 0.001 + i) * 0.1;
            const px = Math.cos(angle) * (treeRad * 0.45);
            const py = Math.sin(angle) * (treeRad * 0.45);
            ctx.beginPath();
            ctx.arc(px, py, treeRad * 0.45, 0, Math.PI * 2);
            ctx.fill();
          }

          // Inner Vibrant Top Canopy Layer (Light highlight)
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(-2, -3, treeRad * 0.42, 0, Math.PI * 2);
          ctx.fill();

          // Sun specular glint
          ctx.fillStyle = '#86efac';
          ctx.beginPath();
          ctx.arc(-6, -7, treeRad * 0.18, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // ---------------------------------------------------------------------
      // C. EXPLOSIVE BARRELS (THÙNG XĂNG ĐỎ NỔ)
      // ---------------------------------------------------------------------
      case 'barrel': {
        const rad = w / 2;
        // Metal rim base
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Bright Red cylindrical top
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, 0, rad - 2, 0, Math.PI * 2);
        ctx.fill();

        // Top metal reinforcement rib
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, rad - 6, 0, Math.PI * 2);
        ctx.stroke();

        // Flammable Warning Hazard Symbol / Flame
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);

        // Pulsing danger glow if low HP
        if ((obs.hp || 30) < 20) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, rad + 4 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      // ---------------------------------------------------------------------
      // D. WOODEN CRATES & MILITARY SUPPLY BOXES (THÙNG GỖ / THÙNG TIẾP TẾ)
      // ---------------------------------------------------------------------
      case 'crate': {
        // Wooden Box Body
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-halfW, -halfH, w, h);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW, -halfH, w, h);

        // Inner Wood Planks
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-halfW + 4, -halfH + 4, w - 8, h - 8);

        // Diagonal Reinforcement Braces
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfW + 4, -halfH + 4);
        ctx.lineTo(halfW - 4, halfH - 4);
        ctx.moveTo(halfW - 4, -halfH + 4);
        ctx.lineTo(-halfW + 4, halfH - 4);
        ctx.stroke();

        // Corner Metal Brackets
        ctx.fillStyle = '#475569';
        const bSize = 6;
        ctx.fillRect(-halfW, -halfH, bSize, bSize);
        ctx.fillRect(halfW - bSize, -halfH, bSize, bSize);
        ctx.fillRect(-halfW, halfH - bSize, bSize, bSize);
        ctx.fillRect(halfW - bSize, halfH - bSize, bSize, bSize);
        break;
      }

      // ---------------------------------------------------------------------
      // E. SANDBAG BARRICADES (BAO CÁT CÔNG SỰ PHÒNG THỦ)
      // ---------------------------------------------------------------------
      case 'sandbag': {
        ctx.fillStyle = '#a8a29e';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(-halfW, -halfH, w, h, 6) : ctx.rect(-halfW, -halfH, w, h);
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sandbag pillow lines
        ctx.fillStyle = '#d6d3d1';
        const bagCount = Math.max(2, Math.floor(w / 16));
        const bagW = (w - 8) / bagCount;
        for (let b = 0; b < bagCount; b++) {
          ctx.beginPath();
          ctx.ellipse(-halfW + 4 + b * bagW + bagW / 2, 0, bagW * 0.45, halfH * 0.65, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a8a29e';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        break;
      }

      // ---------------------------------------------------------------------
      // F. HVAC ROOFTOP UNITS (QUẠT THÔNG GIÓ SÂN THƯỢNG)
      // ---------------------------------------------------------------------
      case 'hvac': {
        // Metal enclosure
        ctx.fillStyle = '#334155';
        ctx.fillRect(-halfW, -halfH, w, h);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW, -halfH, w, h);

        // Circular Fan Grate in Center
        const fanRad = Math.min(w, h) * 0.38;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, fanRad, 0, Math.PI * 2);
        ctx.fill();

        // Animated Rotating Fan Blades
        const fanRot = time * 0.008;
        ctx.save();
        ctx.rotate(fanRot);
        ctx.fillStyle = '#94a3b8';
        for (let f = 0; f < 4; f++) {
          ctx.rotate(Math.PI / 2);
          ctx.fillRect(-2, -fanRad + 2, 4, fanRad - 4);
        }
        ctx.restore();

        // Safety mesh ring
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, fanRad, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      // ---------------------------------------------------------------------
      // G. COMPUTER SERVER RACKS (TRẠM MÁY CHỦ HẦM NGẦM BIO-LAB)
      // ---------------------------------------------------------------------
      case 'server': {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-halfW, -halfH, w, h);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW, -halfH, w, h);

        // Server Blade Slots & Blinking LEDs
        const slotCount = 4;
        const slotH = (h - 8) / slotCount;
        for (let s = 0; s < slotCount; s++) {
          const sy = -halfH + 4 + s * slotH;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-halfW + 4, sy, w - 8, slotH - 2);

          // Blinking LED status indicators
          const ledColor = (s + Math.floor(time * 0.004)) % 3 === 0 ? '#22c55e' : (s % 2 === 0 ? '#38bdf8' : '#eab308');
          ctx.fillStyle = ledColor;
          ctx.fillRect(-halfW + 8, sy + 2, 3, 3);
          ctx.fillRect(-halfW + 14, sy + 2, 3, 3);
        }
        break;
      }

      // ---------------------------------------------------------------------
      // H. HOSPITAL GURNEYS (CÁNG CỨU THƯƠNG BỆNH VIỆN)
      // ---------------------------------------------------------------------
      case 'gurney': {
        // Metallic Wheel Frame
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-halfW, -halfH, w, h);

        // Mattress with Blood Stains
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-halfW + 2, -halfH + 2, w - 4, h - 4);

        // Blood Splatter on Sheet
        ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
        ctx.beginPath();
        ctx.arc(-halfW + 12, 0, 6, 0, Math.PI * 2);
        ctx.arc(-halfW + 18, 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // IV Drip Pole Stand
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.arc(halfW - 6, -halfH + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // ---------------------------------------------------------------------
      // I. STREET LAMPS (CỘT ĐÈN ĐƯỜNG VỚI VÙNG SÁNG LUNG LINH)
      // ---------------------------------------------------------------------
      case 'streetlight': {
        // Circular Lamppost Base
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#44403c';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Light bulb fixture
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      default:
        ctx.fillStyle = '#475569';
        ctx.fillRect(-halfW, -halfH, w, h);
        break;
    }

    ctx.restore();
  });
};
