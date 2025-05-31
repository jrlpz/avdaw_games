'use server';

import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/app/auth/session';
import { getRankingUsers } from './actions';
import RankingClient from './rankingclient';

export default async function RankingPage() {
  const session = await getCurrentSession();
  
  if (!session?.isAuth) {
    return redirect('/login');
  }

  try {
    const rankingData = await getRankingUsers();
  console.log('Ranking Data:', rankingData);
    return (
      <div className='bg-gray-100'>
        <RankingClient rankingData={rankingData} currentUser={session.username} currentUserId={String(session.userId)} />
      </div>
    );
  } catch (error) {
    console.error(error);
    return redirect('/');
  }
}