'use client';

import React from 'react';

/**
 * OfficialSeal — Ultra-prestigious 36-point scalloped gold foil seal with
 * high-contrast circular engraved typography, multi-layer bevels, and prominent REISH emblem.
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
        width: size ? (typeof size === 'number' ? `${size}px` : size) : 'clamp(112px, 12.8vw, 134px)',
        height: size ? (typeof size === 'number' ? `${size}px` : size) : 'clamp(112px, 12.8vw, 134px)',
        filter: 'drop-shadow(0 8px 20px rgba(180, 130, 20, 0.45)) drop-shadow(0 2px 5px rgba(0,0,0,0.18))',
        display: 'block',
        ...style,
      }}
      aria-label="Official REISH and SkillBun Verified Seal"
    >
      <defs>
        {/* Vibrant 24K Polished Gold Outer Gradient */}
        <radialGradient id="goldRadialOuter" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FFFDF2" />
          <stop offset="20%" stopColor="#FEEA9A" />
          <stop offset="50%" stopColor="#E5B232" />
          <stop offset="80%" stopColor="#B37D14" />
          <stop offset="100%" stopColor="#784E04" />
        </radialGradient>

        {/* Text Ring Background Gradient */}
        <radialGradient id="goldRingBg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF9E6" />
          <stop offset="35%" stopColor="#F5D26D" />
          <stop offset="70%" stopColor="#C99420" />
          <stop offset="100%" stopColor="#966708" />
        </radialGradient>

        {/* Core Medallion Background */}
        <radialGradient id="goldCore" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FFFFFB" />
          <stop offset="25%" stopColor="#FFF1BE" />
          <stop offset="60%" stopColor="#E2B13C" />
          <stop offset="85%" stopColor="#B88019" />
          <stop offset="100%" stopColor="#875608" />
        </radialGradient>

        {/* Circular text paths */}
        <path
          id="sealTopArc"
          d="M 28,100 A 72,72 0 1,1 172,100"
          fill="none"
        />
        <path
          id="sealBottomArc"
          d="M 28,100 A 72,72 0 0,0 172,100"
          fill="none"
        />
      </defs>

      {/* Layer 1: 36-Point Scalloped Sunburst Outer Foil Star */}
      <path
        d={sunburstD}
        fill="url(#goldRadialOuter)"
        stroke="#6E4402"
        strokeWidth="1.2"
      />

      {/* Layer 2: Outer Beveled Gold Rim */}
      <circle
        cx="100"
        cy="100"
        r="88.5"
        fill="none"
        stroke="#FFFDF0"
        strokeWidth="1.8"
        opacity="0.9"
      />
      <circle
        cx="100"
        cy="100"
        r="86"
        fill="none"
        stroke="#7A4F06"
        strokeWidth="1.5"
      />

      {/* Layer 3: Text Track Ring Background */}
      <circle
        cx="100"
        cy="100"
        r="84"
        fill="url(#goldRingBg)"
        stroke="#966708"
        strokeWidth="1"
      />

      {/* Outer Beaded Dot Ring */}
      <circle
        cx="100"
        cy="100"
        r="83"
        fill="none"
        stroke="#593501"
        strokeWidth="1.8"
        strokeDasharray="2.5 3.5"
      />

      {/* Arched Top Text: ★ REISH · SKILLBUN ★ (High Contrast, Bold, Crisp) */}
      <text
        fill="#1C0E00"
        style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: '12px',
          fontWeight: '900',
          letterSpacing: '0.12em',
          textShadow: '0 1px 1.5px rgba(255, 250, 225, 0.85)',
        }}
      >
        <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">
          ★ REISH · SKILLBUN ★
        </textPath>
      </text>

      {/* Arched Bottom Text: ★ OFFICIAL SEAL ★ (Upright & Bold) */}
      <text
        fill="#1C0E00"
        style={{
          fontFamily: 'Cinzel, Georgia, serif',
          fontSize: '11.5px',
          fontWeight: '900',
          letterSpacing: '0.14em',
          textShadow: '0 1px 1.5px rgba(255, 250, 225, 0.85)',
        }}
      >
        <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL SEAL ★
        </textPath>
      </text>

      {/* Layer 5: Inner Gold Border & Beaded Ring */}
      <circle
        cx="100"
        cy="100"
        r="56"
        fill="none"
        stroke="#613901"
        strokeWidth="1.8"
      />
      <circle
        cx="100"
        cy="100"
        r="53.5"
        fill="none"
        stroke="#FFFDF2"
        strokeWidth="1.2"
        opacity="0.95"
      />
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="none"
        stroke="#593501"
        strokeWidth="1.6"
        strokeDasharray="2 3"
      />

      {/* Layer 6: Core Medallion Center */}
      <circle
        cx="100"
        cy="100"
        r="47"
        fill="url(#goldCore)"
        stroke="#7A4F06"
        strokeWidth="1.5"
      />

      {/* Inner Metallic Highlight Ring */}
      <circle
        cx="100"
        cy="100"
        r="44"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.75"
      />

      {/* Layer 7: REISH Stag Emblem Mark in Center (Prominent, Centered & Crisp) */}
      <image
        href="/reish-mark.png"
        x="66"
        y="66"
        width="68"
        height="68"
        preserveAspectRatio="xMidYMid meet"
        style={{
          mixBlendMode: 'multiply',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35)) contrast(1.25)',
        }}
      />
    </svg>
  );
}
