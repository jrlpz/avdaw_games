"use client";
import React, { useState, useEffect, useRef } from 'react';
import { AiOutlineClose } from "react-icons/ai";
import { guardarDatos, actualizarContraseña, uploadAvatar, deletePreviousAvatar, Friend, FriendDetails, obtenerDetallesAmigo } from './actions';
import { CurrentProfileAvatar } from '@/components/current-profile-avatar';
import Image from 'next/image';
import { ProfileFormSchema } from '@/app/auth/definitions';
import { obtenerAmigosConAvatares, quitarAmigo, buscarUsuarios, agregarAmigo } from './actions';
import { createClient } from '@/utils/supabase/client';

interface UserData {
  username: string;
  email: string;
  created_at: string;
  descripcion: string;
  avatar: string | null;
  favorito: string;
  victorias: number;
  empates: number;
  derrotas: number;
  currentUserId: string;
}

export default function PerfilClient({ userData: initialUserData }: { userData: UserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(initialUserData);

  const [formErrors, setFormErrors] = useState<{
    username?: string,
    descripcion?: string[];
    favorito?: string[];
    password?: string[];
    repassword?: string[];
    message?: string;
  }>({});

  const [formData, setFormData] = useState({
    username: initialUserData.username,
    descripcion: initialUserData.descripcion,
    favorito: initialUserData.favorito,
    password: "",
    repassword: ""
  });
 const supabase = createClient(); 
  const [amigos, setAmigos] = useState<Friend[]>([]);
  const [amigoAEliminar, setAmigoAEliminar] = useState<Friend | null>(null);
  const [amigoDetalles, setAmigoDetalles] = useState<FriendDetails | null>(null);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingAmigos, setLoadingAmigos] = useState<Record<string, boolean>>({});
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Friend[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [agregandoAmigo, setAgregandoAmigo] = useState<Record<string, boolean>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const dataChanged =
      formData.username !== initialUserData.username ||
      formData.descripcion !== initialUserData.descripcion ||
      formData.favorito !== initialUserData.favorito ||
      formData.password !== "" ||
      formData.repassword !== "";

    setIsDirty(dataChanged);
  }, [formData, initialUserData]);


 useEffect(() => {
    const cargarAmigos = async () => {
      const listaAmigos = await obtenerAmigosConAvatares(userData.currentUserId);
      setAmigos(listaAmigos);
    };

    cargarAmigos();

    // 2. Suscripción a cambios en tiempo real. Canal único por usuario.
    const channel = supabase
      .channel(`amigos_${userData.currentUserId}`) 
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${userData.currentUserId}`,
        },
        (payload) => {
          setAmigos(payload.new.amigos || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userData.currentUserId]);

  const handleQuitarAmigo = async (amigoId: string) => {
    try {
      setLoadingAmigos(prev => ({ ...prev, [amigoId]: true }));

      const result = await quitarAmigo(userData.currentUserId, amigoId);

      if (result.success) {
        setAmigos(prev => prev.filter(a => a.id !== amigoId));
        setSuccessMessage(result.message);
      } else {
        setFormErrors({ message: result.message });
      }
    } catch (error) {
      console.error('Error al quitar amigo:', error);
      setFormErrors({ message: 'Error al quitar amigo' });
    } finally {
      setLoadingAmigos(prev => ({ ...prev, [amigoId]: false }));
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof typeof formErrors];
        return newErrors;
      });
    }
  };

  //Para manejar cambio de imagen de perfil
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFormErrors({});

    try {
      // Verificación básica del archivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Solo se permiten imágenes (JPEG, PNG, GIF)');
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen no puede exceder 2MB');
      }

      // Subir el archivo
      const result = await uploadAvatar(userData.email, file);

      interface UploadResult {
        success: boolean;
        error?: string;
      }

      if (!result.success) {
        throw new Error((result as UploadResult).error || 'Error al guardar el avatar');
      }

      // Actualizar estado
      setUserData(prev => ({
        ...prev,
        avatar: result.avatarUrl
      }));

      setSuccessMessage('Avatar actualizado correctamente');

    } catch (error) {
      setFormErrors({
        message: error instanceof Error ?
          (error as Error).message : JSON.stringify(error)
      });
    } finally {
      setIsUploading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validationData = {
        username: formData.username,
        descripcion: formData.descripcion,
        favorito: formData.favorito,
        password: formData.password || undefined,
        repassword: formData.repassword || undefined
      };

      const result = ProfileFormSchema.safeParse(validationData);

      if (!result.success) {
        const formattedErrors = Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors)
            .map(([key, value]) => [key, value ? value[0] : undefined])
        );

        setFormErrors({
          ...formattedErrors,
          password: formattedErrors.password ? [formattedErrors.password] : undefined,
          repassword: formattedErrors.repassword ? [formattedErrors.repassword] : undefined
        });

        return;
      }

      if (formData.password !== formData.repassword) {
        const passwordError: string[] = [];
        const repasswordError: string[] = [];

        if (formData.password && !formData.repassword) {
          repasswordError.push("Debes repetir la contraseña.");
        } else if (!formData.password && formData.repassword) {
          passwordError.push("Debes introducir la contraseña original.");
        } else {
          passwordError.push("Las contraseñas no coinciden.");
          repasswordError.push("Las contraseñas no coinciden.");
        }

        setFormErrors(prev => ({
          ...prev,
          ...(passwordError.length > 0 && { password: passwordError }),
          ...(repasswordError.length > 0 && { repassword: repasswordError }),
        }));

        return;
      }

      const updatedData = await guardarDatos(
        initialUserData.email,
        formData.username,
        formData.descripcion,
        formData.favorito
      );

      if (formData.password) {
        await actualizarContraseña(initialUserData.email, formData.password);
      }

      setUserData({
        ...userData,
        username: formData.username,
        descripcion: formData.descripcion,
        favorito: formData.favorito,
      });

      setIsEditing(false);
      setFormErrors({});
      setSuccessMessage("Datos guardados correctamente.");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);

    } catch (error) {
      let errorMessage = "Ocurrió un error al guardar. Por favor, inténtalo de nuevo.";
      if (error instanceof Error) {
        if (error.message.includes('password')) {
          errorMessage = "La contraseña debe ser diferente a la actual.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      setFormErrors({ message: errorMessage });
    }
  };
 // Función para ver detalles del amigo
  const handleVerDetallesAmigo = async (amigo: Friend) => {
    setLoadingDetalles(true);
    try {
      
      const response = await obtenerDetallesAmigo(amigo.id, amigo.username);
      const data =  response;

      
      setAmigoDetalles(data);
    } catch (error) {
      console.error('Error al obtener detalles del amigo:', error);
      setAmigoDetalles(amigo);
    } finally {
      setLoadingDetalles(false);
    }
  };

  // Función para confirmar eliminación
  const confirmarQuitarAmigo = async () => {
    if (!amigoAEliminar) return;
    
    try {
      setLoadingAmigos(prev => ({ ...prev, [amigoAEliminar.id]: true }));
      
      const response = await   quitarAmigo(userData.currentUserId, amigoAEliminar.id);
      
      const result =  response;
      
      setAmigos(prev => prev.filter(a => a.id !== amigoAEliminar.id));
      setSuccessMessage(result.message);
    } catch (error) {
      console.error('Error al quitar amigo:', error);
      setFormErrors({ message: error instanceof Error ? error.message : 'Error al quitar amigo' });
    } finally {
      setLoadingAmigos(prev => ({ ...prev, [amigoAEliminar.id]: false }));
      setAmigoAEliminar(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };


  const handleBuscarUsuarios = async () => {
    if (!terminoBusqueda.trim()) {
      setResultadosBusqueda([]);
      return;
    }

    setBuscando(true);
    try {
      const resultados = await buscarUsuarios(terminoBusqueda, userData.currentUserId);
      setResultadosBusqueda(resultados);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      setResultadosBusqueda([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleAgregarAmigo = async (amigo: Friend) => {
    setAgregandoAmigo(prev => ({ ...prev, [amigo.id]: true }));
    try {
      const resultado = await agregarAmigo(
        userData.currentUserId,
        amigo.id,
        amigo.username
      );

      if (resultado.success && resultado.amigo) {
        setAmigos(prev => [...prev, resultado.amigo!]);
        setSuccessMessage(`¡${amigo.username} agregado a tus amigos!`);
        setResultadosBusqueda([]);
        setTerminoBusqueda('');
      } else {
        setFormErrors({ message: resultado.message || 'Error al agregar amigo' });
      }
    } catch (error) {
      console.error('Error al agregar amigo:', error);
      setFormErrors({ message: 'Error al agregar amigo' });
    } finally {
      setAgregandoAmigo(prev => ({ ...prev, [amigo.id]: false }));
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row justify-center gap-3 p-2 md:p-4">
      {/* Input oculto para seleccionar archivos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Columna izquierda - Perfil y Lista de Amigos */}
      <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
        {/* Tarjeta de Perfil */}
        <div className="rounded-2xl shadow-lg dark:bg-navy-800 mt-10 bg-white">
          <div className="relative flex flex-col items-center pt-16 pb-6 px-4">
            <Image
              src='/images/banner.png'
              className="rounded-t-2xl absolute top-0 h-32 w-full object-cover"
              alt="Banner del usuario"
              width={500}
              height={200}
            />

            <div
              className="absolute -top-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-pink-100 dark:border-navy-700 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleAvatarClick}
              title="Cambiar avatar"
            >
              {isUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : null}

              {avatarPreview ? (
                <Image
                  src={avatarPreview!}
                  alt="Avatar preview"
                  fill
                  className="object-cover rounded-full"
                />
             
              ) : userData.avatar ? (
                <Image
                  src={userData.avatar}
                  width={100} 
                  height={100}
                  className="h-full w-full rounded-full object-cover"
                  alt="Avatar del usuario"
                />
              ) : (
                <CurrentProfileAvatar className="h-full w-full rounded-full object-cover" />
              )}
              
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
              <p>{userData.descripcion}</p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 w-full">
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{userData.victorias}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Victorias</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{userData.empates}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Empates</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-2xl font-bold text-navy-700 dark:text-white">{userData.derrotas}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Derrotas</p>
              </div>
            </div>
          </div>
        </div>




            {/* Sección de Lista de Amigos con barra de búsqueda */}
      <div className="flex-1 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-navy-800 p-4">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white mb-4">
          Lista de amigos ({amigos.length})
        </h3>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <input
            type="text"
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleBuscarUsuarios()}
            placeholder="Buscar usuarios..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white"
          />
          <button
            onClick={handleBuscarUsuarios}
            disabled={buscando}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {buscando ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

      {/* Resultados de búsqueda */}
          {resultadosBusqueda.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Resultados de búsqueda ({resultadosBusqueda.length})
              </h4>
              <div className="space-y-2">
                {resultadosBusqueda.map((usuario) => {
                  const yaEsAmigo = amigos.some(a => a.id === usuario.id);

                  return (
                    <div key={usuario.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-navy-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          {usuario.avatar ? (
                            <Image
                              src={usuario.avatar}
                              alt={`Avatar de ${usuario.username}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-300 dark:bg-navy-600 flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {usuario.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{usuario.username}</span>
                      </div>
                      <button
                        onClick={() => handleAgregarAmigo(usuario)}
                        disabled={yaEsAmigo || agregandoAmigo[usuario.id]}
                        className={`px-3 py-1 text-sm ${yaEsAmigo
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                          } text-white rounded-lg transition-colors`}
                      >
                        {yaEsAmigo ? 'Ya es amigo' :
                          agregandoAmigo[usuario.id] ? 'Agregando...' : 'Agregar'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Lista de amigos existente */}
        {amigos.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            {resultadosBusqueda.length === 0 ? 'No tienes amigos agregados todavía' : ''}
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {amigos.map((amigo) => (
              <div
                key={amigo.id}
                className="flex items-center justify-between gap-3 p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition-colors"
              >
                <div 
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleVerDetallesAmigo(amigo)}
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                    {amigo.avatar ? (
                      <Image
                        src={amigo.avatar}
                        alt={`Avatar de ${amigo.username}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-300 dark:bg-navy-600 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {amigo.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-navy-700 dark:text-white truncate">
                      {amigo.username}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAmigoAEliminar(amigo);
                  }}
                  disabled={loadingAmigos[amigo.id]}
                  className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-colors"
                  title="Eliminar amigo"
                >
                  {loadingAmigos[amigo.id] ? (
                    <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <AiOutlineClose className="text-lg" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Eliminar Amigo */}
      {amigoAEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-700 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-4">
              ¿Estás seguro de que quieres eliminar a <span className="font-semibold">{amigoAEliminar.username}</span> de tu lista de amigos?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAmigoAEliminar(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-navy-600 hover:bg-gray-400 dark:hover:bg-navy-500 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarQuitarAmigo}
                disabled={loadingAmigos[amigoAEliminar.id]}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-70"
              >
                {loadingAmigos[amigoAEliminar.id] ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Amigo */}
      {amigoDetalles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-navy-700 p-6 rounded-lg max-w-md w-full relative">
            <button
              onClick={() => setAmigoDetalles(null)}
              className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <AiOutlineClose className="text-xl" />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative h-20 w-20 rounded-full overflow-hidden mb-4">
                {amigoDetalles.avatar ? (
                  <Image
                    src={amigoDetalles.avatar}
                    alt={`Avatar de ${amigoDetalles.username}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 dark:bg-navy-600 flex items-center justify-center">
                    <span className="text-2xl font-medium">
                      {amigoDetalles.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-center">{amigoDetalles.username}</h3>
            </div>

            {loadingDetalles ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {amigoDetalles.descripcion && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</h4>
                    <p className="text-gray-700 dark:text-gray-300">{amigoDetalles.descripcion}</p>
                  </div>
                )}

                {amigoDetalles.favorito && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Juego favorito</h4>
                    <p className="text-gray-700 dark:text-gray-300 capitalize">{amigoDetalles.favorito}</p>
                  </div>
                )}

                {(amigoDetalles.victorias !== undefined || amigoDetalles.empates !== undefined || amigoDetalles.derrotas !== undefined) && (
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-navy-700 dark:text-white">
                        {amigoDetalles.victorias ?? 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Victorias</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-navy-700 dark:text-white">
                        {amigoDetalles.empates ?? 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Empates</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-2xl font-bold text-navy-700 dark:text-white">
                        {amigoDetalles.derrotas ?? 0}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Derrotas</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}


      </div>

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
              name="descripcion"
              rows={3}
              className={`w-full px-3 py-2 border ${formErrors.descripcion ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white`}
              value={formData.descripcion}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
            {formErrors.descripcion && (
              <p className="mt-1 text-sm text-red-600">{formErrors.descripcion[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input
              type="text"
              name="username"
              className={`w-full px-3 py-2 border ${formErrors.username ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white`}
              value={formData.username}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
            {formErrors.username && (
              <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white bg-gray-100 dark:bg-navy-600"
              value={userData.email}
              readOnly
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              className={`w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white`}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repetir Contraseña</label>
            <input
              type="password"
              name="repassword"
              className={`w-full px-3 py-2 border ${formErrors.repassword ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white`}
              placeholder="••••••••"
              value={formData.repassword}
              onChange={handleInputChange}
              readOnly={!isEditing}
              disabled={!isEditing}
            />
            {formErrors.repassword && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.repassword[0]}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Juego favorito</label>
            <select
              name="favorito"
              className={`w-full px-3 py-2 border ${formErrors.favorito ? 'border-red-500' : 'border-gray-300 dark:border-navy-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-navy-700 dark:text-white`}
              value={formData.favorito}
              onChange={handleInputChange}
              disabled={!isEditing}
            >
              <option value="">Selecciona un juego</option>
              <option value="tictactoe">TicTacToe</option>
              <option value="words">Words</option>
            </select>
            {formErrors.favorito && (
              <p className="mt-1 text-sm text-red-600">
                {formErrors.favorito[0]}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="absolute bottom-6 left-0 right-0 flex gap-2 px-6">
              <button
                type="submit"
                className={`flex-1 py-2 ${isDirty ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'} text-white font-medium rounded-lg transition-colors`}
                disabled={!isDirty}
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

          {formErrors.message && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {formErrors.message}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}