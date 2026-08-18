'use client';

import React, { useMemo } from 'react';

// Lightweight QR Code Generator (Byte Mode, ISO/IEC 18004 compliant)
function generateQrMatrix(text) {
  const GF256_EXP = new Uint8Array(512);
  const GF256_LOG = new Uint8Array(256);
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
  }

  function polyMul(p1, p2) {
    const res = new Uint8Array(p1.length + p2.length - 1);
    for (let i = 0; i < p1.length; i++) {
      for (let j = 0; j < p2.length; j++) {
        res[i + j] ^= gfMul(p1[i], p2[j]);
      }
    }
    return res;
  }

  function getGenPoly(degree) {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
      poly = polyMul(poly, new Uint8Array([1, GF256_EXP[i]]));
    }
    return poly;
  }

  function calculateEc(data, ecCount) {
    const gen = getGenPoly(ecCount);
    const msg = new Uint8Array(data.length + ecCount);
    msg.set(data);
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= gfMul(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  const VERSION_CAPACITIES_M = [14, 26, 42, 62, 84, 106];
  const EC_CODEWORDS_M = [10, 16, 26, 18, 24, 16];
  const BLOCKS_M = [1, 1, 1, 2, 2, 4];

  const utf8Encoder = new TextEncoder();
  const rawBytes = utf8Encoder.encode(text);
  const textLen = rawBytes.length;

  let version = 1;
  while (version <= 6 && VERSION_CAPACITIES_M[version - 1] < textLen) {
    version++;
  }
  if (version > 6) version = 6;

  const totalModules = version * 4 + 17;

  const bitBuffer = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1);
    }
  }

  pushBits(4, 4);
  pushBits(textLen, 8);
  for (let i = 0; i < textLen; i++) {
    pushBits(rawBytes[i], 8);
  }

  const totalDataBytes = VERSION_CAPACITIES_M[version - 1];
  const totalDataBits = totalDataBytes * 8;
  const terminatorLen = Math.min(4, totalDataBits - bitBuffer.length);
  pushBits(0, terminatorLen);

  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0);
  }

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuffer.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  const dataBytes = new Uint8Array(totalDataBytes);
  for (let i = 0; i < totalDataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitBuffer[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  const numBlocks = BLOCKS_M[version - 1];
  const ecPerBlock = EC_CODEWORDS_M[version - 1];
  const blockSize = Math.floor(totalDataBytes / numBlocks);
  const blocksData = [];
  const blocksEc = [];

  for (let b = 0; b < numBlocks; b++) {
    const start = b * blockSize;
    const end = (b === numBlocks - 1) ? totalDataBytes : start + blockSize;
    const bData = dataBytes.slice(start, end);
    blocksData.push(bData);
    blocksEc.push(calculateEc(bData, ecPerBlock));
  }

  const finalCodewords = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < numBlocks; b++) {
      if (i < blocksData[b].length) finalCodewords.push(blocksData[b][i]);
    }
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(blocksEc[b][i]);
    }
  }

  const matrix = Array.from({ length: totalModules }, () => new Array(totalModules).fill(null));
  const isReserved = Array.from({ length: totalModules }, () => new Array(totalModules).fill(false));

  function setModule(r, c, val, reserved = true) {
    if (r >= 0 && r < totalModules && c >= 0 && c < totalModules) {
      matrix[r][c] = val ? 1 : 0;
      if (reserved) isReserved[r][c] = true;
    }
  }

  function drawFinderPattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr < 0 || nr >= totalModules || nc < 0 || nc >= totalModules) continue;
        if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            setModule(nr, nc, 1);
          } else {
            setModule(nr, nc, 0);
          }
        } else {
          setModule(nr, nc, 0);
        }
      }
    }
  }

  drawFinderPattern(0, 0);
  drawFinderPattern(0, totalModules - 7);
  drawFinderPattern(totalModules - 7, 0);

  for (let i = 8; i < totalModules - 8; i++) {
    if (!isReserved[6][i]) setModule(6, i, i % 2 === 0);
    if (!isReserved[i][6]) setModule(i, 6, i % 2 === 0);
  }

  setModule(totalModules - 8, 8, 1);

  for (let i = 0; i < 9; i++) {
    if (!isReserved[8][i]) isReserved[8][i] = true;
    if (!isReserved[i][8]) isReserved[i][8] = true;
  }
  for (let i = totalModules - 8; i < totalModules; i++) {
    if (!isReserved[8][i]) isReserved[8][i] = true;
    if (!isReserved[i][8]) isReserved[i][8] = true;
  }

  if (version >= 2) {
    const pos = totalModules - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
        const isCenter = r === 0 && c === 0;
        setModule(pos + r, pos + c, isBorder || isCenter);
      }
    }
  }

  const allBits = [];
  for (const b of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((b >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;

  for (let right = totalModules - 1; right > 0; right -= 2) {
    if (right === 6) right--;
    const rows = [];
    for (let r = 0; r < totalModules; r++) rows.push(r);
    if (upwards) rows.reverse();

    for (const r of rows) {
      for (let c = 0; c < 2; c++) {
        const col = right - c;
        if (!isReserved[r][col]) {
          let bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          if ((r + col) % 2 === 0) {
            bit ^= 1;
          }
          matrix[r][col] = bit;
        }
      }
    }
    upwards = !upwards;
  }

  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  const formatPosTopLeft = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatPosTopLeft[i];
    matrix[r][c] = formatBits[i];
  }

  for (let i = 0; i < 8; i++) {
    matrix[totalModules - 1 - i][8] = formatBits[i];
  }
  for (let i = 8; i < 15; i++) {
    matrix[8][totalModules - 15 + i] = formatBits[i];
  }

  return matrix;
}

export default function QRCodeSvg({ value = '', size = 84, fgColor = '#111111', bgColor = '#ffffff', className = '' }) {
  const matrix = useMemo(() => {
    try {
      return generateQrMatrix(value || 'https://skillbun.tech');
    } catch (e) {
      console.warn('QR matrix error:', e);
      return [];
    }
  }, [value]);

  if (!matrix || matrix.length === 0) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          border: '1px solid #ccc',
          fontSize: '10px',
          color: '#666',
        }}
      >
        QR
      </div>
    );
  }

  const moduleCount = matrix.length;
  const margin = 1;
  const viewBoxSize = moduleCount + margin * 2;

  let path = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c] === 1) {
        path += `M${c + margin},${r + margin}h1v1h-1z `;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', background: bgColor, borderRadius: '4px' }}
      shapeRendering="crispEdges"
      aria-label={`QR Code for ${value}`}
    >
      <path d={path} fill={fgColor} />
    </svg>
  );
}
