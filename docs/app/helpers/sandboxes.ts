import { capitalize } from './strings'

interface CodesandboxSandbox {
  title: string
  tags: string[]
  screenshot_url: string
  description: string
  id: string
}

type CodesandboxSandboxResponse = {
  data: CodesandboxSandbox
}

export interface CodesandboxSandboxFetched
  extends Omit<CodesandboxSandbox, 'screenshot_url'> {
  screenshotUrl: string
  urlTitle: string
}

const hookRegex = new RegExp(/^use/)

export const fetchSandbox = async (
  id: string
): Promise<CodesandboxSandboxFetched> => {
  const sandbox = await fetch(`https://codesandbox.io/api/v1/sandboxes/${id}`, {
    cache: 'force-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  })
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
        urlTitle: title,
        title,
        tags: tags.map(tag => {
          if (hookRegex.test(tag)) {
            const stringSplit = tag.split('use')

            if (tag === 'usespringvalue') {
              return `useSpringValue`
            } else if (tag === 'usespringref') {
              return `useSpringRef`
            }

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
}

interface SelectData {
  value: string
  label: string
}

type TagsAndComponents = [tags: SelectData[], components: SelectData[]]

const components = [
  'useSpring',
  'useSprings',
  'useTrail',
  'useChain',
  'useTransition',
  'Parallax',
  'useSpringValue',
  'useSpringRef',
]

export const getTagsAndComponents = (
  sandboxes: CodesandboxSandboxFetched[]
): TagsAndComponents =>
  sandboxes
    .reduce<[tags: string[], components: string[]]>(
      (acc, sandbox) => {
        sandbox.tags.forEach(tag => {
          if (components.includes(tag)) {
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
    ) as TagsAndComponents
