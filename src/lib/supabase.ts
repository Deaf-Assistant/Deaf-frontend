import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const isServer = typeof window === 'undefined'
  
  const supabaseUrl = isServer 
    ? 'http://10.10.184.128:8000' 
    : process.env.NEXT_PUBLIC_SUPABASE_URL!

  return createBrowserClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        name: 'deaf-auth',
      }
    }
  )
}
