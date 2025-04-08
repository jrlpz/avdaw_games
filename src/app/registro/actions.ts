'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

interface FormState {
  error: string | null;
  success?: boolean;
}

export async function registro(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const cpassword = formData.get('cpassword') as string;

  // Validaciones básicas
  if (!username || !email || !password || !cpassword) {
    return { error: 'Todos los campos son obligatorios' };
  }

  if (password !== cpassword) {
    return { error: 'Las contraseñas no coinciden' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  try {
    // 1. Registrar usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });

    if (authError) {
      console.error("Error en auth:", authError);
      return { error: authError.message || 'Error al registrar usuario' };
    }

    if (!authData.user) {
      return { error: 'No se recibió data del usuario creado' };
    }

    // 2. Insertar en tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        username,
        email
      });

    if (dbError) {
      console.error("Error en DB:", dbError);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { error: dbError.message || 'Error al guardar datos adicionales' };
    }

    revalidatePath('/', 'layout');
    return { error: null, success: true };

  } catch (err) {
    console.error("Error inesperado:", err);
    return { error: 'Ocurrió un error inesperado' };
  }
}