'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

interface LoginState {
  error: string | null;
  success?: boolean;
  redirectTo?: string;
}
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' };
  }

  try {
    // 1. Autenticar al usuario
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !user) {
      return { error: error?.message || 'Credenciales inválidas' };
    }

    // 2. Obtener datos adicionales del usuario
    const { data: userData } = await supabase
      .from('usuarios')
      .select('username, email')
      .eq('id', user.id)
      .single();

    // 3. Configurar la cookie de sesión
    (await
      // 3. Configurar la cookie de sesión
      cookies()).set('sb-access-token', session?.access_token || '', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // 4. Indicar éxito y URL de redirección
    return { 
      error: null, 
      success: true,
      redirectTo: '/' // Cambia esto por tu ruta deseada
    };

  } catch (error) {
    console.error('Error durante el login:', error);
    return { error: 'Error interno del servidor' };
  }
}