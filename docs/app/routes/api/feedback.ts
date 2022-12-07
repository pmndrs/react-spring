import { ActionFunction, json } from '@remix-run/node'
import { createClient } from '@supabase/supabase-js'

export const action: ActionFunction = async ({ request }) => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return json({ error: 'Missing Supabase URL or key' }, 500)
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

        const res = await supabase.from('feedback').insert({
          feedback: body.get('feedback'),
          page_title: body.get('pageTitle'),
          upvoted: body.get('variant') === 'upvote',
        })

        console.log('SUPABASE RESPONSE', res)

        return json({ success: true }, 200)
      } catch (err) {
        console.error('ERROR DOING SUPABASE', err)
        return json({ success: false, error: err.message }, 405)
      }
    }
    default:
      return json({ success: false, error: 'Method not allowed' }, 405)
  }
}
