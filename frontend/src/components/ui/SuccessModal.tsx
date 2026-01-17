interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakName: string;
  onStartWriting: () => void;
  onViewDashboard: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  streakName,
  onStartWriting,
  onViewDashboard,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative dots */}
        <div className="absolute top-12 left-8">
          <div className="flex space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-300"></div>
          </div>
        </div>
        <div className="absolute top-16 right-16">
          <div className="flex space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-200"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-300"></div>
          </div>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-emerald-100 rounded-full flex items-center justify-center animate-pulse-slow">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-200 to-emerald-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Streak Activated!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your <span className="font-semibold text-gray-900">'{streakName}'</span> streak is officially set.
            Write your first post today to keep the flame alive.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onStartWriting}
            className="w-full px-6 py-3.5 text-base font-semibold text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-all flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <span>Start Writing Now</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={onViewDashboard}
            className="w-full px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
