interface RankCardProps {
  rank: string;
  currentXP: number;
  nextRankXP: number;
  level: number;
}

const RANK_INFO: Record<string, { color: string; gradient: string; icon: string; title: string; nextRank: string }> = {
  BRONZE: {
    color: 'text-orange-600',
    gradient: 'from-orange-100 to-orange-200',
    icon: '🥉',
    title: 'Bronze Scribe',
    nextRank: 'Silver',
  },
  SILVER: {
    color: 'text-gray-600',
    gradient: 'from-gray-100 to-gray-200',
    icon: '🥈',
    title: 'Silver Scribe',
    nextRank: 'Gold',
  },
  GOLD: {
    color: 'text-yellow-600',
    gradient: 'from-yellow-100 to-yellow-200',
    icon: '🥇',
    title: 'Gold Scribe',
    nextRank: 'Platinum',
  },
  PLATINUM: {
    color: 'text-blue-600',
    gradient: 'from-blue-100 to-blue-200',
    icon: '💎',
    title: 'Platinum Author',
    nextRank: 'Legendary',
  },
  LEGENDARY: {
    color: 'text-purple-600',
    gradient: 'from-purple-100 to-purple-200',
    icon: '👑',
    title: 'Legendary Writer',
    nextRank: 'Max',
  },
};

export default function RankCard({ rank, currentXP, nextRankXP, level }: RankCardProps) {
  const progress = Math.min((currentXP / nextRankXP) * 100, 100);
  const rankInfo = RANK_INFO[rank] || RANK_INFO.BRONZE;
  const isMaxRank = rank === 'LEGENDARY' && currentXP >= nextRankXP;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 shadow-sm">
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-4 sm:mb-6">Current Standing</h2>
      
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Enhanced Badge Icon */}
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${rankInfo.gradient} flex items-center justify-center border-4 border-yellow-300 shadow-lg ring-4 ring-yellow-100`}>
            <span className="text-3xl sm:text-4xl lg:text-5xl">{rankInfo.icon}</span>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
            LVL {level}
          </div>
        </div>

        {/* Rank Info */}
        <div className="flex-1">
          <div className="mb-4 text-center sm:text-left">
            <h3 className={`text-2xl sm:text-3xl font-bold ${rankInfo.color} mb-1`}>
              {rankInfo.title}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {isMaxRank 
                ? '🎉 Congratulations! You\'ve reached the maximum rank!' 
                : `Consistent writing unlocks the '${rankInfo.nextRank}' badge.`}
            </p>
          </div>

          {/* Enhanced XP Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary-600">
                  {currentXP.toLocaleString()} XP
                </span>
                <span className="text-sm text-gray-500">/ {nextRankXP.toLocaleString()} XP</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {isMaxRank ? '🏆 Max Level' : `${nextRankXP - currentXP} XP to ${rankInfo.nextRank}`}
              </span>
            </div>
            
            {/* Multi-segment progress bar */}
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`absolute h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700 ease-out ${
                  progress > 75 ? 'animate-pulse' : ''
                }`}
                style={{ width: `${progress}%` }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              
              {/* Progress percentage label */}
              {progress > 10 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-md">
                    {Math.round(progress)}%
                  </span>
                </div>
              )}
            </div>

            {/* Milestone markers */}
            <div className="flex justify-between mt-1 px-1">
              {[25, 50, 75].map((milestone) => (
                <div 
                  key={milestone}
                  className={`text-xs ${progress >= milestone ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}
                >
                  {milestone}%
                </div>
              ))}
            </div>
          </div>

          {/* Achievements with icons */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Next Milestones</h4>
            <div className="space-y-2">
              <div className={`flex items-center space-x-3 text-sm p-2 rounded-lg ${
                currentXP >= 100 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentXP >= 100 ? 'bg-emerald-500' : 'bg-gray-300'
                }`}>
                  {currentXP >= 100 ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white font-bold">1</span>
                  )}
                </div>
                <span className={currentXP >= 100 ? 'text-emerald-700 font-medium line-through' : 'text-gray-700'}>
                  Publish 3 days in a row
                </span>
                <span className="text-primary-600 font-semibold ml-auto">+50 XP</span>
              </div>

              <div className={`flex items-center space-x-3 text-sm p-2 rounded-lg ${
                currentXP >= 500 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentXP >= 500 ? 'bg-emerald-500' : 'bg-gray-300'
                }`}>
                  {currentXP >= 500 ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white font-bold">2</span>
                  )}
                </div>
                <span className={currentXP >= 500 ? 'text-emerald-700 font-medium line-through' : 'text-gray-700'}>
                  Reach 5,000 words total
                </span>
                <span className="text-primary-600 font-semibold ml-auto">+100 XP</span>
              </div>

              <div className={`flex items-center space-x-3 text-sm p-2 rounded-lg ${
                currentXP >= 1000 ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  currentXP >= 1000 ? 'bg-emerald-500' : 'bg-gray-300'
                }`}>
                  {currentXP >= 1000 ? (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs text-white font-bold">3</span>
                  )}
                </div>
                <span className={currentXP >= 1000 ? 'text-emerald-700 font-medium line-through' : 'text-gray-700'}>
                  Complete a 30-day goal
                </span>
                <span className="text-primary-600 font-semibold ml-auto">+200 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
