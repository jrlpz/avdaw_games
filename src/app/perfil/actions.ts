// app/lib/actions/userActions.ts
'use server';

import { createClient } from '@/utils/supabase/server';

export async function recuperarUsuario(email: string, username: string) {
  const supabase = createClient();
  
  try {
    const { data: usuario, error } = await (await supabase)
      .from('usuarios')
      .select('*')
      .or(`email.eq.${email},username.eq.${username}`)
      .single();

    if (error) {
      console.error('Error al recuperar usuario:', error);
      throw new Error('No se pudo recuperar la información del usuario');
    }

    return usuario;
  } catch (error) {
    console.error('Error inesperado:', error);
    throw new Error('Error al procesar la solicitud');
  }
}