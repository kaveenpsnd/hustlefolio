import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useUserGoals } from './use-goals';

export default function GoalManagement() {
  const navigate = useNavigate();

  // Fetch all user goals
  const { data: userGoals = [], isLoading: loadingGoals } = useUserGoals();
  
  // Separate active and completed goals
  const activeGoals = userGoals.filter(g => g.active);
  const completedGoals = userGoals.filter(g => !g.active);

  // Calculate progress percentage
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Generate mini heatmap for last 30 days
  const generateMiniHeatmap = (checkinDates: string[] = []) => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const hasCheckin = checkinDates.includes(dateStr);
      days.push({ date: dateStr, active: hasCheckin });
    }
    
    return days;
  };

  // Stats calculations
  const totalActive = activeGoals.length;
  const longestStreak = Math.max(...activeGoals.map(g => g.longestStreak || 0), 0);

  if (loadingGoals) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex items-center justify-center p-20 flex-1">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-20 sm:pb-24" style={{width: '100%'}}>
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">My Goals</h1>
            <p className="text-sm sm:text-base text-gray-600">Track your consistency and nurture your writing habits.</p>
          </div>
          <button
            onClick={() => navigate('/goals/new')}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base font-medium"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Create New Streak</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Active</span>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">{totalActive}</span>
              <span className="text-xs sm:text-sm text-gray-600">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Longest Streak</span>
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{longestStreak}</span>
              <span className="text-sm text-gray-600">Days</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Completed</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{completedGoals.length}</span>
              <span className="text-sm text-gray-600">Goals</span>
            </div>
          </div>
        </div>

        {/* Active Streaks Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              Active Streaks
              <span className="ml-3 text-sm font-normal text-gray-500">· {totalActive} Active</span>
            </h2>
          </div>

          {activeGoals.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
              {activeGoals.map((goal) => (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className="block bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{goal.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded bg-green-50 text-green-600 border border-green-200`}>
                          ON TRACK
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Daily · Since {new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {/* Progress Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{goal.currentStreak || 0}</div>
                      <div className="text-xs text-gray-600">Current</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{goal.longestStreak || 0}</div>
                      <div className="text-xs text-gray-600">Best</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{goal.targetDays}</div>
                      <div className="text-xs text-gray-600">Goal</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">
                        {Math.round(getProgressPercentage(goal.currentStreak || 0, goal.targetDays || 1))}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                        style={{ width: `${getProgressPercentage(goal.currentStreak || 0, goal.targetDays || 1)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Heatmap */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                      {generateMiniHeatmap(goal.checkinDates || []).slice(-30).map((day, i) => (
                        <div
                          key={i}
                          className={`w-2 h-6 rounded-sm ${day.active ? 'bg-green-500' : 'bg-gray-200'}`}
                          title={day.date}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Last 30 days</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Streaks</h3>
              <p className="text-gray-600 mb-4">Start your writing journey by creating your first streak goal.</p>
              <button
                onClick={() => navigate('/goals/new')}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all"
              >
                Create Your First Streak
              </button>
            </div>
          )}
        </div>

        {/* Completed Streaks */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                Completed Streaks
                <span className="ml-3 text-sm font-normal text-gray-500">· {completedGoals.length} Completed</span>
              </h2>
            </div>

            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-500">
                        Started {new Date(goal.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {goal.longestStreak || 0} Day Best Streak · Completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">
                      ✓ COMPLETED
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pro Tip */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">PRO TIP</h3>
              <p className="text-gray-700 text-sm">
                Consistency is key. Writing just <strong>100 words</strong> a day keeps the streak alive and builds massive momentum over time.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
