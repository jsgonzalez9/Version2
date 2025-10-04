import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, DailyStat } from '../lib/supabase';
import { Calendar, BarChart3, TrendingDown } from 'lucide-react';

type Period = 'week' | 'month' | 'all';

export default function Statistics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, period]);

  const fetchStats = async () => {
    setLoading(true);

    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', user!.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
      return;
    }

    setStats(data || []);
    setLoading(false);
  };

  const totalPuffs = stats.reduce((sum, stat) => sum + stat.total_puffs, 0);
  const averagePuffs = stats.length > 0 ? Math.round(totalPuffs / stats.length) : 0;
  const maxPuffs = stats.length > 0 ? Math.max(...stats.map(s => s.total_puffs)) : 0;
  const minPuffs = stats.length > 0 ? Math.min(...stats.map(s => s.total_puffs)) : 0;

  const getChartHeight = (value: number) => {
    if (maxPuffs === 0) return 0;
    return (value / maxPuffs) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistics</h2>
        <div className="flex space-x-2 bg-white rounded-lg shadow p-1">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              period === 'week'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              period === 'month'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              period === 'all'
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-2.5">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <span className=" font-medium">Total</span>
          </div>
          <p className="text-3xl font-bold ">{totalPuffs}</p>
          <p className="text-sm text-gray-500 mt-1">puffs</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
            <span className=" font-medium">Average</span>
          </div>
          <p className="text-3xl font-bold ">{averagePuffs}</p>
          <p className="text-sm text-gray-500 mt-1">per day</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-red-600" />
            </div>
            <span className=" font-medium">Peak</span>
          </div>
          <p className="text-3xl font-bold ">{maxPuffs}</p>
          <p className="text-sm text-gray-500 mt-1">highest day</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary-600" />
            </div>
            <span className=" font-medium">Best</span>
          </div>
          <p className="text-3xl font-bold ">{minPuffs}</p>
          <p className="text-sm text-gray-500 mt-1">lowest day</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-6">Daily Breakdown</h3>
        {stats.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>No data available for this period</p>
            <p className="text-sm mt-2">Start tracking to see your statistics</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end justify-between h-64 space-x-2">
              {stats.map((stat, index) => (
                <div key={stat.id} className="flex-1 flex flex-col items-center">
                  <div
className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-cyan-500 relative group"
                    style={{ height: `${getChartHeight(stat.total_puffs)}%`, minHeight: stat.total_puffs > 0 ? '4px' : '0' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.total_puffs}
                    </div>
                  </div>
                  <div className="mt-2 text-xs  text-center">
                    {new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Puffs</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">vs Average</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.slice().reverse().map((stat) => {
                    const diff = stat.total_puffs - averagePuffs;
                    const percentage = averagePuffs > 0 ? Math.round((diff / averagePuffs) * 100) : 0;
                    return (
                      <tr key={stat.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 ">
                          {new Date(stat.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold ">
                          {stat.total_puffs}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {diff > 0 ? '+' : ''}{percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
