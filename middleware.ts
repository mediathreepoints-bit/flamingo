import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { createServerClient } from '@supabase/ssr';

const COOKIE = 'fk_admin_session';
const secretKey = () => new TextEncoder().encode(process.env.ADMIN_SECRET || 'flamingo-auto-kenitra-v2-secret');

const supabaseOn = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* ——— porte d'entrée admin ——— */
  if (pathname.startsWith('/admin')) {
    const isLogin = pathname === '/admin/login';
    const redirect = (to: string) => {
      const url = req.nextUrl.clone();
      url.pathname = to;
      url.search = to === '/admin/login' ? `?next=${encodeURIComponent(pathname)}` : '';
      return NextResponse.redirect(url);
    };

    if (supabaseOn()) {
      let response = NextResponse.next();
      const sb = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => req.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
            setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
          },
        },
      );
      const { data } = await sb.auth.getUser();
      const valid = Boolean(data.user);
      if (!valid && !isLogin) return redirect('/admin/login');
      if (valid && isLogin) return redirect('/admin');
      return response;
    }

    const token = req.cookies.get(COOKIE)?.value;
    let valid = false;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, secretKey());
        valid = payload.role === 'admin';
      } catch {
        valid = false;
      }
    }
    if (!valid && !isLogin) return redirect('/admin/login');
    if (valid && isLogin) return redirect('/admin');
    return NextResponse.next();
  }

  /* ——— i18n : / = français (rewrite interne), /fr, /en et /ar explicites ——— */
  const hasLocale = /^\/(fr|en|ar)(\/|$)/.test(pathname);
  if (!hasLocale) {
    const url = req.nextUrl.clone();
    url.pathname = `/fr${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|images|uploads|favicon.ico|og.jpg|icon.png|sitemap.xml|robots.txt).*)'],
};
