// actions.ts
import { createClient } from '@/utils/supabase/client';
export interface Game {
  id: string;
  game_id: string; // Asegúrate de que este campo exista en tu base de datos
  nombre: string;
  descripcion: string;
  imagen: string;
  modo: 'single' | 'multi';
  pathPrefix?: string; 
}

export async function getGamesFromDatabase(): Promise<{ singlePlayer: Game[]; multiPlayer: Game[] }> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('games')
      .select('id, game_id, nombre, descripcion, imagen, modo, pathPrefix')
      .order('id', { ascending: true }); // <--- ¡Añade esta línea!

    if (error) {
      console.error('Error fetching games from Supabase:', error.message);
      throw new Error('Could not fetch games');
    }

    if (!data) {
      return { singlePlayer: [], multiPlayer: [] };
    }

    const allGames: Game[] = data as Game[];

    const singlePlayerGames: Game[] = [];
    const multiPlayerGames: Game[] = [];

    // Clasifica los juegos según su modo
    for (const game of allGames) {
      if (game.modo === 'single') {
        singlePlayerGames.push(game);
      } else if (game.modo === 'multi') {
        multiPlayerGames.push(game);
      }
    }

    // Opcional: Si quieres asegurarte de que también estén ordenados DESPUÉS de la separación,
    // aunque .order() en la consulta principal ya debería haberlos traído ordenados.
    // singlePlayerGames.sort((a, b) => a.id.localeCompare(b.id));
    // multiPlayerGames.sort((a, b) => a.id.localeCompare(b.id));

    return {
      singlePlayer: singlePlayerGames,
      multiPlayer: multiPlayerGames,
    };
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return { singlePlayer: [], multiPlayer: [] };
  }
}

// ... (las funciones getSinglePlayerGames y getMultiPlayerGames también deberían usar .order('id', { ascending: true })
// si las usas directamente)