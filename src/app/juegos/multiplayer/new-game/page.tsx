// new game/NewGamePage.tsx
'use client'
import './math_globals.css'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation' // Import useSearchParams
import { FormEvent, useState } from 'react'
import {
  uniqueNamesGenerator, colors
} from 'unique-names-generator'

export default function NewGamePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const searchParams = useSearchParams(); // Get query parameters
  const gameType = searchParams.get('gameType') || 'mathpuzzle'; // Determine game type, default to 'mathpuzzle'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sessionStorage.setItem('name', name)

    const numberDictionary = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const randomName: string = uniqueNamesGenerator({
      dictionaries: [colors,numberDictionary,numberDictionary,numberDictionary,numberDictionary,numberDictionary],
      separator: '',
      length: 6,
    })

    const supabase = createClient();
    interface InsertData {
      room_name: string;
      game_type: string;
      board?: number[];
      next_player?: string;
      winner?: null;
    }
    const insertData: InsertData = {
      room_name: randomName,
      game_type: gameType, // Set the game type
    };

    if (gameType === 'tictactoe') {
      insertData.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      insertData.next_player = name;
      insertData.winner = null;
    }

    const newGame = await supabase
      .from('rooms')
      .insert(insertData)
      .select()
      .single()

    if (newGame.error) {
      console.error(newGame.error)
      return
    }

    const insertResult = await supabase
      .from('results')
      .insert([
        {
          room_name: newGame.data.room_name || '',
          name: name,
          result: 0,
        },
      ])

    if (insertResult.error) {
      console.error(insertResult.error)
      return
    }

    router.push(`/juegos/multiplayer/${newGame.data.room_name}`)
  }

  return (
    <form
      className="flex flex-col items-center justify-center mt-8"
      onSubmit={handleSubmit}
    >
      <input
        className="px-8 py-4 bg-white text-black rounded-lg shadow-lg"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="mt-4  px-8 py-4 bg-blue-500 text-white rounded-lg shadow-lg"
        type="submit"
      >
       Iniciar partida
      </button>
    </form>
  )
}