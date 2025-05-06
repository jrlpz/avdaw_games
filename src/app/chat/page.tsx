// app/chat/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ChatClient from './chatclient';
import Image from 'next/image';

export default async function ChatPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Obtener el nombre de usuario del perfil
  const { data: profile } = await supabase
    .from('usuarios')
    .select('username')
    .eq('id', user.id)
    .single();

  const username = profile?.username || user.email?.split('@')[0] || "Usuario";

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