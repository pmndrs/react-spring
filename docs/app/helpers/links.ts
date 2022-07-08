import { FlattenedNavigation } from './navigation'

const BASE_URL =
  'https://github.com/pmndrs/react-spring/tree/beta-docs/docs/app/routes/docs/'

export const getDocFilePathToGithub = (item?: FlattenedNavigation): string => {
  if (!item) {
    return BASE_URL
  }

  let filePath = item.href.split('/docs/')[1]

  if (!filePath) {
    filePath = 'index'
  }

  if (item.hasChildren) {
    filePath = `${filePath}/index`
  }

  return `${BASE_URL}${filePath}.mdx`
}
