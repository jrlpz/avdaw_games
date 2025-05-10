'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'

export default function NewGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  useEffect(() => {
    const name = sessionStorage.getItem('name')
    if (name) {
      setName(name)
    }

    if (searchParams.has('game-id')) {
      setRoomCode(searchParams.get('game-id') || '')
    }
  }, [searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    sessionStorage.setItem('name', name)

    const supabase = createClient();
    const insertResult = await supabase.from('results').insert([
      {
        room_name: roomCode,
        name: name,
        result: 0,
      },
    ])

    if (insertResult.error) {
      console.error(insertResult.error)
      return
    }

    router.push(`/juegos/multiplayer/${roomCode}`)
  }
  console.log('join game page');
  return (
    <form
      className="flex flex-col items-center justify-center mt-8 space-y-4"
      onSubmit={handleSubmit}
    >
      <input
        className="px-8 py-4 bg-white text-black rounded-lg shadow-lg"
        placeholder=" Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="px-8 py-4 bg-white text-black rounded-lg shadow-lg"
        placeholder="Codigo de la sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />
      <button
        className="mt-4 l px-8 py-4 bg-blue-500 text-white rounded-lg shadow-lg"
        type="submit"
      >
       Unirse
      </button>
    </form>
  )
}
