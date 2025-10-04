import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase, Craving, HealthMilestone } from '../lib/supabase';
import PremiumGate from './PremiumGate';
import {
  TrendingUp,
  DollarSign,
  Heart,
  Brain,
  Download,
  Zap,
  Calendar,
  AlertCircle,
  Sparkles,
  Crown
} from 'lucide-react';

export default function Premium() {
  const { user, profile } = useAuth();
  const { isPremium } = useSubscription();
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [milestones, setMilestones] = useState<HealthMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCravingForm, setShowCravingForm] = useState(false);
  const [newCraving, setNewCraving] = useState({
    intensity: 5,
    trigger: '',
    notes: '',
  });
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    if (user && isPremium) {
      fetchPremiumData();
    } else {
      setLoading(false);
    }
  }, [user, isPremium]);

  useEffect(() => {
    if (user && isPremium && !loading) {
      generateInsights();
    }
  }, [user, isPremium, loading, cravings]);

  const fetchPremiumData = async () => {
    const [cravingsResult, milestonesResult] = await Promise.all([
      supabase
        .from('cravings')
        .select('*')
        .eq('user_id', user!.id)
        .order('recorded_at', { ascending: false }),
      supabase
        .from('health_milestones')
        .select('*')
        .eq('user_id', user!.id)
        .order('achieved_at', { ascending: false }),
    ]);

    if (cravingsResult.data) setCravings(cravingsResult.data);
    if (milestonesResult.data) setMilestones(milestonesResult.data);
    setLoading(false);
  };

  const addCraving = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('cravings')
      .insert({
        user_id: user!.id,
        intensity: newCraving.intensity,
        trigger: newCraving.trigger || null,
        notes: newCraving.notes || null,
      });

    if (error) {
      console.error('Error adding craving:', error);
      return;
    }

    setNewCraving({ intensity: 5, trigger: '', notes: '' });
    setShowCravingForm(false);
    fetchPremiumData();
  };

  const calculateMoneySaved = () => {
    if (!profile?.quit_date || !profile.cost_per_device || !profile.devices_per_week) {
      return 0;
    }

    const quitDate = new Date(profile.quit_date);
    const today = new Date();
    const daysSinceQuit = Math.floor((today.getTime() - quitDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceQuit < 0) return 0;

    const weeksSinceQuit = daysSinceQuit / 7;
    const devicesSaved = weeksSinceQuit * profile.devices_per_week;
    return devicesSaved * profile.cost_per_device;
  };

  const getHealthBenefits = () => {
    if (!profile?.quit_date) return [];

    const quitDate = new Date(profile.quit_date);
    const today = new Date();
    const hoursSinceQuit = (today.getTime() - quitDate.getTime()) / (1000 * 60 * 60);
    const daysSinceQuit = hoursSinceQuit / 24;

    const benefits = [];

    if (hoursSinceQuit >= 2) {
      benefits.push({ title: 'Nicotine levels dropping', description: 'Your body is starting to eliminate nicotine', icon: Zap });
    }
    if (hoursSinceQuit >= 8) {
      benefits.push({ title: 'Oxygen levels normalizing', description: 'Blood oxygen levels are improving', icon: Heart });
    }
    if (daysSinceQuit >= 1) {
      benefits.push({ title: 'Sense of taste improving', description: 'Your taste buds are recovering', icon: Sparkles });
    }
    if (daysSinceQuit >= 2) {
      benefits.push({ title: 'Breathing easier', description: 'Lung function is starting to improve', icon: Heart });
    }
    if (daysSinceQuit >= 7) {
      benefits.push({ title: 'Increased energy', description: 'Your body has adjusted to being nicotine-free', icon: TrendingUp });
    }
    if (daysSinceQuit >= 30) {
      benefits.push({ title: 'Reduced cravings', description: 'Physical addiction is diminishing', icon: Brain });
    }

    return benefits;
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user!.id,
          priceId: 'price_monthly',
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('No checkout URL returned');
        setUpgradeLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setUpgradeLoading(false);
    }
  };

  const generateInsights = async () => {
    const generatedInsights = [];

    const { data: puffsData } = await supabase
      .from('puffs')
      .select('*')
      .eq('user_id', user!.id)
      .order('recorded_at', { ascending: true });

    const { data: statsData } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: true });

    if (statsData && statsData.length >= 14) {
      const lastWeek = statsData.slice(-7);
      const previousWeek = statsData.slice(-14, -7);

      const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.count, 0) / 7;
      const prevWeekAvg = previousWeek.reduce((sum, day) => sum + day.count, 0) / 7;

      if (lastWeekAvg < prevWeekAvg) {
        const improvement = ((prevWeekAvg - lastWeekAvg) / prevWeekAvg * 100).toFixed(1);
        generatedInsights.push({
          type: 'progress',
          title: 'Great Progress!',
          message: `Your average daily count decreased by ${improvement}% this week (${lastWeekAvg.toFixed(1)} vs ${prevWeekAvg.toFixed(1)} last week). Keep it up!`,
        });
      } else if (lastWeekAvg > prevWeekAvg) {
        const increase = ((lastWeekAvg - prevWeekAvg) / prevWeekAvg * 100).toFixed(1);
        generatedInsights.push({
          type: 'warning',
          title: 'Trend Alert',
          message: `Your daily count increased by ${increase}% this week. Review your triggers and consider adjusting your strategy.`,
        });
      } else {
        generatedInsights.push({
          type: 'stable',
          title: 'Steady Progress',
          message: `Your usage has remained stable at ${lastWeekAvg.toFixed(1)} per day. Consider setting a new reduction goal.`,
        });
      }
    }

    if (cravings.length >= 5) {
      const cravingsByHour: { [key: number]: number } = {};
      const triggerCount: { [key: string]: number } = {};

      cravings.forEach(craving => {
        const hour = new Date(craving.recorded_at).getHours();
        cravingsByHour[hour] = (cravingsByHour[hour] || 0) + 1;

        if (craving.trigger && craving.trigger.trim()) {
          const trigger = craving.trigger.toLowerCase().trim();
          triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
        }
      });

      const peakHours = Object.entries(cravingsByHour)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([hour]) => parseInt(hour));

      if (peakHours.length > 0) {
        const timeOfDay = peakHours[0] < 12 ? 'morning' : peakHours[0] < 17 ? 'afternoon' : 'evening';
        generatedInsights.push({
          type: 'pattern',
          title: 'Craving Pattern Detected',
          message: `Most of your cravings occur in the ${timeOfDay} (around ${peakHours[0]}:00). Plan alternative activities during this time.`,
        });
      }

      const topTriggers = Object.entries(triggerCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2);

      if (topTriggers.length > 0) {
        const [topTrigger, count] = topTriggers[0];
        generatedInsights.push({
          type: 'trigger',
          title: 'Top Trigger Identified',
          message: `"${topTrigger}" is your most common trigger (${count} times). Consider developing coping strategies for this situation.`,
        });
      }

      const recentCravings = cravings.slice(0, 7);
      const avgIntensity = recentCravings.reduce((sum, c) => sum + c.intensity, 0) / recentCravings.length;

      if (avgIntensity < 5) {
        generatedInsights.push({
          type: 'success',
          title: 'Craving Intensity Decreasing',
          message: `Your average craving intensity is ${avgIntensity.toFixed(1)}/10. Your body is adapting well!`,
        });
      } else if (avgIntensity > 7) {
        generatedInsights.push({
          type: 'support',
          title: 'High Craving Intensity',
          message: `Your recent cravings average ${avgIntensity.toFixed(1)}/10. Consider reaching out to support resources or trying relaxation techniques.`,
        });
      }
    }

    if (puffsData && puffsData.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayPuffs = puffsData.filter(p =>
        p.recorded_at.startsWith(today)
      ).length;

      if (statsData && statsData.length >= 7) {
        const last7Days = statsData.slice(-7);
        const avg7Days = last7Days.reduce((sum, day) => sum + day.count, 0) / 7;

        if (todayPuffs < avg7Days * 0.7) {
          generatedInsights.push({
            type: 'achievement',
            title: 'Outstanding Day!',
            message: `You're at ${todayPuffs} today, well below your 7-day average of ${avg7Days.toFixed(1)}. Excellent self-control!`,
          });
        }
      }
    }

    if (profile?.quit_date) {
      const daysSinceQuit = Math.floor(
        (new Date().getTime() - new Date(profile.quit_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceQuit === 7) {
        generatedInsights.push({
          type: 'milestone',
          title: '1 Week Milestone!',
          message: 'Congratulations on one week! The hardest part is behind you. Your body is already healing.',
        });
      } else if (daysSinceQuit === 30) {
        generatedInsights.push({
          type: 'milestone',
          title: '1 Month Achievement!',
          message: 'Amazing! 30 days nicotine-free. Your lung function has improved by up to 30%.',
        });
      } else if (daysSinceQuit === 90) {
        generatedInsights.push({
          type: 'milestone',
          title: '3 Months Strong!',
          message: 'Incredible achievement! Your circulation and lung function continue to improve significantly.',
        });
      }
    }

    if (generatedInsights.length === 0) {
      generatedInsights.push({
        type: 'general',
        title: 'Getting Started',
        message: 'Keep logging your cravings and daily counts to receive personalized insights based on your patterns.',
      });
    }

    setInsights(generatedInsights);
  };

  const exportData = async () => {
    const { data: puffs } = await supabase
      .from('puffs')
      .select('*')
      .eq('user_id', user!.id)
      .order('recorded_at', { ascending: true });

    const { data: stats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: true });

    const exportData = {
      profile,
      puffs,
      stats,
      cravings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `puffcount-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const moneySaved = calculateMoneySaved();
  const healthBenefits = getHealthBenefits();

  if (!isPremium) {
    return (
      <div className="p-6">
        <PremiumGate feature="Premium Analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg h-32"></div>
              <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl p-6 text-white shadow-lg h-32"></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg h-64"></div>
            <div className="bg-white rounded-xl p-6 shadow-lg h-96"></div>
          </div>
        </PremiumGate>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ">Premium Analytics</h2>
          <p className="">Advanced insights and tracking</p>
        </div>
        <button
          onClick={exportData}
className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          <Download className="w-5 h-5" />
          <span>Export Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Money Saved</p>
              <p className="text-3xl font-bold">${moneySaved.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-sm opacity-80">
            {profile?.quit_date
              ? `Since ${new Date(profile.quit_date).toLocaleDateString()}`
              : 'Set your quit date to track savings'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Current Streak</p>
              <p className="text-3xl font-bold">{profile?.longest_streak || 0} days</p>
            </div>
          </div>
          <p className="text-sm opacity-80">Keep going strong!</p>
        </div>
      </div>

      {healthBenefits.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold ">Health Benefits Achieved</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Icon className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold ">{benefit.title}</p>
                    <p className="text-sm ">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-bold ">Craving Tracker</h3>
          </div>
          {isPremium && (
            <button
              onClick={() => setShowCravingForm(!showCravingForm)}
className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition text-sm"
            >
              Log Craving
            </button>
          )}
        </div>

        {showCravingForm && (
          <form onSubmit={addCraving} className="mb-6 p-4 bg-orange-50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity (1-10): {newCraving.intensity}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={newCraving.intensity}
                onChange={(e) => setNewCraving({ ...newCraving, intensity: parseInt(e.target.value) })}
className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trigger
              </label>
              <input
                type="text"
                value={newCraving.trigger}
                onChange={(e) => setNewCraving({ ...newCraving, trigger: e.target.value })}
className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                placeholder="e.g., stress, social situation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={newCraving.notes}
                onChange={(e) => setNewCraving({ ...newCraving, notes: e.target.value })}
className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="How did you handle it?"
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowCravingForm(false)}
className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {cravings.length > 0 ? (
          <div className="space-y-3">
            {cravings.map((craving) => (
              <div key={craving.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      craving.intensity >= 7 ? 'bg-red-500' :
                      craving.intensity >= 4 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}></div>
                    <span className="font-semibold ">
                      Intensity: {craving.intensity}/10
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(craving.recorded_at).toLocaleString()}
                  </span>
                </div>
                {craving.trigger && (
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Trigger:</span> {craving.trigger}
                  </p>
                )}
                {craving.notes && (
                  <p className="text-sm ">{craving.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No cravings logged yet. Track your cravings to identify patterns.
          </p>
        )}
      </div>

      <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-8 h-8" />
          <div>
            <h3 className="text-xl font-bold">Dynamic Insights</h3>
            <p className="text-sm opacity-90">AI-powered personalized analysis</p>
          </div>
        </div>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {insight.type === 'progress' && <TrendingUp className="w-5 h-5" />}
                    {insight.type === 'warning' && <AlertCircle className="w-5 h-5" />}
                    {insight.type === 'pattern' && <Brain className="w-5 h-5" />}
                    {insight.type === 'trigger' && <AlertCircle className="w-5 h-5" />}
                    {insight.type === 'success' && <Sparkles className="w-5 h-5" />}
                    {insight.type === 'achievement' && <Crown className="w-5 h-5" />}
                    {insight.type === 'milestone' && <Calendar className="w-5 h-5" />}
                    {insight.type === 'support' && <Heart className="w-5 h-5" />}
                    {insight.type === 'stable' && <TrendingUp className="w-5 h-5" />}
                    {insight.type === 'general' && <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{insight.title}</p>
                    <p className="text-sm opacity-90">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90">Analyzing your data to generate personalized insights...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
