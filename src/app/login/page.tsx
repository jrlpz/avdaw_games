'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { login } from './actions';
import type { LoginState } from '@/app/auth/definitions';

const initialState: LoginState = { message: undefined, errors: {}, success: false, redirectTo: undefined };

export default function Login() {
  const router = useRouter();
  const [state, formAction] = useActionState<LoginState, FormData>(login, initialState);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (state?.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  const handleRegisterClick = () => {
    router.push('/registro');
  };

  function SubmitButton() {
    const { pending } = useFormStatus();

    return (
      <button
        type="submit"
        disabled={pending}
        className="py-3 px-6 text-sm font-medium tracking-wider rounded-md text-white bg-[var(--color-logo1)] hover:bg-[var(--color-logo2)] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        aria-disabled={pending}
      >
        {pending ? 'Cargando...' : 'Entrar'}
      </button>
    );
  }

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

      {state?.message && !state.success && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
          {state.message}
        </div>
      )}
      {state?.error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
              {state.error}
          </div>
      )}

      <form className="mx-auto lg:w-[400px]" action={formAction}>
        <div className="grid sm:grid-cols-1 gap-6">
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Email</label>
            <input
              name="email"
              type="email"
    
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${state?.errors?.email ? 'border border-red-500' : ''}`}
              placeholder="Introduce el email" />

            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.email.join(', ')}
              </p>
            )}
          </div>

          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Contraseña</label>
            <input
              name="password"
              type="password"
              
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${state?.errors?.password ? 'border border-red-500' : ''}`}
              placeholder="Introduce la contraseña" />

            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.password.join(', ')}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
           <SubmitButton />
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