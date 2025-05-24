'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSessionAndUser = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      // Obtener el usuario de la tabla usuarios usando el email
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('username')
        .eq('email', session.user.email)
        .single()

      if (userError || !userData) {
        console.error('Error al obtener usuario:', userError)
        // Si falla, usar la parte antes del @ del email como fallback
        const email = session.user.email
        const nameFromEmail = email ? email.split('@')[0] : 'Usuario'
        setUsername(nameFromEmail)
        sessionStorage.setItem('name', nameFromEmail)
      } else {
        // Usar el username de la tabla usuarios
        setUsername(userData.username)
        sessionStorage.setItem('name', userData.username)
      }

      setLoading(false)

      if (searchParams.has('game-id')) {
        setRoomCode(searchParams.get('game-id') || '')
      }
    }

    getSessionAndUser()
  }, [router, searchParams])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!roomCode) {
      alert('Por favor ingresa un código de sala')
      return
    }

    const supabase = createClient()
    const insertResult = await supabase.from('results').insert([
      {
        room_name: roomCode,
        name: username,
        result: 0,
      },
    ])

    if (insertResult.error) {
      console.error(insertResult.error)
      alert('Error al unirse a la sala. Verifica el código e intenta nuevamente.')
      return
    }

    router.push(`/juegos/multiplayer/${roomCode}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <form
      className="flex flex-col items-center justify-center mt-8 space-y-4"
      onSubmit={handleSubmit}
    >
      <div className="px-8 py-4 bg-gray-200 text-black rounded-lg shadow-lg w-full text-center">
        Jugando como: <strong>{username}</strong>
      </div>
      <input
        className="px-8 py-4 bg-white text-black rounded-lg shadow-lg w-full"
        placeholder="Código de la sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        required
      />
      <button
        className="mt-4 px-8 py-4 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        type="submit"
      >
        Unirse a la partida
      </button>
    </form>
  )
}