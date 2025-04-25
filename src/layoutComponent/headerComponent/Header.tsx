'use client';
import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaSearch, FaUserCircle } from "react-icons/fa";
import { GrGamepad } from "react-icons/gr";
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import styles from './Header.module.css'; // Import CSS Modules

interface UserData {
  email: string;
  username?: string;
}

// Function to subscribe to localStorage changes
function subscribe(callback: () => void) {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }
  return () => { };
}

// Function to get the current value from localStorage
function getSnapshot(): string | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData).email : null;
  }
  return null;
}

// Function for server-side rendering
function getServerSnapshot(): string | null {
  return null;
}

const Header: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // useSyncExternalStore with server snapshot support
  const storedEmail = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const loadUserData = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            setUser({
              email: parsedData.email,
              username: parsedData.username || parsedData.email.split('@')[0]
            });
          } catch (error) {
            console.error("Error parsing user data:", error);
            localStorage.removeItem('userData');
          }
        }
      }
    };

    loadUserData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'userData') {
        loadUserData();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storedEmail]);

  const handleHomeClick = () => {
    router.push('/');
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userData');
    }

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    router.push('/login');
    router.refresh();
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

        <div className={`${styles['mobile-menu']} ${isMenuOpen ? styles.open : ''} lg:hidden`}>
          <ul className="py-2 text-sm text-gray-200">
            <li>
              <Link href="/juegos/tictactoe" className="block px-4 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                Tic Tac Toe
              </Link>
            </li>
            <li>
              <Link href="/juegos/words" className="block px-4 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                Words
              </Link>
            </li>

            <li>
              <Link href="/chat" className="block px-4 py-2 hover:bg-gray-600 hover:text-white" onClick={closeMenu}>
                Chat
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden lg:flex space-x-4">
          <Link href="/juegos/tictactoe" className="text-white hover:text-gray-400">Tic Tac Toe</Link>
          <Link href="/juegos/words" className="text-white hover:text-gray-400">Words</Link>
          <Link href="/chat" className="text-white hover:text-gray-400">Chat</Link>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <input
          type="text"
          placeholder="¿A qué jugamos hoy?"
          className="bg-gray-700 text-gray-400 text-sm px-4 py-2 rounded-full w-64 focus:outline-none"
          aria-label="Buscar juegos"
        />
        <FaSearch
          className="absolute right-3 top-2 text-gray-400 text-sm"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <small className="text-gray-400">
              ¡Hola, {user.username || user.email.split('@')[0]}!
            </small>
            <FaUserCircle className="text-gray-400 text-3xl" />
            <button
              className="text-red-400 font-bold underline cursor-pointer"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <div
            className="flex items-center space-x-2 cursor-pointer hover:text-gray-300"
            onClick={handleLoginClick}
            aria-label="Iniciar sesión"
          >
            <small className="text-gray-400">Entrar</small>
            <FaUserCircle className="text-gray-400 text-3xl" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;