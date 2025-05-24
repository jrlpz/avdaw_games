import type { Metadata } from 'next'


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
              Sala de espera <span className="text-blue-500">T</span>
              <span className="text-red-500">i</span>
              <span className="text-yellow-500">c</span>
              <span className="text-blue-500">T</span>
              <span className="text-green-500">a</span>
              <span className="text-red-500">c</span>
              <span className="text-blue-500">T</span>
              <span className="text-red-500">o</span>
              <span className="text-green-500">e</span>
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