import { ReactNode } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Crown, Lock } from 'lucide-react';
import { Link } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature = 'This feature' }: PremiumGateProps) {
  const { isPremium } = useSubscription();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold  mb-2">Premium Feature</h3>
          <p className=" mb-6">
            {feature} is only available to premium members.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                const event = new CustomEvent('navigate-to-upgrade');
                window.dispatchEvent(event);
              }}
className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-secondary-600 transition flex items-center justify-center space-x-2"
            >
              <Crown className="w-5 h-5" />
              <span>Upgrade to Premium</span>
            </button>
            <p className="text-sm text-gray-500">
              Starting at $9.99/month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
      <Crown className="w-3 h-3 mr-1" />
      PRO
    </span>
  );
}

export function LockIcon() {
  return (
    <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200">
      <Lock className="w-3 h-3 text-gray-500" />
    </div>
  );
}
