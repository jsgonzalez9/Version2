import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChevronRight, Check, Bell, Crown, Sparkles, TrendingUp, Brain, DollarSign } from 'lucide-react';

type Step =
  | 'splash'
  | 'fact-1'
  | 'fact-2'
  | 'fact-3'
  | 'welcome'
  | 'name'
  | 'gender'
  | 'age'
  | 'goal'
  | 'current-usage'
  | 'quit-status'
  | 'why-quit'
  | 'biggest-challenge'
  | 'support-level'
  | 'financial'
  | 'daily-limit'
  | 'notifications'
  | 'complete'
  | 'premium-splash';

export default function Onboarding() {
  const { user, refreshProfile, profile } = useAuth();
  const [step, setStep] = useState<Step>('splash');
  const [loading, setLoading] = useState(false);


  const [formData, setFormData] = useState({
    displayName: '',
    gender: '',
    ageRange: '',
    goal: '',
    currentDailyPuffs: '',
    quitStatus: '',
    whyQuit: '',
    biggestChallenge: '',
    supportLevel: '',
    costPerDevice: '',
    devicesPerWeek: '',
    dailyLimit: '',
    notificationsEnabled: false,
  });

  const goals = [
    { label: 'Quit completely', value: 'quit' },
    { label: 'Reduce gradually', value: 'reduce' },
    { label: 'Track my usage', value: 'track' },
  ];

  const quitStatuses = [
    { label: "I haven't started yet", value: 'not-started' },
    { label: "I've already quit", value: 'quit' },
    { label: "I'm actively reducing", value: 'reducing' },
  ];

  const whyQuitOptions = [
    { label: 'Health concerns', value: 'health' },
    { label: 'Save money', value: 'money' },
    { label: 'For my family', value: 'family' },
    { label: 'Feel better', value: 'wellness' },
  ];

  const challengeOptions = [
    { label: 'Social situations', value: 'social' },
    { label: 'Stress & anxiety', value: 'stress' },
    { label: 'Cravings', value: 'cravings' },
    { label: 'Habit & routine', value: 'habit' },
  ];

  const supportLevels = [
    { label: 'Very supported', value: 'high' },
    { label: 'Somewhat supported', value: 'medium' },
    { label: 'On my own', value: 'low' },
  ];

  const calculateRecommendedLimit = () => {
    const current = parseInt(formData.currentDailyPuffs);
    if (isNaN(current)) return 50;
    return Math.max(Math.floor(current * 0.75), 5);
  };

  const handleComplete = async () => {
    setLoading(true);

    const recommendedLimit = formData.dailyLimit
      ? parseInt(formData.dailyLimit)
      : calculateRecommendedLimit();

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.displayName || null,
        gender: formData.gender || null,
        age_range: formData.ageRange || null,
        onboarding_completed: true,
        current_daily_puffs: parseInt(formData.currentDailyPuffs) || 0,
        daily_limit: recommendedLimit,
        motivation: formData.whyQuit || null,
        biggest_challenge: formData.biggestChallenge || null,
        support_system: formData.supportLevel || null,
        cost_per_device: parseFloat(formData.costPerDevice) || null,
        devices_per_week: parseFloat(formData.devicesPerWeek) || null,
        quit_date: formData.quitStatus === 'quit' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
      return;
    }

    if (formData.goal) {
      await supabase.from('goals').insert({
        user_id: user!.id,
        title: formData.goal === 'quit' ? 'Quit completely' : formData.goal === 'reduce' ? 'Reduce usage' : 'Track my progress',
        target_puffs: recommendedLimit,
      });
    }

    await refreshProfile();
    setLoading(false);

    setTimeout(() => {
      setStep('premium-splash');
    }, 2000);
  };

  const getStepNumber = (): number => {
    const dataSteps: Step[] = ['name', 'gender', 'age', 'goal', 'current-usage', 'quit-status', 'why-quit', 'biggest-challenge', 'support-level', 'financial', 'daily-limit', 'notifications'];
    return dataSteps.indexOf(step) + 1;
  };

  const totalSteps = 12;
  const progress = (getStepNumber() / totalSteps) * 100;

  const OptionButton = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-2xl border-2 text-left font-medium text-lg transition-all ${
        selected
          ? 'border-primary-600 bg-primary-600 text-white shadow-lg'
          : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{label}</span>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-600" />
          </div>
        )}
      </div>
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 'splash':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="text-center space-y-12 animate-fade-in">
              <img
                src="/logo-wordmark.svg"
                alt="Ditch"
className="w-full max-w-lg mx-auto transition-transform duration-300 hover:scale-105"
              />
              <button
                onClick={() => setStep('fact-1')}
className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-12 py-5 rounded-full font-bold text-xl hover:from-primary-600 hover:to-secondary-600 hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Start
              </button>
            </div>
          </div>
        );

      case 'fact-1':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center space-y-12">
              <div className="space-y-6">
                <div className="text-7xl font-bold ">72 hours</div>
                <p className="text-3xl font-medium leading-relaxed text-gray-700">
                  That's all it takes for your body to start recovering after you quit vaping
                </p>
              </div>
              <button
                onClick={() => setStep('fact-2')}
className="mx-auto w-16 h-16 rounded-full bg-primary-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) flex items-center justify-center"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        );

      case 'fact-2':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center space-y-12">
              <div className="space-y-6">
                <div className="text-7xl font-bold ">$1,500+</div>
                <p className="text-3xl font-medium leading-relaxed text-gray-700">
                  Average amount saved per year by people who quit vaping
                </p>
              </div>
              <button
                onClick={() => setStep('fact-3')}
className="mx-auto w-16 h-16 rounded-full bg-primary-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) flex items-center justify-center"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        );

      case 'fact-3':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center space-y-12">
              <div className="space-y-6">
                <div className="text-7xl font-bold ">3x</div>
                <p className="text-3xl font-medium leading-relaxed text-gray-700">
                  You're 3 times more likely to succeed with a structured plan and tracking
                </p>
              </div>
              <button
                onClick={() => setStep('welcome')}
className="mx-auto w-16 h-16 rounded-full bg-primary-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1) flex items-center justify-center"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        );

      case 'welcome':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight ">Welcome to Ditch</h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Your personal journey to a healthier, vape-free life starts here.
                </p>
              </div>
              <button
                onClick={() => setStep('name')}
className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1)"
              >
                Get Started
              </button>
              <p className=" text-sm">Takes 2 minutes</p>
            </div>
          </div>
        );

      case 'name':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">What should we call you?</h2>
              <p className="text-xl ">This helps personalize your experience</p>
            </div>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Enter your name"
className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-600 focus:ring-0 text-xl placeholder:text-gray-400 transition"
              autoFocus
            />
            <button
              onClick={() => setStep('gender')}
              disabled={!formData.displayName.trim()}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'gender':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">What's your gender?</h2>
              <p className="text-xl ">This helps us personalize your journey</p>
            </div>
            <div className="space-y-4">
              <OptionButton
                label="Male"
                selected={formData.gender === 'male'}
                onClick={() => setFormData({ ...formData, gender: 'male' })}
              />
              <OptionButton
                label="Female"
                selected={formData.gender === 'female'}
                onClick={() => setFormData({ ...formData, gender: 'female' })}
              />
              <OptionButton
                label="Non-binary"
                selected={formData.gender === 'non-binary'}
                onClick={() => setFormData({ ...formData, gender: 'non-binary' })}
              />
              <OptionButton
                label="Prefer not to say"
                selected={formData.gender === 'prefer-not-to-say'}
                onClick={() => setFormData({ ...formData, gender: 'prefer-not-to-say' })}
              />
            </div>
            <button
              onClick={() => setStep('age')}
              disabled={!formData.gender}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'age':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">What's your age range?</h2>
              <p className="text-xl ">This helps us understand your needs better</p>
            </div>
            <div className="space-y-4">
              <OptionButton
                label="18-24"
                selected={formData.ageRange === '18-24'}
                onClick={() => setFormData({ ...formData, ageRange: '18-24' })}
              />
              <OptionButton
                label="25-34"
                selected={formData.ageRange === '25-34'}
                onClick={() => setFormData({ ...formData, ageRange: '25-34' })}
              />
              <OptionButton
                label="35-44"
                selected={formData.ageRange === '35-44'}
                onClick={() => setFormData({ ...formData, ageRange: '35-44' })}
              />
              <OptionButton
                label="45-54"
                selected={formData.ageRange === '45-54'}
                onClick={() => setFormData({ ...formData, ageRange: '45-54' })}
              />
              <OptionButton
                label="55+"
                selected={formData.ageRange === '55+'}
                onClick={() => setFormData({ ...formData, ageRange: '55+' })}
              />
            </div>
            <button
              onClick={() => setStep('goal')}
              disabled={!formData.ageRange}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'goal':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">What's your main goal?</h2>
              <p className="text-xl ">Choose the one that resonates most</p>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <OptionButton
                  key={goal.value}
                  label={goal.label}
                  selected={formData.goal === goal.value}
                  onClick={() => {
                    setFormData({ ...formData, goal: goal.value });
                    setTimeout(() => setStep('current-usage'), 300);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'current-usage':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">How many puffs per day?</h2>
              <p className="text-xl ">Your current typical usage</p>
            </div>
            <div className="relative">
              <input
                type="number"
                value={formData.currentDailyPuffs}
                onChange={(e) => setFormData({ ...formData, currentDailyPuffs: e.target.value })}
                placeholder="0"
className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-600 focus:ring-0 text-5xl font-bold text-center placeholder:text-gray-300 transition"
                min="0"
              />
              <p className="text-center text-gray-500 mt-4">Just an estimate is fine</p>
            </div>
            <button
              onClick={() => setStep('quit-status')}
              disabled={!formData.currentDailyPuffs || parseInt(formData.currentDailyPuffs) <= 0}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'quit-status':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Where are you now?</h2>
              <p className="text-xl ">Your current status</p>
            </div>
            <div className="space-y-3">
              {quitStatuses.map((status) => (
                <OptionButton
                  key={status.value}
                  label={status.label}
                  selected={formData.quitStatus === status.value}
                  onClick={() => {
                    setFormData({ ...formData, quitStatus: status.value });
                    setTimeout(() => setStep('why-quit'), 300);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'why-quit':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Why quit?</h2>
              <p className="text-xl ">Your main motivation</p>
            </div>
            <div className="space-y-3">
              {whyQuitOptions.map((option) => (
                <OptionButton
                  key={option.value}
                  label={option.label}
                  selected={formData.whyQuit === option.value}
                  onClick={() => {
                    setFormData({ ...formData, whyQuit: option.value });
                    setTimeout(() => setStep('biggest-challenge'), 300);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'biggest-challenge':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Your biggest challenge?</h2>
              <p className="text-xl ">What makes it hardest for you?</p>
            </div>
            <div className="space-y-3">
              {challengeOptions.map((challenge) => (
                <OptionButton
                  key={challenge.value}
                  label={challenge.label}
                  selected={formData.biggestChallenge === challenge.value}
                  onClick={() => {
                    setFormData({ ...formData, biggestChallenge: challenge.value });
                    setTimeout(() => setStep('support-level'), 300);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'support-level':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">How supported do you feel?</h2>
              <p className="text-xl ">By friends, family, or community</p>
            </div>
            <div className="space-y-3">
              {supportLevels.map((level) => (
                <OptionButton
                  key={level.value}
                  label={level.label}
                  selected={formData.supportLevel === level.value}
                  onClick={() => {
                    setFormData({ ...formData, supportLevel: level.value });
                    setTimeout(() => setStep('financial'), 300);
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Let's calculate your savings</h2>
              <p className="text-xl ">How much do you spend on vaping?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cost per device
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPerDevice}
                    onChange={(e) => setFormData({ ...formData, costPerDevice: e.target.value })}
                    placeholder="25"
className="w-full pl-14 pr-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-600 focus:ring-0 text-3xl font-bold placeholder:text-gray-300 transition"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Devices per week
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.devicesPerWeek}
                  onChange={(e) => setFormData({ ...formData, devicesPerWeek: e.target.value })}
                  placeholder="2"
className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-600 focus:ring-0 text-3xl font-bold text-center placeholder:text-gray-300 transition"
                  min="0"
                />
              </div>
              {formData.costPerDevice && formData.devicesPerWeek && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <p className="text-sm font-semibold text-green-800 mb-1">Monthly savings potential</p>
                  <p className="text-5xl font-bold text-green-900">
                    ${((parseFloat(formData.costPerDevice) * parseFloat(formData.devicesPerWeek) * 52) / 12).toFixed(0)}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={() => setStep('daily-limit')}
              disabled={!formData.costPerDevice || !formData.devicesPerWeek}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'daily-limit':
        const recommended = calculateRecommendedLimit();
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Set your daily limit</h2>
              <p className="text-xl ">We recommend starting with a 25% reduction</p>
            </div>
            <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-8 text-center">
              <p className="text-sm font-semibold text-primary-800 mb-2">Recommended limit</p>
              <p className="text-7xl font-bold text-primary-900 mb-2">{recommended}</p>
              <p className="text-lg text-primary-700">puffs per day</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
                Or set your own limit
              </label>
              <input
                type="number"
                value={formData.dailyLimit}
                onChange={(e) => setFormData({ ...formData, dailyLimit: e.target.value })}
                placeholder={recommended.toString()}
className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-primary-600 focus:ring-0 text-4xl font-bold text-center placeholder:text-gray-300 transition"
                min="0"
              />
            </div>
            <button
              onClick={() => setStep('notifications')}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-4xl font-bold ">Stay on track</h2>
              <p className="text-xl ">Enable notifications for daily reminders and motivation</p>
            </div>
            <div className="bg-primary-50 border-2 border-primary-200 rounded-2xl p-8 text-center">
              <Bell className="w-20 h-20 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold  mb-3">Get gentle reminders</h3>
              <ul className="text-left space-y-3 max-w-md mx-auto">
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Daily check-ins to log your progress</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Milestone celebrations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Check className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Encouragement when you need it</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, notificationsEnabled: true });
                  handleComplete();
                  setStep('complete');
                }}
                disabled={loading}
className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:bg-primary-700 transition disabled:opacity-40"
              >
                {loading ? 'Setting up...' : 'Enable Notifications'}
              </button>
              <button
                onClick={() => {
                  handleComplete();
                  setStep('complete');
                }}
                disabled={loading}
className="w-full  py-4 px-8 rounded-2xl font-semibold hover:bg-gray-100 transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full text-center space-y-8">
              <div className="w-24 h-24 rounded-full bg-primary-500 flex items-center justify-center mx-auto">
                <Check className="w-16 h-16 text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight ">All set, {formData.displayName}!</h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Setting up your personalized experience...
                </p>
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            </div>
          </div>
        );

      case 'premium-splash':
        return (
          <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl">
                  <Crown className="w-14 h-14 text-white" />
                </div>
                <h1 className="text-5xl font-bold tracking-tight ">Unlock Premium</h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Get the most out of your journey with advanced features
                </p>
              </div>

              <div className="bg-slate-800 rounded-3xl p-8 space-y-6 border border-slate-700 hover:-translate-y-2 hover:border-primary-500 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1)">
                <div className="grid gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-white">AI-Powered Insights</h3>
                      <p className="text-gray-300">Personalized recommendations based on your patterns and behavior</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-white">Savings Tracker</h3>
                      <p className="text-gray-300">See exactly how much money you're saving in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-white">Craving Analysis</h3>
                      <p className="text-gray-300">Identify triggers and patterns to overcome challenges</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-7 h-7 text-primary-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-white">Advanced Analytics</h3>
                      <p className="text-gray-300">Deep insights into your progress with detailed charts</p>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-500/10 rounded-2xl p-6 text-center border border-primary-500/20">
                  <p className="text-sm text-gray-400 mb-2">Special Launch Offer</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-6xl font-bold text-white">$2.99</span>
                    <span className="text-2xl ml-2 text-gray-300">/month</span>
                  </div>
                  <p className="text-sm text-gray-400">Cancel anytime • 7-day money-back guarantee</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await refreshProfile();
                    window.location.reload();
                  }}
className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(6,182,212,0.2)] transition-all duration-[400ms] cubic-bezier(0.4,0,0.2,1)"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  if (step === 'splash' || step === 'fact-1' || step === 'fact-2' || step === 'fact-3' || step === 'welcome' || step === 'complete' || step === 'premium-splash') {
    return renderStep();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                const steps: Step[] = ['name', 'gender', 'age', 'goal', 'current-usage', 'quit-status', 'why-quit', 'biggest-challenge', 'support-level', 'financial', 'daily-limit', 'notifications'];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) {
                  setStep(steps[currentIndex - 1]);
                }
              }}
className="text-gray-600 hover: font-medium"
            >
              ← Back
            </button>
            <span className="text-sm font-semibold ">
              {getStepNumber()} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
className="bg-primary-600 h-2 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">{renderStep()}</div>
      </div>
    </div>
  );
}
