'use client';
import React, { useState, createContext, Dispatch, SetStateAction, FC, ReactNode } from 'react';
import './globals.css';
import './layout.css';
import Header from '@/layoutComponent/headerComponent/Header';
import Footer from '@/layoutComponent/footerComponent/Footer';
import { Metadata } from 'next';

interface RootLayoutProps {
  children: ReactNode;
}

interface PropiedadesTema {
  tema: string;
  setTema: Dispatch<SetStateAction<string>>;
}

const ContextoTema = createContext<PropiedadesTema>({
  tema: 'light',
  setTema: () => { },
});

export const useTema = () => React.useContext(ContextoTema); // Custom hook

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  const [tema, setTema] = useState('light');
  console.log(tema);

  return (
    <html lang="es">
      <body className={`flex flex-col min-h-screen ${tema === 'dark' ? 'tema-oscuro' : 'tema-claro'}`}>
        <ContextoTema.Provider value={{ tema, setTema }}>
          <Header tema={tema} setTema={setTema} />
          <main data-tema={tema} className="flex-grow">{children}</main>
          <Footer />
        </ContextoTema.Provider>
      </body>
    </html>
  );
};

export default RootLayout;