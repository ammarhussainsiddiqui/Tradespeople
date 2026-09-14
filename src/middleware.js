import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'aasdnksadnska87t8sdysv';
const jwtConfig = {
    secret: new TextEncoder().encode(JWT_SECRET),
};

export default async function middleware(req) {
    const path = req.nextUrl.pathname;
    
    if (path.startsWith('/api')) {
        return NextResponse.next();
    }

    // const token = req.cookies.get('jwt')?.value;

    // if (!token) {
    //     console.log("No token found, redirecting to /login" + token);
    //     return NextResponse.redirect(new URL('/login', req.url));
    // }

    // try {
    //     const decodedToken = (await jwtVerify(token, jwtConfig.secret)).payload;

    //     const currentTime = Math.floor(Date.now() / 1000);

    //     if (decodedToken.exp < currentTime) {
    //         console.log("Token expired, redirecting to /login");
    //         cookies().delete("jwt");
            
    //         return NextResponse.redirect(new URL('/login', req.url));
    //     }

    //     console.log(`Current path: ${path}`);

    //     // Redirect based on role
    //     if (decodedToken.role === 1) {
    //         if (!path.startsWith('/user')) {
    //             return NextResponse.redirect(new URL('/user', req.url));
    //         }
    //     } else if (decodedToken.role === 2) {
    //         if (!path.startsWith('/tradesperson')) {
    //             return NextResponse.redirect(new URL('/tradesperson', req.url));
    //         }
    //     } else if (decodedToken.role === 3) {
    //         if (!path.startsWith('/admin')) {
    //             return NextResponse.redirect(new URL('/admin', req.url));
    //         }
    //     } 
    // } catch (err) {
    //     console.error("JWT verification failed:", err);
    //     return NextResponse.redirect(new URL('/login', req.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public|assets|login).*)',
    ],
};
