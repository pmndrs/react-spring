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
