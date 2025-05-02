'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import {SigninFormSchema, LoginState } from '@/app/auth/definitions';
import { createSession } from '../auth/session';
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = await createClient();

    // 1. Validación con Zod
    const validationResult = SigninFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
  
    if (!validationResult.success) {
      return {
        errors: validationResult.error.flatten().fieldErrors,
        message: 'Credenciales no válidos',
      };
    }
  
    
  const { email, password } = validationResult.data;

  try {
    // 2. Autenticar al usuario
    const { data: { user, session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    
    if (error || !user) {
      return { message: 'Credenciales no válidos, vuelve a intentarlo.' };
    }

    // 2. Obtener datos adicionales del usuario
    const { data: userData } = await supabase
      .from('usuarios')
      .select('username, email')
      .eq('id', user.id)
      .single();

    // 3. Configurar la cookie de sesión   
    await createSession(user.id, email);

    // 4. Indicar éxito y URL de redirección
    return {
      errors: undefined,
      success: true,
      redirectTo: '/' 
    };

  } catch (error) {
    console.error('Error durante el login:', error);
    return { error: 'Error interno del servidor' };
  }
}