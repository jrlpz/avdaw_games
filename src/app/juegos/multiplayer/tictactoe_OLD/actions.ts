'use server';

import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

// Función para crear una sala
export async function createRoom(userId: string) {
  const supabase = await createClient();

  try {
    console.log("createRoom - userId:", userId);

    const currentRoomId = uuidv4();
    console.log("createRoom - currentRoomId:", currentRoomId);

    const { error } = await supabase
        .from('salas')
        .insert([{ id: currentRoomId, player1: userId, updated_at: new Date().toISOString() }]);

    if (error) {
        console.error('Error al crear la sala:', error);
        return null; // Indica que hubo un error
    }
    console.log(`Usuario ${userId} creó la sala ${currentRoomId}`);
    revalidatePath('/juegos/tictactoe');
    return currentRoomId;
  } catch (error) {
    console.error("Error al crear la sala:", error);
    return null;
  }
}

// Función para unirse a una sala disponible
export async function joinAvailableRoom(userId: string) {
    const supabase = await createClient();

    try {
        console.log("joinAvailableRoom - userId:", userId);

        // 1. Buscar una sala disponible (con player2 como NULL)
        const { data: availableRoom, error: roomError } = await supabase
            .from('salas')
            .select('id')
            .is('player2', null)
            .limit(1)
            .single();

        console.log("joinAvailableRoom - availableRoom:", availableRoom);
        console.log("joinAvailableRoom - roomError:", roomError);

        if (roomError && !roomError.message.includes('No rows found')) {
            console.error('Error al buscar salas:', roomError);
            return null; // Indica que hubo un error
        }

        if (availableRoom) {
            // Unirse a la sala existente
            console.log("joinAvailableRoom - Joining room:", availableRoom.id);
            const { error: joinError } = await supabase
                .from('salas')
                .update({ player2: userId, updated_at: new Date().toISOString() })
                .eq('id', availableRoom.id);

            if (joinError) {
                console.error('Error al unirse a la sala:', joinError);
                return null; // Indica que hubo un error
            }
            console.log(`Usuario ${userId} se unió a la sala ${availableRoom.id}`);
            revalidatePath('/juegos/tictactoe');
            return availableRoom.id;
        }

        console.log("joinAvailableRoom - No available rooms found");
        return null; // No se encontró ninguna sala disponible
    } catch (error) {
        console.error("Error al unirse a una sala:", error);
        return null;
    }
}

export async function leaveRoom(userId: string, roomId: string) {
    const supabase = await createClient();

    try {
        // Desconectar al jugador de la sala estableciendo su ID en NULL
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();

        if (getUserError) {
            console.error("Error al obtener el usuario:", getUserError);
            return false; // Indica que hubo un error
        }
        console.log('el valor de user',user)
        console.log('el valor de userId',userId)

        const { error: leaveError } = await supabase
            .from('salas')
            .update({ player1: (user?.id === userId) ? null : null, player2: (user?.id === userId) ? null : null, updated_at: new Date().toISOString() })
            .eq('id', roomId);

        if (leaveError) {
            console.error('Error al salir de la sala:', leaveError);
            return false; // Indica que hubo un error
        }

        console.log(`Usuario ${userId} salió de la sala ${roomId}`);
        revalidatePath('/juegos/tictactoe'); // Opcional: Revalida la ruta para actualizar la caché
        return true; // Indica que la salida fue exitosa
    } catch (error) {
        console.error("Error al salir de la sala:", error);
        return false;
    }
}