import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface Couple {
  id: string;
  user1_id: string;
  user2_id: string | null;
  invite_code: string;
  invite_email: string | null;
  status: string;
}

interface CoupleContextType {
  couple: Couple | null;
  mode: 'individual' | 'couple';
  setMode: (m: 'individual' | 'couple') => void;
  loading: boolean;
  createCouple: (inviteEmail?: string) => Promise<void>;
  joinCouple: (code: string) => Promise<void>;
  dissolveCouple: () => Promise<void>;
  refreshCouple: () => Promise<void>;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [mode, setMode] = useState<'individual' | 'couple'>(() => {
    return (localStorage.getItem('somma_couple_mode') as any) || 'individual';
  });
  const [loading, setLoading] = useState(true);

  const fetchCouple = useCallback(async () => {
    if (!user) { setCouple(null); setLoading(false); return; }
    const { data } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .in('status', ['active', 'pending'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setCouple(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCouple(); }, [fetchCouple]);

  useEffect(() => {
    localStorage.setItem('somma_couple_mode', mode);
  }, [mode]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('couple-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'couples' }, () => {
        fetchCouple();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCouple]);

  const createCouple = async (inviteEmail?: string) => {
    if (!user) return;
    const { error } = await supabase.from('couples').insert({
      user1_id: user.id,
      invite_email: inviteEmail || null,
    });
    if (error) { toast.error('Erro ao criar convite'); return; }
    toast.success('Convite criado!');
    await fetchCouple();
  };

  const joinCouple = async (code: string) => {
    if (!user) return;
    // Find pending couple with this code
    const { data: coupleData, error: findErr } = await supabase
      .from('couples')
      .select('*')
      .eq('invite_code', code.toLowerCase().trim())
      .eq('status', 'pending')
      .is('user2_id', null)
      .maybeSingle();

    if (findErr || !coupleData) {
      toast.error('Código inválido ou convite já usado');
      return;
    }
    if (coupleData.user1_id === user.id) {
      toast.error('Você não pode aceitar seu próprio convite');
      return;
    }

    const { error } = await supabase
      .from('couples')
      .update({ user2_id: user.id, status: 'active' })
      .eq('id', coupleData.id);

    if (error) { toast.error('Erro ao aceitar convite'); return; }

    // Share existing data: update user's records with couple_id
    await Promise.all([
      supabase.from('purchases').update({ couple_id: coupleData.id }).eq('user_id', user.id),
      supabase.from('incomes').update({ couple_id: coupleData.id }).eq('user_id', user.id),
      supabase.from('cards').update({ couple_id: coupleData.id }).eq('user_id', user.id),
      supabase.from('categories').update({ couple_id: coupleData.id }).eq('user_id', user.id),
      // Also update creator's data
      supabase.from('purchases').update({ couple_id: coupleData.id }).eq('user_id', coupleData.user1_id),
      supabase.from('incomes').update({ couple_id: coupleData.id }).eq('user_id', coupleData.user1_id),
      supabase.from('cards').update({ couple_id: coupleData.id }).eq('user_id', coupleData.user1_id),
      supabase.from('categories').update({ couple_id: coupleData.id }).eq('user_id', coupleData.user1_id),
    ]);

    setMode('couple');
    toast.success('Casal vinculado com sucesso! 💕');
    await fetchCouple();
  };

  const dissolveCouple = async () => {
    if (!couple) return;
    const { error } = await supabase
      .from('couples')
      .update({ status: 'dissolved' })
      .eq('id', couple.id);
    if (error) { toast.error('Erro ao desvincular'); return; }
    setMode('individual');
    toast.success('Casal desvinculado');
    await fetchCouple();
  };

  return (
    <CoupleContext.Provider value={{ couple, mode, setMode, loading, createCouple, joinCouple, dissolveCouple, refreshCouple: fetchCouple }}>
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) throw new Error('useCouple must be used within CoupleProvider');
  return context;
};
