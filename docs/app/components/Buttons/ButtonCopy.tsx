import { animated, useSprings } from '@react-spring/web'
import { CheckCircle, CopySimple } from 'phosphor-react'
import { useState } from 'react'

import { dark, styled } from '~/styles/stitches.config'

import { AccessibleIcon } from '../AccessibleIcon'

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
      onRest: () => {
        if (i === 0) {
          setTimeout(() => setCopied(false), 800)
        }
      },
    }),
    [copied]
  )

  return (
    <CopyButton className={className} type="button" onClick={handleCopyClick}>
      <AccessibleIcon label={`Copy ${children}`}>
        <AbsoluteContainer>
          {springs.map((style, i) =>
            i === 0 ? (
              <AnimatedCopy key={i} size={24} style={style} />
            ) : (
              <AnimatedCheck key={i} size={24} style={style} />
            )
          )}
        </AbsoluteContainer>
      </AccessibleIcon>
    </CopyButton>
  )
}

const CopyButton = styled('button', {
  backgroundColor: '$codeBackground',
  border: 'none',
  padding: '4px 4px 1px 4px',
  height: 32,
  width: 32,
  overflow: 'hidden',
  borderRadius: '$r4',
  ml: 14,
  cursor: 'pointer',

  hover: {
    backgroundColor: '$red40',
  },

  [`.${dark} &`]: {
    hover: {
      backgroundColor: '$red120',
    },
  },

  '@motion': {
    transition: 'background-color 250ms ease-out',
  },
})

const AbsoluteContainer = styled('span', {
  display: 'block',
  position: 'relative',
  height: '100%',
  width: '100%',
})

const AnimatedCheck = styled(animated(CheckCircle), {
  position: 'absolute',
  inset: 0,
})

const AnimatedCopy = styled(animated(CopySimple), {
  position: 'absolute',
  inset: 0,
})
