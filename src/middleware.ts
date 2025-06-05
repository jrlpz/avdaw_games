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
    console.log("Error al desencriptar la sesión:", error);
    return null;
  }
}

export async function middleware(request:NextRequest) {
  const { pathname } = request.nextUrl;


  const protectedRoutes = ['/juegos/multiplayer/tictactoe'];

  if (protectedRoutes.includes(pathname)) {
    const sessionCookie = request.cookies.get('session');
    const session = sessionCookie?.value;

    if (!session) {
      console.log("No se ha encontrado coolie de sesión, redirigiendo a /login");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {

      const payload = await decrypt(session);

      if (!payload || !payload.userId) {
        console.log("Contenido de la sesion no válido, redirigiendo a /login");
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next(); 
    } catch (error) {
      console.error("Error al desencriptar o verificar la sesión:", error);
      return NextResponse.redirect(new URL('/login', request.url)); 
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/juegos/multiplayer/tictactoe','/chat'],
  
};