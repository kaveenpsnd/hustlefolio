interface StatsCardsProps {
  currentStreak: number;
  weeklyActive: number;
}

export default function StatsCards({ currentStreak, weeklyActive }: StatsCardsProps) {
  // Generate weekly activity data (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i],
    active: i < weeklyActive,
    height: Math.min((i < weeklyActive ? 1 : 0) * 100, 100),
  }));

  // Calculate streak fire intensity
  const getStreakIntensity = (streak: number) => {
    if (streak >= 30) return { emoji: '🔥🔥🔥', color: 'from-red-500 to-orange-500', text: 'Legendary streak!' };
    if (streak >= 14) return { emoji: '🔥🔥', color: 'from-orange-500 to-yellow-500', text: 'On fire!' };
    if (streak >= 7) return { emoji: '🔥', color: 'from-yellow-500 to-green-500', text: 'Hot streak!' };
    if (streak >= 3) return { emoji: '✨', color: 'from-green-400 to-emerald-500', text: 'Building momentum!' };
    return { emoji: '🌱', color: 'from-emerald-400 to-green-500', text: 'Keep going!' };
  };

  const streakInfo = getStreakIntensity(currentStreak);
  const weekPercentage = Math.round((weeklyActive / 7) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Enhanced Current Streak Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Decorative background */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${streakInfo.color} opacity-10 rounded-full blur-3xl`}></div>
        
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 text-primary-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Current Streak</span>
          </div>
          
          <div className="flex items-baseline space-x-2 mb-2">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">{currentStreak}</span>
            <span className="text-lg sm:text-xl text-gray-600">days</span>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-2xl">{streakInfo.emoji}</span>
            <p className="text-sm font-medium text-gray-700">
              {streakInfo.text}
            </p>
          </div>

          {/* Mini progress indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Progress to next milestone</span>
              <span className="font-semibold">{currentStreak % 7}/7</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${streakInfo.color} rounded-full transition-all duration-500`}
                style={{ width: `${((currentStreak % 7) / 7) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Weekly Pulse Card with Chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 text-blue-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Weekly Pulse</span>
          </div>
          
          <div className="flex items-baseline space-x-2 mb-4">
            <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">{weeklyActive}</span>
            <span className="text-lg sm:text-xl text-gray-600">/ 7</span>
            <span className="text-base sm:text-lg text-gray-600 ml-1">active</span>
          </div>

          {/* Weekly bar chart */}
          <div className="space-y-2">
            <div className="flex items-end justify-between h-12 gap-1">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-200 rounded-t relative overflow-hidden" style={{ height: '40px' }}>
                    {day.active && (
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-indigo-500 transition-all duration-500 rounded-t"
                        style={{ height: '100%' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${day.active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                <span className="font-semibold text-blue-600">{weekPercentage}%</span> completion
              </span>
              <span className="text-gray-500">
                {weeklyActive === 7 ? '🎯 Perfect week!' : 'You\'re in the top 10%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
