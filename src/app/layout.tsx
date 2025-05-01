import React from 'react';
import './globals.css';
import './layout.css';
import Header from '@/components/layout/headerComponent/Header';
import Footer from '@/components/layout/footerComponent/Footer';
import { Metadata } from 'next';

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

function handleHome(){
  
}
const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <Header userData={null}/>
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;