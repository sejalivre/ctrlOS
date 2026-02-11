import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables.\n' +
      'Please create a .env.local file with:\n' +
      '  NEXT_PUBLIC_SUPABASE_URL=your-project-url\n' +
      '  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n' +
      'See .env.example for details.'
    )
  }
  
  return createBrowserClient(url, key)
}