import { type NextRequest } from 'next/server'

// Mude disto:
// import { updateSession } from '@/lib/supabase/session'

// PARA ISTO (Caminho relativo):
import { updateSession } from './lib/supabase/session'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}