
'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const router = useSearchParams()

  return (
    //Para poder mostar salas en curso y poder unirse, no se ha implemenado aún.
    <div className="flex flex-col items-center justify-center mt-8">
      {router.has('error') && router.get('error') === 'game-not-found' && (
        <div className="px-8 pb-8 text-red-500 rounded-lg shadow-lg">
         No hay partidas en curso, crea o unete a una.
        </div>
      )}

      <Link href="/juegos/multiplayer/new-game?gameType=tictactoe">
        <div className="mt-4 px-8 py-4 bg-green-500 hover:bg-green-800 border hover:border-3 hover:border-yellow-500 w-70 h-15 text-white text-center rounded-lg shadow-lg">
       Iniciar nueva partida 
        </div>
      </Link>

      <Link href="/juegos/multiplayer/join-game">
        <div className="mt-4 px-8 py-4 bg-blue-500  hover:bg-blue-800  border hover:border-3 hover:border-yellow-500 w-70 h-15 text-white text-center rounded-lg shadow-lg">
         Unirse a partida.
        </div>
      </Link>
    </div>
  )
}