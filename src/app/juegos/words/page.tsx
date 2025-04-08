'use client';
import React, { useState, useEffect } from 'react';
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import { GiAbstract050 } from "react-icons/gi";

const WORDS = ['ARROZ', 'TARTA', 'QUESO', 'MANGO', 'PASTA', 'FRESA', 'LECHE'];
type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface Tile {
    letter: string;
    state: LetterState;
}

const WordleGame = () => {
    const [winner, setWinner] = useState(false);
    const [targetWord, setTargetWord] = useState('');
    const [currentGuess, setCurrentGuess] = useState('');
    const [guesses, setGuesses] = useState<Tile[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(6);
    const { width, height } = useWindowSize();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(width < 640);
    }, [width]);

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
        setCurrentGuess('');
        setGuesses([]);
        setGameOver(false);
        setMessage('');
        setWinner(false);
        setAttemptsRemaining(6);
    };

    const handleInput = (e: React.KeyboardEvent) => {
        if (gameOver) return;

        if (e.key === 'Enter') {
            submitGuess();
        } else if (e.key === 'Backspace') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < 5) {
            setCurrentGuess(prev => (prev + e.key.toUpperCase()).slice(0, 5));
        }
    };

    const submitGuess = () => {
        if (currentGuess.length !== 5) {
            setMessage('La palabra debe tener 5 letras');
            return;
        }

        const newGuess: Tile[] = Array(5).fill(null).map((_, i) => {
            const letter = currentGuess[i];
            let state: LetterState = 'absent';

            if (targetWord[i] === letter) {
                state = 'correct';
            } else if (targetWord.includes(letter)) {
                state = 'present';
            }

            return { letter, state };
        });

        setGuesses(prev => [...prev, newGuess]);

        if (!WORDS.includes(currentGuess)) {
            setMessage('Palabra no válida');
            setAttemptsRemaining(prev => prev - 1);
        } else {
            if (currentGuess === targetWord) {
                setMessage(`¡Has acertado! La palabra era ${targetWord}`);
                setGameOver(true);
                setWinner(true);
            } else if (guesses.length >= 5) {
                setMessage(`Perdiste. La palabra era ${targetWord}`);
                setGameOver(true);
            } else {
                setMessage('');
            }
        }

        setCurrentGuess('');
        if (attemptsRemaining <= 1) {
            setMessage(`Perdiste. La palabra era ${targetWord}`);
            setGameOver(true);
        }
    };

    const getTileColor = (state: LetterState) => {
        switch (state) {
            case 'correct': return 'bg-green-500 text-white';
            case 'present': return 'bg-yellow-500 text-white';
            case 'absent': return 'bg-gray-500 text-white';
            default: return 'bg-white border-gray-300';
        }
    };

    const renderTile = (tile: Tile | null, index: number, rowIndex: number) => {
        const isCurrentRow = rowIndex === guesses.length;
        const letter = tile?.letter || (isCurrentRow && currentGuess[index] ? currentGuess[index] : '');
        const state = tile?.state || 'empty';
        const colorClass = getTileColor(state);
        const hasLetter = letter && !tile;

        return (
            <div
                key={index}
                className={`aspect-square flex items-center justify-center font-bold border-2
                ${colorClass} ${hasLetter ? 'border-gray-500' : 'border-gray-300'}
                ${hasLetter ? 'animate-pulse' : ''}
                ${isMobile ? 'text-xl' : 'text-2xl'}`}
                style={{
                    width: isMobile ? 'calc(min(18vw, 50px))' : 'calc(min(10vw, 50px))',
                    height: isMobile ? 'calc(min(18vw, 50px))' : 'calc(min(10vw, 50px))'
                }}
            >
                {letter}
            </div>
        );
    };

    const renderKeyboard = () => {
        const rows = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
        ];

        const keyState: Record<string, LetterState> = {};
        guesses.forEach(guess => {
            guess.forEach(tile => {
                if (!keyState[tile.letter] || tile.state === 'correct') {
                    keyState[tile.letter] = tile.state;
                }
            });
        });

        return (
            <div className="w-full max-w-md px-2">
                <div className="mt-4 sm:mt-8 space-y-1 sm:space-y-2">
                    {winner && (
                        <Confetti
                            width={width}
                            height={height}
                            style={{ zIndex: -1 }}
                            recycle={false}
                        />
                    )}
                    {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center space-x-1">
                            {row.map(key => {
                                const state = key.length === 1 ? keyState[key] : undefined;
                                const colorClass = state ? getTileColor(state) : 'bg-gray-200';
                                const isLarge = key.length > 1;

                   return (
    <button
        key={key}
        className={`${colorClass} 
            ${isLarge
                ? isMobile ? 'px-3 py-3 text-base' : 'px-5 py-3 text-lg'
                : isMobile ? 'px-3 py-3 text-sm' : 'px-4 py-2 text-lg'
            } rounded font-bold hover:brightness-110 active:scale-95 transition-all 
            ${isMobile ? 'text-lg' : 'text-xl'}
            ${key === 'Enter' && isMobile
                ? 'px-5 py-4 text-2xl  bg-green-500 hover:bg-green-600 text-white'  // Verde
                : ''
            }`}
        onClick={() => handleVirtualKeyPress(key)}
    >
        {isMobile && key === 'Enter' ? '↵' : key}
    </button>
);
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleVirtualKeyPress = (key: string) => {
        if (key === 'Enter' || key === '↵') {
            submitGuess();
        } else if (key === '⌫') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (/^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => (prev + key).slice(0, 5));
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center pt-2 sm:pt-4 px-2"
            tabIndex={0}
            onKeyDown={handleInput}
            autoFocus
        >
            <div className="flex items-center space-x-2 m-2 sm:m-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Words</h1>
                <GiAbstract050 className="text-2xl sm:text-3xl" />
            </div>
            
            {message && (
                <div className={`text-center text-sm sm:text-lg font-semibold mb-2 ${
                    gameOver && !winner ? 'text-red-600' : 
                    currentGuess === targetWord ? 'text-green-600 animate-bounce' : 'text-gray-700'
                }`}>
                    {message}
                </div>
            )}
            
            {gameOver && (
                <button
                    className="m-2 sm:m-3 px-4 sm:px-6 py-1 sm:py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    onClick={startNewGame}
                >
                    Jugar de nuevo
                </button>
            )}
            
            <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
                {Array(6).fill(null).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-1 sm:space-x-2">
                        {Array(5).fill(null).map((_, colIndex) => {
                            const guessRow = guesses[rowIndex];
                            return renderTile(guessRow ? guessRow[colIndex] : null, colIndex, rowIndex);
                        })}
                    </div>
                ))}
            </div>

            {renderKeyboard()}
            
            <div className="mt-2 sm:mt-4 text-center">
                <small className="text-sm sm:text-sm block text-orange-600">Pista: comida. {targetWord.charAt(0)} _ _ _ _</small>
                <small className="text-sm sm:text-sm  text-orange-600">Intentos restantes: {attemptsRemaining}</small>
            </div>
        </div>
    );
};

export default WordleGame;