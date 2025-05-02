import React from 'react';
import './globals.css';
import './layout.css';
import Header from '@/components/layout/headerComponent/Header'; // Asegúrate que la ruta sea correcta
import Footer from '@/components/layout/footerComponent/Footer'; // Asegúrate que la ruta sea correcta
import { Metadata } from 'next';
import { getCurrentSession } from '@/app/auth/session'; // Importa tu función para obtener la sesión

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: 'Avdaw Games',
  description: 'Avdaw Games',
  icons: {
    icon: '/images/logo_claro_solo.png',
  },
};

// 1. Convierte el componente RootLayout en una función `async`
//    Esto permite usar `await` dentro de él.
// 2. Cambia la firma para que no use React.FC (más común para Server Components)
export default async function RootLayout({ children }: RootLayoutProps) {

  // 3. Llama a tu función para obtener los datos de la sesión actual en el servidor.
  const sessionData = await getCurrentSession();
console.log(sessionData)
  // 4. Prepara los datos que el componente Header espera.
  //    Basado en la estructura de `getCurrentSession` y lo que `Header` necesita ({email, username} | null).
  const headerUserData = sessionData?.isAuth // Verifica si hay una sesión válida
    ? {
        email: sessionData.email || '', // Pasa el email (o un string vacío si no existe)
        username: sessionData.username || 'Usuario' // Pasa el username (o un fallback si no existe)
      }
    : null; // Si no hay sesión, pasa null

  // La función handleHome no es necesaria aquí, puedes quitarla.

  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        {/* 5. Pasa los datos preparados (`headerUserData`) al componente Header */}
        <Header userData={headerUserData} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// No necesitas exportar default RootLayout al final si ya lo hiciste en la declaración de la función.