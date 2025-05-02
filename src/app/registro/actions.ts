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
      return {
        errors: { 
          email: [authError.message.includes('email') ? 'El email ya está registrado' : 'Error de autenticación'],
          ...(authError.message.includes('password') && { password: ['Contraseña no válida'] })
        },
        message: 'Error al registrar usuario'
      };
    }

    // 3. Insertar en tabla usuarios
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          username,
          email
        });

      if (dbError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          message: dbError.message.includes('duplicate key') 
            ? 'Nombre de usuario o correo no válidos' 
            : 'Error al completar el registro'
        };
      }
    }

    return { 
      message: 'Usuario registrado correctamente', 
      errors: {},
     
    };
  } catch (error) {
    console.error("Error en el proceso de registro:", error);
    return {
      message: 'Ocurrió un error inesperado',
      errors: {}
    };
  }
}