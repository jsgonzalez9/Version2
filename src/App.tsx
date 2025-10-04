import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SubscriptionProvider, useSubscription } from './contexts/SubscriptionContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Counter from './components/Counter';
import Statistics from './components/Statistics';
import Goals from './components/Goals';
import Profile from './components/Profile';
import Premium from './components/Premium';
import Upgrade from './components/Upgrade';
import Notifications from './components/Notifications';
import { BarChart3, Target, User, Activity, Crown, Sparkles, Bell } from 'lucide-react';
import { PremiumBadge } from './components/PremiumGate';
import { supabase } from './lib/supabase';

type Tab = 'counter' | 'stats' | 'goals' | 'notifications' | 'premium' | 'profile' | 'upgrade';

function MainApp() {
  const { user, profile, loading } = useAuth();
  const { isPremium } = useSubscription();
  const { isDayTime } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('counter');
  const [unreadCount, setUnreadCount] = useState(0);
  const [headerCompact, setHeaderCompact] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  useEffect(() => {
    const handleNavigateToUpgrade = () => {
      setActiveTab('upgrade');
    };

    window.addEventListener('navigate-to-upgrade', handleNavigateToUpgrade);
    return () => window.removeEventListener('navigate-to-upgrade', handleNavigateToUpgrade);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user && profile?.onboarding_completed) {
      const timer1 = setTimeout(() => setHeaderCompact(true), 2000);
      const timer2 = setTimeout(() => setShowHeader(false), 3000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [user, profile]);

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);

    setUnreadCount(count || 0);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${
        isDayTime ? 'bg-gradient-to-br from-cyan-50 to-teal-50' : 'bg-slate-950'
      }`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!profile?.onboarding_completed) {
    return <Onboarding />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDayTime ? 'bg-gradient-to-br from-cyan-50 to-teal-50' : 'bg-slate-950'
    }`}>
      <div className="max-w-7xl mx-auto">
        <header className={`shadow-md sticky top-0 z-10 transition-all duration-1000 ease-in-out ${
          isDayTime ? 'bg-white' : 'bg-slate-800 border-b border-slate-700'
        } ${
          showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className={`px-6 transition-all duration-1000 ${
            headerCompact ? 'py-2' : 'py-4'
          }`}>
            <div className="flex items-center justify-center">
              <img
                src="/logo-wordmark.svg"
                alt="Ditch"
                className={`object-contain transition-all duration-1000 ${
                  headerCompact ? 'h-[60px] w-[60px]' : 'h-[125px] w-[125px]'
                }`}
              />
            </div>
            <div className={`flex items-center justify-between transition-all duration-1000 ${
              headerCompact ? 'mt-2' : 'mt-4'
            }`}>
              <nav className="hidden md:flex space-x-1 mx-auto">
                <button
                  onClick={() => setActiveTab('counter')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'counter'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span>Counter</span>
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'stats'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Statistics</span>
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'goals'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span>Goals</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('notifications');
                    setUnreadCount(0);
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'notifications'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  } relative`}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('premium')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'premium'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  } relative`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Premium</span>
                  {!isPremium && (
                    <span className="absolute -top-1 -right-1">
                      <PremiumBadge />
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg'
                      : isDayTime
                      ? 'text-gray-600 hover:bg-cyan-50 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                      : 'text-slate-400 hover:bg-slate-700 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
              </nav>
            </div>
          </div>
        </header>

        <main className="py-8 min-h-[calc(100vh-88px)]">
          {activeTab === 'counter' && <Counter />}
          {activeTab === 'stats' && <Statistics />}
          {activeTab === 'goals' && <Goals />}
          {activeTab === 'notifications' && <Notifications />}
          {activeTab === 'premium' && <Premium />}
          {activeTab === 'upgrade' && <Upgrade />}
          {activeTab === 'profile' && <Profile />}
        </main>

        <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg ${
          isDayTime ? 'bg-white' : 'bg-slate-800 border-slate-700'
        }`}>
          <div className="grid grid-cols-6">
            <button
              onClick={() => setActiveTab('counter')}
              className={`flex flex-col items-center py-3 transition ${
                activeTab === 'counter' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <Activity className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Counter</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center py-3 transition ${
                activeTab === 'stats' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <BarChart3 className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Stats</span>
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex flex-col items-center py-3 transition ${
                activeTab === 'goals' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <Target className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Goals</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('notifications');
                setUnreadCount(0);
              }}
              className={`flex flex-col items-center py-3 transition relative ${
                activeTab === 'notifications' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <Bell className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`flex flex-col items-center py-3 transition relative ${
                activeTab === 'premium' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <Sparkles className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Premium</span>
              {!isPremium && (
                <span className="absolute top-1 right-2">
                  <Crown className="w-3 h-3 text-orange-500" />
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center py-3 transition ${
                activeTab === 'profile' ? 'text-cyan-500' : isDayTime ? 'text-gray-600' : 'text-slate-400'
              }`}
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <MainApp />
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
