// new game/NewGamePage.tsx
'use client'
import './math_globals.css'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import {
  uniqueNamesGenerator, colors
} from 'unique-names-generator'

export default function NewGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameType = searchParams.get('gameType') || 'mathpuzzle'

  useEffect(() => {
    const createAndRedirectToGame = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const email = session.user.email
      const username = email ? email.split('@')[0] : 'Usuario'
      sessionStorage.setItem('name', username)

      const numberDictionary = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
      const randomName: string = uniqueNamesGenerator({
        dictionaries: [colors, numberDictionary, numberDictionary, numberDictionary, numberDictionary, numberDictionary],
        separator: '',
        length: 6,
      })

      interface InsertData {
        room_name: string;
        game_type: string;
        board?: number[];
        next_player?: string;
        winner?: null;
      }
      const insertData: InsertData = {
        room_name: randomName,
        game_type: gameType,
      }

      if (gameType === 'tictactoe') {
        insertData.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
        insertData.next_player = username
        insertData.winner = null
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
        .insert([{
          room_name: newGame.data.room_name || '',
          name: username,
          result: 0,
        }])

      if (insertResult.error) {
        console.error(insertResult.error)
        return
      }

      router.push(`/juegos/multiplayer/${newGame.data.room_name}`)
    }

    createAndRedirectToGame()
  }, [router, gameType])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Creando nueva partida...</p>
    </div>
  )
}