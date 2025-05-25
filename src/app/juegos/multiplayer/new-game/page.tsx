'use client'

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
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // Obtener el usuario de la tabla usuarios usando el email
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('username, avatar')
          .eq('email', session.user.email)
          .single()

        const username = userData?.username || session.user.email?.split('@')[0] || 'Usuario'
        const avatar = userData?.avatar || ''
        
        sessionStorage.setItem('name', username)
        if (avatar) {
          sessionStorage.setItem('avatar', avatar)
        }

        const numberDictionary = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        const randomName: string = uniqueNamesGenerator({
          dictionaries: [colors, numberDictionary, numberDictionary, numberDictionary, numberDictionary, numberDictionary],
          separator: '',
          length: 6,
        })

        interface InsertData {
          room_name: string;
          game_type: string;
          player1: string;
          player1_avatar: string;
          created_at?:string;
          board?: number[];
          next_player?: string;
          winner?: null;
        }

        const insertData: InsertData = {
          room_name: randomName,
          game_type: gameType,
          player1: username,
          player1_avatar: avatar,
          created_at: new Date().toISOString()
        }

        if (gameType === 'tictactoe') {
          insertData.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
          insertData.next_player = username
          insertData.winner = null
        }

        // Primero intentamos crear la sala
        const { data: newGame, error: createError } = await supabase
          .from('rooms')
          .insert(insertData)
          .select()
          .single()

        if (createError) {
          console.error('Error al crear sala:', createError)
          alert('Error al crear la partida. Por favor intenta nuevamente.')
          router.push('/')
          return
        }

        // Luego insertamos el resultado
        const { error: resultError } = await supabase
          .from('results')
          .insert([{
            room_name: randomName,
            name: username,
            result: 2,
          }])

        if (resultError) {
          console.error('Error al crear resultado:', resultError)
          // No redirigimos aquí porque la sala ya se creó
        }

        router.push(`/juegos/multiplayer/${randomName}`)
      } catch (error) {
        console.error('Error inesperado:', error)
        alert('Ocurrió un error inesperado. Por favor intenta nuevamente.')
        router.push('/')
      }
    }

    createAndRedirectToGame()
  }, [router, gameType])

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Creando nueva partida...</p>
    </div>
  )
}