import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

export default function Counter() {
  const { user, profile } = useAuth();
  const [todayCount, setTodayCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTodayCount();
    }
  }, [user, profile?.daily_limit]);

  const fetchTodayCount = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_stats')
      .select('total_puffs')
      .eq('user_id', user!.id)
      .eq('date', today)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today count:', error);
    }

    setTodayCount(data?.total_puffs || 0);
    setLoading(false);
  };

  const addPuff = async () => {
    if (!user) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const newCount = todayCount + 1;
    setTodayCount(newCount);

    const today = new Date().toISOString().split('T')[0];

    const { error: puffError } = await supabase
      .from('puffs')
      .insert({
        user_id: user.id,
        puff_count: 1,
        recorded_at: new Date().toISOString(),
      });

    if (puffError) {
      console.error('Error adding puff:', puffError);
      setTodayCount(todayCount);
      return;
    }

    const { data: existingStat } = await supabase
      .from('daily_stats')
      .select('id, total_puffs')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (existingStat) {
      await supabase
        .from('daily_stats')
        .update({
          total_puffs: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStat.id);
    } else {
      await supabase
        .from('daily_stats')
        .insert({
          user_id: user.id,
          date: today,
          total_puffs: newCount,
        });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const dailyLimit = profile?.daily_limit || 50;
  const progress = (todayCount / dailyLimit) * 100;
  const isOverLimit = todayCount > dailyLimit;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold  mb-2">Today's Count</h2>
        <p className="">Tap the counter to track each puff</p>
      </div>

      <div className="relative">
        <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${
          isOverLimit ? 'from-red-400 to-orange-400' : 'from-primary-500 to-secondary-500'
        } shadow-2xl flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(20,184,142,0.4)] active:scale-95 ${
          isAnimating ? 'scale-110' : ''
        }`}
        onClick={addPuff}>
          <div className="text-center">
            <div className="text-7xl font-bold text-white mb-2">{todayCount}</div>
            <div className="text-xl text-white opacity-90">puffs</div>
          </div>
        </div>

        {isAnimating && (
          <div className="absolute inset-0 rounded-full border-4 border-white animate-ping"></div>
        )}
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">Daily Goal</span>
            <span className=" font-bold">{dailyLimit} puffs</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isOverLimit ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-primary-500 to-secondary-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="mt-2 text-right">
            <span className={`text-sm font-medium ${isOverLimit ? 'text-red-600' : 'text-gray-600'}`}>
              {isOverLimit ? `${todayCount - dailyLimit} over limit` : `${dailyLimit - todayCount} remaining`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-1">
              {isOverLimit ? (
                <TrendingUp className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-green-500" />
              )}
              <span className=" text-sm">Status</span>
            </div>
            <p className={`text-lg font-bold ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
              {isOverLimit ? 'Over Limit' : 'On Track'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-5 h-5 text-primary-500" />
              <span className=" text-sm">Progress</span>
            </div>
            <p className="text-lg font-bold ">
              {Math.round(progress)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
