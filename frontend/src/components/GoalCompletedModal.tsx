import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface GoalCompletedModalProps {
  isOpen: boolean;
  goalTitle: string;
  targetDays: number;
  onClose: () => void;
}

export default function GoalCompletedModal({ 
  isOpen, 
  goalTitle, 
  targetDays,
  onClose 
}: GoalCompletedModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all animate-scale-in">
        {/* Trophy Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <svg 
              className="w-12 h-12 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 
          className="text-4xl font-bold text-gray-900 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          🎉 Goal Completed!
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-gray-700 mb-6">
          Congratulations! You've completed
        </p>

        {/* Goal Name */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
          <p className="text-2xl font-bold text-[#10B981] mb-2">
            {goalTitle}
          </p>
          <p className="text-sm text-gray-600">
            {targetDays} day streak achieved!
          </p>
        </div>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Your goal has been moved to <span className="font-semibold text-[#10B981]">Completed Goals</span>. 
          Keep the momentum going by starting a new challenge!
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-lg font-semibold hover:from-[#059669] hover:to-[#047857] transition-all shadow-lg hover:shadow-xl"
        >
          Continue
        </button>
      </div>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
      `}</style>
    </div>
  );
}
