'use server';

import { createClient } from '@/utils/supabase/server';
import {getCurrentSession, createSession} from '@/app/auth/session';

export interface Friend {
  id: string;
  username: string;
  avatar: string | null;
}
export interface FriendDetails extends Friend {
  victorias?: number;
  empates?: number;
  derrotas?: number;
  descripcion?: string;
  favorito?: string;
}
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

export async function uploadAvatar(email: string, file: File) {
  const supabase = await createClient();
  
  try {
    // 1. Validaciones del archivo
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !validExtensions.includes(fileExt)) {
      throw new Error('Formato no válido. Use JPG, PNG, GIF o WEBP');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error('La imagen no puede ser mayor a 2MB');
    }

    // 2. Generar nombre único para el archivo
    const timestamp = Date.now();
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, '-');
    const fileName = `avatar-${safeEmail}-${timestamp}.${fileExt}`;
    const filePath = `avatars/${safeEmail}/${fileName}`;

    // 3. Subir el archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // 4. Obtener URL pública
    const { data: publicUrlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 5. Actualizar referencia en la tabla de usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .update({ 
        avatar: publicUrlData.publicUrl,
        avatar_path: filePath
      })
      .eq('email', email)
      .select()
      .single();

    if (userError) throw userError;

    // 6. Actualizar sesión
    const session = await getCurrentSession();
    if (session) {
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrlData.publicUrl }
      });
    }

    return {
      success: true,
      avatarUrl: publicUrlData.publicUrl,
      avatarPath: filePath
    };

  } catch (error) {
    console.error('Error en uploadAvatar:', {
      error,
      email,
      fileName: file.name
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al subir avatar',
      avatarUrl: null
    };
  }
}

export async function deletePreviousAvatar(avatarPath: string) {
  if (!avatarPath) return { success: true };

  const supabase = await createClient();
  
  try {
    // Extraer el path relativo
    const relativePath = avatarPath.startsWith('avatars/') 
      ? avatarPath 
      : avatarPath.split('/avatars/')[1] || avatarPath;

    const { error } = await supabase
      .storage
      .from('avatars')
      .remove([relativePath]);

    return { 
      success: !error,
      error: error?.message 
    };
  } catch (error) {
    console.error('Error al eliminar avatar anterior:', error);
    return { 
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}


export async function obtenerDetallesAmigo(amigoId: string, amigoUsername: string): Promise<FriendDetails> {
  const supabase = await createClient();
  
  try {
    // Obtener estadísticas del amigo
    const { data: estadisticas } = await supabase
      .from('results')
      .select('result')
      .eq('name', amigoUsername);

    let victorias = 0, empates = 0, derrotas = 0;
    estadisticas?.forEach(({ result }) => {
      if (result === 1) victorias++;
      else if (result === 0) empates++;
      else if (result === -1) derrotas++;
    });

    // Obtener información del perfil del amigo
    const { data: perfil } = await supabase
      .from('usuarios')
      .select('username, avatar, descripcion, favorito')
      .eq('id', amigoId)
      .single();

    return {
      id: amigoId,
      username: perfil?.username || amigoUsername,
      avatar: perfil?.avatar || null,
      descripcion: perfil?.descripcion,
      favorito: perfil?.favorito,
      victorias,
      empates,
      derrotas
    };
  } catch (error) {
    console.error('Error al obtener detalles del amigo:', error);
    throw new Error('No se pudieron cargar los detalles del amigo');
  }
}

export async function obtenerAmigosConAvatares(usuarioId: string): Promise<Friend[]> {
  const supabase = await createClient();
  
  try {
    // 1. Obtener la lista de IDs de amigos
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('amigos')
      .eq('id', usuarioId)
      .single();

    if (userError) throw userError;
    if (!usuario?.amigos?.length) return [];

    // 2. Obtener información completa de cada amigo
    const amigosIds = usuario.amigos.map((a: {id: string}) => a.id);
    
    const { data: amigosData, error: amigosError } = await supabase
      .from('usuarios')
      .select('id, username, avatar')
      .in('id', amigosIds);

    if (amigosError) throw amigosError;

    return amigosData?.map(amigo => ({
      id: amigo.id,
      username: amigo.username,
      avatar: amigo.avatar
    })) || [];
  } catch (error) {
    console.error('Error al obtener amigos con avatares:', error);
    return [];
  }
}

export async function quitarAmigo(usuarioId: string, amigoId: string) {
  const supabase = await createClient();
  
  try {
    // 1. Obtener el usuario actual
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('amigos')
      .eq('id', usuarioId)
      .single();

    if (userError) throw userError;
    if (!usuario) throw new Error('Usuario no encontrado');

    // 2. Filtrar la lista de amigos para quitar el amigo especificado
    const amigosActuales: Friend[] = usuario.amigos || [];
    const nuevosAmigos = amigosActuales.filter(a => a.id !== amigoId);

    // 3. Verificar si realmente existía el amigo
    if (amigosActuales.length === nuevosAmigos.length) {
      return { success: false, message: 'Este usuario no estaba en tu lista de amigos' };
    }

    // 4. Actualizar la lista de amigos
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ amigos: nuevosAmigos })
      .eq('id', usuarioId);

    if (updateError) throw updateError;

    return { success: true, message: 'Amigo eliminado correctamente' };
  } catch (error) {
    console.error('Error al quitar amigo:', error);
    return { success: false, message: `Error: ${(error as Error).message}` };
  }
}