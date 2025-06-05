import type { Metadata } from 'next'
import { GiTicTacToe } from "react-icons/gi";


export const metadata: Metadata = {
  title: 'Tic Tac Toe - Avdaw Games',
  description: 'Juego multijugador de Tres en Raya',
}

export default function TicTacToeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between p-12 pb-2 md:p-24 md:pb-4">
        <div className="z-10 md:max-w-5xl w-full items-center font-mono text-sm flex justify-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-4xl font-bold text-center">
             
              
               <div className="flex items-center  text-purple-950">
                    <h1 className="text-3xl font-bold"> Sala de espera  Tic Tac Toe</h1>
                    <GiTicTacToe className="text-3xl" />
                </div>
            </h1>
            <p className="text-center my-2">
              Crea una sala y comparte el enlace con tus amigos.
            </p>
            <div className="sm:mt-4">{children}</div>
          </div>
        </div>
      </main>
    </>
  )
}