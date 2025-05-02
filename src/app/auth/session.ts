import 'server-only';

import type { SessionPayload } from '@/app/auth/definitions';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'; 

const secretKey = process.env.SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1hr')
    .sign(key);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(userId: string,email: string) {
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const session = await encrypt({ userId, email, expiresAt });

  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySession() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { isAuth: true, userId: Number(session.userId) };
}

export async function updateSession() {
  const session = (await cookies()).get('session')?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  (await cookies()).set('session', session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  (await cookies()).delete('session');
  redirect('/login');
}



export async function getCurrentSession() {
  console.log('[getCurrentSession] Ejecutando...'); // Log 1: Inicio de la función
  const cookie = (await cookies()).get('session')?.value;
  console.log(`[getCurrentSession] Cookie 'session' encontrada: ${!!cookie}`); // Log 2: ¿Cookie existe?

  if (!cookie) {
    console.log('[getCurrentSession] No hay cookie, devolviendo null.'); // Log 3: Sale si no hay cookie
    return null;
  }

  let session: SessionPayload | null = null;
  try {
    // Asegúrate que 'decrypt' se llama correctamente
    session = await decrypt(cookie) as SessionPayload | null;
    // ¡¡¡ESTE LOG ES CLAVE!!!
    console.log('[getCurrentSession] Payload desencriptado:', session); // Log 4: ¿Qué contiene el payload? ¿Es null?
  } catch (error) {
    console.error('[getCurrentSession] Error durante decrypt:', error); // Log 5: Error desencriptando
    return null;
  }

  if (!session?.userId) {
     // Si el Log 4 mostró null, este log se ejecutará
    console.log('[getCurrentSession] Payload es null o no contiene userId. Devolviendo null.'); // Log 6: Sale si no hay userId
    return null;
  }

  console.log(`[getCurrentSession] Sesión válida encontrada. UserID: ${session.userId}, Email (del JWT): ${session.email}`); // Log 7: Datos básicos OK

  const usernameFromDb = null;
  const emailFromDb = null;
  try {
  } catch (dbError) {
    console.error('[getCurrentSession] Error general de DB:', dbError);
  }

  console.log('[getCurrentSession] Devolviendo datos de sesión procesados.'); // Log 8: Antes de devolver
  return {
    isAuth: true,
    userId: session.userId,
    email: emailFromDb || session.email || '',
    username: usernameFromDb || 'Usuario' // Puedes cambiar 'Usuario' por session.email si prefieres
  };
}

// Asegúrate que tu función decrypt está definida o importada correctamente
// async function decrypt(token: string): Promise<SessionPayload | null> { ... }