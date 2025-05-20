// middleware.js
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
console.log("Middleware ejecutándose..."); 
const secretKey = process.env.SECRET;
const key = new TextEncoder().encode(secretKey);

async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.log("Error decrypting session:", error);
    return null;
  }
}

export async function middleware(request:NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ['/juegos/multiplayer/tictactoe'];

  if (protectedRoutes.includes(pathname)) {
    const sessionCookie = request.cookies.get('session');
    const session = sessionCookie?.value;

    if (!session) {
      console.log("No session cookie found, redirecting to /login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Decrypt the session cookie
      const payload = await decrypt(session);

      if (!payload || !payload.userId) {
        console.log("Invalid session payload, redirecting to /login");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      console.log("Session is valid, user ID:", payload.userId);
      return NextResponse.next(); // If session is valid, continue
    } catch (error) {
      console.error("Error decrypting or verifying session:", error);
      return NextResponse.redirect(new URL('/login', request.url)); // If decryption fails, redirect to login
    }
  }

  // Permitir el acceso a las rutas no protegidas
  return NextResponse.next();
}

export const config = {
  matcher: ['/juegos/multiplayer/tictactoe','/chat'],
  
};