import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Goal } from '../lib/supabase';
import { Target, Plus, Check, Trash2 } from 'lucide-react';

export default function Goals() {
  const { user, profile, refreshProfile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [updateDailyLimit, setUpdateDailyLimit] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_puffs: '',
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetPuffs = parseInt(newGoal.target_puffs);

    const { error } = await supabase
      .from('goals')
      .insert({
        user_id: user!.id,
        title: newGoal.title,
        description: newGoal.description,
        target_puffs: targetPuffs,
      });

    if (error) {
      console.error('Error adding goal:', error);
      return;
    }

    if (updateDailyLimit) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          daily_limit: targetPuffs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (profileError) {
        console.error('Error updating daily limit:', profileError);
      } else {
        await refreshProfile();
      }
    }

    setNewGoal({ title: '', description: '', target_puffs: '' });
    setUpdateDailyLimit(false);
    setShowAddForm(false);
    fetchGoals();
  };

  const toggleGoalComplete = async (goal: Goal) => {
    const { error } = await supabase
      .from('goals')
      .update({
        is_completed: !goal.is_completed,
        completed_at: !goal.is_completed ? new Date().toISOString() : null,
      })
      .eq('id', goal.id);

    if (error) {
      console.error('Error updating goal:', error);
      return;
    }

    fetchGoals();
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('Error deleting goal:', error);
      return;
    }

    fetchGoals();
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
        <h2 className="text-2xl font-bold ">Goals</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Goal</span>
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold  mb-4">Create New Goal</h3>
          <form onSubmit={addGoal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Stay under 30 puffs per day"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Optional: Add more details about your goal"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Daily Puffs
              </label>
              <input
                type="number"
                value={newGoal.target_puffs}
                onChange={(e) => setNewGoal({ ...newGoal, target_puffs: e.target.value })}
className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 30"
                required
                min="0"
              />
            </div>

            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={updateDailyLimit}
                  onChange={(e) => setUpdateDailyLimit(e.target.checked)}
className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <span className="font-medium  block">Update my dashboard to this goal</span>
                  <span className="text-sm ">
                    This will adjust your daily limit on the counter dashboard to match this goal
                    {profile && newGoal.target_puffs && (
                      <span className="font-medium"> ({profile.daily_limit} → {newGoal.target_puffs} puffs)</span>
                    )}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
className="flex-1 bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition"
              >
                Create Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-lg text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold  mb-2">No Goals Yet</h3>
            <p className=" mb-6">
              Set goals to help track your progress toward quitting
            </p>
            <button
              onClick={() => setShowAddForm(true)}
className="bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className={`bg-white rounded-xl p-6 shadow-lg transition-all ${
                  goal.is_completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleGoalComplete(goal)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        goal.is_completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {goal.is_completed && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          goal.is_completed ? 'text-gray-500 line-through' : 'text-gray-800'
                        }`}
                      >
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className=" text-sm mt-1">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
className="text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-primary-500" />
                    <span className="text-gray-700 font-medium">
                      Target: {goal.target_puffs} puffs/day
                    </span>
                  </div>
                  {goal.is_completed && goal.completed_at && (
                    <span className="text-xs text-green-600 font-medium">
                      Completed {new Date(goal.completed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
