import transpile from 'next-transpile-modules'
import slugs from 'remark-slug'
import autoLinkHeadings from 'remark-autolink-headings'
import mdx from '@next/mdx'

const withTM = transpile(['@react-spring/demo'])

const withMDX = mdx({
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

export default withTM(
  withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    experimental: {
      esmExternals: true,
      externalDir: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  })
)
