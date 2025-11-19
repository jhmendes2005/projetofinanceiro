// -----------------------------------------------------------------------------
// 🚨 CORREÇÃO DE EMERGÊNCIA (POLYFILL) 🚨
// Este bloco DEVE ficar na primeira linha, antes de qualquer importação.
// Ele cria variáveis falsas que o Supabase/WebSocket precisa para não travar.
// -----------------------------------------------------------------------------
// @ts-ignore
if (typeof globalThis.__dirname === 'undefined') {
  // @ts-ignore
  globalThis.__dirname = '/';
}
// @ts-ignore
if (typeof globalThis.__filename === 'undefined') {
  // @ts-ignore
  globalThis.__filename = '';
}
// -----------------------------------------------------------------------------

import { type NextRequest } from 'next/server'
// Importa a lógica da sessão que criamos anteriormente
import { updateSession } from './lib/supabase/session' 

export async function middleware(request: NextRequest) {
  // Executa a atualização de sessão do Supabase
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Aplica o middleware em todas as rotas, exceto arquivos estáticos e imagens
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}