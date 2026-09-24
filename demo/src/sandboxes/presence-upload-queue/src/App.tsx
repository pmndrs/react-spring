import * as React from 'react'
import { animated, usePresence, usePresenceList } from '@react-spring/web'

import styles from './styles.module.css'

interface Upload {
  id: number
  name: string
  bytes: number
  progress: number
  speed: number
}

const NAMES = [
  'holiday-photos.zip',
  'q3-report.pdf',
  'logo-final-v2.svg',
  'interview-cut.mp4',
  'meeting-notes.md',
  'budget-2026.xlsx',
  'hero@2x.png',
  'podcast-ep12.mp3',
  'contract-signed.pdf',
]

const MAX_ROWS = 6
const ROW_HEIGHT = 64

// Critically damped (friction ≈ 2√(tension × mass)), and exits are quicker
// than entries.
const ENTER = { mass: 1, tension: 300, friction: 35 }
const LEAVE = { mass: 1, tension: 500, friction: 45 }

let nextId = 0
const randomUploads = (count: number): Upload[] =>
  Array.from({ length: count }, () => ({
    id: nextId++,
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    bytes: Math.round(200_000 + Math.random() * 48_000_000),
    progress: 0,
    speed: 0.04 + Math.random() * 0.1,
  }))

const formatSize = (bytes: number) =>
  bytes > 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} MB`
    : `${Math.round(bytes / 1000)} KB`

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribe = (onChange: () => void) => {
  const mql = window.matchMedia(REDUCED_MOTION)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const usePrefersReducedMotion = () =>
  React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches
  )

export default function App() {
  const [files, setFiles] = React.useState<Upload[]>(() => randomUploads(2))
  const reduced = usePrefersReducedMotion()

  const rows = usePresenceList(files, {
    keys: file => file.id,
    from: { opacity: 0, height: 0, y: 8, x: 0 },
    enter: { opacity: 1, height: ROW_HEIGHT, y: 0, x: 0, config: ENTER },
    leave: {
      opacity: 0,
      height: 0,
      x: 12,
      config: LEAVE,
      // With reduced motion, the gap closes instantly once the row has faded.
      delay: key => (reduced && key === 'height' ? 150 : 0),
    },
    trail: 40,
    immediate: key => reduced && key !== 'opacity',
  })

  // `rows` still holds leaving rows, so this waits until the last one is gone.
  const empty = usePresence(rows.length === 0, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: ENTER,
  })

  React.useEffect(() => {
    const id = setInterval(() => {
      setFiles(fs =>
        fs.some(f => f.progress < 1)
          ? fs.map(f => ({ ...f, progress: Math.min(1, f.progress + f.speed) }))
          : fs
      )
    }, 300)
    return () => clearInterval(id)
  }, [])

  const add = () =>
    setFiles(fs => [
      ...randomUploads(
        Math.min(1 + Math.floor(Math.random() * 3), MAX_ROWS - fs.length)
      ),
      ...fs,
    ])
  const remove = (id: number) => setFiles(fs => fs.filter(f => f.id !== id))
  const clearCompleted = () => setFiles(fs => fs.filter(f => f.progress < 1))

  const completed = files.filter(f => f.progress === 1).length

  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="uploads-title">
        <header className={styles.header}>
          <h2 id="uploads-title">Uploads</h2>
          <span>
            {completed} of {files.length} complete
          </span>
        </header>

        <div className={styles.list}>
          <ul aria-labelledby="uploads-title">
            {rows.map(({ key, item, springs, phase }) => (
              <animated.li
                key={key}
                className={styles.row}
                style={
                  reduced
                    ? { opacity: springs.opacity, height: springs.height }
                    : springs
                }
                inert={phase === 'leave'}
              >
                <span className={styles.icon}>
                  {item.name.split('.').pop()}
                </span>
                <div className={styles.details}>
                  <div className={styles.meta}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.size}>
                      {item.progress === 1
                        ? formatSize(item.bytes)
                        : `${Math.round(item.progress * 100)}%`}
                    </span>
                  </div>
                  <div
                    className={styles.track}
                    role="progressbar"
                    aria-label={`${item.name} upload`}
                    aria-valuenow={Math.round(item.progress * 100)}
                  >
                    <div
                      className={styles.bar}
                      data-done={item.progress === 1}
                      style={{ transform: `scaleX(${item.progress})` }}
                    />
                  </div>
                </div>
                {item.progress === 1 ? (
                  <span className={styles.tick} aria-label="Complete">
                    ✓
                  </span>
                ) : null}
                <button
                  className={styles.remove}
                  onClick={() => remove(item.id)}
                  aria-label={`Remove ${item.name}`}
                >
                  ×
                </button>
              </animated.li>
            ))}
          </ul>
          {empty && (
            <animated.p className={styles.empty} style={empty.springs}>
              No uploads
            </animated.p>
          )}
        </div>

        <footer className={styles.footer}>
          <button
            className={styles.secondary}
            onClick={clearCompleted}
            disabled={completed === 0}
          >
            Clear completed
          </button>
          <button
            className={styles.primary}
            onClick={add}
            disabled={files.length >= MAX_ROWS}
          >
            Add files
          </button>
        </footer>
      </section>
    </div>
  )
}
