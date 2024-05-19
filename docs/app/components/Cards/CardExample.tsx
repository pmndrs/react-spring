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

export interface Sandbox {
  urlTitle: string
  title: string
  tags: string[]
  screenshotUrl: string
  description: string
  id: string
}

export const CardExample = ({ title, description, tags, id }: Sandbox) => {
  const handleClick = () => {
    firePlausibleEvent({
      name: EventNames.LinkedToSandbox,
      additionalProps: {
        title,
      },
    })
  }

  return (
    <Anchor
      className={exampleAnchor}
      href={`https://codesandbox.io/s/${id}`}
      onClick={handleClick}
    >
      <figure className={exampleCard}>
        <div className={externalLinkIcon} />
        <AspectRatio height={9} width={16}>
          <img
            src={`https://codesandbox.io/api/v1/sandboxes/${id}/screenshot.png`}
            placeholder="empty"
            loading="lazy"
            alt={title}
          />
        </AspectRatio>
        <div className={exampleContent}>
          <Heading
            className={exampleDescription}
            tag="figcaption"
            fontStyle="code"
            weight="default"
          >
            <span>{title}</span>
            <span>{description}</span>
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
