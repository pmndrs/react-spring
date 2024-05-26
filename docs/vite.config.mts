import { vitePlugin as remix } from '@remix-run/dev'
import mdx from '@mdx-js/rollup'
import { installGlobals } from '@remix-run/node'
import { vercelPreset } from '@vercel/remix/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'

import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'

import rehypeHighlightCode from './scripts/mdx/rehype-highlight-code'
import rehypeMetaAttribute from './scripts/mdx/rehype-meta-attribute'
import parseCallouts from './scripts/mdx/remark-plugin-parser'

installGlobals()

export default defineConfig({
  ssr: {
    noExternal: ['@docsearch/react', /@algolia/, 'algoliasearch'],
  },
  server: {
    port: 3000,
  },
  plugins: [
    // @ts-expect-error shh.
    mdx({
      providerImportSource: '@mdx-js/react',
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        rehypeHighlightCode,
        rehypeMetaAttribute,
      ],
      remarkPlugins: [
        remarkFrontmatter,
        remarkMdxFrontmatter,
        remarkDirective,
        parseCallouts,
      ],
    }),
    remix({
      ignoredRouteFiles: ['**/.*', '**/*.css'],
      presets: [vercelPreset()],
    }),
    vanillaExtractPlugin(),
    tsconfigPaths(),
  ],
})
