import * as React from 'react'
import { animated, usePresence } from '@react-spring/web'

import styles from './styles.module.css'

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
  const [open, setOpen] = React.useState(false)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // Critically damped: a destructive confirm should be crisp, not bouncy.
  const dialog = usePresence(open, {
    from: { opacity: 0, y: 16, scale: 0.95, blur: 4 },
    enter: { opacity: 1, y: 0, scale: 1, blur: 0 },
    // A phase `config` replaces the top-level one for that phase, so the exit
    // can be shorter and simpler than the entry.
    leave: {
      opacity: 0,
      y: 8,
      scale: 0.98,
      blur: 2,
      config: { tension: 600, friction: 49 },
    },
    config: { tension: 380, friction: 39 },
  })

  const close = () => setOpen(false)

  // A layout effect reads the focused element before the browser moves focus
  // off the now-inert page.
  React.useLayoutEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      // Runs once the page is no longer inert, so it can take focus back.
      previous?.focus()
    }
  }, [open])

  return (
    <div className={styles.page}>
      {/* An inert page keeps Tab inside the dialog. It is released as soon
          as the dialog starts leaving, so it can be reopened mid-leave. */}
      <div className={styles.card} inert={open}>
        <div className={styles.wallet}>
          <span className={styles.avatar} />
          <div>
            <strong>Savings</strong>
            <span>2.41 ETH</span>
          </div>
        </div>
        <button className={styles.danger} onClick={() => setOpen(true)}>
          Remove wallet
        </button>
      </div>

      {dialog && (
        <>
          <animated.div
            className={styles.backdrop}
            style={{ opacity: dialog.springs.opacity }}
            onClick={close}
            // Let clicks reach the page as soon as the dialog starts leaving.
            inert={dialog.phase === 'leave'}
          />
          <div className={styles.positioner}>
            <animated.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
              tabIndex={-1}
              inert={dialog.phase === 'leave'}
              className={styles.dialog}
              // With reduced motion, keep the fade and drop the movement.
              style={
                reduced
                  ? { opacity: dialog.springs.opacity }
                  : {
                      opacity: dialog.springs.opacity,
                      y: dialog.springs.y,
                      scale: dialog.springs.scale,
                      filter: dialog.springs.blur.to(
                        b => `blur(${Math.max(0, b)}px)`
                      ),
                    }
              }
            >
              <button
                className={styles.close}
                onClick={close}
                aria-label="Close"
              >
                ×
              </button>
              <div className={styles.icon} aria-hidden="true">
                !
              </div>
              <h2 id="dialog-title">Remove this wallet?</h2>
              <p id="dialog-description">
                You can add it back at any time with your recovery phrase. Your
                funds stay on the blockchain.
              </p>
              <div className={styles.actions}>
                <button className={styles.secondary} onClick={close}>
                  Cancel
                </button>
                <button className={styles.danger} onClick={close}>
                  Remove
                </button>
              </div>
            </animated.div>
          </div>
        </>
      )}
    </div>
  )
}
