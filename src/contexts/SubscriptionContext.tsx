import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase, Subscription } from '../lib/supabase';

interface SubscriptionContextType {
  subscription: Subscription | null;
  isPremium: boolean;
  loading: boolean;
  upgradeToPremium: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching subscription:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          tier: 'free',
          status: 'active',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating subscription:', insertError);
      } else {
        setSubscription(newSub);
      }
    } else {
      setSubscription(data);
    }

    setLoading(false);
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        tier: 'premium',
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error upgrading subscription:', error);
      return;
    }

    await fetchSubscription();
  };

  const isPremium = subscription?.tier === 'premium' && subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider value={{ subscription, isPremium, loading, upgradeToPremium }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
