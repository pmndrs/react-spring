import { NavigationSchema } from '../../scripts/docs/navigation'
import navigationSchema from '../data/navigationSchema.generated.json'
import subnavSchema from '../data/subnavSchema.generated.json'

export const getNavigations = (dir: string) => {
  const dirWithoutDocs = `/${dir.split('/').slice(2).join('/')}`

  let subnav = subnavSchema[dirWithoutDocs as keyof typeof subnavSchema]

  if (!subnav) {
    const dirWithIndex =
      dirWithoutDocs === '/' ? '/index' : `${dirWithoutDocs}/index`
    subnav = subnavSchema[dirWithIndex as keyof typeof subnavSchema]
  }

  return {
    sidebar: navigationSchema,
    subnav,
  }
}

export interface FlattenedNavigation {
  href: string
  hasChildren: boolean
}

export const flattenNavigationWithChildren = (
  array: NavigationSchema
): FlattenedNavigation[] =>
  array.reduce(
    (flattened, { children, href }) =>
      flattened
        .concat([{ href, hasChildren: children.length > 0 }])
        .concat(children ? flattenNavigationWithChildren(children) : []),
    [] as FlattenedNavigation[]
  )
