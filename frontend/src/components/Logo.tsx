import { useId } from 'react'

type LogoProps = {
  /** Pixel size of the square emblem. */
  size?: number
  className?: string
}

/**
 * ExamRush brand mark: a polished exam card with a fast check stroke.
 */
export default function Logo({ size = 36, className = '' }: LogoProps) {
  const id = useId().replace(/:/g, '')
  const bgId = `er-bg-${id}`
  const glowId = `er-glow-${id}`
  const paperId = `er-paper-${id}`
  const checkId = `er-check-${id}`
  const shadowId = `er-shadow-${id}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="ExamRush"
      className={className}
    >
      <defs>
        <linearGradient id={bgId} x1="4" y1="2" x2="29" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="0.5" stopColor="#2563eb" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id={glowId} cx="0" cy="0" r="1" gradientTransform="matrix(20 0 0 20 23 7)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fef3c7" stopOpacity="0.72" />
          <stop offset="0.48" stopColor="#60a5fa" stopOpacity="0.26" />
          <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={paperId} x1="8" y1="6" x2="24" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dff7ff" />
        </linearGradient>
        <linearGradient id={checkId} x1="10" y1="20" x2="23" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="0.55" stopColor="#22c55e" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#020617" floodOpacity="0.28" />
        </filter>
      </defs>

      <rect x="1" y="1" width="30" height="30" rx="8.5" fill={`url(#${bgId})`} />
      <rect x="1" y="1" width="30" height="30" rx="8.5" fill={`url(#${glowId})`} />
      <path d="M5 10.5h6.6M4.2 15.5h4.4M22 7.2h4.4" stroke="#bfdbfe" strokeWidth="1.55" strokeLinecap="round" opacity="0.72" />

      <g filter={`url(#${shadowId})`} transform="rotate(-5 16 16)">
        <rect x="8.2" y="6.6" width="16.7" height="20" rx="4" fill={`url(#${paperId})`} />
        <rect x="12.3" y="4.4" width="8.4" height="5.5" rx="2.4" fill="#facc15" />
        <rect x="13.5" y="5.6" width="6" height="2.1" rx="1.05" fill="#fff7cc" opacity="0.7" />
        <path d="M12.1 13h7.5M12.1 16.2h4.1M12.1 22.7h7.2" stroke="#94a3b8" strokeWidth="1.35" strokeLinecap="round" opacity="0.72" />
      </g>

      <path
        d="M10.6 18.1l4.1 4.1 8-10.3"
        stroke={`url(#${checkId})`}
        strokeWidth="3.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21.6 18.8l4.3-.7-2.2 3.7 3.7-.7" stroke="#fef3c7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
    </svg>
  )
}
