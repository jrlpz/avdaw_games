import { z } from 'zod';


/* Esquema para Registro*/
export const SignupFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'El username debe tener al menos 3 caracters.' })
    .trim(),


  email: z.string().email({ message: 'Fortmato inválido.' }).trim(),


  password: z
    .string()
    .min(8, { message: 'Minimo 8 cáracteres' })
    .regex(/[A-Z]/, { message: 'Contiene al menos 1 letra mayúscula' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contiene al menos 1 caracter especial.',
    })
    .trim(),

    cpassword: z
    .string()
    .min(8, { message: 'Minimo 8 cáracteres' })
    .regex(/[A-Z]/, { message: 'Contiene al menos 1 letra mayúscula' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contiene al menos 1 caracter especial.',
    })
    .trim(),
});

export type FormState =
  | {
      errors?: {
        username?: string[];
        email?: string[];
        password?: string[];
        cpassword?: string[];
      };
      message?: string;
    }
  | undefined;

/* Esquema para Login*/

export const SigninFormSchema = z.object({
  email: z.string()
    .trim() 
    .superRefine((val, ctx) => {

      if (val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El email no puede estar vacío.',
        });
       
        return; 
      }

      const emailCheck = z.string().email().safeParse(val);
      if (!emailCheck.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, 
          message: 'Formate de emial no válido.',
        
        });
      }
    }),

  password: z.string().min(1, { message: 'La contraseña no puede estar vacía.' }),
});

  export type LoginState = {
    errors?: {
      email?: string[];
      password?: string[];
    };
    message?: string;
    redirectTo?: string;
    error?: string;
    success?: boolean;
  };

  
export type SessionPayload = {
  userId: string | number;
  email: string;
  username:string;
  expiresAt: Date;
};

