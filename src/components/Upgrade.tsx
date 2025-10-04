import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  Check,
  Crown,
  TrendingUp,
  Brain,
  Download,
  Heart,
  DollarSign,
  AlertCircle,
  Zap
} from 'lucide-react';

export default function Upgrade() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
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
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-8 text-white text-center shadow-xl">
          <Crown className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">You're a Premium Member!</h2>
          <p className="text-lg opacity-90">
            Thank you for supporting Ditch. Enjoy all premium features!
          </p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations based on your usage patterns',
    },
    {
      icon: TrendingUp,
      title: 'Advanced Analytics',
      description: 'Detailed charts and trend analysis of your progress',
    },
    {
      icon: DollarSign,
      title: 'Money Saved Tracker',
      description: 'Calculate exactly how much money you\'ve saved by quitting',
    },
    {
      icon: Heart,
      title: 'Health Benefits Timeline',
      description: 'Track your health improvements day by day',
    },
    {
      icon: AlertCircle,
      title: 'Craving Logger',
      description: 'Log and analyze your cravings to identify triggers',
    },
    {
      icon: Zap,
      title: 'Streak Tracking',
      description: 'Monitor your longest streaks and maintain motivation',
    },
    {
      icon: Download,
      title: 'Data Export',
      description: 'Export all your data anytime in JSON format',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold  mb-3">Upgrade to Premium</h1>
        <p className="text-xl ">
          Unlock powerful features to accelerate your journey to quit vaping
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 text-white text-center">
            <p className="text-lg mb-2 opacity-90">Premium Plan</p>
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-6xl font-bold">$9.99</span>
              <span className="text-2xl ml-2">/month</span>
            </div>
            <p className="text-sm opacity-80">or $79.99/year (save 33%)</p>
          </div>

          <div className="bg-white p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold  mb-1">{feature.title}</h3>
                      <p className="text-sm ">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-4 rounded-xl text-lg font-bold hover:from-primary-600 hover:to-secondary-600 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Redirecting to checkout...' : 'Upgrade Now - $9.99/mo'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              30-day money-back guarantee • Cancel anytime
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold  mb-2">Evidence-Based</h3>
            <p className="text-sm ">
              Built on proven cessation techniques and behavioral science
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-semibold  mb-2">Privacy First</h3>
            <p className="text-sm ">
              Your data is encrypted and never shared with third parties
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold  mb-2">Instant Access</h3>
            <p className="text-sm ">
              All premium features unlock immediately after upgrade
            </p>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold  mb-4 text-center">
            What Our Premium Users Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                "The AI insights helped me identify my triggers. I'm now 60 days vape-free!"
              </p>
              <p className="text-xs text-gray-500 font-medium">- Sarah M.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                "Seeing how much money I've saved was the motivation I needed to keep going."
              </p>
              <p className="text-xs text-gray-500 font-medium">- Mike R.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
