import { SandboxEntry } from '~/data/sandboxes'

interface SelectData {
  value: string
  label: string
}

type TagsAndComponents = [tags: SelectData[], components: SelectData[]]

const COMPONENT_TAGS = [
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
  sandboxes: SandboxEntry[]
): TagsAndComponents =>
  sandboxes
    .reduce<[tags: string[], components: string[]]>(
      (acc, sandbox) => {
        sandbox.tags.forEach(tag => {
          if (COMPONENT_TAGS.includes(tag)) {
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
        .map(tag => ({ value: tag, label: tag }))
    ) as TagsAndComponents
