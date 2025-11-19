// middleware.ts

// --------------------------------------------------------
// 🛑 INÍCIO DO HACK PARA CORRIGIR O ERRO __dirname 🛑
// Isso define variáveis globais fakes para enganar bibliotecas
// antigas que tentam rodar no ambiente Edge do Next.js
// --------------------------------------------------------
// @ts-ignore
if (typeof globalThis.__dirname === 'undefined') {
  // @ts-ignore
  globalThis.__dirname = '/'
}
// @ts-ignore
if (typeof globalThis.__filename === 'undefined') {
  // @ts-ignore
  globalThis.__filename = ''
}
// --------------------------------------------------------
// FIM DO HACK
// --------------------------------------------------------

import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/session' 

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}