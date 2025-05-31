// rankingclient.tsx (client component)
"use client";
import React, { useState, useEffect } from 'react';
import { IoPersonAdd } from "react-icons/io5";
import { PiRankingDuotone } from "react-icons/pi";
import { FaRankingStar, FaMedal } from "react-icons/fa6";
import { TbSortAscending, TbSortDescending } from "react-icons/tb";
import Image from 'next/image';
import { agregarAmigo, obtenerAmigos, quitarAmigo } from './actions';

interface UserStats {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  favorito: string | null;
  victorias: number;
  empates: number;
  derrotas: number;
  win_rate: number;
  ranking_score: number;
}

interface RankingClientProps {
  rankingData: UserStats[];
  currentUser: string;
  currentUserId: string;
}

export default function RankingClient({ rankingData, currentUser, currentUserId }: RankingClientProps) {
  const [orden, setOrden] = useState<'ascendente' | 'descendente'>('descendente');
  const [sortedRanking, setSortedRanking] = useState<UserStats[]>([]);
  const [amigos, setAmigos] = useState<Array<{ id: string, username: string }>>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const cargarAmigos = async () => {
      try {
        const listaAmigos = await obtenerAmigos(currentUserId);
        setAmigos(listaAmigos);
      } catch (error) {
        console.error('Error al cargar amigos:', error);
      }
    };
    cargarAmigos();
  }, [currentUserId]);

  useEffect(() => {
    const sorted = [...rankingData].sort((a, b) => b.ranking_score - a.ranking_score);
    setSortedRanking(sorted);
  }, [rankingData]);

  const toggleOrden = () => {
    const newOrder = orden === 'ascendente' ? 'descendente' : 'ascendente';
    setOrden(newOrder);

    setSortedRanking(prev => [...prev].sort((a, b) => {
      return newOrder === 'descendente'
        ? b.ranking_score - a.ranking_score
        : a.ranking_score - b.ranking_score;
    }));
  };

  const getMedalColor = (position: number, victories: number, order: string) => {
    if (position === 1) {
      if (order === 'descendente') {
        return victories >= 2 ? 'text-yellow-500' : 'text-red-500';
      } else {
        return 'text-red-500';
      }
    }
    if (position === 2 && orden === 'descendente') return 'text-zinc-500';
    if (position === 3 && orden === 'descendente') return 'text-orange-800';
    return '';
  };



  const handleAgregarAmigo = async (amigoId: string, amigoUsername: string) => {
    try {
      setLoading(prev => ({ ...prev, [amigoId]: true }));

      const result = await agregarAmigo(currentUserId, amigoId, amigoUsername);

      if (result.success) {
        setAmigos(prev => [...prev, { id: amigoId, username: amigoUsername }]);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error al agregar amigo:', error);
      alert('Error al agregar amigo');
    } finally {
      setLoading(prev => ({ ...prev, [amigoId]: false }));
    }
  };

  const esAmigo = (userId: string) => {
    return amigos.some(a => a.id === userId);
  };

  const handleQuitarAmigo = async (amigoId: string) => {
    try {
      setLoading(prev => ({ ...prev, [amigoId]: true }));

      const result = await quitarAmigo(currentUserId, amigoId);

      if (result.success) {
        setAmigos(prev => prev.filter(a => a.id !== amigoId));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error al quitar amigo:', error);
      alert('Error al quitar amigo');
    } finally {
      setLoading(prev => ({ ...prev, [amigoId]: false }));
    }
  };
  return (
    <div className="min-h-screen bg-white p-4">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-2 mb-8 mt-6">
          <Image
            src="/images/logo_oscuro.png"
            width={120}
            height={120}
            alt="Logo"
            priority
            className="dark:invert"
          />
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">Estadísticas</h2>
            <FaRankingStar className="text-yellow-500 text-xl" />
          </div>
        </div>

        {/* Contenedor principal */}
        <div className="bg-gray-100 dark:bg-navy-900 rounded-2xl shadow-lg overflow-hidden">
          {/* Cabecera de ranking */}
          <div className="p-4 border-b border-gray-200 dark:border-navy-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-navy-700 dark:text-white">Top jugadores TicTacToe</h3>
                <PiRankingDuotone className="text-blue-500 text-xl" />
              </div>

              <button
                onClick={toggleOrden}
                className="flex items-center gap-1 px-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-navy-700 hover:bg-gray-200 dark:hover:bg-navy-600 transition-colors"
              >
                {orden === 'ascendente' ? (
                  <>
                    <TbSortAscending className="text-lg" />
                    <span>Ascendente</span>
                  </>
                ) : (
                  <>
                    <TbSortDescending className="text-lg" />
                    <span>Descendente</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lista de jugadores */}
          <div className="divide-y divide-gray-200 dark:divide-navy-700">
            {sortedRanking.map((user, index) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors ${user.username === currentUser ? 'bg-blue-100 dark:bg-navy-800' : ''
                  }`}
              >
                {/* Posición (1 columna) */}
                <div className="col-span-1 font-bold text-center">
                  {index + 1}º
                </div>

                {/* Avatar y Nombre (3 columnas) */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={user.avatar || '/images/user.png'}
                      alt={`Avatar de ${user.username}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium flex items-center gap-2 text-navy-700 dark:text-white truncate">
                      {user.username}
                      {(index + 1) <= 3 && (
                        orden === 'descendente' ? (
                          <FaMedal className={`text-xl ${getMedalColor(index + 1, user.victorias, orden)}`} />
                        ) : (
                          index === 0 && <FaMedal className="text-xl text-red-500" />
                        )
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.favorito && `Juego favorito: ${user.favorito}`}
                    </p>
                  </div>
                </div>

                {/* Estadísticas (6 columnas - 1 para cada métrica) */}
                <div className="col-span-6 grid grid-cols-5 gap-2 text-center">
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {user.victorias}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Victorias</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {user.empates}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Empates</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {user.derrotas}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Derrotas</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {typeof user.win_rate === 'number' ? user.win_rate.toFixed(0) : user.win_rate}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Win Rate</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {typeof user.ranking_score === 'number' ? user.ranking_score.toFixed(2) : user.ranking_score}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">Puntuación</p>
                  </div>
                </div>

                {/* Botón (2 columnas) */}
                <div className="col-span-2 flex justify-end">
                  {user.id === currentUserId ? (
                    <span className="px-4 py-2 cursor-not-allowed text-gray-500">Tú</span>
                  )
                  
                  
                  : esAmigo(user.id) ? (
                    <button
                      onClick={() => handleQuitarAmigo(user.id)}
                      disabled={loading[user.id]}
                      className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors min-w-[120px]"
                    >
                      {loading[user.id] ? 'Quitando...' : 'Quitar amigo'}
                    </button>
                  ) 
                  
                  
                  : (
                    <button
                      onClick={() => handleAgregarAmigo(user.id, user.username)}
                      disabled={loading[user.id]}
                      className="flex items-center justify-center gap-2 cursor-pointer px-4 py-2 text-sm font-medium rounded-lg bg-blue-100 dark:bg-navy-600 text-blue-600 dark:text-white hover:bg-blue-200 dark:hover:bg-navy-500 transition-colors min-w-[120px]"
                    >
                      {loading[user.id] ? 'Agregando...' : (
                        <>
                          <span>Agregar</span>
                          <IoPersonAdd className="flex-shrink-0" />
                        </>
                      )}
                    </button>
                  )}
                </div>


              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}