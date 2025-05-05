'use client'
import { useState, useEffect } from "react"; // Import useEffect
import { useWindowSize } from 'react-use';

import { FaTimes, FaRegCircle } from "react-icons/fa";
import { GiTicTacToe } from "react-icons/gi";

import Confetti from 'react-confetti'

// --- Constantes ---
const HUMAN_PLAYER = 'X';
const AI_PLAYER = 'O';

export default function TicTacToe() {

    // Tablero
    const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));

    // Turno (true = Humano 'X', false = IA 'O')
    const [isNext, setIsNext] = useState(true); // Humano empieza

    // Ganador
    const calculateWinner = (squares: Array<string | null>): string | null => { // Added return type
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
            [0, 4, 8], [2, 4, 6]             // Diagonales
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a]; // Devuelve 'X' o 'O'
            }
        }
        return null; // No hay ganador
    };

    const winner = calculateWinner(board);
    const { width, height } = useWindowSize();

    // Verificar si el juego ha terminado en empate
    const isBoardFull = board.every(cell => cell !== null);
    const isDraw = !winner && isBoardFull;

    // --- Lógica de la IA ---

    // Encuentra el mejor movimiento para la IA ('O')
    const findBestMove = (currentBoard: Array<string | null>): number => {
        // 1. Comprobar si la IA puede ganar
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = currentBoard.slice();
                tempBoard[i] = AI_PLAYER;
                if (calculateWinner(tempBoard) === AI_PLAYER) {
                    return i; // ¡Gana!
                }
            }
        }

        // 2. Comprobar si el Humano puede ganar y bloquearlo
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = currentBoard.slice();
                tempBoard[i] = HUMAN_PLAYER;
                if (calculateWinner(tempBoard) === HUMAN_PLAYER) {
                    return i; // ¡Bloquea!
                }
            }
        }

        // 3. Tomar el centro si está libre
        if (!currentBoard[4]) {
            return 4;
        }

        // 4. Tomar una esquina libre
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (!currentBoard[corner]) {
                return corner;
            }
        }

        // 5. Tomar un lado libre
        const sides = [1, 3, 5, 7];
        for (const side of sides) {
            if (!currentBoard[side]) {
                return side;
            }
        }

        // 6. (Fallback) Tomar la primera casilla vacía (no debería ser necesario si la lógica anterior es completa)
         for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                return i;
            }
        }

        return -1; // No debería ocurrir en un juego normal
    };

    // --- Efecto para el turno de la IA ---
    useEffect(() => {
        // Si es el turno de la IA, no hay ganador y no es empate
        if (!isNext && !winner && !isDraw) {
            // Añade un pequeño retraso para simular el "pensamiento"
            const timer = setTimeout(() => {
                const bestMove = findBestMove(board);
                if (bestMove !== -1 && !board[bestMove]) { // Asegurarse de que la casilla esté realmente vacía
                    const newBoard = board.slice();
                    newBoard[bestMove] = AI_PLAYER;
                    setBoard(newBoard);
                    setIsNext(true); // Cambiar el turno de vuelta al humano
                }
            }, 500); // Retraso de 500ms

            // Limpiar el temporizador si el componente se desmonta o las dependencias cambian
            return () => clearTimeout(timer);
        }
    }, [isNext, board, winner, isDraw]); // Dependencias del efecto


    // --- Manejador de Clic del Humano ---
    const handleClick = (index: number) => {
        // Permitir clic solo si:
        // 1. Es el turno del humano (isNext === true)
        // 2. La casilla está vacía (board[index] === null)
        // 3. No hay ganador ni empate
        if (!isNext || board[index] || winner || isDraw) {
            return;
        }

        // Crea una copia del estado actual del tablero
        const newBoard = board.slice();

        // Asigna 'X' (Humano) en la posición clickeada
        newBoard[index] = HUMAN_PLAYER;

        // Actualiza el estado del tablero con el nuevo movimiento
        setBoard(newBoard);

        // Cambia el turno a la IA
        setIsNext(false);
    };

    // --- Reiniciar Juego ---
    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsNext(true); // Humano empieza siempre al reiniciar
    };

    // --- Renderizado ---
    return (
        <div>
            {winner && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false} // Para que se detenga después de un tiempo
                    numberOfPieces={winner === HUMAN_PLAYER ? 200 : 50} // Menos confeti si gana la IA ;)
                    style={{ zIndex: 10 }} // Asegúrate de que esté por encima de otros elementos si es necesario
                />)
            }

            <div className="flex flex-col items-center space-y-4 p-4">
                <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold">Tic Tac Toe (vs IA)</h1>
                    <GiTicTacToe className="text-3xl" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {board.map((value, index) => (
                        <button
                            key={index}
                            className={`w-16 h-16 text-xl font-semibold border-2 border-gray-700 rounded-md flex items-center justify-center
                                       ${isNext && !value && !winner ? 'bg-white hover:bg-gray-200 cursor-pointer' : 'bg-gray-100 cursor-not-allowed'}
                                       focus:outline-none`}
                            onClick={() => handleClick(index)}
                            disabled={!isNext || !!value || !!winner || isDraw} // Deshabilitar si no es turno del humano, está ocupada o el juego terminó
                        >
                            {value === HUMAN_PLAYER ? <FaTimes className="text-red-500 text-3xl" /> :
                                value === AI_PLAYER ? <FaRegCircle className="text-blue-500 text-3xl" /> : null}
                        </button>
                    ))}
                </div>

                <div className="text-xl h-8"> {/* Añadido h-8 para evitar saltos de layout */}
                    {winner
                        ? <p className={winner === HUMAN_PLAYER ? "text-green-500" : "text-red-600"}>
                            {winner === HUMAN_PLAYER ? '¡Ganaste!' : 'Gana la IA (' + winner + ')'}
                          </p>
                        : isDraw
                            ? <p className="text-yellow-500">Empate</p>
                            : <p className={isNext ? 'text-red-500' : 'text-blue-500'}>
                                {isNext ? 'Tu Turno (X)' : 'Pensando IA (O)...'}
                              </p>
                    }
                </div>

                <button
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none"
                    onClick={resetGame}
                >
                    Reiniciar partida
                </button>
            </div>
        </div>
    );
}