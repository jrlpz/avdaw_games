'use server';
import { createClient } from '@/utils/supabase/server';
import { FormState, SignupFormSchema } from '../auth/definitions';

export async function registro(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();

  // 1. Validación con Zod
  const validationResult = SignupFormSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    cpassword: formData.get('cpassword')
  });

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
      message: 'Por favor, corrige los errores en el formulario'
    };
  }

  const { username, email, password } = validationResult.data;

  try {
    // 2. Registrar usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`
      }
    });

    if (authError) {
      console.error('Supabase Auth Error al intentar signUp:', authError);
      if (authError.message.includes('already registered')) {
        return { message: 'El correo electrónico ya está registrado.' };
      }
      if (authError.message.includes('password is too weak')) {
        return { message: 'La contraseña es demasiado débil.' };
      }
      return {
        message: `Error de autenticación: ${authError.message}` 
      };
    }

    if (!authData.user) {
        return {
            message: 'Registro exitoso, por favor, revisa tu correo para confirmar tu cuenta.'
        };
    }

    // 3. Insertar en tabla usuarios
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        username,
        email
      });

    if (dbError) {
      console.error('Supabase DB Error al insertar usuario en tabla "usuarios":', dbError);
      if (dbError.message.includes('duplicate key value violates unique constraint')) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          message: 'El nombre de usuario o correo electrónico ya están en uso (o no válidos).'
        };
      } else {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          message: `Error al completar el registro: ${dbError.message || 'Error desconocido en la base de datos'}`
        };
      }
    }
    return {
      message: 'Usuario registrado correctamente',
      errors: {},
    };

  } catch (error) {
    console.error("Error inesperado en el proceso de registro (catch block):", error);
    return {
      message: 'Ocurrió un error inesperado durante el registro.',
      errors: {}
    };
  }
}