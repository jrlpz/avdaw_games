import React from 'react';
import './HomePage.css';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const minijuegosSinglePlayer = [
    {
      id: 'tictactoe',
      nombre: 'TicTacToe',
      descripcion: 'El clásico 3 en raya contra la máquina',
      imagen: '/images/tictactoe.png',
      modo: 'single'
    },
    {
      id: 'words',
      nombre: 'Words',
      descripcion: 'Adivina la palabra en modo individual',
      imagen: '/images/words.png',
      modo: 'single'
    },
  ];

  const minijuegosMultiPlayer = [
    {
      id: 'tictactoe',
      nombre: 'TicTacToe (2J)',
      descripcion: 'El clásico 3 en raya, juega con amigos',
      imagen: '/images/tictactoe.png', // Puedes usar una imagen diferente
      modo: 'multi'
    },
    // {
    //   id: 'words',
    //   nombre: 'Words (2J)',
    //   descripcion: '¿Serás capaz de adivinar la palabra contra otros?',
    //   imagen: '/images/words.png', // Puedes usar una imagen diferente
    //   modo: 'multi'
    // },
  ];

  return (
    <div className="home-page">
      <div className="text-center mb-12 mt-10">
        <div className="flex flex-col items-center gap-6 justify-center">
          <Image
            src="/images/logo_oscuro.png"
            width={150}
            height={150}
            alt="Logo"
            priority
          />
          <h4 className="text-slate-600 text-xl font-semibold">
            ¡Bienvenido a nuestra colección de minijuegos!
          </h4>
        </div>
      </div>

      {/* Sección Un Jugador */}
      <div className="mb-16">
        <h2 className="section-title text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Un Jugador
        </h2>
        <div className="minijuegos-container">
          {minijuegosSinglePlayer.map((juego) => (
            <div className="minijuego-item" key={`single-${juego.id}`}>
              <Link href={`/juegos/${juego.id}`}>
                <Image
                  src={juego.imagen}
                  alt={juego.descripcion}
                  width={300}
                  height={200}
                />
                <h3>{juego.nombre}</h3>
                <p>{juego.descripcion}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Multijugador */}
      <div className="mb-16">
        <h2 className="section-title text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
          Multijugador
        </h2>
        <div className="minijuegos-container">
          {minijuegosMultiPlayer.map((juego) => (
            <div className="minijuego-item" key={`multi-${juego.id}`}>
              <Link href={`/juegos/multiplayer/${juego.id}`}>
                <Image
                  src={juego.imagen}
                  alt={juego.descripcion}
                  width={300}
                  height={200}
                />
                <h3>{juego.nombre}</h3>
                <p>{juego.descripcion}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}