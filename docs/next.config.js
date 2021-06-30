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

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  future: { webpack5: true },
})
