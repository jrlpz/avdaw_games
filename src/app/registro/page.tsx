'use client';
import { useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './registro.module.css';
import { registro } from './actions';

export default function Registro() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registro, { error: null });

  useEffect(() => {
    if (state?.success) {
      router.push('/login');
    }
  }, [state, router]);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="max-w-4xl max-sm:max-w-lg mx-auto p-6 mt-25">
      {/* Sección del título y logo alineados */}
      <div className="text-center mb-12 sm:mb-20">
        <div className="flex items-center gap-6 justify-center">
          <Image
            src="/images/logo_oscuro.png"
            width={150}
            height={150}
            alt="Logo de la aplicación"
          />
          <h4 className="text-slate-600 text-xl font-semibold">
            Formulario de registro
          </h4>
        </div>
      </div>

      {/* Mensaje de error */}
      {state?.error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
          {state.error}
        </div>
      )}

      {/* Formulario */}
      <form action={formAction}>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Apodo</label>
            <input 
              name="username" 
              type="text"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Nombre de usuario"
              required
              minLength={3}
            />
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Correo electrónico</label>
            <input 
              name="email" 
              type="email"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Contraseña</label>
            <input 
              name="password" 
              type="password"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Repetir contraseña</label>
            <input 
              name="cpassword" 
              type="password"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Confirm password"
              required
              minLength={6}
            />
          </div>
        </div>

        {/* Botón */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 text-sm font-medium tracking-wider rounded-md text-white bg-[var(--color-logo1)] hover:bg-[var(--color-logo2)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Registrando...' : 'Enviar'}
          </button>
        </div>
      </form>
{/*boton */}
      <div className='text-center mt-12 mb-12 sm:mb-20'>
        <p>
          ¿Ya tienes cuenta? <button onClick={handleLoginClick} className="text-blue-500 hover:underline cursor-pointer">Identifícate</button>
        </p>
      </div>
    </div>
  );
}