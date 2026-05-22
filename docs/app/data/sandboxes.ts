/**
 * Source of truth for the /examples page.
 *
 * Each sandbox lives at `demo/src/sandboxes/<slug>/` with a `package.json`
 * (name, description, keywords) and a `thumbnail.png`. We pull everything in
 * at build time via Vite's `import.meta.glob` — adding a new sandbox folder
 * to the demo workspace is enough; docs picks it up automatically with no
 * generator step.
 *
 * The only piece of data not in the demo folders is the CodeSandbox sandbox
 * ID used for the "Open in CodeSandbox" link. Those are mapped manually below
 * (the slug is stable; the CSB ID is opaque). A null id hides the external
 * link for that entry.
 */

interface RawPackage {
  name?: string
  description?: string
  keywords?: string[]
}

const FOLDER_TO_CSB_ID: Record<string, string | null> = {
  'animating-auto': 'ucvbf',
  card: 'pf74x',
  'cards-stack': 'to6uf',
  chain: 'q6ffu',
  'css-gradients': 'xg8jhi',
  'css-keyframes': '9c5jx',
  'css-variables': '8x50e',
  'draggable-list': 'zfy9p',
  'exit-before-enter': 'exkei',
  'flip-card': 'cju2d',
  'floating-button': 'dqxvqu',
  'goo-blobs': 'o2tp9',
  'image-fade': '1t9hh',
  'list-reordering': '279ct',
  'macos-dock': '6zchkl',
  masonry: 'mdovb',
  'multistage-transition': 'k467x',
  noise: 'ggyzkv',
  'notification-hub': 'v1i1t',
  parallax: '3zqcj',
  'parallax-sticky': '3hsg6',
  'parallax-vert': 'h1rrv',
  'popup-modal': 'ycouuu',
  'rocket-decay': 'ko4c6',
  'scrolling-wave': 'b07dmz',
  'simple-transition': 'cisbc',
  slide: '3filx',
  'smile-grid': 'uqpn4f',
  'springy-boxes': '4g105j',
  'svg-filter': 'mvxd3',
  trail: 'yps54',
  tree: 'nlzui',
  viewpager: '8s3kf',
  'webgl-switch': 's0w9i0',
  wordle: '90qj1i',
}

const packages = import.meta.glob<RawPackage>(
  '../../../demo/src/sandboxes/*/package.json',
  { eager: true, import: 'default' }
)

const thumbnails = import.meta.glob<string>(
  '../../../demo/src/sandboxes/*/thumbnail.png',
  { eager: true, import: 'default', query: '?url' }
)

const slugFromPath = (filePath: string): string => {
  const match = filePath.match(/sandboxes\/([^/]+)\//)
  return match ? match[1] : ''
}

export interface SandboxEntry {
  /** Demo workspace folder name — stable identifier, used as React key. */
  slug: string
  /** Human-readable name from the sandbox's package.json. */
  title: string
  /** Editorial tags from the sandbox's package.json `keywords`. */
  tags: string[]
  /** Description from the sandbox's package.json (optional). */
  description?: string
  /** Vite-bundled hashed asset URL for the thumbnail. */
  thumbnailUrl: string
  /** CodeSandbox sandbox ID for the external link. Null = no external link. */
  codesandboxId: string | null
}

export const SANDBOXES: SandboxEntry[] = Object.entries(packages)
  .map(([filePath, pkg]): SandboxEntry => {
    const slug = slugFromPath(filePath)
    const thumbnailKey = filePath.replace('/package.json', '/thumbnail.png')
    return {
      slug,
      title: pkg.name ?? slug,
      tags: pkg.keywords ?? [],
      description: pkg.description,
      thumbnailUrl: thumbnails[thumbnailKey] ?? '',
      codesandboxId: FOLDER_TO_CSB_ID[slug] ?? null,
    }
  })
  .sort((a, b) => a.title.localeCompare(b.title))

export const sandboxesByTitle = (): Record<string, SandboxEntry> =>
  Object.fromEntries(SANDBOXES.map(entry => [entry.title, entry]))
