'use client'
import { useState } from "react";
import { useWindowSize } from 'react-use';

import { FaTimes, FaRegCircle } from "react-icons/fa";
import { GiTicTacToe } from "react-icons/gi";



import Confetti from 'react-confetti'
export default function TicTacToe() {


    const [board, setBoard] = useState<Array<string | null>>(Array(9).fill(null));
    const [isNext, setIsNext] = useState(true);
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

    const winner = calculateWinner(board);
    const { width, height } = useWindowSize();  
    const isBoardFull = board.every(cell => cell !== null);
    const isDraw = !winner && isBoardFull;
    const handleClick = (index: number) => {
        if (board[index] || winner) return;
        const newBoard = board.slice();
        newBoard[index] = isNext ? 'X' : 'O';
        setBoard(newBoard);
        setIsNext(!isNext);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsNext(true);
    };

    return (

        <div> 
            {
            winner && (
            <Confetti
                width={width}
                height={height}
                style={{zIndex:-1}}
                
            />)
            }

            <div className="flex flex-col items-center space-y-4 p-4">
                <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-bold">Tic Tac Toe</h1>
                    <GiTicTacToe className="text-3xl" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {board.map((value, index) => (
                        <button
                            key={index}
                            className="w-24 h-24 text-xl font-semibold border-2 border-gray-700 rounded-md flex items-center justify-center bg-white hover:bg-gray-200 focus:outline-none"
                            onClick={() => handleClick(index)}
                        >
                            {value === 'X' ? <FaTimes className="text-red-500 text-3xl" /> :
                             value === 'O' ? <FaRegCircle className="text-blue-500 text-3xl" /> : null}
                        </button>
                    ))}
                </div>
                <div className="text-xl">
                    {winner
                        ? <p className="text-green-500">Gana {winner}</p>
                        : isDraw
                            ? <p className="text-yellow-500">Empate</p>
                            : <p className={isNext ?  'text-red-500' :'text-blue-500'}>Turno {isNext ? 'X' : 'O'}</p>
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