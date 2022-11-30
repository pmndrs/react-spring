const rehypeAutolinkHeadings = require('rehype-autolink-headings')
const rehypeSlug = require('rehype-slug')
const remarkDirective = require('remark-directive')

const rehypeHighlightCode = require('./scripts/mdx/rehype-highlight-code')
const rehypeMetaAttribute = require('./scripts/mdx/rehype-meta-attribute')
const parseCallouts = require('./scripts/mdx/remark-plugin-parser')

/**
 * @type {import('@remix-run/dev/config').AppConfig}
 */
module.exports = {
  serverBuildTarget: 'vercel',
  server: process.env.NODE_ENV === 'development' ? undefined : './server.js',
  ignoredRouteFiles: ['**/.*', '**/concepts/index.mdx', '**/api/index.mdx'],
  mdx: () => {
    return {
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlightCode,
        rehypeMetaAttribute,
      ],
      remarkPlugins: [remarkDirective, parseCallouts],
    }
  },
}
