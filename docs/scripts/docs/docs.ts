import fs from 'fs-extra'
import chokidar from 'chokidar'
import path from 'path'

import { parseMarkdownString } from './markdown'
import { DocFrontmatter, validateFrontmatter } from './frontmatter'
import {
  makeNavigation,
  makeSubnavigation,
  NavigationSchema,
  SubtitleSchema,
} from './navigation'

interface DocFile {
  source: string
  content: string
  docPath: string
}

const readDoc = async (source: string): Promise<DocFile> => {
  const pathToDocs = path.resolve(__dirname, '../../app/routes/docs')

  const [_, docPathWithSrc] = source.split(pathToDocs)

  const docPath = path.dirname(docPathWithSrc)

  const content = await fs.readFile(source, 'utf-8')

  return {
    source,
    content,
    docPath,
  }
}

const getAllWatchedfiles = (
  watchedFiles: Record<string, string[]>
): [mdx: string[]] => {
  const mdx: string[] = []

  Object.entries(watchedFiles).forEach(([path, filenames]) => {
    filenames.forEach(filename => {
      const isMdx = /^.*\.(mdx|MDX)$/.test(filename)
      const fullPath = `${path}/${filename}`

      if (isMdx) {
        mdx.push(fullPath)
      }
    })
  })

  return [mdx]
}

interface GeneratedDataFromDocs {
  subnavSchema: SubtitleSchema
  navigationSchema: NavigationSchema
}

const generateData = async (
  watchedFiles: Record<string, string[]>
): Promise<GeneratedDataFromDocs> => {
  const [mdx] = getAllWatchedfiles(watchedFiles)

  const parsedMdx = await Promise.all(mdx.map(src => readDoc(src)))

  const processedDocs = parsedMdx.map(processDoc)

  const subnavSchema = makeSubnavigation(processedDocs)

  const navigationSchema = makeNavigation(processedDocs)

  return {
    subnavSchema,
    navigationSchema,
  }
}

export interface ProcessedJson {
  title: string
  sidebarPosition?: number
  id: string
  sourceDirName: string
  docPath: string
}

export interface ProcessedDoc {
  frontMatter: DocFrontmatter
  title: string
  description: string
  subtitles: Array<{ id: string; title: string }>
  sidebarPosition?: number
  id: string
  baseID: string
  sourceDirName: string
  docPath: string
  noSubnav: boolean
  noPage: boolean
}

const processDoc = ({ content, source, docPath }: DocFile): ProcessedDoc => {
  const {
    frontMatter: unsafeFrontmatter,
    contentTitle,
    subtitles,
  } = parseMarkdownString(content)

  const frontMatter = validateFrontmatter(unsafeFrontmatter)

  // ex: api/plugins/myDoc -> myDoc
  // ex: myDoc -> myDoc
  const baseID = path.basename(source, path.extname(source))

  // ex: api/plugins/myDoc -> api/plugins
  // ex: myDoc -> .
  const sourceDirName = path.dirname(source)

  const sidebarPosition: number | undefined = frontMatter.sidebar_position

  const id = [sourceDirName === '.' ? undefined : sourceDirName, baseID]
    .filter(Boolean)
    .join('/')

  const title: string =
    frontMatter.meta?.title?.split('|')[0] ?? contentTitle ?? baseID

  const description: string = frontMatter.meta?.description ?? ''

  const noSubnav: boolean = frontMatter.noSubnav ?? false

  const noPage: boolean = frontMatter.noPage ?? false

  return {
    docPath,
    frontMatter,
    title,
    description,
    subtitles,
    sidebarPosition,
    id,
    baseID,
    sourceDirName,
    noSubnav,
    noPage,
  }
}

const writeData = async (data: GeneratedDataFromDocs) => {
  const generatedDataPath = path.resolve(__dirname, '../../app/data')
  try {
    await fs.mkdirs(generatedDataPath)

    const dataEntries = Object.entries(data)

    await Promise.all(
      dataEntries.map(([key, datum]) => {
        fs.writeJson(
          path.join(generatedDataPath, `${key}.generated.json`),
          datum
        )
      })
    )
  } catch (err) {
    console.error(err)
  }
}

const DOCS_DIR = path.resolve(
  __dirname,
  '../../app/routes/docs/**/*.{mdx,json}'
)

export const watchDocs = () => {
  const watcher = chokidar.watch(DOCS_DIR, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100,
    },
  })

  /**
   * The below functions 100% could be done
   * in a way where we dont regenerate the
   * whole thing, but this is a small docs
   * site so until it becomes a problem,
   * it is not my problem.
   */
  watcher
    .on('ready', async () => {
      // eslint-disable-next-line no-console
      console.log('📄 Watching docs!')
      const data = await generateData(watcher.getWatched())
      await writeData(data)
      // eslint-disable-next-line no-console
      console.log('✍🏼 Written the first batch of schemas')
    })
    .on('add', async path => {
      // eslint-disable-next-line no-console
      console.log(`📄 File ${path} has been added`)
      const data = await generateData(watcher.getWatched())
      await writeData(data)
      // eslint-disable-next-line no-console
      console.log(`✍🏼 Rewritten the schemas to include ${path}`)
    })
    .on('change', async path => {
      // eslint-disable-next-line no-console
      console.log(`File ${path} has been changed`)
      const data = await generateData(watcher.getWatched())
      await writeData(data)
      // eslint-disable-next-line no-console
      console.log(`✍🏼 Updated ${path} in the schemas`)
    })
    .on('unlink', async path => {
      // eslint-disable-next-line no-console
      console.log(`📄 File ${path} has been removed`)
      const data = await generateData(watcher.getWatched())
      await writeData(data)
      // eslint-disable-next-line no-console
      console.log(`✍🏼 Removed ${path} from the schemas`)
    })
}

export const buildDocs = () => {
  const watcher = chokidar.watch(DOCS_DIR, {
    persistent: false,
  })

  watcher.on('ready', async () => {
    // eslint-disable-next-line no-console
    console.log('📄 Building docs!')
    const data = await generateData(watcher.getWatched())
    await writeData(data)
    // eslint-disable-next-line no-console
    console.log('✍🏼 Written the schemas')
    await watcher.close()
  })
}
