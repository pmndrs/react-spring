import { FlattenedNavigation } from './navigation'

const BASE_URL =
  'https://github.com/pmndrs/react-spring/tree/main/docs/app/routes'

export const getDocFilePathToGithub = (item?: FlattenedNavigation): string => {
  if (!item) {
    return BASE_URL
  }

  let filePath = item.href.split('/docs/')[1]

  if (!filePath) {
    filePath = '_index'
  } else {
    filePath = filePath.replace(/\//g, '.')
  }

  if (item.hasChildren) {
    filePath = `${filePath}._index`
  }

  return `${BASE_URL}/docs.${filePath}.mdx`
}
