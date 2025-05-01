// app/chat/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ChatClient from './chatclient';

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

  return <ChatClient username={username} />;
}