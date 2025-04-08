import React from 'react';
import './HomePage.css'; // Importa el archivo CSS
import Image from 'next/image';
export default function HomePage() {
  const minijuegos = [
    {
      id: 'tictactoe',
      nombre: 'TicTacToe',
      descripcion: 'El clásico 3 en raya, juega con amigos',
      imagen: '/images/tictactoe.png', // Reemplaza con la URL de tu imagen
    },
    {
      id: 'words',
      nombre: 'Words',
      descripcion: '¿Serás capaz de adivinar la palabra?',
      imagen: '/images/words.png', // Reemplaza con la URL de tu imagen
    },
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



      <div className="minijuegos-container">
        {minijuegos.map((juego) => (
          <div className="minijuego-item" key={juego.id}>
            <a href={`juegos/${juego.id}`}>

            <Image
             src={juego.imagen}
             alt={juego.descripcion}
             width={300} // Adjust as needed
             height={200} // Adjust as needed

         />
              <h3>{juego.nombre}</h3>
              <p>{juego.descripcion}</p>
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}