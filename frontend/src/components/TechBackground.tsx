type TechBackgroundProps = {
  className?: string
  variant?: 'ambient' | 'exam'
}

const AMBIENT_SPARKLES = [
  { top: '12%', left: '8%', size: 3, delay: '0s', dur: '3.2s' },
  { top: '22%', left: '82%', size: 2, delay: '0.6s', dur: '2.6s' },
  { top: '35%', left: '18%', size: 2, delay: '1.1s', dur: '3.8s' },
  { top: '48%', left: '67%', size: 4, delay: '0.3s', dur: '4.2s' },
  { top: '63%', left: '12%', size: 2, delay: '1.8s', dur: '3s' },
  { top: '72%', left: '88%', size: 3, delay: '0.9s', dur: '3.5s' },
  { top: '15%', left: '46%', size: 2, delay: '2.2s', dur: '2.8s' },
  { top: '83%', left: '38%', size: 3, delay: '0.2s', dur: '4s' },
  { top: '28%', left: '60%', size: 2, delay: '1.4s', dur: '3.3s' },
  { top: '55%', left: '92%', size: 2, delay: '2.6s', dur: '2.9s' },
  { top: '90%', left: '70%', size: 3, delay: '0.5s', dur: '3.7s' },
  { top: '40%', left: '4%', size: 2, delay: '1.9s', dur: '3.1s' },
  { top: '8%', left: '70%', size: 2, delay: '1.2s', dur: '4.4s' },
  { top: '68%', left: '52%', size: 3, delay: '2.9s', dur: '3.4s' },
]

const EXAM_SPARKLES = [
  ...AMBIENT_SPARKLES,
  { top: '18%', left: '27%', size: 2, delay: '0.4s', dur: '2.7s' },
  { top: '31%', left: '74%', size: 3, delay: '1.6s', dur: '3.6s' },
  { top: '44%', left: '36%', size: 2, delay: '2.4s', dur: '2.9s' },
  { top: '58%', left: '78%', size: 2, delay: '0.8s', dur: '3.1s' },
  { top: '76%', left: '24%', size: 3, delay: '2.1s', dur: '3.9s' },
  { top: '86%', left: '58%', size: 2, delay: '1.3s', dur: '3.2s' },
]

export default function TechBackground({
  className = 'fixed inset-0 -z-10',
  variant = 'ambient',
}: TechBackgroundProps) {
  const sparkles = variant === 'exam' ? EXAM_SPARKLES : AMBIENT_SPARKLES

  return (
    <div aria-hidden className={`tech-bg pointer-events-none overflow-hidden ${className}`}>
      <div className="tech-grid" />
      <div className="tech-circuit" />
      <div className="tech-beam tech-beam-1" />
      <div className="tech-beam tech-beam-2" />
      <div className="tech-beam tech-beam-3" />
      <div className="tech-scan" />
      {sparkles.map((s, i) => (
        <span
          key={i}
          className="tech-spark"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}
    </div>
  )
}
