const formatFrontmatterToRemixMeta = (frontmatter: any) => () => {
  return [
    { title: frontmatter.meta.title },
    {
      name: 'description',
      content: frontmatter.meta.description,
    },
    { property: 'og:title', content: frontmatter.meta['og:title'] },
    {
      name: 'og:description',
      contnet: frontmatter.meta['og:description'],
    },
    {
      name: 'og:url',
      content: frontmatter.meta['og:url'],
    },
    {
      name: 'twitter:url',
      content: frontmatter.meta['twitter:url'],
    },
    {
      name: 'twitter:title',
      content: frontmatter.meta['twitter:title'],
    },
    {
      name: 'twitter:description',
      content: frontmatter.meta['twitter:description'],
    },
  ]
}

export { formatFrontmatterToRemixMeta }
