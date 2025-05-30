
import { redirect } from 'next/navigation';
import PerfilClient from './perfilclient';
import { getCurrentSession } from '@/app/auth/session';
import { recuperarUsuario, calcularEstadisticas } from './actions';

export default async function PerfilPage() {
  const session = await getCurrentSession();
  
  if (!session?.isAuth) {
    return redirect('/login');
  }

  try {
    const usuario = await recuperarUsuario(session.email || '', session.username || '');
    const estadisticas = await calcularEstadisticas(usuario.username);
    const currentUserId=String(session.userId);
    return (
      <div className='bg-gray-100'>
      <PerfilClient userData={{ ...usuario, ...estadisticas,currentUserId }} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect('/');
  }
}