'use client';

import React, { useState, useRef } from 'react';
import { FaBars, FaSearch, FaUserCircle } from "react-icons/fa";
import { GrGamepad } from "react-icons/gr";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './Header.module.css';
 import { logoutAction } from './action'; 

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
    router.push('/login');
  };

  const handleLogout = async () => {
    try {
       await logoutAction();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
          <div className="py-2 text-sm text-gray-200">
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
                  Tic Tac Toe (2J)
                </Link>
              </li>
            </ul>
            
            <li>
              <Link href="/chat" className="block px-4 py-2 hover:bg-gray-600 hover:text-white mt-2" onClick={closeMenu}>
                Chat
              </Link>
            </li>
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
                  Tic Tac Toe (2J)
                </Link>
             
              </div>
            </div>
          </div>
          
          <Link href="/chat" className="text-white hover:text-gray-400">Chat</Link>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="¿A qué jugamos hoy?"
            className="bg-gray-700 text-gray-400 text-sm px-4 py-2 rounded-full w-64 focus:outline-none"
            aria-label="Buscar juegos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="absolute right-3 top-2">
            <FaSearch
              className="text-gray-400 text-sm"
              aria-hidden="true"
            />
          </button>
        </form>
      </div>

      <div className="flex items-center space-x-2">
        {userData ? (
        
          <>
            <small className="text-gray-400">
              ¡Hola, { userData.email}! 
            </small>
            <small>
            <button
              className="text-[var(--color-mando)] font-bold underline cursor-pointer"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
            </small>
            <div className="relative group">
              <button className="flex items-center">
                 <FaUserCircle className="text-gray-400 text-3xl cursor-pointer" />
              </button>
              <div className="absolute hidden group-hover:block bg-gray-800 right-0 mt-1 min-w-[150px] rounded-md shadow-lg z-20 p-2">
                 {userData.email && <p className="text-xs text-gray-400 px-2 pb-2 truncate">{userData.email}</p>}
                 <button
                   className="w-full text-left text-[var(--color-mando)] font-bold px-2 py-1 hover:bg-gray-700 rounded text-sm"
                   onClick={handleLogout}
                   aria-label="Cerrar sesión"
                 >
                   Cerrar sesión
                 </button>
              </div>
            </div>
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
            // Si NO estamos en /login, muestra "Entrar"
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