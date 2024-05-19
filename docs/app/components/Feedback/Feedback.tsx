import * as React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { ThumbsDown, ThumbsUp, X } from 'phosphor-react'
import { useLocation, useFetcher } from '@remix-run/react'

import { Heading } from '~/components/Text/Heading'
import { Copy } from '~/components/Text/Copy'
import { GradientButton } from '~/components/Buttons/GradientButton'

import { useIsDarkTheme } from '~/hooks/useIsDarkTheme'

import { EventNames, firePlausibleEvent } from '~/helpers/analytics'
import {
  heading,
  outbound,
  popoverButton,
  popoverClose,
  popoverContent,
  popoverFormFooter,
  popoverHeader,
  popoverInput,
  popoverInputLabel,
  stack,
  trigger,
} from './Feedback.css'
import { visuallyHidden } from '../../styles/utilities.css'

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
      <Heading tag="h4" fontStyle="XS" weight="bold" className={heading}>
        Found this helpful?
      </Heading>
      <div className={stack}>
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
      </div>
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
      <Popover.Trigger
        className={trigger({
          selected,
        })}
        disabled={disabled}
        onClick={handleClick}
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={popoverContent} sideOffset={10}>
          <header className={popoverHeader}>
            <Heading tag="h2" fontStyle="XXS">
              Thanks for feedback! Was there anything in particular you wanted
              to mention?
            </Heading>
            <Popover.Close className={popoverClose}>
              <X />
            </Popover.Close>
          </header>
          <Form ref={formRef} method="post" action="/api/feedback">
            <input
              className={visuallyHidden}
              name="variant"
              type="checkbox"
              value={variant}
              checked
            />
            <input
              className={visuallyHidden}
              name="pageTitle"
              type="text"
              value={pageTitle}
            />
            <Copy className={popoverInputLabel} tag="label">
              <span className={visuallyHidden}>Feedback</span>
              <input
                className={popoverInput}
                name="feedback"
                placeholder="Type your feedback here"
                type="text"
                disabled={isLoading}
              />
            </Copy>
            <div className={popoverFormFooter}>
              <GradientButton
                className={popoverButton}
                aria-disabled={isLoading}
                variant="small"
                tag="button"
                type="submit"
              >
                Send
              </GradientButton>
              <GradientButton
                className={outbound}
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
              </GradientButton>
            </div>
          </Form>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
