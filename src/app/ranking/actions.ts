'use server';

import { createClient } from '@/utils/supabase/server';
import { getCurrentSession, createSession } from '@/app/auth/session';
export interface UserStats {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    favorito: string | null;
    victorias: number;
    empates: number;
    derrotas: number;
    win_rate: number;
    ranking_score: number;
}

interface Friend {
    id: string;
    username: string;
}


export async function recuperarUsuario(email: string, username: string) {
    const supabase = await createClient();  
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


export async function getRankingUsers(): Promise<UserStats[]> {
  const supabase = await createClient();
  
  try {
    // 1. Recuperar todos los usuarios
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('id, username, email, avatar, favorito');
      
    if (usersError) {
      throw new Error(`Error al recuperar usuarios: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return [];
    }

    // 2. Para cada usuario, calcular sus estadísticas
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const { data: results, error: resultsError } = await supabase
          .from('results')
          .select('result')
          .eq('name', user.username);

        if (resultsError) {
          console.error(`Error al recuperar resultados para ${user.username}:`, resultsError);
          return {
            ...user,
            victorias: 0,
            empates: 0,
            derrotas: 0,
            win_rate: 0,
            partidas_jugadas: 0,
            ranking_score: 0
          };
        }

        let victorias = 0;
        let empates = 0;
        let derrotas = 0;

        results?.forEach(({ result }) => {
          if (result === 1) victorias++;
          else if (result === 0) empates++;
          else if (result === -1) derrotas++;
        });

        const partidas_jugadas = victorias + empates + derrotas;
        const win_rate = partidas_jugadas > 0 ? (victorias / partidas_jugadas) * 100 : 0;
        
        // Calculamos un score de ranking que combina win rate y número de partidas
        const factor_confianza = 1 - Math.exp(-partidas_jugadas / 10);
        const ranking_score = win_rate * factor_confianza;

        return {
          ...user,
          victorias,
          empates,
          derrotas,
          win_rate: parseFloat(win_rate.toFixed(2)),
          partidas_jugadas,
          ranking_score: parseFloat(ranking_score.toFixed(2))
        };
      })
    );

    // 3. Ordenar por ranking_score (de mayor a menor)
    return usersWithStats.sort((a, b) => b.ranking_score - a.ranking_score);
    
  } catch (error: unknown) {
    console.error('Error inesperado en getRankingUsers:', error);
    throw new Error(`Error al recuperar el ranking: ${(error as Error).message}`);
  }
}


export async function agregarAmigo(usuarioActualId: string, amigoId: string, amigoUsername: string) {
  const supabase = await createClient();
  
  try {
    // 1. Obtener el usuario actual
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('amigos')
      .eq('id', usuarioActualId)
      .single();

    if (userError) throw userError;
    if (!usuario) throw new Error('Usuario no encontrado');

    // 2. Verificar si ya son amigos
    const amigosActuales: Array<{id: string, username: string}> = usuario.amigos || [];
    const yaEsAmigo = amigosActuales.some(a => a.id === amigoId);
    
    if (yaEsAmigo) {
      return { success: false, message: 'Ya es tu amigo' };
    }

    // 3. Añadir el nuevo amigo
    const nuevosAmigos = [...amigosActuales, { id: amigoId, username: amigoUsername }];

    // 4. Actualizar la lista de amigos
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ amigos: nuevosAmigos })
      .eq('id', usuarioActualId);

    if (updateError) throw updateError;

    return { success: true, message: 'Amigo agregado' };
  } catch (error) {
    console.error('Error al agregar amigo:', error);
    return { success: false, message: `Error: ${(error as Error).message}` };
  }
}

export async function obtenerAmigos(usuarioId: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('amigos')
      .eq('id', usuarioId)
      .single();

    if (error) throw error;
    return data?.amigos || [];
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    return [];
  }
}

export async function quitarAmigo(usuarioActualId: string, amigoId: string) {
  const supabase = await createClient();
  
  try {
    // 1. Obtener el usuario actual
    const { data: usuario, error: userError } = await supabase
      .from('usuarios')
      .select('amigos')
      .eq('id', usuarioActualId)
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
      .eq('id', usuarioActualId);

    if (updateError) throw updateError;

    return { success: true, message: 'Amigo eliminado correctamente' };
  } catch (error) {
    console.error('Error al quitar amigo:', error);
    return { success: false, message: `Error: ${(error as Error).message}` };
  }
}