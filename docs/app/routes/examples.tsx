import { useRef, useState } from 'react'
import { MultiValue } from 'react-select'
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from '@vercel/remix'
import {
  useLoaderData,
  Form,
  useFetcher,
  useNavigation,
  useSearchParams,
} from '@remix-run/react'

import { Header } from '~/components/Header/Header'
import { CardExample } from '~/components/Cards/CardExample'
import { Heading } from '~/components/Text/Heading'
import { Copy } from '~/components/Text/Copy'
import { Anchor } from '~/components/Text/Anchor'
import { Select } from '~/components/Select'

import { SANDBOXES } from '~/data/sandboxes'

import { fetchSandbox, getTagsAndComponents } from '~/helpers/sandboxes'
import { WidgetCarbon } from '../components/Widgets/WidgetCarbon'
import {
  copy,
  exampleFilters,
  flex,
  h2,
  main,
  sandboxesList,
  xlHeading,
} from '../styles/routes/examples.css'

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
  return [
    {
      title: 'Examples | React Spring',
    },
    {
      name: 'description',
      content: `The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions`,
    },
    { property: 'og:title', content: 'Examples | React Spring' },
    {
      name: 'og:description',
      contnet:
        'The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions',
    },
    {
      name: 'og:url',
      content: 'https://www.react-spring.dev/examples',
    },
    {
      name: 'twitter:url',
      content: 'https://www.react-spring.dev/examples',
    },
    {
      name: 'twitter:title',
      content: 'Examples | React Spring',
    },
    {
      name: 'twitter:description',
      content:
        'The home of examples using react-spring to bring naturally fluid animations elevating UI & interactions',
    },
  ]
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

  const { state } = useNavigation()

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
      <main className={main}>
        <div className={flex}>
          <div>
            <Heading fontStyle="XL" className={xlHeading}>
              Examples
            </Heading>
            <Copy className={copy}>
              {`Got an example you want to see here & share with the community?`}{' '}
              Check out{' '}
              <Anchor href="https://github.com/pmndrs/react-spring/tree/main/demo/CONTRIBUTING.md">
                this guide
              </Anchor>
              .
            </Copy>
            <Form className={exampleFilters} method="post" ref={formRef}>
              <Heading
                tag="h2"
                fontStyle="XS"
                style={{ display: 'inline-block' }}
              >
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
                fontStyle="XS"
                style={{ display: 'inline-block' }}
              >
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
                <Heading tag="h2" fontStyle="XS" className={h2}>
                  {'. Or maybe, you want to see them '}
                  <Anchor href="/examples">all?</Anchor>
                </Heading>
              ) : null}
            </Form>
          </div>
          <div>
            <WidgetCarbon />
          </div>
        </div>
        <ul
          className={sandboxesList}
          style={{
            opacity: state === 'loading' ? 0.5 : 1,
          }}
        >
          {sandboxes.map(props => (
            <li key={props.urlTitle}>
              <CardExample {...props} />
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
