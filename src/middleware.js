import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED_PREFIXES = ['/user', '/tradesperson'];

// Lead links are shared in emails and messaging apps, whose link-preview crawlers
// need the page's Open Graph tags. The page layout still requires a login.
const PUBLIC_PATHS = ['/tradesperson/leads'];

const matchesPrefix = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

export default async function middleware(req) {
    const path = req.nextUrl.pathname;

    if (path.startsWith('/api')) {
        return NextResponse.next();
    }

    const isProtected =
        PROTECTED_PREFIXES.some((prefix) => matchesPrefix(path, prefix)) &&
        !PUBLIC_PATHS.some((prefix) => matchesPrefix(path, prefix));

    if (!isProtected) {
        return NextResponse.next();
    }

    // Role-based redirects stay in the (User_Flow) and (Tradesperson) layouts;
    // this only stops pages rendering for visitors without a valid session.
    const token = req.cookies.get('jwt')?.value;
    const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;

    if (token && secret) {
        try {
            await jwtVerify(token, new TextEncoder().encode(secret));
            return NextResponse.next();
        } catch {
            // Forged or expired: fall through to the login redirect
        }
    }

    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('jwt');
    response.cookies.delete('user');
    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|assets|login).*)',
    ],
};
