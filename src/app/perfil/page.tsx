
import { redirect } from 'next/navigation';
import PerfilClient from './perfilclient';
import { getCurrentSession } from '@/app/auth/session';
import { recuperarUsuario, calcularEstadisticas } from './actions';

export default async function ChatPage() {
  const session = await getCurrentSession();
  
  if (!session?.isAuth) {
    return redirect('/login');
  }

  try {
    const usuario = await recuperarUsuario(session.email || '', session.username || '');
    const estadisticas = await calcularEstadisticas(usuario.username);
    return (
      <div className='bg-gray-100'>
      <PerfilClient userData={{ ...usuario, ...estadisticas }} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect('/');
  }
}