'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GiTicTacToe } from 'react-icons/gi';
export default function JoinGamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
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
        .select('username, avatar')
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
        // Usar el username y avatar de la tabla usuarios
        setUsername(userData.username)
        setAvatar(userData.avatar)
        sessionStorage.setItem('name', userData.username)
        sessionStorage.setItem('avatar', userData.avatar)
      }

      setLoading(false)

      if (searchParams.has('game-id')) {
        setRoomCode(searchParams.get('game-id') || '')
      }
    }

    getSessionAndUser()
  }, [router, searchParams])

// En el archivo JoinGamePage.tsx
// Modificar el handleSubmit:

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  if (!roomCode) {
    alert('Por favor ingresa un código de sala');
    return;
  }

  const supabase = createClient();
  const currentUser = sessionStorage.getItem('name');
  const currentAvatar = sessionStorage.getItem('avatar');
  
  // Verificar si la sala existe
const { data: existingRoom, error: roomError } = await supabase
  .from('rooms')
  .select('room_name, player1, player2, player1_symbol, player2_symbol')
  .eq('room_name', roomCode)
  .single();

  if (roomError && roomError.code !== 'PGRST116') {
    console.error('Error al verificar sala:', roomError);
    alert('Error al verificar la sala. Intenta nuevamente.');
    return;
  }

  if (!existingRoom) {
    alert('La sala no existe. Verifica el código.');
    return;
  }

  if (existingRoom.player1 && existingRoom.player2) {
    alert('La sala ya está llena (2 jugadores)');
    return;
  }

 if (existingRoom.player1 !== currentUser) {
  const { error: updateError } = await supabase
    .from('rooms')
    .update({
      player2: currentUser,
      player2_avatar: currentAvatar
    })
    .eq('room_name', roomCode);

  if (updateError) {
    console.error('Error al unirse como jugador 2:', updateError);
    alert('Error al unirse a la sala.');
    return;
  }

  // Guardar el símbolo CORRECTO del jugador 2 en sessionStorage
  sessionStorage.setItem('playerSymbol', existingRoom.player2_symbol);
} else {
  // Si somos el jugador 1, guardar nuestro símbolo
  sessionStorage.setItem('playerSymbol', existingRoom.player1_symbol);
}
  // Registrar en la tabla results
  const insertResult = await supabase.from('results').insert([
    {
      room_name: roomCode,
      name: currentUser,
      result: 2,
    },
  ]);

  if (insertResult.error) {
    console.error(insertResult.error);
    alert('Error al registrar participación.');
    return;
  }

  router.push(`/juegos/multiplayer/${roomCode}`);
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
           <div className="text-center mb-6 sm:mb-12 mt-4 sm:mt-4 w-full">
        <div className="flex flex-col items-center gap-4 sm:gap-6 justify-center">
          <h4 className="text-slate-600 text-xl font-semibold">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Tic Tac Toe</h1>
              <GiTicTacToe className="text-2xl sm:text-3xl" />
            </div>
          </h4>
        </div>
      </div>
      <div className="px-8 py-4 bg-purple-950 text-white p-3 sm:p-4 rounded-lg shadow-lg w-full max-w-md text-center">
       Introduce un código pata unirte como <strong>{username}</strong>
     
      <input
        className="px-4 py-4 mt-4 bg-white text-black rounded-lg shadow-lg max-w-md w-full text-center"
        placeholder="Código de la sala"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        required
      />
         <button
        className="mt-4 px-8 py-4 ring-1  bg-slate-700 font-bold rounded-lg shadow-lg hover:bg-white hover:text-black transition-colors"
        type="submit"
      >
        Unirse a la partida
      </button>
       </div>
   
    </form>
  )
}