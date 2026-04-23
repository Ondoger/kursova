'use client';

import { motion } from 'framer-motion';
import type { AnimationState } from '@/types';

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  skin: '#fde8d8',
  skinShade: '#f5c4a8',
  skinDeep: '#e8a888',
  skinHighlight: '#fff5f0',
  hair: '#7b2fa0',
  hairMid: '#5a1f7a',
  hairDark: '#3a0f52',
  hairLight: '#a855c8',
  hairSheen: '#c084e8',
  eyeBlue: '#3b82f6',
  eyeBlueDeep: '#1d4ed8',
  eyeBlueLight: '#93c5fd',
  eyeWhite: '#f0f8ff',
  pupil: '#0f172a',
  eyeHighlight: '#ffffff',
  eyeReflect: '#bfdbfe',
  earPink: '#f9a8d4',
  blush: '#fda4af',
  blouseBase: '#f8fafc',
  blouseShade: '#e2e8f0',
  blouseShadow: '#cbd5e1',
  ribbonDark: '#1e1b4b',
  ribbonMid: '#312e81',
  skirtBase: '#4c1d95',
  skirtShade: '#3b0764',
  skirtHighlight: '#7c3aed',
  choker: '#7c3aed',
  jewelry: '#fcd34d',
  tailBase: '#7b2fa0',
  tailTip: '#d8b4fe',
};

const abs: React.CSSProperties = { position: 'absolute' };
const rel: React.CSSProperties = { position: 'relative' };

function radial(
  w: number, h: number,
  hi: string, mid: string, dark: string,
  ox = 35, oy = 28,
  extras?: React.CSSProperties,
): React.CSSProperties {
  return {
    width: w, height: h,
    borderRadius: '50%',
    background: `radial-gradient(circle at ${ox}% ${oy}%, ${hi} 0%, ${mid} 45%, ${dark} 100%)`,
    boxShadow: `inset -3px -4px 10px ${dark}99, inset 2px 2px 8px ${hi}66`,
    ...extras,
  };
}

function Blush({ side }: { side: 'left' | 'right' }) {
  return (
    <div style={{
      ...abs,
      top: '60%',
      [side === 'left' ? 'left' : 'right']: '8%',
      width: 20, height: 11,
      borderRadius: '50%',
      background: C.blush,
      opacity: 0.5,
      filter: 'blur(4px)',
    }} />
  );
}

function AnimeEye({
  side, isAsleep, isHappy, isShocked,
}: {
  side: 'left' | 'right';
  isAsleep: boolean; isHappy: boolean; isShocked: boolean;
}) {
  const pos: React.CSSProperties = side === 'left'
    ? { ...abs, top: '44%', left: '14%' }
    : { ...abs, top: '44%', right: '14%' };

  if (isAsleep) {
    return (
      <div style={{ ...pos, width: 30, height: 16 }}>
        <svg viewBox="0 0 30 16" width="30" height="16">
          <path d="M 2 10 Q 15 0 28 10" stroke={C.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
          {[6, 15, 24].map(x => (
            <line key={x} x1={x} y1="10" x2={x - 1} y2="15" stroke={C.hair} strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
      </div>
    );
  }

  if (isHappy) {
    return (
      <div style={{ ...pos, width: 30, height: 20 }}>
        <svg viewBox="0 0 30 20" width="30" height="20">
          <path d="M 1 14 Q 15 2 29 14" stroke={C.hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M 4 14 Q 15 2 26 14" stroke={C.eyeBlueLight} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
          {[6, 15, 24].map(x => (
            <line key={x} x1={x} y1="14" x2={x - 1} y2="19" stroke={C.hair} strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
      </div>
    );
  }

  const eW = isShocked ? 28 : 26;
  const eH = isShocked ? 34 : 30;
  const irisR = isShocked ? 11 : 10;
  const pupilR = isShocked ? 7 : 6;

  return (
    <div style={{
      ...pos,
      width: eW, height: eH,
      borderRadius: isShocked ? '40% 40% 45% 45%' : '48% 48% 50% 50%',
      background: `radial-gradient(ellipse at 38% 28%, ${C.eyeWhite} 0%, #dbeafe 55%, #bfdbfe 100%)`,
      boxShadow: `0 0 0 1.5px ${C.eyeBlueDeep}44`,
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        ...rel,
        width: irisR * 2, height: irisR * 2,
        borderRadius: '50%',
        background: `radial-gradient(circle at 35% 25%, ${C.eyeBlueLight} 0%, ${C.eyeBlue} 40%, ${C.eyeBlueDeep} 75%, ${C.pupil} 100%)`,
        marginTop: 4,
        flexShrink: 0,
      }}>
        <div style={{
          ...abs, top: '28%', left: '22%',
          width: pupilR * 1.4, height: pupilR * 1.4,
          borderRadius: '50%',
          background: C.pupil,
        }} />
        <div style={{
          ...abs, top: '8%', right: '10%',
          width: pupilR * 0.85, height: pupilR * 0.85,
          borderRadius: '50%', background: C.eyeHighlight, opacity: 0.95,
        }} />
        <div style={{
          ...abs, bottom: '14%', left: '10%',
          width: pupilR * 0.45, height: pupilR * 0.45,
          borderRadius: '50%', background: C.eyeHighlight, opacity: 0.7,
        }} />
        <div style={{
          ...abs, inset: 0, borderRadius: '50%',
          boxShadow: `inset 0 0 6px ${C.eyeBlueDeep}88`,
        }} />
      </div>
      <svg viewBox="0 0 28 8" width={eW} height="8"
        style={{ ...abs, top: 0, left: 0 }}>
        <path d={`M 0 7 Q 14 -1 ${eW} 7`}
          stroke={C.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
        <line x1="3" y1="6" x2="0" y2="8" stroke={C.hair} strokeWidth="1.5" strokeLinecap="round" />
        <line x1={eW - 3} y1="6" x2={eW} y2="8" stroke={C.hair} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 28 4" width={eW} height="4"
        style={{ ...abs, bottom: 0, left: 0, opacity: 0.4 }}>
        <path d={`M 4 0 Q 14 4 ${eW - 4} 0`}
          stroke={C.hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CatEar({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div style={{
      ...abs,
      top: -18,
      [isLeft ? 'left' : 'right']: '16%',
      width: 30, height: 36,
      background: `linear-gradient(160deg, ${C.hairSheen} 0%, ${C.hair} 40%, ${C.hairDark} 100%)`,
      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      filter: `drop-shadow(0 -2px 6px ${C.hairDark}66)`,
      zIndex: 4,
    }}>
      <div style={{
        ...abs,
        bottom: '10%', left: '22%',
        width: 16, height: 20,
        background: `linear-gradient(160deg, #fce7f3 0%, ${C.earPink} 100%)`,
        clipPath: 'polygon(50% 0%, 90% 100%, 10% 100%)',
        opacity: 0.9,
      }} />
    </div>
  );
}

function Hair({ isAsleep }: { isAsleep: boolean }) {
  return (
    <>
      <div style={{
        ...abs,
        top: '-2%', left: '50%',
        transform: 'translateX(-50%)',
        width: 112, height: 68,
        borderRadius: '56px 56px 8px 8px',
        background: `radial-gradient(ellipse at 38% 28%, ${C.hairSheen} 0%, ${C.hair} 30%, ${C.hairMid} 65%, ${C.hairDark} 100%)`,
        zIndex: 4,
        boxShadow: `0 4px 20px ${C.hairDark}aa`,
      }}>
        {[
          { left: '5%', w: 18, h: 32, r: -22, br: '6px 10px 14px 6px' },
          { left: '20%', w: 14, h: 38, r: -8, br: '5px 8px 12px 5px' },
          { left: '36%', w: 16, h: 42, r: 0, br: '5px 5px 12px 12px' },
          { left: '54%', w: 16, h: 40, r: 6, br: '5px 5px 12px 12px' },
          { left: '70%', w: 14, h: 36, r: 14, br: '5px 8px 12px 5px' },
          { left: '83%', w: 18, h: 30, r: 24, br: '10px 6px 6px 14px' },
        ].map((b, i) => (
          <div key={i} style={{
            ...abs,
            top: '60%', left: b.left,
            width: b.w, height: b.h,
            borderRadius: b.br,
            background: `linear-gradient(180deg, ${C.hairSheen} 0%, ${C.hair} 45%, ${C.hairDark} 100%)`,
            transform: `rotate(${b.r}deg)`,
            transformOrigin: 'top center',
            filter: `drop-shadow(0 2px 4px ${C.hairDark}55)`,
            zIndex: 5,
          }} />
        ))}
      </div>

      {(['left', 'right'] as const).map(side => (
        <div key={side} style={{
          ...abs,
          top: '28%',
          [side === 'left' ? 'left' : 'right']: '-6%',
          width: 22,
          height: isAsleep ? 130 : 140,
          borderRadius: side === 'left' ? '12px 4px 8px 16px' : '4px 12px 16px 8px',
          background: `linear-gradient(180deg, ${C.hairSheen} 0%, ${C.hair} 25%, ${C.hairMid} 60%, ${C.hairDark} 100%)`,
          transform: `rotate(${side === 'left' ? '-4deg' : '4deg'}) skewY(${side === 'left' ? '-2deg' : '2deg'})`,
          zIndex: 3,
          filter: `drop-shadow(${side === 'left' ? '-2px' : '2px'} 4px 8px ${C.hairDark}66)`,
        }}>
          <div style={{
            ...abs,
            top: '8%', [side === 'left' ? 'right' : 'left']: '20%',
            width: 5, height: '60%',
            borderRadius: '3px',
            background: `linear-gradient(180deg, ${C.hairSheen}88 0%, transparent 100%)`,
          }} />
        </div>
      ))}

      <CatEar side="left" />
      <CatEar side="right" />
    </>
  );
}

function Head({ isAsleep, isHappy, isShocked }: {
  isAsleep: boolean; isHappy: boolean; isShocked: boolean;
}) {
  return (
    <div style={{ ...rel, width: 116, height: 130, margin: '0 auto' }}>
      <div style={{
        ...abs,
        top: '10%', left: '50%',
        transform: 'translateX(-50%)',
        ...radial(106, 114, C.skinHighlight, C.skin, C.skinShade, 38, 30),
        zIndex: 2,
      }}>
        <AnimeEye side="left" isAsleep={isAsleep} isHappy={isHappy} isShocked={isShocked} />
        <AnimeEye side="right" isAsleep={isAsleep} isHappy={isHappy} isShocked={isShocked} />

        <div style={{
          ...abs, top: '62%', left: '50%',
          transform: 'translateX(-50%)',
          width: 8, height: 6,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.skinDeep} 40%, transparent 100%)`,
          opacity: 0.45,
        }} />

        <div style={{ ...abs, bottom: '22%', left: '50%', transform: 'translateX(-50%)' }}>
          <svg viewBox="0 0 34 16" width="34" height="16">
            <path
              d={isShocked
                ? 'M 10 4 Q 17 14 24 4'
                : isAsleep
                  ? 'M 8 8 Q 17 14 26 8'
                  : isHappy
                    ? 'M 4 6 Q 17 18 30 6'
                    : 'M 8 7 Q 17 15 26 7'
              }
              stroke="#c2185b"
              strokeWidth="2"
              fill={isHappy ? '#fda4af22' : 'none'}
              strokeLinecap="round"
            />
            {isHappy && (
              <>
                <rect x="12" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9" />
                <rect x="18" y="8" width="4" height="4" rx="1" fill="white" opacity="0.9" />
              </>
            )}
          </svg>
        </div>

        {!isShocked && <><Blush side="left" /><Blush side="right" /></>}
        {isHappy && <><Blush side="left" /><Blush side="right" /></>}
      </div>

      <div style={{ ...abs, top: 0, left: 0, right: 0, zIndex: 3 }}>
        <Hair isAsleep={isAsleep} />
      </div>

      {isShocked && (
        <motion.div
          style={{
            ...abs, top: '22%', right: '4%',
            width: 12, height: 18,
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            background: 'linear-gradient(160deg, #bfdbfe 0%, #3b82f6 100%)',
            transform: 'rotate(18deg)',
          }}
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.0, repeat: Infinity }}
        />
      )}
    </div>
  );
}

function Neck() {
  return (
    <div style={{
      ...abs,
      top: '46%', left: '50%',
      transform: 'translateX(-50%)',
      width: 30, height: 24,
      background: `linear-gradient(180deg, ${C.skin} 0%, ${C.skinShade} 100%)`,
      borderRadius: '2px',
      zIndex: 1,
    }}>
      <div style={{
        ...abs,
        top: '35%', left: '-4px', right: '-4px',
        height: 8,
        background: `linear-gradient(90deg, ${C.choker}, #9333ea, ${C.choker})`,
        borderRadius: '4px',
        boxShadow: `0 0 8px ${C.choker}88`,
      }}>
        <div style={{
          ...abs,
          bottom: -6, left: '50%', transform: 'translateX(-50%)',
          width: 7, height: 7,
          borderRadius: '50%',
          background: C.jewelry,
          boxShadow: `0 0 6px ${C.jewelry}`,
        }} />
      </div>
    </div>
  );
}

function Blouse() {
  return (
    <div style={{
      ...abs,
      bottom: 68, left: '50%',
      transform: 'translateX(-50%)',
      width: 88, height: 90,
      borderRadius: '36% 36% 42% 42%',
      background: `radial-gradient(ellipse at 35% 25%, ${C.blouseBase} 0%, ${C.blouseShade} 55%, ${C.blouseShadow} 100%)`,
      boxShadow: `inset -5px -8px 16px ${C.blouseShadow}`,
      zIndex: 1,
    }}>
      <div style={{
        ...abs,
        top: '8%', left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '10px solid transparent',
        borderRight: '10px solid transparent',
        borderTop: `24px solid ${C.blouseShade}`,
      }} />
      <div style={{
        ...abs,
        top: '5%', left: '50%', transform: 'translateX(-50%)',
        width: 28, height: 20,
        borderRadius: '50% 50% 0 0',
        background: C.blouseBase,
        borderBottom: `2px solid ${C.blouseShadow}`,
      }} />
      <div style={{
        ...abs,
        top: '28%', left: '50%', transform: 'translateX(-50%)',
        width: 32, height: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <div style={{
          width: 13, height: 10,
          background: `linear-gradient(135deg, ${C.ribbonMid}, ${C.ribbonDark})`,
          borderRadius: '50% 0 50% 50%',
          transform: 'rotate(-20deg)',
        }} />
        <div style={{
          width: 6, height: 8,
          borderRadius: '50%',
          background: C.ribbonDark,
        }} />
        <div style={{
          width: 13, height: 10,
          background: `linear-gradient(225deg, ${C.ribbonMid}, ${C.ribbonDark})`,
          borderRadius: '0 50% 50% 50%',
          transform: 'rotate(20deg)',
        }} />
      </div>
      {[52, 65, 78].map((top, i) => (
        <div key={i} style={{
          ...abs, top: `${top}%`, left: '50%', transform: 'translateX(-50%)',
          width: 5, height: 5,
          borderRadius: '50%',
          background: C.blouseShadow,
          boxShadow: `0 0 3px ${C.blouseShadow}`,
        }} />
      ))}
    </div>
  );
}

function Skirt() {
  return (
    <div style={{
      ...abs,
      bottom: 40, left: '50%', transform: 'translateX(-50%)',
      width: 96, height: 36,
      borderRadius: '4px 4px 16px 16px',
      background: `linear-gradient(180deg, ${C.skirtHighlight} 0%, ${C.skirtBase} 40%, ${C.skirtShade} 100%)`,
      boxShadow: `inset -4px -6px 12px ${C.skirtShade}`,
      zIndex: 0,
    }}>
      {[18, 36, 54, 72].map(x => (
        <div key={x} style={{
          ...abs, top: 0, left: x, bottom: 0, width: 1,
          background: `${C.skirtShade}88`,
        }} />
      ))}
    </div>
  );
}

function Arm({ side, pose }: { side: 'left' | 'right'; pose: 'idle' | 'up' | 'typing' }) {
  const isLeft = side === 'left';
  const rotate =
    pose === 'up' ? (isLeft ? -115 : 115)
    : pose === 'typing' ? (isLeft ? 45 : -45)
    : (isLeft ? 18 : -18);

  return (
    <div style={{
      ...abs,
      bottom: 95, [isLeft ? 'left' : 'right']: '10%',
      width: 22, height: 56,
      borderRadius: '11px',
      background: `linear-gradient(180deg, ${C.blouseBase} 0%, ${C.blouseShade} 40%, ${C.blouseShadow} 100%)`,
      transformOrigin: 'top center',
      transform: `rotate(${rotate}deg)`,
      boxShadow: `${isLeft ? '-' : ''}3px 4px 10px ${C.blouseShadow}88`,
      zIndex: 0,
      transition: 'transform 0.4s ease',
    }}>
      <div style={{
        ...abs, bottom: -12, left: '50%', transform: 'translateX(-50%)',
        ...radial(22, 22, C.skinHighlight, C.skin, C.skinShade, 35, 30),
      }} />
    </div>
  );
}

function Leg({ side }: { side: 'left' | 'right' }) {
  return (
    <div style={{
      ...abs,
      bottom: 14,
      [side === 'left' ? 'left' : 'right']: '27%',
      width: 28, height: 44,
      borderRadius: '10px 10px 6px 6px',
      background: `linear-gradient(180deg, ${C.skirtBase} 0%, ${C.skirtShade} 100%)`,
      boxShadow: `${side === 'left' ? '-' : ''}2px 4px 8px #1e1b4b55`,
    }}>
      <div style={{
        ...abs, bottom: -14, left: '50%',
        transform: `translateX(-50%) rotate(${side === 'left' ? '-5deg' : '5deg'})`,
        width: 38, height: 18,
        borderRadius: '12px 12px 8px 8px',
        background: `radial-gradient(ellipse at 38% 28%, #1e1b4b, #0f0a2e 100%)`,
        boxShadow: '0 4px 8px #0f0a2e88',
      }} />
    </div>
  );
}

function CatTail() {
  return (
    <motion.div
      style={{
        ...abs,
        bottom: '28%', right: '-5%',
        width: 16, height: 80,
        borderRadius: '8px 4px 20px 8px',
        background: `linear-gradient(180deg, ${C.tailBase} 0%, ${C.hair} 60%, ${C.tailTip} 100%)`,
        transformOrigin: 'bottom left',
        zIndex: 0,
        filter: `drop-shadow(2px 4px 8px ${C.hairDark}66)`,
      }}
      animate={{ rotate: ['-8deg', '8deg', '-8deg'] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Shadow() {
  return (
    <div style={{
      ...abs, bottom: 2, left: '50%', transform: 'translateX(-50%)',
      width: 88, height: 14, borderRadius: '50%',
      background: 'radial-gradient(ellipse, #0f0a2e99 0%, transparent 70%)',
      filter: 'blur(4px)',
    }} />
  );
}

// Warm muted dots instead of sparkle emoji
function WarmDots() {
  const pts = [
    { top: '2%', left: '2%' }, { top: '5%', right: '5%' },
    { top: '28%', left: '-8%' }, { top: '22%', right: '-6%' },
  ];
  return (
    <>
      {pts.map((p, i) => (
        <motion.div key={i}
          style={{
            ...abs, ...p,
            width: 5 + (i % 2) * 3,
            height: 5 + (i % 2) * 3,
            borderRadius: '50%',
            backgroundColor: i % 2 === 0 ? '#d4a843' : '#b4a7d6',
            userSelect: 'none', pointerEvents: 'none',
          }}
          animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
        />
      ))}
    </>
  );
}

export function GotchiCharacter3D({ animationState }: { animationState: AnimationState }): JSX.Element {
  const isAsleep = animationState === 'sleeping' || animationState === 'focus_lost';
  const isHappy  = animationState === 'ci_success' || animationState === 'celebrating' || animationState === 'level_up';
  const isShocked = animationState === 'ci_failure';
  const isTyping  = animationState === 'typing' || animationState === 'idle';
  const armPose: 'idle' | 'up' | 'typing' = isHappy ? 'up' : isTyping ? 'typing' : 'idle';

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      perspective: 700,
    }}
      aria-label="CommitGotchi anime cat-girl"
      role="img"
    >
      <div style={{
        position: 'absolute', inset: 0,
        transformStyle: 'preserve-3d',
        transform: 'rotateY(-5deg) rotateX(3deg)',
      }}>
        <div style={{ ...abs, top: '1%', left: '50%', transform: 'translateX(-50%)', width: 116, height: 140, zIndex: 3 }}>
          <Head isAsleep={isAsleep} isHappy={isHappy} isShocked={isShocked} />
        </div>

        <Neck />
        <Blouse />
        <Skirt />
        <Arm side="left" pose={armPose} />
        <Arm side="right" pose={armPose} />
        <Leg side="left" />
        <Leg side="right" />
        <CatTail />

        <div style={{ ...abs, bottom: 0, left: 0, right: 0 }}>
          <Shadow />
        </div>

        {isHappy && <WarmDots />}
      </div>
    </div>
  );
}
