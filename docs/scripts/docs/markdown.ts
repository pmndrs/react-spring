import matter from 'gray-matter'

interface ParsedMarkdown {
  frontMatter: Record<string, unknown>
  content: string
  contentTitle: string
  subtitles: Array<{
    title: string
    id: string
  }>
}

const parseFrontMatter = (
  markdownFileContent: string
): {
  frontMatter: Record<string, unknown>
  content: string
} => {
  const { data, content } = matter(markdownFileContent)
  return {
    frontMatter: data,
    content: content.trim(),
  }
}

const parseMarkdownForSubheadings = (
  contentUntrimmed: string
): Pick<ParsedMarkdown, 'content' | 'subtitles' | 'contentTitle'> => {
  const content = contentUntrimmed.trim()

  const REGULAR_TITLE = /^# (.*$)/gim
  const [title] = content.match(REGULAR_TITLE) ?? []

  const SUBTITLE_TITLE = /^## (.*$)/gim

  const subtitles = content.match(SUBTITLE_TITLE)?.map(str => {
    const title = str.replace(SUBTITLE_TITLE, '$1')

    return {
      title,
      id: title
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .split(' ')
        .join('-')
        .toLowerCase(),
    }
  })

  return {
    content: '',
    subtitles: subtitles ?? [],
    contentTitle: title,
  }
}

export const parseMarkdownString = (
  markdownFileContent: string
): ParsedMarkdown => {
  const { frontMatter, content: contentWithoutFrontMatter } =
    parseFrontMatter(markdownFileContent)

  const { content, contentTitle, subtitles } = parseMarkdownForSubheadings(
    contentWithoutFrontMatter
  )

  return {
    frontMatter,
    content,
    contentTitle,
    subtitles,
  }
}
