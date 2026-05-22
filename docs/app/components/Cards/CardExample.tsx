import { Anchor } from '../Text/Anchor'
import { AspectRatio } from '../AspectRatio'
import { Heading } from '../Text/Heading'
import { GradientButton } from '../Buttons/GradientButton'

import { EventNames, firePlausibleEvent } from '~/helpers/analytics'
import {
  exampleAnchor,
  exampleCard,
  exampleContent,
  exampleDescription,
  exampleTag,
  exampleTags,
  externalLinkIcon,
} from './CardExample.css'

export interface CardExampleProps {
  slug: string
  title: string
  tags: string[]
  description?: string
  thumbnailUrl: string
  codesandboxId: string | null
}

const REPO_DEMO_URL = (slug: string) =>
  `https://github.com/pmndrs/react-spring/tree/main/demo/src/sandboxes/${slug}`

export const CardExample = ({
  slug,
  title,
  description,
  tags,
  thumbnailUrl,
  codesandboxId,
}: CardExampleProps) => {
  const href = codesandboxId
    ? `https://codesandbox.io/s/${codesandboxId}`
    : REPO_DEMO_URL(slug)

  const handleClick = () => {
    firePlausibleEvent({
      name: EventNames.LinkedToSandbox,
      additionalProps: { title },
    })
  }

  return (
    <Anchor className={exampleAnchor} href={href} onClick={handleClick}>
      <figure className={exampleCard}>
        <div className={externalLinkIcon} />
        <AspectRatio height={9} width={16}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} loading="lazy" alt={title} />
          ) : null}
        </AspectRatio>
        <div className={exampleContent}>
          <Heading
            className={exampleDescription}
            tag="figcaption"
            fontStyle="code"
            weight="default"
          >
            <span>{title}</span>
            {description ? <span>{description}</span> : null}
          </Heading>
          <ul className={exampleTags}>
            {tags.map(tag => (
              <GradientButton
                className={exampleTag}
                variant="small"
                tag="li"
                key={tag}
              >
                {tag}
              </GradientButton>
            ))}
          </ul>
        </div>
      </figure>
    </Anchor>
  )
}
