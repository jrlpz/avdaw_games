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


export default async function RootLayout({ children }: RootLayoutProps) {

 
  const sessionData = await getCurrentSession();

  const headerUserData = sessionData?.isAuth 
    ? {
        email: sessionData.email || '', 
        username: sessionData.username || 'Usuario' 
      }
    : null; 

 

  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Header userData={headerUserData} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

// No necesitas exportar default RootLayout al final si ya lo hiciste en la declaración de la función.