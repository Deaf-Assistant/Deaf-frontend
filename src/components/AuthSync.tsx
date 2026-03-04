'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { ROUTES } from '@/lib/constants'; 

const supabase = createClient();

export default function AuthSync() {
  const router = useRouter();
  const pathname = usePathname();

  const isSyncing = useRef(false);

  useEffect(() => {
    if (isSyncing.current) return;

    const handleAuthSync = async () => {
     
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        isSyncing.current = true;
     

        try {
       
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
          
            auth.setToken(accessToken);

    
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (!error && data.session) {
           
               const { data: profile } = await supabase
                 .from('users')
                 .select('*')
                 .eq('id', data.session.user.id)
                 .single();

               const fullUser = {
                 id: data.session.user.id,
                 email: data.session.user.email || '',
                 name: profile?.name || data.session.user.user_metadata.name || 'User',
                 role: profile?.role || data.session.user.user_metadata.role || 'STUDENT',
                 ...profile
               };

         
               auth.setUser(fullUser);

           
               window.dispatchEvent(new Event('auth-change'));
               window.dispatchEvent(new Event('storage'));

           
               window.history.replaceState(null, '', window.location.pathname);
               
          
            }
          }
        } catch (err) {
          console.error("AuthSync Error:", err);
        } finally {
          isSyncing.current = false;
        }
      } else {
      
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && !auth.isAuthenticated()) {
       
            auth.setToken(session.access_token);
          
            window.dispatchEvent(new Event('auth-change'));
        }
      }
    };

    handleAuthSync();

  
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
         window.dispatchEvent(new Event('auth-change'));
      } else if (event === 'SIGNED_OUT') {
         auth.logout();
         window.dispatchEvent(new Event('auth-change'));
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  return null;
}