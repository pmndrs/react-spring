import { useRef, useState } from 'react'
import { MultiValue } from 'react-select'
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import {
  useLoaderData,
  Form,
  useFetcher,
  useTransition,
  useSearchParams,
} from '@remix-run/react'

import { styled } from '~/styles/stitches.config'

import { Header } from '~/components/Header/Header'
import { CardExample } from '~/components/Cards/CardExample'
import { Heading } from '~/components/Text/Heading'
import { InlineLinkStyles } from '~/components/InlineLink'
import { Copy } from '~/components/Text/Copy'
import { Anchor } from '~/components/Text/Anchor'
import { Select } from '~/components/Select'

import { SANDBOXES } from '~/data/sandboxes'

import { fetchSandbox, getTagsAndComponents } from '~/helpers/sandboxes'

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url)

    const tagsParam = url.searchParams.get('tags')?.split(',') ?? []
    const componentsParam = url.searchParams.get('components')?.split(',') ?? []

    const sandboxes = await Promise.all(
      Object.values(SANDBOXES).map(fetchSandbox)
    ).then(boxes => boxes.sort((a, b) => a.title.localeCompare(b.title)))

    const filteredSandboxes = sandboxes.filter(sandbox => {
      if (tagsParam.length === 0 && componentsParam.length === 0) {
        return sandbox
      }

      const tags = sandbox.tags.filter(tag => tagsParam.includes(tag))
      const components = sandbox.tags.filter(tag =>
        componentsParam.includes(tag)
      )

      if (tags.length > 0 || components.length > 0) {
        return sandbox
      }
    })

    const [tags, components] = getTagsAndComponents(sandboxes)

    return json(
      {
        sandboxes: filteredSandboxes,
        tags,
        components,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-max-age=60',
        },
      }
    )
  } catch (err) {
    console.error(err)
    return redirect('/500')
  }
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()

  const tags = form.get('tags') ?? ''
  const components = form.get('components') ?? ''

  if (tags !== '' || components !== '') {
    return redirect(
      `/examples?${tags !== '' ? `tags=${tags}` : ''}${
        components !== '' ? `&components=${components}` : ''
      }`
    )
  }

  return redirect(`/examples`)
}

export const meta: MetaFunction = () => {
  return {
    title: 'Examples | React Spring',
    description: `The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions`,
    'og:title': 'Examples | React Spring',
    'og:description':
      'The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions',
    'og:url': 'https://www.react-spring.dev/examples',
    'twitter:url': 'https://www.react-spring.dev/examples',
    'twitter:title': 'Examples | React Spring',
    'twitter:description':
      'The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions',
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

export default function Examples() {
  const { components, sandboxes, tags } = useLoaderData<{
    components: { value: string; label: string }[]
    sandboxes: Sandbox[]
    tags: { value: string; label: string }[]
  }>()

  const [searchParams] = useSearchParams()

  const defaultTags = searchParams.getAll('tags')
  const defaultComponents = searchParams.getAll('components')

  const [selectStates, setSelectState] = useState({
    tags: defaultTags.map(tag => ({ value: tag, label: tag })),
    components: defaultComponents.map(component => ({
      value: component,
      label: component,
    })),
  })

  const formRef = useRef<HTMLFormElement>(null!)

  const fetcher = useFetcher()

  const { state } = useTransition()

  const handleSelectChange =
    (name: 'tags' | 'components') =>
    (newValue: MultiValue<{ value: string }>) => {
      const data = {
        ...selectStates,
        [name]: newValue,
      }

      setSelectState(data)
      fetcher.submit(
        {
          tags: data.tags.map(val => val.value).join(','),
          components: data.components.map(val => val.value).join(','),
        },
        { method: 'post', action: '/examples' }
      )
    }

  return (
    <>
      <Header />
      <Main>
        <Flex>
          <div>
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
              <Anchor href="https://github.com/pmndrs/react-spring/tree/main/demo/CONTRIBUTING.md">
                this guide
              </Anchor>
              .
            </Copy>
            <ExampleFilters method="post" ref={formRef}>
              <Heading
                tag="h2"
                fontStyle="$XS"
                style={{ display: 'inline-block' }}>
                {`Alternatively, check out examples by `}
              </Heading>
              <Select
                placeholder="Tags"
                options={tags}
                onChange={handleSelectChange('tags')}
                value={selectStates.tags}
              />
              <Heading
                tag="h2"
                fontStyle="$XS"
                style={{ display: 'inline-block' }}>
                {` or `}
              </Heading>
              <Select
                placeholder="Components"
                options={components}
                onChange={handleSelectChange('components')}
                value={selectStates.components}
              />
              {selectStates.tags.length > 0 ||
              selectStates.components.length > 0 ? (
                <Heading
                  tag="h2"
                  fontStyle="$XS"
                  css={{
                    display: 'inline',
                    ml: -6,

                    '& > a': {
                      ...InlineLinkStyles,
                      fontWeight: '$bold',
                    },
                  }}>
                  {'. Or maybe, you want to see them '}
                  <Anchor href="/examples">all?</Anchor>
                </Heading>
              ) : null}
            </ExampleFilters>
          </div>
          <div>
            <script
              async
              type="text/javascript"
              src="https://cdn.carbonads.com/carbon.js?serve=CEAIPK7I&placement=react-springdev"
              id="_carbonads_js"
            />
          </div>
        </Flex>
        <SandboxesList
          css={{
            opacity: state === 'loading' ? 0.5 : 1,
          }}>
          {sandboxes.map(props => (
            <li key={props.urlTitle}>
              <CardExample {...props} />
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
  flexGrow: 1,

  '@tabletUp': {
    padding: '0 $15',
  },

  '@desktopUp': {
    px: '$50',
  },
})

const Flex = styled('div', {
  '#carbonads': {
    mb: '$20',
  },

  '@tabletUp': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '$40',

    '#carbonads': {
      maxWidth: '400px',
      mb: '$40',
    },
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
