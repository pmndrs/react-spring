import { AspectRatio } from '../AspectRatio'
import { Anchor } from '../Text/Anchor'

import { Copy } from '../Text/Copy'
import { Heading } from '../Text/Heading'
import {
  externalLinkIcon,
  quoteAnchor,
  quoteCard,
  quoteImage,
  quoteeHandle,
  quoteeName,
} from './CardCarouselQuote.css'

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
    <Anchor className={quoteAnchor} href={tweetUrl}>
      <figure className={quoteCard}>
        <div className={externalLinkIcon} />
        <div className={quoteeHandle}>
          <AspectRatio className={quoteImage} width={1} height={1}>
            <img src={`/images/quotee/${img}`} alt={name} />
          </AspectRatio>
          <Heading
            className={quoteeName}
            tag="figcaption"
            fontStyle="code"
            weight="default"
          >
            {handle}
            <br />
            <span>{job}</span>
          </Heading>
        </div>
        <Copy tag="blockquote" fontStyle="XS">
          {text}
        </Copy>
      </figure>
    </Anchor>
  )
}
