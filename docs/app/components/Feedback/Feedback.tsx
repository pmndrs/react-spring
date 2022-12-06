import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ThumbsDown, ThumbsUp } from 'phosphor-react'

import { Heading } from '~/components/Text/Heading'

import { styled } from '~/styles/stitches.config'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import { EventNames, firePlausibleEvent } from '~/helpers/analytics'

interface FeedbackProps {
  location?: string
}

export const Feedback = ({ location }: FeedbackProps) => {
  const [hasClicked, setHasClicked] = React.useState(false)
  const isDarkMode = useIsDarkTheme()

  const handleClick = (type: 'upvote' | 'downvote') => () => {
    setHasClicked(true)

    const name =
      type === 'upvote' ? EventNames.DocLiked : EventNames.DocDisliked

    if (location) {
      firePlausibleEvent({
        name,
        additionalProps: {
          location,
        },
      })
    }
  }

  return (
    <div>
      <Heading
        tag="h4"
        fontStyle="$XS"
        weight="$bold"
        css={{ color: '$steel40' }}>
        Found this helpful?
      </Heading>
      <Stack>
        <FeedbackButton onClick={handleClick('upvote')} disabled={hasClicked}>
          <ThumbsUp size={16} weight={isDarkMode ? 'light' : 'regular'} />
        </FeedbackButton>
        <FeedbackButton onClick={handleClick('downvote')} disabled={hasClicked}>
          <ThumbsDown size={16} weight={isDarkMode ? 'light' : 'regular'} />
        </FeedbackButton>
      </Stack>
    </div>
  )
}

interface FeedbackButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

const FeedbackButton = ({
  children,
  onClick,
  disabled = false,
}: FeedbackButtonProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <Popover.Root>
      <Trigger disabled={disabled} onClick={handleClick}>
        <span>{children}</span>
      </Trigger>
      <Popover.Portal>
        <Popover.Content>
          <Popover.Close />
          Hello!
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

const Stack = styled('div', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 20,
  mt: '$15',
  mb: '$40',
})

const Trigger = styled(Popover.Trigger, {
  background: 'transparent',
  border: 'solid 1px $steel40',
  borderRadius: '$r8',
  padding: '$10',
  color: '$steel40',
  cursor: 'pointer',
  transition:
    'color 200ms ease-out, border-color 200ms ease-out, opacity 200ms ease-out',

  '&:disabled': {
    pointerEvents: 'none',
    opacity: 0.5,
  },

  '& > span': {
    display: 'block',
  },

  '&:hover': {
    borderColor: '$steel80',
    color: '$steel80',
  },
})
