import { styled } from '~/styles/stitches.config'

import { CardCarouselQuote, Quote } from '../Cards/CardCarouselQuote'
import { Heading } from '../Text/Heading'

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
      <QuotesContainer>
        {quotes.map(quote => (
          <CardCarouselQuote key={quote.handle} {...quote} />
        ))}
      </QuotesContainer>
    </QuotesSection>
  )
}

const QuotesSection = styled('section', {
  mb: '$10',

  '@tabletUp': {
    mb: '$30',
  },
})

const QuoteHeading = styled(Heading, {
  px: '$25',

  '@tabletUp': {
    px: '$50',
    margin: '0 auto',
    maxWidth: '$largeDoc',
  },
})

const QuotesContainer = styled('div', {
  display: 'flex',
  gap: '$20',
  alignItems: 'flex-start',
  overflow: 'auto',
  pt: '$20',
  pb: '$10',
  px: '$25',

  '@tabletUp': {
    px: '$50',
  },
})
