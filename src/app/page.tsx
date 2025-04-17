'use client'
import React from 'react';
import './HomePage.css';
import Image from 'next/image';
import { useTema } from '@/app/layout'; // Adjust path as needed

interface Minijuego {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
}

const HomePage: React.FC = () => { // No props needed anymore!
  const { tema } = useTema(); // Access tema from the context

  const minijuegos: Minijuego[] = [
    {
      id: 'tictactoe',
      nombre: 'TicTacToe',
      descripcion: 'El clásico 3 en raya, juega con amigos',
      imagen: '/images/tictactoe.png',
    },
    {
      id: 'words',
      nombre: 'Words',
      descripcion: '¿Serás capaz de adivinar la palabra?',
      imagen: '/images/words.png',
    },
  ];
  const logoSrc = tema === 'dark' ? '/images/logo_claro2.png' : '/images/logo_oscuro.png';
  return (
    <div className={`home-page ${tema === 'dark' ? 'tema-oscuro' : 'tema-claro'}`}>
      <div className="text-center mb-12 mt-10">
        <div className="flex flex-col items-center gap-6 justify-center">
          <Image
       
            src={logoSrc}
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

      <div className="minijuegos-container">
        {minijuegos.map((juego) => (
          <div className="minijuego-item" key={juego.id}>
            <a href={`juegos/${juego.id}`}>
              <Image
                src={juego.imagen}
                alt={juego.descripcion}
                width={300}
                height={200}
              />
              <h3>{juego.nombre}</h3>
              <p>{juego.descripcion}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;