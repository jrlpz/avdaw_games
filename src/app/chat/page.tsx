// app/chat/page.tsx
import { redirect } from 'next/navigation';
import ChatClient from './chatclient';
import Image from 'next/image';
import { getCurrentSession } from '@/app/auth/session'; 


export default async function ChatPage() {
  
  const session = await getCurrentSession(); 

  if (!session?.isAuth) {
    console.log("No hay sesión activa, redirigiendo a /login");
    return redirect('/login');
  }

  console.log(session)


 const username = session.username ? session.username : session.email;
  return (
    <>
      <div className="text-center mb-2 mt-2">
        <div className="flex flex-col items-center gap-6 justify-center">
          <Image
            src="/images/logo_oscuro.png"
            width={150}
            height={150}
            alt="Logo"
            priority
          />
        </div>
      </div>
      <ChatClient username={username} />
    </>
  );
}