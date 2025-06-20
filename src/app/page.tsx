import React from 'react';
import './HomePage.css';
import Image from 'next/image';
import Link from 'next/link';
import { VscTriangleDown } from "react-icons/vsc";
import {getGamesFromDatabase} from '@/app/actions';

export default async function HomePage() {
  const { singlePlayer, multiPlayer } = await getGamesFromDatabase();
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
        {singlePlayer.map((juego) => (
  <div className="minijuego-item" key={`single-${juego.id}`}>
    <Link href={`/juegos/${juego.game_id}`}>
      <div className="minijuego-content">
        <Image
          src={juego.imagen}
          alt={juego.descripcion}
          width={300}
          height={200}
       
          className="minijuego-image" 
        />
        <div className="minijuego-text">
          <h3>{juego.nombre}</h3>
          <p>{juego.descripcion}</p>
          <span className="minijuego-arrow"><VscTriangleDown/></span>
        </div>
      </div>
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
          {multiPlayer.map((juego) => (

            <div className="minijuego-item" key={`multi-${juego.id}`}>
              <Link href={`${juego.pathPrefix}/${juego.game_id}`}>
              <div className="minijuego-content"> 
                <Image
                  src={juego.imagen}
                  alt={juego.descripcion}
                  width={300}
                  height={200}
          className="minijuego-image" 
                />
               <div className="minijuego-text">
          <h3>{juego.nombre}</h3>
          <p>{juego.descripcion}</p>
          <span className="minijuego-arrow"><VscTriangleDown/></span>
        </div>
        </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}