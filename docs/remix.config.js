const rehypeAutolinkHeadings = require('rehype-autolink-headings')
const rehypeSlug = require('rehype-slug')

const rehypeHighlightCode = require('./scripts/mdx/rehype-highlight-code')

const rehypeMetaAttribute = require('./scripts/mdx/rehype-meta-attribute')

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'vercel',
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  ignoredRouteFiles: ['**/.*'],
  ignoredRouteFiles: ['.*'],
  mdx: () => {
    return {
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlightCode,
        rehypeMetaAttribute,
      ],
    }
  },
}
