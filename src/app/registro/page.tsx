'use client';
import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { registro } from './actions';

export default function Registro() {
  const router = useRouter();
  const [state, formAction] = useActionState(registro, { message: '', errors: {} });


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (state?.message === 'Usuario registrado correctamente') {
      router.push('/login');
    }
  }, [state, router]);

  const handleLoginClick = () => {
    router.push('/login');
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
        {pending ? 'Registrando...' : 'Enviar'}
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
            alt="Logo de la aplicación"
            priority
          />
          <h4 className="text-slate-600 text-xl font-semibold">
            Formulario de registro
          </h4>
        </div>
      </div>


      {state?.message && state.message !== 'Usuario registrado correctamente' && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md text-sm">
          {state.message}
        </div>
      )}

      <form action={formAction}>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Campo Username  */}
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Apodo</label>
            <input
              name="username"
              type="text"
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                state?.errors?.username ? 'border border-red-500' : ''
              }`}
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
     
            />
            {state?.errors?.username && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.username.join(', ')}
              </p>
            )}
          </div>

          {/* Campo Email  */}
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Correo electrónico</label>
            <input
              name="email"
              type="email"
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                state?.errors?.email ? 'border border-red-500' : ''
              }`}
              placeholder="Introduce un email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
           
            />
            {state?.errors?.email && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.email.join(', ')}
              </p>
            )}
          </div>

          {/* Campo Password  */}
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Contraseña</label>
            <input
              name="password"
              type="password"
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                state?.errors?.password ? 'border border-red-500' : ''
              }`}
              placeholder="Introduce la contraseña"
              // No value/onChange needed if uncontrolled
            />
            {state?.errors?.password && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.password.join(', ')}
              </p>
            )}
          </div>

          {/* Campo Confirm Password  */}
          <div>
            <label className="text-slate-800 text-sm font-medium mb-2 block">Repetir contraseña</label>
            <input
              name="cpassword"
              type="password"
              className={`bg-slate-100 w-full text-slate-800 text-sm px-4 py-3 rounded-md focus:bg-transparent outline-blue-500 transition-all ${
                state?.errors?.cpassword ? 'border border-red-500' : ''
              }`}
              placeholder="Confirma la contraseña"
            
            />
            {state?.errors?.cpassword && (
              <p className="mt-1 text-sm text-red-500">
                {state.errors.cpassword.join(', ')}
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
          ¿Ya tienes cuenta? <button
            onClick={handleLoginClick}
            className="text-blue-500 hover:underline cursor-pointer"
            type="button"
          >
            Identifícate
          </button>
        </p>
      </div>
    </div>
  );
}