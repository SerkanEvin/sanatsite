import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  isAdmin: boolean;
  isArtist: boolean;
  artistProfile: any | null;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const [artistProfile, setArtistProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setIsArtist(false);
      setArtistProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Initial check for hardcoded admin
    const isHardcodedAdmin = user.id === 'admin-arda' || user.email === 'ardaonuk9995@gmail.com';

    const [adminRes, artistRes] = await Promise.all([
      supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle(),
      supabase.from('artists').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    setIsAdmin(isHardcodedAdmin || !!adminRes.data);
    setIsArtist(!!artistRes.data);
    setArtistProfile(artistRes.data || null);
    setLoading(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isArtist, artistProfile, loading }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
