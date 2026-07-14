import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return handleLogout;
}
