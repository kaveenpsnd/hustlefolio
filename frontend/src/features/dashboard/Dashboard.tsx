import {
  GreetingSection,
  StatsCards,
  ContributionHeatmap,
  RankCard,
  RecentPosts,
} from './components';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';
import { useDashboard } from './use-dashboard';
import { useUserGoals } from '@/features/goals/use-goals';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/features/posts/posts-api';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: dashboardData, isLoading, error } = useDashboard(user?.username || '');
  const { data: allGoals = [] } = useUserGoals();
  
  // Fetch user's posts for heatmap
  const { data: userPosts = [] } = useQuery({
    queryKey: ['posts', 'user', user?.username],
    queryFn: () => postsApi.getPostsByUser(user?.username || ''),
    enabled: !!user?.username,
  });

  // Wait for auth to load first
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="max-w-dashboard mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-1">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-yellow-800 font-medium">
              {error ? 'Error loading dashboard' : 'Time to start a new journey! Create your first goal.'}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate combined stats from all active goals
  const activeGoals = dashboardData.activeGoals || allGoals.filter(g => g.active);
  const completedGoals = dashboardData.completedGoals || [];
  const primaryGoal = activeGoals.length > 0 ? activeGoals[0] : dashboardData.activeGoal;
  
  // Use backend-calculated XP and rank data
  const username = user?.username || "Writer";
  const currentStreak = dashboardData.currentStreak || 0;
  const longestStreak = dashboardData.longestStreak || 0;
  const weeklyActive = dashboardData.weeklyPulse || Math.min(currentStreak, 7);
  const totalPosts = userPosts.length || dashboardData.stats?.totalPosts || 0;
  
  // XP and Rank from backend
  const currentXP = dashboardData.totalXP || 0;
  const nextRankXP = dashboardData.xpToNextRank || 1000;
  const rank = dashboardData.rank || "BRONZE";
  
  // Calculate level based on XP progression
  const level = Math.floor(currentXP / 100) + 1;
  const activityData = dashboardData.activityMap || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="max-w-dashboard mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 pb-20 sm:pb-24">
        {/* Greeting & Start Post Button */}
        <GreetingSection username={username} />

        {/* Active Goals Section */}
        {activeGoals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Goals</h2>
              <Link to="/goals" className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700">
                View all →
              </Link>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.slice(0, 3).map((goal) => (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className="block bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                      {goal.title}
                    </h3>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 font-medium">{goal.currentStreak || 0}</span>
                    </div>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{goal.targetDays} days</span>
                    {goal.streakStatus && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          {goal.streakStatus}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                        style={{ width: `${Math.min(((goal.currentStreak || 0) / (goal.targetDays || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed Goals Section */}
        {completedGoals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                🏆 Completed Goals
              </h2>
              <span className="text-xs sm:text-sm text-gray-600">
                {completedGoals.length} milestone{completedGoals.length !== 1 ? 's' : ''} reached
              </span>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border-2 border-green-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
                      {goal.title}
                    </h3>
                    <span className="text-2xl ml-2 flex-shrink-0">✅</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700 font-bold">{goal.targetDays} days completed</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-1 bg-white text-green-700 font-medium rounded border border-green-200">
                        {goal.streakStatus || 'Champion'}
                      </span>
                      <span className="text-gray-600">
                        {goal.totalPoints || 0} XP earned
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards currentStreak={currentStreak} weeklyActive={weeklyActive} />

        {/* Contribution Activity */}
        <ContributionHeatmap 
          totalPosts={totalPosts} 
          activityData={activityData}
          userPosts={userPosts}
          username={username}
        />

        {/* Current Standing */}
        <RankCard 
          rank={rank} 
          currentXP={currentXP} 
          nextRankXP={nextRankXP} 
          level={level} 
        />

        {/* Recent Posts */}
        <RecentPosts username={username} />
      </main>
      <Footer />
    </div>
  );
}
