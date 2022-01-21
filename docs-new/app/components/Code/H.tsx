import { useRef } from 'react'
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicEffect'

interface HProps {
  index: number
  id: string
}

export const H = ({ index, id, ...props }: HProps) => {
  const triggerRef = useRef<HTMLElement>(null!)

  useIsomorphicLayoutEffect(() => {
    const trigger = triggerRef.current

    const codeBlock = document.getElementById(id)
    if (!codeBlock) return

    const allHighlightWords = codeBlock.querySelectorAll('.highlight-word')
    const targetIndex = [index - 1]
    if (Math.max(...targetIndex) >= allHighlightWords.length) return

    const addClass = () =>
      targetIndex.forEach(i => allHighlightWords[i].classList.add('on'))
    const removeClass = () =>
      targetIndex.forEach(i => allHighlightWords[i].classList.remove('on'))

    trigger.addEventListener('mouseenter', addClass)
    trigger.addEventListener('mouseleave', removeClass)

    return () => {
      trigger.removeEventListener('mouseenter', addClass)
      trigger.removeEventListener('mouseleave', removeClass)
    }
  }, [])

  return <code ref={triggerRef} {...props} />
}
