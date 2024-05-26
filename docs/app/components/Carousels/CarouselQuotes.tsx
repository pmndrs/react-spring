import { CardCarouselQuote, Quote } from '../Cards/CardCarouselQuote'
import { Heading } from '../Text/Heading'
import {
  quoteHeading,
  quotesContainer,
  quotesSection,
} from './CarouselQuotes.css'

interface CarouselQuotesProps {
  quotes: Quote[]
}

/**
 * TODO: make sure there's a gap on the right
 * of the carousel when you scroll far
 */
export const CarouselQuotes = ({ quotes }: CarouselQuotesProps) => {
  return (
    <section className={quotesSection}>
      <Heading className={quoteHeading} fontStyle="M" tag="h2">
        Hear what our fans say
      </Heading>
      <div className={quotesContainer}>
        {quotes.map(quote => (
          <CardCarouselQuote key={quote.handle} {...quote} />
        ))}
      </div>
    </section>
  )
}
