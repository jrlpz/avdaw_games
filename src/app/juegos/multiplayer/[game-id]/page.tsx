'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaTimes, FaRegCircle } from "react-icons/fa";
import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';
import { GiTicTacToe } from 'react-icons/gi';
import { RealtimeCursors } from '@/components/realtime-cursors';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface RoomData {
  board: number[];
  next_player: string | null;
  winner: string | null;
  player1: string | null;
  player1_avatar: string | null;
  player1_symbol: 'X' | 'O';
  player2: string | null;
  player2_avatar: string | null;
  player2_symbol: 'X' | 'O'; 
  created_at: string;
}

interface Player {
  id: string;
  name: string;
  avatar?: string | null;
  symbol?: 'X' | 'O' | null;
}



interface PresenceState {
  [id: string]: Array<{ name: string }>; 
}

export default function TicTacToe() {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const routerParams = useParams();
  const roomName = routerParams['game-id'] as string;
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [gameState, setGameState] = useState({
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0], 
    nextPlayer: null as string | null,
    winner: null as string | null,
  });
  const [users, setUsers] = useState<Player[]>([]); 
  const [initialLoad, setInitialLoad] = useState(false);
  const { width, height } = useWindowSize();
  const [gameReady, setGameReady] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);
  const router = useRouter();

  // 1. Obtener username de la sesión
  useEffect(() => {
    const name = sessionStorage.getItem('name');
    setCurrentUser(name);
  }, []);

  // 2.Recuperar el estado inicial en cuanto 'roomName' y 'currentUser' estén accesibles.
  useEffect(() => {
    if (!roomName || !currentUser) return;

    const fetchInitialState = async () => {
      const supabase = createClient();

    
      const { data: roomResponseData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_name', roomName)
        .single();

      if (roomError) {
        console.error('Error al cargar estado inicial de la sala:', roomError);
        router.push('/');
        return;
      }

      if (roomResponseData) {
        setRoomData(roomResponseData);
        setInitialLoad(true);
      }
    };

    fetchInitialState();
  }, [roomName, router, currentUser]);

  // 3. Suscripcion a Realtime
  useEffect(() => {
    if (!roomName || !currentUser) return;

    const supabase = createClient();
    const channel = supabase.channel(`room:${roomName}`);
    const handleGameUpdate = (payload: { new: RoomData }) => {
      console.log('Realtime UPDATE received:', payload.new);
      setRoomData(payload.new); 
     
    };

    // Para sincronia de presencia
    const handlePresenceSync = async () => {
       const presenceState = channel.presenceState() as PresenceState;
       console.log('Presence sync state:', presenceState);

    };

    channel
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        {
          event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.UPDATE,
          schema: 'public',
          table: 'rooms',
          filter: `room_name=eq.${roomName}`,
        },
        handleGameUpdate
      )
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: 'sync' },
        handlePresenceSync
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Suscrito a la sala:${roomName}`);
          await channel.track({ name: currentUser });
        }
        if (status === 'CHANNEL_ERROR') {
           console.error('Error en canal de Supabase:', channel.state);
        }
      });

    return () => {
      console.log(`Desuscrito de la sala:${roomName}`);
      supabase.removeChannel(channel);
    };
  }, [roomName, currentUser]); 


  // 4. Sincronizar los estados (gameState, users, gameReady, playerSymbol) cada vez que roomData cambie.
  useEffect(() => {
    if (!roomData) return;

    console.log('roomData updated in effect:', roomData);

    // Actualizar gameState con los datos de roomData
    setGameState({
      board: [...roomData.board],
      nextPlayer: roomData.next_player,
      winner: roomData.winner || null,
    });

    // Utiliza roomData para construir la lista de jugadores
    const players: Player[] = [];
    if (roomData.player1) {
      players.push({
        id: 'player1',
        name: roomData.player1,
        avatar: roomData.player1_avatar,
        symbol: roomData.player1_symbol
      });
    }
    if (roomData.player2) {
      players.push({
        id: 'player2',
        name: roomData.player2,
        avatar: roomData.player2_avatar,
        symbol: roomData.player2_symbol
      });
    }
    setUsers(players); 

    // Determina si la partida puede emepzar
    const ready = !!roomData.player1 && !!roomData.player2;
    setGameReady(ready);
    console.log('Game ready status:', ready);

    // Utiliza roomData para asignar los simbolos de los jugadores
    if (currentUser) {
       const correctPlayerSymbol = roomData.player1 === currentUser
         ? roomData.player1_symbol
         : roomData.player2 === currentUser ? roomData.player2_symbol : null;
       setPlayerSymbol(correctPlayerSymbol);
      
    }

    // Establecer el next_player inicial si el juego  está listo y aún no está definido.
    if (ready && roomData.next_player === null) {
      const supabase = createClient();
      // Start with player1 from roomData
      console.log('Setting initial next player to:', roomData.player1);
      supabase.from('rooms').update({ next_player: roomData.player1 }).eq('room_name', roomName).then(({ error }) => {
        if (error) console.error('Error setting initial next player:', error);
      });
    }

  }, [roomData, currentUser, roomName]); 

  // 5. Logs para debug
   useEffect(() => {
     console.log('Current state:', {
       board: gameState.board,
       playerSymbol,
       users: users, 
       currentUser,
       nextPlayer: gameState.nextPlayer,
       gameReady: gameReady 
     });
   }, [gameState, playerSymbol, users, currentUser, gameReady]); 

  // 6. Comprobar si hay ganador
  const checkWinner = useCallback((board: number[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // filas
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columnas
      [0, 4, 8], [2, 4, 6] // diagonales
    ];


// Mapea los valores del tablero a sus símbolos para la verificación:
// 1 corresponde a X
// 2 corresponde a O
    const boardSymbols = board.map(cell => cell === 1 ? 'X' : cell === 2 ? 'O' : null);

    for (const [a, b, c] of lines) {
      if (boardSymbols[a] && boardSymbols[a] === boardSymbols[b] && boardSymbols[a] === boardSymbols[c]) {
        const winningSymbol = boardSymbols[a];

        // Buscar al jugador con ese símbolo en la lista de usuarios actuales (derivada de roomData).
        const winnerPlayer = users.find(user => user.symbol === winningSymbol);

        // Devuelve el ganador o empate
        return winnerPlayer ? winnerPlayer.name : null;
      }
    }

    if (board.every(cell => cell !== 0)) return 'draw';
    return null;
  }, [users]); 

  // 7. Gestionar el clic en la celda, asegura el mapeo de símbolos correcto
  const handleCellClick = async (index: number) => {
   
    if (
      !currentUser || 
      gameState.board[index] !== 0 || 
      gameState.winner || 
      currentUser !== gameState.nextPlayer || 
      !gameReady || 
      !playerSymbol 
    ) {
      console.log('Move not allowed:', { currentUser, cellValue: gameState.board[index], winner: gameState.winner, isTurn: currentUser === gameState.nextPlayer, gameReady, playerSymbol });
      return;
    }

    // Determinar el valor a colocar en el tablero (1 para X, 2 para O).
    const cellValue = playerSymbol === 'X' ? 1 : 2;

    const newBoard = [...gameState.board];
    newBoard[index] = cellValue;
    const newWinner = checkWinner(newBoard);

    // Determina el siguiente jugador 
    const currentPlayerAssigned = users.find(u => u.name === currentUser); 
    const newNextPlayer = users.find(u => u.name !== currentPlayerAssigned?.name)?.name || null; 


    const supabase = createClient();

    // Actualiza el estado en la base de datos
    console.log('Updating game state:', { board: newBoard, next_player: newNextPlayer, winner: newWinner });
    const { error: gameError } = await supabase
      .from('rooms')
      .update({
        board: newBoard,
        next_player: newNextPlayer,
        winner: newWinner,
      })
      .eq('room_name', roomName);

    if (gameError) {
      console.error('Error al actualizar el juego:', gameError);
      
      return;
    }

    // Actualiza el estado local del juego
    if (newWinner) {
      try {
        console.log('Game finished. Winner:', newWinner);
    
        const { data: existingResults, error: fetchError } = await supabase
          .from('results')
          .select('id, name')
          .eq('room_name', roomName);

        if (fetchError) throw fetchError;

        // Preparar los datos para la operación upsert(insertar o actualizar) basándose en los jugadores asignados en roomData
        const updates = users.map(user => {
          const existing = existingResults?.find(r => r.name === user.name);
          return {
            ...(existing && { id: existing.id }), 
            room_name: roomName,
            name: user.name,
            result: newWinner === 'draw' ? 0 : 
                   newWinner === user.name ? 1 : 
                   -1 // -1 for loss
          };
        });

        console.log('Upserting results:', updates);
        // LLeva a cabo el upsert de resultados
        const { error: resultsError } = await supabase
          .from('results')
          .upsert(updates);

        if (resultsError) throw resultsError;
        console.log('Results updated successfully.');

      } catch (error) {
        console.error('Error al actualizar resultados:', error);
      }
    }
  };

  const isCurrentTurn = currentUser === gameState.nextPlayer && !gameState.winner && gameReady; // Ensure game is ready

  // 8. Lógica de visualización de valores en el tablero
  const displayValue = (cell: number) => {
    if (cell === 1) return <FaTimes className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />;
    if (cell === 2) return <FaRegCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />;
    return null;
  };

  if (!initialLoad) {
    return <div className="flex items-center justify-center h-screen text-gray-700">Cargando partida...</div>;
  }

  return (
    <div className="px-2 sm:px-4 max-w-7xl mx-auto flex flex-col items-center w-full">
      {gameState.winner && (
        <Confetti
          width={width}
          height={height}
          style={{ zIndex: -1 }}
        />
      )}

      {/* Realtime Cursors */}
      {roomName && currentUser && <RealtimeCursors roomName={roomName} username={currentUser} />}

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full px-2 sm:px-0">
        {/* Lista de jugadores */}
        <div className="md:col-span-1 order-1">
          <div className="bg-purple-950 text-white p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold mb-2">Jugadores:</h3>
            <div className="flex flex-col gap-4">
      
              {users.length === 0 && (
                 <p className="text-gray-400 text-sm">Cargando jugadores...</p>
              )}
              {users.map((user) => {
                const isCurrentUser = user.name === currentUser;
                const isCurrentTurnPlayer = user.name === gameState.nextPlayer && !gameState.winner;

                return (
                  <div key={user.id} className={`flex items-center p-2 rounded shadow-sm transition-all duration-200 ease-in-out
                    ${isCurrentTurnPlayer
                      ? 'ring-2 ring-yellow-400 bg-slate-700'
                      : 'bg-slate-600'
                    }`}>
                    {/* Avatares */}
                    {user.avatar ? (
                      <img src={user.avatar} alt={`Avatar de ${user.name}`}
                        className="w-8 h-8 rounded-full mr-2 border-2 border-white" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-400 mr-2 flex items-center justify-center text-white font-bold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}

                    {/* Simbolos */}
                    {user.symbol === 'X' ? (
                      <FaTimes className="mr-2 text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
                    ) : user.symbol === 'O' ? (
                      <FaRegCircle className="mr-2 text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                       <div className="mr-2 w-5 h-5 sm:w-6 sm:h-6 bg-gray-500 rounded-full"></div> 
                    )}

                    <span className="font-medium text-sm sm:text-base">
                      {user.name}
                      {isCurrentUser && <span className="ml-1 text-gray-300">(tú)</span>}
                    </span>

                    <span className="ml-auto text-gray-400 text-sm sm:text-base">
                       {user.symbol}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Esperando jugadores*/}
          {!gameReady && initialLoad && (
            <div className="text-center mt-4">
              <p className="text-yellow-500 font-bold">
                Esperando al segundo jugador...
              </p>
            </div>
          )}
        </div>

        {/* Tablero */}
        <div className="md:col-span-1 order-3 md:order-2">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {gameState.board.map((cell, index) => (
                <div
                  key={index}
                  onClick={() => handleCellClick(index)}
                  className={`aspect-square flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold rounded-lg transition-colors
                    ${cell === 1 ? 'bg-blue-100' : // X
                      cell === 2 ? 'bg-red-100' : // O
                        isCurrentTurn && cell === 0 && gameReady ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer' : // Empty, player's turn, game ready
                        'bg-gray-200 cursor-not-allowed'}
                    ${isCurrentTurn && cell === 0 && gameReady ? 'ring-1 sm:ring-2 ring-gray-300' : ''}`}
                >
                  {displayValue(cell)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Estado del juego */}
        <div className="md:col-span-1 order-2 md:order-3">
          <div className="mb-3 sm:mb-4 text-center bg-white p-3 sm:p-4 rounded-lg shadow-md">
            {gameState.winner === 'draw' ? (
              <p className="text-yellow-600 font-bold text-base sm:text-lg">¡Empate!</p>
            ) : gameState.winner ? (
              <p className="text-green-600 font-bold text-base sm:text-lg">¡Ganador: {gameState.winner}!</p>
            ) : gameReady ? (
              <div className="flex items-center justify-center gap-2 text-gray-700 text-base sm:text-lg">
                {(() => {
                  const nextPlayerUser = users.find(user => user.name === gameState.nextPlayer);
                  return (
                    <>
                      {nextPlayerUser?.avatar ? (
                        <img
                          src={nextPlayerUser.avatar}
                          alt={`Avatar de ${nextPlayerUser.name}`}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-gray-300"
                        />
                      ) : nextPlayerUser ? ( // Show initial if no avatar
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
                          {nextPlayerUser.name.charAt(0).toUpperCase()}
                        </div>
                       ) : null 
                       }
                      <span>Turno de: {gameState.nextPlayer}</span> 
                      {nextPlayerUser?.symbol && ( 
                         nextPlayerUser.symbol === 'X' ? (
                            <FaTimes className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <FaRegCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                          )
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-700 text-base sm:text-lg">Esperando jugadores...</p>
            )}
          </div>
        </div>
      </div>

      {/* Codigo de la sala */}
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mt-3 sm:mt-4 px-2 sm:px-0 mb-2">
        <div className="flex justify-center">
          {gameState.winner ? (
            <div className="py-2 bg-purple-950 text-white rounded-lg shadow-lg flex items-center p-2 sm:p-3 font-bold gap-2 w-fit">
              <button className="cursor-pointer text-sm sm:text-base" onClick={() => router.push('/')}>Salir</button>
            </div>
          ) : (
            <div className="py-2 bg-purple-950 text-white rounded-lg shadow-lg flex items-center p-2 sm:p-3 font-bold gap-2 w-fit">
              <span className="text-sm sm:text-base">Código: {roomName}</span>
              <button
                className="p-1 sm:p-2 rounded-lg shadow-lg hover:bg-gray-100 transition duration-100 text-white hover:text-gray-700"
                onClick={() => navigator.clipboard.writeText(roomName)}
                aria-label="Copiar código de sala"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-4 h-4 sm:w-5 sm:h-5 hover:scale-110 transition duration-100"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
