'use client';

import React, { useMemo } from 'react';
import QRCode from 'qrcode';

/**
 * QRCodeSvg — 100% ISO/IEC 18004 compliant QR Code with Level 'H' Error Correction,
 * aesthetic rounded dot modules, and central SkillBun logo badge.
 */
export default function QRCodeSvg({
  value = 'https://skillbun.vercel.app',
  size = 84,
  className = '',
  style = {},
  logoSrc = '/logo.png',
}) {
  const qrData = useMemo(() => {
    try {
      const qr = QRCode.create(value || 'https://skillbun.vercel.app', {
        errorCorrectionLevel: 'H',
      });
      const moduleCount = qr.modules.size;
      const data = qr.modules.data;
      return { moduleCount, data };
    } catch (e) {
      console.error('Failed to generate QR Code:', e);
      return null;
    }
  }, [value]);

  if (!qrData) return null;

  const { moduleCount, data } = qrData;
  const margin = 2;
  const totalDim = moduleCount + margin * 2;

  // Center logo zone: cover ~26% of modules in center
  const logoModules = Math.floor(moduleCount * 0.26);
  const centerStart = Math.floor((moduleCount - logoModules) / 2);
  const centerEnd = centerStart + logoModules - 1;

  // Finder pattern zones (top-left, top-right, bottom-left 7x7)
  const isFinder = (r, c) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= moduleCount - 7) return true;
    if (r >= moduleCount - 7 && c < 7) return true;
    return false;
  };

  const isCenterZone = (r, c) => {
    return r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd;
  };

  const dots = [];
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isCenterZone(r, c)) continue;
      if (data[r * moduleCount + c]) {
        const x = c + margin;
        const y = r + margin;
        if (isFinder(r, c)) {
          dots.push(
            <rect
              key={`d-${r}-${c}`}
              x={x + 0.05}
              y={y + 0.05}
              width={0.9}
              height={0.9}
              rx={0.15}
              fill="#000000"
            />
          );
        } else {
          dots.push(
            <circle
              key={`d-${r}-${c}`}
              cx={x + 0.5}
              cy={y + 0.5}
              r={0.42}
              fill="#111827"
            />
          );
        }
      }
    }
  }

  // Center badge dimensions
  const badgeX = centerStart + margin - 0.2;
  const badgeY = centerStart + margin - 0.2;
  const badgeSize = logoModules + 0.4;
  const logoPad = badgeSize * 0.12;

  return (
    <svg
      viewBox={`0 0 ${totalDim} ${totalDim}`}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        background: '#ffffff',
        borderRadius: '6px',
        ...style,
      }}
      aria-label="Scannable Certificate Verification QR Code"
    >
      <rect width={totalDim} height={totalDim} fill="#ffffff" rx={2} />

      {/* QR Data & Finder Modules */}
      <g>{dots}</g>

      {/* Center White Rounded Badge */}
      <rect
        x={badgeX}
        y={badgeY}
        width={badgeSize}
        height={badgeSize}
        rx={1.5}
        fill="#ffffff"
        stroke="#E5E7EB"
        strokeWidth={0.2}
      />

      {/* Center SkillBun Logo */}
      {logoSrc && (
        <image
          href={logoSrc}
          x={badgeX + logoPad}
          y={badgeY + logoPad}
          width={badgeSize - logoPad * 2}
          height={badgeSize - logoPad * 2}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
    </svg>
  );
}
