'use server'
import { SignupFormSchema } from '../auth/definitions'
import { createClient } from '@/utils/supabase/client'
import bcrypt from 'bcrypt';
import { createSession } from '../auth/session';

export async function signup(state: unknown, formData: FormData) {
    // 1. Validar campos
    const validationResult = SignupFormSchema.safeParse({
        username: formData.get('name'), // Cambiado a username para coincidir
        email: formData.get('email'),
        password: formData.get('password')
    });
    
    if (!validationResult.success) {
        return {
            errors: validationResult.error.flatten().fieldErrors, 
        };
    }

    const { username, email, password } = validationResult.data;

    // 2. Crear usuario
    const supabase = createClient();
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
        .from('usuarios')
        .insert([{ 
            username, 
            email, 
            password: hashedPassword 
        }])
        .select('id')
        .single();

    if (error) {
        console.error('Error al crear usuario:', error);
        return {
            errors: {
                general: ['Error al crear la cuenta. Por favor intenta nuevamente.']
            }
        };
    }

    if (!data) {
        return {
            errors: {
                general: ['No se recibieron datos al crear el usuario.']
            }
        };
    }

    // 3. Crear sesión
    await createSession(data.id);
    
    // Redirigir (esto depende de tu implementación)
    return { success: true };
}