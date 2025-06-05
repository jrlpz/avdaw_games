'use client'
import { useState, useEffect } from "react";
import { useWindowSize } from 'react-use';

import { FaTimes, FaRegCircle } from "react-icons/fa";
import { GiTicTacToe } from "react-icons/gi";

import Confetti from 'react-confetti'

const HUMAN_PLAYER = 'X';
const AI_PLAYER = 'O';

export default function TicTacToe() {

    const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));

    const getRandomBoolean = () => Math.random() < 0.5;
    const [isNext, setIsNext] = useState<null | boolean>(null); 
    
  
    const calculateWinner = (squares: Array<string | null>): string | null => { 
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], 
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6]           
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a]; 
            }
        }
        return null; 
    };

    const winner = calculateWinner(board);
    const { width, height } = useWindowSize();


    const isBoardFull = board.every(cell => cell !== null);
    const isDraw = !winner && isBoardFull;

    // --- Lógica de la IA ---

    // Encuentra el mejor movimiento para la IA
    const findBestMove = (currentBoard: Array<string | null>): number => {
      
        // 1. Comprueba si puede ganar
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = currentBoard.slice();
                tempBoard[i] = AI_PLAYER;
                if (calculateWinner(tempBoard) === AI_PLAYER) {
                    return i; // ¡Gana!
                }
            }
        }

        // 2. Comprueba si el jugador puede ganar y lo bloquea
        for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                const tempBoard = currentBoard.slice();
                tempBoard[i] = HUMAN_PLAYER;
                if (calculateWinner(tempBoard) === HUMAN_PLAYER) {
                    return i; // ¡Bloquea!
                }
            }
        }

        // 3. Toma el centro si está libre
        if (!currentBoard[4]) {
            return 4;
        }

        // 4. Toma una esquina libre
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (!currentBoard[corner]) {
                return corner;
            }
        }

        // 5. Toma un lado libre
        const sides = [1, 3, 5, 7];
        for (const side of sides) {
            if (!currentBoard[side]) {
                return side;
            }
        }

        // 6. Tomar la primera casilla vacía (por si falla algo en la lógica anterior)
         for (let i = 0; i < 9; i++) {
            if (!currentBoard[i]) {
                return i;
            }
        }

        return -1;
    };

    useEffect(() => {
        if (isNext === null) {
          setIsNext(Math.random() < 0.5);
        }
      }, [isNext]);

    useEffect(() => {
        
        // Si es el turno de la IA, no hay ganador y no es empate
        if (!isNext && !winner && !isDraw) {
            // Añade retraso para simular que la IA piensa
            const timer = setTimeout(() => {
                const bestMove = findBestMove(board);
                if (bestMove !== -1 && !board[bestMove]) {
                    const newBoard = board.slice();
                    newBoard[bestMove] = AI_PLAYER;
                    setBoard(newBoard);
                    setIsNext(true); 
                }
            }, 500); 
            return () => clearTimeout(timer);
        }
    }, [isNext, board, winner, isDraw]); 


    // --- Turno de jugador humano ---
    const handleClick = (index: number) => {
        if (!isNext || board[index] || winner || isDraw) {
            return;
        }

        const newBoard = board.slice();
        newBoard[index] = HUMAN_PLAYER;
        setBoard(newBoard);
        setIsNext(false);
    };

    // --- Reiniciar Juego asignado quien empieza de manera aleatoria---
    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsNext(null); 
      };

    if (isNext === null) {
        return <div className="text-center p-4 text-xl">Cargando...</div>;
      }

    return (
        <div>
            {winner && (
                <Confetti
                    width={width}
                    height={height}
                    recycle={false}
                    numberOfPieces={winner === HUMAN_PLAYER ? 200 : 50} 
                    style={{ zIndex: -1 }} 
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
                                className={`w-24 h-24 text-xl font-semibold border-2 border-gray-700 rounded-md flex items-center justify-center
                                        ${isNext && !value && !winner ? 'bg-white hover:bg-gray-200 cursor-pointer' : 'bg-gray-100 cursor-not-allowed'}
                                        focus:outline-none`}
                                onClick={() => handleClick(index)}
                                disabled={!isNext || !!value || !!winner || isDraw} 
                            >
                                {value === HUMAN_PLAYER ? <FaTimes className="text-red-500 text-3xl" /> :
                                    value === AI_PLAYER ? <FaRegCircle className="text-blue-500 text-3xl" /> : null}
                            </button>
                        ))}
                    </div>

                <div className="text-xl h-8"> 
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