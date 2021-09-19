const withTM = require('next-transpile-modules')(['@react-spring/demo'])
const slugs = require('remark-slug')
const autoLinkHeadings = require('remark-autolink-headings')

const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
  options: {
    remarkPlugins: [
      slugs,
      [
        autoLinkHeadings,
        {
          behavior: 'append',
        },
      ],
    ],
    rehypePlugins: [],
  },
})

module.exports = withTM(
  withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    experimental: {
      externalDir: true,
    },
  })
)
