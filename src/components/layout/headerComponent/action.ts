// app/auth/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


export async function logoutAction() {
  console.log('Ejecutando logout action...');
  try {
    (await cookies()).delete('session');
  } catch (error) {
    console.error("Error al borrar la cookie de sesión:", error);
  }

  redirect('/login');
}