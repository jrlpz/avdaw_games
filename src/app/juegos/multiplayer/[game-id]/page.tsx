'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaTimes, FaRegCircle } from "react-icons/fa";
import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js';
import { GiTicTacToe } from 'react-icons/gi';

import { CurrentUserAvatar } from '@/components/current-user-avatar'
import { RealtimeCursors } from '@/components/realtime-cursors'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use';

interface Player {
  id: string;
  name: string;
}

interface RoomUpdatePayload {
  new: {
    board: number[];
    next_player: string | null;
    winner: string | null;
  };
}

interface PresenceState {
  [id: string]: Array<{ name: string }>;
}

export default function TicTacToe() {
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
  const router = useRouter()

  useEffect(() => {
    const name = sessionStorage.getItem('name');
    setCurrentUser(name);
  }, []);

  useEffect(() => {
    if (!roomName || !currentUser) return;

    const fetchInitialState = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('rooms')
        .select('board, next_player, winner')
        .eq('room_name', roomName)
        .single();

      if (error) {
        console.error('Error al cargar estado inicial:', error);
        router.push('/');
        return;
      }

      if (data) {
        setGameState({
          board: data.board,
          nextPlayer: data.next_player,
          winner: data.winner,
        });
        setInitialLoad(true);
      }
    };

    fetchInitialState();
  }, [roomName, router, currentUser]);

  useEffect(() => {
    if (!roomName || !currentUser) return;

    const supabase = createClient();
    const channel = supabase.channel(`room:${roomName}`);

    const handleGameUpdate = (payload: RoomUpdatePayload) => {
      setGameState({
        board: [...payload.new.board],
        nextPlayer: payload.new.next_player,
        winner: payload.new.winner || null,
      });
    };

    const handlePresenceSync = () => {
      const presenceState = channel.presenceState() as PresenceState;
      const users = Object.entries(presenceState).flatMap(
        ([id, presences]) =>
          presences.map((p) => ({ id, name: p.name }))
      );
      setUsers(users);
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
          await channel.track({ name: currentUser });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomName, currentUser]);

  useEffect(() => {
    setGameReady(users.length === 2);
    
    // Asignar nextPlayer si no está definido y hay 2 jugadores
    if (users.length === 2 && !gameState.nextPlayer) {
      const supabase = createClient();
      supabase
        .from('rooms')
        .update({ next_player: users[0].name })
        .eq('room_name', roomName);
    }
  }, [users, gameState.nextPlayer, roomName]);

  const checkWinner = useCallback((board: number[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        // board[a] será 1 o 2 (índice del jugador + 1)
        return users[board[a] - 1]?.name || null;
      }
    }

    if (board.every(cell => cell !== 0)) return 'draw';
    return null;
  }, [users]);

  const handleCellClick = async (index: number) => {
    if (
      !currentUser ||
      gameState.board[index] !== 0 ||
      gameState.winner ||
      currentUser !== gameState.nextPlayer ||
      !gameReady
    ) return;

    const playerIndex = users.findIndex(u => u.name === currentUser);
    if (playerIndex === -1) return;

    const newBoard = [...gameState.board];
    newBoard[index] = playerIndex + 1; // 1 para primer jugador, 2 para segundo

    const newWinner = checkWinner(newBoard);
    const newNextPlayer = users.find(u => u.name !== currentUser)?.name || null;

    const supabase = createClient();
    const { error } = await supabase
      .from('rooms')
      .update({
        board: newBoard,
        next_player: newNextPlayer,
        winner: newWinner,
      })
      .eq('room_name', roomName);

    if (error) console.error('Error al actualizar el juego:', error);
  };

  const isCurrentTurn = currentUser === gameState.nextPlayer && !gameState.winner;
  
  const displayValue = (cell: number) => {
    if (cell === 1) return <FaTimes className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />;
    if (cell === 2) return <FaRegCircle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6" />;
    return null;
  };

  if (!initialLoad) {
    return <div>Loading...</div>;
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

      {roomName && <RealtimeCursors roomName={roomName} username={currentUser || ''} />}

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
          <div className="bg-purple-950 text-white p-3 sm:p-4 rounded-t-lg">
            <h3 className="font-bold mb-2">Jugadores conectados:</h3>
            <div className="flex flex-col gap-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center p-2 rounded shadow-sm ${
                    user.name === gameState.nextPlayer && !gameState.winner
                      ? 'ring-2 ring-yellow-400 bg-slate-700'
                      : 'bg-slate-600'
                  }`}
                >
                  {index === 0 ? (
                    <FaTimes className="mr-2 text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FaRegCircle className="mr-2 text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  <span className="font-medium text-sm sm:text-base">
                    {user.name}
                    {user.name === currentUser && (
                      <span className="ml-1 text-white">(tú)</span>
                    )}
                  </span>
                  <span className="ml-auto text-gray-500 text-sm sm:text-base">
                    <CurrentUserAvatar />
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {!gameReady && (
            <div className="text-center mt-4">
              <p className="text-yellow-500 font-bold">
                Esperando a otro jugador para comenzar...
              </p>
            </div>
          )}
                  {/* Estado del juego */}

          <div className="mb-3 sm:mb-4 text-center bg-white p-3 sm:p-4 rounded-lg shadow-md">
            {gameState.winner === 'draw' ? (
              <p className="text-yellow-600 font-bold text-base sm:text-lg">¡Empate!</p>
            ) : gameState.winner ? (
              <p className="text-green-600 font-bold text-base sm:text-lg">¡Ganador: {gameState.winner}!</p>
            ) : gameReady ? (
              <div className="flex items-center justify-center gap-2 text-gray-700 text-base sm:text-lg">
                <span>Siguiente jugador: {gameState.nextPlayer}</span>
                <CurrentUserAvatar />
              </div>
            ) : (
              <p className="text-gray-700 text-base sm:text-lg">Esperando jugadores...</p>
            )}
          </div>
    
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
                    ${cell === 1 ? 'bg-blue-100' :
                      cell === 2 ? 'bg-red-100' :
                        isCurrentTurn && gameReady ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer' : 'bg-gray-200 cursor-not-allowed'}
                    ${isCurrentTurn && cell === 0 && gameReady ? 'ring-1 sm:ring-2 ring-gray-300' : ''}`}
                >
                  {displayValue(cell)}
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* Botón para copiar el código de la sala */}
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mt-3 sm:mt-4 px-2 sm:px-0 mb-2">
        <div className="flex justify-center">
          {gameState.winner ? (
            <div className="py-2 bg-purple-950 text-white rounded-lg shadow-lg flex items-center p-2 sm:p-3 font-bold gap-2 w-fit cursor-pointer">
              <button className="cursor-pointer text-sm sm:text-base" onClick={() => router.push('/')}>Salir</button>
            </div>
          ) : (
            <div className="py-2 bg-purple-950 text-white rounded-lg shadow-lg flex items-center p-2 sm:p-3 font-bold gap-2 w-fit">
              <span className="text-sm sm:text-base">Código: {roomName}</span>
              <button
                className="p-1 sm:p-2 rounded-lg shadow-lg hover:bg-gray-100 transition duration-100"
                onClick={() => navigator.clipboard.writeText(roomName)}
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