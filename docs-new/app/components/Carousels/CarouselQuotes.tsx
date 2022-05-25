import { styled } from '~/styles/stitches.config'
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

interface CarouselQuotesProps {
  quotes: Quote[]
}

/**
 * TODO: make sure there's a gap on the right
 * of the carousel when you scroll far
 */
export const CarouselQuotes = ({ quotes }: CarouselQuotesProps) => {
  return (
    <QuotesSection>
      <QuoteHeading fontStyle="$M" tag="h2">
        Hear what our fans say
      </QuoteHeading>
      <QuotesScrollContainer>
        <QuotesContainer>
          {quotes.map(quote => (
            <CarouselQuoteCard {...quote} />
          ))}
        </QuotesContainer>
      </QuotesScrollContainer>
    </QuotesSection>
  )
}

const QuotesSection = styled('section', {})

const QuoteHeading = styled(Heading, {
  mx: '$25',
  mb: '$20',

  '@tabletUp': {
    mx: '$50',
  },
})

const QuotesScrollContainer = styled('div', {
  width: '100%',
  overflow: 'auto',
})

const QuotesContainer = styled('div', {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: '4rem',
  p: 2,

  '@tabletUp': {
    my: '$20',
    mx: '$50',
  },
})

const CarouselQuoteCard = ({
  name,
  img,
  tweetUrl,
  handle,
  text,
  job,
}: Quote) => {
  return (
    <QuoteCard>
      <QuoteCardInner>
        <Copy tag="blockquote" fontStyle="$XS">
          {text}
        </Copy>
        <QuoteeHandle href={tweetUrl}>
          <QuoteImage width={1} height={1}>
            <img src={`/images/quotee/${img}`} alt={name} />
          </QuoteImage>
          <QuoteeName tag="figcaption" fontStyle="$code" weight={600}>
            {handle}
            <br />
            <span>{job}</span>
          </QuoteeName>
        </QuoteeHandle>
      </QuoteCardInner>
    </QuoteCard>
  )
}

const QuoteCard = styled('figure', {
  position: 'relative',
  width: '80vw',
  margin: 0,
  borderRadius: '$r8',

  flex: '1 0 80vw',
  zIndex: 0,

  boxShadow: '0px 3px 8px 2px rgba(0, 0, 0, 10%)',

  '&:before': {
    content: '',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
    m: -2,
    borderRadius: 'inherit',
    background: 'linear-gradient(330deg, #fff59a 20%, #ff6d6d 100%)',
  },

  '@tabletUp': {
    width: '42rem',
    flex: '1 0 42rem',
  },
})

const QuoteCardInner = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '$30',

  background: '$white',
  backgroundClip: 'padding-box',

  border: 'solid 5px transparent',
  borderRadius: 'inherit',

  width: '100%',
  height: '100%',
})

const QuoteImage = styled(AspectRatio, {
  borderRadius: '50%',
  width: '5rem',
  mr: '$10',

  '@tabletUp': {
    width: '6rem',
    mr: '$20',
  },
})

const QuoteeHandle = styled(Anchor, {
  mt: '$20',
  mb: '$10',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
})

const QuoteeName = styled(Heading, {
  '& > span': {
    fontWeight: '$default',
  },
})
