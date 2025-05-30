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
      // Puedes intentar ser más específico si conoces los posibles errores de auth
      if (authError.message.includes('already registered')) {
        return { message: 'El correo electrónico ya está registrado.' };
      }
      if (authError.message.includes('password is too weak')) {
        return { message: 'La contraseña es demasiado débil.' };
      }
      return {
        message: `Error de autenticación: ${authError.message}` // Mensaje más descriptivo
      };
    }

    // Si el usuario no se crea en Auth (aunque signUp no devuelva un error,
    // data.user podría ser null si se requiere confirmación por email y aún no está verificado)
    if (!authData.user) {
        // Esto puede ocurrir si el registro requiere confirmación de email y
        // Supabase solo crea un usuario "no confirmado" pero no devuelve error.
        // El usuario necesita confirmar su email antes de que podamos insertarlo en nuestra tabla.
        // La tabla 'usuarios' requiere un 'id' que viene de authData.user.id
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
      console.error('Supabase DB Error al insertar usuario en tabla "usuarios":', dbError); // MUY IMPORTANTE PARA DEPURAR

      // Intenta revertir la creación del usuario en Auth si la inserción en DB falla
      // Solo borra si la inserción en DB fue un error real y no una 'duplicate key' que ya manejas.
      // Aquí, la lógica sugiere que si llegamos aquí, NO es un 'duplicate key' en la tabla 'usuarios'
      // ya que Zod valida el username y el email al inicio, y el auth.signUp ya manejaría
      // emails duplicados en la autenticación.
      // Sin embargo, si el `username` tiene una restricción UNIQUE en la tabla `usuarios`,
      // este `dbError` podría ser por eso, y el `auth.admin.deleteUser` es correcto.
      if (dbError.message.includes('duplicate key value violates unique constraint')) {
        // Si el error es una violación de clave única (ej. username ya existe)
        // en la tabla 'usuarios' y no fue capturado por Zod o Auth, borramos el usuario de Auth.
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          message: 'El nombre de usuario o correo electrónico ya están en uso (o no válidos).'
        };
      } else {
        // Este es el error "inesperado" que quieres depurar
        await supabase.auth.admin.deleteUser(authData.user.id); // Revertir creación de Auth
        return {
          message: `Error al completar el registro: ${dbError.message || 'Error desconocido en la base de datos'}`
        };
      }
    }

    // Si todo fue bien (auth y db insert)
    return {
      message: 'Usuario registrado correctamente',
      errors: {},
    };

  } catch (error) {
    console.error("Error inesperado en el proceso de registro (catch block):", error);
    // Si llegamos aquí, es un error no capturado por Supabase
    return {
      message: 'Ocurrió un error inesperado durante el registro.',
      errors: {}
    };
  }
}