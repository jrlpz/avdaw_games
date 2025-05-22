'use server';

import { createClient } from '@/utils/supabase/server';
import {getCurrentSession, createSession} from '@/app/auth/session';


export async function recuperarUsuario(email: string, username: string) {
    const supabase = await createClient();  // Crear cliente dentro de la función
    try {
        const { data: usuario, error } = await supabase
            .from('usuarios')
            .select('*')
            .or(`email.eq.${email},username.eq.${username}`)
            .single();

        if (error) {
            console.error('Error al recuperar usuario:', error);
            throw new Error(`No se pudo recuperar la información del usuario: ${error.message}`);
        }

        return usuario;
    } catch (error: unknown) {
        console.error('Error inesperado:', error);
        throw new Error(`Error al procesar la solicitud: ${(error as Error).message}`);
    }
}



export async function calcularEstadisticas(name: string) {
    const supabase = await createClient();  // Crear cliente dentro de la función
    try {
        const { data: results, error } = await supabase
            .from('results')
            .select('result')
            .eq('name', name);

        if (error) {
            console.error('Error al recuperar resultados:', error);
            throw new Error(`No se pudo recuperar la información del usuario: ${error.message}`);
        }

        if (!results || results.length === 0) {
            return { victorias: 0, empates: 0, derrotas: 0 };
        }

        let victorias = 0;
        let empates = 0;
        let derrotas = 0;

        for (const result of results) {
            if (result.result === 1) {
                victorias++;
            } else if (result.result === 0) {
                empates++;
            } else if (result.result === -1) {
                derrotas++;
            }
        }

        return { victorias, empates, derrotas };
    } catch (error: unknown) {
        console.error('Error inesperado:', error);
         throw new Error(`Error al procesar la solicitud  ${(error as Error).message}`); 
    }
}


export async function guardarDatos(
 
  email: string,
   username:string,
  descripcion: string,
  favorito: string,
) {
  const supabase = await createClient();
  console.log('Actualizando usuario con:', {
  email,
  username,
  descripcion,
  favorito,
});
  console.log('Recibiendo en guardarDatos:', { email, descripcion, favorito });

  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        username:username,
        descripcion: descripcion,
        favorito: favorito,
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    
    console.log('Datos guardados en Supabase:', data);

      // Get the current session data
      const currentSession = await getCurrentSession();
      console.log('currentSesion', currentSession)
      if (!currentSession) {
        console.warn('No se pudo obtener la sesión actual.');
        return data; // Or throw an error if you require an active session
      }

      // Update the session with the new username.  Keep userId and email same
      await createSession(currentSession.userId.toString(), currentSession.email, username);
    
    return data;

  } catch (error) {
    console.error('Error detallado en guardarDatos:', error);
    throw new Error(`Error al guardar: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function actualizarContraseña(email: string, password: string) {
  const supabase = await createClient();
  
  console.log('Actualizando contraseña para:', email);

  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) throw error;
    
    console.log('Contraseña actualizada:', data);
    return data;

  } catch (error) {
    console.error('Error detallado en actualizarContraseña:', error);
    throw new Error(`Error al actualizar contraseña: ${error instanceof Error ? error.message : String(error)}`);
  }
}