import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  // Modo mock: ignora autenticação completamente
  if (process.env.MOCK_AUTH === 'true') return NextResponse.next();

  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token');

  // Rotas públicas — sem autenticação necessária
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // Já autenticado: vai direto para a agenda
    if (token) return NextResponse.redirect(new URL('/agenda', request.url));
    return NextResponse.next();
  }

  // Rota protegida sem token: redireciona para login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
