import { dark, styled } from '~/styles/stitches.config'
import { AspectRatio } from '../AspectRatio'
import { Anchor } from '../Text/Anchor'

import { Copy } from '../Text/Copy'
import { Heading } from '../Text/Heading'

export interface Quote {
  text: string
  name: string
  img: string
  handle: string
  tweetUrl: string
  job: string
}

export const CardCarouselQuote = ({
  name,
  img,
  tweetUrl,
  handle,
  text,
  job,
}: Quote) => {
  return (
    <QuoteAnchor href={tweetUrl}>
      <QuoteCard>
        <ExternalLinkIcon />
        <QuoteeHandle>
          <QuoteImage width={1} height={1}>
            <img src={`/images/quotee/${img}`} alt={name} />
          </QuoteImage>
          <QuoteeName tag="figcaption" fontStyle="$code" weight="$default">
            {handle}
            <br />
            <span>{job}</span>
          </QuoteeName>
        </QuoteeHandle>
        <Copy tag="blockquote" fontStyle="$XS">
          {text}
        </Copy>
      </QuoteCard>
    </QuoteAnchor>
  )
}

const ExternalLinkIcon = styled('div', {
  position: 'absolute',
  top: 16,
  right: 20,
  height: 24,
  width: 24,
  background: 'url(/images/icons/ArrowSquareOutBlue.png)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',

  '@media (hover:hover)': {
    opacity: 0,
  },

  [`.${dark} &`]: {
    background: 'url(/images/icons/ArrowSquareOutRed.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },

  '@motion': {
    transition: 'opacity 250ms ease-out',
  },
})

const QuoteAnchor = styled(Anchor, {
  flex: '1 0 80vw',
  textDecoration: 'none',

  '@tabletUp': {
    flex: '1 0 388px',
  },

  hover: {
    [`& ${ExternalLinkIcon}`]: {
      opacity: 1,
    },
  },
})

const QuoteCard = styled('figure', {
  backgroundColor: '$codeBackground',
  m: 0,
  p: '$20',
  borderRadius: '$r8',
  position: 'relative',
})

const QuoteImage = styled(AspectRatio, {
  borderRadius: '50%',
  width: '4.8rem',
  mr: '$10',
})

const QuoteeHandle = styled('div', {
  mb: '$10',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
})

const QuoteeName = styled(Heading, {
  '& > span': {
    color: '$steel60',
  },
})
