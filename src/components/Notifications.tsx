import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Notification, Achievement, UserProgress } from '../lib/supabase';
import {
  Bell,
  Award,
  Heart,
  TrendingUp,
  Flame,
  Star,
  CheckCircle,
  Trophy,
  Zap,
  Target,
  Calendar
} from 'lucide-react';

const HEALTH_BENEFITS = [
  { hours: 2, title: 'Nicotine Levels Dropping', message: 'Your body is starting to eliminate nicotine from your system.', icon: 'Zap' },
  { hours: 8, title: 'Oxygen Levels Normalizing', message: 'Blood oxygen levels are returning to normal, improving circulation.', icon: 'Heart' },
  { hours: 24, title: 'Carbon Monoxide Cleared', message: 'Carbon monoxide has been eliminated from your body.', icon: 'TrendingUp' },
  { hours: 48, title: 'Senses Improving', message: 'Your sense of taste and smell are starting to improve significantly.', icon: 'Star' },
  { hours: 72, title: 'Breathing Easier', message: 'Bronchial tubes are relaxing, making breathing easier. Energy levels increasing.', icon: 'Heart' },
  { days: 7, title: 'Week Milestone', message: 'One week nicotine-free! Physical addiction is subsiding.', icon: 'Trophy' },
  { days: 14, title: 'Two Weeks Clean', message: 'Circulation is improving. Lung function is increasing up to 30%.', icon: 'TrendingUp' },
  { days: 30, title: 'One Month Achievement', message: 'Coughing and shortness of breath are decreasing. Cilia in lungs are regenerating.', icon: 'Award' },
  { days: 90, title: 'Three Months Strong', message: 'Lung function has improved significantly. Risk of heart attack is dropping.', icon: 'Heart' },
  { days: 180, title: 'Six Months Milestone', message: 'Your body has healed significantly. Cravings are rare and manageable.', icon: 'Trophy' },
  { days: 365, title: 'One Year Celebration', message: 'Risk of heart disease is now half that of a smoker. Incredible achievement!', icon: 'Star' },
];

const DAILY_MOTIVATIONS = [
  'Every day without vaping is a victory for your health.',
  'Your lungs are thanking you right now.',
  'You\'re stronger than your cravings.',
  'Each smoke-free day adds time to your life.',
  'Your body is healing with every passing hour.',
  'You\'ve already come so far. Keep going!',
  'Breaking free from nicotine is one of the best gifts you can give yourself.',
  'Your future self will thank you for this decision.',
  'Every craving you overcome makes you stronger.',
  'You\'re not giving up something, you\'re gaining freedom.',
  'Your health improvements are happening right now, even if you can\'t see them.',
  'You\'re proving to yourself that you can do hard things.',
];

const ACHIEVEMENT_DEFINITIONS = [
  { type: 'first_day', title: 'First 24 Hours', description: 'Completed your first day without vaping', icon: '🌟', days: 1 },
  { type: 'three_days', title: 'Three Day Warrior', description: 'Made it through the hardest three days', icon: '💪', days: 3 },
  { type: 'one_week', title: 'Week Champion', description: 'Seven days of freedom', icon: '🏆', days: 7 },
  { type: 'two_weeks', title: 'Fortnight Victor', description: 'Two weeks of strength', icon: '⚡', days: 14 },
  { type: 'one_month', title: 'Monthly Master', description: 'One full month nicotine-free', icon: '🎖️', days: 30 },
  { type: 'three_months', title: 'Quarterly Hero', description: 'Three months of dedication', icon: '🌟', days: 90 },
  { type: 'six_months', title: 'Half-Year Legend', description: 'Six months of transformation', icon: '👑', days: 180 },
  { type: 'one_year', title: 'Annual Champion', description: 'One full year of freedom', icon: '🏅', days: 365 },
];

export default function Notifications() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notifications' | 'achievements'>('notifications');

  useEffect(() => {
    if (user) {
      fetchData();
      checkAndCreateNotifications();
    }
  }, [user]);

  const fetchData = async () => {
    const [notifResult, achieveResult, progressResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user!.id)
        .order('unlocked_at', { ascending: false }),
      supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle(),
    ]);

    if (notifResult.data) setNotifications(notifResult.data);
    if (achieveResult.data) setAchievements(achieveResult.data);
    if (progressResult.data) {
      setProgress(progressResult.data);
    } else {
      await initializeProgress();
    }
    setLoading(false);
  };

  const initializeProgress = async () => {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: user!.id,
        days_smoke_free: 0,
        total_puffs_avoided: 0,
        current_streak: 0,
      })
      .select()
      .single();

    if (data) setProgress(data);
  };

  const checkAndCreateNotifications = async () => {
    if (!profile?.quit_date) return;

    const quitDate = new Date(profile.quit_date);
    const now = new Date();
    const hoursSinceQuit = (now.getTime() - quitDate.getTime()) / (1000 * 60 * 60);
    const daysSinceQuit = Math.floor(hoursSinceQuit / 24);

    for (const benefit of HEALTH_BENEFITS) {
      const hours = benefit.hours || (benefit.days || 0) * 24;

      if (hoursSinceQuit >= hours) {
        const exists = notifications.some(n => n.title === benefit.title);

        if (!exists) {
          await supabase.from('notifications').insert({
            user_id: user!.id,
            type: 'health_benefit',
            title: benefit.title,
            message: benefit.message,
          });
        }
      }
    }

    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      if (daysSinceQuit >= achievement.days) {
        const exists = achievements.some(a => a.achievement_type === achievement.type);

        if (!exists) {
          await supabase.from('achievements').insert({
            user_id: user!.id,
            achievement_type: achievement.type,
            title: achievement.title,
            description: achievement.description,
            badge_icon: achievement.icon,
          });

          await supabase.from('notifications').insert({
            user_id: user!.id,
            type: 'achievement',
            title: `🎉 Achievement Unlocked: ${achievement.title}`,
            message: achievement.description,
          });
        }
      }
    }

    const motivation = DAILY_MOTIVATIONS[Math.floor(Math.random() * DAILY_MOTIVATIONS.length)];
    const hasMotivationToday = notifications.some(
      n => n.type === 'motivation' &&
      new Date(n.created_at).toDateString() === new Date().toDateString()
    );

    if (!hasMotivationToday && daysSinceQuit >= 0) {
      await supabase.from('notifications').insert({
        user_id: user!.id,
        type: 'motivation',
        title: '💪 Daily Motivation',
        message: motivation,
      });
    }

    fetchData();
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user!.id)
      .eq('is_read', false);

    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'health_benefit': return Heart;
      case 'achievement': return Award;
      case 'motivation': return Zap;
      case 'milestone': return Trophy;
      default: return Bell;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold ">Notifications & Achievements</h2>
          <p className="">Track your progress and celebrate victories</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {profile?.quit_date && progress && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Calendar className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Days Smoke-Free</p>
                <p className="text-3xl font-bold">
                  {Math.floor((new Date().getTime() - new Date(profile.quit_date).getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Flame className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Current Streak</p>
                <p className="text-3xl font-bold">{progress.current_streak}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Achievements</p>
                <p className="text-3xl font-bold">{achievements.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === 'notifications'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex-1 px-6 py-4 text-center font-medium transition ${
                activeTab === 'achievements'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Achievements</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'notifications' ? (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Set your quit date to start receiving health benefit updates
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => !notification.is_read && markAsRead(notification.id)}
                      className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                        notification.is_read
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-primary-200 bg-primary-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === 'health_benefit' ? 'bg-green-100' :
                          notification.type === 'achievement' ? 'bg-yellow-100' :
                          notification.type === 'motivation' ? 'bg-primary-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            notification.type === 'health_benefit' ? 'text-green-600' :
                            notification.type === 'achievement' ? 'text-yellow-600' :
                            notification.type === 'motivation' ? 'text-primary-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold ">{notification.title}</h3>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No achievements unlocked yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Keep going smoke-free to unlock amazing achievements
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
className="p-6 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-md"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-5xl">{achievement.badge_icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold  mb-1">{achievement.title}</h3>
                          <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
                          <p className="text-xs text-gray-500">
                            Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {achievements.length > 0 && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <h3 className="font-bold  mb-4">Upcoming Achievements</h3>
                  <div className="space-y-3">
                    {ACHIEVEMENT_DEFINITIONS.filter(
                      def => !achievements.some(a => a.achievement_type === def.type)
                    ).slice(0, 3).map((achievement) => (
                      <div key={achievement.type} className="flex items-center space-x-3 opacity-60">
                        <div className="text-3xl grayscale">{achievement.icon}</div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-700">{achievement.title}</p>
                          <p className="text-sm ">{achievement.description}</p>
                        </div>
                        <Target className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
