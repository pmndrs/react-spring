import { z } from 'zod'

export type DocFrontmatter = z.infer<typeof DocFrontmatterSchema>

const DocFrontmatterSchema = z.object({
  meta: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
    })
    .optional(),
  sidebar_position: z.number().optional(),
  sidebar_label: z.string().optional(),
  noSubnav: z.boolean().optional(),
  noPage: z.boolean().optional(),
})

export const validateFrontmatter = (
  frontmatter: Record<string, unknown>
): DocFrontmatter => DocFrontmatterSchema.parse(frontmatter)
