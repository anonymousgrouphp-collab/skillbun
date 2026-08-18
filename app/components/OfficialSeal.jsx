'use client';

import React from 'react';

/**
 * OfficialSeal — Ultra-prestigious 36-point scalloped gold foil seal with
 * circular engraved typography, beaded concentric rings, and REISH emblem medallion.
 */
export default function OfficialSeal({ size, className = '', style = {} }) {
  const sunburstD =
    'M 100.0 3.0 L 107.9 9.8 L 116.8 4.5 L 123.4 12.6 L 133.2 8.8 L 138.2 18.0 L 148.5 16.0 L 151.9 25.9 L 162.4 25.7 L 164.0 36.0 L 174.3 37.6 L 174.1 48.1 L 184.0 51.5 L 182.0 61.8 L 191.2 66.8 L 187.4 76.6 L 195.5 83.2 L 190.2 92.1 L 197.0 100.0 L 190.2 107.9 L 195.5 116.8 L 187.4 123.4 L 191.2 133.2 L 182.0 138.2 L 184.0 148.5 L 174.1 151.9 L 174.3 162.4 L 164.0 164.0 L 162.4 174.3 L 151.9 174.1 L 148.5 184.0 L 138.2 182.0 L 133.2 191.2 L 123.4 187.4 L 116.8 195.5 L 107.9 190.2 L 100.0 197.0 L 92.1 190.2 L 83.2 195.5 L 76.6 187.4 L 66.8 191.2 L 61.8 182.0 L 51.5 184.0 L 48.1 174.1 L 37.6 174.3 L 36.0 164.0 L 25.7 162.4 L 25.9 151.9 L 16.0 148.5 L 18.0 138.2 L 8.8 133.2 L 12.6 123.4 L 4.5 116.8 L 9.8 107.9 L 3.0 100.0 L 9.8 92.1 L 4.5 83.2 L 12.6 76.6 L 8.8 66.8 L 18.0 61.8 L 16.0 51.5 L 25.9 48.1 L 25.7 37.6 L 36.0 36.0 L 37.6 25.7 L 48.1 25.9 L 51.5 16.0 L 61.8 18.0 L 66.8 8.8 L 76.6 12.6 L 83.2 4.5 L 92.1 9.8 Z';

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size ? (typeof size === 'number' ? `${size}px` : size) : 'clamp(82px, 9vw, 98px)',
        height: size ? (typeof size === 'number' ? `${size}px` : size) : 'clamp(82px, 9vw, 98px)',
        filter: 'drop-shadow(0 6px 14px rgba(140, 109, 35, 0.42)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
        display: 'block',
        ...style,
      }}
      aria-label="Official REISH and SkillBun Verified Seal"
    >
      <defs>
        {/* Outer Radiant Gold Gradient */}
        <radialGradient id="goldRadialOuter" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="25%" stopColor="#F5D77F" />
          <stop offset="55%" stopColor="#D8A939" />
          <stop offset="85%" stopColor="#A47518" />
          <stop offset="100%" stopColor="#6D4907" />
        </radialGradient>

        {/* Inner Ring Gold Gradient */}
        <linearGradient id="goldLinearRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2CE" />
          <stop offset="35%" stopColor="#E2B755" />
          <stop offset="70%" stopColor="#B3801D" />
          <stop offset="100%" stopColor="#875A0B" />
        </linearGradient>

        {/* Core Medallion Background */}
        <radialGradient id="goldCore" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFCF4" />
          <stop offset="30%" stopColor="#F7E2A4" />
          <stop offset="65%" stopColor="#D8A83B" />
          <stop offset="90%" stopColor="#AD7B1C" />
          <stop offset="100%" stopColor="#7E540C" />
        </radialGradient>

        {/* Circular text paths */}
        <path
          id="sealTopArc"
          d="M 30,100 A 70,70 0 1,1 170,100"
          fill="none"
        />
        <path
          id="sealBottomArc"
          d="M 30,100 A 70,70 0 0,0 170,100"
          fill="none"
        />
      </defs>

      {/* Layer 1: 36-Point Scalloped Sunburst Outer Foil Star */}
      <path
        d={sunburstD}
        fill="url(#goldRadialOuter)"
        stroke="#7A530C"
        strokeWidth="1.2"
      />

      {/* Layer 2: Beveled Gold Outer Rim */}
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="#FFF5D6"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="#8C6212"
        strokeWidth="1.2"
      />

      {/* Layer 3: Outer Beaded Dot Ring */}
      <circle
        cx="100"
        cy="100"
        r="81"
        fill="none"
        stroke="#68450A"
        strokeWidth="2"
        strokeDasharray="2.5 3.5"
      />

      {/* Layer 4: Text Ribbon Track */}
      <circle
        cx="100"
        cy="100"
        r="75"
        fill="none"
        stroke="#E6BD5C"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Arched Top Text: ★ REISH · SKILLBUN ★ */}
      <text
        fill="#382305"
        style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: '9.6px',
          fontWeight: '900',
          letterSpacing: '0.14em',
          textShadow: '0 1px 1px rgba(255, 245, 214, 0.6)',
        }}
      >
        <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
          ★ REISH · SKILLBUN ★
        </textPath>
      </text>

      {/* Arched Bottom Text: ★ OFFICIAL SEAL ★ */}
      <text
        fill="#382305"
        style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: '9.6px',
          fontWeight: '900',
          letterSpacing: '0.16em',
          textShadow: '0 1px 1px rgba(255, 245, 214, 0.6)',
        }}
      >
        <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL SEAL ★
        </textPath>
      </text>

      {/* Layer 5: Inner Beaded & Beveled Gold Rings */}
      <circle
        cx="100"
        cy="100"
        r="54"
        fill="none"
        stroke="#7A530C"
        strokeWidth="1.5"
      />
      <circle
        cx="100"
        cy="100"
        r="51"
        fill="none"
        stroke="#FFF8E0"
        strokeWidth="1"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="100"
        r="48"
        fill="none"
        stroke="#68450A"
        strokeWidth="1.6"
        strokeDasharray="1.8 2.8"
      />

      {/* Layer 6: Core Medallion Center */}
      <circle
        cx="100"
        cy="100"
        r="45"
        fill="url(#goldCore)"
        stroke="#7A530C"
        strokeWidth="1"
      />

      {/* Inner Metallic Highlight Ring */}
      <circle
        cx="100"
        cy="100"
        r="42"
        fill="none"
        stroke="#FFFDF6"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* Layer 7: REISH Stag Emblem Mark in Center (Centered without stars) */}
      <image
        href="/reish-mark.png"
        x="72"
        y="72"
        width="56"
        height="56"
        preserveAspectRatio="xMidYMid meet"
        style={{
          mixBlendMode: 'multiply',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3)) contrast(1.2)',
        }}
      />
    </svg>
  );
}
