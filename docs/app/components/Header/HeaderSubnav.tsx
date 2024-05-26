import { useRef, WheelEvent } from 'react'
import {
  animated,
  useIsomorphicLayoutEffect,
  useSprings,
} from '@react-spring/web'

import { SubtitleSchemaItem } from '../../../scripts/docs/navigation'
import clsx from 'clsx'
import {
  gradientLeft,
  gradientRight,
  subNavAnchor,
  subNavContainer,
  subNavList,
  subNavListItem,
  subNavScroller,
} from './HeaderSubnav.css'

interface HeaderSubnavProps {
  className?: string
  subnav: SubtitleSchemaItem
}

export const HeaderSubnav = ({ className, subnav }: HeaderSubnavProps) => {
  const subNavScrollRef = useRef<HTMLDivElement>(null!)
  const [springs, ref] = useSprings(2, () => ({
    opacity: 0,
  }))

  const handleScroll = (e: WheelEvent<HTMLDivElement>) => {
    const el = e.target as HTMLDivElement

    if (el.scrollLeft === el.scrollWidth - el.clientWidth) {
      ref.start(i => ({
        opacity: Number(!i),
      }))
    } else if (el.scrollLeft === 0) {
      ref.start(i => ({
        opacity: i,
      }))
    } else {
      ref.start(() => ({
        opacity: 1,
      }))
    }
  }

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => {
      const el = subNavScrollRef.current
      if (el.scrollWidth > el.clientWidth && el.scrollLeft === 0) {
        ref.start(i => ({
          opacity: i,
          immediate: true,
        }))
      } else if (el.scrollLeft > 0) {
        handleScroll({ target: el } as unknown as WheelEvent<HTMLDivElement>)
      } else {
        ref.start(() => ({
          opacity: 0,
        }))
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <nav className={clsx(subNavContainer, className)}>
      <animated.div className={gradientLeft} style={{ ...springs[0] }} />
      <div
        className={subNavScroller}
        ref={subNavScrollRef}
        onScroll={handleScroll}
      >
        <ul className={subNavList}>
          {subnav.map(({ href, label, id }) => (
            <li className={subNavListItem} key={id}>
              <a className={subNavAnchor} href={href}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <animated.div className={gradientRight} style={{ ...springs[1] }} />
    </nav>
  )
}
