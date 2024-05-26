import { animated, useSprings } from '@react-spring/web'
import { CheckCircle, CopySimple } from 'phosphor-react'
import { useState } from 'react'

import { AccessibleIcon } from '../AccessibleIcon'
import { absoluteContainer, animatedIcon, copyButton } from './ButtonCopy.css'
import clsx from 'clsx'

interface ButtonCopyProps {
  children: string
  className?: string
}

export const ButtonCopy = ({ children, className }: ButtonCopyProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(children)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = children

      // Avoid scrolling to bottom
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Unable to copy')
      }

      document.body.removeChild(textArea)
    } finally {
      setCopied(true)
    }
  }

  const [springs] = useSprings(
    2,
    i => ({
      scale: copied && i === 0 ? 0 : !copied && i === 1 ? 0 : 1,
      y: '-50%',
      x: '-50%',
      onRest: () => {
        if (i === 0) {
          setTimeout(() => setCopied(false), 800)
        }
      },
    }),
    [copied]
  )

  return (
    <button
      className={clsx(copyButton, className)}
      type="button"
      onClick={handleCopyClick}
    >
      <AccessibleIcon className={absoluteContainer} label={`Copy ${children}`}>
        <span>
          {springs.map((style, i) =>
            i === 0 ? (
              <AnimatedCopy
                className={animatedIcon}
                key={i}
                size={24}
                style={style}
              />
            ) : (
              <AnimatedCheck
                className={animatedIcon}
                key={i}
                size={24}
                style={style}
              />
            )
          )}
        </span>
      </AccessibleIcon>
    </button>
  )
}

const AnimatedCheck = animated(CheckCircle)

const AnimatedCopy = animated(CopySimple)
