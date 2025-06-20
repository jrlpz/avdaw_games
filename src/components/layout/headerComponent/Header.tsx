'use client';

import React, { useState, useRef } from 'react';
import { FaBars, FaSearch, FaUserCircle, FaTimes } from "react-icons/fa"; // Importa FaTimes
import { GrGamepad } from "react-icons/gr";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';
import { logoutAction } from './action';
import { CurrentUserAvatar } from '@/components/current-user-avatar'

interface UserData {
  email: string;
  username: string;
}

const Header = ({ userData }: { userData: UserData | null }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);


  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleRegistroClick = () => {
    router.push('/registro');
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error("Error en Logout:", error);
    }
  };
  const handlePerfil = () => {
    router.push('/perfil');
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[var(--color-header)] px-6 py-3 flex items-center justify-between flex-wrap">
      <div className="flex items-center gap-4">

        <button
          onClick={handleHomeClick}
          aria-label="Inicio"
        >
          <GrGamepad className="text-[var(--color-mando)] text-2xl cursor-pointer" />

        </button>

        <FaBars
          className="text-white text-xl cursor-pointer lg:hidden"
          aria-label="Menú"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />

        {/* Menú móvil */}
        <div className={`${styles['mobile-menu']} ${isMenuOpen ? styles.open : ''} lg:hidden`}>
          <div className="relative py-2 text-sm text-gray-200"> {/* Agregado relative */}
            <button className="absolute top-2 right-2 text-white cursor-pointer" onClick={closeMenu} aria-label="Cerrar menú">
              <FaTimes className="text-xl" />
            </button>
            <h3 className="px-4 py-2 font-bold text-white">Un Jugador</h3>
            <ul>
              <li>
                <Link href="/juegos/tictactoe" className="block px-6 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                  Tic Tac Toe
                </Link>
              </li>
              <li>
                <Link href="/juegos/words" className="block px-6 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                  Words
                </Link>
              </li>
            </ul>

            <h3 className="px-4 py-2 font-bold text-white mt-2">Multijugador</h3>
            <ul>
              <li>
                <Link href="/juegos/multiplayer/tictactoe" className="block px-6 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                  Tic Tac Toe (Online)
                </Link>
              </li>

              <li>
                <Link href="/juegos/local/tictactoe_local" className="block px-6 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                  Tic Tac Toe (Local)
                </Link>
              </li>
            </ul>
            <h3 className="px-4 py-2 font-bold text-white mt-2">Social</h3>
            <ul>
              <li>
                <Link href="/chat" className="block px-4 py-2 hover:bg-gray-600 hover:text-white mt-2" onClick={closeMenu}>
                  Chat
                </Link>
                 <Link href="/ranking" className="block px-4 py-2 hover:bg-gray-600 hover:text-white mt-2" onClick={closeMenu}>
                  Estadísticas
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Menú desktop */}
        <div className="hidden lg:flex space-x-4">
          <div className="relative group">
            <button className="text-white hover:text-gray-400 flex items-center">
              Un Jugador
            </button>
            <div className="absolute hidden group-hover:block bg-gray-800 min-w-[200px] rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link href="/juegos/tictactoe" className="block px-4 py-2 text-white hover:bg-gray-700">
                  Tic Tac Toe
                </Link>
                <Link href="/juegos/words" className="block px-4 py-2 text-white hover:bg-gray-700">
                  Words
                </Link>
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="text-white hover:text-gray-400 flex items-center">
              Multijugador
            </button>
            <div className="absolute hidden group-hover:block bg-gray-800 min-w-[200px] rounded-md shadow-lg z-10">
              <div className="py-1">
                <Link href="/juegos/multiplayer/tictactoe" className="block px-4 py-2 text-white hover:bg-gray-700">
                  Tic Tac Toe (Online)
                </Link>
                <Link href="/juegos/local/tictactoe_local" className="block px-4 py-2 text-white hover:bg-gray-700">
                  Tic Tac Toe (Local)
                </Link>
              </div>
            </div>
          </div>

          <Link href="/chat" className="text-white hover:text-gray-400">Chat</Link>
                <Link href="/ranking" className="text-white hover:text-gray-400">Estadísticas</Link>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {userData ? (

<>
  <div className="relative group inline-block cursor-pointer">
    {/* Contenedor principal con nombre y avatar */}
    <div className="flex items-center gap-2 px-2 py-2 cursor-pointer relative">
      <small className="text-[var(--color-mando)]">¡Hola, {userData.username}!</small>
      <button
        className="flex items-center cursor-pointer relative"
        onClick={handlePerfil}
      >
        <div className="text-gray-400">
          <CurrentUserAvatar key={Date.now()}/>
        </div>

        {/* Tooltip a la izquierda del avatar */}
        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10">
          Ir a perfil
        </span>
      </button>
    </div>

    {/* Menú desplegable de cerrar sesión */}
    <div className="absolute hidden group-hover:block bg-gray-800 right-0 min-w-[150px] rounded-md shadow-lg z-20 p-2">
      <button
        className="w-full text-center text-[var(--color-mando)] font-bold px-2 py-1 hover:bg-gray-700 rounded text-sm"
        onClick={handleLogout}
        aria-label="Cerrar sesión"
      >
        Cerrar sesión
      </button>
    </div>
  </div>

  {/* Botón visible solo en pantallas pequeñas */}
  <small className="block md:hidden">
    <button
      className="text-[var(--color-mando)] font-bold underline cursor-pointer"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
  </small>
</>

        ) : (

          isLoginPage ? (

            <div
              className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white"
              onClick={handleRegistroClick}
              aria-label="Registrarse"
            >
              <small>Registrarse</small>
              <FaUserCircle className="text-3xl" />
            </div>
          ) : (
            <div
              className="flex items-center space-x-2 cursor-pointer text-gray-400 hover:text-white"
              onClick={handleLoginClick}
              aria-label="Iniciar sesión"
            >
              <small>Entrar</small>
              <FaUserCircle className="text-3xl" />
            </div>
          )
        )}
      </div>
    </header>
  );
};

export default Header;