import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ThumbsDown, ThumbsUp, X } from 'phosphor-react'
import { useLocation, useFetcher } from '@remix-run/react'

import { Heading } from '~/components/Text/Heading'
import { Copy } from '~/components/Text/Copy'
import { GradientButton } from '~/components/Buttons/GradientButton'

import { dark, styled } from '~/styles/stitches.config'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import { EventNames, firePlausibleEvent } from '~/helpers/analytics'

interface FeedbackProps {
  location?: string
}

export const Feedback = ({ location }: FeedbackProps) => {
  const [pageTitle, setPageTitle] = React.useState('')
  const [selected, setSelected] = React.useState<'upvote' | 'downvote' | null>(
    null
  )
  const isDarkMode = useIsDarkTheme()

  const handleClick = (type: 'upvote' | 'downvote') => () => {
    setSelected(type)

    const name =
      type === 'upvote' ? EventNames.DocLiked : EventNames.DocDisliked

    if (location) {
      firePlausibleEvent({
        name,
        additionalProps: {
          location,
          title: pageTitle,
        },
      })
    }
  }

  React.useEffect(() => {
    const element = document.querySelector('h1 > a')

    if (element) {
      setPageTitle(element.innerHTML)
    }
  }, [])

  React.useEffect(() => {
    setSelected(null)
    /**
     * if the location changes, reset the selected state
     * otherwise you vote once somewhere and can never do it again
     */
  }, [location])

  return (
    <div>
      <Heading
        tag="h4"
        fontStyle="$XS"
        weight="$bold"
        css={{ color: '$steel40' }}
      >
        Found this helpful?
      </Heading>
      <Stack>
        <FeedbackButton
          onClick={handleClick('upvote')}
          disabled={selected === 'downvote'}
          selected={selected === 'upvote'}
          pageTitle={pageTitle}
        >
          <ThumbsUp size={16} weight={isDarkMode ? 'light' : 'regular'} />
        </FeedbackButton>
        <FeedbackButton
          onClick={handleClick('downvote')}
          disabled={selected === 'upvote'}
          selected={selected === 'downvote'}
          variant="downvote"
          pageTitle={pageTitle}
        >
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
  selected?: boolean
  variant?: 'upvote' | 'downvote'
  pageTitle: string
}

const FeedbackButton = ({
  children,
  onClick,
  pageTitle,
  disabled = false,
  selected = false,
  variant = 'upvote',
}: FeedbackButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null!)
  const location = useLocation()
  const { data, state, Form } = useFetcher<{ success: boolean }>()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleOpenChange = (isOpen: boolean) => setIsOpen(isOpen)

  React.useEffect(() => {
    if (data?.success) {
      formRef.current.reset()
      setIsOpen(false)
    }
  }, [data])

  const isLoading = state === 'submitting'

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Trigger disabled={disabled} onClick={handleClick} selected={selected}>
        {children}
      </Trigger>
      <Popover.Portal>
        <PopoverContent sideOffset={10}>
          <PopoverHeader>
            <Heading tag="h2" fontStyle="$XXS">
              Thanks for feedback! Was there anything in particular you wanted
              to mention?
            </Heading>
            <PopoverClose>
              <X />
            </PopoverClose>
          </PopoverHeader>
          <Form ref={formRef} method="post" action="/api/feedback">
            <HiddenInput
              name="variant"
              type="checkbox"
              value={variant}
              checked
            />
            <HiddenInput name="pageTitle" type="text" value={pageTitle} />
            <PopoverInputLabel tag="label">
              <span>Feedback</span>
              <PopoverInput
                name="feedback"
                placeholder="Type your feedback here"
                type="text"
                disabled={isLoading}
              />
            </PopoverInputLabel>
            <PopoverFormFooter>
              <PopoverButton
                aria-disabled={isLoading}
                variant="small"
                tag="button"
                type="submit"
              >
                Send
              </PopoverButton>
              <Outbound
                href={
                  variant === 'upvote'
                    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `I've found this #reactspring doc page helpful! https://react-spring.io/${location.pathname}`
                      )}`
                    : 'https://github.com/pmndrs/react-spring/issues/new/choose'
                }
                variant="small"
              >
                {variant === 'upvote'
                  ? 'Tweet about react-spring'
                  : 'Open an issue'}
              </Outbound>
            </PopoverFormFooter>
          </Form>
        </PopoverContent>
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
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
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

  variants: {
    selected: {
      false: {
        '&:hover': {
          borderColor: '$steel80',
          color: '$steel80',
        },
      },
      true: {
        pointerEvents: 'none',
        borderColor: '$red100',
        color: '$red100',
      },
    },
  },
})

const PopoverContent = styled(Popover.Content, {
  display: 'none',
  background: '$codeBackground',
  color: '$black',
  fontSize: '$XXS',
  lineHeight: '$XXS',
  overflow: 'hidden',
  boxShadow:
    'rgba(27,31,36,0.12) 0px 1px 3px, rgba(66,74,83,0.12) 0px 8px 24px',

  [`.${dark} &`]: {
    boxShadow:
      'rgba(27,31,36,0.5) 0px 1px 3px, rgba(18 21 23 / 40%) 0px 8px 24px',
  },

  '@tabletUp': {
    display: 'block',
    p: '$20',
    borderRadius: '$r8',
    width: 320,
    fontSize: '$XS',
    lineHeight: '$XS',
  },
})

const PopoverHeader = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  mb: '$10',
  gap: '$10',

  '& > h2': {
    lineHeight: '$code',
  },
})

const PopoverClose = styled(Popover.Close, {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: '$5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  hover: {
    color: '$red100',
  },
})

const PopoverInputLabel = styled(Copy, {
  display: 'block',
  mb: '$15',

  '& > span': {
    visuallyHidden: '',
  },
})

const PopoverInput = styled('input', {
  borderRadius: '$r8',
  margin: 0,
  padding: '$5 $10',
  width: '100%',
  backgroundColor: 'transparent',
  border: '1px solid $steel40',
  alignItems: 'center',
  transition: 'border-color 200ms ease-out',
  color: '$black',
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '140%',

  hover: {
    borderColor: '$red100',
  },

  '&:disabled': {
    opacity: 0.5,
    pointerEvents: 'none',

    hover: {
      borderColor: '$steel40',
    },
  },
})

const PopoverFormFooter = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const PopoverButton = styled(GradientButton, {
  cursor: 'pointer',

  '& > span': {
    background: '$codeBackground',
  },

  '&[aria-disabled="true"]': {
    opacity: 0.5,
    pointerEvents: 'none',
  },
})

const Outbound = styled(GradientButton, {
  '& > span': {
    background: '$codeBackground',
  },

  [`.${dark} &:before`]: {
    background: '$redYellowGradient100',
  },

  [`.${dark} &:hover:before`]: {
    filter: 'brightness(120%)',
  },
})

const HiddenInput = styled('input', {
  visuallyHidden: '',
})
