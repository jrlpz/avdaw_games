'use client';
import Image from 'next/image';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {login} from './actions'; // Asegúrate de que la ruta sea correct

export default function Login() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, { error: null });

  // Manejar redirección cuando el login es exitoso
  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const handleRegisterClick = () => {
    router.
    push('/registro');
  };
  return (
    <div className="max-w-4xl max-sm:max-w-lg mx-auto p-6 mt-25">
      <div className="text-center mb-12 sm:mb-20">
        <div className="flex items-center gap-6 justify-center">
          <Image
            src="/images/logo_oscuro.png"
            width={150}
            height={150}
            alt="Logo"
            priority
          />
          <h4 className="text-slate-600 text-xl font-semibold">
            Formulario de Login
          </h4>
        </div>
      </div>

      <form action={formAction}>
        <div className="grid sm:grid-cols-1 gap-6">
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Introduce el email"
              required
            />
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Contraseña</label>
            <input
              name="password"
              type="password"
              className="bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all"
              placeholder="Introduce la contraseña"
              required
              minLength={6}
            />
          </div>
        </div>

        {state?.error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm text-center">
            {state.error}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            type="submit"
            disabled={isPending}
            className="py-3 px-6 text-sm font-medium tracking-wider rounded-md text-white bg-[var(--color-logo1)] hover:bg-[var(--color-logo2)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? 'Iniciando sesión...' : 'Entrar'}
          </button>
        </div>
      </form>

      <div className='text-center mt-12 mb-12 sm:mb-20'>
        <p>
          ¿No tienes cuenta?{' '}
          <button onClick={handleRegisterClick} className="text-blue-500 hover:underline cursor-pointer">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}