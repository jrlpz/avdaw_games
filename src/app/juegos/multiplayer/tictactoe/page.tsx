// TicTacToe.tsx (Client Component)

'use client'

import { useState, useEffect, useRef } from "react";
import { useWindowSize } from 'react-use';
import { v4 as uuidv4 } from 'uuid';

import { FaTimes, FaRegCircle } from "react-icons/fa";
import { GiTicTacToe } from "react-icons/gi";

import { createClient } from '@/utils/supabase/client'; // Cliente del lado del cliente para Realtime

import { RealtimeCursors } from '@/components/realtime-cursors'

import { createRoom, joinAvailableRoom, leaveRoom } from './actions'; // Importación corregida

interface TicTacToeBoard {
    room_id: string;
    board_state: (string | null)[];
    is_next: boolean;
    winner: string | null;
    is_draw: boolean;
    created_at: string;
    updated_at: string;
}

import Confetti from 'react-confetti'
export default function TicTacToe() {

    //Iniciamos cliente supabase para crear sala
    const [supabase] = useState(() => createClient());

    // Estado del juego
    const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
    const [isNext, setIsNext] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [isDraw, setIsDraw] = useState(false);
    const [roomId, setRoomId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);  // Estado para indicar si está cargando
    const [amIPlayer, setAmIPlayer] = useState<'X' | 'O' | null>(null);
    const [myTurn, setMyTurn] = useState(false);


    // ID del usuario (generado al entrar en la página)
    const userId = useRef(uuidv4()).current;

    const { width, height } = useWindowSize();

    // Función para calcular el ganador
    const calculateWinner = (squares: Array<string | null>) => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }

        return null;
    };

    useEffect(() => {
        const setupRoom = async () => {
            setIsLoading(true);
            let roomId: string | null = null;

            // Intenta unirse a una sala existente
            roomId = await joinAvailableRoom(userId);

            // Si no hay sala disponible, crea una nueva
            if (!roomId) {
                console.log("No se encontro sala, creando una nueva")
                roomId = await createRoom(userId);
                console.log("Nueva sala creada con la id", roomId)
            }

            if (roomId) {
                setRoomId(roomId);
            } else {
                console.error("No se pudo unirse ni crear una sala");
                // Manejar el error apropiadamente (mostrar un mensaje al usuario, etc.)
            }
            setIsLoading(false);
        };

        setupRoom();

        // Manejar la salida del usuario (IMPORTANTE: Recuerda que esto es solo una solución del lado del cliente y NO es confiable)
        const handleBeforeUnload = () => {
            if (roomId) {
                leaveRoom(userId, roomId);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [userId]);


    useEffect(() => {
        if (roomId) {
            // Determine si soy X o O
            const determinePlayer = async () => {
                const { data, error } = await supabase
                    .from('salas')
                    .select('player1, player2')
                    .eq('id', roomId)
                    .single();

                if (error) {
                    console.error("Error al obtener información de la sala:", error);
                    return;
                }

                if (data) {
                    if (data.player1 === userId) {
                        setAmIPlayer('X');
                    } else if (data.player2 === userId) {
                        setAmIPlayer('O');
                    }
                }
            };

            determinePlayer();

            // Subscripcion a los cambios
            const channel = supabase.channel(roomId)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'tictactoe_boards' }, (payload) => { // Updated event listener
                    if (payload.new) {
                        const newBoardData: TicTacToeBoard = payload.new as TicTacToeBoard;
                        // Actualizar el estado del juego con el nuevo estado desde la base de datos
                        setBoard(newBoardData.board_state);
                        setIsNext(newBoardData.is_next);
                        setWinner(newBoardData.winner);
                        setIsDraw(newBoardData.is_draw);
                    }
                })
                .subscribe()

            return () => {
                channel.unsubscribe();
            };

        }
    }, [roomId, userId, supabase]);

    useEffect(() => {
        if (amIPlayer) { // Only run if amIPlayer is set
            // Actualiza 'myTurn' cuando 'isNext' o 'amIPlayer' cambian
            setMyTurn((amIPlayer === 'X' && isNext) || (amIPlayer === 'O' && !isNext));
        }
    }, [isNext, amIPlayer]);


    // Manejar clics en el tablero
    const handleClick = async (index: number) => {
        //Verificar que haya sala y que el index tenga el valor nulo que no hay nadie usandolo
        if (!roomId || board[index] || winner) return;
        //Verificar que sea el turno del jugador correcto, preguntando si AmlPlayer ===  y de que isNext sea el mismo
        if (!myTurn) return;


        const newBoard = board.slice();
        newBoard[index] = isNext ? 'X' : 'O';
        const newWinner = calculateWinner(newBoard);
        const newIsDraw = !newWinner && newBoard.every(cell => cell !== null);

        try {
            const { error } = await supabase
                .from('tictactoe_boards')
                .upsert([
                    {
                        room_id: roomId,
                        board_state: newBoard,
                        is_next: !isNext,
                        winner: newWinner,
                        is_draw: newIsDraw,
                        updated_at: new Date().toISOString()
                    }
                ], { onConflict: 'room_id' });


            if (error) {
                console.error("Error al actualizar el tablero en Supabase:", error);
                return; // Very important to stop here if there's an error
            }
        } catch (err) {
            console.error("Error al actualizar el tablero:", err);
             return; // Very important to stop here if there's an error
        }

          // Optimistic Update: Update the local board immediately
          setBoard(newBoard);
          setIsNext(!isNext);
    };


    // Función para reiniciar el juego
    const resetGame = async () => {
        if (!roomId) return;

        try {
            const { error } = await supabase
                .from('tictactoe_boards')
                .upsert([
                    {
                        room_id: roomId,
                        board_state: Array(9).fill(null),
                        is_next: true,
                        winner: null,
                        is_draw: false,
                        updated_at: new Date().toISOString()
                    }
                ], { onConflict: 'room_id' });

            if (error) {
                console.error("Error al resetear el tablero en Supabase:", error);
            } else {
                // Limpiar el estado local
                setBoard(Array(9).fill(null));
                setIsNext(true);
                setWinner(null);
                setIsDraw(false);
            }
        } catch (err) {
            console.error("Error al resetear el tablero:", err);
        }
    };

    return (
        
        <div>
           
            {winner && (
                <Confetti
                    width={width}
                    height={height}
                    style={{ zIndex: -1 }}
                />
            )}

            {roomId && <RealtimeCursors roomName={roomId} username={userId} />}

            <div className="flex flex-col items-center space-y-4 p-4">
                <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold">Tic Tac Toe</h1>
                    <GiTicTacToe className="text-3xl" />
                </div>

                {isLoading && !roomId ? (
                    <p>Esperando jugadores...</p>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {board.map((value, index) => (
                            <button
                                key={index}
                                className="w-16 h-16 text-xl font-semibold border-2 border-gray-700 rounded-md flex items-center justify-center bg-white hover:bg-gray-200 focus:outline-none"
                                onClick={() => handleClick(index)}
                                disabled={!myTurn || value !== null || winner !== null} //desactivar si no es mi turno o si esta usado o si gano alguien
                            >
                                {value === 'X' ? <FaTimes className="text-red-500 text-3xl" /> :
                                    value === 'O' ? <FaRegCircle className="text-blue-500 text-3xl" /> : null}
                            </button>
                        ))}
                    </div>
                )}

                <div className="text-xl">
                    {winner
                        ? <p className="text-green-500">Gana {winner}</p>
                        : isDraw
                            ? <p className="text-yellow-500">Empate</p>
                            : <p className={isNext ? 'text-red-500' : 'text-blue-500'}>Turno de {isNext ? 'X' : 'O'}</p>
                    }
                    {amIPlayer && <p>Soy {amIPlayer}</p>}
                    <p>Es mi turno: {myTurn ? 'Sí' : 'No'}</p>
                </div>

                <button
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    onClick={resetGame}
                >
                    Reiniciar partida
                </button>

                {roomId && (
                    <p className="text-sm text-gray-500">ID de la sala: {roomId}</p>
                )}
                 <h1 className="text-red-500 strong">¡Los juegos multijugador están en contrucción, podrían presentar errores de funcionamiento!</h1>
            </div>
        </div>
    );
}