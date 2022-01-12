const rehypeAutolinkHeadings = require('rehype-autolink-headings')
const rehypeSlug = require('rehype-slug')

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildDirectory: 'api/_build',
  ignoredRouteFiles: ['.*'],
  mdx: () => {
    return {
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
      ],
    }
  },
}
