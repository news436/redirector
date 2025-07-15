export default function middleware(req, ev) {
  if (!process.env.SUPABASE_ANON_KEY) {
    return new Response('SUPABASE_ANON_KEY is not set', { status: 500 });
  }
  return;
} 