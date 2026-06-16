import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

type Props = {
  page: number
  pageCount: number
  onChange: (page: number) => void
  className?: string
}

function buildPages(page: number, pageCount: number): (number | 'gap')[] {
  const set = new Set<number>([1, pageCount, page, page - 1, page + 1])
  const arr = [...set].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  let prev = 0
  for (const p of arr) {
    if (p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

export default function Pagination({ page, pageCount, onChange, className = '' }: Props) {
  if (pageCount <= 1) return null
  const go = (p: number) => onChange(Math.min(pageCount, Math.max(1, p)))
  const pages = buildPages(page, pageCount)

  const arrowCls =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'

  return (
    <nav className={`flex items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button onClick={() => go(page - 1)} disabled={page <= 1} className={arrowCls} aria-label="Previous page">
        <LuChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors ${
              p === page
                ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/30'
                : 'border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button onClick={() => go(page + 1)} disabled={page >= pageCount} className={arrowCls} aria-label="Next page">
        <LuChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
