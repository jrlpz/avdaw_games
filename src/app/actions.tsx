// actions.ts
import { createClient } from '@/utils/supabase/client';
export interface Game {
  id: string;
  game_id: string; 
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
      .order('id', { ascending: true });

    if (error) {
      console.error('Error al recuperar juegos desde Supabase:', error.message);
      throw new Error('No se pueden recuperar los juegos');
    }

    if (!data) {
      return { singlePlayer: [], multiPlayer: [] };
    }

    const allGames: Game[] = data as Game[];
    const singlePlayerGames: Game[] = [];
    const multiPlayerGames: Game[] = [];

    for (const game of allGames) {
      if (game.modo === 'single') {
        singlePlayerGames.push(game);
      } else if (game.modo === 'multi') {
        multiPlayerGames.push(game);
      }
    }

    return {
      singlePlayer: singlePlayerGames,
      multiPlayer: multiPlayerGames,
    };
  } catch (error) {
    console.error('Error inesperado:', error);
    return { singlePlayer: [], multiPlayer: [] };
  }
}
