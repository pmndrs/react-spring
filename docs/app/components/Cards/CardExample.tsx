import { dark, styled } from '~/styles/stitches.config'

import { Anchor } from '../Text/Anchor'
import { AspectRatio } from '../AspectRatio'
import { Heading } from '../Text/Heading'
import { GradientButton } from '../Buttons/GradientButton'

import type { Sandbox } from '../../routes/examples'

export const CardExample = ({
  urlTitle,
  screenshotUrl,
  title,
  description,
  tags,
}: Sandbox) => {
  return (
    <ExampleAnchor
      href={`https://codesandbox.io/s/github/pmndrs/react-spring/tree/master/demo/src/sandboxes/${urlTitle}`}>
      <ExampleCard>
        <ExternalLinkIcon />
        <ExampleImage height={9} width={16}>
          <img src={screenshotUrl} alt={title} />
        </ExampleImage>
        <ExampleContent>
          <ExampleDescription
            tag="figcaption"
            fontStyle="$code"
            weight="$default">
            <span>{title}</span>
            <span>{description}</span>
          </ExampleDescription>
          <ExampleTags>
            {tags.map(tag => (
              <ExampleTag variant="small" tag="li" key={tag}>
                {tag}
              </ExampleTag>
            ))}
          </ExampleTags>
        </ExampleContent>
      </ExampleCard>
    </ExampleAnchor>
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
  zIndex: '$1',

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

const ExampleAnchor = styled(Anchor, {
  textDecoration: 'none',
  zIndex: 0,
  position: 'relative',

  '&:focus-visible': {
    boxShadow: 'none',

    [`& ${ExternalLinkIcon}`]: {
      opacity: 1,
      boxShadow: '0 0 0 3px $red-outline',
      outline: 'none',
      borderRadius: '$r4',

      ['-webkit-tap-highlight-color']: '3px solid $red-outline',
    },
  },

  hover: {
    [`& ${ExternalLinkIcon}`]: {
      opacity: 1,
    },
  },
})

const ExampleCard = styled('figure', {
  backgroundColor: '$codeBackground',
  m: 0,
  position: 'relative',
  borderRadius: '$r8',
  overflow: 'hidden',
})

const ExampleImage = styled(AspectRatio)

const ExampleContent = styled('div', {
  p: '$20',
})

const ExampleDescription = styled(Heading, {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  mb: '$10',

  '& > span + span': {
    color: '$steel40',
  },
})

const ExampleTags = styled('ul', {
  listStyle: 'none',
  m: 0,
  p: 0,
  display: 'flex',
  gap: '$10 ',
  flexWrap: 'wrap',
})

const ExampleTag = styled(GradientButton, {
  '& > span': {
    backgroundColor: '$codeBackground',
  },

  '&:hover:before': {
    filter: 'none !important',
  },
})
