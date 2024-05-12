import { ActionFunction, json } from '@vercel/remix'
import { createClient } from '@supabase/supabase-js'
import z from 'zod'

export const action: ActionFunction = async ({ request }) => {
  const schema = z.object({
    feedback: z.string().min(1),
    page_title: z.string().min(1),
    upvoted: z.boolean(),
  })

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return json({ success: false, error: 'Missing Supabase URL or key' }, 500)
  }

  const supabase = createClient(url, key, {
    db: {
      schema: 'public',
    },
  })

  switch (request.method) {
    case 'POST': {
      try {
        const body = await request.formData()

        const data = {
          feedback: body.get('feedback'),
          page_title: body.get('pageTitle'),
          upvoted: body.get('variant') === 'upvote',
        }

        const parsedSchema = schema.safeParse(data)

        if (!parsedSchema.success) {
          return json({ success: false, error: 'Feedback is required' }, 405)
        }

        const res = await supabase.from('feedback').insert(parsedSchema.data)

        // eslint-disable-next-line no-console
        console.log('SUPABASE RESPONSE', res)

        return json({ success: true }, 200)
      } catch (err: any) {
        console.error('ERROR DOING SUPABASE', err)
        return json({ success: false, error: err.message }, 405)
      }
    }
    default:
      return json({ success: false, error: 'Method not allowed' }, 405)
  }
}
