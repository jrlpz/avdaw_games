// app/auth/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
//import { createClient } from '@/utils/supabase/client'; // No es necesario el cliente de Supabase aquí

export async function logoutAction() {
  console.log('Ejecutando logout action...');
  try {
    // 1. Eliminar la cookie 'session' (tu propia sesión)
    (await cookies()).delete('session');
  } catch (error) {
    console.error("Error al borrar la cookie de sesión:", error);
  }

  redirect('/login');
}