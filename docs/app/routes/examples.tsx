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
  useLocation,
  useSearchParams,
} from '@remix-run/react'

import { capitalize } from '~/helpers/strings'

import { styled } from '~/styles/stitches.config'

import { Header } from '~/components/Header/Header'
import { CardExample } from '~/components/Cards/CardExample'
import { Heading } from '~/components/Text/Heading'
import { InlineLinkStyles } from '~/components/InlineLink'
import { Copy } from '~/components/Text/Copy'
import { Anchor } from '~/components/Text/Anchor'
import { Select } from '~/components/Select'

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

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url)

    const tagsParam = url.searchParams.get('tags')?.split(',') ?? []
    const componentsParam = url.searchParams.get('components')?.split(',') ?? []

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
          .then(res => {
            if (res.status === 200) {
              return res.json()
            } else {
              throw new Error('Bad response from codesandbox')
            }
          })
          .then((res: CodesandboxSandboxResponse) => {
            const { data } = res

            const { id, title, tags, screenshot_url, description } = data ?? {}

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

    const [tags, components] = sandboxes
      .reduce<[tags: string[], components: string[]]>(
        (acc, sandbox) => {
          sandbox.tags.forEach(tag => {
            if (hookRegex.test(tag) || tag === 'Parallax') {
              acc[1].push(tag)
            } else {
              acc[0].push(tag)
            }
          })

          return acc
        },
        [[], []]
      )
      .map(arr =>
        arr
          .filter((val, ind, self) => self.indexOf(val) === ind)
          .sort()
          .map(tag => ({
            value: tag,
            label: tag,
          }))
      )

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
        <ExampleFilters
          method="post"
          ref={formRef}
          onChange={() => console.log('form change')}>
          <Heading tag="h2" fontStyle="$XS" style={{ display: 'inline-block' }}>
            Alternatively, check out examples by
          </Heading>
          <Select
            placeholder="Tags"
            options={tags}
            onChange={handleSelectChange('tags')}
            value={selectStates.tags}
          />
          <Heading tag="h2" fontStyle="$XS" style={{ display: 'inline-block' }}>
            or
          </Heading>
          <Select
            placeholder="Components"
            options={components}
            onChange={handleSelectChange('components')}
            value={selectStates.components}
          />
          .
          {selectStates.tags.length > 0 ||
          selectStates.components.length > 0 ? (
            <Heading
              tag="h2"
              fontStyle="$XS"
              style={{ display: 'inline-block' }}>
              {' Or maybe, you want to see them '}
              <Anchor href="/examples">all?</Anchor>
            </Heading>
          ) : null}
        </ExampleFilters>
        <SandboxesList
          css={{
            opacity: state === 'loading' ? 0.5 : 1,
          }}>
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
  flexGrow: 1,

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
