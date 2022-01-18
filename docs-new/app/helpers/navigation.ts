import fs from 'fs-extra'
import path from 'path'

export const getNavigations = async (dir: string) => {
  const dataPath = path.resolve(__dirname, '../../app/data')

  const sidebar = await fs.readJSON(
    path.join(dataPath, 'navigationSchema.generated.json')
  )

  const allSubnavs = await fs.readJSON(
    path.join(dataPath, 'subnavSchema.generated.json')
  )

  const url = new URL(dir)

  const dirWithoutDocs = `/${url.pathname.split('/').slice(2).join('/')}`

  let subnav = allSubnavs[dirWithoutDocs]

  if (!subnav) {
    const dirWithIndex =
      dirWithoutDocs === '/' ? '/index' : `${dirWithoutDocs}/index`
    subnav = allSubnavs[dirWithIndex]
  }

  return {
    sidebar,
    subnav,
  }
}
