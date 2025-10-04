import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Calendar, Target, Save } from 'lucide-react';

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    daily_limit: '',
    quit_goal_date: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        daily_limit: profile.daily_limit.toString(),
        quit_goal_date: profile.quit_goal_date || '',
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        daily_limit: parseInt(formData.daily_limit),
        quit_goal_date: formData.quit_goal_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) {
      console.error('Error updating profile:', error);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold ">Profile & Settings</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
          >
            Edit Profile
          </button>
        ) : (
          <button
            onClick={() => setEditing(false)}
className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold ">{profile.full_name || 'User'}</h3>
            <p className="">{profile.email}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Limit
              </label>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary-500" />
                <input
                  type="number"
                  value={formData.daily_limit}
                  onChange={(e) => setFormData({ ...formData, daily_limit: e.target.value })}
className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  required
                />
                <span className="">puffs per day</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Set your target maximum puffs per day to help track your progress
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quit Goal Date
              </label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                <input
                  type="date"
                  value={formData.quit_goal_date}
                  onChange={(e) => setFormData({ ...formData, quit_goal_date: e.target.value })}
className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Optional: Set a target date for when you want to quit completely
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-700 font-medium">Daily Limit</span>
                </div>
                <p className="text-2xl font-bold ">{profile.daily_limit} puffs</p>
                <p className="text-sm  mt-1">Your daily target</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Quit Goal Date</span>
                </div>
                <p className="text-2xl font-bold ">
                  {profile.quit_goal_date
                    ? new Date(profile.quit_goal_date).toLocaleDateString()
                    : 'Not set'}
                </p>
                <p className="text-sm  mt-1">Target quit date</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold  mb-2">Account Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="">Email:</span>
                  <span className=" font-medium">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="">Member since:</span>
                  <span className=" font-medium">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold  mb-4">About Ditch</h3>
        <p className=" mb-4">
          Ditch helps you track your vaping habits and work toward quitting. Monitor your daily
          usage, set goals, and visualize your progress over time.
        </p>
        <div className="space-y-2 text-sm ">
          <p>Track every puff with a simple tap</p>
          <p>View detailed statistics and trends</p>
          <p>Set daily limits and personal goals</p>
          <p>Monitor your progress toward quitting</p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold mb-6"
      >
        Sign Out
      </button>
    </div>
  );
}
