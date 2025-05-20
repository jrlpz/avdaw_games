// app/chat/ChatClient.tsx
"use client";

import React, { useState } from 'react';
import { AiOutlineClose } from "react-icons/ai";

interface UserData {
  username: string;
  email: string;
  created_at: string;
}

export default function ChatClient({ userData }: { userData: UserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    description: "Busco gente maja para jugar el tres en raya",
    favoriteGame: "",
    password: "",
    repassword: ""
  });

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Aquí iría la lógica para guardar los cambios en la base de datos
    console.log("Datos guardados:", formData);
  };

  return (
    <div className="flex h-full flex-col md:flex-row justify-center gap-3 p-2 md:p-4">

      {/* Columna izquierda - Perfil y Lista de Amigos */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
        {/* Tarjeta de Perfil */}
        <div className="rounded-2xl shadow-lg dark:bg-navy-800 mt-10 bg-white">
          <div className="relative flex flex-col items-center pt-16 pb-6 px-4">
            <img
              src='https://horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app/static/media/banner.ef572d78f29b0fee0a09.png'
              className="rounded-t-2xl absolute top-0 h-32 w-full object-cover"
              alt="Banner del usuario"
            />
            <div className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-pink-400 dark:border-navy-700">
              <img
                className="h-full w-full rounded-full object-cover"
                src='https://horizon-tailwind-react-git-tailwind-components-horizon-ui.vercel.app/static/media/avatar11.1060b63041fdffa5f8ef.png'
                alt="Avatar"
              />
            </div>

            <div className="text-center z-0">
              <h4 className="text-xl font-bold">
                {userData.username}
              </h4>
              <p className="text-gray-800 font-bold">
                Miembro desde el <span>{formattedDate}</span>
              </p>
            </div>

            <div className='mt-6 text-center'>
              <p>{formData.description}</p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">17</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Victorias</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">9.7K</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Empates</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">434</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Derrotas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Lista de Amigos */}
        <div className="flex-1 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-navy-800 p-4">
          <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">Lista de amigos</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-3 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-navy-600"></div>
                  <div>
                    <p className="font-medium text-navy-700 dark:text-white">Amigo {item}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">En línea {item}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-right">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 cursor-pointer py-2 px-4 hover:bg-red-600 hover:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 group"
                  >
                    Eliminar
                    <AiOutlineClose
                      className="transition-transform duration-200 group-hover:scale-[1.5]"
                    />
                  </button>

                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            Añadir amigo
          </button>
        </div>

      </div>

      {/* Columna derecha - Formulario de perfil */}
    {/* Columna derecha - Formulario de perfil */}
<div className="w-full mt-10 md:w-[70%] lg:w-[60%] xl:w-[60%] rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-navy-800 p-4 md:p-6 relative">

  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-navy-700 dark:text-white">Datos de perfil</h2>
    {!isEditing ? (
      <button
        onClick={() => setIsEditing(true)}
        className="py-1 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        Editar
      </button>
    ) : null}
  </div>

  <form onSubmit={handleSubmit} className="space-y-4 pb-20">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
      <textarea
        name="description"
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        value={formData.description}
        onChange={handleInputChange}
        readOnly={!isEditing}
        disabled={!isEditing}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        value={userData.username}
        readOnly
        disabled={!isEditing}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
      <input
        type="email"
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        value={userData.email}
        readOnly
        disabled={!isEditing}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
      <input
        type="password"
        name="password"
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleInputChange}
        readOnly={!isEditing}
        disabled={!isEditing}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repetir Contraseña</label>
      <input
        type="password"
        name="repassword"
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        placeholder="••••••••"
        value={formData.repassword}
        onChange={handleInputChange}
        readOnly={!isEditing}
        disabled={!isEditing}
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Juego favorito</label>
      <select
        name="favoriteGame"
        className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
        value={formData.favoriteGame}
        onChange={handleInputChange}
        disabled={!isEditing}
      >
        <option value="">Selecciona un juego</option>
        <option value="tictactoe">TicTacToe</option>
        <option value="words">Words</option>
      </select>
    </div>

    {isEditing && (
      <div className="absolute bottom-6 left-0 right-0 flex gap-2 px-6">
        <button
          type="submit"
          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          Guardar cambios
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    )}
  </form>
</div>


    </div>
  );
}
