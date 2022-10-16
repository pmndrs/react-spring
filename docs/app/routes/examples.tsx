import { json, LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData, Form } from '@remix-run/react'

import { capitalize } from '~/helpers/strings'

import { styled } from '~/styles/stitches.config'

import { Header } from '~/components/Header/Header'
import { CardExample } from '~/components/Cards/CardExample'
import { Heading } from '~/components/Text/Heading'
import { InlineLinkStyles } from '~/components/InlineLink'
import { Copy } from '~/components/Text/Copy'
import { Anchor } from '~/components/Text/Anchor'

interface CodesandboxDirectory {
  directory_shortid: null
  id: string
  inserted_at: string
  shortid: string
  source_id: string
  title: string
  updated_at: string
}

interface CodesandboxSandbox {
  title: string
  tags: string[]
  screenshot_url: string
  description: string
  id: string
}

/**
 * Partial implementations of the response, focussed on what we want exactly.
 */
type CodesandboxDirectoriesResponse = {
  data: {
    directories: CodesandboxDirectory[]
  }
}

type CodesandboxSandboxResponse = {
  data: CodesandboxSandbox
}

export const loader: LoaderFunction = async () => {
  try {
    const directories = await fetch(
      'https://codesandbox.io/api/v1/sandboxes/github/pmndrs/react-spring/tree/master/demo/src/sandboxes'
    )
      .then(res => res.json())
      .then((res: CodesandboxDirectoriesResponse) =>
        res.data.directories
          .filter(direct => direct.title !== 'public' && direct.title !== 'src')
          .map(direct => direct.title)
      )

    const hookRegex = new RegExp(/^use/)

    const sandboxes = await Promise.all(
      directories.map(async directoryTitle => {
        const sandbox = await fetch(
          `https://codesandbox.io/api/v1/sandboxes/github/pmndrs/react-spring/tree/master/demo/src/sandboxes/${directoryTitle}`
        )
          .then(res => res.json())
          .then((res: CodesandboxSandboxResponse) => {
            const {
              data: { id, title, tags, screenshot_url, description },
            } = res

            return {
              id,
              urlTitle: directoryTitle,
              title,
              tags: tags.map(tag => {
                if (hookRegex.test(tag)) {
                  const stringSplit = tag.split('use')

                  return `use${capitalize(stringSplit[1])}`
                } else if (tag === 'parallax') {
                  return capitalize(tag)
                }
                return tag
              }),
              screenshotUrl: screenshot_url,
              description,
            }
          })

        return sandbox
      })
    ).then(boxes => boxes.sort((a, b) => a.title.localeCompare(b.title)))

    return json({
      sandboxes,
    })
  } catch (err) {
    return redirect('/500')
  }
}

export interface Sandbox {
  urlTitle: string
  title: string
  tags: string[]
  screenshotUrl: string
  description: string
  id: string
}

export default function DocsLayout() {
  const { sandboxes } = useLoaderData<{ sandboxes: Sandbox[] }>()
  return (
    <>
      <Header />
      <Main>
        <Heading
          fontStyle="$XL"
          css={{
            mb: 20,
            '@tabletUp': {
              mb: 30,
            },
          }}>
          Examples
        </Heading>
        <Copy
          css={{
            '& > a': {
              ...InlineLinkStyles,
            },
            maxWidth: 680,
          }}>
          {`Got an example you want to see here & share with the community?`}{' '}
          Check out{' '}
          <Anchor href="https://github.com/pmndrs/react-spring/tree/master/demo/CONTRIBUTING.md">
            this guide
          </Anchor>
          .
        </Copy>
        <ExampleFilters>
          <Heading tag="h2" fontStyle="$XS">
            Alternatively, check out examples by
          </Heading>
        </ExampleFilters>
        <SandboxesList>
          {sandboxes.map(props => (
            <li>
              <CardExample key={props.urlTitle} {...props} />
            </li>
          ))}
        </SandboxesList>
      </Main>
    </>
  )
}

const Main = styled('main', {
  padding: '0 $25',
  width: '100%',
  margin: '0 auto',
  maxWidth: '$largeDoc',

  '@tabletUp': {
    padding: '0 $15',
  },

  '@desktopUp': {
    px: '$50',
  },
})

const SandboxesList = styled('ul', {
  display: 'grid',
  gridRowGap: '20px',
  m: 0,
  p: 0,
  listStyle: 'none',

  '@tabletUp': {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridColumnGap: '20px',
  },

  '@desktopUp': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
})

const ExampleFilters = styled(Form, {
  mb: '$20',

  '@tabletUp': {
    mb: '$40',
  },
})
