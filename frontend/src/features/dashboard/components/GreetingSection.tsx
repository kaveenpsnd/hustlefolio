import { useState } from 'react';
import GoalSelectionModal from '@/components/GoalSelectionModal';

interface GreetingSectionProps {
  username: string;
}

export default function GreetingSection({ username }: GreetingSectionProps) {
  const [showGoalModal, setShowGoalModal] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-2">
            {getGreeting()}, {username}.
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            Keep the momentum going. You're building something great.
          </p>
        </div>
        <button 
          onClick={() => setShowGoalModal(true)}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-primary-600 flex items-center justify-center space-x-2 shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <span>What's New Today?</span>
        </button>
      </div>

      <GoalSelectionModal 
        isOpen={showGoalModal} 
        onClose={() => setShowGoalModal(false)} 
      />
    </>
  );
}
