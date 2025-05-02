// app/auth/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Reutiliza tu función deleteSession si ya hace lo necesario
// O define la lógica aquí directamente
export async function logoutAction() {
  console.log('Ejecutando logout action...');
  try {
    // Lógica de deleteSession:
    (await
      // Lógica de deleteSession:
      cookies()).delete('session');
    // Nota: La redirección en una Server Action debe hacerse fuera del try/catch
    // si quieres que ocurra incluso si la cookie no existía.
  } catch (error) {
    console.error("Error al borrar la cookie de sesión:", error);
    // Puedes decidir si redirigir igualmente o devolver un error
  }
  redirect('/login'); // Redirige al login después de borrar la cookie
}